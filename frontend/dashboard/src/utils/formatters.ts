/**
 * Formata a duração de uma tarefa para um formato mais legível em português
 * @param duracao - String com a duração original (ex: "40 edays", "120 hrs", "5 days")
 * @returns String formatada (ex: "40 dias", "120 horas", "5 dias")
 */
export const formatDuracao = (duracao: string): string => {
  // Remove espaços extras e converte para formato mais legível
  const duracaoLimpa = duracao.trim();

  // Se contém "edays", converte para "dias"
  if (duracaoLimpa.includes('edays')) {
    const numero = duracaoLimpa.replace(/[^0-9.,]/g, '');
    const num = parseFloat(numero);
    return `${numero} dia${num !== 1 ? 's' : ''}`;
  }

  // Se contém "days", converte para "dias"
  if (duracaoLimpa.includes('days')) {
    const numero = duracaoLimpa.replace(/[^0-9.,]/g, '');
    const num = parseFloat(numero);
    return `${numero} dia${num !== 1 ? 's' : ''}`;
  }

  // Se contém "hrs", converte para "horas"
  if (duracaoLimpa.includes('hrs')) {
    const numero = duracaoLimpa.replace(/[^0-9.,]/g, '');
    const num = parseFloat(numero);
    return `${numero} hora${num !== 1 ? 's' : ''}`;
  }

  // Se contém "day" no singular
  if (duracaoLimpa.includes('day') && !duracaoLimpa.includes('days')) {
    const numero = duracaoLimpa.replace(/[^0-9.,]/g, '');
    return `${numero} dia`;
  }

  // Se contém "hr" no singular
  if (duracaoLimpa.includes('hr') && !duracaoLimpa.includes('hrs')) {
    const numero = duracaoLimpa.replace(/[^0-9.,]/g, '');
    return `${numero} hora`;
  }

  // Se for apenas "0 hrs" retorna formato especial
  if (duracaoLimpa === '0 hrs') {
    return 'Marco (0h)';
  }

  // Retorna original se não conseguir formatar
  return duracaoLimpa;
};

/**
 * Formata data para o padrão brasileiro
 * @param dateString - String com a data no formato ISO ou americano
 * @returns Data formatada em pt-BR (DD/MM/YYYY)
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Formata data e hora para o padrão brasileiro
 * @param dateString - String com a data no formato ISO
 * @returns Data e hora formatada em pt-BR
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calcula diferença em dias entre duas datas
 * @param dataInicio - Data de início
 * @param dataFim - Data de fim
 * @returns Número de dias de diferença
 */
export const calcularDiasEntreDatas = (
  dataInicio: string,
  dataFim: string
): number => {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const diffTime = fim.getTime() - inicio.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Formata percentual para exibição
 * @param percentual - Valor percentual (0-100)
 * @returns String formatada com % e cores
 */
export const formatPercentual = (percentual: number): string => {
  return `${Math.round(percentual)}%`;
};

/**
 * Determina a cor baseada no percentual de conclusão
 * @param percentual - Percentual de conclusão (0-100)
 * @returns Classe CSS da cor correspondente
 */
export const getCorPorcentual = (percentual: number): string => {
  if (percentual === 100) return 'text-green-600';
  if (percentual >= 70) return 'text-blue-600';
  if (percentual >= 40) return 'text-yellow-600';
  return 'text-red-600';
};
