import pandas as pd
import numpy as np
import random
import os
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

# ======================================================
# CONFIG
# ======================================================
SEED = 42
MIN_ROWS = 1000
MAX_ROWS = 2000

# graph density controls
MIN_LINKS_PER_NODE = 2
MAX_LINKS_PER_NODE = 8

random.seed(SEED)
np.random.seed(SEED)

# ======================================================
# SAFE COLUMN CREATOR
# ======================================================
def ensure_column(df, col, fn):
    if col not in df.columns:
        df[col] = fn(len(df))
    return df

# ======================================================
# MAIN PIPELINE
# ======================================================
def run_pipeline(input_csv, out_dir="backend/output"):
    print("🚀 fraud_data_pipeline started")
    print("📂 Input CSV:", input_csv)

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(BASE_DIR, out_dir)
    os.makedirs(out_dir, exist_ok=True)

    df = pd.read_csv(input_csv)

    # --------------------------------------------------
    # 1. ENSURE RAW TRANSACTION FIELDS
    # --------------------------------------------------
    df = ensure_column(df, "nameOrig", lambda n: [f"ACC_{i}" for i in range(n)])
    df = ensure_column(df, "nameDest", lambda n: [f"ACC_{random.randint(0, n)}" for _ in range(n)])
    df = ensure_column(df, "amount", lambda n: np.random.lognormal(4, 1, n))
    df = ensure_column(df, "oldbalanceOrg", lambda n: np.random.uniform(0, 1e5, n))
    df = ensure_column(
        df,
        "newbalanceOrig",
        lambda n: df["oldbalanceOrg"] - df["amount"] * np.random.uniform(0.1, 0.9, n)
    )

    # --------------------------------------------------
    # 2. FEATURE ENGINEERING
    # --------------------------------------------------
    df["balance_diff"] = df["oldbalanceOrg"] - df["newbalanceOrig"]
    df["zero_balance"] = (df["oldbalanceOrg"] == 0).astype(int)

    # --------------------------------------------------
    # 3. AGGREGATE PER ACCOUNT
    # --------------------------------------------------
    accounts = df.groupby("nameOrig").agg({
        "amount": ["sum", "mean", "count"],
        "balance_diff": "mean",
        "zero_balance": "sum"
    })

    accounts.columns = [
        "total_amount",
        "avg_amount",
        "tx_count",
        "avg_balance_diff",
        "zero_balance_count"
    ]

    accounts.reset_index(inplace=True)
    accounts.rename(columns={"nameOrig": "account_id"}, inplace=True)

    # --------------------------------------------------
    # 4. ML RISK SCORING
    # --------------------------------------------------
    X = accounts.drop(columns=["account_id"])
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = IsolationForest(
        n_estimators=300,
        contamination=0.1,
        random_state=SEED,
        n_jobs=-1
    )
    model.fit(X_scaled)

    raw = model.decision_function(X_scaled)
    risk = 1 - (raw - raw.min()) / (raw.max() - raw.min())
    accounts["riskScore"] = (risk * 100).round(2)

    def classify(score):
        if score >= 80:
            return "FRAUD"
        elif score >= 55:
            return "AT_RISK"
        return "NORMAL"

    accounts["class"] = accounts["riskScore"].apply(classify)

    # --------------------------------------------------
    # 5. LIMIT ACCOUNT COUNT
    # --------------------------------------------------
    target_size = random.randint(MIN_ROWS, MAX_ROWS)
    final_accounts = accounts.sample(n=target_size, random_state=SEED).reset_index(drop=True)

    accounts_path = os.path.join(out_dir, "final_accounts.csv")
    final_accounts.to_csv(accounts_path, index=False)

    # --------------------------------------------------
    # 6. DENSE GRAPH LINK GENERATION
    # --------------------------------------------------
    print("🔗 Generating dense transaction graph")

    all_ids = final_accounts["account_id"].tolist()
    risk_ids = set(final_accounts[final_accounts["class"] != "NORMAL"]["account_id"])

    edges = []
    step = 1
    used = set()

    # -------- REAL LINKS (EXPANDED) --------
    if "nameOrig" in df.columns and "nameDest" in df.columns:
        for _, r in df.iterrows():
            src, dst = r["nameOrig"], r["nameDest"]
            if src != dst and src in all_ids and dst in all_ids:
                edges.append({
                    "src": src,
                    "dst": dst,
                    "amount": round(float(r["amount"]), 2),
                    "step": step,
                    "fraudEdge": int(src in risk_ids or dst in risk_ids)
                })
                step += 1

    # -------- DENSE SYNTHETIC GRAPH --------
    for src in all_ids:
        degree = random.randint(MIN_LINKS_PER_NODE, MAX_LINKS_PER_NODE)

        targets = random.sample(all_ids, degree)
        for dst in targets:
            if src == dst:
                continue

            key = (src, dst, step // 10)
            if key in used:
                continue

            # fraud nodes act faster + higher amounts
            is_fraud = src in risk_ids
            amount = random.uniform(5000, 300000) if is_fraud else random.uniform(500, 50000)

            edges.append({
                "src": src,
                "dst": dst,
                "amount": round(amount, 2),
                "step": step,
                "fraudEdge": int(is_fraud)
            })

            used.add(key)

            # time behavior
            step += random.randint(1, 3 if is_fraud else 6)

    links_path = os.path.join(out_dir, "fraud_links.csv")
    pd.DataFrame(edges).to_csv(links_path, index=False)

    # --------------------------------------------------
    # FINAL LOG
    # --------------------------------------------------
    print("✅ PIPELINE COMPLETE")
    print(f"📄 Accounts: {len(final_accounts)}")
    print(f"🔗 Links   : {len(edges)}")

    return {
        "accounts": accounts_path,
        "links": links_path
    }

# ======================================================
# CLI SUPPORT
# ======================================================
if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("❌ Usage: python fraud_data_pipeline.py <csv_path>")
        exit(1)

    run_pipeline(sys.argv[1])
