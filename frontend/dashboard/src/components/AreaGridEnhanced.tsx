import React, { useState, useMemo } from 'react';
import {
  Grid,
  List,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  LayoutGrid,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { EventArea } from '../types';
import { useThemeClasses } from '../contexts/ThemeContext';
import AreaCardEnhanced from './AreaCardEnhanced';

interface AreaGridEnhancedProps {
  areas: EventArea[];
  onAreaClick: (area: EventArea) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const AreaGridEnhanced: React.FC<AreaGridEnhancedProps> = ({
  areas,
  onAreaClick,
  isLoading = false,
  onRefresh,
}) => {
  const themeClasses = useThemeClasses();

  // Estados para controles
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cardLayout, setCardLayout] = useState<'card' | 'compact' | 'detailed'>(
    'card'
  );
  const [sortBy, setSortBy] = useState<
    'name' | 'progress' | 'status' | 'category'
  >('progress');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Obter categorias únicas
  const categories = useMemo(() => {
    return Array.from(new Set(areas.map((area) => area.category)));
  }, [areas]);

  // Obter status únicos
  const statuses = useMemo(() => {
    return Array.from(new Set(areas.map((area) => area.status)));
  }, [areas]);

  // Filtrar e ordenar áreas
  const processedAreas = useMemo(() => {
    let filtered = areas.filter((area) => {
      const matchesSearch =
        area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        area.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === 'all' || area.category === filterCategory;
      const matchesStatus =
        filterStatus === 'all' || area.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'progress':
          comparison = a.currentOccupancy - b.currentOccupancy;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [areas, searchTerm, filterCategory, filterStatus, sortBy, sortOrder]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = processedAreas.length;
    const completed = processedAreas.filter(
      (a) => a.currentOccupancy >= 100
    ).length;
    const inProgress = processedAreas.filter(
      (a) => a.currentOccupancy > 0 && a.currentOccupancy < 100
    ).length;
    const notStarted = processedAreas.filter(
      (a) => a.currentOccupancy === 0
    ).length;
    const avgProgress =
      total > 0
        ? processedAreas.reduce((sum, a) => sum + a.currentOccupancy, 0) / total
        : 0;

    return { total, completed, inProgress, notStarted, avgProgress };
  }, [processedAreas]);

  const getGridColumns = () => {
    switch (cardLayout) {
      case 'compact':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 'detailed':
        return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className={`${themeClasses.card} rounded-xl p-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Título e stats */}
          <div>
            <h2
              className={`text-2xl font-bold ${themeClasses.textPrimary} mb-2`}
            >
              Atividades da Preparação
            </h2>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className={themeClasses.textSecondary}>
                <strong>{stats.total}</strong> atividades
              </span>
              <span className="text-green-600">
                <strong>{stats.completed}</strong> concluídas
              </span>
              <span className="text-blue-600">
                <strong>{stats.inProgress}</strong> em andamento
              </span>
              <span className="text-gray-600">
                <strong>{stats.notStarted}</strong> não iniciadas
              </span>
              <span className={themeClasses.textSecondary}>
                <strong>{stats.avgProgress.toFixed(1)}%</strong> progresso médio
              </span>
            </div>
          </div>

          {/* Controles de visualização */}
          <div className="flex flex-wrap items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className={`p-2 rounded-lg border transition-colors ${
                  isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-300'
                }`}
                title="Atualizar dados"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                />
              </button>
            )}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-blue-100 text-blue-600 border-blue-300'
                  : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-300'
              }`}
              title="Filtros"
            >
              <Filter className="w-4 h-4" />
            </button>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-white hover:bg-gray-50 text-gray-600'
                }`}
                title="Visualização em grade"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-white hover:bg-gray-50 text-gray-600'
                }`}
                title="Visualização em lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <select
              value={cardLayout}
              onChange={(e) => setCardLayout(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="compact">Compacto</option>
              <option value="card">Padrão</option>
              <option value="detailed">Detalhado</option>
            </select>
          </div>
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Busca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nome ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Filtro por categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">Todos os status</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'normal'
                        ? 'No Prazo'
                        : status === 'warning'
                          ? 'Atenção'
                          : status === 'critical'
                            ? 'Crítico'
                            : status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ordenação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordenar por
                </label>
                <div className="flex space-x-1">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg text-sm"
                  >
                    <option value="progress">Progresso</option>
                    <option value="name">Nome</option>
                    <option value="category">Categoria</option>
                    <option value="status">Status</option>
                  </select>
                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }
                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg bg-white hover:bg-gray-50"
                  >
                    {sortOrder === 'asc' ? (
                      <SortAsc className="w-4 h-4" />
                    ) : (
                      <SortDesc className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Botões de ação nos filtros */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Mostrando {processedAreas.length} de {areas.length} atividades
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                  setFilterStatus('all');
                  setSortBy('progress');
                  setSortOrder('desc');
                }}
                className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              Carregando atividades...
            </p>
          </div>
        </div>
      )}

      {/* Grid/List de áreas */}
      {!isLoading && processedAreas.length === 0 ? (
        <div className={`${themeClasses.card} rounded-xl p-12 text-center`}>
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3
            className={`text-lg font-medium ${themeClasses.textPrimary} mb-2`}
          >
            Nenhuma atividade encontrada
          </h3>
          <p className={`${themeClasses.textSecondary} mb-4`}>
            Tente ajustar os filtros ou verifique se há dados carregados.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
              setFilterStatus('all');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        !isLoading && (
          <div
            className={
              viewMode === 'grid'
                ? `grid ${getGridColumns()} gap-6`
                : 'space-y-3'
            }
          >
            {processedAreas.map((area) => (
              <AreaCardEnhanced
                key={area.id}
                area={area}
                onClick={() => onAreaClick(area)}
                layout={viewMode === 'list' ? 'compact' : cardLayout}
                showTrend={cardLayout !== 'compact'}
                showMiniChart={cardLayout === 'detailed'}
              />
            ))}
          </div>
        )
      )}

      {/* Footer com informações adicionais */}
      {!isLoading && processedAreas.length > 0 && (
        <div className={`${themeClasses.card} rounded-xl p-4`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm">
            <div className={`${themeClasses.textSecondary} mb-2 md:mb-0`}>
              Última atualização: {new Date().toLocaleString('pt-BR')}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600">Concluídas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-blue-600">Em andamento</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">Não iniciadas</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaGridEnhanced;
