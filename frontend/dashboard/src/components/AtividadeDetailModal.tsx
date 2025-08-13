import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronDown,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  Target,
} from 'lucide-react';
import { AtividadeDetalhada } from '../utils/cronogramaPreparacaoProcessor';

interface AtividadeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  atividades: AtividadeDetalhada[];
  titulo: string;
}

const AtividadeDetailModal: React.FC<AtividadeDetailModalProps> = ({
  isOpen,
  onClose,
  atividades,
  titulo,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');

  if (!isOpen) return null;

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50';
      case 'delayed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress':
        return <PlayCircle className="w-4 h-4" />;
      case 'delayed':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <PauseCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'in-progress':
        return 'Em Andamento';
      case 'delayed':
        return 'Atrasada';
      default:
        return 'Pendente';
    }
  };

  const renderAtividade = (
    atividade: AtividadeDetalhada,
    nivel: number = 0
  ) => {
    const hasSubatividades = atividade.subatividades.length > 0;
    const isExpanded = expandedItems.has(atividade.id);

    return (
      <div key={atividade.id} className="border-b border-gray-100">
        <div
          className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer ${
            nivel > 0 ? `ml-${nivel * 6} border-l-2 border-gray-200` : ''
          }`}
          onClick={() => hasSubatividades && toggleExpanded(atividade.id)}
        >
          {/* Expansão */}
          <div className="w-6 h-6 flex items-center justify-center mr-3">
            {hasSubatividades ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )
            ) : (
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
            )}
          </div>

          {/* Status */}
          <div
            className={`flex items-center px-2 py-1 rounded-full mr-3 ${getStatusColor(atividade.status)}`}
          >
            {getStatusIcon(atividade.status)}
            <span className="ml-1 text-xs font-medium">
              {getStatusText(atividade.status)}
            </span>
          </div>

          {/* Informações principais */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <h3
                className={`font-medium ${nivel > 0 ? 'text-sm' : 'text-base'} text-gray-900 truncate`}
              >
                {atividade.nome}
              </h3>
              {atividade.isMarco && (
                <div title="Marco">
                  <Target className="w-4 h-4 ml-2 text-purple-500" />
                </div>
              )}
              {atividade.critica && (
                <div title="Crítica">
                  <AlertTriangle className="w-4 h-4 ml-2 text-orange-500" />
                </div>
              )}
            </div>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                {atividade.categoria}
              </span>
              <span className="flex items-center mr-4">
                <Clock className="w-3 h-3 mr-1" />
                {atividade.duracao}
              </span>
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {atividade.dataInicio} - {atividade.dataFim}
              </span>
            </div>
          </div>

          {/* Progresso */}
          <div className="flex items-center ml-4">
            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
              <div
                className={`h-2 rounded-full ${
                  atividade.status === 'completed'
                    ? 'bg-green-500'
                    : atividade.status === 'in-progress'
                      ? 'bg-blue-500'
                      : atividade.status === 'delayed'
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                }`}
                style={{ width: `${atividade.percentual}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900 w-12">
              {atividade.percentual}%
            </span>
          </div>
        </div>

        {/* Subatividades */}
        {hasSubatividades && isExpanded && (
          <div className="bg-gray-50">
            {atividade.subatividades.map((sub) =>
              renderAtividade(sub, nivel + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // Filtrar atividades
  const categorias = Array.from(new Set(atividades.map((a) => a.categoria)));

  const atividadesFiltradas = atividades.filter((atividade) => {
    const matchStatus =
      filtroStatus === 'todos' || atividade.status === filtroStatus;
    const matchCategoria =
      filtroCategoria === 'todas' || atividade.categoria === filtroCategoria;
    return matchStatus && matchCategoria;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute right-0 top-0 h-full w-full max-w-6xl bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700">
            <div>
              <h2 className="text-2xl font-bold text-white">{titulo}</h2>
              <p className="text-blue-100 mt-1">
                Detalhamento de Atividades e Subatividades
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Filtros */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="todos">Todos</option>
                  <option value="completed">Concluídas</option>
                  <option value="in-progress">Em Andamento</option>
                  <option value="pending">Pendentes</option>
                  <option value="delayed">Atrasadas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="todas">Todas</option>
                  {categorias.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    const allIds = new Set<number>();
                    const collectIds = (atividades: AtividadeDetalhada[]) => {
                      atividades.forEach((a) => {
                        if (a.subatividades.length > 0) {
                          allIds.add(a.id);
                          collectIds(a.subatividades);
                        }
                      });
                    };
                    collectIds(atividadesFiltradas);
                    setExpandedItems(allIds);
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
                >
                  Expandir Tudo
                </button>
                <button
                  onClick={() => setExpandedItems(new Set())}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Recolher Tudo
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Atividades */}
          <div className="flex-1 overflow-y-auto">
            {atividadesFiltradas.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Nenhuma atividade encontrada com os filtros aplicados
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {atividadesFiltradas.map((atividade) =>
                  renderAtividade(atividade)
                )}
              </div>
            )}
          </div>

          {/* Footer com estatísticas */}
          <div className="p-4 border-t bg-gray-50">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {atividadesFiltradas.length}
                </div>
                <div className="text-sm text-gray-600">Atividades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {
                    atividadesFiltradas.filter((a) => a.status === 'completed')
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">Concluídas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {
                    atividadesFiltradas.filter(
                      (a) => a.status === 'in-progress'
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">Em Andamento</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {
                    atividadesFiltradas.filter((a) => a.status === 'delayed')
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">Atrasadas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtividadeDetailModal;
