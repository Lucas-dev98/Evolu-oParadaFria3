import React, { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { DashboardSummary } from '../types';
import { PieChart, Users, BarChart3 } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryChartProps {
  summary: DashboardSummary;
}

const CategoryChart: React.FC<CategoryChartProps> = ({ summary }) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const categories = Object.keys(summary.areasByCategory);
  const occupancyByCategory = categories.map((category) =>
    summary.areasByCategory[category].reduce(
      (sum, area) => sum + area.currentOccupancy,
      0
    )
  );

  const totalOccupancy = occupancyByCategory.reduce(
    (sum, value) => sum + value,
    0
  );

  // Cores aprimoradas
  const enhancedColors = [
    { main: '#3B82F6', hover: '#2563EB', light: '#DBEAFE' }, // blue
    { main: '#10B981', hover: '#059669', light: '#D1FAE5' }, // green
    { main: '#F59E0B', hover: '#D97706', light: '#FEF3C7' }, // yellow
    { main: '#EF4444', hover: '#DC2626', light: '#FEE2E2' }, // red
    { main: '#8B5CF6', hover: '#7C3AED', light: '#EDE9FE' }, // purple
    { main: '#EC4899', hover: '#DB2777', light: '#FCE7F3' }, // pink
    { main: '#14B8A6', hover: '#0D9488', light: '#CCFBF1' }, // teal
    { main: '#F97316', hover: '#EA580C', light: '#FED7AA' }, // orange
  ];

  const chartData = {
    labels: categories,
    datasets: [
      {
        data: occupancyByCategory,
        backgroundColor: enhancedColors
          .slice(0, categories.length)
          .map((c) => c.main),
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverBackgroundColor: enhancedColors
          .slice(0, categories.length)
          .map((c) => c.hover),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 13,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function (context: any) {
            const percentage = (
              (context.parsed / totalOccupancy) *
              100
            ).toFixed(1);
            const areasCount =
              summary.areasByCategory[context.label]?.length || 0;
            return `${context.label}: ${context.parsed}% progresso (${percentage}%) - ${areasCount} atividade(s)`;
          },
        },
      },
    },
    cutout: '60%',
    animation: {
      animateRotate: true,
      duration: 1200,
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Distribuição por Categoria
          </h3>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('chart')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'chart'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <PieChart className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'table'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <>
          {/* Gráfico */}
          <div className="relative h-80 mb-6">
            <Doughnut data={chartData} options={options} />

            {/* Valor central */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">
                  {totalOccupancy.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">progresso médio</div>
              </div>
            </div>
          </div>

          {/* Resumo rápido */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Resumo</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {totalOccupancy.toLocaleString()}
                </div>
                <div className="text-blue-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {categories.length}
                </div>
                <div className="text-blue-600">Categorias</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {Object.values(summary.areasByCategory).flat().length}
                </div>
                <div className="text-blue-600">Áreas</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Tabela */
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Progresso
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Percentual
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Áreas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories
                  .map((category, index) => ({
                    category,
                    occupancy: occupancyByCategory[index],
                    percentage: (
                      (occupancyByCategory[index] / totalOccupancy) *
                      100
                    ).toFixed(1),
                    areasCount: summary.areasByCategory[category]?.length || 0,
                    color: enhancedColors[index % enhancedColors.length],
                  }))
                  .sort((a, b) => b.occupancy - a.occupancy)
                  .map((item) => (
                    <tr key={item.category} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color.main }}
                          />
                          <span className="font-medium text-gray-800">
                            {item.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-800">
                        {item.occupancy.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {item.percentage}%
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {item.areasCount}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryChart;
