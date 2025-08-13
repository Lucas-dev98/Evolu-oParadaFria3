// Teste direto da API Gemini com a nova versão
const testeGeminiDireto = async () => {
  const apiKey = process.env.REACT_APP_GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Chave da API do Gemini não encontrada no arquivo .env');
  }

  const prompt =
    'Responda apenas com: {"status": "funcionando", "modelo": "gemini-1.5-flash"}';

  try {
    console.log('🧪 Testando API Gemini 1.5-flash...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    console.log('📡 Status da resposta:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Teste bem-sucedido!');
      console.log('📥 Resposta:', result);

      if (result.candidates && result.candidates[0]) {
        const texto = result.candidates[0].content.parts[0].text;
        console.log('📝 Texto da resposta:', texto);

        try {
          const json = JSON.parse(texto);
          console.log('🎯 JSON parseado:', json);
          return json;
        } catch (e) {
          console.log('⚠️ Resposta não é JSON válido, mas API funcionou');
          return { status: 'funcionando', modelo: 'gemini-1.5-flash' };
        }
      }
    } else {
      const error = await response.text();
      console.error('❌ Erro na API:', error);
      throw new Error(`Erro ${response.status}: ${error}`);
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    throw error;
  }
};

// Executar o teste automaticamente quando o arquivo for carregado
if (typeof window !== 'undefined') {
  (window as any).testeGeminiDireto = testeGeminiDireto;
  console.log('🎯 Teste da API Gemini carregado. Execute: testeGeminiDireto()');
}

export { testeGeminiDireto };
