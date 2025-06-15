@echo off
REM ------------------------------------------------------------
REM  Karl-GPT DEV STACK LAUNCHER
REM  • Opens two terminals: one for FastAPI, one for React
REM  • Works from *any* folder depth because we cd explicitly
REM  ------------------------------------------------------------

SETLOCAL ENABLEDELAYEDEXPANSION

REM ——— Activate Python venv (optional; comment out if none) ———
IF EXIST ".venv\Scripts\activate.bat" (
    call ".venv\Scripts\activate.bat"
)

REM ——— BACKEND (FastAPI) ———
start "Karl-Backend" cmd /k ^
  "cd /d %~dp0 && uvicorn app_Assistant:app --reload --port 8000"

REM ——— FRONTEND (React dev server) ———
start "Karl-Frontend" cmd /k ^
  "cd /d %~dp0frontend && npm start"

REM ——— Auto-open browser after 3 s ———
timeout /t 3 >nul
REM  Vite uses port 5173 for the dev server
start "" http://localhost:5173
