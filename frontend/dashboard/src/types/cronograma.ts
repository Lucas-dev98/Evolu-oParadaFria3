export interface TarefaCronograma {
  id: number;
  nome: string;
  percentualCompleto: number;
  percentualFisico: number;
  percentualReplanejamento: number;
  duracao: string;
  inicio: string;
  fim: string;
  inicioReal?: string;
  fimReal?: string;
  predecessores?: string;
  inicioBaseline: string;
  fimBaseline: string;
  percentualFisicoPrev: number;
  percentualFisicoReplan: number;
  percentualFisicoCalc: number;
  nivel: number; // Baseado na indentação da tarefa
  categoria: string;
}

export interface StatusPrazo {
  emDia: number;
  atrasadas: number;
  adiantadas: number;
  criticas: number;
  concluidas: number;
  emAndamento: number;
  pendentes: number;
}

export interface CategoriaCronograma {
  nome: string;
  cor: string;
  icone: string;
  progresso: number;
  tarefas: TarefaCronograma[];
  statusPrazo?: StatusPrazo;
}

export interface StatusGeralPrazo {
  totalAtividades: number;
  atividadesEmDia: number;
  atividadesAtrasadas: number;
  atividadesAdiantadas: number;
  atividadesCriticas: number;
  progressoMedio: number;
}

export interface ResumoCronograma {
  progressoGeral: number;
  totalTarefas: number;
  tarefasConcluidas: number;
  tarefasEmAndamento: number;
  tarefasPendentes: number;
  diasRestantes: number;
  dataPrevistaConclusao: string;
  statusGeral?: StatusGeralPrazo;
}
