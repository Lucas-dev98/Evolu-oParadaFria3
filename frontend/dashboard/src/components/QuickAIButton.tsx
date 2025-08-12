import React, { useState } from 'react';
import { Zap, Loader } from 'lucide-react';
import { aiService } from '../services/AIAnalysisService';
import { useThemeClasses } from '../contexts/ThemeContext';

interface QuickAIButtonProps {
  cronograma?: any[];
  categorias?: any[];
  resumo?: any;
}

export default function QuickAIButton({
  cronograma,
  categorias,
  resumo,
}: QuickAIButtonProps) {
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);
  const themeClasses = useThemeClasses();

  const executarAnaliseRapida = async () => {
    setCarregando(true);
    setErro(null);
    setResultado(null);

    try {
      console.log('⚡ Executando análise AI rápida e direta...');

      // Dados padrão se não foram fornecidos
      const dadosPadrao = cronograma || [
        { id: 1, categoria: 'Planejamento', progresso: 85, prioridade: 'Alta' },
        { id: 2, categoria: 'Execução', progresso: 60, prioridade: 'Alta' },
        { id: 3, categoria: 'Controle', progresso: 40, prioridade: 'Média' },
      ];

      const categoriasPadrao = categorias || [
        { categoria: 'Planejamento', quantidade: 15, concluidas: 12 },
        { categoria: 'Execução', quantidade: 25, concluidas: 15 },
        { categoria: 'Controle', quantidade: 10, concluidas: 4 },
      ];

      const resumoPadrao = resumo || {
        totalTarefas: 50,
        concluidas: 31,
        atrasadas: 8,
        dataAnalise: new Date().toISOString(),
      };

      // Usar método direto - sem necessidade de configurar chave manualmente
      const analise = await aiService.analisarComGeminiDireto(
        dadosPadrao,
        categoriasPadrao,
        resumoPadrao
      );

      setResultado(analise);
      console.log('✅ Análise AI rápida concluída!', analise);
    } catch (error) {
      console.error('❌ Erro na análise rápida:', error);
      setErro(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Botão de Análise Rápida */}
      <button
        onClick={executarAnaliseRapida}
        disabled={carregando}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${
            carregando
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
          }
        `}
      >
        {carregando ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <Zap className="w-5 h-5" />
        )}
        {carregando ? 'Analisando...' : '⚡ Análise AI Instantânea'}
      </button>

      {/* Resultado */}
      {resultado && (
        <div className={`${themeClasses.card} rounded-lg p-4 space-y-3`}>
          <h3
            className={`text-lg font-semibold ${themeClasses.textPrimary} flex items-center gap-2`}
          >
            🤖 Análise AI Concluída
          </h3>

          <div className={`${themeClasses.textSecondary} text-sm`}>
            <p>
              <strong>Resumo:</strong> {resultado.resumo}
            </p>
            <p>
              <strong>Pontuação:</strong> {resultado.pontuacao}/100
            </p>
          </div>

          {resultado.insights && resultado.insights.length > 0 && (
            <div className="space-y-2">
              <h4 className={`font-medium ${themeClasses.textPrimary}`}>
                💡 Insights ({resultado.insights.length}):
              </h4>
              <div className="space-y-1">
                {resultado.insights
                  .slice(0, 3)
                  .map((insight: any, index: number) => (
                    <div
                      key={index}
                      className={`text-sm p-2 rounded ${themeClasses.bgSecondary} ${themeClasses.border}`}
                    >
                      <span className="font-medium">
                        {insight.tipo === 'risco'
                          ? '⚠️'
                          : insight.tipo === 'oportunidade'
                            ? '🎯'
                            : '💡'}
                      </span>{' '}
                      {insight.descricao}
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div
            className={`text-xs ${themeClasses.textSecondary} pt-2 border-t`}
          >
            ✅ Análise executada automaticamente com Gemini API (sem
            configuração manual)
          </div>
        </div>
      )}

      {/* Erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold flex items-center gap-2">
            ❌ Erro na Análise
          </h3>
          <p className="text-red-600 text-sm mt-1">{erro}</p>
        </div>
      )}
    </div>
  );
}
