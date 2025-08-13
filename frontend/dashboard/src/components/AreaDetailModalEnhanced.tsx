import React, { useState, useMemo } from 'react';
import {
  X,
  Users,
  Thermometer,
  Droplets,
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Download,
  Share2,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Info,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { EventArea } from '../types';
import { useThemeClasses } from '../contexts/ThemeContext';

// Registrar os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface AreaDetailModalEnhancedProps {
  area: EventArea | null;
  isOpen: boolean;
  onClose: () => void;
}

const AreaDetailModalEnhanced: React.FC<AreaDetailModalEnhancedProps> = ({
  area,
  isOpen,
  onClose,
}) => {
  const themeClasses = useThemeClasses();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'progress' | 'analytics' | 'details'
  >('overview');

  if (!isOpen || !area) return null;

  const progressPercentage = area.currentOccupancy;

  // Simular dados adicionais para demonstração
  const mockSubTasks = [
    { id: 1, name: 'Planejamento', progress: 100, status: 'completed' },
    { id: 2, name: 'Procurement', progress: 85, status: 'in-progress' },
    { id: 3, name: 'Execução', progress: 45, status: 'in-progress' },
    { id: 4, name: 'Testes', progress: 0, status: 'pending' },
    { id: 5, name: 'Comissionamento', progress: 0, status: 'pending' },
  ];

  const mockTeamMembers = [
    { name: 'João Silva', role: 'Coordenador', status: 'active' },
    { name: 'Maria Santos', role: 'Engenheira', status: 'active' },
    { name: 'Pedro Costa', role: 'Técnico', status: 'active' },
    { name: 'Ana Lima', role: 'Supervisora', status: 'active' },
  ];

  const mockRisks = [
    {
      level: 'high',
      description: 'Atraso na entrega de materiais',
      impact: 'schedule',
    },
    { level: 'medium', description: 'Condições climáticas', impact: 'quality' },
    {
      level: 'low',
      description: 'Disponibilidade de recursos',
      impact: 'cost',
    },
  ];

  // Dados para o gráfico de evolução
  const evolutionChartData = {
    labels: area.evolution.map((point) => point.time),
    datasets: [
      {
        label: 'Progresso (%)',
        data: area.evolution.map((point) => point.occupancy),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 8,
      },
    ],
  };

  const evolutionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Evolução do Progresso',
        font: { size: 16, weight: 'bold' as const },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Período' },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
      },
      y: {
        title: { display: true, text: 'Progresso (%)' },
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
      },
    },
  };

  // Dados para gráfico de subtarefas
  const subTasksChartData = {
    labels: mockSubTasks.map((task) => task.name),
    datasets: [
      {
        data: mockSubTasks.map((task) => task.progress),
        backgroundColor: mockSubTasks.map((task) =>
          task.status === 'completed'
            ? '#10B981'
            : task.status === 'in-progress'
              ? '#3B82F6'
              : '#6B7280'
        ),
        borderWidth: 0,
      },
    ],
  };

  const subTasksChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Progresso por Subtarefa' },
    },
    scales: {
      x: { beginAtZero: true, max: 100 },
      y: { beginAtZero: true },
    },
  };

  // Status breakdown para gráfico de pizza
  const statusBreakdown = {
    labels: ['Concluído', 'Em Andamento', 'Pendente'],
    datasets: [
      {
        data: [
          mockSubTasks.filter((t) => t.status === 'completed').length,
          mockSubTasks.filter((t) => t.status === 'in-progress').length,
          mockSubTasks.filter((t) => t.status === 'pending').length,
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#6B7280'],
        borderWidth: 0,
      },
    ],
  };

  const getCategoryIcon = (areaName: string) => {
    if (areaName.includes('Logística')) return '🚛';
    if (areaName.includes('Refratário')) return '🧱';
    if (areaName.includes('Elétrica')) return '⚡';
    if (areaName.includes('Mecânica')) return '⚙️';
    if (areaName.includes('Preparação')) return '🏗️';
    if (areaName.includes('Barramentos')) return '🔌';
    return '⚡';
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'normal':
        return {
          text: 'No Prazo',
          color: 'text-green-600 bg-green-100',
          icon: CheckCircle2,
        };
      case 'warning':
        return {
          text: 'Atenção',
          color: 'text-yellow-600 bg-yellow-100',
          icon: AlertTriangle,
        };
      case 'critical':
        return {
          text: 'Crítico',
          color: 'text-red-600 bg-red-100',
          icon: AlertTriangle,
        };
      default:
        return { text: status, color: 'text-gray-600 bg-gray-100', icon: Info };
    }
  };

  const statusInfo = getStatusInfo(area.status);
  const StatusIcon = statusInfo.icon;

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'progress', name: 'Progresso', icon: Activity },
    { id: 'analytics', name: 'Analytics', icon: PieChart },
    { id: 'details', name: 'Detalhes', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${themeClasses.card} rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">
                {getCategoryIcon(area.name)}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">{area.name}</h2>
                <p className="text-blue-100 mb-2">{area.category}</p>
                <div
                  className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${statusInfo.color}`}
                >
                  <StatusIcon className="w-4 h-4" />
                  <span className="font-medium">{statusInfo.text}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-100">Progresso Geral</span>
              <span className="text-lg font-bold">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-0">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="text-blue-600" size={20} />
                    <span className="text-sm font-medium text-blue-800">
                      Meta Total
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {area.capacity}
                  </div>
                  <div className="text-sm text-blue-600">subatividades</div>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle2 className="text-green-600" size={20} />
                    <span className="text-sm font-medium text-green-800">
                      Concluído
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {area.currentOccupancy}
                  </div>
                  <div className="text-sm text-green-600">subatividades</div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="text-yellow-600" size={20} />
                    <span className="text-sm font-medium text-yellow-800">
                      Pendente
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-900">
                    {area.capacity - area.currentOccupancy}
                  </div>
                  <div className="text-sm text-yellow-600">subatividades</div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="text-purple-600" size={20} />
                    <span className="text-sm font-medium text-purple-800">
                      Equipe
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {mockTeamMembers.length}
                  </div>
                  <div className="text-sm text-purple-600">membros</div>
                </div>
              </div>

              {/* Team and Risks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team Members */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Equipe do Projeto</h3>
                  </div>
                  <div className="space-y-3">
                    {mockTeamMembers.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-600">
                            {member.role}
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Analysis */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-lg font-semibold">Análise de Riscos</h3>
                  </div>
                  <div className="space-y-3">
                    {mockRisks.map((risk, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          risk.level === 'high'
                            ? 'bg-red-50 border-red-200'
                            : risk.level === 'medium'
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div
                              className={`text-sm font-medium ${
                                risk.level === 'high'
                                  ? 'text-red-800'
                                  : risk.level === 'medium'
                                    ? 'text-yellow-800'
                                    : 'text-green-800'
                              }`}
                            >
                              {risk.description}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Impacto:{' '}
                              {risk.impact === 'schedule'
                                ? 'Cronograma'
                                : risk.impact === 'quality'
                                  ? 'Qualidade'
                                  : 'Custo'}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              risk.level === 'high'
                                ? 'bg-red-200 text-red-800'
                                : risk.level === 'medium'
                                  ? 'bg-yellow-200 text-yellow-800'
                                  : 'bg-green-200 text-green-800'
                            }`}
                          >
                            {risk.level === 'high'
                              ? 'Alto'
                              : risk.level === 'medium'
                                ? 'Médio'
                                : 'Baixo'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              {/* Subtasks Progress */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Progresso das Subtarefas
                </h3>
                <div className="space-y-4">
                  {mockSubTasks.map((task) => (
                    <div key={task.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{task.name}</span>
                        <span className="text-sm font-bold">
                          {task.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            task.status === 'completed'
                              ? 'bg-green-500'
                              : task.status === 'in-progress'
                                ? 'bg-blue-500'
                                : 'bg-gray-400'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          {task.status === 'completed'
                            ? 'Concluída'
                            : task.status === 'in-progress'
                              ? 'Em andamento'
                              : 'Pendente'}
                        </span>
                        <span>Meta: 100%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="h-64">
                    <Bar
                      data={subTasksChartData}
                      options={subTasksChartOptions}
                    />
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="h-64">
                    <Doughnut
                      data={statusBreakdown}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom' as const },
                          title: {
                            display: true,
                            text: 'Status das Subtarefas',
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Evolution Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-80">
                  <Line
                    data={evolutionChartData}
                    options={evolutionChartOptions}
                  />
                </div>
              </div>

              {/* Analytics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">
                      Velocidade
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900 mb-1">
                    {(progressPercentage / 30).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-600">por dia (média)</div>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">
                      Previsão
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-900 mb-1">
                    {Math.ceil(
                      (100 - progressPercentage) / (progressPercentage / 30)
                    )}{' '}
                    dias
                  </div>
                  <div className="text-sm text-green-600">para conclusão</div>
                </div>

                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-800">
                      Eficiência
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900 mb-1">
                    {Math.min(progressPercentage + 15, 100)}%
                  </div>
                  <div className="text-sm text-purple-600">da capacidade</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Technical Details */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Informações Técnicas
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Área/Local
                      </label>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>
                          {area.name} - Setor {area.category}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacidade Total
                      </label>
                      <span className="text-gray-900">
                        {area.capacity} subatividades
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status Atual
                      </label>
                      <span className="text-gray-900">{statusInfo.text}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Temperatura
                      </label>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Thermometer className="w-4 h-4 text-red-500" />
                        <span>{area.temperature}°C</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Umidade
                      </label>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span>{area.humidity}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Informações de Contato
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Responsável
                      </label>
                      <span className="text-gray-900">João Silva</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone
                      </label>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>(11) 99999-9999</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>joao.silva@empresa.com</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Documentação
                      </label>
                      <div className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer">
                        <ExternalLink className="w-4 h-4" />
                        <span>Acessar documentos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical Data */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Evolução Histórica
                </h3>
                <div className="h-64">
                  <Line
                    data={evolutionChartData}
                    options={evolutionChartOptions}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Última atualização: {new Date().toLocaleString('pt-BR')}
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Exportar Dados
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaDetailModalEnhanced;
