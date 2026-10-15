Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      Starting Stockroom PIM for WooCommerce             " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Frontend: React 19 + Lucide" -ForegroundColor Gray
Write-Host "Backend:  FastAPI + SQLAlchemy + SQLite" -ForegroundColor Gray
Write-Host "Opening:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

Start-Process "http://localhost:8000"
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
