import React from 'react';
import { Upload, FileSpreadsheet, BarChart3, Calendar } from 'lucide-react';

interface WelcomeScreenProps {
  onCarregarDados: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCarregarDados }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        {/* Ícone Principal */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard PFUS3 2025
          </h1>
          <p className="text-lg text-gray-600">
            Sistema de Monitoramento da Preparação
          </p>
        </div>

        {/* Instruções */}
        <div className="bg-white rounded-xl shadow-lg p-8 border">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Para começar, carregue os dados do cronograma
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Passo 1 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">
                1. Carregar Arquivo
              </h3>
              <p className="text-sm text-gray-600">
                Clique em "Carregar Dados" para enviar o arquivo CSV do
                cronograma
              </p>
            </div>

            {/* Passo 2 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">
                2. Processar Dados
              </h3>
              <p className="text-sm text-gray-600">
                O sistema processará automaticamente as informações do
                cronograma PFUS3
              </p>
            </div>

            {/* Passo 3 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">3. Visualizar</h3>
              <p className="text-sm text-gray-600">
                Acesse as visualizações executiva e detalhada do progresso
              </p>
            </div>
          </div>

          {/* Botão de Ação */}
          <button
            onClick={onCarregarDados}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Upload className="w-5 h-5" />
            <span>Carregar Dados do Cronograma</span>
          </button>
        </div>

        {/* Recursos Disponíveis */}
        <div className="mt-8 grid md:grid-cols-2 gap-4 text-left">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-medium text-gray-800 mb-2">
              📊 Visualização Executiva
            </h4>
            <p className="text-sm text-gray-600">
              Visão resumida e objetiva do status geral do projeto com
              métricas-chave
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-medium text-gray-800 mb-2">
              📋 Visualização Detalhada
            </h4>
            <p className="text-sm text-gray-600">
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
