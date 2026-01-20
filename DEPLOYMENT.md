# 🚀 Deployment Guide

## 1. Backend & Worker (Deploy to Render.com)

**Why Render?**
Your backend runs a "Worker" that needs to stay alive 24/7 to listen for scheduled emails. Vercel cannot do this because it is serverless.

### Steps:
1. Push your code to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Fill in these details:
   - **Name:** `reachinbox-backend`
   - **Root Directory:** `backend` (Important!)
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or Starter for better performance)
6. **Environment Variables** (Add these in the "Environment" tab):
   - `DATABASE_URL`: (Your Supabase URL)
   - `REDIS_HOST`: (Your Upstash/Redis Host)
   - `REDIS_PORT`: `6379`
   - `REDIS_PASSWORD`: (Your Upstash Password)
   - `NODE_ENV`: `production`

> **Note:** On Render's Free tier, the server spins down after 15 mins of inactivity. For a production email scheduler, upgrade to "Starter" ($7/mo) so it never sleeps.

---

## 2. Frontend (Deploy to Vercel)

**Why Vercel?**
It is the native platform for Next.js, offering the best speed and zero-config setup.

### Steps:
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import your GitHub repository.
3. **Configure Project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** Edit generic settings -> Select `frontend` folder.
4. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL`: The URL provided by Render (e.g., `https://reachinbox-backend.onrender.com`).
5. Click **Deploy**.

---

## 3. Connecting Them
Once both are deployed:
1. Copy the **Render Backend URL**.
2. Go to your **Vercel Project Settings** -> **Environment Variables**.
3. Add/Update `NEXT_PUBLIC_API_URL` with the Render URL.
4. Redeploy Vercel (go to Deployments -> Redeploy) for changes to take effect.
