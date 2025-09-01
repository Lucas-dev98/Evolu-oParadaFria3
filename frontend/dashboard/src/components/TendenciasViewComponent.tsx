import React from 'react';
import KPIDashboard from './KPIDashboard-Real';
import { CategoriaCronograma } from '../types/cronograma';

interface TendenciasViewProps {
  categoriasCronograma: CategoriaCronograma[];
}

export default function TendenciasView({
  categoriasCronograma,
}: TendenciasViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          📈 KPIs & Tendências
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Indicadores de performance e análise de tendências do projeto.
        </p>
        <KPIDashboard categorias={categoriasCronograma} />
      </div>
    </div>
  );
}
