import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  FileBarChart,
  Calendar,
  Clock,
  Activity,
} from 'lucide-react';
import { useTheme, useThemeClasses } from '../contexts/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import {
  processarCronogramaOperacional,
  ProcessedCronograma,
} from '../utils/cronogramaOperacionalProcessor';

interface CronogramaUploadProps {
  onCronogramaProcessed: (cronograma: ProcessedCronograma) => void;
}

interface UploadStatus {
  type: 'success' | 'error' | 'loading' | null;
  message: string;
}

const CronogramaUpload: React.FC<CronogramaUploadProps> = ({
  onCronogramaProcessed,
}) => {
  const { isDark } = useTheme();
  const themeClasses = useThemeClasses();
  const notifications = useNotifications();

  const [status, setStatus] = useState<UploadStatus>({
    type: null,
    message: '',
  });

  const [cronograma, setCronograma] = useState<ProcessedCronograma | null>(
    null
  );

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setStatus({
      type: 'loading',
      message: 'Processando cronograma operacional...',
    });

    try {
      const file = files[0];
      const fileName = file.name.toLowerCase();

      if (!fileName.endsWith('.csv')) {
        throw new Error(
          'Por favor, use um arquivo CSV do cronograma operacional'
        );
      }

      const text = await file.text();
      const processedCronograma = await processarCronogramaOperacional(text);

      // Salvar cronograma processado
      localStorage.setItem(
        'cronograma_operacional',
        JSON.stringify(processedCronograma)
      );

      setCronograma(processedCronograma);
      onCronogramaProcessed(processedCronograma);

      setStatus({
        type: 'success',
        message: `Cronograma carregado: ${processedCronograma.fases.length} fases, ${processedCronograma.marcos.length} marcos`,
      });

      notifications.success(
        'Cronograma Carregado',
        `${processedCronograma.metadata.titulo} processado com sucesso`
      );
    } catch (error: any) {
      console.error('Erro ao processar cronograma:', error);
      setStatus({
        type: 'error',
        message: error.message || 'Erro ao processar cronograma',
      });

      notifications.error(
        'Erro no Upload',
        error.message || 'Erro ao processar cronograma'
      );
    }
  };

  const clearCronograma = () => {
    localStorage.removeItem('cronograma_operacional');
    setCronograma(null);
    setStatus({ type: null, message: '' });
    notifications.info('Cronograma Limpo', 'Dados do cronograma removidos');
  };

  const hasCronograma = () => {
    return (
      localStorage.getItem('cronograma_operacional') !== null ||
      cronograma !== null
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  return (
    <div
      className={`p-6 rounded-lg border ${themeClasses.card} ${themeClasses.shadow}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500">
          <FileBarChart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>
            Cronograma Operacional PFUS3
          </h3>
          <p className={`text-sm ${themeClasses.textSecondary}`}>
            Carregue o cronograma operacional oficial da parada de usina
          </p>
        </div>
      </div>

      {/* Área de Upload */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
          ${
            isDragActive
              ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload
          className={`w-12 h-12 mx-auto mb-4 ${themeClasses.textSecondary}`}
        />
        <p className={`text-lg font-medium mb-2 ${themeClasses.textPrimary}`}>
          {isDragActive
            ? 'Solte o arquivo do cronograma aqui'
            : 'Upload do Cronograma Operacional'}
        </p>
        <p className={`text-sm ${themeClasses.textSecondary}`}>
          Arquivo CSV exportado do MS Project ou similar
        </p>
      </div>

      {/* Status */}
      {status.message && (
        <div
          className={`
          mt-4 p-4 rounded-lg flex items-center gap-3
          ${status.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : ''}
          ${status.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : ''}
          ${status.type === 'loading' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : ''}
        `}
        >
          {status.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {status.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {status.type === 'loading' && (
            <Activity className="w-5 h-5 animate-spin" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* Resumo do Cronograma */}
      {cronograma && (
        <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
          <h4
            className={`text-lg font-semibold mb-3 ${themeClasses.textPrimary}`}
          >
            Resumo do Cronograma
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Início
                </p>
                <p className={`font-semibold ${themeClasses.textPrimary}`}>
                  {cronograma.metadata.dataInicio || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Fim</p>
                <p className={`font-semibold ${themeClasses.textPrimary}`}>
                  {cronograma.metadata.dataFim || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-purple-500" />
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Fases</p>
                <p className={`font-semibold ${themeClasses.textPrimary}`}>
                  {cronograma.fases.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileBarChart className="w-5 h-5 text-purple-500" />
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Marcos
                </p>
                <p className={`font-semibold ${themeClasses.textPrimary}`}>
                  {cronograma.marcos.length}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              <strong>Título:</strong> {cronograma.metadata.titulo}
            </p>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              <strong>Duração:</strong> {cronograma.metadata.duracaoTotal}
            </p>
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-3 mt-6">
        {hasCronograma() && (
          <button
            onClick={clearCronograma}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              bg-red-500 hover:bg-red-600 text-white
            `}
          >
            <AlertCircle className="w-4 h-4" />
            Limpar Cronograma
          </button>
        )}

        <div
          className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm
          ${
            hasCronograma()
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }
        `}
        >
          <FileBarChart className="w-4 h-4" />
          {hasCronograma() ? 'Cronograma Carregado' : 'Sem Cronograma'}
        </div>
      </div>

      {/* Instruções */}
      <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <h4
          className={`text-sm font-medium mb-2 text-blue-700 dark:text-blue-300`}
        >
          Formato Esperado:
        </h4>
        <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
          <p>
            • <strong>ID:</strong> Identificador numérico da tarefa
          </p>
          <p>
            • <strong>Nome da tarefa:</strong> Descrição da atividade
          </p>
          <p>
            • <strong>Duration:</strong> Duração (ex: 1454.5 hrs)
          </p>
          <p>
            • <strong>Start/Finish:</strong> Datas de início e fim
          </p>
          <p>
            • <strong>Responsável da Tarefa:</strong> Nome do responsável
          </p>
        </div>
      </div>
    </div>
  );
};

export default CronogramaUpload;
