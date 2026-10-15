@echo off
title Stockroom PIM Developer Mode
echo Starting FastAPI backend on http://localhost:8000 ...
start cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Vite React Dev Server on http://localhost:5173 ...
start cmd /k "cd frontend && npm run dev"

timeout /t 3
start http://localhost:5173
