import { TarefaCronograma, CategoriaCronograma } from '../types/cronograma';

export interface AIInsight {
  id: string;
  tipo: 'crítico' | 'atenção' | 'oportunidade' | 'sucesso';
  título: string;
  descrição: string;
  impacto: 'alto' | 'médio' | 'baixo';
  recomendações: string[];
  métricas?: {
    valor: number;
    unidade: string;
    tendência: 'subindo' | 'descendo' | 'estável';
  };
  categoria: string;
}

export interface AIAnalysisResult {
  insights: AIInsight[];
  resumo: {
    statusGeral: 'crítico' | 'atenção' | 'normal' | 'excelente';
    progressoEsperado: number;
    progressoReal: number;
    diasAtraso: number;
    riscoProjeto: number; // 0-100
  };
  açõesRecomendadas: {
    prioridade: 'alta' | 'média' | 'baixa';
    ação: string;
    prazo: string;
    responsável: string;
  }[];
}

export class AIInsightsService {
  private static instance: AIInsightsService;

  public static getInstance(): AIInsightsService {
    if (!AIInsightsService.instance) {
      AIInsightsService.instance = new AIInsightsService();
    }
    return AIInsightsService.instance;
  }

  /**
   * Análise principal que processa todos os dados do projeto PFUS3
   */
  public analisarProjeto(categorias: CategoriaCronograma[]): AIAnalysisResult {
    const hoje = new Date('2025-08-17'); // Data atual
    const inicioBaseline = new Date('2025-05-31'); // Início PFUS3
    const fimBaseline = new Date('2025-08-14'); // Fim baseline PFUS3

    console.log('🤖 IA iniciando análise do projeto PFUS3...');

    const todasTarefas = this.extrairTodasTarefas(categorias);
    const insights: AIInsight[] = [];

    // Análise temporal do projeto
    const analiseTemporalResult = this.analiseTemporal(
      todasTarefas,
      hoje,
      inicioBaseline,
      fimBaseline
    );
    insights.push(...analiseTemporalResult.insights);

    // Análise de performance por categoria
    const analisePerformanceResult = this.analisePerformanceCategorias(
      categorias,
      hoje
    );
    insights.push(...analisePerformanceResult.insights);

    // Análise de riscos críticos
    const analiseRiscosResult = this.analiseRiscosCriticos(todasTarefas, hoje);
    insights.push(...analiseRiscosResult.insights);

    // Análise de dependências e gargalos
    const analiseDependenciasResult =
      this.analiseDependenciasGargalos(todasTarefas);
    insights.push(...analiseDependenciasResult.insights);

    // Análise de eficiência e produtividade
    const analiseEficienciaResult = this.analiseEficienciaProdutividade(
      todasTarefas,
      hoje
    );
    insights.push(...analiseEficienciaResult.insights);

    // Calcular resumo geral
    const resumo = this.calcularResumoGeral(todasTarefas, hoje, fimBaseline);

    // Gerar ações recomendadas baseadas nos insights
    const açõesRecomendadas = this.gerarAçõesRecomendadas(insights, resumo);

    console.log(
      '🤖 IA finalizou análise - Encontrados',
      insights.length,
      'insights'
    );

    return {
      insights: insights.sort(
        (a, b) =>
          this.getPrioridadeNumerica(a.impacto) -
          this.getPrioridadeNumerica(b.impacto)
      ),
      resumo,
      açõesRecomendadas,
    };
  }

  private extrairTodasTarefas(
    categorias: CategoriaCronograma[]
  ): TarefaCronograma[] {
    const todas: TarefaCronograma[] = [];
    categorias.forEach((categoria) => {
      if (categoria.tarefas) {
        categoria.tarefas.forEach((tarefa) => {
          todas.push(tarefa);
          if (tarefa.subatividades) {
            todas.push(...tarefa.subatividades);
          }
        });
      }
    });
    return todas;
  }

  private analiseTemporal(
    tarefas: TarefaCronograma[],
    hoje: Date,
    inicioBaseline: Date,
    fimBaseline: Date
  ) {
    const insights: AIInsight[] = [];

    // Análise de atraso do projeto
    const diasAposBaseline = Math.ceil(
      (hoje.getTime() - fimBaseline.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diasAposBaseline > 0) {
      insights.push({
        id: 'atraso-projeto',
        tipo: 'crítico',
        título: 'Projeto PFUS3 em Atraso Crítico',
        descrição: `O projeto ultrapassou a data baseline em ${diasAposBaseline} dias. A parada deveria ter sido concluída em 14/08/2025.`,
        impacto: 'alto',
        categoria: 'Cronograma',
        recomendações: [
          'Acelerar atividades críticas restantes',
          'Revisar escopo para priorizar itens essenciais',
          'Aumentar recursos nas equipes críticas',
          'Implementar trabalho em turnos estendidos',
        ],
        métricas: {
          valor: diasAposBaseline,
          unidade: 'dias',
          tendência: 'subindo',
        },
      });
    }

    // Análise de progresso vs tempo esperado
    const tempoTotalBaseline =
      (fimBaseline.getTime() - inicioBaseline.getTime()) /
      (1000 * 60 * 60 * 24);
    const tempoDecorrido =
      (hoje.getTime() - inicioBaseline.getTime()) / (1000 * 60 * 60 * 24);
    const progressoEsperado = Math.min(
      100,
      (tempoDecorrido / tempoTotalBaseline) * 100
    );

    const progressoReal =
      tarefas.reduce((acc, t) => acc + t.percentualCompleto, 0) /
      tarefas.length;
    const desvioProgresso = progressoReal - progressoEsperado;

    if (desvioProgresso < -20) {
      insights.push({
        id: 'progresso-atrasado',
        tipo: 'crítico',
        título: 'Progresso Significativamente Abaixo do Esperado',
        descrição: `Progresso real (${progressoReal.toFixed(1)}%) está ${Math.abs(desvioProgresso).toFixed(1)}% abaixo do esperado (${progressoEsperado.toFixed(1)}%).`,
        impacto: 'alto',
        categoria: 'Performance',
        recomendações: [
          'Revisar metodologia de execução',
          'Identificar e remover impedimentos',
          'Realocar recursos para atividades atrasadas',
          'Implementar reuniões diárias de acompanhamento',
        ],
      });
    }

    return { insights };
  }

  private analisePerformanceCategorias(
    categorias: CategoriaCronograma[],
    hoje: Date
  ) {
    const insights: AIInsight[] = [];

    const performanceCateg = categorias
      .map((cat) => {
        const tarefas = cat.tarefas || [];
        const progressoMedio =
          tarefas.reduce((acc, t) => acc + t.percentualCompleto, 0) /
          Math.max(tarefas.length, 1);
        const tarefasAtrasadas = tarefas.filter((t) => {
          const fim = new Date(t.fim);
          return fim < hoje && t.percentualCompleto < 100;
        }).length;

        return {
          nome: cat.nome,
          progresso: progressoMedio,
          tarefasAtrasadas,
          totalTarefas: tarefas.length,
          eficiencia: tarefasAtrasadas / Math.max(tarefas.length, 1),
        };
      })
      .filter((c) => c.totalTarefas > 0);

    // Identificar categoria com pior performance
    const piorCategoria = performanceCateg.reduce((a, b) =>
      a.eficiencia > b.eficiencia ? a : b
    );

    if (piorCategoria.eficiencia > 0.3) {
      // Mais de 30% das tarefas atrasadas
      insights.push({
        id: 'categoria-problematica',
        tipo: 'crítico',
        título: `Categoria "${piorCategoria.nome}" com Performance Crítica`,
        descrição: `${piorCategoria.tarefasAtrasadas} de ${piorCategoria.totalTarefas} tarefas estão atrasadas (${(piorCategoria.eficiencia * 100).toFixed(1)}%).`,
        impacto: 'alto',
        categoria: piorCategoria.nome,
        recomendações: [
          `Reforçar equipe de ${piorCategoria.nome}`,
          'Revisar metodologia específica desta categoria',
          'Implementar supervisão dedicada',
          'Verificar disponibilidade de materiais/equipamentos',
        ],
      });
    }

    // Identificar categoria com melhor performance
    const melhorCategoria = performanceCateg.reduce((a, b) =>
      a.progresso > b.progresso ? a : b
    );

    if (melhorCategoria.progresso > 80) {
      insights.push({
        id: 'categoria-excelente',
        tipo: 'sucesso',
        título: `Categoria "${melhorCategoria.nome}" com Excelente Performance`,
        descrição: `Progresso de ${melhorCategoria.progresso.toFixed(1)}% demonstra excelente execução.`,
        impacto: 'médio',
        categoria: melhorCategoria.nome,
        recomendações: [
          'Replicar metodologia para outras categorias',
          'Documentar melhores práticas',
          'Considerar remanejamento de recursos experientes',
        ],
      });
    }

    return { insights };
  }

  private analiseRiscosCriticos(tarefas: TarefaCronograma[], hoje: Date) {
    const insights: AIInsight[] = [];

    // Identificar tarefas com risco iminente
    const tarefasRiscoIminente = tarefas.filter((t) => {
      const fim = new Date(t.fim);
      const diasRestantes = Math.ceil(
        (fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
      );
      return (
        diasRestantes <= 3 && diasRestantes >= 0 && t.percentualCompleto < 100
      );
    });

    if (tarefasRiscoIminente.length > 0) {
      insights.push({
        id: 'risco-iminente',
        tipo: 'crítico',
        título: 'Tarefas com Prazo Crítico Iminente',
        descrição: `${tarefasRiscoIminente.length} tarefas vencem nos próximos 3 dias e ainda não foram concluídas.`,
        impacto: 'alto',
        categoria: 'Risco',
        recomendações: [
          'Priorizar imediatamente estas tarefas',
          'Alocar recursos extras',
          'Trabalho em regime de urgência',
          'Comunicar stakeholders sobre situação crítica',
        ],
        métricas: {
          valor: tarefasRiscoIminente.length,
          unidade: 'tarefas',
          tendência: 'subindo',
        },
      });
    }

    // Análise de tarefas estagnadas
    const tarefasEstagnadas = tarefas.filter((t) => {
      const inicio = new Date(t.inicio);
      const diasDesdeInicio = Math.ceil(
        (hoje.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diasDesdeInicio > 7 && t.percentualCompleto === 0;
    });

    if (tarefasEstagnadas.length > 0) {
      insights.push({
        id: 'tarefas-estagnadas',
        tipo: 'atenção',
        título: 'Tarefas Não Iniciadas Há Mais de 7 Dias',
        descrição: `${tarefasEstagnadas.length} tarefas deveriam ter iniciado mas permanecem em 0% de progresso.`,
        impacto: 'médio',
        categoria: 'Execução',
        recomendações: [
          'Verificar impedimentos para início',
          'Confirmar disponibilidade de recursos',
          'Revisar dependências e pré-requisitos',
          'Estabelecer datas de início forçadas',
        ],
      });
    }

    return { insights };
  }

  private analiseDependenciasGargalos(tarefas: TarefaCronograma[]) {
    const insights: AIInsight[] = [];

    // Análise de dependências complexas
    const tarefasComMuitasDependencias = tarefas.filter((t) => {
      const deps =
        t.predecessores?.split(',').filter((d) => d.trim()).length || 0;
      return deps > 3;
    });

    if (tarefasComMuitasDependencias.length > 0) {
      insights.push({
        id: 'dependencias-complexas',
        tipo: 'atenção',
        título: 'Tarefas com Dependências Complexas Identificadas',
        descrição: `${tarefasComMuitasDependencias.length} tarefas possuem mais de 3 dependências, aumentando risco de atrasos em cascata.`,
        impacto: 'médio',
        categoria: 'Dependências',
        recomendações: [
          'Simplificar dependências quando possível',
          'Monitorar closely precedentes críticos',
          'Preparar planos de contingência',
          'Considerar execução paralela onde viável',
        ],
      });
    }

    return { insights };
  }

  private analiseEficienciaProdutividade(
    tarefas: TarefaCronograma[],
    hoje: Date
  ) {
    const insights: AIInsight[] = [];

    // Análise de velocidade de execução
    const tarefasEmAndamento = tarefas.filter(
      (t) => t.percentualCompleto > 0 && t.percentualCompleto < 100
    );

    let velocidadeMedia = 0;
    if (tarefasEmAndamento.length > 0) {
      velocidadeMedia =
        tarefasEmAndamento.reduce((acc, t) => {
          const inicio = new Date(t.inicio);
          const diasDesdeInicio = Math.max(
            1,
            Math.ceil(
              (hoje.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
            )
          );
          return acc + t.percentualCompleto / diasDesdeInicio;
        }, 0) / tarefasEmAndamento.length;
    }

    if (velocidadeMedia < 5) {
      // Menos de 5% por dia em média
      insights.push({
        id: 'baixa-velocidade',
        tipo: 'atenção',
        título: 'Velocidade de Execução Abaixo do Ideal',
        descrição: `Velocidade média de execução é ${velocidadeMedia.toFixed(1)}%/dia, indicando possível subutilização de recursos.`,
        impacto: 'médio',
        categoria: 'Produtividade',
        recomendações: [
          'Analisar gargalos na execução',
          'Otimizar processos de trabalho',
          'Verificar adequação de recursos',
          'Implementar métricas de produtividade diárias',
        ],
      });
    }

    return { insights };
  }

  private calcularResumoGeral(
    tarefas: TarefaCronograma[],
    hoje: Date,
    fimBaseline: Date
  ) {
    const progressoReal =
      tarefas.reduce((acc, t) => acc + t.percentualCompleto, 0) /
      tarefas.length;
    const diasAtraso = Math.max(
      0,
      Math.ceil(
        (hoje.getTime() - fimBaseline.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    const tarefasAtrasadas = tarefas.filter((t) => {
      const fim = new Date(t.fim);
      return fim < hoje && t.percentualCompleto < 100;
    }).length;

    const riscoProjeto = Math.min(
      100,
      diasAtraso * 10 +
        (tarefasAtrasadas / tarefas.length) * 50 +
        (100 - progressoReal) * 0.5
    );

    let statusGeral: 'crítico' | 'atenção' | 'normal' | 'excelente';
    if (riscoProjeto > 70) statusGeral = 'crítico';
    else if (riscoProjeto > 40) statusGeral = 'atenção';
    else if (riscoProjeto > 20) statusGeral = 'normal';
    else statusGeral = 'excelente';

    return {
      statusGeral,
      progressoEsperado: 100, // Deveria estar 100% na baseline
      progressoReal: Math.round(progressoReal),
      diasAtraso,
      riscoProjeto: Math.round(riscoProjeto),
    };
  }

  private gerarAçõesRecomendadas(insights: AIInsight[], resumo: any) {
    const ações: any[] = [];

    // Ações baseadas no status geral
    if (resumo.statusGeral === 'crítico') {
      ações.push({
        prioridade: 'alta',
        ação: 'Implementar sala de crise para gestão de projeto',
        prazo: 'Imediato',
        responsável: 'Gerente de Projeto',
      });

      ações.push({
        prioridade: 'alta',
        ação: 'Revisar e otimizar cronograma com foco no crítico',
        prazo: '1 dia',
        responsável: 'Planejamento',
      });
    }

    // Ações específicas baseadas nos insights críticos
    const insightsCriticos = insights.filter((i) => i.tipo === 'crítico');
    if (insightsCriticos.length > 0) {
      ações.push({
        prioridade: 'alta',
        ação: 'Reunião emergencial com stakeholders',
        prazo: 'Hoje',
        responsável: 'Sponsor do Projeto',
      });
    }

    // Ações de melhoria contínua
    ações.push({
      prioridade: 'média',
      ação: 'Implementar dashboard de acompanhamento em tempo real',
      prazo: '3 dias',
      responsável: 'Equipe de TI',
    });

    return ações;
  }

  private getPrioridadeNumerica(impacto: 'alto' | 'médio' | 'baixo'): number {
    switch (impacto) {
      case 'alto':
        return 1;
      case 'médio':
        return 2;
      case 'baixo':
        return 3;
      default:
        return 4;
    }
  }
}
