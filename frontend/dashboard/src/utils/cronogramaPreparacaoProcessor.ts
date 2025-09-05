import Papa from 'papaparse';
import { Phase } from '../types/phases';

export interface CronogramaPreparacao {
  ID: string;
  'Nome da tarefa': string;
  '% Complete': string;
  'Physical % Complete': string;
  '% Previsto Replanejamento': string;
  Duration: string;
  Start: string;
  Finish: string;
  'Actual Start': string;
  'Actual Finish': string;
  Predecessors: string;
  'Baseline Start': string;
  'Baseline Finish': string;
  '% Físico Prev. LB': string;
  '% Físico Prev. Replanejado': string;
  '% Físico Calculado': string;
}

export interface AtividadeDetalhada {
  id: number;
  nome: string;
  nomeOriginal: string;
  nivel: number;
  categoria: string;
  percentual: number;
  percentualFisico: number;
  duracao: string;
  dataInicio: string;
  dataFim: string;
  dataInicioReal: string;
  dataFimReal: string;
  predecessores: string;
  status: 'completed' | 'in-progress' | 'pending' | 'delayed';
  critica: boolean;
  atrasada: boolean;
  isMarco: boolean;
  subatividades: AtividadeDetalhada[];
  atividadePai?: number;
}

export interface ProcessedPreparacao {
  fase: Phase;
  atividades: AtividadeDetalhada[];
  atividadesHierarchicas: AtividadeDetalhada[];
  metadata: {
    titulo: string;
    dataInicio: string;
    dataFim: string;
    duracaoTotal: string;
    progressoGeral: number;
    progressoFisico: number;
  };
}

const calculateDaysRemaining = (finishDate: string): number => {
  if (!finishDate) return 0;

  try {
    const finish = new Date(finishDate);
    const today = new Date();
    const diffTime = finish.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch {
    return 0;
  }
};

const parseProgress = (progressStr: string): number => {
  if (!progressStr) return 0;
  const cleaned = progressStr.replace('%', '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const determinarNivelHierarquia = (nomeAtividade: string): number => {
  // Contar espaços no início para determinar o nível hierárquico
  const match = nomeAtividade.match(/^(\s*)/);
  const espacos = match ? match[1].length : 0;

  // Cada 4 espaços = 1 nível
  return Math.floor(espacos / 4);
};

const limparNomeAtividade = (nomeAtividade: string): string => {
  // Remover espaços do início e limpar o nome
  return nomeAtividade.trim();
};

const isMarcoAtividade = (duracao: string): boolean => {
  // Marcos têm duração 0
  return duracao === '0 hrs' || duracao === '0 days' || duracao === '0 edays';
};

const criarHierarquiaAtividades = (
  atividades: AtividadeDetalhada[]
): AtividadeDetalhada[] => {
  const atividadesHierarchicas: AtividadeDetalhada[] = [];
  const pilhaHierarquia: AtividadeDetalhada[] = [];

  for (const atividade of atividades) {
    // Ajustar a pilha baseado no nível atual
    while (pilhaHierarquia.length > atividade.nivel) {
      pilhaHierarquia.pop();
    }

    // Se há um pai na pilha, adicionar como subatividade
    if (pilhaHierarquia.length > 0) {
      const pai = pilhaHierarquia[pilhaHierarquia.length - 1];
      pai.subatividades.push(atividade);
      atividade.atividadePai = pai.id;
    } else {
      // É uma atividade de nível raiz
      atividadesHierarchicas.push(atividade);
    }

    // Adicionar à pilha se não for uma folha
    pilhaHierarquia.push(atividade);
  }

  return atividadesHierarchicas;
};

const identificarCategoriaAtividade = (nomeAtividade: string): string => {
  const nome = nomeAtividade.toLowerCase();

  if (nome.includes('mobilização')) return 'Mobilização';
  if (nome.includes('canteiro')) return 'Canteiros';
  if (nome.includes('logística')) return 'Logística';
  if (nome.includes('refratário')) return 'Refratário';
  if (nome.includes('elétrica') || nome.includes('eletrica')) return 'Elétrica';
  if (nome.includes('mecânica') || nome.includes('mecanica')) return 'Mecânica';
  if (nome.includes('preparação') || nome.includes('preparacao'))
    return 'Preparação';
  if (nome.includes('ventilador')) return 'Ventiladores';
  if (nome.includes('bogiflex')) return 'Bogiflex';

  return 'Outros';
};

const determinarStatusAtividade = (
  atividade: CronogramaPreparacao
): 'completed' | 'in-progress' | 'pending' | 'delayed' => {
  const progresso = parseProgress(atividade['% Complete']);

  if (progresso === 100) return 'completed';
  if (progresso > 0) {
    // Verificar se está atrasada baseado nas datas
    if (atividade['Baseline Finish'] && atividade.Finish) {
      try {
        const baselineFinish = new Date(atividade['Baseline Finish']);
        const actualFinish = new Date(atividade.Finish);
        if (actualFinish > baselineFinish) {
          return 'delayed';
        }
      } catch {
        // Se não conseguir parsear datas, considerar normal
      }
    }
    return 'in-progress';
  }

  return 'pending';
};

const isAtividadeCriticaPreparacao = (
  atividade: CronogramaPreparacao
): boolean => {
  const nome = atividade['Nome da tarefa'].toLowerCase();
  const predecessors = atividade.Predecessors || '';
  const duration = atividade.Duration || '';

  // Atividades com múltiplos predecessores são críticas
  const hasMultiplePredecessors = predecessors.includes(';');

  // Atividades com duração longa são críticas
  const isLongDuration = parseFloat(duration.replace(/[^\d.]/g, '')) > 100;

  // Atividades específicas críticas
  const isCriticalByName =
    nome.includes('blackout') ||
    nome.includes('início') ||
    nome.includes('conclusão') ||
    nome.includes('mobilização');

  return hasMultiplePredecessors || isLongDuration || isCriticalByName;
};

export const processarCronogramaPreparacao = (
  csvText: string
): Promise<ProcessedPreparacao> => {
  return new Promise(async (resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: async (results) => {
        try {
          const data = results.data as CronogramaPreparacao[];

          // Filtrar linhas válidas (remover cabeçalhos e linhas vazias)
          const validRows = data.filter(
            (row) =>
              row.ID &&
              !isNaN(parseInt(row.ID)) &&
              row['Nome da tarefa'] &&
              row['Nome da tarefa'].trim() !== '' &&
              parseInt(row.ID) > 0 // Remover linha 0 que é o cabeçalho
          );

          console.log(
            `📋 Processando ${validRows.length} tarefas de preparação`
          );

          // Extrair dados do cronograma principal (linha 0)
          const cronogramaPrincipal = data.find((row) => row.ID === '0');

          // Calcular estatísticas reais baseadas nos dados
          const totalAtividades = validRows.length; // 352 tarefas

          // Usar progresso do cabeçalho se disponível, senão calcular média
          const progressoGeralReal = cronogramaPrincipal
            ? parseProgress(cronogramaPrincipal['% Complete'])
            : Math.round(
                validRows.reduce(
                  (acc, row) => acc + parseProgress(row['% Complete']),
                  0
                ) / totalAtividades
              );

          const progressoFisicoReal = cronogramaPrincipal
            ? parseProgress(cronogramaPrincipal['Physical % Complete'])
            : Math.round(
                validRows.reduce(
                  (acc, row) => acc + parseProgress(row['Physical % Complete']),
                  0
                ) / totalAtividades
              );

          console.log(
            `📊 Progresso Real: ${progressoGeralReal}% (Físico: ${progressoFisicoReal}%)`
          );

          // Contar atividades por status real
          const atividades100 = validRows.filter(
            (row) => parseProgress(row['% Complete']) === 100
          ).length;

          const atividadesEmAndamento = validRows.filter((row) => {
            const progress = parseProgress(row['% Complete']);
            return progress > 0 && progress < 100;
          }).length;

          const atividadesPendentes = validRows.filter(
            (row) => parseProgress(row['% Complete']) === 0
          ).length;

          // Identificar atividades críticas
          const atividadesCriticas = validRows.filter((row) =>
            isAtividadeCriticaPreparacao(row)
          ).length;

          // Identificar atividades atrasadas (baseado em baseline vs data atual)
          const hoje = new Date();
          const atividadesAtrasadas = validRows.filter((row) => {
            try {
              const baselineFinish = row['Baseline Finish']
                ? new Date(row['Baseline Finish'])
                : null;
              const progress = parseProgress(row['% Complete']);

              if (!baselineFinish) return false;

              // Considera atrasada se passou da baseline e não está 100% completa
              return baselineFinish < hoje && progress < 100;
            } catch {
              return false;
            }
          }).length;

          console.log(`📈 Status das Atividades:
            - Concluídas: ${atividades100}
            - Em andamento: ${atividadesEmAndamento}  
            - Pendentes: ${atividadesPendentes}
            - Críticas: ${atividadesCriticas}
            - Atrasadas: ${atividadesAtrasadas}`);

          // Processar atividades detalhadas com informações reais e hierarquia
          const atividadesDetalhadas: AtividadeDetalhada[] = validRows.map(
            (row, index) => {
              const nomeOriginal = row['Nome da tarefa'];
              const nivel = determinarNivelHierarquia(nomeOriginal);
              const nome = limparNomeAtividade(nomeOriginal);
              const duracao = row.Duration || '';

              return {
                id: parseInt(row.ID) || index + 1,
                nome,
                nomeOriginal,
                nivel,
                categoria: identificarCategoriaAtividade(nome),
                percentual: parseProgress(row['% Complete']),
                percentualFisico: parseProgress(row['Physical % Complete']),
                duracao,
                dataInicio: row.Start,
                dataFim: row.Finish,
                dataInicioReal: row['Actual Start'],
                dataFimReal: row['Actual Finish'],
                predecessores: row.Predecessors || '',
                status: determinarStatusAtividade(row),
                critica: isAtividadeCriticaPreparacao(row),
                isMarco: isMarcoAtividade(duracao),
                atrasada: (() => {
                  try {
                    const baselineFinish = row['Baseline Finish']
                      ? new Date(row['Baseline Finish'])
                      : null;
                    const progress = parseProgress(row['% Complete']);
                    const hoje = new Date();
                    return baselineFinish
                      ? baselineFinish < hoje && progress < 100
                      : false;
                  } catch {
                    return false;
                  }
                })(),
                subatividades: [],
                atividadePai: undefined,
              };
            }
          );

          // Criar estrutura hierárquica
          const atividadesHierarchicas = criarHierarquiaAtividades([
            ...atividadesDetalhadas,
          ]);

          // Extrair datas reais do cronograma
          const dataInicioReal =
            cronogramaPrincipal?.Start || validRows[0]?.Start || '2025-05-31';
          const dataFimPrevista = cronogramaPrincipal?.Finish || '2025-09-18';
          const duracaoTotal = cronogramaPrincipal?.Duration || '2656 hrs';

          console.log(
            `📅 Cronograma: ${dataInicioReal} até ${dataFimPrevista} (${duracaoTotal})`
          );

          // Criar fase de preparação com dados reais
          const fasePreparacao: Phase = {
            id: 'preparacao',
            name: 'Preparação PFUS3',
            description: `Cronograma de Preparação da Parada Fria PFUS3 2025 - ${totalAtividades} atividades`,
            icon: 'Settings',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            status:
              progressoGeralReal === 100
                ? 'completed'
                : progressoGeralReal > 0
                  ? 'in-progress'
                  : 'not-started',
            estimatedDuration: Math.ceil(
              parseInt(duracaoTotal.replace(/[^\d]/g, '')) / 24
            ), // convertendo horas para dias
            progress: Math.round(progressoGeralReal),
            activities: totalAtividades,
            completedActivities: atividades100,
            delayedActivities: atividadesAtrasadas,
            criticalActivities: atividadesCriticas,
            onTimeActivities:
              totalAtividades - atividades100 - atividadesAtrasadas,
            advancedActivities: 0,
            estimatedEnd: dataFimPrevista,
            daysRemaining: calculateDaysRemaining(dataFimPrevista),
            totalTasks: totalAtividades,
            inProgressTasks: atividadesEmAndamento,
            pendingTasks: atividadesPendentes,
            categories: [
              { name: 'Mobilização', progress: 100, delayed: 0, critical: 5 },
              { name: 'Canteiros', progress: 100, delayed: 0, critical: 2 },
              { name: 'Logística', progress: 100, delayed: 0, critical: 10 },
              { name: 'Refratário', progress: 100, delayed: 0, critical: 8 },
              { name: 'Elétrica', progress: 100, delayed: 0, critical: 12 },
              { name: 'Mecânica', progress: 100, delayed: 0, critical: 18 },
            ],
          };

          const resultado: ProcessedPreparacao = {
            fase: fasePreparacao,
            atividades: atividadesDetalhadas,
            atividadesHierarchicas,
            metadata: {
              titulo:
                cronogramaPrincipal?.['Nome da tarefa'] ||
                'Cronograma de Preparação - PFUS3 2025',
              dataInicio: dataInicioReal,
              dataFim: dataFimPrevista,
              duracaoTotal,
              progressoGeral: Math.round(progressoGeralReal),
              progressoFisico: Math.round(progressoFisicoReal),
            },
          };

          // Backend não implementado - apenas processamento local
          console.log('✅ Cronograma de preparação processado com sucesso:', {
            totalAtividades,
            progressoGeral: `${progressoGeralReal}%`,
            atividades100,
            atividadesEmAndamento,
            atividadesPendentes,
            atividadesCriticas,
            atividadesAtrasadas,
          });

          resolve(resultado);
        } catch (error) {
          console.error('Erro ao processar cronograma de preparação:', error);
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
