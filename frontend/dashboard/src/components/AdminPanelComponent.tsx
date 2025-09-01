import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useThemeClasses } from '../contexts/ThemeContext';
import {
  Upload,
  File,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Database,
  RefreshCw,
  Shield,
  Settings,
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpdate?: () => void;
}

interface UploadResponse {
  success: boolean;
  message: string;
  fileName?: string;
  recordsProcessed?: number;
  timestamp?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onDataUpdate,
}) => {
  const { isAdmin } = useAuth();
  const themeClasses = useThemeClasses();
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedPhaseType, setSelectedPhaseType] =
    useState<string>('preparacao');

  const phaseTypes = [
    {
      value: 'preparacao',
      label: 'Preparação',
      description: 'Cronograma de preparação da parada',
    },
    {
      value: 'operacional',
      label: 'Operacional',
      description: 'Cronograma operacional da parada',
    },
    {
      value: 'parada',
      label: 'Parada',
      description: 'Cronograma da fase de parada',
    },
    {
      value: 'manutencao',
      label: 'Manutenção',
      description: 'Cronograma de manutenção',
    },
    {
      value: 'partida',
      label: 'Partida',
      description: 'Cronograma da fase de partida',
    },
  ];

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.csv')) {
        setUploadStatus('error');
        setUploadMessage('Por favor, selecione apenas arquivos CSV.');
        return;
      }

      if (!selectedPhaseType) {
        setUploadStatus('error');
        setUploadMessage('Selecione o tipo de fase antes do upload.');
        return;
      }

      setUploadStatus('uploading');
      setUploadMessage('Fazendo upload e processando arquivo...');

      try {
        const formData = new FormData();
        formData.append('csvFile', file);
        formData.append('tipoFase', selectedPhaseType);

        const response = await fetch('/api/admin/upload-csv', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer admin-token-123', // Token fixo por enquanto
          },
          body: formData,
        });

        const result: UploadResponse = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Erro no upload');
        }

        setUploadStatus('success');
        setUploadMessage(
          `✅ ${result.message}\n` +
            `📁 Arquivo: ${result.fileName}\n` +
            `📊 Registros processados: ${result.recordsProcessed}\n` +
            `🕐 Timestamp: ${new Date(result.timestamp || '').toLocaleString('pt-BR')}`
        );

        // Atualizar dados no dashboard após sucesso
        if (onDataUpdate) {
          setTimeout(() => {
            onDataUpdate();
          }, 1000);
        }
      } catch (error) {
        setUploadStatus('error');
        setUploadMessage(
          `❌ Erro ao fazer upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        );
      }
    },
    [onDataUpdate, selectedPhaseType]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  if (!isOpen || !isAdmin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${themeClasses.card}`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Database className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2
                  className={`text-xl font-semibold ${themeClasses.textPrimary}`}
                >
                  Painel Administrativo
                </h2>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Gerenciar dados do sistema
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 hover:${themeClasses.bgSecondary} rounded-lg transition-colors`}
            >
              <X className={`w-5 h-5 ${themeClasses.textTertiary}`} />
            </button>
          </div>

          {/* Upload Area */}
          <div className="mb-6">
            <h3
              className={`text-lg font-medium ${themeClasses.textPrimary} mb-4`}
            >
              Upload de Dados
            </h3>

            {/* Seleção de Tipo de Fase */}
            <div className="mb-4">
              <label
                className={`block text-sm font-medium ${themeClasses.textPrimary} mb-2`}
              >
                Tipo de Cronograma:
              </label>
              <select
                value={selectedPhaseType}
                onChange={(e) => setSelectedPhaseType(e.target.value)}
                className={`w-full p-3 border rounded-lg ${themeClasses.border} ${themeClasses.bgSecondary} ${themeClasses.textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                {phaseTypes.map((phase) => (
                  <option key={phase.value} value={phase.value}>
                    {phase.label} - {phase.description}
                  </option>
                ))}
              </select>
              <p className={`text-xs ${themeClasses.textTertiary} mt-1`}>
                Selecione o tipo de cronograma que você está enviando
              </p>
            </div>

            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : `${themeClasses.border} hover:border-blue-300 dark:hover:border-blue-600`
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadStatus === 'uploading'}
              />

              <div className="space-y-4">
                {uploadStatus === 'uploading' ? (
                  <RefreshCw className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
                ) : (
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                )}

                <div>
                  <p className="text-lg font-medium text-gray-700">
                    {uploadStatus === 'uploading'
                      ? 'Fazendo upload...'
                      : 'Arraste e solte ou clique para selecionar'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Suporte apenas para arquivos CSV (máx. 10MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Status Message */}
            {uploadMessage && (
              <div
                className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                  uploadStatus === 'success'
                    ? 'bg-green-50 text-green-700'
                    : uploadStatus === 'error'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-blue-50 text-blue-700'
                }`}
              >
                {uploadStatus === 'success' && (
                  <CheckCircle className="w-5 h-5" />
                )}
                {uploadStatus === 'error' && (
                  <AlertCircle className="w-5 h-5" />
                )}
                {uploadStatus === 'uploading' && (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                )}
                <span>{uploadMessage}</span>
              </div>
            )}
          </div>

          {/* File Management */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Arquivos Atuais
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-800">
                      cronograma.csv
                    </div>
                    <div className="text-sm text-gray-500">
                      Última atualização: hoje, 14:30
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg">
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDataUpdate && onDataUpdate()}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                if (onDataUpdate) onDataUpdate();
                setUploadStatus('idle');
                setUploadMessage('');
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Atualizar Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
