import React, { useState, useEffect } from 'react';
import { TarefaCronograma, CategoriaCronograma } from '../types/cronograma';
import { useThemeClasses } from '../contexts/ThemeContext';
import {
  Route,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  Network,
  Activity,
} from 'lucide-react';

interface CPMAnalysisProps {
  categorias: CategoriaCronograma[];
  onTarefaClick?: (tarefa: TarefaCronograma) => void;
}

interface CPMNode {
  task: TarefaCronograma;
  earlyStart: Date;
  earlyFinish: Date;
  lateStart: Date;
  lateFinish: Date;
  totalFloat: number;
  freeFloat: number;
  isCritical: boolean;
  predecessors: string[];
  successors: string[];
}

interface CriticalPath {
  tasks: CPMNode[];
  duration: number;
  slack: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

const CPMAnalysis: React.FC<CPMAnalysisProps> = ({
  categorias,
  onTarefaClick,
}) => {
  const themeClasses = useThemeClasses();
  const [cpmNodes, setCpmNodes] = useState<CPMNode[]>([]);
  const [criticalPaths, setCriticalPaths] = useState<CriticalPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Obter todas as tarefas de todas as categorias
  const getAllTasks = (): TarefaCronograma[] => {
    const tasks: TarefaCronograma[] = [];
    categorias.forEach((categoria) => {
      categoria.tarefas.forEach((tarefa) => {
        tasks.push(tarefa);
        if (tarefa.subatividades) {
          tasks.push(...tarefa.subatividades);
        }
      });
    });
    return tasks.sort(
      (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()
    );
  };

  // Calcular dependências (simulado baseado em sequência e categoria)
  const calculateDependencies = (
    tasks: TarefaCronograma[]
  ): Map<string, string[]> => {
    const dependencies = new Map<string, string[]>();

    tasks.forEach((task, index) => {
      const deps: string[] = [];

      // Dependência sequencial básica
      if (index > 0) {
        const prevTask = tasks[index - 1];
        // Se são da mesma categoria ou sequenciais, criar dependência
        if (
          task.categoria === prevTask.categoria ||
          new Date(task.inicio).getTime() - new Date(prevTask.fim).getTime() <
            7 * 24 * 60 * 60 * 1000
        ) {
          deps.push(prevTask.id.toString());
        }
      }

      // Dependências por categoria (simulado)
      if (task.categoria === 'Elétrica') {
        const mechanicalTasks = tasks.filter(
          (t) =>
            t.categoria === 'Mecânica' &&
            new Date(t.fim) <= new Date(task.inicio)
        );
        mechanicalTasks.forEach((t) => deps.push(t.id.toString()));
      }

      if (task.categoria === 'Instrumentação') {
        const prerequisiteTasks = tasks.filter(
          (t) =>
            (t.categoria === 'Elétrica' || t.categoria === 'Mecânica') &&
            new Date(t.fim) <= new Date(task.inicio)
        );
        prerequisiteTasks.forEach((t) => deps.push(t.id.toString()));
      }

      dependencies.set(task.id.toString(), Array.from(new Set(deps)));
    });

    return dependencies;
  };

  // Algoritmo CPM - Forward Pass
  const forwardPass = (
    tasks: TarefaCronograma[],
    dependencies: Map<string, string[]>
  ): Map<string, { es: Date; ef: Date }> => {
    const results = new Map<string, { es: Date; ef: Date }>();

    tasks.forEach((task) => {
      const taskDeps = dependencies.get(task.id.toString()) || [];
      let earliestStart = new Date(task.inicio);

      taskDeps.forEach((depId) => {
        const dep = results.get(depId);
        if (dep && dep.ef > earliestStart) {
          earliestStart = dep.ef;
        }
      });

      const duration =
        (new Date(task.fim).getTime() - new Date(task.inicio).getTime()) /
        (1000 * 60 * 60 * 24);
      const earliestFinish = new Date(
        earliestStart.getTime() + duration * 24 * 60 * 60 * 1000
      );

      results.set(task.id.toString(), {
        es: earliestStart,
        ef: earliestFinish,
      });
    });

    return results;
  };

  // CORREÇÃO: Algoritmo CPM - Backward Pass considerando fim do projeto
  const backwardPass = (
    tasks: TarefaCronograma[],
    dependencies: Map<string, string[]>,
    forwardResults: Map<string, { es: Date; ef: Date }>
  ): Map<string, { ls: Date; lf: Date }> => {
    const results = new Map<string, { ls: Date; lf: Date }>();
    const successors = new Map<string, string[]>();

    // Construir mapa de sucessores
    dependencies.forEach((deps, taskId) => {
      deps.forEach((depId) => {
        if (!successors.has(depId)) {
          successors.set(depId, []);
        }
        successors.get(depId)!.push(taskId);
      });
    });

    // CORREÇÃO: Data de fim do projeto considera both calculated and planned
    let projectEndCalculated = new Date(0);
    forwardResults.forEach(({ ef }) => {
      if (ef > projectEndCalculated) projectEndCalculated = ef;
    });

    // Usar a maior data entre planejada e calculada como fim do projeto
    const maxPlannedDate = Math.max(
      ...tasks.map((t) => new Date(t.fim).getTime())
    );
    const projectEndPlanned = new Date(maxPlannedDate);

    // Data de fim do projeto é a maior entre calculada e planejada
    const projectEnd =
      projectEndCalculated > projectEndPlanned
        ? projectEndCalculated
        : projectEndPlanned;

    console.log(
      `📅 Fim calculado: ${projectEndCalculated.toLocaleDateString('pt-BR')}`
    );
    console.log(
      `📅 Fim planejado: ${projectEndPlanned.toLocaleDateString('pt-BR')}`
    );
    console.log(`📅 Fim do projeto: ${projectEnd.toLocaleDateString('pt-BR')}`);

    // Processar tarefas em ordem reversa
    const reverseTasks = [...tasks].reverse();

    reverseTasks.forEach((task) => {
      const taskId = task.id.toString();
      const taskSuccessors = successors.get(taskId) || [];

      let latestFinish = projectEnd;

      // Se tem sucessores, usar o início mais tardio do menor sucessor
      if (taskSuccessors.length > 0) {
        let minSuccessorStart = new Date(projectEnd);
        taskSuccessors.forEach((succId) => {
          const succ = results.get(succId);
          if (succ && succ.ls < minSuccessorStart) {
            minSuccessorStart = succ.ls;
          }
        });
        if (minSuccessorStart < projectEnd) {
          latestFinish = minSuccessorStart;
        }
      }

      const duration =
        (new Date(task.fim).getTime() - new Date(task.inicio).getTime()) /
        (1000 * 60 * 60 * 24);
      const latestStart = new Date(
        latestFinish.getTime() - duration * 24 * 60 * 60 * 1000
      );

      results.set(taskId, {
        ls: latestStart,
        lf: latestFinish,
      });
    });

    return results;
  };

  // CORREÇÃO: Calcular folgas considerando final do evento
  const calculateCPM = () => {
    setIsCalculating(true);

    try {
      const tasks = getAllTasks();
      if (tasks.length === 0) return;

      const dependencies = calculateDependencies(tasks);
      const forwardResults = forwardPass(tasks, dependencies);
      const backwardResults = backwardPass(tasks, dependencies, forwardResults);

      // Criar nós CPM
      const nodes: CPMNode[] = tasks.map((task) => {
        const taskId = task.id.toString();
        const forward = forwardResults.get(taskId)!;
        const backward = backwardResults.get(taskId)!;

        // CORREÇÃO: Folga Total = Late Start - Early Start
        const totalFloat =
          (backward.ls.getTime() - forward.es.getTime()) /
          (1000 * 60 * 60 * 24);

        // Folga Livre simplificada
        const freeFloat = Math.max(0, totalFloat);

        console.log(`📊 ${task.nome}: Folga = ${totalFloat.toFixed(1)} dias`);

        return {
          task,
          earlyStart: forward.es,
          earlyFinish: forward.ef,
          lateStart: backward.ls,
          lateFinish: backward.lf,
          totalFloat: Math.max(0, totalFloat), // Não permitir folgas negativas na exibição
          freeFloat,
          isCritical: totalFloat <= 0.1, // Margem pequena para compensar arredondamentos
          predecessors: dependencies.get(taskId) || [],
          successors: [],
        };
      });

      // Preencher sucessores
      nodes.forEach((node) => {
        node.predecessors.forEach((predId) => {
          const predNode = nodes.find((n) => n.task.id.toString() === predId);
          if (predNode) {
            predNode.successors.push(node.task.id.toString());
          }
        });
      });

      // CORREÇÃO: Identificar caminhos críticos com slack do projeto
      const criticalTasks = nodes.filter((n) => n.isCritical);
      const paths: CriticalPath[] = [];

      if (criticalTasks.length > 0) {
        // Calcular slack do projeto
        const maxCalculatedEnd = Math.max(
          ...nodes.map((n) => n.earlyFinish.getTime())
        );
        const maxPlannedEnd = Math.max(
          ...tasks.map((t) => new Date(t.fim).getTime())
        );
        const projectSlack =
          (maxPlannedEnd - maxCalculatedEnd) / (1000 * 60 * 60 * 24);

        console.log(`🎯 Slack do projeto: ${projectSlack.toFixed(1)} dias`);

        const mainPath: CriticalPath = {
          tasks: criticalTasks,
          duration: criticalTasks.reduce((sum, node) => {
            const duration =
              (node.earlyFinish.getTime() - node.earlyStart.getTime()) /
              (1000 * 60 * 60 * 24);
            return sum + duration;
          }, 0),
          slack: Math.max(0, projectSlack), // Slack nunca negativo na exibição
          riskLevel:
            projectSlack < -5
              ? 'critical' // Projeto muito atrasado
              : projectSlack < 0
                ? 'high' // Projeto atrasado
                : criticalTasks.length > 10
                  ? 'high' // Muitas tarefas críticas
                  : criticalTasks.length > 5
                    ? 'medium' // Algumas tarefas críticas
                    : 'low', // Poucas tarefas críticas
        };

        paths.push(mainPath);
      }

      setCpmNodes(nodes);
      setCriticalPaths(paths);
    } catch (error) {
      console.error('Erro ao calcular CPM:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    calculateCPM();
  }, [categorias]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const criticalTasks = cpmNodes.filter((n) => n.isCritical);
  const nonCriticalTasks = cpmNodes.filter((n) => !n.isCritical);

  return (
    <div className="space-y-6">
      {isCalculating && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className={`ml-3 ${themeClasses.textSecondary}`}>
            Calculando análise CPM...
          </span>
        </div>
      )}

      {/* Resumo de Estatísticas */}
      <div
        className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${themeClasses.card} rounded-xl p-6`}
      >
        <div className={`p-4 rounded-lg ${themeClasses.bgSecondary}`}>
          <div className="flex items-center space-x-2 mb-2">
            <Route className="w-5 h-5 text-red-500" />
            <span className={`text-sm font-medium ${themeClasses.textPrimary}`}>
              Tarefas Críticas
            </span>
          </div>
          <p className="text-2xl font-bold text-red-500">
            {criticalTasks.length}
          </p>
          <p className={`text-xs ${themeClasses.textSecondary}`}>
            Folga ≤ 0 dias
          </p>
        </div>

        <div className={`p-4 rounded-lg ${themeClasses.bgSecondary}`}>
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className={`text-sm font-medium ${themeClasses.textPrimary}`}>
              Duração Crítica
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-500">
            {criticalPaths[0]?.duration.toFixed(0) || 0} dias
          </p>
          <p className={`text-xs ${themeClasses.textSecondary}`}>
            Caminho mais longo
          </p>
        </div>

        <div className={`p-4 rounded-lg ${themeClasses.bgSecondary}`}>
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className={`text-sm font-medium ${themeClasses.textPrimary}`}>
              Folga Média
            </span>
          </div>
          <p className="text-2xl font-bold text-yellow-500">
            {nonCriticalTasks.length > 0
              ? (
                  nonCriticalTasks.reduce(
                    (sum: number, task: CPMNode) => sum + task.totalFloat,
                    0
                  ) / nonCriticalTasks.length
                ).toFixed(1)
              : 0}{' '}
            dias
          </p>
          <p className={`text-xs ${themeClasses.textSecondary}`}>
            Margem de segurança
          </p>
        </div>

        <div
          className={`p-4 rounded-lg ${criticalPaths[0] ? getRiskColor(criticalPaths[0].riskLevel) : getRiskColor('low')}`}
        >
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">Nível de Risco</span>
          </div>
          <p className="text-2xl font-bold">
            {criticalPaths[0]?.riskLevel.toUpperCase() || 'BAIXO'}
          </p>
          <p className="text-xs opacity-80">Baseado em criticidade</p>
        </div>
      </div>

      {/* Caminho Crítico */}
      {criticalPaths.length > 0 && (
        <div
          className={`${themeClasses.card} rounded-xl shadow-lg overflow-hidden`}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
              Caminho Crítico
            </h3>
            <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>
              Tarefas que determinam a duração mínima do projeto (Folga = 0)
            </p>
          </div>

          <div className="space-y-3">
            {criticalPaths[selectedPath]?.tasks.map((node, index) => (
              <div key={node.task.id} className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  {index < criticalPaths[selectedPath].tasks.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                <div
                  className={`flex-1 p-4 rounded-lg border-2 border-red-200 dark:border-red-800 ${themeClasses.bgSecondary} cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors`}
                  onClick={() => onTarefaClick?.(node.task)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`font-medium ${themeClasses.textPrimary}`}>
                        {node.task.nome}
                      </h4>
                      <p className={`text-sm ${themeClasses.textSecondary}`}>
                        {node.task.categoria} • {node.task.percentualCompleto}%
                        concluída
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-red-500">
                        Folga: {node.totalFloat.toFixed(1)} dias
                      </p>
                      <p className={`text-xs ${themeClasses.textSecondary}`}>
                        {node.earlyStart.toLocaleDateString('pt-BR')} -{' '}
                        {node.earlyFinish.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Todas as Tarefas com Análise CPM */}
      <div
        className={`${themeClasses.card} rounded-xl shadow-lg overflow-hidden`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
            Análise Detalhada de Tarefas
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${themeClasses.bgSecondary}`}>
              <tr>
                <th
                  className={`px-4 py-3 text-left text-sm font-medium ${themeClasses.textSecondary}`}
                >
                  Tarefa
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-medium ${themeClasses.textSecondary}`}
                >
                  Tipo
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-medium ${themeClasses.textSecondary}`}
                >
                  Folga Total
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-medium ${themeClasses.textSecondary}`}
                >
                  Início Mais Cedo
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-medium ${themeClasses.textSecondary}`}
                >
                  Início Mais Tarde
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-medium ${themeClasses.textSecondary}`}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {[...criticalTasks, ...nonCriticalTasks.slice(0, 20)].map(
                (node) => (
                  <tr
                    key={node.task.id}
                    className={`border-b border-gray-100 dark:border-gray-800 hover:${themeClasses.bgSecondary} cursor-pointer transition-colors`}
                    onClick={() => onTarefaClick?.(node.task)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p
                          className={`font-medium ${themeClasses.textPrimary}`}
                        >
                          {node.task.nome}
                        </p>
                        <p className={`text-sm ${themeClasses.textSecondary}`}>
                          {node.task.categoria}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {node.isCritical ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                          Crítica
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${node.isCritical ? 'text-red-500' : 'text-green-600'}`}
                      >
                        {node.totalFloat.toFixed(1)} dias
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${themeClasses.textSecondary}`}>
                        {node.earlyStart.toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${themeClasses.textSecondary}`}>
                        {node.lateStart.toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            node.task.percentualCompleto === 100
                              ? 'bg-green-500'
                              : new Date(node.task.fim) < new Date()
                                ? 'bg-red-500'
                                : 'bg-yellow-500'
                          }`}
                        ></div>
                        <span
                          className={`text-sm ${themeClasses.textSecondary}`}
                        >
                          {node.task.percentualCompleto}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CPMAnalysis;
