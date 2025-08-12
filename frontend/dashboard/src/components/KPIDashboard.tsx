import React, { useState, useEffect } from 'react';
import { TarefaCronograma, CategoriaCronograma } from '../types/cronograma';
import { useThemeClasses } from '../contexts/ThemeContext';
import { mlPrevisaoService } from '../services/MLPrevisaoService';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Zap,
  Gauge,
} from 'lucide-react';

interface KPIDashboardProps {
  categorias: CategoriaCronograma[];
  refreshInterval?: number;
}

interface KPIMetric {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
  detail?: string;
}

interface ProjectHealth {
  overall: 'excelente' | 'bom' | 'atencao' | 'critico';
  score: number;
  factors: string[];
}

const KPIDashboard: React.FC<KPIDashboardProps> = ({
  categorias,
  refreshInterval = 30000, // 30 segundos
}) => {
  const themeClasses = useThemeClasses();
  const [metrics, setMetrics] = useState<KPIMetric[]>([]);
  const [projectHealth, setProjectHealth] = useState<ProjectHealth | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Obter todas as tarefas
  const getAllTasks = (): TarefaCronograma[] => {
    const tasks: TarefaCronograma[] = [];
    categorias.forEach((categoria) => {
      categoria.tarefas.forEach((tarefa) => {
        tasks.push(tarefa);
        if (tarefa.subatividades) {
          tasks.push(...tarefa.subatividades);
        }
      });
    });
    return tasks;
  };

  // Calcular métricas
  const calculateMetrics = (): KPIMetric[] => {
    const tasks = getAllTasks();
    const hoje = new Date();

    // 1. Progresso Geral
    const progressoMedio =
      tasks.reduce((sum, task) => sum + task.percentualCompleto, 0) /
      tasks.length;

    // 2. Tarefas Concluídas
    const tarefasConcluidas = tasks.filter(
      (task) => task.percentualCompleto === 100
    ).length;
    const taxaConclusao = (tarefasConcluidas / tasks.length) * 100;

    // 3. Tarefas Atrasadas
    const tarefasAtrasadas = tasks.filter((task) => {
      const fim = new Date(task.fim);
      return fim < hoje && task.percentualCompleto < 100;
    }).length;

    // 4. Tarefas Críticas (próximas do prazo)
    const tarefasCriticas = tasks.filter((task) => {
      const fim = new Date(task.fim);
      const diasParaFim =
        (fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
      return (
        diasParaFim <= 3 && diasParaFim >= 0 && task.percentualCompleto < 100
      );
    }).length;

    // 5. Velocidade de Execução (tasks/semana)
    const ultimaSemana = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
    const tarefasFinalizadasSemana = tasks.filter((task) => {
      const fim = new Date(task.fim);
      return fim >= ultimaSemana && task.percentualCompleto === 100;
    }).length;

    // 6. Eficiência (vs baseline)
    const tarefasComDesvio = tasks.filter((task) => {
      const fim = new Date(task.fim);
      const fimBaseline = new Date(task.fimBaseline);
      return fim > fimBaseline;
    }).length;
    const eficiencia = ((tasks.length - tarefasComDesvio) / tasks.length) * 100;

    // 7. Previsão de Conclusão
    const tarefasRestantes = tasks.filter(
      (task) => task.percentualCompleto < 100
    );
    const velocidadeDiaria = progressoMedio / 30; // Simulado
    const diasParaConclusao =
      tarefasRestantes.length / Math.max(velocidadeDiaria, 0.1);

    // 8. Qualidade (simulado baseado em retrabalho)
    const qualidade = 100 - (tarefasAtrasadas / tasks.length) * 20;

    return [
      {
        title: 'Progresso Geral',
        value: `${progressoMedio.toFixed(1)}%`,
        change: +2.3,
        trend: 'up',
        icon: <Target className="w-6 h-6" />,
        color: 'text-blue-500',
        detail: `${tasks.length} tarefas total`,
      },
      {
        title: 'Taxa de Conclusão',
        value: `${taxaConclusao.toFixed(1)}%`,
        change: +5.2,
        trend: 'up',
        icon: <CheckCircle className="w-6 h-6" />,
        color: 'text-green-500',
        detail: `${tarefasConcluidas} de ${tasks.length} concluídas`,
      },
      {
        title: 'Tarefas Atrasadas',
        value: tarefasAtrasadas,
        change: -1,
        trend: 'down',
        icon: <AlertTriangle className="w-6 h-6" />,
        color: 'text-red-500',
        detail: `${((tarefasAtrasadas / tasks.length) * 100).toFixed(1)}% do total`,
      },
      {
        title: 'Tarefas Críticas',
        value: tarefasCriticas,
        change: 0,
        trend: 'stable',
        icon: <Clock className="w-6 h-6" />,
        color: 'text-orange-500',
        detail: 'Prazo ≤ 3 dias',
      },
      {
        title: 'Velocidade de Execução',
        value: `${tarefasFinalizadasSemana}/sem`,
        change: +12,
        trend: 'up',
        icon: <Zap className="w-6 h-6" />,
        color: 'text-purple-500',
        detail: 'Últimos 7 dias',
      },
      {
        title: 'Eficiência vs Baseline',
        value: `${eficiencia.toFixed(1)}%`,
        change: -3.1,
        trend: 'down',
        icon: <Gauge className="w-6 h-6" />,
        color: 'text-indigo-500',
        detail: `${tarefasComDesvio} com desvio`,
      },
      {
        title: 'Previsão de Conclusão',
        value: `${Math.ceil(diasParaConclusao)} dias`,
        change: -2,
        trend: 'up',
        icon: <Calendar className="w-6 h-6" />,
        color: 'text-cyan-500',
        detail: 'Baseado na velocidade atual',
      },
      {
        title: 'Índice de Qualidade',
        value: `${qualidade.toFixed(1)}%`,
        change: +1.8,
        trend: 'up',
        icon: <Activity className="w-6 h-6" />,
        color: 'text-teal-500',
        detail: 'Baseado em retrabalho/atrasos',
      },
    ];
  };

  // Calcular saúde geral do projeto
  const calculateProjectHealth = (metrics: KPIMetric[]): ProjectHealth => {
    let score = 0;
    const factors: string[] = [];

    // Analisar cada métrica
    const progresso = parseFloat(metrics[0].value.toString());
    const conclusao = parseFloat(metrics[1].value.toString());
    const atrasadas = parseInt(metrics[2].value.toString());
    const criticas = parseInt(metrics[3].value.toString());
    const eficiencia = parseFloat(metrics[5].value.toString());
    const qualidade = parseFloat(metrics[7].value.toString());

    // Pontuação baseada em progresso
    if (progresso >= 90) {
      score += 20;
      factors.push('✅ Projeto próximo da conclusão');
    } else if (progresso >= 70) {
      score += 15;
      factors.push('⚡ Progresso avançado');
    } else if (progresso >= 50) {
      score += 10;
      factors.push('📈 Progresso moderado');
    } else {
      score += 5;
      factors.push('⚠️ Progresso inicial');
    }

    // Pontuação baseada em conclusão
    if (conclusao >= 80) {
      score += 15;
    } else if (conclusao >= 60) {
      score += 10;
    } else {
      score += 5;
      factors.push('📋 Taxa de conclusão baixa');
    }

    // Penalização por atrasos
    if (atrasadas === 0) {
      score += 15;
      factors.push('🎯 Zero tarefas atrasadas');
    } else if (atrasadas <= 2) {
      score += 10;
    } else {
      score -= 10;
      factors.push('🚨 Múltiplas tarefas atrasadas');
    }

    // Penalização por criticidade
    if (criticas === 0) {
      score += 10;
    } else if (criticas <= 2) {
      score += 5;
    } else {
      score -= 5;
      factors.push('⏰ Múltiplas tarefas críticas');
    }

    // Pontuação por eficiência
    if (eficiencia >= 90) {
      score += 15;
      factors.push('🚀 Alta eficiência vs baseline');
    } else if (eficiencia >= 70) {
      score += 10;
    } else {
      score -= 5;
      factors.push('📉 Eficiência abaixo do esperado');
    }

    // Pontuação por qualidade
    if (qualidade >= 95) {
      score += 15;
      factors.push('💎 Excelente qualidade');
    } else if (qualidade >= 85) {
      score += 10;
    } else if (qualidade >= 70) {
      score += 5;
    } else {
      factors.push('⚠️ Qualidade precisa de atenção');
    }

    // Determinar status geral
    let overall: ProjectHealth['overall'];
    if (score >= 80) overall = 'excelente';
    else if (score >= 60) overall = 'bom';
    else if (score >= 40) overall = 'atencao';
    else overall = 'critico';

    return { overall, score: Math.min(100, score), factors };
  };

  // Atualizar métricas
  const updateMetrics = () => {
    setIsLoading(true);
    try {
      const newMetrics = calculateMetrics();
      const health = calculateProjectHealth(newMetrics);
      setMetrics(newMetrics);
      setProjectHealth(health);
    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateMetrics();

    // Configurar atualização automática
    const interval = setInterval(updateMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [categorias, refreshInterval]);

  const getHealthColor = (health: ProjectHealth['overall']) => {
    switch (health) {
      case 'excelente':
        return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'bom':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'atencao':
        return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'critico':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    }
  };

  const getHealthIcon = (health: ProjectHealth['overall']) => {
    switch (health) {
      case 'excelente':
        return <CheckCircle className="w-8 h-8" />;
      case 'bom':
        return <TrendingUp className="w-8 h-8" />;
      case 'atencao':
        return <AlertTriangle className="w-8 h-8" />;
      case 'critico':
        return <TrendingDown className="w-8 h-8" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Saúde do Projeto */}
      <div className={`${themeClasses.card} rounded-xl shadow-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary}`}>
            🎯 Dashboard de KPIs Executivos
          </h2>
          <div className="flex items-center space-x-2">
            {isLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            )}
            <span className={`text-sm ${themeClasses.textSecondary}`}>
              Atualizado automaticamente
            </span>
          </div>
        </div>

        {projectHealth && (
          <div
            className={`rounded-lg p-4 ${getHealthColor(projectHealth.overall)}`}
          >
            <div className="flex items-center space-x-3">
              {getHealthIcon(projectHealth.overall)}
              <div>
                <h3 className="text-lg font-semibold">
                  Saúde do Projeto: {projectHealth.overall.toUpperCase()}
                </h3>
                <p className="text-sm opacity-80">
                  Score: {projectHealth.score}/100 pontos
                </p>
              </div>
            </div>
            {projectHealth.factors.length > 0 && (
              <div className="mt-3 space-y-1">
                {projectHealth.factors.slice(0, 3).map((factor, index) => (
                  <div key={index} className="text-sm opacity-90">
                    {factor}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`${themeClasses.card} rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={metric.color}>{metric.icon}</div>
              <div className="flex items-center space-x-1 text-sm">
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : metric.trend === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : (
                  <div className="w-4 h-4 bg-gray-400 rounded-full" />
                )}
                <span
                  className={`text-sm font-medium ${
                    metric.trend === 'up'
                      ? 'text-green-600'
                      : metric.trend === 'down'
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}
                >
                  {metric.change > 0 ? '+' : ''}
                  {metric.change}%
                </span>
              </div>
            </div>

            <div>
              <h3
                className={`text-sm font-medium ${themeClasses.textSecondary} mb-1`}
              >
                {metric.title}
              </h3>
              <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>
                {metric.value}
              </p>
              {metric.detail && (
                <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>
                  {metric.detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Análises Avançadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análise de Tendências */}
        <div className={`${themeClasses.card} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
              Análise de Tendências
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${themeClasses.textSecondary}`}>
                Progresso Semanal
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="w-12 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-green-600">+15%</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className={`text-sm ${themeClasses.textSecondary}`}>
                Velocidade de Execução
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="w-10 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-blue-600">+8%</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className={`text-sm ${themeClasses.textSecondary}`}>
                Qualidade
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="w-14 h-2 bg-purple-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-purple-600">+3%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Previsões IA */}
        <div className={`${themeClasses.card} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-6 h-6 text-purple-500" />
            <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
              Previsões IA
            </h3>
          </div>

          <div className="space-y-4">
            <div className={`p-3 rounded-lg ${themeClasses.bgSecondary}`}>
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span
                  className={`text-sm font-medium ${themeClasses.textPrimary}`}
                >
                  Conclusão Prevista
                </span>
              </div>
              <p className="text-lg font-semibold text-blue-600">
                15 de Setembro, 2025
              </p>
              <p className={`text-xs ${themeClasses.textSecondary}`}>
                Confiança: 78% • 12 dias antes do prazo
              </p>
            </div>

            <div className={`p-3 rounded-lg ${themeClasses.bgSecondary}`}>
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span
                  className={`text-sm font-medium ${themeClasses.textPrimary}`}
                >
                  Riscos Identificados
                </span>
              </div>
              <ul className={`text-sm ${themeClasses.textSecondary} space-y-1`}>
                <li>• Gargalo em recursos elétricos</li>
                <li>• Dependência crítica em T-405</li>
                <li>• Possível atraso climático</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPIDashboard;
