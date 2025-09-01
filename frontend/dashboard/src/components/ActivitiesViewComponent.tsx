import React from 'react';
import { PhaseType } from '../types/phases';
import PhaseIndicatorComponent from './PhaseIndicatorComponent';
import ActivityFiltersComponent from './ActivityFiltersComponent';
import PhaseActivitiesManager from './PhaseActivitiesManager';

interface ActivitiesViewProps {
  selectedPhase: PhaseType;
  termoPesquisa: string;
  setTermoPesquisa: (value: string) => void;
  filtroStatus: string;
  setFiltroStatus: (value: string) => void;
  filtroPrioridade: string;
  setFiltroPrioridade: (value: string) => void;
  onBackToDashboard?: () => void;
}

export default function ActivitiesView({
  selectedPhase,
  termoPesquisa,
  setTermoPesquisa,
  filtroStatus,
  setFiltroStatus,
  filtroPrioridade,
  setFiltroPrioridade,
  onBackToDashboard,
}: ActivitiesViewProps) {
  const handleClearFilters = () => {
    setTermoPesquisa('');
    setFiltroStatus('');
    setFiltroPrioridade('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          🔧 Gestão de Atividades -{' '}
          {selectedPhase
            ? `Fase: ${selectedPhase.charAt(0).toUpperCase() + selectedPhase.slice(1)}`
            : 'Todas as Fases'}
        </h1>

        {/* Indicador da Fase Selecionada */}
        {selectedPhase && (
          <PhaseIndicatorComponent
            selectedPhase={selectedPhase}
            onBackToDashboard={onBackToDashboard}
          />
        )}

        {/* Filtros */}
        <ActivityFiltersComponent
          termoPesquisa={termoPesquisa}
          setTermoPesquisa={setTermoPesquisa}
          filtroStatus={filtroStatus}
          setFiltroStatus={setFiltroStatus}
          filtroPrioridade={filtroPrioridade}
          setFiltroPrioridade={setFiltroPrioridade}
          onClearFilters={handleClearFilters}
        />

        <PhaseActivitiesManager
          activities={[]}
          phaseName={
            selectedPhase
              ? selectedPhase.charAt(0).toUpperCase() + selectedPhase.slice(1)
              : 'Atividades'
          }
          termoPesquisa={termoPesquisa}
          filtroStatus={filtroStatus}
          filtroPrioridade={filtroPrioridade}
        />
      </div>
    </div>
  );
}
