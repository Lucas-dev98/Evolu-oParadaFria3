const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, directory) {
  console.log(`🔧 Executando: ${command} em ${directory}`);
  execSync(command, { cwd: directory, stdio: 'inherit' });
}

function copyDirectory(src, dest) {
  console.log(`📁 Copiando ${src} para ${dest}`);

  // Criar diretório de destino se não existir
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Copiar recursivamente
  const items = fs.readdirSync(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('🚀 Iniciando build para produção...');

try {
  // 1. Instalar dependências do backend
  console.log('📦 Instalando dependências do backend...');
  runCommand('npm install', 'backend');

  // 2. Instalar dependências do frontend
  console.log('📦 Instalando dependências do frontend...');
  runCommand('npm install', 'frontend/dashboard');

  // 3. Build do frontend
  console.log('🏗️ Fazendo build do frontend...');
  runCommand('npm run build', 'frontend/dashboard');

  // 4. Build do backend
  console.log('🏗️ Fazendo build do backend...');
  runCommand('npm run build', 'backend');

  // 5. Copiar arquivos do frontend para o backend
  console.log('📁 Copiando build do frontend para o backend...');
  const frontendBuildPath = path.join('frontend', 'dashboard', 'build');
  const backendDistPath = path.join(
    'backend',
    'dist',
    'frontend',
    'dashboard',
    'build'
  );

  if (fs.existsSync(frontendBuildPath)) {
    copyDirectory(frontendBuildPath, backendDistPath);
  } else {
    throw new Error('Build do frontend não encontrado!');
  }

  console.log('✅ Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}
