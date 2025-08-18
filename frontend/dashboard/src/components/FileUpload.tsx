import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Database,
  Trash2,
  Info,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { EventArea } from '../types';
import { CategoriaCronograma, ResumoCronograma } from '../types/cronograma';
import { useTheme, useThemeClasses } from '../contexts/ThemeContext';
import { dashboardAPI } from '../services/api';
import {
  processarCronogramaCSV,
  gerarTemplateCronograma,
  salvarCronogramaLocal,
  carregarCronogramaLocal,
  existeCronogramaLocal,
  limparCronogramaLocal,
  obterInfoCronogramaLocal,
} from '../utils/cronogramaProcessor';

interface FileUploadProps {
  onDataLoaded: (data: EventArea[]) => void;
  onCronogramaLoaded?: (
    categorias: CategoriaCronograma[],
    resumo: ResumoCronograma
  ) => void;
}

interface UploadStatus {
  type: 'success' | 'error' | 'loading' | null;
  message: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onDataLoaded,
  onCronogramaLoaded,
}) => {
  const { isDark } = useTheme();
  const themeClasses = useThemeClasses();

  const [status, setStatus] = useState<UploadStatus>({
    type: null,
    message: '',
  });
  const [processedData, setProcessedData] = useState<EventArea[]>([]);
  const [tipoArquivo, setTipoArquivo] = useState<'areas' | 'cronograma' | null>(
    null
  );
  const [dadosLocaisSalvos, setDadosLocaisSalvos] = useState<boolean>(false);
  const [infoDadosLocais, setInfoDadosLocais] = useState<any>(null);

  // Verificar dados salvos ao carregar o componente
  useEffect(() => {
    verificarDadosLocais();
  }, []);

  const verificarDadosLocais = () => {
    const existeDados = existeCronogramaLocal();
    setDadosLocaisSalvos(existeDados);

    if (existeDados) {
      const info = obterInfoCronogramaLocal();
      setInfoDadosLocais(info);
    }
  };

  const carregarDadosSalvos = () => {
    try {
      const dadosCarregados = carregarCronogramaLocal();
      if (dadosCarregados) {
        setTipoArquivo('cronograma');
        setStatus({
          type: 'success',
          message: `Cronograma carregado dos dados salvos! ${dadosCarregados.categorias.reduce((acc, cat) => acc + cat.tarefas.length, 0)} tarefas encontradas.`,
        });

        if (onCronogramaLoaded) {
          onCronogramaLoaded(
            dadosCarregados.categorias,
            dadosCarregados.resumo
          );
        }
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Erro ao carregar dados salvos.',
      });
    }
  };

  const limparDadosSalvos = () => {
    limparCronogramaLocal();
    setDadosLocaisSalvos(false);
    setInfoDadosLocais(null);
    setStatus({
      type: 'success',
      message: 'Dados salvos removidos com sucesso!',
    });
  };

  const processFile = async (file: File) => {
    setStatus({ type: 'loading', message: 'Processando arquivo...' });
    setProcessedData([]);
    setTipoArquivo(null);

    try {
      let rawData: any[] = [];

      if (file.name.endsWith('.csv')) {
        rawData = await processCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        rawData = await processExcel(file);
      }

      if (rawData.length === 0) {
        throw new Error('Arquivo não contém dados válidos');
      }

      // Detectar tipo de arquivo baseado nas colunas
      const primeiraLinha = rawData[0];
      const colunas = Object.keys(primeiraLinha);

      // Verificar se é cronograma
      if (
        colunas.includes('Nome da tarefa') ||
        colunas.includes('% Complete') ||
        colunas.includes('Duration')
      ) {
        // Processar como cronograma
        const { categorias, resumo } = processarCronogramaCSV(rawData);

        // Salvar dados localmente
        salvarCronogramaLocal(categorias, resumo, file.name);
        verificarDadosLocais(); // Atualizar estado dos dados salvos

        // Salvar também no backend para persistência global
        try {
          await dashboardAPI.uploadCronograma({
            categorias,
            resumo,
            tipo: 'cronograma',
          });
          console.log('✅ Cronograma salvo no backend para todos os usuários!');
        } catch (error) {
          console.warn('⚠️ Erro ao salvar cronograma no backend:', error);
        }

        setTipoArquivo('cronograma');
        setStatus({
          type: 'success',
          message: `Cronograma carregado e salvo com sucesso! ${categorias.reduce((acc, cat) => acc + cat.tarefas.length, 0)} tarefas encontradas.`,
        });

        if (onCronogramaLoaded) {
          onCronogramaLoaded(categorias, resumo);
        }
        return;
      }

      // Processar como dados de áreas (comportamento original)
      const mappedData = rawData.map((row, index) => {
        const area: EventArea = {
          id: index + 1,
          name: row.nome || row.name || `Área ${index + 1}`,
          category: row.categoria || row.category || 'Geral',
          capacity: parseInt(row.capacidade || row.capacity) || 100,
          currentOccupancy:
            parseInt(row.ocupacao_atual || row.current_occupancy) || 0,
          status: row.status || 'Ativo',
          temperature: parseFloat(row.temperatura || row.temperature) || 25,
          humidity: parseFloat(row.umidade || row.humidity) || 60,
          evolution: generateEvolution(
            parseInt(row.ocupacao_atual || row.current_occupancy) || 0
          ),
        };
        return area;
      });

      setProcessedData(mappedData);
      setTipoArquivo('areas');
      setStatus({
        type: 'success',
        message: `${mappedData.length} áreas carregadas com sucesso!`,
      });

      // Enviar dados para o backend
      await saveDataToBackend(mappedData);

      // Notificar o componente pai
      onDataLoaded(mappedData);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setStatus({
        type: 'error',
        message: `Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });
    }
  };

  const processCSV = async (file: File): Promise<any[]> => {
    const text = await file.text();
    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });
    return result.data;
  };

  const processExcel = async (file: File): Promise<any[]> => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  };

  const generateEvolution = (currentOccupancy: number) => {
    const hours = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
    ];
    return hours.map((time, index) => ({
      time,
      occupancy: Math.floor(currentOccupancy * (0.1 + index * 0.1)),
    }));
  };

  const saveDataToBackend = async (data: EventArea[]) => {
    try {
      await dashboardAPI.uploadAreas(data);
      console.log('✅ Dados salvos no backend com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar no backend:', error);
      // Não bloquear o upload por erro no backend
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        nome: 'Auditório Principal',
        categoria: 'Palestra',
        capacidade: 500,
        ocupacao_atual: 250,
        status: 'Ativo',
        temperatura: 23.5,
        umidade: 45,
      },
      {
        nome: 'Sala de Reunião 1',
        categoria: 'Reunião',
        capacidade: 20,
        ocupacao_atual: 15,
        status: 'Ocupado',
        temperatura: 24.0,
        umidade: 50,
      },
      {
        nome: 'Espaço Networking',
        categoria: 'Networking',
        capacidade: 100,
        ocupacao_atual: 80,
        status: 'Ativo',
        temperatura: 22.0,
        umidade: 55,
      },
      {
        nome: 'Workshop Tech',
        categoria: 'Workshop',
        capacidade: 30,
        ocupacao_atual: 0,
        status: 'Disponível',
        temperatura: 25.0,
        umidade: 40,
      },
      {
        nome: 'Área de Exposição',
        categoria: 'Exposição',
        capacidade: 200,
        ocupacao_atual: 120,
        status: 'Ativo',
        temperatura: 21.5,
        umidade: 48,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Áreas');
    XLSX.writeFile(wb, 'template-areas.xlsx');
  };

  const downloadCronogramaTemplate = () => {
    const template = gerarTemplateCronograma();
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Cronograma');
    XLSX.writeFile(wb, 'template-cronograma.xlsx');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
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
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload de Dados</h2>

      {/* Dados Salvos Localmente */}
      {dadosLocaisSalvos && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Dados Salvos Encontrados
                </h3>
                {infoDadosLocais && (
                  <div className="text-sm text-green-700 mt-1 space-y-1">
                    <p>
                      <strong>Arquivo:</strong>{' '}
                      {infoDadosLocais.nomeArquivo || 'Não informado'}
                    </p>
                    <p>
                      <strong>Carregado em:</strong>{' '}
                      {new Date(
                        infoDadosLocais.dataCarregamento
                      ).toLocaleString('pt-BR')}
                    </p>
                    <p>
                      <strong>Tamanho:</strong> {infoDadosLocais.tamanho}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={carregarDadosSalvos}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 transform hover:scale-105"
              >
                <Database size={16} />
                <span>Carregar</span>
              </button>
              <button
                onClick={limparDadosSalvos}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-all duration-200 transform hover:scale-105"
                title="Remover dados salvos"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates */}
      <div className={`mb-6 p-4 rounded-lg border ${themeClasses.info}`}>
        <h3 className={`text-lg font-semibold mb-3`}>Templates de Exemplo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={downloadTemplate}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-200 transform hover:scale-105"
          >
            <Download size={16} />
            Template para Áreas
          </button>
          <button
            onClick={downloadCronogramaTemplate}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 transform hover:scale-105"
          >
            <Download size={16} />
            Template para Cronograma
          </button>
        </div>
        <p className={`text-sm mt-2 ${themeClasses.textSecondary}`}>
          💡 <strong>Detecção Automática:</strong> O sistema identifica
          automaticamente se o arquivo é de áreas ou cronograma com base nas
          colunas presentes.
        </p>
      </div>

      {/* Área de Upload */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? `border-blue-400 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`
            : `${themeClasses.borderLight} hover:border-blue-400 ${themeClasses.bgSecondary} hover:${isDark ? 'bg-blue-900/10' : 'bg-blue-50'}`
        }`}
      >
        <input {...getInputProps()} />
        <Upload
          className={`mx-auto mb-4 ${themeClasses.textTertiary}`}
          size={48}
        />
        {isDragActive ? (
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            Solte o arquivo aqui para fazer upload...
          </p>
        ) : (
          <div>
            <p className={`${themeClasses.textPrimary} font-medium mb-2`}>
              Arraste e solte um arquivo aqui, ou clique para selecionar
            </p>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              Suporta arquivos CSV, XLSX e XLS
            </p>
          </div>
        )}
      </div>

      {/* Status */}
      {status.type && (
        <div
          className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
            status.type === 'success'
              ? themeClasses.success
              : status.type === 'error'
                ? themeClasses.error
                : themeClasses.info
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle
              size={20}
              className="text-green-600 dark:text-green-400"
            />
          ) : status.type === 'error' ? (
            <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
          ) : (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
          )}
          <span className="font-medium">{status.message}</span>
        </div>
      )}

      {/* Tipo de arquivo detectado */}
      {tipoArquivo && (
        <div className={`mt-4 p-3 rounded-lg border ${themeClasses.card}`}>
          <p className={`text-sm ${themeClasses.textPrimary}`}>
            <strong>Tipo detectado:</strong>{' '}
            {tipoArquivo === 'areas'
              ? 'Dados de Áreas'
              : 'Cronograma de Projeto'}
          </p>
        </div>
      )}

      {/* Preview dos dados de áreas */}
      {processedData.length > 0 && tipoArquivo === 'areas' && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Preview dos Dados ({processedData.length} áreas carregadas)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Nome
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Categoria
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Capacidade
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Ocupação
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedData.slice(0, 5).map((area) => (
                  <tr key={area.id} className="border-t border-gray-200">
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {area.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {area.category}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {area.capacity}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {area.currentOccupancy}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          area.status === 'Ativo'
                            ? 'bg-green-100 text-green-800'
                            : area.status === 'Ocupado'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {area.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {processedData.length > 5 && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                ... e mais {processedData.length - 5} áreas
              </p>
            )}
          </div>
        </div>
      )}

      {/* Informações sobre formato */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-semibold text-gray-800 mb-2">
          Formatos Suportados
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium text-blue-600 mb-1">
              📊 Dados de Áreas (campos obrigatórios):
            </p>
            <ul className="space-y-1">
              <li>
                • <code>nome</code> - Nome da área
              </li>
              <li>
                • <code>categoria</code> - Categoria do evento
              </li>
              <li>
                • <code>capacidade</code> - Capacidade máxima
              </li>
              <li>
                • <code>ocupacao_atual</code> - Ocupação atual
              </li>
              <li>
                • <code>status</code> - Status da área
              </li>
              <li>
                • <code>temperatura</code> - Temperatura (°C)
              </li>
              <li>
                • <code>umidade</code> - Umidade (%)
              </li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-green-600 mb-1">
              📅 Cronograma (campos obrigatórios):
            </p>
            <ul className="space-y-1">
              <li>
                • <code>Nome da tarefa</code> - Nome da atividade
              </li>
              <li>
                • <code>% Complete</code> - Progresso (0-100)
              </li>
              <li>
                • <code>Duration</code> - Duração
              </li>
              <li>
                • <code>Start</code> - Data de início
              </li>
              <li>
                • <code>Finish</code> - Data de fim
              </li>
              <li>
                • <code>Resource Names</code> - Responsáveis
              </li>
              <li>
                • <code>Outline Level</code> - Nível hierárquico
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
