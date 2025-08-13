import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  FileBarChart,
  Calendar,
  Activity,
  Settings,
} from 'lucide-react';
import { useTheme, useThemeClasses } from '../contexts/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import {
  processarCronogramaPreparacao,
  ProcessedPreparacao,
} from '../utils/cronogramaPreparacaoProcessor';

interface PreparacaoUploadProps {
  onPreparacaoProcessed: (preparacao: ProcessedPreparacao) => void;
}

const PreparacaoUpload: React.FC<PreparacaoUploadProps> = ({
  onPreparacaoProcessed,
}) => {
  const [uploadState, setUploadState] = useState<
    'idle' | 'processing' | 'success' | 'error'
  >('idle');
  const [processedData, setProcessedData] =
    useState<ProcessedPreparacao | null>(null);
  const [error, setError] = useState<string>('');

  const { isDark } = useTheme();
  const themeClasses = useThemeClasses();
  const { success: addSuccessNotification, error: addErrorNotification } =
    useNotifications();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploadState('processing');
      setError('');

      try {
        const text = await file.text();
        const processed = await processarCronogramaPreparacao(text);

        setProcessedData(processed);
        setUploadState('success');
        onPreparacaoProcessed(processed);

        addSuccessNotification(
          'Upload Realizado com Sucesso',
          `Cronograma de preparação processado: ${processed.fase.activities} atividades, ${Math.round(processed.fase.progress)}% concluído`
        );
      } catch (err) {
        console.error('Erro ao processar cronograma de preparação:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setUploadState('error');

        addErrorNotification(
          'Erro no Upload',
          'Não foi possível processar o arquivo CSV de preparação'
        );
      }
    },
  });

  const resetUpload = () => {
    setUploadState('idle');
    setProcessedData(null);
    setError('');
  };

  return (
    <div className={`space-y-6 ${themeClasses.card} p-6 rounded-lg shadow-sm`}>
      {/* Cabeçalho */}
      <div className="flex items-center space-x-3">
        <Settings className="w-6 h-6 text-blue-500" />
        <div>
          <h3 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>
            Upload - Cronograma de Preparação
          </h3>
          <p className={`${themeClasses.textSecondary} text-sm`}>
            Arquivo CSV com dados detalhados da fase de preparação (com % de
            progresso e dependências)
          </p>
        </div>
      </div>

      {/* Área de Upload */}
      {uploadState === 'idle' && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className={`text-lg font-medium ${themeClasses.textPrimary} mb-2`}>
            {isDragActive
              ? 'Solte o arquivo aqui...'
              : 'Arraste o arquivo CSV ou clique para selecionar'}
          </p>
          <p className={`${themeClasses.textSecondary} text-sm`}>
            Arquivo esperado: "250805 - Cronograma Preparação - PFUS3.csv"
          </p>
          <p className={`${themeClasses.textSecondary} text-xs mt-2`}>
            Formato: CSV com colunas de ID, Nome da tarefa, % Complete,
            Duration, Start, Finish, etc.
          </p>
        </div>
      )}

      {/* Estados de Processamento */}
      {uploadState === 'processing' && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${themeClasses.textPrimary} text-lg font-medium`}>
            Processando cronograma de preparação...
          </p>
          <p className={`${themeClasses.textSecondary} text-sm mt-2`}>
            Analisando atividades, progresso e dependências
          </p>
        </div>
      )}

      {uploadState === 'error' && (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">
            Erro no processamento
          </p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={resetUpload}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {uploadState === 'success' && processedData && (
        <div className="space-y-6">
          {/* Indicador de Sucesso */}
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-green-600 dark:text-green-400 text-lg font-medium">
              Cronograma processado com sucesso!
            </p>
          </div>

          {/* Informações do Cronograma */}
          <div className={`${themeClasses.bgSecondary} p-4 rounded-lg`}>
            <div className="flex items-center space-x-2 mb-3">
              <FileBarChart className="w-5 h-5 text-blue-500" />
              <h4 className={`font-semibold ${themeClasses.textPrimary}`}>
                Informações do Cronograma
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className={`${themeClasses.textSecondary}`}>Título:</span>
                <p className={`${themeClasses.textPrimary} font-medium`}>
                  {processedData.metadata.titulo}
                </p>
              </div>

              <div>
                <span className={`${themeClasses.textSecondary}`}>
                  Duração Total:
                </span>
                <p className={`${themeClasses.textPrimary} font-medium`}>
                  {processedData.metadata.duracaoTotal}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <span className={`${themeClasses.textSecondary}`}>
                    Início:
                  </span>
                  <p className={`${themeClasses.textPrimary} font-medium`}>
                    {new Date(
                      processedData.metadata.dataInicio
                    ).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <span className={`${themeClasses.textSecondary}`}>Fim:</span>
                  <p className={`${themeClasses.textPrimary} font-medium`}>
                    {new Date(
                      processedData.metadata.dataFim
                    ).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas da Fase */}
          <div className={`${themeClasses.bgSecondary} p-4 rounded-lg`}>
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="w-5 h-5 text-blue-500" />
              <h4 className={`font-semibold ${themeClasses.textPrimary}`}>
                Estatísticas da Fase de Preparação
              </h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {processedData.fase.progress}%
                </div>
                <div className={`${themeClasses.textSecondary}`}>
                  Progresso Geral
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {processedData.fase.completedActivities}
                </div>
                <div className={`${themeClasses.textSecondary}`}>
                  Concluídas
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {processedData.fase.inProgressTasks}
                </div>
                <div className={`${themeClasses.textSecondary}`}>
                  Em Andamento
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {processedData.fase.delayedActivities}
                </div>
                <div className={`${themeClasses.textSecondary}`}>Atrasadas</div>
              </div>
            </div>

            <div className="mt-4">
              <div className={`${themeClasses.textSecondary} text-xs mb-1`}>
                Progresso Físico: {processedData.metadata.progressoFisico}%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${processedData.fase.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex space-x-3">
            <button
              onClick={resetUpload}
              className={`px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
            >
              Carregar Outro Arquivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreparacaoUpload;
