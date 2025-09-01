import React, { useState, useCallback } from 'react';
import { Upload, FileText, Download, Trash2, Eye, EyeOff } from 'lucide-react';
import Papa from 'papaparse';

export interface CSVPreview {
  headers: string[];
  rows: string[][];
  totalRows: number;
  isValid: boolean;
  errors: string[];
}

interface CSVUploaderProps {
  onUploadSuccess: (data: any[], type: 'preparacao' | 'pfus3') => void;
  onUploadError: (error: string) => void;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
}) => {
  const [csvType, setCsvType] = useState<'preparacao' | 'pfus3'>('preparacao');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const validateCSV = (
    data: any[],
    type: 'preparacao' | 'pfus3'
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data || data.length === 0) {
      errors.push('O arquivo CSV está vazio');
      return { isValid: false, errors };
    }

    if (type === 'preparacao') {
      const requiredHeaders = [
        'Area',
        'Fase',
        'Atividade',
        'Duracao',
        'Inicio',
        'Fim',
      ];
      const headers = Object.keys(data[0] || {});

      for (const header of requiredHeaders) {
        if (!headers.includes(header)) {
          errors.push(`Coluna obrigatória '${header}' não encontrada`);
        }
      }

      // Validar dados das primeiras linhas
      const sampleRows = data.slice(0, 5);
      for (let i = 0; i < sampleRows.length; i++) {
        const row = sampleRows[i];
        if (!row.Area || !row.Fase || !row.Atividade) {
          errors.push(
            `Linha ${i + 2}: Campos obrigatórios vazios (Area, Fase, Atividade)`
          );
        }
      }
    } else if (type === 'pfus3') {
      const requiredHeaders = ['Id', 'EDT', 'Nome'];
      const headers = Object.keys(data[0] || {});

      // Verificar se tem pelo menos as colunas básicas
      for (const header of requiredHeaders) {
        if (!headers.includes(header)) {
          errors.push(`Coluna obrigatória '${header}' não encontrada`);
        }
      }

      // Validar dados das primeiras linhas
      const sampleRows = data.slice(0, 5);
      for (let i = 0; i < sampleRows.length; i++) {
        const row = sampleRows[i];
        if (!row.Id || !row.EDT || !row.Nome) {
          errors.push(
            `Linha ${i + 2}: Campos obrigatórios vazios (Id, EDT, Nome)`
          );
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const processCSV = useCallback(
    (file: File) => {
      setIsLoading(true);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        delimiter: csvType === 'pfus3' ? ';' : ',',
        complete: (results: any) => {
          const validation = validateCSV(results.data, csvType);
          const headers =
            results.meta?.fields || Object.keys(results.data[0] || {});

          const preview: CSVPreview = {
            headers,
            rows: results.data
              .slice(0, 10)
              .map((row: any) =>
                headers.map((field: string) => String(row[field] || ''))
              ),
            totalRows: results.data.length,
            isValid: validation.isValid,
            errors: validation.errors,
          };

          setPreview(preview);
          setIsLoading(false);
        },
        error: (error: any) => {
          onUploadError(`Erro ao processar CSV: ${error.message}`);
          setIsLoading(false);
        },
      });
    },
    [csvType, onUploadError]
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        onUploadError('Por favor, selecione um arquivo CSV válido');
        return;
      }
      setSelectedFile(file);
      processCSV(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !preview?.isValid) {
      onUploadError('Selecione um arquivo CSV válido antes de fazer upload');
      return;
    }

    setIsLoading(true);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      delimiter: csvType === 'pfus3' ? ';' : ',',
      complete: (results: any) => {
        onUploadSuccess(results.data, csvType);
        setSelectedFile(null);
        setPreview(null);
        setIsLoading(false);
      },
      error: (error: any) => {
        onUploadError(`Erro no upload: ${error.message}`);
        setIsLoading(false);
      },
    });
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setShowPreview(false);
  };

  const backupCurrentFile = (type: 'preparacao' | 'pfus3') => {
    console.log(`Fazendo backup do arquivo ${type}`);
    // Implementar lógica de backup se necessário
  };

  const downloadTemplate = (type: 'preparacao' | 'pfus3') => {
    let csvContent = '';

    if (type === 'preparacao') {
      csvContent = 'Area,Fase,Atividade,Duracao,Inicio,Fim\n';
      csvContent +=
        'Exemplo Area,Exemplo Fase,Exemplo Atividade,5,2024-01-01,2024-01-05\n';
    } else if (type === 'pfus3') {
      csvContent =
        'Id;Id_exclusiva;Nível_da_estrutura_de_tópicos;EDT;Nome;Porcentagem_Prev_Real;Porcentagem_Prev_LB;Duração;Início;Término;Início_da_Linha_de_Base;Término_da_linha_de_base;Área;Responsável_da_Tarefa;Dashboard;Desvio_LB\n';
      csvContent +=
        '1;1;1;1.1;Exemplo Atividade;0%;0%;5 dias;01/01/2024;05/01/2024;01/01/2024;05/01/2024;Exemplo;Responsável;Dashboard;0\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-${type}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Seleção do tipo de CSV - 2 colunas */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card Preparação */}
        <div
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
            csvType === 'preparacao'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setCsvType('preparacao')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Cronograma Preparação
            </h3>
            <div
              className={`w-4 h-4 rounded-full border-2 ${
                csvType === 'preparacao'
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300'
              }`}
            />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Upload do cronograma de preparação da parada
          </p>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadTemplate('preparacao');
              }}
              className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 flex items-center justify-center gap-1"
            >
              <Download size={14} />
              Template
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                backupCurrentFile('preparacao');
              }}
              className="bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600"
            >
              Backup
            </button>
          </div>
        </div>

        {/* Card PFUS3 */}
        <div
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
            csvType === 'pfus3'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setCsvType('pfus3')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Report PFUS3
            </h3>
            <div
              className={`w-4 h-4 rounded-full border-2 ${
                csvType === 'pfus3'
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300'
              }`}
            />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Upload do relatório PFUS3 (separado por ponto e vírgula)
          </p>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadTemplate('pfus3');
              }}
              className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 flex items-center justify-center gap-1"
            >
              <Download size={14} />
              Template
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                backupCurrentFile('pfus3');
              }}
              className="bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600"
            >
              Backup
            </button>
          </div>
        </div>
      </div>

      {/* Área de upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">
            Selecionar arquivo CSV{' '}
            {csvType === 'preparacao' ? 'de Preparação' : 'Report PFUS3'}
          </div>
          <div className="text-sm text-gray-600 mb-4">
            {csvType === 'preparacao'
              ? 'Formato: CSV com vírgula (,) como separador'
              : 'Formato: CSV com ponto e vírgula (;) como separador'}
          </div>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
            disabled={isLoading}
          />

          <label
            htmlFor="csv-upload"
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : csvType === 'preparacao'
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  : 'bg-green-600 hover:bg-green-700 cursor-pointer'
            } transition-colors duration-200`}
          >
            <Upload className="mr-2" size={20} />
            {isLoading ? 'Processando...' : 'Selecionar Arquivo'}
          </label>

          {selectedFile && (
            <div className="mt-4 text-sm text-gray-600">
              Arquivo selecionado: {selectedFile.name}
            </div>
          )}
        </div>
      </div>

      {/* Preview e ações */}
      {preview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Preview do arquivo ({preview.totalRows} linhas)
            </h3>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? 'Ocultar' : 'Mostrar'} Preview
            </button>
          </div>

          {/* Status de validação */}
          <div
            className={`p-4 rounded-lg ${
              preview.isValid
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  preview.isValid ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="font-semibold">
                {preview.isValid ? 'Arquivo válido' : 'Arquivo com problemas'}
              </span>
            </div>
            {preview.errors.length > 0 && (
              <ul className="mt-2 space-y-1">
                {preview.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-600">
                    • {error}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tabela de preview */}
          {showPreview && (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {preview.headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-3 py-2 text-left font-semibold text-gray-700 border-b"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-3 py-2 border-b text-gray-600"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.totalRows > 10 && (
                <div className="p-3 bg-gray-50 text-center text-sm text-gray-600">
                  Mostrando 10 de {preview.totalRows} linhas
                </div>
              )}
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!preview.isValid || isLoading}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold ${
                preview.isValid && !isLoading
                  ? csvType === 'preparacao'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } transition-colors duration-200`}
            >
              <FileText className="inline mr-2" size={20} />
              {isLoading ? 'Fazendo Upload...' : 'Confirmar Upload'}
            </button>

            <button
              onClick={clearSelection}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Trash2 className="inline mr-2" size={20} />
              Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVUploader;
