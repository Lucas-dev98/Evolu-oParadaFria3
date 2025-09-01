import React from 'react';
import PhaseActivitiesManager from './PhaseActivitiesManager';

export default function FasesView() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          ⚙️ Gestão por Fases
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Configure e gerencie as diferentes fases do projeto PFUS3.
        </p>
        <PhaseActivitiesManager activities={[]} phaseName="Gestão de Fases" />
      </div>
    </div>
  );
}
