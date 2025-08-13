// Teste simples de carregamento de CSV
fetch('/cronograma-operacional.csv')
  .then((response) => {
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    return response.text();
  })
  .then((text) => {
    console.log('CSV content length:', text.length);
    console.log('First 500 characters:', text.substring(0, 500));
  })
  .catch((error) => {
    console.error('Error loading CSV:', error);
  });
