import React from 'react';
interface ActivityFiltersProps {
  termoPesquisa: string;
  setTermoPesquisa: (value: string) => void;
  filtroStatus: string;
  setFiltroStatus: (value: string) => void;
  filtroPrioridade: string;
  setFiltroPrioridade: (value: string) => void;
  onClearFilters: () => void;
}

export default function ActivityFilters({
  termoPesquisa,
  setTermoPesquisa,
  filtroStatus,
  setFiltroStatus,
  filtroPrioridade,
  setFiltroPrioridade,
  onClearFilters,
}: ActivityFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
      <input
        type="text"
        placeholder="Pesquisar atividades..."
        value={termoPesquisa}
        onChange={(e) => setTermoPesquisa(e.target.value)}
        className="px-3 py-2 border rounded-md flex-1 min-w-64 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
      />
      <select
        value={filtroStatus}
        onChange={(e) => setFiltroStatus(e.target.value)}
        className="px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
      >
        <option value="">Todos os Status</option>
        <option value="pendente">Pendente</option>
        <option value="em_andamento">Em Andamento</option>
        <option value="completa">Completa</option>
        <option value="atrasada">Atrasada</option>
      </select>
      <select
        value={filtroPrioridade}
        onChange={(e) => setFiltroPrioridade(e.target.value)}
        className="px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
      >
        <option value="">Todas as Prioridades</option>
        <option value="alta">Alta</option>
        <option value="media">Média</option>
        <option value="baixa">Baixa</option>
      </select>
      <button
        onClick={onClearFilters}
        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
      >
        Limpar
      </button>
    </div>
  );
}
