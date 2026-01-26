import sys
import os
import traceback
import pandas as pd

from flask import Flask, request, jsonify
from flask_cors import CORS
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

# ======================================================
# FIX IMPORT PATH
# ======================================================
# ml is now inside backend, so we can import directly if running from backend
# or if backend is the root context.

try:
    from ml.fraud_data_pipeline import run_pipeline
except ImportError:
    # Fallback if running from root without module context
    import sys
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from ml.fraud_data_pipeline import run_pipeline

# ======================================================
# FLASK APP
# ======================================================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ======================================================
# DIRECTORIES
# ======================================================
import tempfile

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Use temporary directory for Vercel/Cloud functions (read-only filesystem elsewhere)
TEMP_DIR = tempfile.gettempdir()
UPLOAD_DIR = os.path.join(TEMP_DIR, "nexus_uploads")
OUTPUT_DIR = os.path.join(TEMP_DIR, "nexus_output")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ======================================================
# NEO4J CONNECTION
# ======================================================
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://127.0.0.1:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "test1234")

driver = GraphDatabase.driver(
    NEO4J_URI,
    auth=(NEO4J_USER, NEO4J_PASSWORD)
)

NEO4J_DB = "fraudDB"

# ======================================================
# HEALTH CHECK
# ======================================================
@app.route("/api/")
def health():
    return jsonify({"status": "Backend running"})


# ======================================================
# NEO4J INGESTION
# ======================================================
def insert_into_neo4j(accounts_csv, links_csv):
    with driver.session(database=NEO4J_DB) as session:

        print("🧹 Clearing old Neo4j data")
        session.run("MATCH (n) DETACH DELETE n")

        # -----------------------------
        # INSERT ACCOUNT NODES
        # -----------------------------
        accounts = pd.read_csv(accounts_csv)
        print(f"📥 Inserting {len(accounts)} accounts")

        session.run("""
        UNWIND $rows AS row
        MERGE (a:Account {id: row.account_id})
        SET
          a.total_amount = row.total_amount,
          a.avg_amount = row.avg_amount,
          a.tx_count = row.tx_count,
          a.avg_balance_diff = row.avg_balance_diff,
          a.zero_balance_count = row.zero_balance_count,
          a.riskScore = row.riskScore,
          a.mlClass = row.class
        """, rows=accounts.to_dict("records"))

        # -----------------------------
        # INSERT RELATIONSHIPS
        # -----------------------------
        links = pd.read_csv(links_csv)
        print(f"🔗 Inserting {len(links)} relationships")

        session.run("""
        UNWIND $rows AS row
        MATCH (src:Account {id: row.src})
        MATCH (dst:Account {id: row.dst})
        CREATE (src)-[:TRANSFERRED_TO {
          amount: row.amount,
          step: row.step,
          fraudEdge: row.fraudEdge
        }]->(dst)
        """, rows=links.to_dict("records"))

        print("✅ Neo4j ingestion complete")


# ======================================================
# CSV UPLOAD + PIPELINE
# ======================================================
@app.route("/api/upload-csv", methods=["POST"])
def upload_csv():
    try:
        print("📥 CSV upload started")

        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400

        if not file.filename.lower().endswith(".csv"):
            return jsonify({"error": "Only CSV files allowed"}), 400

        file_path = os.path.join(UPLOAD_DIR, file.filename)
        file.save(file_path)

        print(f"✅ File saved at: {file_path}")
        print("🚀 Running fraud data pipeline...")

        result = run_pipeline(file_path)

        print("📊 Pipeline output:", result)
        print("📤 Inserting into Neo4j...")

        insert_into_neo4j(
            result["accounts"],
            result["links"]
        )

        return jsonify({
            "status": "success",
            "message": "Pipeline completed successfully"
        })

    except Exception as e:
        print("❌ ERROR DURING PROCESSING")
        traceback.print_exc()

        return jsonify({
            "status": "error",
            "message": "Processing failed",
            "details": str(e)
        }), 500


# ======================================================
# GRAPH API (FOR FRONTEND)
# ======================================================
@app.route("/api/graph")
def graph():
    with driver.session(database=NEO4J_DB) as session:
        query = """
        MATCH (a:Account)-[t:TRANSFERRED_TO]->(b:Account)
        RETURN
          a.id AS source,
          b.id AS target,
          a.riskScore AS sourceRisk,
          b.riskScore AS targetRisk,
          a.mlClass AS sourceMLClass,
          b.mlClass AS targetMLClass,
          t.amount AS amount,
          t.step AS step,
          t.fraudEdge AS fraudEdge
        LIMIT 1000
        """

        result = session.run(query)

        nodes = {}
        links = []

        for r in result:
            if r["source"] not in nodes:
                nodes[r["source"]] = {
                    "id": r["source"],
                    "riskScore": r["sourceRisk"],
                    "mlClass": r["sourceMLClass"]
                }

            if r["target"] not in nodes:
                nodes[r["target"]] = {
                    "id": r["target"],
                    "riskScore": r["targetRisk"],
                    "mlClass": r["targetMLClass"]
                }

            links.append({
                "source": r["source"],
                "target": r["target"],
                "amount": r["amount"],
                "step": r["step"],
                "fraud": r["fraudEdge"]
            })

        return jsonify({
            "nodes": list(nodes.values()),
            "links": links
        })


# ======================================================
# RUN SERVER
# ======================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

@app.errorhandler(Exception)
def handle_exception(e):
    import traceback
    traceback.print_exc()

    return jsonify({
        "status": "error",
        "message": "Internal server error",
        "details": str(e)
    }), 500
