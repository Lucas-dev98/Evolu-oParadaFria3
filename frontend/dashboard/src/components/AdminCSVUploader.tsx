import React, { useState } from 'react';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Lock,
  Users,
  Settings,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import {
  CSVPhaseProcessor,
  ProcessedPhaseData,
} from '../services/csvPhaseProcessor';
import LoginModal from './LoginModal';

interface AdminCSVUploaderProps {
  onDataUpdate: (data: ProcessedPhaseData) => void;
  className?: string;
}

const AdminCSVUploader: React.FC<AdminCSVUploaderProps> = ({
  onDataUpdate,
  className = '',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { success, error, info } = useNotifications();

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      error('Arquivo inválido', 'Por favor, selecione um arquivo CSV.');
      return;
    }

    setSelectedFile(file);
    info('Arquivo selecionado', `${file.name} pronto para upload.`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      error('Nenhum arquivo', 'Selecione um arquivo CSV primeiro.');
      return;
    }

    if (!isAdmin) {
      error(
        'Acesso negado',
        'Apenas administradores podem fazer upload de arquivos.'
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Processar o arquivo CSV
      const processedData =
        await CSVPhaseProcessor.processCSVFile(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Aguardar um pouco para mostrar 100%
      setTimeout(() => {
        onDataUpdate(processedData);
        success(
          'Upload concluído',
          `Dados do arquivo ${selectedFile.name} foram processados com sucesso!`
        );

        // Reset
        setSelectedFile(null);
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);
    } catch (err) {
      error(
        'Erro no processamento',
        'Falha ao processar o arquivo CSV. Verifique o formato do arquivo.'
      );
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleLoginSuccess = () => {
    info('Acesso liberado', 'Agora você pode fazer upload de arquivos CSV.');
  };

  if (!isAuthenticated) {
    return (
      <>
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center ${className}`}
        >
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Acesso Restrito
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            É necessário fazer login como administrador para acessar o upload de
            arquivos CSV.
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Lock className="w-4 h-4" />
            <span>Fazer Login</span>
          </button>
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className={`bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 ${className}`}
      >
        <div className="flex items-start space-x-3">
          <Users className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
              Permissão Insuficiente
            </h3>
            <p className="text-amber-700 dark:text-amber-300 mb-4">
              Olá <strong>{user?.username}</strong>, seu acesso não permite
              fazer upload de arquivos CSV. Entre em contato com um
              administrador para obter as permissões necessárias.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-amber-600 dark:text-amber-400">
                Seu perfil:{' '}
                <strong>
                  {user?.role === 'visitor'
                    ? 'Visitante'
                    : user?.role === 'admin'
                      ? 'Administrador'
                      : 'Usuário'}
                </strong>
              </span>
              <button
                onClick={logout}
                className="text-sm text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium"
              >
                Fazer logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upload CSV - Administrador
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Bem-vindo, <strong>{user?.username}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Logout
          </button>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Arquivo Selecionado
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Arraste o arquivo CSV aqui
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  ou clique para selecionar
                </p>
              </div>
            </div>
          )}

          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
            disabled={isUploading}
          />

          {!selectedFile && (
            <label
              htmlFor="csv-upload"
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Selecionar Arquivo</span>
            </label>
          )}
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Processando arquivo...
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <AlertCircle className="w-4 h-4" />
            <span>Apenas arquivos CSV das frentes de trabalho</span>
          </div>

          <div className="flex space-x-3">
            {selectedFile && (
              <button
                onClick={() => setSelectedFile(null)}
                disabled={isUploading}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Processando...' : 'Fazer Upload'}</span>
            </button>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default AdminCSVUploader;
