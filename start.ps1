# Script PowerShell para iniciar PF3-WEB
Write-Host "🚀 Iniciando PF3-WEB..." -ForegroundColor Green

# Mata processos nas portas 3000 e 3001
Write-Host "🔄 Liberando portas..." -ForegroundColor Yellow
$ports = @(3000, 3001)
foreach ($port in $ports) {
    $processes = netstat -ano | Select-String ":$port " | ForEach-Object { ($_ -split '\s+')[4] }
    foreach ($processId in $processes) {
        if ($processId -and $processId -ne "0") {
            try {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "Processo PID $processId finalizado na porta $port" -ForegroundColor Yellow
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
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend\dashboard\node_modules")) {
    Write-Host "Instalando dependências do frontend..." -ForegroundColor Yellow
    Set-Location frontend\dashboard
    npm install
    Set-Location ..\..
}

Write-Host "✅ Iniciando serviços..." -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host ""

# Executa comando dev
npm run dev
