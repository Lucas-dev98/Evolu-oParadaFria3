import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Database,
  Trash2,
  FileText,
  Settings,
  Zap,
  Activity,
  PlayCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useTheme, useThemeClasses } from '../contexts/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import { Phase } from '../types/phases';

interface PhaseFileUploadProps {
  selectedPhase: string;
  onPhaseDataLoaded: (phaseId: string, data: any) => void;
}

interface UploadStatus {
  type: 'success' | 'error' | 'loading' | null;
  message: string;
}

const PhaseFileUpload: React.FC<PhaseFileUploadProps> = ({
  selectedPhase,
  onPhaseDataLoaded,
}) => {
  const { isDark } = useTheme();
  const themeClasses = useThemeClasses();
  const notifications = useNotifications();

  const [status, setStatus] = useState<UploadStatus>({
    type: null,
    message: '',
  });

  const phaseConfigs = {
    preparacao: {
      name: 'Preparação',
      icon: Settings,
      color: 'bg-blue-500',
      description: 'Upload dos dados de preparação da parada',
      templateColumns: [
        'ID',
        'Atividade',
        'Área',
        'Responsável',
        'Data Início',
        'Data Fim',
        'Status',
        'Categoria',
        'Criticidade',
        'Observações',
      ],
    },
    parada: {
      name: 'Parada',
      icon: AlertCircle,
      color: 'bg-red-500',
      description: 'Upload dos dados da parada de usina',
      templateColumns: [
        'ID',
        'Atividade',
        'Área',
        'Responsável',
        'Data Início',
        'Data Fim',
        'Status',
        'Categoria',
        'Criticidade',
        'Risco',
      ],
    },
    manutencao: {
      name: 'Manutenção',
      icon: Activity,
      color: 'bg-orange-500',
      description: 'Upload dos dados de manutenção',
      templateColumns: [
        'ID',
        'Atividade',
        'Equipamento',
        'Responsável',
        'Data Início',
        'Data Fim',
        'Status',
        'Tipo Manutenção',
        'Prioridade',
        'Recursos',
      ],
    },
    partida: {
      name: 'Partida',
      icon: PlayCircle,
      color: 'bg-green-500',
      description: 'Upload dos dados de partida da usina',
      templateColumns: [
        'ID',
        'Atividade',
        'Sistema',
        'Responsável',
        'Data Início',
        'Data Fim',
        'Status',
        'Teste',
        'Resultado',
        'Aprovação',
      ],
    },
  };

  const currentPhaseConfig =
    phaseConfigs[selectedPhase as keyof typeof phaseConfigs] ||
    phaseConfigs.preparacao;
  const PhaseIcon = currentPhaseConfig.icon;

  const processCSV = (text: string) => {
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('Erros no parsing CSV:', results.errors);
          }
          resolve(results.data);
        },
        error: reject,
      });
    });
  };

  const processExcel = (buffer: ArrayBuffer) => {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  };

  const validatePhaseData = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Arquivo não contém dados válidos');
    }

    // Verificar se as colunas básicas existem
    const requiredColumns = ['ID', 'Atividade', 'Status'];
    const firstRow = data[0];
    const columns = Object.keys(firstRow);

    const missingColumns = requiredColumns.filter(
      (col) => !columns.some((c) => c.toLowerCase().includes(col.toLowerCase()))
    );

    if (missingColumns.length > 0) {
      throw new Error(
        `Colunas obrigatórias não encontradas: ${missingColumns.join(', ')}`
      );
    }

    return true;
  };

  const transformDataToPhase = (rawData: any[]) => {
    return rawData.map((row, index) => ({
      id: row.ID || `${selectedPhase}-${index + 1}`,
      atividade: row.Atividade || row.atividade || '',
      area: row.Área || row.Area || row.área || '',
      responsavel: row.Responsável || row.responsavel || '',
      dataInicio:
        row['Data Início'] || row['Data Inicio'] || row.dataInicio || '',
      dataFim: row['Data Fim'] || row.dataFim || '',
      status: row.Status || row.status || 'pendente',
      categoria: row.Categoria || row.categoria || 'geral',
      criticidade: row.Criticidade || row.criticidade || 'normal',
      observacoes: row.Observações || row.observacoes || row.Observações || '',
    }));
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setStatus({ type: 'loading', message: 'Processando arquivo...' });

    try {
      const file = files[0];
      const fileName = file.name.toLowerCase();

      let data;
      if (fileName.endsWith('.csv')) {
        const text = await file.text();
        data = await processCSV(text);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        data = processExcel(buffer);
      } else {
        throw new Error(
          'Formato de arquivo não suportado. Use CSV ou Excel (.xlsx/.xls)'
        );
      }

      validatePhaseData(data as any[]);
      const transformedData = transformDataToPhase(data as any[]);

      // Salvar dados da fase
      const phaseData = {
        id: selectedPhase,
        name: currentPhaseConfig.name,
        activities: transformedData,
        uploadedAt: new Date().toISOString(),
        fileName: file.name,
      };

      localStorage.setItem(
        `phase_data_${selectedPhase}`,
        JSON.stringify(phaseData)
      );

      onPhaseDataLoaded(selectedPhase, phaseData);

      setStatus({
        type: 'success',
        message: `${transformedData.length} atividades carregadas para a fase ${currentPhaseConfig.name}`,
      });

      notifications.success(
        'Dados Carregados',
        `${transformedData.length} atividades da fase ${currentPhaseConfig.name}`
      );
    } catch (error: any) {
      console.error('Erro ao processar arquivo:', error);
      setStatus({
        type: 'error',
        message: error.message || 'Erro ao processar arquivo',
      });

      notifications.error(
        'Erro no Upload',
        error.message || 'Erro ao processar arquivo'
      );
    }
  };

  const generateTemplate = () => {
    const templateData = [
      currentPhaseConfig.templateColumns.reduce((row: any, col, index) => {
        row[col] = `Exemplo ${index + 1}`;
        return row;
      }, {}),
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentPhaseConfig.name);

    XLSX.writeFile(
      wb,
      `template_${selectedPhase}_${currentPhaseConfig.name.toLowerCase()}.xlsx`
    );

    notifications.info(
      'Template Baixado',
      `Template da fase ${currentPhaseConfig.name}`
    );
  };

  const clearPhaseData = () => {
    localStorage.removeItem(`phase_data_${selectedPhase}`);
    setStatus({ type: null, message: '' });
    notifications.info(
      'Dados Limpos',
      `Dados da fase ${currentPhaseConfig.name} removidos`
    );
  };

  const hasPhaseData = () => {
    return localStorage.getItem(`phase_data_${selectedPhase}`) !== null;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
  });

  return (
    <div
      className={`p-6 rounded-lg border ${themeClasses.card} ${themeClasses.shadow}`}
    >
      {/* Header da Fase */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${currentPhaseConfig.color}`}>
          <PhaseIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>
            Upload - Fase {currentPhaseConfig.name}
          </h3>
          <p className={`text-sm ${themeClasses.textSecondary}`}>
            {currentPhaseConfig.description}
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
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : `border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500`
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload
          className={`w-12 h-12 mx-auto mb-4 ${themeClasses.textSecondary}`}
        />
        <p className={`text-lg font-medium mb-2 ${themeClasses.textPrimary}`}>
          {isDragActive
            ? `Solte o arquivo da fase ${currentPhaseConfig.name} aqui`
            : `Upload dos dados da fase ${currentPhaseConfig.name}`}
        </p>
        <p className={`text-sm ${themeClasses.textSecondary}`}>
          Arraste um arquivo CSV ou Excel, ou clique para selecionar
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
            <Database className="w-5 h-5 animate-spin" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={generateTemplate}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
            bg-blue-500 hover:bg-blue-600 text-white
          `}
        >
          <Download className="w-4 h-4" />
          Baixar Template
        </button>

        {hasPhaseData() && (
          <button
            onClick={clearPhaseData}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              bg-red-500 hover:bg-red-600 text-white
            `}
          >
            <Trash2 className="w-4 h-4" />
            Limpar Dados
          </button>
        )}

        <div
          className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm
          ${
            hasPhaseData()
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }
        `}
        >
          <Database className="w-4 h-4" />
          {hasPhaseData() ? 'Dados Carregados' : 'Sem Dados'}
        </div>
      </div>

      {/* Colunas Esperadas */}
      <div className="mt-6">
        <h4 className={`text-sm font-medium mb-2 ${themeClasses.textPrimary}`}>
          Colunas esperadas no arquivo:
        </h4>
        <div className="flex flex-wrap gap-2">
          {currentPhaseConfig.templateColumns.map((column) => (
            <span
              key={column}
              className={`
                px-2 py-1 text-xs rounded-md font-medium
                bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
              `}
            >
              {column}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhaseFileUpload;
