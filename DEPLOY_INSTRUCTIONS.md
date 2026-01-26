# Deployment Guide for Nexus (Vercel)

This project is configured as a Monorepo containing both a Vite React Frontend and a Flask Python Backend.

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **Neo4j AuraDB**: You need a cloud-hosted Neo4j database.
    - Go to [Neo4j Aura](https://neo4j.com/cloud/aura/).
    - Create a free instance.
    - Save the **Connection URI**, **Username**, and **Password**.

## Configuration Setup (Already Done)

I have already performed the following preparatory steps:
- Created `vercel.json` to handle routing for Frontend and Backend.
- Updated `backend/app.py` to use Environment Variables for database connections.
- Updated `backend/app.py` to use `/tmp` for file storage (required by Vercel).
- Updated Frontend to use dynamic API URLs (`VITE_API_URL`).

## Deployment Steps

### Option 1: Using Vercel CLI (Recommended)

1.  Open your terminal/command prompt.
2.  Install Vercel CLI:
    ```bash
    npm install -g vercel
    ```
3.  Login:
    ```bash
    vercel login
    ```
4.  Deploy:
    ```bash
    vercel
    ```
    - Follow the prompts.
    - Use default settings (just press Enter).

### Option 2: Using GitHub

1.  Push this code to a GitHub repository.
2.  Go to Vercel Dashboard -> Add New -> Project.
3.  Import the repository.
4.  Vercel will detect the `vercel.json` configuration automatically.

## Environment Variables (CRITICAL)

After the project is created in Vercel, you **MUST** go to **Settings > Environment Variables** and add:

| Variable Name | Value Description |
|Data Type|string|
|---|---|
| `NEO4J_URI` | Your AuraDB URI (e.g., `neo4j+s://xxx.databases.neo4j.io`) |
| `NEO4J_USER` | Your Neo4j Username (usually `neo4j`) |
| `NEO4J_PASSWORD` | Your Neo4j Password |
| `VITE_API_URL` | Set this to `/api` (this allows the frontend to find the backend on the same domain) |

**Note**: After adding variables, you must **Redeploy** for them to take effect.
