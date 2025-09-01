// Types específicos para o processador PFUS3
export interface PFUS3PhaseData {
  id: string;
  idExclusiva: string;
  nivel: number;
  edt: string;
  nome: string;
  progressoReal: number;
  progressoBaseline: number;
  duracao: string;
  inicio: string;
  termino: string;
  inicioBaseline: string;
  terminoBaseline: string;
  area: string;
  responsavel: string;
  dashboard: string;
  desvioBaseline: number;
}

export interface PFUS3ProcessedData {
  geral: {
    progressoGeral: number;
    inicioProjetado: string;
    terminoProjetado: string;
    duracaoTotal: string;
  };
  fases: {
    preparacao: PFUS3PhaseData[];
    corteProdução: PFUS3PhaseData[];
    blackouts: PFUS3PhaseData[];
    procedimentosParada: PFUS3PhaseData[];
    manutencao: PFUS3PhaseData[];
    procedimentosPartida: PFUS3PhaseData[];
  };
  areas: {
    [key: string]: {
      nome: string;
      atividades: PFUS3PhaseData[];
      progressoMedio: number;
      responsaveis: string[];
    };
  };
  resumoKPIs: {
    totalAtividades: number;
    atividadesConcluidas: number;
    atividadesEmAndamento: number;
    atividadesPendentes: number;
    progressoGeralReal: number;
    progressoGeralBaseline: number;
    desvioMedio: number;
    areasComProblemas: string[];
  };
}

export interface PFUS3FileMetadata {
  name: string;
  size: number;
  type: 'preparacao' | 'report';
  lines: number;
  separator: ',' | ';';
}
