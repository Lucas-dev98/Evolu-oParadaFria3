import fs from 'fs';
const Papa = require('papaparse');

export function processarCronogramaOperacional(csvPath: string) {
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    delimiter: ';',
    transformHeader: (header: string) => header.trim(),
  });
  const data = results.data;

  // Função auxiliar para normalizar nomes de colunas
  function normalizeKey(key: string) {
    return key
      .replace(/[^\w]/g, '') // remove acentos e caracteres especiais
      .toLowerCase();
  }

  // Mapeamento dos nomes das colunas esperadas
  function getValue(row: any, key: string) {
    const normalizedKey = normalizeKey(key);
    for (const k in row) {
      if (normalizeKey(k) === normalizedKey) return row[k];
    }
    return undefined;
  }

  // Filtrar linhas válidas
  const validRows = data.filter(
    (row: any) =>
      getValue(row, 'Id') &&
      !isNaN(parseInt(getValue(row, 'Id'))) &&
      getValue(row, 'Nome') &&
      getValue(row, 'Nome').trim() !== ''
  );

  // Organizar atividades por hierarquia
  const estrutura = {
    areas: {} as Record<string, any[]>,
    subatividades: {} as Record<string, any[]>,
  };

  validRows.forEach((row: any) => {
    const nivel = parseInt(
      getValue(row, 'Nível_da_estrutura_de_tópicos') ||
        getValue(row, 'Nivel_da_estrutura_de_topicos') ||
        '0'
    );
    const edt = getValue(row, 'EDT') || '';
    let fase = 'outras';
    if (/^1\.7($|\.)/.test(edt)) fase = 'parada';
    else if (/^1\.8($|\.)/.test(edt)) fase = 'manutencao';
    else if (/^1\.9($|\.)/.test(edt)) fase = 'partida';

    if (nivel === 3) {
      if (!estrutura.areas[fase]) estrutura.areas[fase] = [];
      estrutura.areas[fase].push({ ...row, fase, subatividades: [] });
    } else if (nivel === 4) {
      const edtParts = edt.split('.');
      if (edtParts.length >= 3) {
        const areaPai = edtParts.slice(0, 3).join('.');
        if (!estrutura.subatividades[areaPai])
          estrutura.subatividades[areaPai] = [];
        estrutura.subatividades[areaPai].push({ ...row, fase, areaPai });
      }
    }
  });

  // Montar estrutura por fase
  const criarEstruturaPorFase = (nomeFase: string) => {
    const areas = estrutura.areas[nomeFase] || [];
    return areas.map((area: any) => {
      const subatividades = estrutura.subatividades[area.EDT] || [];
      return {
        ...area,
        subatividades,
        totalSubatividades: subatividades.length,
      };
    });
  };

  return {
    parada: criarEstruturaPorFase('parada'),
    manutencao: criarEstruturaPorFase('manutencao'),
    partida: criarEstruturaPorFase('partida'),
  };
}
