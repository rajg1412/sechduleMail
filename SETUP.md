# ReachInbox Email Scheduler - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Infrastructure
```bash
docker-compose up -d
```

Wait for containers to be healthy (~10 seconds).

### Step 2: Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npx prisma generate
npx tsx prisma/seed.ts
```

**IMPORTANT:** Copy the SMTP credentials from the seed output!

### Step 3: Setup Frontend
```bash
cd ../frontend
npm install
cp .env.example .env.local
```

### Step 4: Run the Application

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

### Step 5: Access the Dashboard

Open http://localhost:3000 in your browser.

## 📧 Testing Email Sending

1. Go to "Schedule Email" page
2. Select a sender (created by seed script)
3. Fill in the form:
   - Recipient: any@example.com
   - Subject: Test Email
   - Body: `<h1>Hello!</h1><p>This is a test.</p>`
   - Scheduled Time: Pick a time 2-3 minutes from now
4. Click "Schedule Email"
5. Watch the dashboard - email will send at scheduled time
6. View sent email at https://ethereal.email/ (use SMTP credentials)

## 🔧 Configuration

### Rate Limiting

Edit `backend/.env`:
```env
MAX_EMAILS_PER_HOUR_GLOBAL=200
MAX_EMAILS_PER_HOUR_PER_SENDER=100
```

### Worker Concurrency

Edit `backend/.env`:
```env
WORKER_CONCURRENCY=5
MIN_DELAY_BETWEEN_SENDS_MS=2000
```

## 🐛 Troubleshooting

### "Connection refused" errors

Check Docker containers:
```bash
docker ps
```

Both `reachinbox-redis` and `reachinbox-postgres` should be running.

### "Sender not found" error

Run the seed script again:
```bash
cd backend
npx tsx prisma/seed.ts
```

### Worker not processing jobs

Check backend logs:
```bash
cd backend
tail -f logs/combined.log
```

### Frontend can't connect to backend

Verify backend is running on port 3001:
```bash
curl http://localhost:3001/health
```

## 📊 Monitoring

### View Queue Status
```bash
# In backend directory
npx bull-board
```

### View Database
```bash
# In backend directory
npx prisma studio
```

### View Redis
```bash
docker exec -it reachinbox-redis redis-cli
> KEYS *
> GET rate_limit:global:1737446400000
```

## 🧪 Load Testing

Schedule 100 emails at once:

```bash
# Create a test script
cd backend
cat > test-load.ts << 'EOF'
import { api } from '../frontend/src/lib/api';

async function loadTest() {
  const senderId = 'YOUR_SENDER_ID'; // Get from database
  const scheduledAt = new Date(Date.now() + 60000).toISOString(); // 1 min from now
  
  for (let i = 0; i < 100; i++) {
    await fetch('http://localhost:3001/api/emails/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId,
        recipientEmail: `test${i}@example.com`,
        subject: `Load Test Email ${i}`,
        body: `<p>Email #${i}</p>`,
        scheduledAt,
      }),
    });
    console.log(`Scheduled email ${i + 1}/100`);
  }
}

loadTest();
EOF

npx tsx test-load.ts
```

Watch the rate limiter reschedule emails to stay within limits!

## 🎯 Next Steps

1. **Add More Senders:** Go to /senders page
2. **Schedule Emails:** Go to /schedule page
3. **Monitor:** Watch the dashboard for real-time stats
4. **View Sent Emails:** Check https://ethereal.email/

## 📚 API Examples

### Schedule Email
```bash
curl -X POST http://localhost:3001/api/emails/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "YOUR_SENDER_ID",
    "recipientEmail": "test@example.com",
    "subject": "Hello",
    "body": "<h1>Hi!</h1>",
    "scheduledAt": "2026-01-21T10:00:00Z"
  }'
```

### List Emails
```bash
curl http://localhost:3001/api/emails
```

### Get Stats
```bash
curl http://localhost:3001/api/emails/stats
```

### Cancel Email
```bash
curl -X DELETE http://localhost:3001/api/emails/EMAIL_ID
```

## 🛑 Stopping the Application

```bash
# Stop backend and frontend (Ctrl+C in terminals)

# Stop Docker containers
docker-compose down

# To remove all data
docker-compose down -v
```

## ✅ Verification Checklist

- [ ] Docker containers running
- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] Database migrated
- [ ] Seed data created
- [ ] Can access dashboard
- [ ] Can schedule email
- [ ] Email sends at scheduled time
- [ ] Can view sent emails on Ethereal

## 🎉 Success!

You now have a production-grade email scheduler running locally!

For more details, see the main README.md file.
