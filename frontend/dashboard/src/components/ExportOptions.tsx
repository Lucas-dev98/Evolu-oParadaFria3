import React, { useState } from 'react';
import { useThemeClasses } from '../contexts/ThemeContext';
import { CategoriaCronograma, TarefaCronograma } from '../types/cronograma';
import { formatDuracao } from '../utils/formatters';
import {
  Download,
  FileText,
  File,
  Image,
  Calendar,
  CheckCircle,
  Loader,
} from 'lucide-react';

interface ExportOptionsProps {
  categorias: CategoriaCronograma[];
  isOpen: boolean;
  onClose: () => void;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  categorias,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'pdf' | 'json'>('csv');
  const [includeSubtasks, setIncludeSubtasks] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const themeClasses = useThemeClasses();

  if (!isOpen) return null;

  const getAllTasks = (): TarefaCronograma[] => {
    const allTasks: TarefaCronograma[] = [];

    categorias.forEach((categoria) => {
      if (
        selectedCategories.length === 0 ||
        selectedCategories.includes(categoria.nome)
      ) {
        categoria.tarefas.forEach((tarefa) => {
          allTasks.push(tarefa);
          if (includeSubtasks && tarefa.subatividades) {
            allTasks.push(...tarefa.subatividades);
          }
        });
      }
    });

    return allTasks;
  };

  const exportToCSV = () => {
    const tasks = getAllTasks();

    const headers = [
      'ID',
      'Nome da Tarefa',
      'Categoria',
      'Nível',
      '% Completo',
      '% Físico',
      'Duração',
      'Data Início',
      'Data Fim',
      'Baseline Início',
      'Baseline Fim',
      'Status',
      'Predecessores',
    ];

    const csvContent = [
      headers.join(','),
      ...tasks.map((task) =>
        [
          task.id,
          `"${task.nome}"`,
          `"${task.categoria}"`,
          task.nivel,
          task.percentualCompleto,
          task.percentualFisico,
          `"${formatDuracao(task.duracao)}"`,
          task.inicio,
          task.fim,
          task.inicioBaseline,
          task.fimBaseline,
          getTaskStatus(task),
          `"${task.predecessores || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    downloadFile(
      csvContent,
      `cronograma_${new Date().toISOString().split('T')[0]}.csv`,
      'text/csv'
    );
  };

  const exportToJSON = () => {
    const tasks = getAllTasks();
    const jsonData = {
      exportDate: new Date().toISOString(),
      totalTasks: tasks.length,
      categories: selectedCategories.length || categorias.length,
      data: tasks.map((task) => ({
        ...task,
        status: getTaskStatus(task),
      })),
    };

    downloadFile(
      JSON.stringify(jsonData, null, 2),
      `cronograma_${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
  };

  const exportToPDF = async () => {
    // Simulação - na implementação real usaria uma lib como jsPDF
    setLoading(true);

    // Simular processamento
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const tasks = getAllTasks();
    let htmlContent = `
      <html>
        <head>
          <title>Cronograma PFUS3</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            .summary { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #007bff; color: white; }
            .status-concluida { background-color: #d4edda; }
            .status-atrasada { background-color: #f8d7da; }
            .status-critica { background-color: #fff3cd; }
            .categoria { font-weight: bold; background-color: #e9ecef; }
          </style>
        </head>
        <body>
          <h1>Cronograma de Preparação - PFUS3</h1>
          <div class="summary">
            <p><strong>Data de Exportação:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            <p><strong>Total de Tarefas:</strong> ${tasks.length}</p>
            <p><strong>Categorias Incluídas:</strong> ${selectedCategories.length || categorias.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tarefa</th>
                <th>Categoria</th>
                <th>% Completo</th>
                <th>Duração</th>
                <th>Data Início</th>
                <th>Data Fim</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
    `;

    tasks.forEach((task) => {
      const status = getTaskStatus(task);
      htmlContent += `
        <tr class="status-${status}">
          <td>${task.id}</td>
          <td>${'  '.repeat(task.nivel)}${task.nome}</td>
          <td>${task.categoria}</td>
          <td>${task.percentualCompleto}%</td>
          <td>${formatDuracao(task.duracao)}</td>
          <td>${new Date(task.inicio).toLocaleDateString('pt-BR')}</td>
          <td>${new Date(task.fim).toLocaleDateString('pt-BR')}</td>
          <td>${status}</td>
        </tr>
      `;
    });

    htmlContent += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Criar um blob e baixar
    downloadFile(
      htmlContent,
      `cronograma_${new Date().toISOString().split('T')[0]}.html`,
      'text/html'
    );
    setLoading(false);
  };

  const getTaskStatus = (task: TarefaCronograma): string => {
    if (task.percentualCompleto === 100) return 'concluída';

    const hoje = new Date();
    const fimPrevisto = new Date(task.fim);
    const diasParaFim = Math.ceil(
      (fimPrevisto.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diasParaFim <= 3 && diasParaFim >= 0) return 'crítica';
    if (diasParaFim < 0) return 'atrasada';
    return 'em dia';
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setLoading(true);

    try {
      switch (exportType) {
        case 'csv':
          exportToCSV();
          break;
        case 'json':
          exportToJSON();
          break;
        case 'pdf':
          await exportToPDF();
          break;
      }
    } finally {
      if (exportType !== 'pdf') {
        setLoading(false);
      }
    }
  };

  const toggleCategory = (categoria: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoria)
        ? prev.filter((c) => c !== categoria)
        : [...prev, categoria]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`${themeClasses.card} rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${themeClasses.textPrimary}`}>
            Exportar Cronograma
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:${themeClasses.bgSecondary} transition-colors`}
          >
            ✕
          </button>
        </div>

        {/* Tipo de Exportação */}
        <div className="mb-6">
          <label
            className={`block text-sm font-medium mb-3 ${themeClasses.textSecondary}`}
          >
            Formato de Exportação
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                type: 'csv',
                icon: FileText,
                label: 'CSV',
                desc: 'Excel/Planilhas',
              },
              {
                type: 'json',
                icon: File,
                label: 'JSON',
                desc: 'Dados estruturados',
              },
              {
                type: 'pdf',
                icon: Image,
                label: 'HTML/PDF',
                desc: 'Relatório visual',
              },
            ].map(({ type, icon: Icon, label, desc }) => (
              <button
                key={type}
                onClick={() => setExportType(type as any)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  exportType === type
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : `border-gray-300 dark:border-gray-600 hover:${themeClasses.bgSecondary}`
                }`}
              >
                <Icon
                  className={`w-8 h-8 mx-auto mb-2 ${
                    exportType === type
                      ? 'text-blue-500'
                      : themeClasses.textSecondary
                  }`}
                />
                <p className={`font-medium ${themeClasses.textPrimary}`}>
                  {label}
                </p>
                <p className={`text-xs ${themeClasses.textTertiary}`}>{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Opções */}
        <div className="space-y-4 mb-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={includeSubtasks}
              onChange={(e) => setIncludeSubtasks(e.target.checked)}
              className="rounded"
            />
            <span className={`${themeClasses.textPrimary}`}>
              Incluir subatividades
            </span>
          </label>

          {/* Seleção de Categorias */}
          <div>
            <p
              className={`text-sm font-medium mb-2 ${themeClasses.textSecondary}`}
            >
              Categorias ({selectedCategories.length || categorias.length}{' '}
              selecionadas)
            </p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              <button
                onClick={() =>
                  setSelectedCategories(
                    selectedCategories.length === categorias.length
                      ? []
                      : categorias.map((c) => c.nome)
                  )
                }
                className={`text-xs px-3 py-1 rounded-full ${themeClasses.bgSecondary} hover:${themeClasses.bgTertiary} transition-colors`}
              >
                {selectedCategories.length === categorias.length
                  ? 'Desmarcar Todas'
                  : 'Selecionar Todas'}
              </button>

              {categorias.map((categoria) => (
                <label
                  key={categoria.nome}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedCategories.includes(categoria.nome) ||
                      selectedCategories.length === 0
                    }
                    onChange={() => toggleCategory(categoria.nome)}
                    className="rounded"
                  />
                  <span className={`text-sm ${themeClasses.textPrimary}`}>
                    {categoria.nome} ({categoria.tarefas.length})
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:${themeClasses.bgSecondary} transition-colors`}
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportOptions;
