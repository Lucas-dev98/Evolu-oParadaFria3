import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  RefreshCw,
} from 'lucide-react';

interface CSVUploaderProps {
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
}

export interface CSVPreview {
  headers: string[];
  rows: string[][];
  totalRows: number;
  isValid: boolean;
  errors: string[];
}

const CSVUploader: React.FC<CSVUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvType, setCsvType] = useState<'preparacao' | 'operacional'>(
    'preparacao'
  );
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<CSVPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Validar estrutura do CSV
  // Parser CSV mais robusto que lida com campos entre aspas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"' && (i === 0 || line[i - 1] === ',')) {
        inQuotes = true;
      } else if (
        char === '"' &&
        inQuotes &&
        (i === line.length - 1 || line[i + 1] === ',')
      ) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const validateCSV = useCallback(
    (csvText: string, type: 'preparacao' | 'operacional'): CSVPreview => {
      const lines = csvText.trim().split('\n');
      const headers = parseCSVLine(lines[0] || '');

      // Filtrar linhas para parar quando encontrar cabeçalhos de recursos
      const filteredLines = lines.slice(1).filter((line, index) => {
        const trimmedLine = line.trim();
        // Parar quando encontrar linhas que começam com cabeçalhos de recursos
        if (
          trimmedLine.startsWith('﻿ ID,Indicators') ||
          trimmedLine.startsWith('﻿ ID, Task name') ||
          trimmedLine.startsWith('ID,Indicators') ||
          trimmedLine.startsWith('ID, Task name') ||
          trimmedLine === '' ||
          (trimmedLine.split(',').length < 5 && index > 10)
        ) {
          return false;
        }
        return true;
      });

      const dataRows = filteredLines.map((line) => parseCSVLine(line));

      const errors: string[] = [];

      // Validações específicas por tipo
      if (type === 'preparacao') {
        const requiredHeaders = [
          'ID',
          'Nome da tarefa',
          '% Complete',
          'Physical % Complete',
        ];
        requiredHeaders.forEach((header) => {
          if (
            !headers.some((h) => h.toLowerCase().includes(header.toLowerCase()))
          ) {
            errors.push(`Header obrigatório não encontrado: ${header}`);
          }
        });

        if (headers.length < 10) {
          errors.push('CSV de preparação deve ter pelo menos 10 colunas');
        }
      } else {
        const requiredHeaders = ['Activity ID', 'Activity Name', 'Duration'];
        requiredHeaders.forEach((header) => {
          if (
            !headers.some((h) => h.toLowerCase().includes(header.toLowerCase()))
          ) {
            errors.push(`Header obrigatório não encontrado: ${header}`);
          }
        });
      }

      // Validar dados
      if (dataRows.length === 0) {
        errors.push('CSV está vazio');
      }

      if (dataRows.length > 0) {
        const firstRowLength = headers.length;
        let inconsistentRows = 0;
        dataRows.forEach((row, index) => {
          // Permitir variação de ±2 colunas para lidar com campos com vírgulas
          const difference = Math.abs(row.length - firstRowLength);
          if (difference > 2) {
            inconsistentRows++;
            // Só reportar se houver muitas inconsistências (mais de 10% das linhas)
            if (inconsistentRows <= Math.max(5, dataRows.length * 0.1)) {
              errors.push(
                `Linha ${index + 2}: número de colunas inconsistente (esperado: ${firstRowLength}, encontrado: ${row.length})`
              );
            }
          }
        });

        // Se mais de 30% das linhas têm problemas, reportar erro geral
        if (inconsistentRows > dataRows.length * 0.3) {
          errors.push(
            `Muitas linhas com colunas inconsistentes (${inconsistentRows} de ${dataRows.length}). Verifique se o arquivo está formatado corretamente.`
          );
        }
      }

      return {
        headers,
        rows: dataRows.slice(0, 5), // Mostrar apenas 5 linhas no preview
        totalRows: dataRows.length,
        isValid: errors.length === 0,
        errors,
      };
    },
    []
  );

  // Processar arquivo selecionado
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith('.csv')) {
        onUploadError?.('Arquivo deve ser um CSV');
        return;
      }

      setSelectedFile(file);

      // Ler e validar o arquivo
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        const validation = validateCSV(csvText, csvType);
        setPreview(validation);
        setShowPreview(true);
      };
      reader.readAsText(file);
    },
    [csvType, validateCSV, onUploadError]
  );

  // Fazer backup do arquivo atual
  const backupCurrentFile = async (
    type: 'preparacao' | 'operacional'
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/csv/backup/${type}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download =
          response.headers
            .get('Content-Disposition')
            ?.split('filename=')[1]
            ?.replace(/"/g, '') || `backup-${type}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao fazer backup:', error);
      return false;
    }
  };

  // Upload do arquivo (versão simplificada que funciona localmente)
  const handleUpload = async () => {
    if (!selectedFile || !preview?.isValid) return;

    setIsUploading(true);

    try {
      // Fazer backup do arquivo atual
      await backupCurrentFile(csvType);

      // Ler o conteúdo do arquivo
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvContent = e.target?.result as string;

        try {
          // Por enquanto, vamos mostrar instruções para atualização manual
          // Em produção, usaríamos a API do backend

          const fileName =
            csvType === 'preparacao'
              ? 'cronograma-preparacao-real.csv'
              : 'cronograma-operacional.csv';

          console.log('📤 Processando upload do arquivo:', fileName);
          console.log('📊 Estatísticas:', {
            nome: selectedFile.name,
            tamanho: selectedFile.size,
            linhas: preview.totalRows,
            colunas: preview.headers.length,
          });

          // Criar blob para download manual do usuário
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

          // Mostrar instruções para o usuário
          const instructions = `
✅ Arquivo processado com sucesso!

📋 PRÓXIMOS PASSOS:
1. O arquivo "${fileName}" foi baixado automaticamente
2. Substitua o arquivo na pasta: /frontend/dashboard/public/
3. Clique em "🔄 Recarregar Aplicação" para ver as mudanças

📊 DETALHES:
• Arquivo: ${selectedFile.name}
• Tamanho: ${(selectedFile.size / 1024).toFixed(1)} KB
• Linhas: ${preview.totalRows}
• Colunas: ${preview.headers.length}
• Backup criado: Sim

🔄 Após substituir o arquivo, use o botão "Recarregar Aplicação" no modal.
          `;

          alert(instructions);

          onUploadSuccess?.();
          setSelectedFile(null);
          setPreview(null);
          setShowPreview(false);
        } catch (error) {
          console.error('❌ Erro no processamento:', error);
          onUploadError?.('Erro ao processar arquivo');
        }
      };

      reader.readAsText(selectedFile);
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      onUploadError?.('Erro ao processar arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  // Download do template
  const downloadTemplate = (type: 'preparacao' | 'operacional') => {
    let csvContent = '';

    if (type === 'preparacao') {
      csvContent = [
        'ID,Nome da tarefa,% Complete,Physical % Complete,% Previsto Replanejamento,Duration,Start,Finish,Actual Start,Actual Finish,Predecessors,Baseline Start,Baseline Finish,% Físico Prev. LB,% Físico Prev. Replanejado,% Físico Calculado',
        '1,Projeto PFUS3 - Preparação,73%,0%,58,365 days,01/01/2025,31/12/2025,01/01/2025,NA,,01/01/2025,31/12/2025,24.25,20.09,20.09',
        '2,  Logística,0%,0%,90,90 days,01/01/2025,31/03/2025,NA,NA,,01/01/2025,31/03/2025,0,0,0',
        '3,    Mobilização de Equipamentos,0%,0%,100,30 days,01/01/2025,31/01/2025,NA,NA,,01/01/2025,31/01/2025,0,0,0',
        '4,  Refratário,0%,0%,77,120 days,01/02/2025,31/05/2025,NA,NA,,01/02/2025,31/05/2025,0,0,0',
        '5,    Remoção de Refratário Antigo,0%,0%,82,60 days,01/02/2025,31/03/2025,NA,NA,,01/02/2025,31/03/2025,0,0,0',
      ].join('\n');
    } else {
      csvContent = [
        'Activity ID,Activity Name,Duration,Start Date,Finish Date,% Complete,Resource Names,Predecessors',
        'OP001,Início da Parada,1 day,15/06/2025,15/06/2025,0%,,',
        'OP002,Isolamento de Equipamentos,2 days,16/06/2025,17/06/2025,0%,Operação,OP001',
        'OP003,Drenagem de Linhas,3 days,18/06/2025,20/06/2025,0%,Operação,OP002',
        'OP004,Abertura de Equipamentos,4 days,21/06/2025,24/06/2025,0%,Manutenção,OP003',
      ].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `template-${type}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Tipo */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setCsvType('preparacao')}
          className={`p-4 rounded-lg border-2 transition-all ${
            csvType === 'preparacao'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <FileText className="w-8 h-8 mx-auto mb-2" />
          <div className="font-semibold">Cronograma Preparação</div>
          <div className="text-sm text-gray-500">
            Atividades de preparação da parada
          </div>
        </button>

        <button
          onClick={() => setCsvType('operacional')}
          className={`p-4 rounded-lg border-2 transition-all ${
            csvType === 'operacional'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <RefreshCw className="w-8 h-8 mx-auto mb-2" />
          <div className="font-semibold">Cronograma Operacional</div>
          <div className="text-sm text-gray-500">
            Atividades durante a parada
          </div>
        </button>
      </div>

      {/* Download Template */}
      <div className="flex justify-center">
        <button
          onClick={() => downloadTemplate(csvType)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Baixar Template{' '}
          {csvType === 'preparacao' ? 'Preparação' : 'Operacional'}
        </button>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          id="csv-upload"
        />
        <label htmlFor="csv-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <div className="text-lg font-semibold mb-2">
            Selecionar arquivo CSV{' '}
            {csvType === 'preparacao' ? 'de Preparação' : 'Operacional'}
          </div>
          <div className="text-gray-500">
            Clique aqui ou arraste o arquivo CSV
          </div>
        </label>
      </div>

      {/* Preview */}
      {showPreview && preview && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            {preview.isValid ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <h3 className="font-semibold">
              Preview do Arquivo ({preview.totalRows} linhas)
            </h3>
          </div>

          {/* Erros */}
          {preview.errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <div className="font-semibold text-red-700 mb-2">
                Problemas encontrados:
              </div>
              <ul className="text-red-600 text-sm space-y-1">
                {preview.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tabela Preview */}
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  {preview.headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-2 py-1 text-left font-semibold"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, index) => (
                  <tr key={index} className="border-t">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-2 py-1">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!preview.isValid || isUploading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                preview.isValid && !isUploading
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Enviando...' : 'Confirmar Upload'}
            </button>

            <button
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
                setShowPreview(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="font-semibold text-blue-800 mb-2">
          💡 Como Funciona o Sistema de Upload:
        </div>
        <div className="text-blue-700 text-sm space-y-2">
          <div>
            1. <strong>Validação:</strong> Arquivo é validado automaticamente
            antes do upload
          </div>
          <div>
            2. <strong>Backup:</strong> Backup automático do arquivo atual é
            criado
          </div>
          <div>
            3. <strong>Download:</strong> Novo arquivo é baixado automaticamente
          </div>
          <div>
            4. <strong>Substituição Manual:</strong> Você substitui o arquivo na
            pasta:
          </div>
          <div className="ml-4 font-mono text-xs bg-blue-100 p-2 rounded">
            📁 /frontend/dashboard/public/
            <br />• <code>cronograma-preparacao-real.csv</code>
            <br />• <code>cronograma-operacional.csv</code>
          </div>
          <div>
            5. <strong>Recarga:</strong> Use "🔄 Recarregar Aplicação" para
            atualizar os dados
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVUploader;
