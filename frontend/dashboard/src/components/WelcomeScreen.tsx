import React from 'react';
import {
  Upload,
  FileSpreadsheet,
  BarChart3,
  Calendar,
  Eye,
  Shield,
} from 'lucide-react';
import { useThemeClasses } from '../contexts/ThemeContext';

interface WelcomeScreenProps {
  onCarregarDados: () => void;
  isAdmin?: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onCarregarDados,
  isAdmin = false,
}) => {
  const themeClasses = useThemeClasses();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        {/* Ícone Principal */}
        <div className="mb-8">
          <div
            className={`w-24 h-24 ${themeClasses.bgSecondary} rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            <BarChart3 className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className={`text-3xl font-bold ${themeClasses.textPrimary} mb-2`}>
            Dashboard PFUS3 2025
          </h1>
          <p className={`text-lg ${themeClasses.textSecondary}`}>
            Sistema de Monitoramento da Preparação
          </p>
        </div>

        {/* Status do usuário */}
        <div
          className={`mb-6 p-3 rounded-lg ${themeClasses.bgSecondary} border ${themeClasses.border}`}
        >
          <div className="flex items-center justify-center space-x-2">
            {isAdmin ? (
              <>
                <Shield className="w-5 h-5 text-green-600" />
                <span className={`font-medium ${themeClasses.textPrimary}`}>
                  Administrador
                </span>
                <span className={`text-sm ${themeClasses.textSecondary}`}>
                  - Acesso completo
                </span>
              </>
            ) : (
              <>
                <Eye className="w-5 h-5 text-blue-600" />
                <span className={`font-medium ${themeClasses.textPrimary}`}>
                  Visitante
                </span>
                <span className={`text-sm ${themeClasses.textSecondary}`}>
                  - Visualização completa
                </span>
              </>
            )}
          </div>
        </div>

        {/* Instruções */}
        <div className={`${themeClasses.card} rounded-xl shadow-lg p-8 border`}>
          <h2
            className={`text-xl font-semibold ${themeClasses.textPrimary} mb-6`}
          >
            {isAdmin
              ? 'Para começar, carregue os dados do cronograma'
              : 'Aguarde o carregamento dos dados ou faça login como administrador'}
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Passo 1 */}
            <div className="text-center">
              <div
                className={`w-12 h-12 ${isAdmin ? 'bg-green-100' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-3`}
              >
                <Upload
                  className={`w-6 h-6 ${isAdmin ? 'text-green-600' : 'text-gray-400'}`}
                />
              </div>
              <h3 className={`font-medium ${themeClasses.textPrimary} mb-2`}>
                1. Carregar Arquivo
              </h3>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                {isAdmin
                  ? 'Clique em "Gerenciar Dados" para enviar o arquivo CSV do cronograma'
                  : 'Apenas administradores podem carregar novos dados'}
              </p>
            </div>

            {/* Passo 2 */}
            <div className="text-center">
              <div
                className={`w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3`}
              >
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className={`font-medium ${themeClasses.textPrimary} mb-2`}>
                2. Processar Dados
              </h3>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                O sistema processará automaticamente as informações do
                cronograma PFUS3
              </p>
            </div>

            {/* Passo 3 */}
            <div className="text-center">
              <div
                className={`w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3`}
              >
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className={`font-medium ${themeClasses.textPrimary} mb-2`}>
                3. Visualizar
              </h3>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                Acesse as visualizações executiva e detalhada do progresso
              </p>
            </div>
          </div>

          {/* Botão de Ação */}
          {isAdmin ? (
            <button
              onClick={onCarregarDados}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Upload className="w-5 h-5" />
              <span>Gerenciar Dados do Cronograma</span>
            </button>
          ) : (
            <div
              className={`text-center p-4 ${themeClasses.bgSecondary} rounded-lg border ${themeClasses.border}`}
            >
              <p className={`${themeClasses.textSecondary} mb-2`}>
                <strong>Modo Visitante:</strong> Você pode visualizar todos os
                dados salvos
              </p>
              <p className={`text-sm ${themeClasses.textTertiary}`}>
                Para carregar novos dados, faça login como administrador
              </p>
            </div>
          )}
        </div>

        {/* Recursos Disponíveis */}
        <div className="mt-8 grid md:grid-cols-2 gap-4 text-left">
          <div
            className={`${themeClasses.bgSecondary} rounded-lg p-4 border ${themeClasses.border}`}
          >
            <h4 className={`font-medium ${themeClasses.textPrimary} mb-2`}>
              📊 Visualização Executiva
            </h4>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              Visão resumida e objetiva do status geral do projeto com
              métricas-chave
            </p>
          </div>
          <div
            className={`${themeClasses.bgSecondary} rounded-lg p-4 border ${themeClasses.border}`}
          >
            <h4 className={`font-medium ${themeClasses.textPrimary} mb-2`}>
              📋 Visualização Detalhada
            </h4>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              Análise completa de atividades, tarefas, prazos e status
              individuais
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
