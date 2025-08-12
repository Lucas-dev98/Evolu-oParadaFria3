// Interfaces para Análise de IA
export interface Insight {
  tipo: 'risco' | 'oportunidade' | 'recomendacao' | 'alerta';
  titulo: string;
  descricao: string;
  prioridade: 'alta' | 'media' | 'baixa';
  impacto: number; // 1-10
  acoes: string[];
}

export interface Predicoes {
  probabilidadeAtraso: number; // 0-100%
  datasPrevisao: string[];
  recursosEmRisco: string[];
}

export interface AIAnalysis {
  resumo: string;
  pontuacao: number; // 0-100
  insights: Insight[];
  predicoes: Predicoes;
}

export type AIProvider =
  | 'gemini'
  | 'openai'
  | 'huggingface'
  | 'claude'
  | 'local';

export class AIAnalysisService {
  private provider: AIProvider = 'gemini';
  private apiKey: string = 'AIzaSyDtlj2yTwpjC_Q6AyrQVvbFKDWAvJWcb20'; // Chave padrão configurada

  setProvider(provider: AIProvider, apiKey?: string) {
    this.provider = provider;
    if (apiKey) {
      this.apiKey = apiKey;
    }
    console.log(
      `🤖 Provedor configurado: ${provider}${apiKey ? ' com chave personalizada' : ' com chave padrão'}`
    );
  }

  // Método para usar Gemini diretamente sem configuração
  async analisarComGeminiDireto(
    cronograma: any,
    categorias: any,
    resumo: any
  ): Promise<AIAnalysis> {
    // Garantir que está usando Gemini com a chave padrão
    this.provider = 'gemini';
    if (!this.apiKey) {
      this.apiKey = 'AIzaSyDtlj2yTwpjC_Q6AyrQVvbFKDWAvJWcb20';
    }

    console.log('🚀 Análise direta com Gemini (sem configuração manual)');
    return this.analisar(cronograma, categorias, resumo);
  }

  async analisar(
    cronograma: any,
    categorias: any,
    resumo: any
  ): Promise<AIAnalysis> {
    const dadosFormatados = {
      totalTarefas: cronograma?.length || 0,
      concluidas: Math.round(
        ((cronograma?.filter((t: any) => t.status === 'Concluída')?.length ||
          0) /
          Math.max(cronograma?.length || 1, 1)) *
          100
      ),
      tarefasConcluidas:
        cronograma?.filter((t: any) => t.status === 'Concluída')?.length || 0,
      emAndamento:
        cronograma?.filter((t: any) => t.status === 'Em Andamento')?.length ||
        0,
      pendentes:
        cronograma?.filter((t: any) => t.status === 'Pendente')?.length || 0,
      atrasadas:
        cronograma?.filter((t: any) => t.status === 'Atrasada')?.length || 0,
      criticas:
        cronograma?.filter((t: any) => t.prioridade === 'Alta')?.length || 0,
      categorias: categorias?.length || 0,
    };

    console.log('🤖 Provedor selecionado:', this.provider);
    console.log('📊 Dados formatados:', dadosFormatados);

    switch (this.provider) {
      case 'gemini':
        return this.analisarComGemini(dadosFormatados);
      case 'openai':
        return this.analisarComOpenAI(dadosFormatados);
      case 'huggingface':
        return this.analisarComHuggingFace(dadosFormatados);
      case 'claude':
        return this.analisarComClaude(dadosFormatados);
      default:
        return this.analiseLocal(dadosFormatados);
    }
  }

  /**
   * Google Gemini - GRATUITA
   */
  private async analisarComGemini(dados: any): Promise<AIAnalysis> {
    if (!this.apiKey) {
      console.log('❌ Chave API do Gemini não configurada');
      return this.analiseLocal(dados);
    }

    console.log('🤖 Iniciando análise com Gemini...');
    console.log('🆕 Usando modelo gemini-1.5-flash (API v1beta)');
    console.log('📊 Dados para análise:', dados);

    const prompt = `
Você é um especialista em gestão de projetos industriais. Analise este cronograma do projeto PFUS3 2025 (Preparação de Parada de Forno) e forneça insights práticos e acionáveis.

DADOS DO PROJETO PFUS3 2025:
- Total de tarefas: ${dados.totalTarefas}
- Progresso geral: ${dados.concluidas}%
- Tarefas concluídas: ${dados.tarefasConcluidas}
- Em andamento: ${dados.emAndamento}
- Pendentes: ${dados.pendentes}
- Atrasadas: ${dados.atrasadas}
- Críticas: ${dados.criticas}
- Categorias principais: ${dados.categorias}

CONTEXTO: Este é um projeto real de preparação para parada de forno industrial, incluindo mobilização de equipes, preparação de equipamentos, logística, refratário, elétrica e mecânica.

INSTRUÇÃO CRÍTICA: Responda EXCLUSIVAMENTE com um JSON válido, sem texto adicional antes ou depois. Use o formato exato abaixo:

{
  "resumo": "Análise executiva em português de no máximo 120 caracteres sobre o status do projeto",
  "pontuacao": 85,
  "insights": [
    {
      "tipo": "risco",
      "titulo": "Título específico do insight",
      "descricao": "Descrição detalhada e acionável do problema ou oportunidade identificada",
      "prioridade": "alta",
      "impacto": 9,
      "acoes": ["Ação específica 1", "Ação específica 2", "Ação específica 3"]
    }
  ],
  "predicoes": {
    "probabilidadeAtraso": 30,
    "datasPrevisao": ["2025-09-18"],
    "recursosEmRisco": ["Cronograma", "Equipe"]
  }
}`;

    try {
      console.log('🔗 Fazendo requisição para Gemini API...');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      console.log('📡 Resposta HTTP:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na API Gemini:', errorText);

        // Verificar se é problema de modelo
        if (response.status === 404 && errorText.includes('gemini-pro')) {
          console.log(
            '⚠️ Modelo gemini-pro descontinuado, usando gemini-1.5-flash'
          );
          throw new Error(
            `API Gemini Error 404: Modelo não encontrado. Usando versão atualizada.`
          );
        }

        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📥 Resposta completa do Gemini:', result);

      if (!result.candidates || !result.candidates[0]) {
        console.error('❌ Resposta inválida do Gemini:', result);
        throw new Error('Resposta inválida da API');
      }

      const textoResposta = result.candidates[0].content.parts[0].text;
      console.log('📝 Texto da resposta:', textoResposta);

      // Tentar extrair JSON da resposta
      const jsonMatch = textoResposta.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedResult = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON parseado com sucesso:', parsedResult);
          return parsedResult;
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse do JSON:', parseError);
          console.log('🔍 JSON que falhou:', jsonMatch[0]);
        }
      }

      console.log(
        '⚠️ Não foi possível extrair JSON válido, usando análise local'
      );
      return this.analiseLocal(dados);
    } catch (error) {
      console.error('❌ Erro geral na análise Gemini:', error);
      return this.analiseLocal(dados);
    }
  }

  /**
   * OpenAI GPT - Pago após créditos iniciais
   */
  private async analisarComOpenAI(dados: any): Promise<AIAnalysis> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Analise este cronograma e retorne um JSON com insights: ${JSON.stringify(dados)}`,
          },
        ],
        max_tokens: 1500,
      }),
    });

    const result = await response.json();
    return JSON.parse(result.choices[0].message.content);
  }

  /**
   * Hugging Face - GRATUITA (limitada)
   */
  private async analisarComHuggingFace(dados: any): Promise<AIAnalysis> {
    // API gratuita limitada
    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        method: 'POST',
        body: JSON.stringify({
          inputs: `Analise cronograma: ${JSON.stringify(dados)}`,
        }),
      }
    );

    const result = await response.json();
    return this.processarHuggingFaceResponse(result, dados);
  }

  /**
   * Anthropic Claude - Pago
   */
  private async analisarComClaude(dados: any): Promise<AIAnalysis> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `Analise este cronograma: ${JSON.stringify(dados)}`,
          },
        ],
      }),
    });

    const result = await response.json();
    return JSON.parse(result.content[0].text);
  }

  /**
   * Análise local usando regras simples (GRATUITA - SEMPRE FUNCIONA)
   */
  private analiseLocal(dados: any): AIAnalysis {
    console.log('🏠 Executando análise local...');

    const progressoPercentual = dados.concluidas || 0;
    const pontuacao = this.calcularPontuacao(dados);
    const insights = this.gerarInsightsLocais(dados);
    const predicoes = this.gerarPredicoes(dados);

    return {
      resumo: `Projeto com ${progressoPercentual}% concluído. Status: ${pontuacao >= 80 ? 'Excelente' : pontuacao >= 60 ? 'Bom' : pontuacao >= 40 ? 'Atenção' : 'Crítico'}`,
      pontuacao,
      insights,
      predicoes,
    };
  }

  private calcularPontuacao(dados: any): number {
    let pontuacao = dados.concluidas || 0; // Progresso base

    // Penalidade por tarefas atrasadas
    if (dados.atrasadas > 0) {
      pontuacao -= (dados.atrasadas / dados.totalTarefas) * 30;
    }

    // Bônus por tarefas em andamento
    if (dados.emAndamento > 0) {
      pontuacao += (dados.emAndamento / dados.totalTarefas) * 10;
    }

    return Math.max(0, Math.min(100, Math.round(pontuacao)));
  }

  private gerarInsightsLocais(dados: any): Insight[] {
    const insights: Insight[] = [];

    // Insight sobre atrasos
    if (dados.atrasadas > 0) {
      insights.push({
        tipo: 'risco',
        titulo: `${dados.atrasadas} tarefas atrasadas`,
        descricao: `Existem tarefas em atraso que podem impactar o cronograma geral do projeto.`,
        prioridade:
          dados.atrasadas > dados.totalTarefas * 0.2 ? 'alta' : 'media',
        impacto: Math.min(10, dados.atrasadas),
        acoes: [
          'Revisar causas dos atrasos',
          'Realocar recursos se necessário',
          'Atualizar cronograma',
        ],
      });
    }

    // Insight sobre progresso
    if (dados.concluidas < 20) {
      insights.push({
        tipo: 'alerta',
        titulo: 'Progresso inicial baixo',
        descricao:
          'O projeto está no início. É importante estabelecer momentum.',
        prioridade: 'media',
        impacto: 6,
        acoes: [
          'Focar em tarefas críticas',
          'Aumentar frequência de reuniões',
          'Verificar bloqueadores',
        ],
      });
    } else if (dados.concluidas > 80) {
      insights.push({
        tipo: 'oportunidade',
        titulo: 'Projeto próximo da conclusão',
        descricao: 'Excelente progresso! Mantenha o ritmo para finalizar.',
        prioridade: 'baixa',
        impacto: 8,
        acoes: [
          'Revisar entregas finais',
          'Preparar documentação',
          'Planejar encerramento',
        ],
      });
    }

    // Insight sobre tarefas críticas
    if (dados.criticas > 0) {
      insights.push({
        tipo: 'recomendacao',
        titulo: `${dados.criticas} tarefas críticas`,
        descricao: 'Tarefas de alta prioridade requerem atenção especial.',
        prioridade: 'alta',
        impacto: 9,
        acoes: [
          'Alocar melhores recursos',
          'Monitoramento diário',
          'Plano de contingência',
        ],
      });
    }

    return insights;
  }

  private gerarPredicoes(dados: any): Predicoes {
    const hoje = new Date();
    const probabilidadeAtraso =
      dados.atrasadas > 0
        ? Math.min(80, (dados.atrasadas / dados.totalTarefas) * 100 + 20)
        : Math.max(10, 50 - dados.concluidas);

    const datasPrevistas = [];
    for (let i = 1; i <= 3; i++) {
      const futuro = new Date(hoje);
      futuro.setMonth(futuro.getMonth() + i);
      datasPrevistas.push(futuro.toISOString().split('T')[0]);
    }

    const recursosEmRisco = [];
    if (dados.atrasadas > 0) recursosEmRisco.push('Cronograma');
    if (dados.criticas > dados.totalTarefas * 0.3)
      recursosEmRisco.push('Recursos');
    if (dados.pendentes > dados.emAndamento) recursosEmRisco.push('Execução');

    return {
      probabilidadeAtraso: Math.round(probabilidadeAtraso),
      datasPrevisao: datasPrevistas,
      recursosEmRisco:
        recursosEmRisco.length > 0
          ? recursosEmRisco
          : ['Nenhum risco identificado'],
    };
  }

  private processarHuggingFaceResponse(result: any, dados: any): AIAnalysis {
    // Como o HuggingFace pode retornar texto livre, criamos uma análise baseada nos dados
    return this.analiseLocal(dados);
  }
}

// Singleton
export const aiService = new AIAnalysisService();
