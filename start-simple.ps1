# Script PowerShell simplificado para iniciar Backend + Frontend
Write-Host "🚀 Iniciando PF3-WEB..." -ForegroundColor Green

# Mata processos nas portas 3000 e 3001 usando netstat
Write-Host "🔄 Liberando portas..." -ForegroundColor Yellow
$ports = @(3000, 3001)
foreach ($port in $ports) {
    $processes = netstat -ano | Select-String ":$port " | ForEach-Object { ($_ -split '\s+')[4] }
    foreach ($pid in $processes) {
        if ($pid -and $pid -ne "0") {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "Processo PID $pid finalizado na porta $port" -ForegroundColor Yellow
            } catch {
                # Ignora erros
            }
        }
    }
}

Start-Sleep -Seconds 2

# Verifica dependências
Write-Host "📦 Verificando dependências..." -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependências do projeto raiz..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Instalando dependências do backend..." -ForegroundColor Yellow
    cd backend; npm install; cd ..
}

if (-not (Test-Path "frontend\dashboard\node_modules")) {
    Write-Host "Instalando dependências do frontend..." -ForegroundColor Yellow
    cd frontend\dashboard; npm install; cd ..\..
}

Write-Host "✅ Iniciando serviços..." -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host ""

# Executa comando dev
npm run dev
