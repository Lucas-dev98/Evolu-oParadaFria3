import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Upload,
  File,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Database,
  RefreshCw,
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpdate?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onDataUpdate,
}) => {
  const { isAdmin } = useAuth();
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.csv')) {
        setUploadStatus('error');
        setUploadMessage('Por favor, selecione apenas arquivos CSV.');
        return;
      }

      setUploadStatus('uploading');
      setUploadMessage('Fazendo upload do arquivo...');

      try {
        // Simular upload
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Aqui você implementaria a lógica real de upload
        // const formData = new FormData();
        // formData.append('file', file);
        // const response = await fetch('/api/upload', { method: 'POST', body: formData });

        setUploadStatus('success');
        setUploadMessage(`Arquivo "${file.name}" carregado com sucesso!`);

        // Atualizar dados no dashboard
        if (onDataUpdate) {
          setTimeout(() => {
            onDataUpdate();
          }, 1000);
        }
      } catch (error) {
        setUploadStatus('error');
        setUploadMessage('Erro ao fazer upload do arquivo. Tente novamente.');
      }
    },
    [onDataUpdate]
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Painel Administrativo
                </h2>
                <p className="text-sm text-gray-600">
                  Gerenciar dados do sistema
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Upload Area */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Upload de Dados
            </h3>

            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
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
