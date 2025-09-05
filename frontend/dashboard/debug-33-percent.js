console.log('=== ANÁLISE DETALHADA DOS DADOS ===');

// Verificar se há dados específicos que resultam em 33%
const preparacaoData = localStorage.getItem('preparacao_data');
if (preparacaoData) {
  const dados = JSON.parse(preparacaoData);

  console.log('Dados de preparação encontrados:');
  console.log('- Fase progress:', dados.fase?.progress);
  console.log('- Metadata progress:', dados.metadata?.progressoGeral);
  console.log('- Status:', dados.fase?.status);
  console.log('- Atividades:', dados.atividades?.length || 0);

  // Verificar se há algum cálculo que resulta em 33%
  if (dados.atividades) {
    const totalAtividades = dados.atividades.length;
    const concluidas = dados.atividades.filter(
      (a) => a.percentual === 100
    ).length;
    const percentualCalculado =
      totalAtividades > 0
        ? Math.round((concluidas / totalAtividades) * 100)
        : 0;

    console.log('=== CÁLCULO DE PROGRESSO ===');
    console.log('Total de atividades:', totalAtividades);
    console.log('Atividades concluídas:', concluidas);
    console.log('Percentual calculado:', percentualCalculado + '%');

    if (percentualCalculado === 33) {
      console.log('🔍 ENCONTRADO! O cálculo está resultando em 33%');
      console.log(
        'Isso significa que',
        concluidas,
        'de',
        totalAtividades,
        'atividades estão 100% concluídas'
      );
    }
  }
}

// Verificar dados do cronograma operacional
const cronogramaData = localStorage.getItem('cronograma_data');
if (cronogramaData) {
  const dados = JSON.parse(cronogramaData);
  console.log('=== DADOS DO CRONOGRAMA OPERACIONAL ===');
  console.log('Dados:', dados);
}

// Verificar se há alguma categoria com 33%
const pfus3Data = localStorage.getItem('pfus3_phases');
if (pfus3Data) {
  const dados = JSON.parse(pfus3Data);
  console.log('=== DADOS PFUS3 ===');
  console.log(
    'Fases:',
    dados.phases?.map((p) => ({ id: p.id, progress: p.progress }))
  );

  dados.phases?.forEach((phase) => {
    if (phase.categories) {
      phase.categories.forEach((cat) => {
        if (cat.progress === 33) {
          console.log(
            '🔍 CATEGORIA COM 33%:',
            cat.name,
            '- Progress:',
            cat.progress
          );
        }
      });
    }
  });
}
