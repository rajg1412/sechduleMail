# 🚀 ReachInbox - intelligent Email Scheduler & Queue System

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green)](https://nodejs.org/)
[![Redis](https://img.shields.io/badge/Redis-BullMQ-red)](https://redis.io/)
[![Database](https://img.shields.io/badge/PostgreSQL-Supabase-blue)](https://supabase.com/)

A powerful, distributed email scheduling system built to handle high-volume email campaigns with precision, reliability, and rate limiting.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Dashboard+Preview) 
*(Add your own screenshot here later!)*

---

## 🔥 Key Features

- **🕒 Precision Scheduling:** Schedule emails to be sent at exact future timestamps.
- **🛡️ Smart Rate Limiting:** Global and per-sender throttling to protect domain reputation (e.g., "Max 100 emails/hour").
- **🔄 Robust Queue System:** Built on **BullMQ & Redis**, ensuring job persistence. If the server crashes, jobs resume automatically.
- **📊 Real-time Dashboard:** Monitor queue depth, success/failure rates, and active jobs.
- **🚦 Concurrency Control:** Support for multiple workers processing jobs in parallel.
- **✏️ Manage Senders:** CRUD operations for email accounts/sender identities.

---

## 🏗️ System Architecture

The project follows a decoupled architecture separating the Client, API, and Worker processes:

1.  **Frontend (Next.js):** A modern dashboard for managing schedules and viewing stats.
2.  **Backend API (Express):** Handles incoming REST requests and pushes jobs to the Redis Queue.
3.  **Redis (Store):** Holds the state of all jobs (Scheduled, Pending, Completed, Failed).
4.  **Worker Service:** An independent process that pulls jobs from Redis when they are due and executes the email sending logic via SMTP.
5.  **Database (PostgreSQL):** Stores metadata (User profiles, History, Analytics).

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS + Shadcn/UI
- **State Management:** React Query (Tanstack)
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Validation:** Zod

### Infrastructure
- **Queue Engine:** BullMQ
- **Cache/PubSub:** Redis (Upstash or Local)
- **Database:** PostgreSQL (Supabase)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Redis (Local or Cloud URL)
- PostgreSQL (Local or Supabase URL)

### 1. Clone the Repository
```bash
git clone https://github.com/rajg1412/sechduleMail.git
cd sechduleMail
```

### 2. Backend Setup
```bash
cd backend
npm install

# Setup Environment Variables
cp .env.example .env
# (Fill in DATABASE_URL and REDIS info)

# Initialize Database
npx prisma generate
npx prisma db push

# Start Server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Setup Environment Variables
cp .env.example .env.local
# (Fill in NEXT_PUBLIC_API_URL)

# Start Client
npm run dev
```

Visit `http://localhost:3000` to see the app!

---

## 🐳 Deployment

- **Frontend:** Deployed on **Vercel** for optimal edge performance.
- **Backend/Worker:** Deployed on **Render** (or any VPS) to support persistent worker processes.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full production instructions.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
