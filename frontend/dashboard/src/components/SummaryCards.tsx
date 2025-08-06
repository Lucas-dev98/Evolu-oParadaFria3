import React from 'react';
import { CheckCircle2, MapPin, Activity, Calendar } from 'lucide-react';
import { DashboardSummary } from '../types';

interface SummaryCardsProps {
  summary: DashboardSummary;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Atividades Concluídas',
      value: summary.totalOccupancy.toLocaleString(),
      subtitle: `de ${summary.totalCapacity.toLocaleString()} atividades`,
      icon: CheckCircle2,
      color: 'blue',
      percentage: summary.occupancyRate,
    },
    {
      title: 'Atividades Ativas',
      value: summary.activeAreas.toString(),
      subtitle: `de ${summary.totalAreas} atividades principais`,
      icon: MapPin,
      color: 'green',
      percentage: (summary.activeAreas / summary.totalAreas) * 100,
    },
    {
      title: 'Preparação PFUS3',
      value: `73%`,
      subtitle: 'cronograma geral completo',
      icon: Activity,
      color: 'green',
      percentage: 73,
    },
    {
      title: 'Status Atual',
      value: 'Em Preparação',
      subtitle: 'Fase ativa do projeto',
      icon: Calendar,
      color: 'purple',
      percentage: 73,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-500 bg-blue-50',
      green: 'bg-green-500 text-green-500 bg-green-50',
      yellow: 'bg-yellow-500 text-yellow-500 bg-yellow-50',
      red: 'bg-red-500 text-red-500 bg-red-50',
      purple: 'bg-purple-500 text-purple-500 bg-purple-50',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const [bgColor, textColor, lightBg] = getColorClasses(card.color).split(
          ' '
        );

        return (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${lightBg}`}>
                <card.icon className={`w-6 h-6 ${textColor}`} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">
                  {card.value}
                </div>
                <div className="text-sm text-gray-500">{card.subtitle}</div>
              </div>
            </div>

            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {card.title}
              </h3>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${bgColor}`}
                style={{ width: `${Math.min(card.percentage, 100)}%` }}
              ></div>
            </div>

            <div className="mt-2 text-right">
              <span className="text-xs text-gray-500">
                {card.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
