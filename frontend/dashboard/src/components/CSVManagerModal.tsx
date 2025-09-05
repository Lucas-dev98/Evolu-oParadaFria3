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
import { processarCronogramaPreparacao } from '../utils/cronogramaPreparacaoProcessor';

// Função para analisar seções do PFUS3 baseado no EDT
const analisarSecoesPFUS3 = (data: any[]) => {
  const secoes = {
    parada: 0,
    manutencao: 0,
    partida: 0,
    outros: 0,
  };

  data.forEach((row) => {
    const edt = row.EDT || '';
    if (edt.startsWith('1.7')) {
      secoes.parada++;
    } else if (edt.startsWith('1.8')) {
      secoes.manutencao++;
    } else if (edt.startsWith('1.9')) {
      secoes.partida++;
    } else {
      secoes.outros++;
    }
  });

  return secoes;
};

interface CSVManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesUpdated?: () => void;
  onPFUS3PhasesUpdate?: (phases: any[]) => void;
  onPreparacaoUpdate?: (dadosPreparacao: any) => void;
}

const CSVManagerModal: React.FC<CSVManagerModalProps> = ({
  isOpen,
  onClose,
  onFilesUpdated,
  onPFUS3PhasesUpdate,
  onPreparacaoUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<
    'upload' | 'status' | 'backup' | 'pfus3'
  >('upload');

  if (!isOpen) return null;

  const handleUploadSuccess = async (
    data: any[],
    type: 'preparacao' | 'pfus3'
  ) => {
    console.log('✅ CSV atualizado com sucesso!', {
      type,
      recordCount: data.length,
    });

    // Processar dados dependendo do tipo
    if (type === 'preparacao') {
      try {
        console.log('📋 Processando dados de preparação...');

        // Converter dados para formato CSV string para processar
        const headers = Object.keys(data[0] || {});
        const csvContent = [
          headers.join(','),
          ...data.map((row) =>
            headers
              .map(
                (header) =>
                  `"${(row[header] || '').toString().replace(/"/g, '""')}"`
              )
              .join(',')
          ),
        ].join('\n');

        console.log('� CSV convertido:', csvContent.substring(0, 200) + '...');

        // Processar usando o processador de preparação
        const dadosProcessados =
          await processarCronogramaPreparacao(csvContent);
        console.log('✅ Dados de preparação processados:', dadosProcessados);

        // Chamar callback para atualizar dados na aplicação
        if (onPreparacaoUpdate) {
          onPreparacaoUpdate(dadosProcessados);
          console.log('🔄 Dados de preparação enviados para aplicação');
        }

        alert(
          `Cronograma de preparação carregado com sucesso!\n${dadosProcessados.atividades?.length || 0} atividades processadas\nProgresso: ${dadosProcessados.fase?.progress || 0}%`
        );
      } catch (error) {
        console.error('❌ Erro ao processar dados de preparação:', error);
        alert(
          `Erro ao processar dados de preparação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        );
      }
    } else if (type === 'pfus3') {
      try {
        console.log('⚡ Processando dados PFUS3 completos...');

        // Converter dados para formato CSV string para processar
        const headers = Object.keys(data[0] || {});
        const csvContent = [
          headers.join(';'), // PFUS3 usa ponto e vírgula
          ...data.map((row) =>
            headers
              .map((header) => {
                const value = (row[header] || '')
                  .toString()
                  .replace(/"/g, '""');
                // Se contém vírgula ou ponto e vírgula, envolver em aspas
                return value.includes(';') || value.includes(',')
                  ? `"${value}"`
                  : value;
              })
              .join(';')
          ),
        ].join('\n');

        console.log(
          '🔄 CSV PFUS3 convertido:',
          csvContent.substring(0, 300) + '...'
        );

        // Analisar seções do PFUS3 por EDT
        const secoes = analisarSecoesPFUS3(data);
        console.log('📊 Seções identificadas:', secoes);

        // Processar usando o processador PFUS3
        const { processarCronogramaOperacional: processarPFUS3 } = await import(
          '../utils/cronogramaOperacionalProcessorPFUS3'
        );
        const dadosProcessados = await processarPFUS3(csvContent);

        console.log('✅ Dados PFUS3 processados:', dadosProcessados);

        // Chamar callback para atualizar fases na aplicação
        if (onPFUS3PhasesUpdate && dadosProcessados.phases) {
          onPFUS3PhasesUpdate(dadosProcessados.phases);
          console.log('🔄 Fases PFUS3 enviadas para aplicação');
        }

        alert(
          `Cronograma PFUS3 carregado com sucesso!\n` +
            `Parada: ${secoes.parada} atividades\n` +
            `Manutenção: ${secoes.manutencao} atividades\n` +
            `Partida: ${secoes.partida} atividades\n` +
            `Total: ${data.length} registros`
        );
      } catch (error) {
        console.error('❌ Erro ao processar dados PFUS3:', error);
        alert(
          `Erro ao processar dados PFUS3: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        );
      }
    }

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

  // Função para carregar seção específica do PFUS3
  const carregarSecaoPFUS3 = async (
    secao: 'parada' | 'manutencao' | 'partida'
  ) => {
    try {
      console.log(`🔄 Carregando seção ${secao} do PFUS3...`);

      // Verificar se arquivo PFUS3 existe
      const response = await fetch('/250820 - Report PFUS3.csv');
      if (!response.ok) {
        throw new Error('Arquivo PFUS3 não encontrado');
      }

      const csvText = await response.text();
      console.log(`📄 Arquivo PFUS3 carregado, processando seção ${secao}...`);

      // Filtrar dados por seção baseado no EDT
      const lines = csvText.split('\n');
      const headers = lines[0].split(';');

      const filteredLines = [headers.join(';')]; // Manter cabeçalho

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(';');
        const edt = columns[1] || ''; // Assumindo que EDT está na segunda coluna

        let incluir = false;

        switch (secao) {
          case 'parada':
            incluir = edt.startsWith('1.7');
            break;
          case 'manutencao':
            incluir = edt.startsWith('1.8');
            break;
          case 'partida':
            incluir = edt.startsWith('1.9');
            break;
        }

        if (incluir) {
          filteredLines.push(line);
        }
      }

      const filteredCSV = filteredLines.join('\n');
      console.log(
        `✅ Seção ${secao} filtrada: ${filteredLines.length - 1} atividades`
      );

      // Processar dados filtrados
      const { processarCronogramaOperacional: processarPFUS3 } = await import(
        '../utils/cronogramaOperacionalProcessorPFUS3'
      );
      const dadosProcessados = await processarPFUS3(filteredCSV);

      console.log(`✅ Dados da seção ${secao} processados:`, dadosProcessados);

      // Atualizar aplicação com dados da seção específica
      if (onPFUS3PhasesUpdate && dadosProcessados.phases) {
        onPFUS3PhasesUpdate(dadosProcessados.phases);
        console.log(`🔄 Seção ${secao} enviada para aplicação`);
      }

      alert(
        `Seção ${secao.toUpperCase()} carregada com sucesso!\n` +
          `${filteredLines.length - 1} atividades carregadas`
      );
    } catch (error) {
      console.error(`❌ Erro ao carregar seção ${secao}:`, error);
      alert(
        `Erro ao carregar seção ${secao}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
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
                        290805 - Cronograma Preparação - PFUS3.csv
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        downloadCurrentFile(
                          '290805 - Cronograma Preparação - PFUS3.csv'
                        )
                      }
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Baixar
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>
                    📍 Localização: /public/290805 - Cronograma Preparação -
                    PFUS3.csv
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

              {/* Arquivo PFUS3 Completo */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="font-semibold">Report PFUS3 Completo</div>
                      <div className="text-sm text-gray-500">
                        250820 - Report PFUS3.csv
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        downloadCurrentFile('250820 - Report PFUS3.csv')
                      }
                      className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                    >
                      Baixar
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>📍 Localização: /public/250820 - Report PFUS3.csv</div>
                  <div>🕒 Contém todas as fases do cronograma operacional</div>
                  <div>📊 Usado em: Analytics → Hierarquia completa PFUS3</div>
                  <div>
                    📈 Inclui: Parada, Manutenção, Partida, e subatividades
                  </div>
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
                      downloadCurrentFile(
                        '290805 - Cronograma Preparação - PFUS3.csv'
                      );
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
                  Gerenciar Cronograma PFUS3
                </h3>
                <p className="text-gray-600">
                  Carregue e gerencie as diferentes seções do cronograma PFUS3:
                  Parada, Manutenção e Partida.
                </p>
              </div>

              {/* Status do Arquivo PFUS3 Atual */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-purple-700 mb-2">
                      Arquivo PFUS3 Atual
                    </div>
                    <div className="text-purple-600 text-sm space-y-1">
                      <div>
                        📁 <strong>Arquivo:</strong> 250820 - Report PFUS3.csv
                      </div>
                      <div>
                        📊 <strong>Total de registros:</strong> ~4.579
                        atividades
                      </div>
                      <div>
                        🏗️ <strong>Fases incluídas:</strong> Parada, Manutenção,
                        Partida
                      </div>
                      <div>
                        📈 <strong>Estrutura:</strong> Hierárquica com EDT
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seções do PFUS3 */}
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-gray-800">
                  Seções Disponíveis:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Seção Parada */}
                  <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <h5 className="font-semibold text-red-700">
                        Procedimentos de Parada
                      </h5>
                    </div>
                    <div className="text-sm text-red-600 space-y-1 mb-3">
                      <div>• EDT: 1.7.x</div>
                      <div>• Sistemas: Alimentação, Moagem, Espessador</div>
                      <div>• Foco: Desligamento seguro</div>
                    </div>
                    <button
                      onClick={() => carregarSecaoPFUS3('parada')}
                      className="w-full px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                    >
                      Carregar Seção
                    </button>
                  </div>

                  {/* Seção Manutenção */}
                  <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <h5 className="font-semibold text-orange-700">
                        Manutenções
                      </h5>
                    </div>
                    <div className="text-sm text-orange-600 space-y-1 mb-3">
                      <div>• EDT: 1.8.x</div>
                      <div>• Sistemas: Todos os equipamentos</div>
                      <div>• Foco: Manutenção preventiva</div>
                    </div>
                    <button
                      onClick={() => carregarSecaoPFUS3('manutencao')}
                      className="w-full px-3 py-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors text-sm"
                    >
                      Carregar Seção
                    </button>
                  </div>

                  {/* Seção Partida */}
                  <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h5 className="font-semibold text-green-700">
                        Procedimentos de Partida
                      </h5>
                    </div>
                    <div className="text-sm text-green-600 space-y-1 mb-3">
                      <div>• EDT: 1.9.x</div>
                      <div>• Sistemas: Todos os equipamentos</div>
                      <div>• Foco: Start-up controlado</div>
                    </div>
                    <button
                      onClick={() => carregarSecaoPFUS3('partida')}
                      className="w-full px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
                    >
                      Carregar Seção
                    </button>
                  </div>
                </div>
              </div>

              {/* Formato Esperado */}
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
                        Início, Término, Área, Responsável_da_Tarefa
                      </div>
                      <div>
                        • <strong>Fases EDT:</strong> 1.7 (Parada), 1.8
                        (Manutenção), 1.9 (Partida)
                      </div>
                      <div>
                        • <strong>Encoding:</strong> UTF-8 com correção
                        automática de acentos
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
