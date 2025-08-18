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

  // 6. Garantir que as imagens estejam copiadas
  console.log('🖼️ Verificando e copiando imagens...');
  const frontendImagesPath = path.join('frontend', 'dashboard', 'public', 'static', 'img');
  const backendImagesPath = path.join('backend', 'dist', 'frontend', 'dashboard', 'build', 'static', 'img');
  const backendImagesPath2 = path.join('backend', 'dist', 'static', 'img');
  
  if (fs.existsSync(frontendImagesPath)) {
    // Copiar para o local padrão do build
    copyDirectory(frontendImagesPath, backendImagesPath);
    // Copiar também para um local alternativo que o backend possa encontrar
    copyDirectory(frontendImagesPath, backendImagesPath2);
    console.log('✅ Imagens copiadas com sucesso!');
  } else {
    console.warn('⚠️ Pasta de imagens não encontrada em:', frontendImagesPath);
  }

  console.log('✅ Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}
