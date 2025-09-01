import Papa from 'papaparse';
import { Phase, PhaseType } from '../types/phases';

// Interface para compatibilidade com o cronograma operacional
export interface ProcessedCronogramaActivity {
  id: string;
  name: string;
  duration: string;
  start: string;
  finish: string;
  responsible: string;
  status?: string;
}

export interface ProcessedCronograma {
  phases: Phase[];
  metadata: {
    titulo: string;
    dataInicio: string;
    dataFim: string;
    duracaoTotal: string;
  };
}

// Interface para o formato PFUS3
export interface CronogramaPFUS3 {
  Id: string;
  Id_exclusiva: string;
  Nível_da_estrutura_de_tópicos: string;
  EDT: string;
  Nome: string;
  Porcentagem_Prev_Real: string;
  Porcentagem_Prev_LB: string;
  Duração: string;
  Início: string;
  Término: string;
  Início_da_Linha_de_Base: string;
  Término_da_linha_de_base: string;
  Área: string;
  Responsável_da_Tarefa: string;
  Dashboard: string;
  Desvio_LB: string;
}

export const processarCronogramaOperacional = (
  csvText: string
): Promise<ProcessedCronograma> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';', // CSV usa ponto e vírgula
      encoding: 'ISO-8859-1', // Encoding para caracteres acentuados
      transformHeader: (header) => {
        // Manter headers em português mas limpar caracteres especiais invisíveis
        return header.trim().replace(/[\u00A0\uFEFF]/g, '');
      },
      complete: async (results) => {
        try {
          const data = results.data as CronogramaPFUS3[];

          // Filtrar linhas válidas
          const validRows = data.filter(
            (row) => row.Id && row.Nome && row.EDT && row.Nome.trim() !== ''
          );

          // Extrair cronograma principal
          const cronogramaPrincipal = validRows.find(
            (row) =>
              row.Nome.toLowerCase().includes('cronograma') ||
              row.Nome.toLowerCase().includes('pfus3') ||
              row.Nome.toLowerCase().includes('parada')
          );

          const metadata = {
            titulo: cronogramaPrincipal?.Nome || 'Cronograma Operacional PFUS3',
            dataInicio: cronogramaPrincipal?.['Início'] || '',
            dataFim: cronogramaPrincipal?.['Término'] || '',
            duracaoTotal: cronogramaPrincipal?.['Duração'] || '',
          };

          // Separar por fases baseado no EDT
          const paradaRows = validRows.filter(
            (row) =>
              row.EDT?.startsWith('1.7') ||
              row.Nome.toLowerCase().includes('parada') ||
              row.Nome.toLowerCase().includes('procedimento')
          );

          const manutencaoRows = validRows.filter(
            (row) =>
              row.EDT?.startsWith('1.8') ||
              row.Nome.toLowerCase().includes('manutenção') ||
              row.Nome.toLowerCase().includes('manutencao')
          );

          const partidaRows = validRows.filter(
            (row) =>
              row.EDT?.startsWith('1.9') ||
              row.Nome.toLowerCase().includes('partida') ||
              row.Nome.toLowerCase().includes('teste')
          );

          const phases: Phase[] = [
            createPhase(
              'parada',
              'Parada',
              'Procedimentos de parada da usina',
              '⏹️',
              'text-red-600',
              'bg-red-50',
              'border-red-200',
              paradaRows
            ),
            createPhase(
              'manutencao',
              'Manutenção',
              'Atividades de manutenção',
              '🔨',
              'text-orange-600',
              'bg-orange-50',
              'border-orange-200',
              manutencaoRows
            ),
            createPhase(
              'partida',
              'Partida',
              'Procedimentos de partida da usina',
              '▶️',
              'text-green-600',
              'bg-green-50',
              'border-green-200',
              partidaRows
            ),
          ];

          resolve({
            phases,
            metadata,
          });
        } catch (error) {
          console.error('Erro ao processar formato PFUS3:', error);
          reject(error);
        }
      },
      error: (error: any) => {
        console.error('Erro no Papa Parse (PFUS3):', error);
        reject(error);
      },
    });
  });
};

function createPhase(
  id: PhaseType,
  name: string,
  description: string,
  icon: string,
  color: string,
  bgColor: string,
  borderColor: string,
  rows: CronogramaPFUS3[]
): Phase {
  const completedCount = rows.filter(
    (row) =>
      row.Porcentagem_Prev_Real === '100' ||
      row.Nome.toLowerCase().includes('concluída') ||
      row.Nome.toLowerCase().includes('finalizada')
  ).length;

  const progress =
    rows.length > 0 ? Math.round((completedCount / rows.length) * 100) : 0;

  const delayedCount = rows.filter(
    (row) =>
      parseFloat(row.Porcentagem_Prev_Real?.replace(',', '.') || '0') < 100 &&
      new Date(row['Término']) < new Date()
  ).length;

  const criticalCount = rows.filter(
    (row) =>
      row.Nome.toLowerCase().includes('crítica') ||
      row.Nome.toLowerCase().includes('bloqueio')
  ).length;

  const startDate = getEarliestDate(rows);
  const endDate = getLatestDate(rows);
  const estimatedDuration = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  return {
    id,
    name,
    description,
    icon,
    color,
    bgColor,
    borderColor,
    progress,
    activities: rows.length,
    completedActivities: completedCount,
    delayedActivities: delayedCount,
    criticalActivities: criticalCount,
    onTimeActivities: rows.length - delayedCount - criticalCount,
    advancedActivities: 0,
    startDate,
    endDate,
    estimatedDuration,
    estimatedEnd: endDate.toLocaleDateString('pt-BR'),
    daysRemaining,
    totalTasks: rows.length,
    inProgressTasks: rows.length - completedCount,
    pendingTasks: rows.length - completedCount,
    status: getPhaseStatus(rows),
    categories: [],
  };
}

function getPhaseStatus(
  rows: CronogramaPFUS3[]
): 'not-started' | 'in-progress' | 'completed' {
  const completed = rows.filter(
    (row) =>
      row.Porcentagem_Prev_Real === '100' ||
      row.Nome.toLowerCase().includes('concluída') ||
      row.Nome.toLowerCase().includes('finalizada')
  ).length;

  if (completed === 0) return 'not-started';
  if (completed === rows.length) return 'completed';
  return 'in-progress';
}

function getEarliestDate(rows: CronogramaPFUS3[]): Date {
  const dates = rows
    .map((row) => new Date(row['Início']))
    .filter((date) => !isNaN(date.getTime()));
  return dates.length > 0
    ? new Date(Math.min(...dates.map((d) => d.getTime())))
    : new Date();
}

function getLatestDate(rows: CronogramaPFUS3[]): Date {
  const dates = rows
    .map((row) => new Date(row['Término']))
    .filter((date) => !isNaN(date.getTime()));
  return dates.length > 0
    ? new Date(Math.max(...dates.map((d) => d.getTime())))
    : new Date();
}
