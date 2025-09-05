// Test script to verify CSV data processing
// Execute this in browser console

// Clear any existing data first
localStorage.removeItem('preparacao_data');
localStorage.removeItem('cronograma_data');
localStorage.removeItem('pfus3_phases');

console.log('🧹 Dados limpos. Agora simule o carregamento do CSV Manager.');
console.log('1. Vá para a seção Admin');
console.log('2. Use o Gerenciamento de CSV para carregar os arquivos');
console.log('3. Depois execute o script debug-validation.js');

// Create test data that should show 100%
const testPreparacaoData = {
  fase: {
    progress: 100,
    status: 'completed',
    activities: 352,
    completedActivities: 352,
  },
  metadata: {
    progressoGeral: 100,
    titulo: 'Cronograma Preparação - PFUS3',
  },
  atividades: [],
};

// Force set the data with 100%
localStorage.setItem('preparacao_data', JSON.stringify(testPreparacaoData));
console.log('💾 Dados de teste salvos com 100% de progresso');
console.log('🔄 Recarregue a página para ver o resultado');
