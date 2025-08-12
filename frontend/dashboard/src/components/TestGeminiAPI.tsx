import { aiService } from '../services/AIAnalysisService';

const TestGeminiAPI = () => {
  const testarGemini = async () => {
    console.log('🧪 Iniciando teste do Gemini com API v1beta...');
    console.log('🆕 Usando modelo gemini-1.5-flash (atualizado)');

    // Configurar a API key
    aiService.setProvider('gemini', 'AIzaSyDtlj2yTwpjC_Q6AyrQVvbFKDWAvJWcb20');

    // Dados de teste simples
    const dadosTeste = [
      { id: 1, nome: 'Tarefa 1', status: 'Concluída', prioridade: 'Alta' },
      { id: 2, nome: 'Tarefa 2', status: 'Em Andamento', prioridade: 'Média' },
      { id: 3, nome: 'Tarefa 3', status: 'Atrasada', prioridade: 'Alta' },
      { id: 4, nome: 'Tarefa 4', status: 'Pendente', prioridade: 'Baixa' },
    ];

    console.log('📊 Dados de teste:', dadosTeste);

    try {
      console.log('🚀 Testando análise AI direta (sem configuração)...');
      const resultado = await aiService.analisarComGeminiDireto(
        dadosTeste,
        [],
        {}
      );
      console.log('✅ Resultado da análise:', resultado);

      // Mostrar resultado na tela
      const resultadoDiv = document.getElementById('resultado-teste');
      if (resultadoDiv) {
        resultadoDiv.innerHTML = `
          <h3>✅ Análise IA - Sucesso!</h3>
          <p><strong>Resumo:</strong> ${resultado.resumo}</p>
          <p><strong>Pontuação:</strong> ${resultado.pontuacao}/100</p>
          <p><strong>Insights:</strong> ${resultado.insights.length} encontrados</p>
          <pre>${JSON.stringify(resultado, null, 2)}</pre>
        `;
        resultadoDiv.style.color = 'green';
        resultadoDiv.style.border = '2px solid green';
        resultadoDiv.style.padding = '20px';
        resultadoDiv.style.borderRadius = '10px';
        resultadoDiv.style.backgroundColor = '#f0fff0';
      }
    } catch (error) {
      console.error('❌ Erro no teste:', error);

      // Mostrar erro na tela
      const resultadoDiv = document.getElementById('resultado-teste');
      if (resultadoDiv) {
        resultadoDiv.innerHTML = `
          <h3>❌ Erro no teste da IA</h3>
          <p><strong>Erro:</strong> ${error}</p>
          <p>Verifique o console do navegador para mais detalhes.</p>
        `;
        resultadoDiv.style.color = 'red';
        resultadoDiv.style.border = '2px solid red';
        resultadoDiv.style.padding = '20px';
        resultadoDiv.style.borderRadius = '10px';
        resultadoDiv.style.backgroundColor = '#fff0f0';
      }
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>🧪 Teste da API do Gemini</h1>

      <div
        style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <p>
          <strong>Status:</strong> Testando API do Google Gemini
        </p>
        <p>
          <strong>Chave API:</strong> AIzaSyDtlj2yTwpjC_Q6AyrQVvbFKDWAvJWcb20
        </p>
        <p>
          <strong>Endpoint:</strong> https://generativelanguage.googleapis.com
        </p>
      </div>

      <button
        onClick={testarGemini}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '20px',
        }}
      >
        🚀 Testar API do Gemini
      </button>

      <div id="resultado-teste" style={{ minHeight: '100px' }}>
        <p>👆 Clique no botão acima para testar a API</p>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e7f3ff',
          borderRadius: '8px',
        }}
      >
        <h4>🔍 Como funciona este teste:</h4>
        <ol>
          <li>Configura a API key do Gemini</li>
          <li>Cria dados de teste com 4 tarefas</li>
          <li>Chama o serviço de IA para análise</li>
          <li>Mostra o resultado ou erro</li>
          <li>Verifique também o console do navegador (F12)</li>
        </ol>
      </div>
    </div>
  );
};

export default TestGeminiAPI;
