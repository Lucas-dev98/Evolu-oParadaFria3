import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Download,
  RefreshCw,
  Settings,
  Zap,
} from 'lucide-react';
import CSVUploader from './CSVUploader';
import PFUS3Uploader from './PFUS3Uploader';

interface CSVManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesUpdated?: () => void;
  onPFUS3PhasesUpdate?: (phases: any[]) => void;
}

const CSVManagerModal: React.FC<CSVManagerModalProps> = ({
  isOpen,
  onClose,
  onFilesUpdated,
  onPFUS3PhasesUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<
    'upload' | 'status' | 'backup' | 'pfus3'
  >('upload');

  if (!isOpen) return null;

  const handleUploadSuccess = () => {
    console.log('✅ CSV atualizado com sucesso!');
    onFilesUpdated?.();
  };

  const handleUploadError = (error: string) => {
    console.error('❌ Erro no upload:', error);
    alert(`Erro: ${error}`);
  };

  const handlePFUS3UploadSuccess = (message: string) => {
    console.log('✅ PFUS3 carregado com sucesso!', message);
    alert(`Sucesso: ${message}`);
    onFilesUpdated?.();
  };

  const handlePFUS3UploadError = (error: string) => {
    console.error('❌ Erro no upload PFUS3:', error);
    alert(`Erro PFUS3: ${error}`);
  };

  // Verificar status dos arquivos
  const checkFileStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/csv/status');
      if (response.ok) {
        const data = await response.json();
        return data.files;
      }
      return [];
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return [];
    }
  };

  const downloadCurrentFile = async (fileName: string) => {
    try {
      const response = await fetch(`/${fileName}`);
      if (response.ok) {
        const csvContent = await response.text();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Arquivo não encontrado');
      }
    } catch (error) {
      alert('Erro ao baixar arquivo');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              Gerenciar Arquivos CSV
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'upload'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'status'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Status
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'backup'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Download className="w-4 h-4 inline mr-2" />
              Backup
            </button>
            <button
              onClick={() => setActiveTab('pfus3')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'pfus3'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              PFUS3
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {activeTab === 'upload' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  Upload de Novos Arquivos
                </h3>
                <p className="text-gray-600">
                  Selecione e faça upload dos novos arquivos CSV para atualizar
                  os cronogramas.
                </p>
              </div>
              <CSVUploader
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Status dos Arquivos
                </h3>
              </div>

              {/* Cronograma Preparação */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-semibold">
                        Cronograma de Preparação
                      </div>
                      <div className="text-sm text-gray-500">
                        cronograma-preparacao-real.csv
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        downloadCurrentFile('cronograma-preparacao-real.csv')
                      }
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Baixar
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>
                    📍 Localização: /public/cronograma-preparacao-real.csv
                  </div>
                  <div>🕒 Carregado na inicialização da aplicação</div>
                  <div>📊 Usado em: Analytics → KPIs, Gantt, CPM, Fases</div>
                </div>
              </div>

              {/* Cronograma Operacional */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-semibold">
                        Cronograma Operacional
                      </div>
                      <div className="text-sm text-gray-500">
                        cronograma-operacional.csv
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        downloadCurrentFile('cronograma-operacional.csv')
                      }
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      Baixar
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>📍 Localização: /public/cronograma-operacional.csv</div>
                  <div>🕒 Carregado na inicialização da aplicação</div>
                  <div>📊 Usado em: Modo Detalhado → Lista e resumo</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Backup e Histórico
                </h3>
                <p className="text-gray-600 mb-4">
                  Gerencie backups dos arquivos CSV e mantenha um histórico das
                  versões.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-semibold text-blue-700 mb-2">
                      Backup Automático
                    </div>
                    <div className="text-blue-600 text-sm space-y-1">
                      <div>
                        • Backup automático é feito antes de cada upload
                      </div>
                      <div>• Arquivos são baixados com timestamp no nome</div>
                      <div>• Formato: backup-[tipo]-[data-hora].csv</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-semibold">
                      Backup Manual - Preparação
                    </div>
                    <div className="text-sm text-gray-500">
                      Baixar cópia atual do cronograma de preparação
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const timestamp = new Date()
                        .toISOString()
                        .replace(/[:.]/g, '-');
                      downloadCurrentFile('cronograma-preparacao-real.csv');
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Baixar Backup
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-semibold">
                      Backup Manual - Operacional
                    </div>
                    <div className="text-sm text-gray-500">
                      Baixar cópia atual do cronograma operacional
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const timestamp = new Date()
                        .toISOString()
                        .replace(/[:.]/g, '-');
                      downloadCurrentFile('cronograma-operacional.csv');
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Baixar Backup
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pfus3' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Upload Cronograma PFUS3
                </h3>
                <p className="text-gray-600">
                  Carregue o arquivo CSV do cronograma PFUS3 para gerenciar as
                  fases de parada, manutenção e partida do sistema.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-semibold text-blue-700 mb-2">
                      Formato Esperado PFUS3
                    </div>
                    <div className="text-blue-600 text-sm space-y-1">
                      <div>
                        • <strong>Separador:</strong> Ponto e vírgula (;)
                      </div>
                      <div>
                        • <strong>Headers:</strong> Id, EDT, Nome, Duração,
                        Início, Término
                      </div>
                      <div>
                        • <strong>Fases EDT:</strong> 1.7 (Parada), 1.8
                        (Manutenção), 1.9 (Partida)
                      </div>
                      <div>
                        • <strong>Encoding:</strong> UTF-8 com suporte a acentos
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <PFUS3Uploader
                onPhasesUpdate={onPFUS3PhasesUpdate}
                onUploadSuccess={handlePFUS3UploadSuccess}
                onUploadError={handlePFUS3UploadError}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              💡 Após atualizar arquivos na pasta /public/, recarregue a
              aplicação
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  console.log('🔄 Recarregando aplicação...');
                  onFilesUpdated?.();
                  window.location.reload();
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                🔄 Recarregar Aplicação
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVManagerModal;
