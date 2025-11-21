# CarbonScore Platform Launcher
Write-Host "🚀 Launching CarbonScore Platform..." -ForegroundColor Green
Write-Host ""

$RootPath = $PSScriptRoot

# Function to start a service in a new window
function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Port
    )
    
    Write-Host "Starting $Name on port $Port..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; Write-Host '🟢 $Name Running on port $Port' -ForegroundColor Green; $Command"
    Start-Sleep -Seconds 2
}

# Start Backend Services
Write-Host "📊 Starting Backend Services..." -ForegroundColor Yellow
Write-Host ""

# Calculation Service (Port 8000)
Start-Service -Name "Calculation Service" -Path "$RootPath\services\calc-service" -Command "python -m uvicorn app.main:app --reload --port 8000" -Port "8000"

# ML Service (Port 8010)
Start-Service -Name "ML Service" -Path "$RootPath\services\ml-service" -Command "python -m uvicorn app.main:app --reload --port 8010" -Port "8010"

# PDF Service (Port 8020)
Start-Service -Name "PDF Service" -Path "$RootPath\services\pdf-service" -Command "python -m uvicorn app.main:app --reload --port 8020" -Port "8020"

# LLM Service (Port 8030)
Start-Service -Name "LLM Service" -Path "$RootPath\services\llm-service" -Command "python -m uvicorn app.main:app --reload --port 8030" -Port "8030"

# Worker Service (No Port, Background)
Write-Host "Starting Worker Service..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootPath\services\worker-service'; Write-Host '🟢 Worker Service Running' -ForegroundColor Green; python app/main.py"
Start-Sleep -Seconds 2

# Wait for services to initialize
Write-Host ""
Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Frontend
Write-Host ""
Write-Host "🎨 Starting Frontend..." -ForegroundColor Yellow
Start-Service -Name "Next.js Frontend" -Path "$RootPath\apps\web-nextjs" -Command "npm run dev" -Port "3000"

# Wait for frontend to start
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ Platform Launch Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend:          http://localhost:3000" -ForegroundColor White
Write-Host "   Calculation API:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "   ML Service:        http://localhost:8010/docs" -ForegroundColor White
Write-Host "   PDF Service:       http://localhost:8020/docs" -ForegroundColor White
Write-Host "   LLM Service:       http://localhost:8030/docs" -ForegroundColor White
Write-Host ""
Write-Host "📖 Opening platform in browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Press any key to stop all services..." -ForegroundColor Red
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
Write-Host "Stopping all services..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.MainWindowTitle -like "*CarbonScore*"} | Stop-Process -Force
# Also try to find by python/node processes started from this location if possible, but window title is safest for now
Write-Host "Done!" -ForegroundColor Green
