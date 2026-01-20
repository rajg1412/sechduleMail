# ReachInbox Email Scheduler

A **production-grade email scheduler service** built with **BullMQ**, **Redis**, **PostgreSQL**, and **Next.js**. This system handles reliable email scheduling and sending at scale with rate limiting, persistence, and a beautiful dashboard.

![Email Scheduler Dashboard](https://img.shields.io/badge/Status-Production%20Ready-success)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 Features

### Backend
- ✅ **BullMQ + Redis** for persistent job scheduling (no cron jobs)
- ✅ **PostgreSQL** database for email metadata
- ✅ **Ethereal Email** SMTP integration for testing
- ✅ **Rate Limiting** (per-sender and global, configurable)
- ✅ **Worker Concurrency** (configurable, default: 5)
- ✅ **Minimum Delay** between sends (default: 2 seconds)
- ✅ **Automatic Rescheduling** when rate limits exceeded
- ✅ **Idempotency** - no duplicate emails
- ✅ **Persistence** - survives server restarts
- ✅ **Graceful Shutdown** handling
- ✅ **Comprehensive Logging** with Winston

### Frontend
- ✅ **Next.js 15** with App Router
- ✅ **TypeScript** throughout
- ✅ **Tailwind CSS** + shadcn/ui components
- ✅ **React Query** for data fetching
- ✅ **Real-time Stats** dashboard
- ✅ **Schedule Emails** interface
- ✅ **View Scheduled/Sent Emails**
- ✅ **Manage Senders** interface

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Next.js   │─────▶│  Express API │─────▶│  PostgreSQL │
│  Dashboard  │      │              │      │  (Metadata) │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │    Redis     │
                     │  (BullMQ)    │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Email Worker │
                     │ (Concurrency)│
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Ethereal   │
                     │     SMTP     │
                     └──────────────┘
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose (for Redis + PostgreSQL)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd reachInbox
```

### 2. Start Infrastructure (Redis + PostgreSQL)

```bash
docker-compose up -d
```

This starts:
- **Redis** on `localhost:6379`
- **PostgreSQL** on `localhost:5432`

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed database with test senders
npx tsx prisma/seed.ts
```

**Important:** The seed script will create 3 test senders with Ethereal email accounts. Copy the SMTP credentials from the output - you'll need them!

### 4. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Access the Application

- **Frontend Dashboard:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## 📊 How It Works

### Email Scheduling Flow

1. **User schedules email** via API or dashboard
2. **Email record created** in PostgreSQL with idempotency key
3. **Job added to BullMQ** with calculated delay
4. **Worker picks up job** when scheduled time arrives
5. **Rate limit check** (per-sender + global)
   - If limit exceeded → reschedule to next hour
   - If allowed → proceed
6. **Email sent** via SMTP (Ethereal)
7. **Counters incremented** in Redis + PostgreSQL
8. **Status updated** to SENT in database

### Rate Limiting Strategy

- **Per-Sender Limit:** Configurable (default: 100/hour)
- **Global Limit:** Configurable (default: 200/hour)
- **Implementation:** Redis sorted sets + PostgreSQL fallback
- **Behavior:** Jobs are rescheduled (not dropped) when limit reached

### Persistence & Recovery

- **BullMQ** stores jobs in Redis with persistence enabled
- **PostgreSQL** stores email metadata
- **On Restart:** BullMQ automatically recovers pending jobs
- **Idempotency:** SHA-256 hash prevents duplicate emails

## 🔧 Configuration

### Backend Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://reachinbox:reachinbox_password@localhost:5432/email_scheduler"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# BullMQ
WORKER_CONCURRENCY=5
MIN_DELAY_BETWEEN_SENDS_MS=2000

# Rate Limiting
MAX_EMAILS_PER_HOUR_GLOBAL=200
MAX_EMAILS_PER_HOUR_PER_SENDER=100

# SMTP
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📡 API Endpoints

### Emails

- `POST /api/emails/schedule` - Schedule a new email
- `GET /api/emails` - List emails (with filters)
- `GET /api/emails/:id` - Get email by ID
- `DELETE /api/emails/:id` - Cancel scheduled email
- `GET /api/emails/stats` - Get statistics

### Senders

- `POST /api/senders` - Create sender
- `GET /api/senders` - List senders
- `GET /api/senders/:id` - Get sender by ID
- `PATCH /api/senders/:id` - Update sender
- `DELETE /api/senders/:id` - Delete sender

## 🧪 Testing Email Sending

1. **Get Sender Credentials** from the seed script output
2. **Schedule an Email** via the dashboard or API:

```bash
curl -X POST http://localhost:3001/api/emails/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "<sender-id-from-database>",
    "recipientEmail": "test@example.com",
    "recipientName": "Test User",
    "subject": "Test Email",
    "body": "<h1>Hello!</h1><p>This is a test email.</p>",
    "scheduledAt": "2026-01-21T10:00:00Z"
  }'
```

3. **View Sent Email** at https://ethereal.email/ using the SMTP credentials

## 📈 Load Testing

The system is designed to handle **1000+ emails** scheduled for the same time:

- **Rate limiting** prevents overwhelming SMTP servers
- **Concurrency** allows parallel processing
- **Automatic rescheduling** when limits exceeded
- **Jobs are queued** and processed in order

## 🛠️ Development

### Database Migrations

```bash
cd backend
npx prisma migrate dev --name <migration-name>
```

### View Database

```bash
cd backend
npx prisma studio
```

### View Logs

Backend logs are stored in `backend/logs/`:
- `combined.log` - All logs
- `error.log` - Error logs only

## 🔒 Production Deployment

### Backend

1. Set `NODE_ENV=production`
2. Use managed Redis (AWS ElastiCache, Redis Cloud, etc.)
3. Use managed PostgreSQL (AWS RDS, Supabase, etc.)
4. Enable Redis persistence (AOF + RDB)
5. Set up monitoring and alerts
6. Use a process manager (PM2, systemd)

### Frontend

1. Build: `npm run build`
2. Deploy to Vercel, Netlify, or any Node.js host
3. Set `NEXT_PUBLIC_API_URL` to production API URL

## 📝 Key Design Decisions

### Why BullMQ?

- **Persistent** - Jobs survive restarts
- **Scalable** - Multiple workers supported
- **Feature-rich** - Delays, retries, rate limiting built-in
- **Battle-tested** - Used in production by many companies

### Why Redis + PostgreSQL?

- **Redis** - Fast, in-memory queue storage
- **PostgreSQL** - Reliable, persistent metadata storage
- **Dual storage** - Best of both worlds

### Why Ethereal Email?

- **Free** - No cost for testing
- **No signup** - Accounts created programmatically
- **Preview** - View sent emails in browser
- **Safe** - Emails never actually delivered

## 🐛 Troubleshooting

### Docker containers won't start

```bash
docker-compose down -v
docker-compose up -d
```

### Database connection errors

Check that PostgreSQL is running:
```bash
docker ps
```

### Redis connection errors

Check that Redis is running:
```bash
docker exec -it reachinbox-redis redis-cli ping
```

### Worker not processing jobs

Check logs in `backend/logs/combined.log`

## 📚 Tech Stack

### Backend
- **TypeScript** - Type safety
- **Express.js** - Web framework
- **Prisma** - ORM
- **BullMQ** - Job queue
- **IORedis** - Redis client
- **Nodemailer** - SMTP client
- **Winston** - Logging
- **Zod** - Validation

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Query** - Data fetching
- **Lucide React** - Icons

### Infrastructure
- **Docker** - Containerization
- **Redis 7** - In-memory data store
- **PostgreSQL 15** - Relational database

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For questions or issues, please open a GitHub issue.

---

**Built with ❤️ for ReachInbox**
