# 🚀 Getting Started with ReachInbox Email Scheduler

Welcome! This guide will get you up and running in **5 minutes**.

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ **Node.js 18+** installed
- ✅ **npm** installed
- ✅ **Docker Desktop** installed and running
- ✅ **Git** (if cloning from repository)

## 🎯 Quick Start

### Step 1: Start Infrastructure (30 seconds)

Open a terminal in the project root and run:

```bash
docker-compose up -d
```

This starts Redis and PostgreSQL in Docker containers. Wait about 10 seconds for them to be ready.

**Verify containers are running:**
```bash
docker ps
```

You should see `reachinbox-redis` and `reachinbox-postgres` running.

---

### Step 2: Setup Backend (2 minutes)

```bash
cd backend
npm install
```

The `.env` file is already configured. Now set up the database:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

**Create test senders:**
```bash
npx tsx prisma/seed.ts
```

**⚠️ IMPORTANT:** The seed script will output SMTP credentials. **Copy them!** You'll need them to view sent emails.

Example output:
```
Created sender: test1@ethereal.email (Rate limit: 50/hour)
  SMTP User: test1@ethereal.email
  SMTP Pass: abc123xyz
```

---

### Step 3: Setup Frontend (1 minute)

```bash
cd ../frontend
npm install
```

The `.env.local` file is already configured.

---

### Step 4: Run the Application (30 seconds)

You need **two terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Wait for: `Server running on port 3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Wait for: `Ready on http://localhost:3000`

---

### Step 5: Access the Dashboard (10 seconds)

Open your browser and go to:

**http://localhost:3000**

You should see the beautiful ReachInbox dashboard! 🎉

---

## 📧 Send Your First Email

### 1. Schedule an Email

1. Click **"Schedule Email"** button on the homepage
2. Fill in the form:
   - **Sender:** Select one of the test senders
   - **Recipient Email:** `test@example.com` (or any email)
   - **Recipient Name:** `Test User`
   - **Subject:** `My First Scheduled Email`
   - **Email Body:** 
     ```html
     <h1>Hello!</h1>
     <p>This is my first scheduled email from ReachInbox!</p>
     <p>Pretty cool, right? 😎</p>
     ```
   - **Scheduled Time:** Pick a time **2-3 minutes from now**

3. Click **"Schedule Email"**

### 2. Watch It Send

1. Go back to the homepage
2. Watch the **"Scheduled"** count increase
3. Wait for the scheduled time
4. Watch the email move from **"Scheduled"** to **"Sent"**!

### 3. View the Sent Email

1. Go to **https://ethereal.email/**
2. Click **"Login"** (top right)
3. Enter the SMTP credentials from Step 2
4. You'll see your sent email! 📬

---

## 🎨 Explore the Dashboard

### Homepage
- **Real-time stats** - Scheduled, sent, failed emails
- **Queue status** - BullMQ job counts
- **Rate limiting** - Current hour usage

### Schedule Email
- Form to create new scheduled emails
- Select sender, recipient, subject, body, time

### View Emails
- **All Emails** - Complete list
- **Scheduled** - Upcoming emails
- **Sent** - Delivered emails
- **Cancel** - Remove scheduled emails

### Manage Senders
- View all sender accounts
- Add new senders with SMTP credentials
- See rate limits per sender

---

## 🧪 Test Features

### Test Rate Limiting

Schedule 10 emails for the same time (1 minute from now):

1. Go to "Schedule Email"
2. Create 10 emails with the same scheduled time
3. Watch the dashboard - they'll send with delays due to rate limiting!

### Test Persistence

1. Schedule an email for 5 minutes from now
2. Stop the backend (Ctrl+C)
3. Wait 1 minute
4. Restart the backend: `npm run dev`
5. The email still sends at the correct time! ✅

### Test Concurrency

Check the logs to see multiple emails processing in parallel:

```bash
cd backend
tail -f logs/combined.log
```

---

## 🔧 Configuration

### Change Rate Limits

Edit `backend/.env`:

```env
MAX_EMAILS_PER_HOUR_GLOBAL=200      # Total emails per hour
MAX_EMAILS_PER_HOUR_PER_SENDER=100  # Per sender per hour
```

Restart backend to apply.

### Change Worker Concurrency

Edit `backend/.env`:

```env
WORKER_CONCURRENCY=10  # Process 10 emails in parallel
```

Restart backend to apply.

### Change Delay Between Sends

Edit `backend/.env`:

```env
MIN_DELAY_BETWEEN_SENDS_MS=5000  # 5 seconds between emails
```

Restart backend to apply.

---

## 🐛 Troubleshooting

### "Connection refused" errors

**Problem:** Docker containers not running

**Solution:**
```bash
docker-compose down
docker-compose up -d
docker ps  # Verify both containers are running
```

### "Sender not found" error

**Problem:** Database not seeded

**Solution:**
```bash
cd backend
npx tsx prisma/seed.ts
```

### Frontend shows "Failed to fetch"

**Problem:** Backend not running

**Solution:**
```bash
cd backend
npm run dev
```

Verify: http://localhost:3001/health should return `{"status":"healthy"}`

### Worker not processing jobs

**Problem:** Worker crashed or not started

**Solution:**
Check logs:
```bash
cd backend
cat logs/error.log
```

Restart backend:
```bash
npm run dev
```

---

## 📊 Monitoring

### View Database

```bash
cd backend
npx prisma studio
```

Opens a web UI at http://localhost:5555 to browse the database.

### View Redis

```bash
docker exec -it reachinbox-redis redis-cli
```

Commands:
- `KEYS *` - List all keys
- `GET rate_limit:global:1737446400000` - View rate limit counter
- `LLEN bull:email-queue:wait` - Queue length

### View Logs

```bash
cd backend
tail -f logs/combined.log  # All logs
tail -f logs/error.log     # Errors only
```

---

## 🎯 Next Steps

Now that you're up and running:

1. **Add More Senders**
   - Go to /senders
   - Create Ethereal accounts at https://ethereal.email/
   - Add them to the system

2. **Schedule Bulk Emails**
   - Use the API to schedule many emails
   - Watch rate limiting in action

3. **Explore the Code**
   - `backend/src/workers/email.worker.ts` - Email processing logic
   - `backend/src/services/rate-limiter.service.ts` - Rate limiting
   - `frontend/src/app/page.tsx` - Dashboard UI

4. **Read the Docs**
   - `README.md` - Full documentation
   - `PROJECT_SUMMARY.md` - Technical overview
   - `SETUP.md` - Detailed setup guide

---

## 🛑 Stopping the Application

### Stop Backend & Frontend
Press `Ctrl+C` in both terminal windows.

### Stop Docker Containers
```bash
docker-compose down
```

### Remove All Data (Optional)
```bash
docker-compose down -v
```

This removes the database and Redis data.

---

## ✅ Verification Checklist

Make sure everything works:

- [ ] Docker containers running (`docker ps`)
- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] Can access dashboard at http://localhost:3000
- [ ] Can schedule an email
- [ ] Email appears in "Scheduled" tab
- [ ] Email sends at scheduled time
- [ ] Email appears in "Sent" tab
- [ ] Can view email on Ethereal
- [ ] Rate limiting works (schedule multiple emails)
- [ ] Persistence works (restart backend, jobs still run)

---

## 🎉 Success!

You now have a **production-grade email scheduler** running locally!

**What you can do:**
- ✅ Schedule emails via beautiful dashboard
- ✅ Send emails via SMTP (Ethereal)
- ✅ Monitor queue and stats in real-time
- ✅ Manage multiple sender accounts
- ✅ Handle rate limiting automatically
- ✅ Survive server restarts
- ✅ Process emails concurrently

**Next:** Try scheduling 100 emails and watch the system handle them gracefully!

---

## 📚 Resources

- **API Documentation:** See `README.md` for all endpoints
- **Architecture:** See `PROJECT_SUMMARY.md` for technical details
- **Troubleshooting:** See `SETUP.md` for common issues
- **Ethereal Email:** https://ethereal.email/
- **BullMQ Docs:** https://docs.bullmq.io/

---

**Need help?** Check the troubleshooting section or review the logs!

**Happy scheduling! 🚀**
