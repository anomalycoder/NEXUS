import pandas as pd
import numpy as np
import random
import os
# from sklearn.preprocessing import StandardScaler
# from sklearn.ensemble import IsolationForest

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
    # 4. STATISTICAL RISK SCORING (Lightweight)
    # --------------------------------------------------
    # Replaced IsolationForest with robust Z-score analysis to save ~100MB
    # and fit within Serverless limits.
    
    # Calculate Z-scores for key features
    features = ["total_amount", "tx_count", "avg_balance_diff", "zero_balance_count"]
    
    for col in features:
        mean = accounts[col].mean()
        std = accounts[col].std()
        if std == 0:
            accounts[f"{col}_z"] = 0
        else:
            accounts[f"{col}_z"] = (accounts[col] - mean) / std

    # Composite risk score (weighted avg of z-scores)
    # Weighted towards high amounts and suspicious balance changes
    accounts["raw_score"] = (
        accounts["total_amount_z"] * 0.5 + 
        accounts["avg_balance_diff_z"] * 0.3 + 
        accounts["tx_count_z"] * 0.4 + 
        accounts["zero_balance_count_z"] * 0.2
    )

    # Normalize to 0-100 range using Min-Max scaling
    min_score = accounts["raw_score"].min()
    max_score = accounts["raw_score"].max()
    
    if max_score > min_score:
        accounts["riskScore"] = ((accounts["raw_score"] - min_score) / (max_score - min_score) * 100).round(2)
    else:
        accounts["riskScore"] = 50.0

    # --------------------------------------------------
    # 4.5 FORCE RATIO (User Req: 50:1 -> ~2%)
    # --------------------------------------------------
    # We guarantee roughly 3% of the dataset is flagged as FRAUD (better than 1:50)
    # by boosting the highest-risk candidates into the Fraud range.
    fraud_target_count = int(len(accounts) * 0.03)
    
    if fraud_target_count > 0:
        # Boost the top candidates to guaranteed Fraud range (85-99)
        top_idx = accounts.nlargest(fraud_target_count, "riskScore").index
        # Use numpy correctly with .values for assignment if needed, but loc works directly
        accounts.loc[top_idx, "riskScore"] = np.random.uniform(85, 99, size=fraud_target_count)

    # 4.6 FORCE AT_RISK RATIO (User Req: 23:1 -> ~4.3%)
    risk_target_count = int(len(accounts) * 0.045)
    
    if risk_target_count > 0:
        # Get next highest candidates that weren't already boosted to fraud
        # We look for top (fraud + risk) and take the tail
        total_target = fraud_target_count + risk_target_count
        risk_idx = accounts.nlargest(total_target, "riskScore").index[fraud_target_count:]
        
        # Boost to At-Risk range (55-75 seems safe given fraud starts at 65/80, 
        # let's respect the classify threshold which defines 'AT_RISK' around 40+.
        # To make them distinctly yellow, let's put them in 50-64 range.
        accounts.loc[risk_idx, "riskScore"] = np.random.uniform(50, 64, size=len(risk_idx))

    # Cleanup temp columns
    accounts.drop(columns=[f"{c}_z" for c in features] + ["raw_score"], inplace=True)


    def classify(score):
        if score >= 65: # Lowered from 80 to catch more
            return "FRAUD"
        elif score >= 40: # Lowered from 55
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
    fraud_ids = list(final_accounts[final_accounts["class"] == "FRAUD"]["account_id"])

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
        # Fraud nodes form bigger rings (higher degree)
        is_fraud_node = src in risk_ids
        
        if is_fraud_node:
            degree = random.randint(MIN_LINKS_PER_NODE + 3, MAX_LINKS_PER_NODE + 5)
        else:
            degree = random.randint(MIN_LINKS_PER_NODE, MAX_LINKS_PER_NODE)

        targets = random.sample(all_ids, min(degree, len(all_ids)))
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

    # -------- FRAUD RINGS (EXTRA DENSITY) --------
    # Explicitly connect fraud accounts to each other to form "rings"
    if len(fraud_ids) > 1:
        for src in fraud_ids:
            # Connect to 3-5 other random fraud accounts
            ring_size = random.randint(3, 5)
            # Filter self out
            peers = [x for x in fraud_ids if x != src]
            
            if not peers: continue
            
            targets = random.sample(peers, min(ring_size, len(peers)))
            
            for dst in targets:
                key = (src, dst)
                # We don't check 'key in used' strictly here to ensure density, 
                # or we just allow multiple edges for different amounts
                
                amount = random.uniform(25000, 500000) # Laundering large amounts
                
                edges.append({
                    "src": src,
                    "dst": dst,
                    "amount": round(amount, 2),
                    "step": step,
                    "fraudEdge": 1
                })
                step += 1

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
