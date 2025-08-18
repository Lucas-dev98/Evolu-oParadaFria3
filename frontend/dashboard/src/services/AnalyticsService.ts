import { CategoriaCronograma, TarefaCronograma } from '../types/cronograma';

export interface MetricasAnalytics {
  // Métricas Gerais do Projeto
  totalTarefas: number;
  tarefasConcluidas: number;
  tarefasEmAndamento: number;
  tarefasPendentes: number;
  progressoGeralFisico: number;
  progressoGeralCompleto: number;

  // Análise de Prazos
  tarefasNoPrazo: number;
  tarefasAtrasadas: number;
  tarefasCriticas: number;
  diasAteVencimento: number;

  // Análise por Categoria
  categoriaComMelhorDesempenho: string;
  categoriaComPiorDesempenho: string;

  // Recursos e Custos (simulados baseados em duração)
  horasEstimadas: number;
  horasRealizadas: number;
  eficienciaGeral: number;

  // Previsões
  dataEstimadaConclusao: Date;
  riscoAtraso: 'baixo' | 'medio' | 'alto' | 'critico';
}

export interface AnaliseCategoria {
  nome: string;
  progressoFisico: number;
  progressoCompleto: number;
  tarefasConcluidas: number;
  totalTarefas: number;
  horasEstimadas: number;
  horasRealizadas: number;
  eficiencia: number;
  status: 'em_dia' | 'atencao' | 'atrasado' | 'critico';
  dataInicioMaisProxima: Date;
  dataFimMaisDistante: Date;
}

export interface TarefaCritica {
  id: number;
  nome: string;
  categoria: string;
  progressoCompleto: number;
  progressoFisico: number;
  dataInicio: Date;
  dataFim: Date;
  diasRestantes: number;
  riscoAtraso: number; // 0-100
  predecessores: string[];
  impacto: 'baixo' | 'medio' | 'alto' | 'critico';
}

class AnalyticsService {
  /**
   * Calcula métricas gerais do projeto baseado nos dados reais
   */
  calcularMetricasGerais(categorias: CategoriaCronograma[]): MetricasAnalytics {
    console.log(
      '🔍 AnalyticsService.calcularMetricasGerais - entrada:',
      categorias?.length || 0,
      'categorias'
    );

    const todasTarefas = this.obterTodasTarefas(categorias);
    console.log('📝 Todas as tarefas obtidas:', todasTarefas.length, 'tarefas');

    const hoje = new Date();

    // Métricas básicas
    const totalTarefas = todasTarefas.length;
    const tarefasConcluidas = todasTarefas.filter(
      (t) => t.percentualCompleto >= 100
    ).length;
    const tarefasEmAndamento = todasTarefas.filter(
      (t) => t.percentualCompleto > 0 && t.percentualCompleto < 100
    ).length;
    const tarefasPendentes = todasTarefas.filter(
      (t) => t.percentualCompleto === 0
    ).length;

    // Progresso médio
    const progressoGeralCompleto =
      totalTarefas > 0
        ? todasTarefas.reduce((acc, t) => acc + t.percentualCompleto, 0) /
          totalTarefas
        : 0;

    const progressoGeralFisico =
      totalTarefas > 0
        ? todasTarefas.reduce((acc, t) => acc + t.percentualFisico, 0) /
          totalTarefas
        : 0;

    // Análise de prazos
    const tarefasComData = todasTarefas.filter((t) => t.fim);
    let tarefasAtrasadas = 0;
    let tarefasCriticas = 0;
    let tarefasNoPrazo = 0;

    tarefasComData.forEach((tarefa) => {
      const dataFim = new Date(tarefa.fim);
      const diasRestantes = Math.ceil(
        (dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (tarefa.percentualCompleto < 100 && diasRestantes < 0) {
        tarefasAtrasadas++;
      } else if (tarefa.percentualCompleto < 100 && diasRestantes <= 7) {
        tarefasCriticas++;
      } else {
        tarefasNoPrazo++;
      }
    });

    // Data final do projeto (maior data de fim das tarefas)
    const dataFinalTarefas = new Date(
      Math.max(...tarefasComData.map((t) => new Date(t.fim).getTime()))
    );

    const diasAteVencimento = Math.ceil(
      (dataFinalTarefas.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Análise de performance por categoria
    const performanceCateg = categorias
      .map((cat) => ({
        nome: cat.nome,
        progresso: this.calcularProgressoCategoria(cat),
      }))
      .filter((c) => c.progresso > 0);

    const melhorCategoria =
      performanceCateg.length > 0
        ? performanceCateg.reduce((a, b) => (a.progresso > b.progresso ? a : b))
            .nome
        : 'N/A';

    const piorCategoria =
      performanceCateg.length > 0
        ? performanceCateg.reduce((a, b) => (a.progresso < b.progresso ? a : b))
            .nome
        : 'N/A';

    // Estimativas de horas baseadas na duração
    const horasEstimadas = this.calcularHorasEstimadas(todasTarefas);
    const horasRealizadas = horasEstimadas * (progressoGeralFisico / 100);

    // Calcular eficiência: Progresso Real vs Progresso Esperado
    // Usando uma fórmula mais robusta baseada no tempo decorrido vs progresso
    const agora = new Date();
    const dataInicialProjeto = new Date('2025-05-31'); // Data início PFUS3
    const dataFinalProjetoPFUS3 = new Date('2025-10-14'); // Data fim PFUS3

    const tempoTotalProjeto =
      dataFinalProjetoPFUS3.getTime() - dataInicialProjeto.getTime();
    const tempoDecorrido = agora.getTime() - dataInicialProjeto.getTime();
    const progressoEsperado = Math.min(
      100,
      Math.max(0, (tempoDecorrido / tempoTotalProjeto) * 100)
    );

    // Eficiência = Progresso Real / Progresso Esperado * 100
    const eficienciaGeral =
      progressoEsperado > 0
        ? Math.min(200, (progressoGeralFisico / progressoEsperado) * 100) // Cap em 200% para evitar valores absurdos
        : progressoGeralFisico; // Se ainda não começou, usar progresso atual

    console.log('📊 Cálculo de Eficiência:', {
      progressoGeralFisico: progressoGeralFisico.toFixed(1) + '%',
      progressoEsperado: progressoEsperado.toFixed(1) + '%',
      eficienciaCalculada: eficienciaGeral.toFixed(1) + '%',
      tempoDecorrido:
        Math.round(tempoDecorrido / (1000 * 60 * 60 * 24)) + ' dias',
      tempoTotal:
        Math.round(tempoTotalProjeto / (1000 * 60 * 60 * 24)) + ' dias',
    });

    // Previsão de conclusão baseada no ritmo atual
    const dataEstimadaConclusao = this.calcularDataEstimadaConclusao(
      todasTarefas,
      progressoGeralCompleto
    );

    // Análise de risco
    const riscoAtraso = this.calcularRiscoAtraso(
      tarefasAtrasadas,
      tarefasCriticas,
      totalTarefas,
      progressoGeralCompleto
    );

    return {
      totalTarefas,
      tarefasConcluidas,
      tarefasEmAndamento,
      tarefasPendentes,
      progressoGeralFisico,
      progressoGeralCompleto,
      tarefasNoPrazo,
      tarefasAtrasadas,
      tarefasCriticas,
      diasAteVencimento,
      categoriaComMelhorDesempenho: melhorCategoria,
      categoriaComPiorDesempenho: piorCategoria,
      horasEstimadas,
      horasRealizadas,
      eficienciaGeral,
      dataEstimadaConclusao,
      riscoAtraso,
    };
  }

  /**
   * Analisa cada categoria individualmente
   */
  analisarCategorias(categorias: CategoriaCronograma[]): AnaliseCategoria[] {
    return categorias.map((categoria) => {
      const tarefas = this.obterTarefasCategoria(categoria);

      if (tarefas.length === 0) {
        return {
          nome: categoria.nome,
          progressoFisico: 0,
          progressoCompleto: 0,
          tarefasConcluidas: 0,
          totalTarefas: 0,
          horasEstimadas: 0,
          horasRealizadas: 0,
          eficiencia: 0,
          status: 'em_dia',
          dataInicioMaisProxima: new Date(),
          dataFimMaisDistante: new Date(),
        };
      }

      const totalTarefas = tarefas.length;
      const tarefasConcluidas = tarefas.filter(
        (t) => t.percentualCompleto >= 100
      ).length;
      const progressoCompleto =
        tarefas.reduce((acc, t) => acc + t.percentualCompleto, 0) /
        totalTarefas;
      const progressoFisico =
        tarefas.reduce((acc, t) => acc + t.percentualFisico, 0) / totalTarefas;

      const horasEstimadas = this.calcularHorasEstimadas(tarefas);
      const horasRealizadas = horasEstimadas * (progressoFisico / 100);

      // Calcular eficiência correta: Progresso Físico vs Progresso Planejado
      const progressoPlanejado =
        tarefas.reduce((acc, t) => acc + t.percentualReplanejamento, 0) /
        totalTarefas;

      const eficiencia =
        progressoPlanejado > 0
          ? (progressoFisico / progressoPlanejado) * 100
          : 0;

      // Datas extremas
      const datasInicio = tarefas
        .map((t) => new Date(t.inicio))
        .filter((d) => !isNaN(d.getTime()));
      const datasFim = tarefas
        .map((t) => new Date(t.fim))
        .filter((d) => !isNaN(d.getTime()));

      const dataInicioMaisProxima =
        datasInicio.length > 0
          ? new Date(Math.min(...datasInicio.map((d) => d.getTime())))
          : new Date();

      const dataFimMaisDistante =
        datasFim.length > 0
          ? new Date(Math.max(...datasFim.map((d) => d.getTime())))
          : new Date();

      // Status da categoria
      const hoje = new Date();
      const tarefasAtrasadas = tarefas.filter((t) => {
        const fim = new Date(t.fim);
        return t.percentualCompleto < 100 && fim < hoje;
      }).length;

      const tarefasCriticas = tarefas.filter((t) => {
        const fim = new Date(t.fim);
        const diasRestantes =
          (fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
        return (
          t.percentualCompleto < 100 && diasRestantes <= 7 && diasRestantes >= 0
        );
      }).length;

      let status: 'em_dia' | 'atencao' | 'atrasado' | 'critico' = 'em_dia';
      if (tarefasAtrasadas > 0) status = 'atrasado';
      else if (tarefasCriticas > 0) status = 'critico';
      else if (progressoCompleto < progressoFisico * 0.8) status = 'atencao';

      return {
        nome: categoria.nome,
        progressoFisico,
        progressoCompleto,
        tarefasConcluidas,
        totalTarefas,
        horasEstimadas,
        horasRealizadas,
        eficiencia,
        status,
        dataInicioMaisProxima,
        dataFimMaisDistante,
      };
    });
  }

  /**
   * Identifica tarefas críticas do projeto
   */
  identificarTarefasCriticas(
    categorias: CategoriaCronograma[]
  ): TarefaCritica[] {
    const todasTarefas = this.obterTodasTarefas(categorias);
    const hoje = new Date();
    const tarefasCriticas: TarefaCritica[] = [];

    todasTarefas.forEach((tarefa) => {
      if (tarefa.percentualCompleto >= 100) return; // Já concluída

      const dataFim = new Date(tarefa.fim);
      const diasRestantes = Math.ceil(
        (dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Critérios para tarefa crítica:
      // 1. Próxima do vencimento (≤ 14 dias)
      // 2. Progresso abaixo do esperado
      // 3. Tem predecessores
      const proximaVencimento = diasRestantes <= 14;
      const progressoAtrasado =
        tarefa.percentualCompleto < tarefa.percentualFisico * 0.8;
      const temPredecessores =
        tarefa.predecessores && tarefa.predecessores.trim() !== '';

      if (proximaVencimento || progressoAtrasado || temPredecessores) {
        // Calcular risco de atraso (0-100)
        let riscoAtraso = 0;

        if (diasRestantes < 0)
          riscoAtraso += 40; // Já atrasada
        else if (diasRestantes <= 3) riscoAtraso += 30;
        else if (diasRestantes <= 7) riscoAtraso += 20;
        else if (diasRestantes <= 14) riscoAtraso += 10;

        if (progressoAtrasado) riscoAtraso += 25;
        if (temPredecessores) riscoAtraso += 15;
        if (tarefa.categoria === 'Caminho Crítico') riscoAtraso += 20;

        riscoAtraso = Math.min(100, riscoAtraso);

        // Determinar impacto
        let impacto: 'baixo' | 'medio' | 'alto' | 'critico' = 'baixo';
        if (riscoAtraso >= 80) impacto = 'critico';
        else if (riscoAtraso >= 60) impacto = 'alto';
        else if (riscoAtraso >= 40) impacto = 'medio';

        tarefasCriticas.push({
          id: tarefa.id,
          nome: tarefa.nome,
          categoria: tarefa.categoria,
          progressoCompleto: tarefa.percentualCompleto,
          progressoFisico: tarefa.percentualFisico,
          dataInicio: new Date(tarefa.inicio),
          dataFim: new Date(tarefa.fim),
          diasRestantes,
          riscoAtraso,
          predecessores: tarefa.predecessores
            ? tarefa.predecessores.split(';')
            : [],
          impacto,
        });
      }
    });

    // Ordenar por risco decrescente
    return tarefasCriticas.sort((a, b) => b.riscoAtraso - a.riscoAtraso);
  }

  // Métodos auxiliares privados

  private obterTodasTarefas(
    categorias: CategoriaCronograma[]
  ): TarefaCronograma[] {
    const tarefas: TarefaCronograma[] = [];

    categorias.forEach((categoria) => {
      categoria.tarefas.forEach((tarefa) => {
        tarefas.push(tarefa);
        if (tarefa.subatividades) {
          tarefas.push(...tarefa.subatividades);
        }
      });
    });

    return tarefas;
  }

  private obterTarefasCategoria(
    categoria: CategoriaCronograma
  ): TarefaCronograma[] {
    const tarefas: TarefaCronograma[] = [];

    categoria.tarefas.forEach((tarefa) => {
      tarefas.push(tarefa);
      if (tarefa.subatividades) {
        tarefas.push(...tarefa.subatividades);
      }
    });

    return tarefas;
  }

  private calcularProgressoCategoria(categoria: CategoriaCronograma): number {
    const tarefas = this.obterTarefasCategoria(categoria);
    return tarefas.length > 0
      ? tarefas.reduce((acc, t) => acc + t.percentualCompleto, 0) /
          tarefas.length
      : 0;
  }

  private calcularHorasEstimadas(tarefas: TarefaCronograma[]): number {
    return tarefas.reduce((total, tarefa) => {
      // Se duracao é um número, usar diretamente (assumindo dias, convertemos para horas)
      if (typeof tarefa.duracao === 'number') {
        return total + tarefa.duracao * 8; // Assumir 8 horas por dia
      }

      // Se duracao é string, extrair horas da string de duração (ex: "100 hrs" → 100)
      const match = tarefa.duracao.match(/(\d+(?:\.\d+)?)\s*hrs?/i);
      if (match) {
        return total + parseFloat(match[1]);
      }

      // Se não tem horas, tentar extrair dias e converter
      if (typeof tarefa.duracao === 'string') {
        const daysMatch = tarefa.duracao.match(/(\d+(?:\.\d+)?)\s*e?days?/i);
        if (daysMatch) {
          return total + parseFloat(daysMatch[1]) * 8; // 8 horas por dia
        }
      }

      return total;
    }, 0);
  }

  private calcularDataEstimadaConclusao(
    tarefas: TarefaCronograma[],
    progressoAtual: number
  ): Date {
    if (progressoAtual >= 100) {
      return new Date(); // Já concluído
    }

    // Encontrar a data de fim mais distante
    const datasFim = tarefas
      .map((t) => new Date(t.fim))
      .filter((d) => !isNaN(d.getTime()));

    if (datasFim.length === 0) {
      return new Date();
    }

    const dataFinalPlanejada = new Date(
      Math.max(...datasFim.map((d) => d.getTime()))
    );

    // Se o progresso está conforme esperado, usar data planejada
    if (progressoAtual >= 80) {
      return dataFinalPlanejada;
    }

    // Caso contrário, calcular atraso baseado no progresso
    const diasRestantes = Math.ceil(
      (dataFinalPlanejada.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const fatorAtraso = 100 / Math.max(progressoAtual, 10); // Evitar divisão por zero
    const diasComAtraso = diasRestantes * fatorAtraso;

    return new Date(Date.now() + diasComAtraso * 24 * 60 * 60 * 1000);
  }

  private calcularRiscoAtraso(
    tarefasAtrasadas: number,
    tarefasCriticas: number,
    totalTarefas: number,
    progressoGeral: number
  ): 'baixo' | 'medio' | 'alto' | 'critico' {
    const percentualAtrasadas = (tarefasAtrasadas / totalTarefas) * 100;
    const percentualCriticas = (tarefasCriticas / totalTarefas) * 100;

    let pontuacaoRisco = 0;

    // Peso para tarefas atrasadas
    if (percentualAtrasadas > 20) pontuacaoRisco += 40;
    else if (percentualAtrasadas > 10) pontuacaoRisco += 25;
    else if (percentualAtrasadas > 5) pontuacaoRisco += 15;

    // Peso para tarefas críticas
    if (percentualCriticas > 15) pontuacaoRisco += 30;
    else if (percentualCriticas > 8) pontuacaoRisco += 20;
    else if (percentualCriticas > 3) pontuacaoRisco += 10;

    // Peso para progresso geral
    if (progressoGeral < 50) pontuacaoRisco += 20;
    else if (progressoGeral < 70) pontuacaoRisco += 10;

    if (pontuacaoRisco >= 70) return 'critico';
    if (pontuacaoRisco >= 50) return 'alto';
    if (pontuacaoRisco >= 25) return 'medio';
    return 'baixo';
  }
}

export const analyticsService = new AnalyticsService();
