const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const PORT = 3333;

app.get('/api/test', (req, res) => {
  console.log('Teste funcionando!');
  res.json({ message: 'Servidor funcionando!' });
});

// Rota para listar imagens do carrossel
app.get('/api/images', (req, res) => {
  // Ajusta para buscar imagens da pasta pública do frontend
  const imgDir = path.join(
    __dirname,
    '../frontend/dashboard/public/static/img'
  );
  fs.readdir(imgDir, (err, files) => {
    if (err) {
      console.error('Erro ao ler pasta de imagens:', err);
      return res.status(500).json({ error: 'Erro ao ler imagens' });
    }
    // Filtra apenas arquivos de imagem
    const imageFiles = files.filter((f) => /\.(jpg|jpeg|png|gif)$/i.test(f));
    // Retorna caminhos relativos para uso no frontend React
    res.json(imageFiles.map((f) => `/static/img/${f}`));
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de teste rodando na porta ${PORT}`);
});

process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada:', reason);
});
