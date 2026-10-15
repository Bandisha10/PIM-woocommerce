@echo off
title Stockroom PIM Server
echo ======================================================================
echo           Starting Stockroom PIM for WooCommerce
echo ======================================================================
echo Frontend: React 19 + Lucide + Vite
echo Backend:  FastAPI + SQLAlchemy + SQLite
echo Mode:     Full Stack Application
echo URL:      http://localhost:8000
echo ======================================================================

start http://localhost:8000
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
pause
