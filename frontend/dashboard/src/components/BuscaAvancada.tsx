import React, { useState } from 'react';
import { useThemeClasses } from '../contexts/ThemeContext';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  X,
  ChevronDown,
} from 'lucide-react';

interface FiltroAvancado {
  busca: string;
  dataInicio: string;
  dataFim: string;
  percentualMin: number;
  percentualMax: number;
  status: string[];
  categorias: string[];
  mostrarApenas: string;
}

interface BuscaAvancadaProps {
  filtros: FiltroAvancado;
  onFiltrosChange: (filtros: FiltroAvancado) => void;
  categorias: string[];
}

const BuscaAvancada: React.FC<BuscaAvancadaProps> = ({
  filtros,
  onFiltrosChange,
  categorias,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const themeClasses = useThemeClasses();

  const statusOptions = [
    { value: 'pendente', label: 'Pendentes (0%)', color: 'red' },
    { value: 'em-andamento', label: 'Em Andamento (1-99%)', color: 'yellow' },
    { value: 'concluida', label: 'Concluídas (100%)', color: 'green' },
    { value: 'atrasada', label: 'Atrasadas', color: 'red' },
    { value: 'critica', label: 'Críticas', color: 'orange' },
  ];

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked
      ? [...filtros.status, status]
      : filtros.status.filter((s) => s !== status);

    onFiltrosChange({ ...filtros, status: newStatus });
  };

  const handleCategoriaChange = (categoria: string, checked: boolean) => {
    const newCategorias = checked
      ? [...filtros.categorias, categoria]
      : filtros.categorias.filter((c) => c !== categoria);

    onFiltrosChange({ ...filtros, categorias: newCategorias });
  };

  const limparFiltros = () => {
    onFiltrosChange({
      busca: '',
      dataInicio: '',
      dataFim: '',
      percentualMin: 0,
      percentualMax: 100,
      status: [],
      categorias: [],
      mostrarApenas: 'todos',
    });
  };

  return (
    <div className={`${themeClasses.card} rounded-xl shadow-lg p-4 mb-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Search className={`w-5 h-5 ${themeClasses.textSecondary}`} />
          <h3 className={`font-semibold ${themeClasses.textPrimary}`}>
            Busca Avançada
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-lg hover:${themeClasses.bgSecondary} transition-colors`}
        >
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            } ${themeClasses.textSecondary}`}
          />
        </button>
      </div>

      {/* Busca rápida sempre visível */}
      <div className="relative mb-4">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textTertiary}`}
        />
        <input
          type="text"
          placeholder="Buscar por nome da tarefa..."
          value={filtros.busca}
          onChange={(e) =>
            onFiltrosChange({ ...filtros, busca: e.target.value })
          }
          className={`w-full pl-10 pr-4 py-3 ${themeClasses.input} rounded-lg`}
        />
      </div>

      {/* Filtros avançados expansíveis */}
      {isExpanded && (
        <div className="space-y-4 animate-fadeIn">
          {/* Período */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}
              >
                Data Início (a partir de)
              </label>
              <div className="relative">
                <Calendar
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textTertiary}`}
                />
                <input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) =>
                    onFiltrosChange({ ...filtros, dataInicio: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-2 ${themeClasses.input} rounded-lg`}
                />
              </div>
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}
              >
                Data Fim (até)
              </label>
              <div className="relative">
                <Calendar
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.textTertiary}`}
                />
                <input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) =>
                    onFiltrosChange({ ...filtros, dataFim: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-2 ${themeClasses.input} rounded-lg`}
                />
              </div>
            </div>
          </div>

          {/* Percentual */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}
            >
              Faixa de Progresso: {filtros.percentualMin}% -{' '}
              {filtros.percentualMax}%
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="100"
                value={filtros.percentualMin}
                onChange={(e) =>
                  onFiltrosChange({
                    ...filtros,
                    percentualMin: parseInt(e.target.value),
                  })
                }
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={filtros.percentualMax}
                onChange={(e) =>
                  onFiltrosChange({
                    ...filtros,
                    percentualMax: parseInt(e.target.value),
                  })
                }
                className="flex-1"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}
            >
              Status das Tarefas
            </label>
            <div className="grid md:grid-cols-3 gap-2">
              {statusOptions.map((status) => (
                <label
                  key={status.value}
                  className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:${themeClasses.bgSecondary} transition-colors`}
                >
                  <input
                    type="checkbox"
                    checked={filtros.status.includes(status.value)}
                    onChange={(e) =>
                      handleStatusChange(status.value, e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className={`text-sm ${themeClasses.textPrimary}`}>
                    {status.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Categorias */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}
            >
              Categorias
            </label>
            <div className="grid md:grid-cols-3 gap-2">
              {categorias.map((categoria) => (
                <label
                  key={categoria}
                  className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:${themeClasses.bgSecondary} transition-colors`}
                >
                  <input
                    type="checkbox"
                    checked={filtros.categorias.includes(categoria)}
                    onChange={(e) =>
                      handleCategoriaChange(categoria, e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className={`text-sm ${themeClasses.textPrimary}`}>
                    {categoria}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={limparFiltros}
              className={`flex items-center space-x-2 px-4 py-2 text-sm ${themeClasses.textSecondary} hover:${themeClasses.textPrimary} hover:${themeClasses.bgSecondary} rounded-lg transition-colors`}
            >
              <X className="w-4 h-4" />
              <span>Limpar Filtros</span>
            </button>

            <div className={`text-sm ${themeClasses.textTertiary}`}>
              Filtros ativos:{' '}
              {
                [
                  filtros.busca && 'Busca',
                  filtros.dataInicio && 'Data Início',
                  filtros.dataFim && 'Data Fim',
                  filtros.status.length > 0 &&
                    `Status (${filtros.status.length})`,
                  filtros.categorias.length > 0 &&
                    `Categorias (${filtros.categorias.length})`,
                ].filter(Boolean).length
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuscaAvancada;
