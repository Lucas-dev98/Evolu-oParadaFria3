// Debug simples - adicione isso no console do navegador para testar

console.log('🔍 Testando carregamento dos CSVs...');

// Teste 1: Ver se os arquivos existem
Promise.all([
  fetch('/cronograma-operacional.csv'),
  fetch('/cronograma-preparacao.csv'),
])
  .then(([resp1, resp2]) => {
    console.log('📊 Respostas dos arquivos:', {
      operacional: {
        ok: resp1.ok,
        status: resp1.status,
        size: resp1.headers.get('content-length'),
      },
      preparacao: {
        ok: resp2.ok,
        status: resp2.status,
        size: resp2.headers.get('content-length'),
      },
    });

    if (resp1.ok && resp2.ok) {
      return Promise.all([resp1.text(), resp2.text()]);
    } else {
      throw new Error('Arquivos não encontrados');
    }
  })
  .then(([content1, content2]) => {
    console.log('📝 Conteúdo dos arquivos:', {
      operacional: {
        length: content1.length,
        firstLine: content1.split('\n')[0],
      },
      preparacao: {
        length: content2.length,
        firstLine: content2.split('\n')[0],
      },
    });
  })
  .catch((error) => {
    console.error('❌ Erro no teste:', error);
  });

// Teste 2: Ver se Papa Parse está disponível
console.log('📦 Papa Parse disponível:', typeof Papa !== 'undefined');
