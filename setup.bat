@echo off
echo ============================================
echo   AskDocs - Setup Script
echo ============================================

echo.
echo [1/4] Creating Python virtual environment...
cd backend
python -m venv venv
call venv\Scripts\activate.bat

echo.
echo [2/4] Installing Python dependencies...
pip install -r requirements.txt

echo.
echo [3/4] Setting up .env file...
if not exist .env (
    copy .env.example .env
    echo Created .env - Please add your GEMINI_API_KEY in backend\.env
) else (
    echo .env already exists, skipping.
)

echo.
echo [4/4] Installing frontend dependencies...
cd ..\frontend
npm install

echo.
echo ============================================
echo   Setup complete!
echo   Next steps:
echo   1. Add your GEMINI_API_KEY to backend\.env
echo   2. Run start.bat to launch the app
echo ============================================
pause
