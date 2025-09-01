import React from 'react';
import GanttChart from './GanttChart';
import { CategoriaCronograma } from '../types/cronograma';

interface GanttViewProps {
  categoriasCronograma: CategoriaCronograma[];
}

export default function GanttView({ categoriasCronograma }: GanttViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          📊 Gráfico de Gantt
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Visualização temporal das atividades e dependências do projeto.
        </p>
        <GanttChart categorias={categoriasCronograma} />
      </div>
    </div>
  );
}
