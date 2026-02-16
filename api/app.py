import sys
import os
import traceback
import pandas as pd

from flask import Flask, request, jsonify
from flask_cors import CORS
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Load environment variables from .env file explicitly
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(dotenv_path)

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

NEO4J_DB = os.getenv("NEO4J_DB", "neo4j")

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
    try:
        if not os.path.exists(accounts_csv) or not os.path.exists(links_csv):
            raise FileNotFoundError("Processed CSV files not found for ingestion.")

        with driver.session(database=NEO4J_DB) as session:

            print("🧹 Clearing old Neo4j data")
            session.run("MATCH (n) DETACH DELETE n")

            # -----------------------------
            # INSERT ACCOUNT NODES
            # -----------------------------
            accounts = pd.read_csv(accounts_csv)
            # Neo4j cannot handle NaN/Inf in parameters, sanitize it
            accounts = accounts.fillna(0)
            
            if not accounts.empty:
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
            else:
                print("⚠️ Accounts CSV was empty")

            # -----------------------------
            # INSERT RELATIONSHIPS
            # -----------------------------
            links = pd.read_csv(links_csv)
            links = links.fillna(0)
            
            if not links.empty:
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
            else:
                print("⚠️ Links CSV was empty")

            print("✅ Neo4j ingestion complete")

    except Exception as e:
        print(f"❌ Neo4j Ingestion Error: {str(e)}")
        log_error_to_file(e)
        raise e  # Re-raise to be caught by the API route handler


# ======================================================
# CSV UPLOAD + PIPELINE
# ======================================================

# ======================================================
# DEBUG HELPER
# ======================================================
def log_error_to_file(e):
    try:
        # Explicit absolute path
        log_dir = os.path.dirname(os.path.abspath(__file__))
        log_path = os.path.join(log_dir, "backend_errors.log")
        
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(f"\n\n[{pd.Timestamp.now()}] ERROR:\n")
            f.write(f"Type: {type(e).__name__}\n")
            f.write(f"Message: {str(e)}\n")
            f.write("Traceback:\n")
            traceback.print_exc(file=f)
    except Exception as log_err:
        print(f"Failed to write log: {log_err}")

# ... (rest of code)

@app.errorhandler(Exception)
def handle_exception(e):
    log_error_to_file(e)
    # traceback.print_exc() # Already logged
    return jsonify({
        "status": "error",
        "message": "Internal server error",
        "error": str(e),
        "details": traceback.format_exc()
    }), 500

# ======================================================
# SPLIT PIPELINE ENDPOINTS
# ======================================================

@app.route("/api/upload", methods=["POST"])
def upload_file():
    try:
        print("📥 API: Upload started")
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400
            
        if not file.filename.lower().endswith(".csv"):
            return jsonify({"error": "Only CSV files allowed"}), 400
            
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        file.save(file_path)
        print(f"✅ API: File saved at {file_path}")
        
        return jsonify({
            "status": "success",
            "message": "File uploaded successfully",
            "filePath": file_path,
            "filename": file.filename
        })
        
    except Exception as e:
        traceback.print_exc()
        log_error_to_file(e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/process-ml", methods=["POST"])
def process_ml():
    try:
        data = request.json
        file_path = data.get("filePath")
        
        if not file_path or not os.path.exists(file_path):
            return jsonify({"error": "File not found. Please upload again."}), 400

        print(f"🚀 API: Running ML Pipeline on {file_path}")
        result = run_pipeline(file_path, out_dir=OUTPUT_DIR)
        
        return jsonify({
            "status": "success",
            "message": "ML Analysis complete",
            "data": result  # Contains paths to accounts and links CSVs
        })

    except Exception as e:
        traceback.print_exc()
        log_error_to_file(e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/ingest-neo4j", methods=["POST"])
def ingest_neo4j():
    try:
        data = request.json
        accounts_csv = data.get("accounts")
        links_csv = data.get("links")
        
        if not accounts_csv or not links_csv:
            return jsonify({"error": "Missing input files for ingestion"}), 400
            
        print("📤 API: Ingesting into Neo4j...")
        insert_into_neo4j(accounts_csv, links_csv)
        
        return jsonify({
            "status": "success", 
            "message": "Graph ingestion complete"
        })

    except Exception as e:
        traceback.print_exc()
        log_error_to_file(e)
        return jsonify({"error": str(e)}), 500

# Keep legacy endpoint for backward compatibility (optional, but good practice)
@app.route("/api/upload-csv", methods=["POST"])
def upload_csv_legacy():
    # ... logic calling the above 3 steps in sequence ...
    # But since we are updating the frontend, we can redirect or simple warn
    return jsonify({"error": "Please use the new split endpoints"}), 410


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
        LIMIT 500
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
# Error handler moved to top
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

