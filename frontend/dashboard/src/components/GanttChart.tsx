import React, { useState, useEffect, useRef } from 'react';
import { TarefaCronograma, CategoriaCronograma } from '../types/cronograma';
import { useThemeClasses } from '../contexts/ThemeContext';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Filter,
  Settings,
  Maximize2,
} from 'lucide-react';

interface GanttChartProps {
  categorias: CategoriaCronograma[];
  onTarefaClick?: (tarefa: TarefaCronograma) => void;
}

interface TimelineScale {
  scale: 'day' | 'week' | 'month';
  pixelsPerDay: number;
}

const GanttChart: React.FC<GanttChartProps> = ({
  categorias,
  onTarefaClick,
}) => {
  const themeClasses = useThemeClasses();
  const containerRef = useRef<HTMLDivElement>(null);

  const [timelineScale, setTimelineScale] = useState<TimelineScale>({
    scale: 'week',
    pixelsPerDay: 20,
  });
  const [viewStart, setViewStart] = useState<Date>(new Date('2025-05-31'));
  const [viewEnd, setViewEnd] = useState<Date>(new Date('2025-09-30'));
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [highlightCritical, setHighlightCritical] = useState(true);

  // Obter todas as tarefas
  const getAllTasks = (): TarefaCronograma[] => {
    const tasks: TarefaCronograma[] = [];
    categorias.forEach((categoria) => {
      if (
        selectedCategories.length === 0 ||
        selectedCategories.includes(categoria.nome)
      ) {
        categoria.tarefas.forEach((tarefa) => {
          tasks.push(tarefa);
          if (tarefa.subatividades) {
            tasks.push(...tarefa.subatividades);
          }
        });
      }
    });
    return tasks.sort(
      (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()
    );
  };

  // Calcular posição X baseada na data
  const getXPosition = (date: Date): number => {
    const daysDiff =
      (date.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff * timelineScale.pixelsPerDay;
  };

  // Calcular largura da barra
  const getBarWidth = (startDate: Date, endDate: Date): number => {
    const duration =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(duration * timelineScale.pixelsPerDay, 20); // Mínimo 20px
  };

  // Gerar timeline do cabeçalho
  const generateTimeline = () => {
    const timeline = [];
    const current = new Date(viewStart);
    const totalDays =
      (viewEnd.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24);

    if (timelineScale.scale === 'day') {
      while (current <= viewEnd) {
        timeline.push({
          date: new Date(current),
          label: current.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
          }),
          isWeekend: current.getDay() === 0 || current.getDay() === 6,
        });
        current.setDate(current.getDate() + 1);
      }
    } else if (timelineScale.scale === 'week') {
      // Ir para o início da semana
      current.setDate(current.getDate() - current.getDay());
      while (current <= viewEnd) {
        timeline.push({
          date: new Date(current),
          label: current.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
          }),
          isWeekend: false,
        });
        current.setDate(current.getDate() + 7);
      }
    } else {
      current.setDate(1);
      while (current <= viewEnd) {
        timeline.push({
          date: new Date(current),
          label: current.toLocaleDateString('pt-BR', {
            month: 'short',
            year: '2-digit',
          }),
          isWeekend: false,
        });
        current.setMonth(current.getMonth() + 1);
      }
    }

    return timeline;
  };

  // Determinar cor da barra baseada no status
  const getBarColor = (tarefa: TarefaCronograma) => {
    const hoje = new Date();
    const fim = new Date(tarefa.fim);
    const fimBaseline = new Date(tarefa.fimBaseline);
    const diasParaFim =
      (fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);

    if (tarefa.percentualCompleto === 100) {
      return 'bg-green-500';
    } else if (diasParaFim < 0 || fim > fimBaseline) {
      return 'bg-red-500';
    } else if (diasParaFim <= 3) {
      return 'bg-orange-500';
    } else {
      return 'bg-blue-500';
    }
  };

  // Zoom functions
  const zoomIn = () => {
    setTimelineScale((prev) => ({
      ...prev,
      pixelsPerDay: Math.min(prev.pixelsPerDay * 1.5, 100),
    }));
  };

  const zoomOut = () => {
    setTimelineScale((prev) => ({
      ...prev,
      pixelsPerDay: Math.max(prev.pixelsPerDay / 1.5, 5),
    }));
  };

  // Pan functions
  const panLeft = () => {
    const days = 7;
    setViewStart(
      (prev) => new Date(prev.getTime() - days * 24 * 60 * 60 * 1000)
    );
    setViewEnd((prev) => new Date(prev.getTime() - days * 24 * 60 * 60 * 1000));
  };

  const panRight = () => {
    const days = 7;
    setViewStart(
      (prev) => new Date(prev.getTime() + days * 24 * 60 * 60 * 1000)
    );
    setViewEnd((prev) => new Date(prev.getTime() + days * 24 * 60 * 60 * 1000));
  };

  const tasks = getAllTasks();
  const timeline = generateTimeline();
  const totalWidth = getXPosition(viewEnd);

  return (
    <div
      className={`${themeClasses.card} rounded-xl shadow-lg overflow-hidden`}
    >
      {/* Header Controls */}
      <div className={`p-4 border-b ${themeClasses.border}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${themeClasses.textPrimary}`}>
            📈 Gráfico de Gantt Interativo
          </h3>
          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <button
              onClick={zoomOut}
              className={`p-2 rounded-lg hover:${themeClasses.bgSecondary} transition-colors`}
            >
              <ZoomOut className={`w-4 h-4 ${themeClasses.textSecondary}`} />
            </button>
            <button
              onClick={zoomIn}
              className={`p-2 rounded-lg hover:${themeClasses.bgSecondary} transition-colors`}
            >
              <ZoomIn className={`w-4 h-4 ${themeClasses.textSecondary}`} />
            </button>

            {/* Pan Controls */}
            <button
              onClick={panLeft}
              className={`p-2 rounded-lg hover:${themeClasses.bgSecondary} transition-colors`}
            >
              <ChevronLeft
                className={`w-4 h-4 ${themeClasses.textSecondary}`}
              />
            </button>
            <button
              onClick={panRight}
              className={`p-2 rounded-lg hover:${themeClasses.bgSecondary} transition-colors`}
            >
              <ChevronRight
                className={`w-4 h-4 ${themeClasses.textSecondary}`}
              />
            </button>
          </div>
        </div>

        {/* Scale Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className={`text-sm ${themeClasses.textSecondary}`}>
              Escala:
            </label>
            {['day', 'week', 'month'].map((scale) => (
              <button
                key={scale}
                onClick={() =>
                  setTimelineScale((prev) => ({ ...prev, scale: scale as any }))
                }
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  timelineScale.scale === scale
                    ? 'bg-blue-500 text-white'
                    : `hover:${themeClasses.bgSecondary} ${themeClasses.textSecondary}`
                }`}
              >
                {scale === 'day' ? 'Dia' : scale === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={highlightCritical}
              onChange={(e) => setHighlightCritical(e.target.checked)}
              className="rounded"
            />
            <span className={`text-sm ${themeClasses.textSecondary}`}>
              Destacar caminho crítico
            </span>
          </label>
        </div>
      </div>

      {/* Gantt Chart */}
      <div ref={containerRef} className="overflow-auto max-h-96">
        <div className="relative" style={{ width: Math.max(totalWidth, 800) }}>
          {/* Timeline Header */}
          <div
            className={`sticky top-0 z-20 ${themeClasses.bgPrimary} border-b ${themeClasses.border}`}
          >
            <div className="flex h-12">
              <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700"></div>
              <div className="flex-1 relative">
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    className={`absolute top-0 bottom-0 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs ${
                      item.isWeekend ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}
                    style={{
                      left: getXPosition(item.date),
                      width:
                        timelineScale.pixelsPerDay *
                        (timelineScale.scale === 'day'
                          ? 1
                          : timelineScale.scale === 'week'
                            ? 7
                            : 30),
                    }}
                  >
                    <span className={themeClasses.textSecondary}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task Rows */}
          <div>
            {tasks.map((tarefa, index) => (
              <div
                key={tarefa.id}
                className={`flex h-12 border-b border-gray-100 dark:border-gray-800 hover:${themeClasses.bgSecondary} transition-colors`}
              >
                {/* Task Name Column */}
                <div
                  className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 px-3 py-2 flex items-center cursor-pointer"
                  onClick={() => onTarefaClick?.(tarefa)}
                >
                  <div className="truncate">
                    <span
                      className={`text-sm ${themeClasses.textPrimary}`}
                      style={{ paddingLeft: `${tarefa.nivel * 16}px` }}
                    >
                      {tarefa.nome}
                    </span>
                    <div className="text-xs text-gray-500">
                      {tarefa.percentualCompleto}% • {tarefa.categoria}
                    </div>
                  </div>
                </div>

                {/* Gantt Bar Column */}
                <div className="flex-1 relative py-3">
                  {/* Progress Background */}
                  <div
                    className={`absolute top-3 bottom-3 ${getBarColor(tarefa)} opacity-20 rounded`}
                    style={{
                      left: getXPosition(new Date(tarefa.inicio)),
                      width: getBarWidth(
                        new Date(tarefa.inicio),
                        new Date(tarefa.fim)
                      ),
                    }}
                  />

                  {/* Progress Bar */}
                  <div
                    className={`absolute top-3 bottom-3 ${getBarColor(tarefa)} rounded cursor-pointer hover:opacity-80 transition-opacity`}
                    style={{
                      left: getXPosition(new Date(tarefa.inicio)),
                      width:
                        getBarWidth(
                          new Date(tarefa.inicio),
                          new Date(tarefa.fim)
                        ) *
                        (tarefa.percentualCompleto / 100),
                    }}
                    onClick={() => onTarefaClick?.(tarefa)}
                    title={`${tarefa.nome} - ${tarefa.percentualCompleto}%`}
                  />

                  {/* Baseline Bar (if different) */}
                  {new Date(tarefa.fim).getTime() !==
                    new Date(tarefa.fimBaseline).getTime() && (
                    <div
                      className="absolute top-1 h-1 bg-gray-400 opacity-60 rounded"
                      style={{
                        left: getXPosition(new Date(tarefa.inicioBaseline)),
                        width: getBarWidth(
                          new Date(tarefa.inicioBaseline),
                          new Date(tarefa.fimBaseline)
                        ),
                      }}
                      title="Baseline"
                    />
                  )}

                  {/* Today Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: getXPosition(new Date()) }}
                    title="Hoje"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className={`p-4 border-t ${themeClasses.border}`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className={themeClasses.textSecondary}>Concluída</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className={themeClasses.textSecondary}>Em dia</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className={themeClasses.textSecondary}>Crítica</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className={themeClasses.textSecondary}>Atrasada</span>
            </div>
          </div>
          <div className="text-gray-500">Total: {tasks.length} tarefas</div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
