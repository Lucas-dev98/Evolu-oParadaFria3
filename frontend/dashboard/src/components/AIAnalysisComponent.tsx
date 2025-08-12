import React, { useState, useEffect } from 'react';
import { CategoriaCronograma, ResumoCronograma } from '../types/cronograma';
import { useThemeClasses } from '../contexts/ThemeContext';
import {
  aiService,
  AIAnalysis,
  Insight,
  AIProvider,
} from '../services/AIAnalysisService';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Settings,
  RefreshCw,
  Zap,
  Shield,
  Target,
  Clock,
} from 'lucide-react';

interface AIAnalysisComponentProps {
  categorias: CategoriaCronograma[];
  resumo: ResumoCronograma;
}

const AIAnalysisComponent: React.FC<AIAnalysisComponentProps> = ({
  categorias,
  resumo,
}) => {
  const themeClasses = useThemeClasses();
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<AIProvider>('local');
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Carregar análise automaticamente
  useEffect(() => {
    analyzeProject();
  }, [categorias, resumo]);

  const analyzeProject = async () => {
    setLoading(true);
    try {
      console.log(
        '🚀 Executando análise AI direta (sem configuração manual)...'
      );
      // Usar método direto que já tem a chave configurada
      const result = await aiService.analisarComGeminiDireto(
        categorias,
        categorias,
        resumo
      );
      setAnalysis(result);
      console.log('✅ Análise AI concluída automaticamente');
    } catch (error) {
      console.error('❌ Erro na análise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    if (apiKey) {
      aiService.setProvider(newProvider, apiKey);
    }
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      aiService.setProvider(provider, apiKey.trim());
      setShowSettings(false);
      analyzeProject();
    }
  };

  const getInsightIcon = (tipo: string) => {
    switch (tipo) {
      case 'risco':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'oportunidade':
        return <Target className="w-5 h-5 text-green-500" />;
      case 'recomendacao':
        return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'alerta':
        return <Shield className="w-5 h-5 text-orange-500" />;
      default:
        return <Brain className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'media':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'baixa':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <div className={`${themeClasses.card} rounded-xl shadow-lg`}>
      {/* Header */}
      <div className={`p-6 border-b ${themeClasses.border}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-purple-500" />
            <h3 className={`text-2xl font-bold ${themeClasses.textPrimary}`}>
              🤖 Análise de IA
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg hover:${themeClasses.bgSecondary} transition-colors`}
            >
              <Settings className={`w-5 h-5 ${themeClasses.textSecondary}`} />
            </button>
            <button
              onClick={analyzeProject}
              disabled={loading}
              className={`p-2 rounded-lg hover:${themeClasses.bgSecondary} transition-colors disabled:opacity-50`}
            >
              <RefreshCw
                className={`w-5 h-5 ${themeClasses.textSecondary} ${loading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Provider Settings */}
        {showSettings && (
          <div className={`mt-4 p-4 rounded-lg ${themeClasses.bgSecondary}`}>
            <h4
              className={`text-lg font-medium mb-3 ${themeClasses.textPrimary}`}
            >
              Configurações de IA
            </h4>

            <div className="space-y-3">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}
                >
                  Provedor de IA:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {(
                    [
                      'local',
                      'gemini',
                      'openai',
                      'claude',
                      'huggingface',
                    ] as AIProvider[]
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => handleProviderChange(p)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        provider === p
                          ? 'bg-blue-500 text-white'
                          : `hover:${themeClasses.bgSecondary} ${themeClasses.textSecondary}`
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                      {p === 'gemini' && (
                        <span className="ml-1 text-xs">🆓</span>
                      )}
                      {p === 'local' && (
                        <span className="ml-1 text-xs">🔒</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {provider !== 'local' && (
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}
                  >
                    API Key:
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`Digite sua chave da API ${provider.toUpperCase()}`}
                      className={`flex-1 px-3 py-2 border rounded-lg ${themeClasses.border} ${themeClasses.bgPrimary} ${themeClasses.textPrimary}`}
                    />
                    <button
                      onClick={handleApiKeySubmit}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                  <p className={`mt-1 text-xs ${themeClasses.textSecondary}`}>
                    {provider === 'gemini' &&
                      'Google Gemini - Gratuita (60 req/min)'}
                    {provider === 'openai' && 'OpenAI - $5 grátis iniciais'}
                    {provider === 'claude' &&
                      'Anthropic Claude - Créditos iniciais'}
                    {provider === 'huggingface' && 'Hugging Face - Gratuita'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin mx-auto mb-4">
            <Brain className="w-12 h-12 text-purple-500" />
          </div>
          <p className={`${themeClasses.textSecondary}`}>
            Analisando projeto com IA...
          </p>
        </div>
      ) : analysis ? (
        <div className="p-6 space-y-6">
          {/* Resumo Geral */}
          <div className="flex items-center space-x-4">
            <div
              className={`flex-1 ${themeClasses.bgSecondary} rounded-lg p-4`}
            >
              <h4
                className={`text-lg font-medium mb-2 ${themeClasses.textPrimary}`}
              >
                Resumo da IA
              </h4>
              <p className={`${themeClasses.textSecondary} mb-3`}>
                {analysis.resumo}
              </p>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}
                >
                  <div
                    className={`h-2 rounded-full ${
                      analysis.pontuacao >= 80
                        ? 'bg-green-500'
                        : analysis.pontuacao >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${analysis.pontuacao}%` }}
                  />
                </div>
                <span
                  className={`text-sm font-medium ${themeClasses.textPrimary}`}
                >
                  {analysis.pontuacao.toFixed(0)}/100
                </span>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div>
            <h4
              className={`text-lg font-medium mb-4 ${themeClasses.textPrimary}`}
            >
              💡 Insights Principais
            </h4>
            <div className="space-y-3">
              {analysis.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(insight.prioridade)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getInsightIcon(insight.tipo)}
                    <div className="flex-1">
                      <h5
                        className={`font-medium mb-1 ${themeClasses.textPrimary}`}
                      >
                        {insight.titulo}
                      </h5>
                      <p
                        className={`text-sm ${themeClasses.textSecondary} mb-2`}
                      >
                        {insight.descricao}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              insight.prioridade === 'alta'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : insight.prioridade === 'media'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}
                          >
                            {insight.prioridade.toUpperCase()}
                          </span>
                          <span
                            className={`text-xs ${themeClasses.textSecondary}`}
                          >
                            Impacto: {insight.impacto}/10
                          </span>
                        </div>
                      </div>
                      {insight.acoes.length > 0 && (
                        <div className="mt-2">
                          <p
                            className={`text-xs font-medium ${themeClasses.textSecondary} mb-1`}
                          >
                            Ações Recomendadas:
                          </p>
                          <ul className="list-disc list-inside text-xs space-y-1">
                            {insight.acoes.map((acao, i) => (
                              <li
                                key={i}
                                className={themeClasses.textSecondary}
                              >
                                {acao}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predições */}
          {analysis.predicoes && (
            <div>
              <h4
                className={`text-lg font-medium mb-4 ${themeClasses.textPrimary}`}
              >
                🔮 Predições
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`${themeClasses.bgSecondary} rounded-lg p-4`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className={`font-medium ${themeClasses.textPrimary}`}>
                      Probabilidade de Atraso
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      analysis.predicoes.probabilidadeAtraso > 50
                        ? 'text-red-500'
                        : 'text-green-500'
                    }`}
                  >
                    {analysis.predicoes.probabilidadeAtraso}%
                  </div>
                </div>

                {analysis.predicoes.recursosEmRisco.length > 0 && (
                  <div className={`${themeClasses.bgSecondary} rounded-lg p-4`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span
                        className={`font-medium ${themeClasses.textPrimary}`}
                      >
                        Recursos em Risco
                      </span>
                    </div>
                    <ul className={`text-sm ${themeClasses.textSecondary}`}>
                      {analysis.predicoes.recursosEmRisco.map((recurso, i) => (
                        <li key={i}>• {recurso}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer com info do provedor */}
          <div
            className={`text-xs ${themeClasses.textSecondary} text-center pt-4 border-t ${themeClasses.border}`}
          >
            Análise gerada por: {provider.toUpperCase()}
            {provider === 'local' && ' (Offline)'}
            {provider === 'gemini' && ' 🆓 (Gratuita)'}• Última atualização:{' '}
            {new Date().toLocaleTimeString('pt-BR')}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className={`${themeClasses.textSecondary}`}>
            Clique em "Atualizar" para gerar análise de IA
          </p>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisComponent;
