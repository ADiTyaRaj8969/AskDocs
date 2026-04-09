@echo off
echo ============================================
echo   AskDocs - Starting Application
echo ============================================

REM Check if server/.env exists
if not exist "server\.env" (
  echo.
  echo [!] server\.env not found.
  echo     Copy server\.env.example to server\.env and add your GEMINI_API_KEY.
  echo.
  pause
  exit /b 1
)

REM Install server dependencies if node_modules is missing
if not exist "server\node_modules" (
  echo [*] Installing server dependencies...
  cd server && npm install && cd ..
)

REM Install frontend dependencies if node_modules is missing
if not exist "frontend\node_modules" (
  echo [*] Installing frontend dependencies...
  cd frontend && npm install && cd ..
)

echo.
echo [*] Starting Express backend on http://localhost:5000 ...
start "AskDocs Backend" cmd /k "cd server && npm run dev"

timeout /t 2 /nobreak >nul

echo [*] Starting React frontend on http://localhost:5173 ...
start "AskDocs Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo   App running!
echo   Frontend : http://localhost:5173
echo   API      : http://localhost:5000
echo   Health   : http://localhost:5000/health
echo ============================================
echo.
