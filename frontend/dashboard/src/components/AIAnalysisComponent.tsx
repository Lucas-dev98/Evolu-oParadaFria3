import React, { useState, useEffect } from 'react';
import { CategoriaCronograma } from '../types/cronograma';
import { useThemeClasses } from '../contexts/ThemeContext';
import {
  AIInsightsService,
  AIInsight,
  AIAnalysisResult,
} from '../services/AIInsightsService';
import {
  Brain,
  AlertTriangle,
  Info,
  TrendingUp,
  CheckCircle,
  Clock,
  Target,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lightbulb,
} from 'lucide-react';

interface AIAnalysisComponentProps {
  categorias: CategoriaCronograma[];
}

const AIAnalysisComponent: React.FC<AIAnalysisComponentProps> = ({
  categorias,
}) => {
  const themeClasses = useThemeClasses();
  const [analiseIA, setAnaliseIA] = useState<AIAnalysisResult | null>(null);
  const [isAnalising, setIsAnalising] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<
    'todos' | 'crítico' | 'atenção' | 'oportunidade' | 'sucesso'
  >('todos');
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (categorias && categorias.length > 0) {
      executarAnaliseIA();
    }
  }, [categorias]);

  const executarAnaliseIA = async () => {
    setIsAnalising(true);
    try {
      console.log('🤖 Iniciando análise de IA...');
      const aiService = AIInsightsService.getInstance();
      const resultado = aiService.analisarProjeto(categorias);
      setAnaliseIA(resultado);
      console.log('🤖 Análise de IA concluída:', resultado);
    } catch (error) {
      console.error('❌ Erro na análise de IA:', error);
    } finally {
      setIsAnalising(false);
    }
  };

  const toggleInsightExpansion = (insightId: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId);
    } else {
      newExpanded.add(insightId);
    }
    setExpandedInsights(newExpanded);
  };

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'crítico':
        return <AlertTriangle className="w-5 h-5" />;
      case 'atenção':
        return <Info className="w-5 h-5" />;
      case 'oportunidade':
        return <TrendingUp className="w-5 h-5" />;
      case 'sucesso':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getCorTipo = (tipo: string) => {
    switch (tipo) {
      case 'crítico':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'atenção':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'oportunidade':
        return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'sucesso':
        return 'text-green-500 bg-green-50 border-green-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getCorStatus = (status: string) => {
    switch (status) {
      case 'crítico':
        return 'bg-red-500';
      case 'atenção':
        return 'bg-yellow-500';
      case 'normal':
        return 'bg-blue-500';
      case 'excelente':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCorPrioridade = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'média':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'baixa':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const insightsFiltrados =
    analiseIA?.insights.filter(
      (insight) => filtroTipo === 'todos' || insight.tipo === filtroTipo
    ) || [];

  if (isAnalising) {
    return (
      <div
        className={`p-6 rounded-lg ${themeClasses.bgSecondary} ${themeClasses.border}`}
      >
        <div className="flex items-center justify-center space-x-3">
          <Brain className="w-8 h-8 text-blue-500 animate-pulse" />
          <div>
            <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
              IA Analisando Projeto PFUS3
            </h3>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              Processando dados reais e gerando insights valiosos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analiseIA) {
    return (
      <div
        className={`p-6 rounded-lg ${themeClasses.bgSecondary} ${themeClasses.border}`}
      >
        <p className={`text-center ${themeClasses.textSecondary}`}>
          Nenhuma análise de IA disponível
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Resumo Executivo */}
      <div
        className={`p-4 sm:p-6 rounded-lg ${themeClasses.bgSecondary} ${themeClasses.border}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4">
          <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h2
              className={`text-lg sm:text-xl font-bold ${themeClasses.textPrimary}`}
            >
              Análise de IA - Projeto PFUS3
            </h2>
            <p className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}>
              Insights baseados em dados reais do projeto • Atualizado em tempo
              real
            </p>
          </div>
        </div>

        {/* Status Geral */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className={`p-3 sm:p-4 rounded-lg ${themeClasses.bgTertiary}`}>
            <div className="flex items-center space-x-2 mb-2">
              <div
                className={`w-3 h-3 rounded-full ${getCorStatus(analiseIA.resumo.statusGeral)}`}
              />
              <span
                className={`text-sm font-medium ${themeClasses.textPrimary}`}
              >
                Status Geral
              </span>
            </div>
            <p
              className={`text-lg font-bold ${themeClasses.textPrimary} capitalize`}
            >
              {analiseIA.resumo.statusGeral}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${themeClasses.bgTertiary}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span
                className={`text-sm font-medium ${themeClasses.textPrimary}`}
              >
                Progresso
              </span>
            </div>
            <p className={`text-lg font-bold ${themeClasses.textPrimary}`}>
              {analiseIA.resumo.progressoReal}%
              <span
                className={`text-sm font-normal ${themeClasses.textSecondary} ml-1`}
              >
                (Esperado: {analiseIA.resumo.progressoEsperado}%)
              </span>
            </p>
          </div>

          <div className={`p-4 rounded-lg ${themeClasses.bgTertiary}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-red-500" />
              <span
                className={`text-sm font-medium ${themeClasses.textPrimary}`}
              >
                Atraso
              </span>
            </div>
            <p className={`text-lg font-bold ${themeClasses.textPrimary}`}>
              {analiseIA.resumo.diasAtraso} dias
            </p>
          </div>

          <div className={`p-4 rounded-lg ${themeClasses.bgTertiary}`}>
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span
                className={`text-sm font-medium ${themeClasses.textPrimary}`}
              >
                Risco
              </span>
            </div>
            <p className={`text-lg font-bold ${themeClasses.textPrimary}`}>
              {analiseIA.resumo.riscoProjeto}%
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {['todos', 'crítico', 'atenção', 'oportunidade', 'sucesso'].map(
            (tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo as any)}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors touch-target ${
                  filtroTipo === tipo
                    ? 'bg-blue-500 text-white'
                    : `${themeClasses.bgTertiary} ${themeClasses.textSecondary} hover:bg-blue-100`
                }`}
              >
                <span className="truncate">
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </span>
                {tipo !== 'todos' && (
                  <span className="ml-1 text-xs">
                    ({analiseIA.insights.filter((i) => i.tipo === tipo).length})
                  </span>
                )}
              </button>
            )
          )}
        </div>
      </div>

      {/* Resumo por Categorias - Responsivo */}
      <div
        className={`p-4 sm:p-6 rounded-lg ${themeClasses.bgSecondary} ${themeClasses.border}`}
      >
        <h3
          className={`text-base sm:text-lg font-semibold ${themeClasses.textPrimary} mb-4 flex items-center`}
        >
          <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
          <span className="truncate">Resumo por Categorias</span>
        </h3>

        <div className="space-y-3">
          {categorias.map((categoria, index) => {
            const tarefasCategoria = categoria.tarefas || [];
            const totalAtividades = tarefasCategoria.length;
            const atrasadas = tarefasCategoria.filter((t) => {
              const fim = new Date(t.fim);
              const hoje = new Date();
              return fim < hoje && t.percentualCompleto < 100;
            }).length;
            const criticas = tarefasCategoria.filter(
              (t) =>
                t.nome.toLowerCase().includes('crític') ||
                (t.percentualCompleto === 0 && new Date(t.fim) < new Date())
            ).length;
            const atencao = tarefasCategoria.filter(
              (t) => t.percentualCompleto > 0 && t.percentualCompleto < 50
            ).length;

            const getStatusColor = () => {
              if (atrasadas > totalAtividades * 0.3)
                return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
              if (criticas > 0)
                return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
              return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
            };

            const getStatusIcon = () => {
              if (atrasadas > totalAtividades * 0.3) return '🚨';
              if (criticas > 0) return '⚠️';
              return '✅';
            };

            const getStatusText = () => {
              if (atrasadas > totalAtividades * 0.3) return 'ATRASADA';
              if (criticas > 0) return 'CRÍTICA';
              return 'NO PRAZO';
            };

            const getProgressColorClass = () => {
              if (categoria.progresso >= 80)
                return 'text-green-600 dark:text-green-400';
              if (categoria.progresso >= 50)
                return 'text-yellow-600 dark:text-yellow-400';
              return 'text-red-600 dark:text-red-400';
            };

            return (
              <div
                key={index}
                className={`category-summary-card p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${getStatusColor()}`}
              >
                {/* Header Mobile-First */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{categoria.icone || '📊'}</span>
                      <h4
                        className={`category-summary-title font-bold ${themeClasses.textPrimary} text-sm sm:text-base leading-tight`}
                      >
                        {categoria.nome}
                      </h4>
                    </div>
                    <p
                      className={`text-xs ${themeClasses.textSecondary} font-medium`}
                    >
                      {totalAtividades} atividades
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span
                      className={`category-summary-progress text-xl sm:text-2xl font-bold ${getProgressColorClass()}`}
                    >
                      {categoria.progresso}%
                    </span>
                  </div>
                </div>

                {/* Stats Grid - Mobile Optimized */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {atrasadas > 0 && (
                    <div className="flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-md p-2">
                      <span className="text-xs font-medium text-red-700 dark:text-red-300 text-center">
                        🚨 {atrasadas}
                        <br />
                        <span className="text-xs opacity-75">atrasadas</span>
                      </span>
                    </div>
                  )}
                  {criticas > 0 && (
                    <div className="flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 rounded-md p-2">
                      <span className="text-xs font-medium text-orange-700 dark:text-orange-300 text-center">
                        ⚠️ {criticas}
                        <br />
                        <span className="text-xs opacity-75">críticas</span>
                      </span>
                    </div>
                  )}
                  {atencao > 0 && (
                    <div className="flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30 rounded-md p-2">
                      <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300 text-center">
                        ⚡ {atencao}
                        <br />
                        <span className="text-xs opacity-75">atenção</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Badge - Full Width Mobile */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="w-full">
                    <span
                      className={`category-summary-badge inline-flex items-center justify-center w-full px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                        atrasadas > totalAtividades * 0.3
                          ? 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-600'
                          : criticas > 0
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-600'
                            : 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-600'
                      }`}
                    >
                      {getStatusIcon()} {getStatusText()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de Insights */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
          Insights e Recomendações ({insightsFiltrados.length})
        </h3>

        {insightsFiltrados.map((insight) => (
          <div
            key={insight.id}
            className={`p-3 sm:p-4 rounded-lg border-2 ${getCorTipo(insight.tipo)} ${themeClasses.bgPrimary}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0 mt-0.5">
                  {getIconoTipo(insight.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                    <h4
                      className={`font-semibold ${themeClasses.textPrimary} truncate flex-1`}
                    >
                      {insight.título}
                    </h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getCorTipo(insight.tipo)} whitespace-nowrap`}
                      >
                        {insight.impacto} impacto
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap`}
                      >
                        {insight.categoria}
                      </span>
                    </div>
                  </div>

                  <p
                    className={`text-xs sm:text-sm ${themeClasses.textSecondary} mb-3 leading-relaxed`}
                  >
                    {insight.descrição}
                  </p>

                  {insight.métricas && (
                    <div className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-4 mb-3">
                      <div className="flex items-center space-x-1">
                        <span
                          className={`text-base sm:text-lg font-bold ${themeClasses.textPrimary}`}
                        >
                          {insight.métricas.valor}
                        </span>
                        <span
                          className={`text-xs sm:text-sm ${themeClasses.textSecondary}`}
                        >
                          {insight.métricas.unidade}
                        </span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 ${
                          insight.métricas.tendência === 'subindo'
                            ? 'text-red-500'
                            : insight.métricas.tendência === 'descendo'
                              ? 'text-green-500'
                              : 'text-gray-500'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs capitalize">
                          {insight.métricas.tendência}
                        </span>
                      </div>
                    </div>
                  )}

                  {expandedInsights.has(insight.id) && (
                    <div className="mt-4 p-3 bg-white/50 rounded-lg">
                      <h5
                        className={`font-medium ${themeClasses.textPrimary} mb-2 flex items-center`}
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Recomendações:
                      </h5>
                      <ul className="space-y-1">
                        {insight.recomendações.map((rec, index) => (
                          <li
                            key={index}
                            className={`text-sm ${themeClasses.textSecondary} flex items-start`}
                          >
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 ml-2 sm:ml-0">
                <button
                  onClick={() => toggleInsightExpansion(insight.id)}
                  className={`p-2 rounded-full hover:bg-white/20 ${themeClasses.textSecondary} touch-target transition-all duration-200`}
                  aria-label={
                    expandedInsights.has(insight.id)
                      ? 'Recolher detalhes'
                      : 'Expandir detalhes'
                  }
                >
                  {expandedInsights.has(insight.id) ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ações Recomendadas */}
      <div
        className={`p-4 sm:p-6 rounded-lg ${themeClasses.bgSecondary} ${themeClasses.border}`}
      >
        <h3
          className={`text-base sm:text-lg font-semibold ${themeClasses.textPrimary} mb-4 flex items-center`}
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
          <span className="truncate">Plano de Ação Recomendado</span>
        </h3>

        <div className="space-y-3 sm:space-y-4">
          {analiseIA.açõesRecomendadas.map((ação, index) => (
            <div
              key={index}
              className={`p-3 sm:p-4 rounded-lg ${themeClasses.bgTertiary} border-l-4 ${
                ação.prioridade === 'alta'
                  ? 'border-red-500'
                  : ação.prioridade === 'média'
                    ? 'border-yellow-500'
                    : 'border-green-500'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getCorPrioridade(ação.prioridade)}`}
                    >
                      {ação.prioridade} prioridade
                    </span>
                    <span className={`text-xs ${themeClasses.textSecondary}`}>
                      Prazo: {ação.prazo}
                    </span>
                  </div>

                  <h4
                    className={`font-medium ${themeClasses.textPrimary} mb-1`}
                  >
                    {ação.ação}
                  </h4>

                  <p className={`text-sm ${themeClasses.textSecondary}`}>
                    Responsável: {ação.responsável}
                  </p>
                </div>

                <ExternalLink
                  className={`w-4 h-4 ${themeClasses.textSecondary}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botão de Atualização */}
      <div className="flex justify-center">
        <button
          onClick={executarAnaliseIA}
          disabled={isAnalising}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
        >
          <Brain className="w-4 h-4" />
          <span>{isAnalising ? 'Analisando...' : 'Atualizar Análise'}</span>
        </button>
      </div>
    </div>
  );
};

export default AIAnalysisComponent;
