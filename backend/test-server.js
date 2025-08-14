const express = require('express');
const app = express();
const PORT = 3333;

app.get('/api/test', (req, res) => {
  console.log('Teste funcionando!');
  res.json({ message: 'Servidor funcionando!' });
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
