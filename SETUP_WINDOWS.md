# 🪟 Windows Setup Guide (Error-Free)

Since you are running on Windows without Docker, follow these specific steps to run the project.

## 1. Database Setup (Supabase) ✅

Your database is **already configured**!
- Connection string is set in `backend/.env`
- Schema is pushed
- Seed data is loaded

## 2. Redis Setup (Upstash) 🚀

Since local Redis is tricky on Windows, we use **Upstash** (Free Cloud Redis).

1. Go to **https://upstash.com/** and sign up for free.
2. Click **"Create Database"**.
3. Name: `reachinbox`, Region: closest to you.
4. Click **"Create"**.
5. Scroll down to **"Connect to your database"** (Node.js tab).
6. Copy the **Host** and **Password**.

**Update `backend/.env`:**
```env
REDIS_HOST=your-database-name.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-long-password-string
```

## 3. Run the Project 🏃‍♂️

Open two separate terminals:

**Terminal 1: Backend**
```bash
cd backend
npm run dev
```

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```

## 4. Verify It Works ✅

1. Open **http://localhost:3000**
2. See the dashboard loaded
3. Go to **/schedule**
4. Send a test email
5. Check **https://ethereal.email/** to see it delivered!

## ❓ Troubleshooting

- **"Connection Timeout"**: Check your Supabase/Upstash connection strings.
- **"Authentication Failed"**: Update `REDIS_PASSWORD` or DB password.
- **"Module not found"**: Run `npm install` again.

You are ready to go! 🚀
