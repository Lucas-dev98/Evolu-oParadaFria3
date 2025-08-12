import React, { useState, useEffect } from 'react';
import { CategoriaCronograma } from '../types/cronograma';
import { useThemeClasses } from '../contexts/ThemeContext';
import {
  analyticsService,
  MetricasAnalytics,
  AnaliseCategoria,
  TarefaCritica,
} from '../services/AnalyticsService';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Activity,
  BarChart3,
  Zap,
  Calendar,
  Gauge,
  PieChart,
  Users,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface KPIDashboardProps {
  categorias: CategoriaCronograma[];
}

interface KPICard {
  titulo: string;
  valor: string | number;
  subtitulo: string;
  tendencia: 'up' | 'down' | 'stable' | 'warning' | 'critical';
  cor: string;
  icone: React.ReactNode;
  detalhes?: string;
}

const KPIDashboard: React.FC<KPIDashboardProps> = ({ categorias }) => {
  const themeClasses = useThemeClasses();
  const [metricas, setMetricas] = useState<MetricasAnalytics | null>(null);
  const [analiseCategorias, setAnaliseCategorias] = useState<
    AnaliseCategoria[]
  >([]);
  const [tarefasCriticas, setTarefasCriticas] = useState<TarefaCritica[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (categorias && categorias.length > 0) {
      calcularMetricas();
    }
  }, [categorias]);

  const calcularMetricas = () => {
    try {
      setIsLoading(true);

      // Calcular métricas principais
      const metricasCalculadas =
        analyticsService.calcularMetricasGerais(categorias);
      setMetricas(metricasCalculadas);

      // Analisar categorias
      const analiseCalc = analyticsService.analisarCategorias(categorias);
      setAnaliseCategorias(analiseCalc);

      // Identificar tarefas críticas
      const criticasCalc =
        analyticsService.identificarTarefasCriticas(categorias);
      setTarefasCriticas(criticasCalc.slice(0, 10)); // Top 10 mais críticas

      console.log('📊 Métricas Analytics calculadas:', {
        metricas: metricasCalculadas,
        categorias: analiseCalc.length,
        tarefasCriticas: criticasCalc.length,
      });
    } catch (error) {
      console.error('❌ Erro ao calcular métricas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const obterKPICards = (): KPICard[] => {
    if (!metricas) return [];

    return [
      {
        titulo: 'Progresso Geral',
        valor: `${metricas.progressoGeralCompleto.toFixed(1)}%`,
        subtitulo: `${metricas.tarefasConcluidas}/${metricas.totalTarefas} tarefas concluídas`,
        tendencia:
          metricas.progressoGeralCompleto >= 70
            ? 'up'
            : metricas.progressoGeralCompleto >= 50
              ? 'stable'
              : 'down',
        cor:
          metricas.progressoGeralCompleto >= 70
            ? 'text-green-600'
            : metricas.progressoGeralCompleto >= 50
              ? 'text-blue-600'
              : 'text-red-600',
        icone: <Target className="w-6 h-6" />,
        detalhes: `Progresso físico: ${metricas.progressoGeralFisico.toFixed(1)}%`,
      },
      {
        titulo: 'Prazo do Projeto',
        valor:
          metricas.diasAteVencimento > 0
            ? `${metricas.diasAteVencimento} dias`
            : 'Vencido',
        subtitulo:
          metricas.diasAteVencimento > 0 ? 'até conclusão' : 'projeto atrasado',
        tendencia:
          metricas.diasAteVencimento > 30
            ? 'up'
            : metricas.diasAteVencimento > 0
              ? 'warning'
              : 'critical',
        cor:
          metricas.diasAteVencimento > 30
            ? 'text-green-600'
            : metricas.diasAteVencimento > 0
              ? 'text-yellow-600'
              : 'text-red-600',
        icone: <Calendar className="w-6 h-6" />,
        detalhes: `Conclusão prevista: ${metricas.dataEstimadaConclusao.toLocaleDateString('pt-BR')}`,
      },
      {
        titulo: 'Eficiência',
        valor: `${metricas.eficienciaGeral.toFixed(1)}%`,
        subtitulo: 'físico vs planejado',
        tendencia:
          metricas.eficienciaGeral >= 90
            ? 'up'
            : metricas.eficienciaGeral >= 75
              ? 'stable'
              : 'down',
        cor:
          metricas.eficienciaGeral >= 90
            ? 'text-green-600'
            : metricas.eficienciaGeral >= 75
              ? 'text-blue-600'
              : 'text-red-600',
        icone: <Gauge className="w-6 h-6" />,
        detalhes: `${metricas.horasRealizadas.toFixed(0)}h realizadas de ${metricas.horasEstimadas.toFixed(0)}h estimadas`,
      },
      {
        titulo: 'Tarefas Críticas',
        valor: metricas.tarefasCriticas,
        subtitulo: 'requerem atenção urgente',
        tendencia:
          metricas.tarefasCriticas === 0
            ? 'up'
            : metricas.tarefasCriticas <= 5
              ? 'warning'
              : 'critical',
        cor:
          metricas.tarefasCriticas === 0
            ? 'text-green-600'
            : metricas.tarefasCriticas <= 5
              ? 'text-yellow-600'
              : 'text-red-600',
        icone: <AlertTriangle className="w-6 h-6" />,
        detalhes: `${metricas.tarefasAtrasadas} já atrasadas`,
      },
      {
        titulo: 'Risco do Projeto',
        valor:
          metricas.riscoAtraso.charAt(0).toUpperCase() +
          metricas.riscoAtraso.slice(1),
        subtitulo: 'nível de risco geral',
        tendencia:
          metricas.riscoAtraso === 'baixo'
            ? 'up'
            : metricas.riscoAtraso === 'medio'
              ? 'warning'
              : 'critical',
        cor:
          metricas.riscoAtraso === 'baixo'
            ? 'text-green-600'
            : metricas.riscoAtraso === 'medio'
              ? 'text-yellow-600'
              : 'text-red-600',
        icone: <AlertCircle className="w-6 h-6" />,
      },
      {
        titulo: 'Em Andamento',
        valor: metricas.tarefasEmAndamento,
        subtitulo: 'tarefas ativas',
        tendencia: 'stable',
        cor: 'text-blue-600',
        icone: <Activity className="w-6 h-6" />,
        detalhes: `${metricas.tarefasPendentes} pendentes`,
      },
    ];
  };

  const obterCorStatus = (status: string) => {
    switch (status) {
      case 'em_dia':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'atencao':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'atrasado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'critico':
        return 'bg-red-200 text-red-900 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const obterIconeTendencia = (tendencia: string) => {
    switch (tendencia) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  if (isLoading || !metricas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Calculando métricas do projeto...</span>
      </div>
    );
  }

  const kpiCards = obterKPICards();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Dashboard Executivo - PFUS3 2025
          </h2>
          <p className="text-gray-600 mt-1">
            Métricas em tempo real do cronograma de preparação
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className={`${themeClasses.card} rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={card.cor}>{card.icone}</div>
                  <h3 className="font-semibold text-gray-900">{card.titulo}</h3>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">{card.valor}</span>
                    {obterIconeTendencia(card.tendencia)}
                  </div>
                  <p className="text-sm text-gray-600">{card.subtitulo}</p>
                  {card.detalhes && (
                    <p className="text-xs text-gray-500">{card.detalhes}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Explicação das Métricas */}
      <div className={`${themeClasses.card} rounded-lg p-4`}>
        <h3
          className={`text-lg font-semibold ${themeClasses.textPrimary} mb-3`}
        >
          📊 Entendendo as Métricas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className={`font-medium ${themeClasses.textPrimary} mb-2`}>
              🎯 Progresso vs Eficiência:
            </h4>
            <ul className={`space-y-1 ${themeClasses.textSecondary}`}>
              <li>
                • <strong>Progresso Geral:</strong> Progresso programático
                planejado
              </li>
              <li>
                • <strong>Progresso Físico:</strong> Trabalho realmente
                executado
              </li>
              <li>
                • <strong>Eficiência:</strong> Físico realizado ÷ Planejado para
                hoje
              </li>
            </ul>
          </div>
          <div>
            <h4 className={`font-medium ${themeClasses.textPrimary} mb-2`}>
              ⚠️ Status Atual do Projeto:
            </h4>
            <div className={`space-y-1 ${themeClasses.textSecondary}`}>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>
                  Progresso programático:{' '}
                  {metricas.progressoGeralCompleto.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span>
                  Progresso físico real:{' '}
                  {metricas.progressoGeralFisico.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span>
                  Eficiência atual: {metricas.eficienciaGeral.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Análise por Categoria */}
      <div className={`${themeClasses.card} rounded-lg shadow-sm border p-6`}>
        <h3 className="text-lg font-semibold mb-4">Desempenho por Categoria</h3>

        <div className="space-y-3">
          {analiseCategorias.slice(0, 8).map((categoria, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-100"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{categoria.nome}</h4>
                  <span
                    className={`px-2 py-1 text-xs rounded-full border ${obterCorStatus(categoria.status)}`}
                  >
                    {categoria.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>
                      Progresso: {categoria.progressoCompleto.toFixed(1)}%
                    </span>
                    <span>Eficiência: {categoria.eficiencia.toFixed(1)}%</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        categoria.progressoCompleto >= 80
                          ? 'bg-green-500'
                          : categoria.progressoCompleto >= 60
                            ? 'bg-blue-500'
                            : categoria.progressoCompleto >= 40
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min(100, categoria.progressoCompleto)}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {categoria.tarefasConcluidas}/{categoria.totalTarefas}{' '}
                      tarefas
                    </span>
                    <span>
                      {categoria.horasRealizadas.toFixed(0)}h/
                      {categoria.horasEstimadas.toFixed(0)}h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tarefas Críticas */}
      {tarefasCriticas.length > 0 && (
        <div className={`${themeClasses.card} rounded-lg shadow-sm border p-6`}>
          <h3 className="text-lg font-semibold mb-4 text-red-600">
            <AlertTriangle className="w-5 h-5 inline mr-2" />
            Tarefas Críticas - Ação Urgente Necessária
          </h3>

          <div className="space-y-3">
            {tarefasCriticas.slice(0, 5).map((tarefa, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{tarefa.nome}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {tarefa.categoria}
                    </p>

                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span>Progresso: {tarefa.progressoCompleto}%</span>
                      <span
                        className={`${tarefa.diasRestantes < 0 ? 'text-red-600' : 'text-gray-600'}`}
                      >
                        {tarefa.diasRestantes < 0
                          ? `${Math.abs(tarefa.diasRestantes)} dias atrasada`
                          : `${tarefa.diasRestantes} dias restantes`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`px-2 py-1 text-xs rounded-full ${
                        tarefa.impacto === 'critico'
                          ? 'bg-red-200 text-red-800'
                          : tarefa.impacto === 'alto'
                            ? 'bg-orange-200 text-orange-800'
                            : tarefa.impacto === 'medio'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-blue-200 text-blue-800'
                      }`}
                    >
                      {tarefa.impacto.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Risco: {tarefa.riscoAtraso}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumo Executivo */}
      <div className={`${themeClasses.card} rounded-lg shadow-sm border p-6`}>
        <h3 className="text-lg font-semibold mb-4">Resumo Executivo</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Destaques Positivos</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-green-600">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span>
                  Melhor categoria: {metricas.categoriaComMelhorDesempenho}
                </span>
              </div>
              <div className="flex items-center text-green-600">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span>{metricas.tarefasConcluidas} tarefas já finalizadas</span>
              </div>
              {metricas.tarefasNoPrazo > 0 && (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  <span>{metricas.tarefasNoPrazo} tarefas dentro do prazo</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Pontos de Atenção</h4>
            <div className="space-y-2 text-sm">
              {metricas.tarefasAtrasadas > 0 && (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span>{metricas.tarefasAtrasadas} tarefas atrasadas</span>
                </div>
              )}
              <div className="flex items-center text-yellow-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  Categoria mais crítica: {metricas.categoriaComPiorDesempenho}
                </span>
              </div>
              {metricas.eficienciaGeral < 85 && (
                <div className="flex items-center text-yellow-600">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span>
                    Eficiência baixa: {metricas.eficienciaGeral.toFixed(1)}%
                    (progresso físico real vs planejado para hoje)
                  </span>
                </div>
              )}
              {metricas.eficienciaGeral === 0 && (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span>
                    ⚠️ Sem progresso físico registrado - apenas progresso
                    programático
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPIDashboard;
