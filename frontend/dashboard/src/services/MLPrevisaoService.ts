import { TarefaCronograma, CategoriaCronograma } from '../types/cronograma';

export interface PrevisaoConclusao {
  dataPrevisaoOriginal: Date;
  dataPrevisaoIA: Date;
  confianca: number;
  fatoresRisco: string[];
  recomendacoes: string[];
}

export interface AnaliseDesempenho {
  velocidadeMedia: number; // % por dia
  tendencia: 'acelerando' | 'desacelerando' | 'estavel';
  eficiencia: number; // 0-100
  desvioBaseline: number; // dias
}

export interface AnaliseRisco {
  nivel: 'baixo' | 'medio' | 'alto' | 'critico';
  probabilidadeAtraso: number; // 0-100
  impacto: number; // 0-100
  fatores: string[];
}

export class MLPrevisaoService {
  private historico: Map<string, Array<{ data: Date; progresso: number }>> =
    new Map();

  /**
   * Registra o progresso histórico de uma tarefa
   */
  registrarProgresso(
    tarefaId: string,
    progresso: number,
    data: Date = new Date()
  ) {
    if (!this.historico.has(tarefaId)) {
      this.historico.set(tarefaId, []);
    }

    const hist = this.historico.get(tarefaId)!;
    hist.push({ data, progresso });

    // Manter apenas últimos 30 registros
    if (hist.length > 30) {
      hist.shift();
    }
  }

  /**
   * Calcula a previsão de conclusão usando regressão linear simples
   */
  calcularPrevisao(tarefa: TarefaCronograma): PrevisaoConclusao {
    const hoje = new Date();
    const inicioTarefa = new Date(tarefa.inicio);
    const fimOriginal = new Date(tarefa.fim);
    const progressoAtual = tarefa.percentualCompleto;

    // Obter dados históricos
    const historico = this.historico.get(tarefa.id.toString()) || [];

    let dataPrevisaoIA: Date;
    let confianca: number;

    if (historico.length < 3) {
      // Sem dados suficientes, usar modelo simples
      const diasDecorridos =
        (hoje.getTime() - inicioTarefa.getTime()) / (1000 * 60 * 60 * 24);
      const velocidadeAtual = progressoAtual / Math.max(diasDecorridos, 1);
      const diasRestantes =
        (100 - progressoAtual) / Math.max(velocidadeAtual, 0.1);

      dataPrevisaoIA = new Date(
        hoje.getTime() + diasRestantes * 24 * 60 * 60 * 1000
      );
      confianca = 0.3;
    } else {
      // Usar regressão linear nos dados históricos
      const { velocidade, tendencia } = this.calcularTendencia(historico);
      const diasRestantes = (100 - progressoAtual) / Math.max(velocidade, 0.1);

      dataPrevisaoIA = new Date(
        hoje.getTime() + diasRestantes * 24 * 60 * 60 * 1000
      );
      confianca = Math.min(0.8, historico.length / 10);
    }

    // Analisar fatores de risco
    const fatoresRisco = this.identificarFatoresRisco(tarefa);
    const recomendacoes = this.gerarRecomendacoes(tarefa, fatoresRisco);

    return {
      dataPrevisaoOriginal: fimOriginal,
      dataPrevisaoIA,
      confianca,
      fatoresRisco,
      recomendacoes,
    };
  }

  /**
   * Calcula a tendência de progresso usando regressão linear
   */
  private calcularTendencia(
    historico: Array<{ data: Date; progresso: number }>
  ): { velocidade: number; tendencia: string } {
    if (historico.length < 2) return { velocidade: 1, tendencia: 'estavel' };

    // Preparar dados para regressão (x = dias desde início, y = progresso)
    const inicio = historico[0].data.getTime();
    const pontos = historico.map((h) => ({
      x: (h.data.getTime() - inicio) / (1000 * 60 * 60 * 24),
      y: h.progresso,
    }));

    // Calcular regressão linear
    const n = pontos.length;
    const sumX = pontos.reduce((sum, p) => sum + p.x, 0);
    const sumY = pontos.reduce((sum, p) => sum + p.y, 0);
    const sumXY = pontos.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = pontos.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    return {
      velocidade: Math.max(slope, 0.1),
      tendencia:
        slope > 1.2 ? 'acelerando' : slope < 0.8 ? 'desacelerando' : 'estavel',
    };
  }

  /**
   * Identifica fatores de risco para a tarefa
   */
  private identificarFatoresRisco(tarefa: TarefaCronograma): string[] {
    const fatores: string[] = [];
    const hoje = new Date();
    const fim = new Date(tarefa.fim);
    const diasParaFim =
      (fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);

    // Análise de tempo
    if (diasParaFim < 0) {
      fatores.push('⚠️ Tarefa já está atrasada');
    } else if (diasParaFim <= 3) {
      fatores.push('⏰ Prazo muito próximo');
    }

    // Análise de progresso
    const esperado = this.calcularProgressoEsperado(tarefa);
    const desvio = esperado - tarefa.percentualCompleto;

    if (desvio > 10) {
      fatores.push('📉 Progresso abaixo do esperado');
    } else if (desvio > 20) {
      fatores.push('🚨 Progresso muito atrasado');
    }

    // Análise de dependências (simulado)
    if (tarefa.subatividades && tarefa.subatividades.length > 0) {
      const subatividadesAtrasadas = tarefa.subatividades.filter((sub) => {
        const subFim = new Date(sub.fim);
        return subFim < hoje && sub.percentualCompleto < 100;
      });

      if (subatividadesAtrasadas.length > 0) {
        fatores.push(
          `🔗 ${subatividadesAtrasadas.length} dependência(s) atrasada(s)`
        );
      }
    }

    // Análise de recursos (baseado em categoria)
    if (tarefa.categoria === 'Mecânica' || tarefa.categoria === 'Elétrica') {
      fatores.push('🔧 Requer recursos especializados');
    }

    return fatores;
  }

  /**
   * Calcula o progresso esperado baseado no cronograma
   */
  private calcularProgressoEsperado(tarefa: TarefaCronograma): number {
    const inicio = new Date(tarefa.inicio);
    const fim = new Date(tarefa.fim);
    const hoje = new Date();

    if (hoje < inicio) return 0;
    if (hoje > fim) return 100;

    const totalDias =
      (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
    const diasDecorridos =
      (hoje.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);

    return (diasDecorridos / totalDias) * 100;
  }

  /**
   * Gera recomendações baseadas nos riscos identificados
   */
  private gerarRecomendacoes(
    tarefa: TarefaCronograma,
    fatoresRisco: string[]
  ): string[] {
    const recomendacoes: string[] = [];

    if (fatoresRisco.some((f) => f.includes('atrasada'))) {
      recomendacoes.push('🚀 Priorizar recursos para esta tarefa');
      recomendacoes.push('👥 Considerar alocação de equipe adicional');
    }

    if (fatoresRisco.some((f) => f.includes('dependência'))) {
      recomendacoes.push('🔄 Revisar dependências e sequenciamento');
      recomendacoes.push('⚡ Acelerar tarefas predecessoras');
    }

    if (fatoresRisco.some((f) => f.includes('progresso'))) {
      recomendacoes.push('📊 Reunião de acompanhamento urgente');
      recomendacoes.push('🎯 Redefinir escopo ou prazo');
    }

    if (fatoresRisco.some((f) => f.includes('especializados'))) {
      recomendacoes.push('🔧 Verificar disponibilidade de recursos');
      recomendacoes.push('📚 Considerar treinamento adicional');
    }

    // Recomendação padrão
    if (recomendacoes.length === 0) {
      recomendacoes.push('✅ Manter acompanhamento regular');
    }

    return recomendacoes;
  }

  /**
   * Analisa o desempenho geral de uma tarefa
   */
  analisarDesempenho(tarefa: TarefaCronograma): AnaliseDesempenho {
    const historico = this.historico.get(tarefa.id.toString()) || [];
    const { velocidade, tendencia } = this.calcularTendencia(historico);

    const inicio = new Date(tarefa.inicio);
    const fim = new Date(tarefa.fim);
    const fimBaseline = new Date(tarefa.fimBaseline);

    const desvioBaseline =
      (fim.getTime() - fimBaseline.getTime()) / (1000 * 60 * 60 * 24);
    const eficiencia = Math.max(0, Math.min(100, 100 - desvioBaseline * 2));

    return {
      velocidadeMedia: velocidade,
      tendencia: tendencia as any,
      eficiencia,
      desvioBaseline,
    };
  }

  /**
   * Calcula o risco geral de uma tarefa
   */
  calcularRisco(tarefa: TarefaCronograma): AnaliseRisco {
    const fatores = this.identificarFatoresRisco(tarefa);
    const hoje = new Date();
    const fim = new Date(tarefa.fim);
    const diasParaFim =
      (fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);

    let probabilidadeAtraso = 0;
    let nivel: 'baixo' | 'medio' | 'alto' | 'critico' = 'baixo';

    // Calcular probabilidade baseada em fatores
    if (diasParaFim < 0) probabilidadeAtraso += 100;
    else if (diasParaFim <= 3) probabilidadeAtraso += 60;
    else if (diasParaFim <= 7) probabilidadeAtraso += 30;

    const esperado = this.calcularProgressoEsperado(tarefa);
    const desvioProgresso = esperado - tarefa.percentualCompleto;
    probabilidadeAtraso += Math.min(40, desvioProgresso);

    if (fatores.length > 3) probabilidadeAtraso += 30;
    else if (fatores.length > 1) probabilidadeAtraso += 15;

    probabilidadeAtraso = Math.min(100, Math.max(0, probabilidadeAtraso));

    // Definir nível de risco
    if (probabilidadeAtraso >= 80) nivel = 'critico';
    else if (probabilidadeAtraso >= 60) nivel = 'alto';
    else if (probabilidadeAtraso >= 30) nivel = 'medio';
    else nivel = 'baixo';

    // Calcular impacto (baseado em duração e dependências)
    let impacto = 20; // Base
    const duracao =
      (fim.getTime() - new Date(tarefa.inicio).getTime()) /
      (1000 * 60 * 60 * 24);
    impacto += Math.min(40, duracao / 2); // Tarefas longas têm mais impacto

    if (tarefa.subatividades && tarefa.subatividades.length > 0) {
      impacto += 20; // Tarefas com dependências têm mais impacto
    }

    impacto = Math.min(100, impacto);

    return {
      nivel,
      probabilidadeAtraso,
      impacto,
      fatores,
    };
  }
}

// Singleton instance
export const mlPrevisaoService = new MLPrevisaoService();
