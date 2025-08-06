import React from 'react';
import { ResumoCronograma } from '../types/cronograma';
import {
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Timer,
  Activity,
  Zap,
} from 'lucide-react';

interface ResumoCardsCronogramaProps {
  resumo: ResumoCronograma;
}

const ResumoCardsCronograma: React.FC<ResumoCardsCronogramaProps> = ({
  resumo,
}) => {
  const cards = [
    {
      title: 'Progresso Geral',
      value: `${Math.round(resumo.progressoGeral)}%`,
      icon: <Target className="w-8 h-8 text-white" />,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
      cardGradient: 'bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50',
      progress: resumo.progressoGeral,
      progressColor: 'from-blue-400 to-blue-600',
      animate: 'animate-pulse',
    },
    {
      title: 'Tarefas Concluídas',
      value: `${resumo.tarefasConcluidas}`,
      subtitle: `de ${resumo.totalTarefas} tarefas`,
      icon: <CheckCircle className="w-8 h-8 text-white" />,
      gradient: 'bg-gradient-to-br from-green-500 to-green-700',
      cardGradient: 'bg-gradient-to-br from-green-50 via-green-100 to-green-50',
      progress: (resumo.tarefasConcluidas / resumo.totalTarefas) * 100,
      progressColor: 'from-green-400 to-green-600',
      animate: 'animate-bounce',
    },
    {
      title: 'Em Andamento',
      value: `${resumo.tarefasEmAndamento}`,
      subtitle: 'tarefas ativas',
      icon: <Activity className="w-8 h-8 text-white" />,
      gradient: 'bg-gradient-to-br from-yellow-500 to-orange-600',
      cardGradient:
        'bg-gradient-to-br from-yellow-50 via-yellow-100 to-orange-50',
      progressColor: 'from-yellow-400 to-orange-500',
      animate: 'animate-pulse',
    },
    {
      title: 'Atividades Atrasadas',
      value: resumo.statusGeral
        ? `${resumo.statusGeral.atividadesAtrasadas}`
        : '0',
      subtitle: resumo.statusGeral
        ? `de ${resumo.statusGeral.totalAtividades} atividades`
        : '',
      icon: <AlertTriangle className="w-8 h-8 text-white" />,
      gradient: 'bg-gradient-to-br from-red-500 to-red-700',
      cardGradient: 'bg-gradient-to-br from-red-50 via-red-100 to-red-50',
      progressColor: 'from-red-400 to-red-600',
      animate:
        resumo.statusGeral && resumo.statusGeral.atividadesAtrasadas > 0
          ? 'animate-pulse'
          : '',
    },
  ];

  // Cards adicionais para status detalhado se disponível
  const statusCards = resumo.statusGeral
    ? [
        {
          title: 'Atividades Em Dia',
          value: `${resumo.statusGeral.atividadesEmDia}`,
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          color: 'text-green-600',
          bgGradient: 'bg-gradient-to-br from-green-50 to-green-100',
          borderColor: 'border-green-200',
        },
        {
          title: 'Atividades Críticas',
          value: `${resumo.statusGeral.atividadesCriticas}`,
          icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
          color: 'text-orange-600',
          bgGradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
          borderColor: 'border-orange-200',
        },
        {
          title: 'Atividades Adiantadas',
          value: `${resumo.statusGeral.atividadesAdiantadas}`,
          icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
          color: 'text-blue-600',
          bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
          borderColor: 'border-blue-200',
        },
        {
          title: 'Dias Restantes',
          value: `${resumo.diasRestantes}`,
          icon: <Calendar className="w-6 h-6 text-purple-600" />,
          color: 'text-purple-600',
          bgGradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
          borderColor: 'border-purple-200',
        },
      ]
    : [];

  return (
    <div className="space-y-8 mb-8">
      {/* Título da seção com gradiente */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent mb-2">
          Resumo do Cronograma
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
      </div>

      {/* Cards principais com visual aprimorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.cardGradient} border-2 border-white rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden group`}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            {/* Elemento decorativo de fundo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    {card.title}
                  </h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {card.value}
                  </p>
                  {card.subtitle && (
                    <p className="text-sm text-gray-600 mt-1 font-medium">
                      {card.subtitle}
                    </p>
                  )}
                </div>
                <div
                  className={`${card.gradient} p-3 rounded-xl shadow-lg ${card.animate}`}
                >
                  {card.icon}
                </div>
              </div>

              {card.progress !== undefined && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600 font-medium">
                      Progresso
                    </span>
                    <span className="text-xs text-gray-700 font-bold">
                      {Math.round(card.progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${card.progressColor} transition-all duration-1000 ease-out relative`}
                      style={{ width: `${Math.min(card.progress, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Cards de status detalhado */}
      {statusCards.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6 text-center">
            Status Detalhado das Atividades
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusCards.map((statusCard, index) => (
              <div
                key={index}
                className={`${statusCard.bgGradient} ${statusCard.borderColor} border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 relative overflow-hidden group`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Elemento decorativo */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                        {statusCard.title}
                      </h4>
                      <p className={`text-2xl font-bold ${statusCard.color}`}>
                        {statusCard.value}
                      </p>
                    </div>
                    <div className="ml-2 p-2 bg-white/50 rounded-lg shadow-sm">
                      {statusCard.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumoCardsCronograma;
