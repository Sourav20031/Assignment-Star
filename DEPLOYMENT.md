# Unified Deployment Guide — EventGenius AI Planner

This guide explains how to deploy the entire project (both frontend and backend) as a **single service** to **Railway**.

---

## 🚀 Unified Setup (Single Service)

In this setup, the Express backend serves the compiled React frontend static assets from `client/dist`. 
- **Benefits:**
  - Zero CORS configuration required.
  - Safe and secure first-party HTTP-only cookies (no Safari/Chrome blocking).
  - Uses only **one service**, saving Railway credits.

### Step 1: Push Changes to GitHub
Commit and push the unified deployment files to your GitHub repository:
```bash
git rm client/vercel.json          # (Optional) Remove Vercel config
git add .
git commit -m "Configure unified Express static serving for Railway"
git push
```

### Step 2: Configure Railway
1. Go to your [Railway Dashboard](https://railway.app).
2. If you already have your backend service set up:
   - Go to **Settings** → **General** → set **Root Directory** to `(empty)` or `/` (the project root, **not** the `server` folder).
3. If you are creating a new service:
   - Click **New Project** → **Deploy from GitHub repo** → select your repository.
   - Leave the root directory as `/` (project root). Railway will automatically find the root-level `package.json` and build the entire app.

### Step 3: Set Environment Variables
Go to the **Variables** tab of your service and add:
- `NODE_ENV` = `production`
- `JWT_SECRET` = `your_secure_random_string`
- `JWT_EXPIRE` = `7d`
*(Note: You do **not** need `CLIENT_URL` anymore since everything runs on the same domain!)*

### Step 4: Expose public domain
- Go to **Settings** → **Networking** → Click **Generate Domain**.
- Visit your generated domain, and your complete application (frontend + backend) will work beautifully!
