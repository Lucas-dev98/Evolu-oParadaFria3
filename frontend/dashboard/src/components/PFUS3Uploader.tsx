import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { processarCronogramaOperacional } from '../utils/cronogramaOperacionalProcessorPFUS3';
import { processarCronogramaPreparacao } from '../utils/cronogramaPreparacaoProcessor';
import { PFUS3FileDetectorComponent } from '../utils/PFUS3FileDetectorComponent';
import { Phase } from '../types/phases';

interface PFUS3UploaderProps {
  onPhasesUpdate?: (phases: Phase[]) => void;
  onUploadSuccess?: (message: string) => void;
  onUploadError?: (error: string) => void;
}

interface CSVPreview {
  headers: string[];
  rows: string[][];
  totalRows: number;
  isValid: boolean;
  errors: string[];
  phases: {
    parada: number;
    manutencao: number;
    partida: number;
  };
}

const PFUS3Uploader: React.FC<PFUS3UploaderProps> = ({
  onPhasesUpdate,
  onUploadSuccess,
  onUploadError,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<CSVPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Analisar CSV para preview e validação
  const analyzeCSV = useCallback(async (file: File): Promise<CSVPreview> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter((line) => line.trim());

          if (lines.length < 2) {
            reject(
              new Error(
                'CSV deve ter pelo menos uma linha de cabeçalho e uma linha de dados'
              )
            );
            return;
          }

          // Detectar separador baseado no primeiro header
          const firstLine = lines[0];
          const hasSemicolon = firstLine.includes(';');
          const hasComma = firstLine.includes(',');
          const separator = hasSemicolon && !hasComma ? ';' : ',';

          const headers = lines[0].split(separator).map((h) => h.trim());
          const rows = lines
            .slice(1, 6)
            .map((line) => line.split(separator).map((cell) => cell.trim()));

          console.log('🔍 Análise do CSV:', {
            fileName: file.name,
            separator,
            headers: headers.slice(0, 5), // Primeiros 5 headers
            totalLines: lines.length,
          });

          const errors: string[] = [];
          let requiredHeaders: string[] = [];

          // Detectar tipo de arquivo e aplicar validação correspondente
          if (
            headers.includes('ID') &&
            headers.includes('Nome da tarefa') &&
            headers.includes('Duration')
          ) {
            // Arquivo de Preparação
            requiredHeaders = [
              'ID',
              'Nome da tarefa',
              '% Complete',
              'Duration',
              'Start',
              'Finish',
            ];
            console.log('📁 Tipo detectado: Arquivo de Preparação');
          } else if (
            headers.some((h) => h.includes('Id')) &&
            headers.some((h) => h.includes('EDT')) &&
            headers.some((h) => h.includes('Nome'))
          ) {
            // Arquivo Report PFUS3
            requiredHeaders = [
              'Id',
              'EDT',
              'Nome',
              'Porcentagem_Prev_Real',
              'Duração',
              'Início',
              'Término',
            ];
            console.log('📁 Tipo detectado: Arquivo Report PFUS3');
          } else {
            errors.push(
              'Formato de arquivo não reconhecido. Verifique se é um arquivo PFUS3 válido.'
            );
          }

          // Validar headers obrigatórios
          const missingHeaders = requiredHeaders.filter(
            (required) =>
              !headers.some((header) =>
                header
                  .toLowerCase()
                  .includes(required.toLowerCase().replace(/[_%]/g, ''))
              )
          );

          if (missingHeaders.length > 0) {
            errors.push(
              `Colunas obrigatórias ausentes: ${missingHeaders.join(', ')}`
            );
          }

          // Contar atividades por fase (ajustado para ambos os formatos)
          const allLines = lines.slice(1);
          let paradaCount = 0;
          let manutencaoCount = 0;
          let partidaCount = 0;

          if (headers.includes('Nome da tarefa')) {
            // Formato de Preparação
            paradaCount = allLines.filter((line) =>
              line.toLowerCase().includes('parada')
            ).length;
            manutencaoCount = allLines.filter(
              (line) =>
                line.toLowerCase().includes('manutenção') ||
                line.toLowerCase().includes('manutencao')
            ).length;
            partidaCount = allLines.filter((line) =>
              line.toLowerCase().includes('partida')
            ).length;
          } else {
            // Formato Report
            paradaCount = allLines.filter((line) =>
              line.includes('1.7')
            ).length;
            manutencaoCount = allLines.filter((line) =>
              line.includes('1.8')
            ).length;
            partidaCount = allLines.filter((line) =>
              line.includes('1.9')
            ).length;
          }

          resolve({
            headers,
            rows,
            totalRows: lines.length - 1,
            isValid: errors.length === 0,
            errors,
            phases: {
              parada: paradaCount,
              manutencao: manutencaoCount,
              partida: partidaCount,
            },
          });
        } catch (error) {
          reject(
            new Error('Erro ao analisar CSV: ' + (error as Error).message)
          );
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file, 'UTF-8');
    });
  }, []);

  // Processar arquivo selecionado
  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        onUploadError?.('Por favor, selecione um arquivo CSV válido');
        return;
      }

      setSelectedFile(file);
      setIsProcessing(true);

      try {
        const analysis = await analyzeCSV(file);
        setPreview(analysis);
        setShowPreview(true);

        if (!analysis.isValid) {
          onUploadError?.(
            `Arquivo CSV inválido: ${analysis.errors.join(', ')}`
          );
        }
      } catch (error) {
        onUploadError?.(
          error instanceof Error ? error.message : 'Erro ao analisar arquivo'
        );
        setPreview(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [analyzeCSV, onUploadError]
  );

  // Upload e processamento do arquivo
  const handleUpload = useCallback(async () => {
    if (!selectedFile || !preview?.isValid) {
      onUploadError?.('Selecione um arquivo CSV válido');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const csvText = e.target?.result as string;

          // Detectar tipo de arquivo
          const fileType = PFUS3FileDetectorComponent.detectFileType(
            csvText,
            selectedFile.name
          );

          console.log('🔍 Tipo de arquivo detectado:', fileType);

          let processedData;

          if (fileType === 'preparacao') {
            // Usar processador de preparação
            console.log('📊 Processando com processador de preparação...');
            const preparacaoData = await processarCronogramaPreparacao(csvText);

            // Converter para formato esperado
            processedData = {
              phases: [preparacaoData.fase], // ProcessedPreparacao.fase é uma Phase
              activities: preparacaoData.atividades,
              summary: preparacaoData.metadata,
            };
          } else {
            // Usar processador operacional (report)
            console.log('📊 Processando com processador operacional...');
            processedData = await processarCronogramaOperacional(csvText);
          }

          // Atualizar as fases
          if (onPhasesUpdate) {
            onPhasesUpdate(processedData.phases);
          }

          // Salvar no localStorage para persistência
          localStorage.setItem(
            'pfus3_phases',
            JSON.stringify(processedData.phases)
          );
          localStorage.setItem(
            'pfus3_metadata',
            JSON.stringify(processedData.metadata)
          );

          onUploadSuccess?.(`Cronograma PFUS3 carregado com sucesso! 
            Fases identificadas: ${processedData.phases.length}
            - Parada: ${preview.phases.parada} atividades
            - Manutenção: ${preview.phases.manutencao} atividades  
            - Partida: ${preview.phases.partida} atividades`);

          // Reset do componente
          setSelectedFile(null);
          setPreview(null);
          setShowPreview(false);
        } catch (error) {
          onUploadError?.('Erro ao processar CSV: ' + (error as Error).message);
        } finally {
          setIsUploading(false);
        }
      };

      reader.readAsText(selectedFile, 'UTF-8');
    } catch (error) {
      setIsUploading(false);
      onUploadError?.(
        error instanceof Error ? error.message : 'Erro no upload'
      );
    }
  }, [selectedFile, preview, onPhasesUpdate, onUploadSuccess, onUploadError]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-600" />
            Upload Cronograma PFUS3
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Carregue o arquivo CSV do cronograma PFUS3 para atualizar as fases
            de parada, manutenção e partida
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isProcessing
            ? 'border-blue-300 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-blue-600 font-medium">Analisando arquivo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-400 mb-3" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Arraste o arquivo CSV aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Formato esperado: CSV com delimitador ";" (ponto e vírgula)
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Selecionar Arquivo
            </label>
          </div>
        )}
      </div>

      {/* Preview */}
      {showPreview && preview && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Preview do Arquivo
            </h4>
            {preview.isValid ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">Total de Linhas</div>
              <div className="text-lg font-semibold">{preview.totalRows}</div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-sm text-blue-600">Parada (1.7)</div>
              <div className="text-lg font-semibold text-blue-800">
                {preview.phases.parada}
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <div className="text-sm text-orange-600">Manutenção (1.8)</div>
              <div className="text-lg font-semibold text-orange-800">
                {preview.phases.manutencao}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-sm text-green-600">Partida (1.9)</div>
              <div className="text-lg font-semibold text-green-800">
                {preview.phases.partida}
              </div>
            </div>
          </div>

          {/* Erros */}
          {preview.errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <div className="text-sm font-medium text-red-800 mb-2">
                Problemas encontrados:
              </div>
              <ul className="text-sm text-red-700 list-disc list-inside">
                {preview.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview da tabela */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {preview.headers.slice(0, 6).map((header, index) => (
                    <th
                      key={index}
                      className="px-3 py-2 text-left text-gray-600 font-medium"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, index) => (
                  <tr key={index} className="border-t">
                    {row.slice(0, 6).map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-3 py-2 text-gray-900">
                        {cell.length > 30
                          ? `${cell.substring(0, 30)}...`
                          : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Botões de ação */}
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowPreview(false);
                setSelectedFile(null);
                setPreview(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!preview.isValid || isUploading}
              className={`px-4 py-2 rounded transition-colors ${
                preview.isValid && !isUploading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {isUploading ? (
                <span className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </span>
              ) : (
                'Carregar Fases'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PFUS3Uploader;
