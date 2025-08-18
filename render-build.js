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

  // 3. Verificar e preparar imagens antes do build
  console.log('🖼️ Verificando imagens antes do build...');
  const publicImgPath = path.join(
    'frontend',
    'dashboard',
    'public',
    'static',
    'img'
  );
  if (!fs.existsSync(publicImgPath)) {
    console.log('📁 Criando pasta de imagens em public...');
    fs.mkdirSync(publicImgPath, { recursive: true });
  }

  // Copiar imagens do diretório raiz se existirem (fallback para deploy)
  const rootImages = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];
  let imagesCopiedFromRoot = 0;

  for (const imgName of rootImages) {
    const rootImgPath = path.join(imgName);
    const targetImgPath = path.join(publicImgPath, imgName);

    if (fs.existsSync(rootImgPath) && !fs.existsSync(targetImgPath)) {
      try {
        fs.copyFileSync(rootImgPath, targetImgPath);
        imagesCopiedFromRoot++;
        console.log(`📁 Copiado: ${imgName}`);
      } catch (error) {
        console.log(`⚠️ Erro ao copiar ${imgName}:`, error.message);
      }
    }
  }

  if (imagesCopiedFromRoot > 0) {
    console.log(
      `✅ ${imagesCopiedFromRoot} imagens copiadas do diretório raiz`
    );
  }

  // Verificar o que existe na pasta final
  if (fs.existsSync(publicImgPath)) {
    const files = fs.readdirSync(publicImgPath);
    console.log('📁 Imagens finais na pasta public:', files);
  }

  // 4. Build do frontend
  console.log('🏗️ Fazendo build do frontend...');
  runCommand('npm run build', 'frontend/dashboard');

  // 5. Build do backend
  console.log('🏗️ Fazendo build do backend...');
  runCommand('npm run build', 'backend');

  // 6. Copiar arquivos do frontend para o backend
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

  // 7. Garantir que as imagens estejam copiadas
  console.log('🖼️ Verificando e copiando imagens...');
  console.log('📍 Diretório de trabalho atual:', process.cwd());

  // Listar o que existe na pasta frontend/dashboard
  const dashboardPath = path.join('frontend', 'dashboard');
  if (fs.existsSync(dashboardPath)) {
    console.log('📁 Conteúdo de frontend/dashboard:');
    const dashboardContents = fs.readdirSync(dashboardPath);
    console.log(dashboardContents);

    // Verificar se existe pasta public
    const publicPath = path.join(dashboardPath, 'public');
    if (fs.existsSync(publicPath)) {
      console.log('📁 Conteúdo de frontend/dashboard/public:');
      const publicContents = fs.readdirSync(publicPath);
      console.log(publicContents);

      const publicStaticPath = path.join(publicPath, 'static');
      if (fs.existsSync(publicStaticPath)) {
        console.log('📁 Conteúdo de frontend/dashboard/public/static:');
        const staticContents = fs.readdirSync(publicStaticPath);
        console.log(staticContents);
      }
    }

    // Verificar se existe pasta build
    const buildPath = path.join(dashboardPath, 'build');
    if (fs.existsSync(buildPath)) {
      console.log('📁 Conteúdo de frontend/dashboard/build:');
      const buildContents = fs.readdirSync(buildPath);
      console.log(buildContents);

      const buildStaticPath = path.join(buildPath, 'static');
      if (fs.existsSync(buildStaticPath)) {
        console.log('📁 Conteúdo de frontend/dashboard/build/static:');
        const buildStaticContents = fs.readdirSync(buildStaticPath);
        console.log(buildStaticContents);
      }
    }
  }

  // Primeiro, tentar copiar da pasta public
  const frontendImagesPath = path.join(
    'frontend',
    'dashboard',
    'public',
    'static',
    'img'
  );

  // Segundo, tentar copiar da pasta build (já construída)
  const frontendBuildImagesPath = path.join(
    'frontend',
    'dashboard',
    'build',
    'static',
    'img'
  );

  const backendImagesPath = path.join(
    'backend',
    'dist',
    'frontend',
    'dashboard',
    'build',
    'static',
    'img'
  );
  const backendImagesPath2 = path.join('backend', 'dist', 'static', 'img');

  let imagesCopied = false;

  // Tentar copiar da pasta public primeiro
  if (fs.existsSync(frontendImagesPath)) {
    console.log('📁 Copiando imagens da pasta public...');
    copyDirectory(frontendImagesPath, backendImagesPath);
    copyDirectory(frontendImagesPath, backendImagesPath2);
    imagesCopied = true;
  } else {
    console.log(
      '⚠️ Pasta de imagens public não encontrada em:',
      frontendImagesPath
    );
  }

  // Se não conseguir da public, tentar da pasta build
  if (!imagesCopied && fs.existsSync(frontendBuildImagesPath)) {
    console.log('📁 Copiando imagens da pasta build...');
    copyDirectory(frontendBuildImagesPath, backendImagesPath);
    copyDirectory(frontendBuildImagesPath, backendImagesPath2);
    imagesCopied = true;
  } else if (!imagesCopied) {
    console.log(
      '⚠️ Pasta de imagens build não encontrada em:',
      frontendBuildImagesPath
    );
  }

  if (imagesCopied) {
    console.log('✅ Imagens copiadas com sucesso!');
  } else {
    console.warn('⚠️ Nenhuma pasta de imagens encontrada para copiar!');
  }

  console.log('✅ Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}
