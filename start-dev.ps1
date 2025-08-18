# Script PowerShell para iniciar Backend + Frontend
Write-Host "🚀 Iniciando Backend e Frontend..." -ForegroundColor Green

# Função para matar processos em uma porta específica
function Kill-ProcessOnPort {
    param([int]$Port)
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        foreach ($connection in $connections) {
            $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "🔄 Finalizando processo $($process.ProcessName) (PID: $($process.Id)) na porta $Port" -ForegroundColor Yellow
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            }
        }
    }
    catch {
        # Silenciosamente ignora erros se a porta não estiver em uso
    }
}

# Mata processos nas portas 3000 e 3001
Write-Host "🔄 Verificando e liberando portas..." -ForegroundColor Yellow
Kill-ProcessOnPort -Port 3000
Kill-ProcessOnPort -Port 3001

# Aguarda um momento
Start-Sleep -Seconds 2

# Verifica e instala dependências se necessário
Write-Host "📦 Verificando dependências..." -ForegroundColor Cyan

if (-not (Test-Path "backend\node_modules")) {
    Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend\dashboard\node_modules")) {
    Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Yellow
    Set-Location frontend\dashboard
    npm install
    Set-Location ..\..
}

Write-Host "✅ Dependências verificadas!" -ForegroundColor Green
Write-Host "🚀 Iniciando serviços..." -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Para parar os serviços, pressione Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Inicia os serviços
try {
    npm run dev
}
catch {
    Write-Host "❌ Erro ao iniciar os serviços" -ForegroundColor Red
    Write-Host "💡 Certifique-se de que o npm está instalado e as dependências foram instaladas corretamente" -ForegroundColor Yellow
}

Write-Host "Pressione qualquer tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
