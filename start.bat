@echo off
echo [ReachInbox] Starting System...

:: 1. Start Redis (Background)
if exist "backend\redis-bin\redis-server.exe" (
    echo [ReachInbox] Starting Local Redis...
    start /min "" "backend\redis-bin\redis-server.exe"
) else (
    echo [ReachInbox] Warning: Local Redis binary not found. using system Redis or Upstash...
)

:: 2. Start Backend (New Window)
echo [ReachInbox] Starting Backend...
start "ReachInbox Backend" cmd /k "cd backend && npm run dev"

:: 3. Start Frontend (New Window)
echo [ReachInbox] Starting Frontend...
start "ReachInbox Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo [ReachInbox] All services starting!
echo Backend:   http://localhost:3001
echo Frontend:  http://localhost:3000
echo.
pause
