import Papa from 'papaparse';
import { Phase, PhaseType } from '../types/phases';

export interface CronogramaOperacional {
  ID: string;
  'Nome da tarefa': string;
  Duration: string;
  Start: string;
  Finish: string;
  'Task Calendar': string;
  'Responsável da Tarefa': string;
}

export interface ProcessedCronograma {
  fases: Phase[];
  marcos: any[];
  atividades: any[];
  metadata: {
    titulo: string;
    dataInicio: string;
    dataFim: string;
    duracaoTotal: string;
  };
}

export const processarCronogramaOperacional = (
  csvText: string
): Promise<ProcessedCronograma> => {
  return new Promise(async (resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: async (results) => {
        try {
          const data = results.data as CronogramaOperacional[];

          // Filtrar linhas válidas (com ID numérico)
          const validRows = data.filter(
            (row) =>
              row.ID &&
              !isNaN(parseInt(row.ID)) &&
              row['Nome da tarefa'] &&
              row['Nome da tarefa'].trim() !== ''
          );

          // Extrair informações principais
          const cronogramaPrincipal = validRows.find((row) =>
            row['Nome da tarefa'].includes('Cronograma Operacional')
          );

          const paradaFria = validRows.find((row) =>
            row['Nome da tarefa'].includes('Parada Fria da Usina')
          );

          // Identificar marcos (duration = 0 hrs)
          const marcos = validRows.filter(
            (row) =>
              row.Duration === '0 hrs' ||
              row['Nome da tarefa'].includes('Início') ||
              row['Nome da tarefa'].includes('Blackout') ||
              row['Nome da tarefa'].includes('Corte') ||
              row['Nome da tarefa'].includes('Concluída')
          );

          // Identificar fases principais baseado na estrutura real do arquivo
          const corteProdução = validRows.find((row) =>
            row['Nome da tarefa'].includes('Corte da Produção')
          );

          const blackoutSep = validRows.filter((row) =>
            row['Nome da tarefa'].includes('Blackout - SEP')
          );

          const blackoutSem = validRows.find((row) =>
            row['Nome da tarefa'].includes('Blackout - SEM')
          );

          const procedimentosParada = validRows.find((row) =>
            row['Nome da tarefa'].includes('Procedimentos de Parada')
          );

          const manutencao = validRows.find(
            (row) =>
              row['Nome da tarefa'] === 'Manutenção' ||
              (row['Nome da tarefa'].includes('Manutenção') &&
                !row['Nome da tarefa'].includes('Início'))
          );

          const procedimentosPartida = validRows.find((row) =>
            row['Nome da tarefa'].includes('Procedimentos de Partida')
          );

          // Calcular dados das fases baseado na estrutura real
          // Remover fase de preparação daqui para evitar duplicação
          // A fase de preparação vem do cronograma específico de preparação
          const fases: Phase[] = [
            {
              id: 'parada',
              name: 'Parada',
              description:
                'Fase de parada propriamente dita da usina com blackouts e procedimentos',
              icon: 'Power',
              color: 'text-red-600',
              bgColor: 'bg-red-50',
              borderColor: 'border-red-200',
              status: 'not-started',
              estimatedDuration: 15,
              progress: 0,
              activities: 4, // Baseado no arquivo: Corte + 2x Blackout SEP + Blackout SEM + Procedimentos
              completedActivities: 0,
              delayedActivities: 0,
              criticalActivities: 3, // Blackouts são críticos
              onTimeActivities: 1,
              advancedActivities: 0,
              estimatedEnd: procedimentosParada?.Finish || '2025-08-26',
              daysRemaining: calculateDaysRemaining(
                procedimentosParada?.Finish || '2025-08-26'
              ),
              totalTasks: 4,
              inProgressTasks: 0,
              pendingTasks: 4,
              categories: [
                {
                  name: 'Corte da Produção',
                  progress: 0,
                  delayed: 0,
                  critical: 1,
                },
                { name: 'Blackout SEP', progress: 0, delayed: 0, critical: 1 },
                { name: 'Blackout SEM', progress: 0, delayed: 0, critical: 1 },
                { name: 'Procedimentos', progress: 0, delayed: 0, critical: 0 },
              ],
            },
            {
              id: 'manutencao',
              name: 'Manutenção',
              description:
                'Fase de manutenção da usina com todas as atividades de reparo e substituição',
              icon: 'Wrench',
              color: 'text-orange-600',
              bgColor: 'bg-orange-50',
              borderColor: 'border-orange-200',
              status: 'not-started',
              estimatedDuration: 53, // 1272 hrs = ~53 dias
              progress: 0,
              activities: 1, // Uma atividade principal de manutenção
              completedActivities: 0,
              delayedActivities: 0,
              criticalActivities: 1, // Manutenção é crítica
              onTimeActivities: 0,
              advancedActivities: 0,
              estimatedEnd: manutencao?.Finish || '2025-10-07',
              daysRemaining: calculateDaysRemaining(
                manutencao?.Finish || '2025-10-07'
              ),
              totalTasks: 1,
              inProgressTasks: 0,
              pendingTasks: 1,
              categories: [
                {
                  name: 'Manutenção Preventiva',
                  progress: 0,
                  delayed: 0,
                  critical: 1,
                },
                {
                  name: 'Manutenção Corretiva',
                  progress: 0,
                  delayed: 0,
                  critical: 0,
                },
                { name: 'Inspeções', progress: 0, delayed: 0, critical: 0 },
                { name: 'Testes', progress: 0, delayed: 0, critical: 0 },
              ],
            },
            {
              id: 'partida',
              name: 'Partida',
              description: 'Fase de partida e sincronização da usina',
              icon: 'Play',
              color: 'text-green-600',
              bgColor: 'bg-green-50',
              borderColor: 'border-green-200',
              status: 'not-started',
              estimatedDuration: 36, // 856 hrs = ~36 dias
              progress: 0,
              activities: 1, // Uma atividade principal de procedimentos de partida
              completedActivities: 0,
              delayedActivities: 0,
              criticalActivities: 1, // Partida é crítica
              onTimeActivities: 0,
              advancedActivities: 0,
              estimatedEnd: procedimentosPartida?.Finish || '2025-10-14',
              daysRemaining: calculateDaysRemaining(
                procedimentosPartida?.Finish || '2025-10-14'
              ),
              totalTasks: 1,
              inProgressTasks: 0,
              pendingTasks: 1,
              categories: [
                {
                  name: 'Procedimentos de Partida',
                  progress: 0,
                  delayed: 0,
                  critical: 1,
                },
                {
                  name: 'Testes de Sistema',
                  progress: 0,
                  delayed: 0,
                  critical: 0,
                },
                { name: 'Sincronização', progress: 0, delayed: 0, critical: 0 },
              ],
            },
          ];

          const metadata = {
            titulo:
              cronogramaPrincipal?.['Nome da tarefa'] ||
              'Cronograma Operacional PFUS3 2025',
            dataInicio: cronogramaPrincipal?.Start || '',
            dataFim: cronogramaPrincipal?.Finish || '',
            duracaoTotal: cronogramaPrincipal?.Duration || '',
          };

          const resultado: ProcessedCronograma = {
            fases,
            marcos,
            atividades: validRows,
            metadata,
          };

          // Backend não implementado - apenas processamento local
          /* Desabilitado - backend não disponível
          try {
            const response = await fetch('/api/cronograma/operacional', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fases: resultado.fases,
                atividades: resultado.atividades.map((row) => ({
                  id: row.ID,
                  nome: row['Nome da tarefa'],
                  fase: identificarFaseAtividade(row['Nome da tarefa']),
                  duracao: row.Duration,
                  dataInicio: row.Start,
                  dataFim: row.Finish,
                  progresso: 0,
                  status: 'not-started' as const,
                  responsavel: row['Responsável da Tarefa'] || '',
                  isCritical: isAtividadeCritica(row),
                  isMarco: row.Duration === '0 hrs',
                })),
                metadata: resultado.metadata,
              }),
            });

            if (!response.ok) {
              console.warn('Erro ao salvar no backend:', await response.text());
            }
          } catch (error) {
            console.warn('Erro ao conectar com backend:', error);
          }
          */

          resolve(resultado);
        } catch (error) {
          console.error('Erro ao processar cronograma:', error);
          reject(error);
        }
      },
      error: (error: any) => {
        console.error('Erro no parsing CSV:', error);
        reject(error);
      },
    });
  });
};

const calculateDaysRemaining = (dateString: string): number => {
  if (!dateString) return 0;

  try {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch {
    return 0;
  }
};

const identificarFaseAtividade = (nomeAtividade: string): string => {
  const nome = nomeAtividade.toLowerCase();

  if (nome.includes('preparação') || nome.includes('mobilização')) {
    return 'preparacao';
  } else if (
    nome.includes('parada') ||
    nome.includes('corte') ||
    nome.includes('procedimentos de parada')
  ) {
    return 'parada';
  } else if (nome.includes('manutenção') || nome.includes('inspeção')) {
    return 'manutencao';
  } else if (nome.includes('partida') || nome.includes('sincronização')) {
    return 'partida';
  }

  return 'parada'; // default
};

const isAtividadeCritica = (atividade: CronogramaOperacional): boolean => {
  const nome = atividade['Nome da tarefa'].toLowerCase();

  return (
    nome.includes('blackout') ||
    nome.includes('corte') ||
    nome.includes('sincronização') ||
    nome.includes('partida') ||
    atividade.Duration === '0 hrs'
  );
};

export const extrairMarcosPrincipais = (cronograma: ProcessedCronograma) => {
  return {
    corteProducao: cronograma.marcos.find((m) =>
      m['Nome da tarefa'].includes('Corte da Produção')
    ),
    blackoutSEP: cronograma.marcos.filter((m) =>
      m['Nome da tarefa'].includes('Blackout - SEP')
    ),
    blackoutSEM: cronograma.marcos.find((m) =>
      m['Nome da tarefa'].includes('Blackout - SEM')
    ),
    inicioManutencoes: cronograma.marcos.find((m) =>
      m['Nome da tarefa'].includes('Início das Manutenções')
    ),
    conclusao: cronograma.marcos.find((m) =>
      m['Nome da tarefa'].includes('Concluída')
    ),
  };
};

export const calcularProgressoFases = (cronograma: ProcessedCronograma) => {
  const hoje = new Date();

  return cronograma.fases.map((fase) => {
    const dataInicio = new Date(cronograma.metadata.dataInicio);
    const dataFim = new Date(fase.estimatedEnd);

    if (hoje < dataInicio) {
      // Fase ainda não iniciou
      return { ...fase, progress: 0 };
    } else if (hoje > dataFim) {
      // Fase já deveria ter terminado
      return { ...fase, progress: 100 };
    } else {
      // Fase em andamento - calcular progresso baseado no tempo
      const totalDuration = dataFim.getTime() - dataInicio.getTime();
      const elapsed = hoje.getTime() - dataInicio.getTime();
      const progressoPorTempo = Math.min(
        100,
        Math.max(0, (elapsed / totalDuration) * 100)
      );

      return { ...fase, progress: Math.round(progressoPorTempo) };
    }
  });
};
