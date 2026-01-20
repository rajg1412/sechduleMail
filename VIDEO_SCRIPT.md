# 🎥 ReachInbox Scheduler - Demo Video Script

**Target Duration:** 2-3 Minutes  
**Tone:** Professional, Technical yet accessible

---

## 🎬 Section 1: Intro & The Problem (0:00 - 0:30)
**[Visual: Face camera OR Screen showing the "ReachInbox" Logo/Splash Screen]**

**Audio:**  
"Hi everyone! Today I'm excited to share a project I've been working on: the ReachInbox Email Scheduler. 

We all know the challenge: You need to send thousands of emails, but standard tools crash or get blocked if you send them all at once. You need precision scheduling, rate limiting, and reliability. That's exactly what this system solves."

---

## 🚀 Section 2: The Solution & Tech Stack (0:30 - 1:00)
**[Visual: Show System Architecture Diagram OR Split screen with Code + Dashboard]**

**Audio:**  
"This is a full-stack automated email scheduling system. 

It's built with a modern, robust tech stack:
- **Frontend:** Next.js 14 for a snappy, reactive user interface.
- **Backend:** A Node.js and Express server that handles the heavy lifting.
- **The Engine:** We use **BullMQ over Redis** to manage job queues. This is the secret sauce—it ensures that even if the server restarts, no scheduled email is ever lost.
- **Database:** Supabase (PostgreSQL) for persistent data storage."

---

## 💻 Section 3: Live Demo - Dashboard (1:00 - 1:45)
**[Visual: Screen recording. Open the Dashboard Home Page]**

**Audio:**  
"Let's jump into the dashboard. Here you see real-time stats: active jobs, completed emails, and failed attempts. It gives you a bird's-eye view of your system's health.

**[Visual: Click 'Schedule Email' -> Fill out the form -> Pick a time -> Click 'Schedule']**

Now, let's schedule an email. I can select a sender, write my content, and pick a specific time—say, tomorrow at 9 AM. 

When I hit schedule, the backend doesn't just 'wait'. It pushes a job to the Redis queue with a precise delay. The worker picks it up exactly when needed."

---

## ⚙️ Section 4: Under the Hood - Rate Limiting (1:45 - 2:15)
**[Visual: Show 'Senders' Tab -> Edit a Sender limit]**

**Audio:**  
"One cool feature is **Global Rate Limiting**. I can configure each Sender to only send, say, 100 emails per hour. 

If a campaign tries to send 500, the worker automatically throttles them, processing them in safe batches. This protects your domain reputation and prevents you from getting flagged as spam."

---

## 👋 Section 5: Conclusion (2:15 - 2:30)
**[Visual: Back to Dashboard Stats showing 'Sent' count going up OR Face Camera]**

**Audio:**  
"So that's the ReachInbox Scheduler. It's scalable, reliable, and built to handle production workloads.

The code is available on GitHub. Thanks for watching!"

---

## 🔗 Key Visual Cues to Record:
1.  **Dashboard Stats:** Show numbers changing.
2.  **Redis Logs (Optional):** Show the terminal printing "Email Sent" to prove it works backend-side.
3.  **Mobile View:** Show functionality on mobile to demonstrate responsiveness.
