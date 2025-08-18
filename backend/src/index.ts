import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Tipos para Cronograma de Parada
interface Atividade {
  id: string;
  nome: string;
  fase: string;
  categoria?: string;
  duracao: string;
  dataInicio: string;
  dataFim: string;
  progresso: number;
  progressoFisico?: number;
  status: 'completed' | 'in-progress' | 'pending' | 'delayed';
  responsavel?: string;
  predecessors?: string;
  isCritical?: boolean;
  isMarco?: boolean;
  observacoes?: string;
}

interface Fase {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  status: 'completed' | 'in-progress' | 'not-started' | 'delayed';
  estimatedDuration: number;
  progress: number;
  activities: number;
  completedActivities: number;
  delayedActivities: number;
  criticalActivities: number;
  onTimeActivities: number;
  advancedActivities: number;
  estimatedEnd: string;
  daysRemaining: number;
  totalTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  categories: Array<{
    name: string;
    progress: number;
    delayed: number;
    critical: number;
  }>;
}

interface CronogramaData {
  fases: Fase[];
  atividades: Atividade[];
  metadata: {
    titulo: string;
    dataInicio: string;
    dataFim: string;
    duracaoTotal: string;
    progressoGeral: number;
    ultimaAtualizacao: string;
  };
}

// Interface para compatibilidade com o sistema anterior
interface EvolutionPoint {
  time: string;
  occupancy: number;
}

interface EventArea {
  id: number;
  name: string;
  category: string;
  capacity: number;
  currentOccupancy: number;
  evolution: EvolutionPoint[];
  status: string;
  temperature: number;
  humidity: number;
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Servir arquivos estáticos do React build em produção
if (process.env.NODE_ENV === 'production') {
  app.use(
    express.static(path.join(__dirname, '../../frontend/dashboard/build'))
  );
}

// Rota de teste simples
app.get('/api/test', (req, res) => {
  console.log('🧪 Rota de teste acessada');
  res.json({
    message: 'Backend funcionando!',
    timestamp: new Date().toISOString(),
  });
});

// Health check para o Render
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Caminhos para os arquivos de dados
// Rota para listar imagens do carrossel
app.get('/api/images', (req, res) => {
  const imgDir = path.join(
    __dirname,
    '../../frontend/dashboard/public/static/img'
  );
  fs.readdir(imgDir, (err, files) => {
    if (err) {
      console.error('Erro ao ler pasta de imagens:', err);
      return res.status(500).json({ error: 'Erro ao ler imagens' });
    }
    // Filtra apenas arquivos de imagem
    const imageFiles = files.filter((f) => /\.(jpg|jpeg|png|gif)$/i.test(f));
    // Retorna caminhos relativos para uso no frontend
    res.json(imageFiles.map((f) => `/static/img/${f}`));
  });
});
const dataFilePath = path.join(__dirname, 'areas-data.json');
const cronogramaFilePath = path.join(__dirname, 'cronograma-data.json');

// Função para carregar dados de cronograma
const loadCronogramaFromFile = (): CronogramaData | null => {
  try {
    if (fs.existsSync(cronogramaFilePath)) {
      const data = fs.readFileSync(cronogramaFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar dados do cronograma:', error);
  }
  return null;
};

// Função para salvar dados de cronograma
const saveCronogramaToFile = (data: CronogramaData) => {
  try {
    fs.writeFileSync(cronogramaFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erro ao salvar dados do cronograma:', error);
  }
};

// Função para carregar dados do arquivo
const loadDataFromFile = () => {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar dados do arquivo:', error);
  }
  return getDefaultData();
};

// Função para salvar dados no arquivo
const saveDataToFile = (data: any) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    console.log('Dados salvos com sucesso em:', dataFilePath);
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
  }
};

// Dados padrão (simulados)
const getDefaultData = (): EventArea[] => [
  {
    id: 1,
    name: 'Palco Principal',
    category: 'Entretenimento',
    capacity: 5000,
    currentOccupancy: 3200,
    evolution: [
      { time: '08:00', occupancy: 0 },
      { time: '09:00', occupancy: 150 },
      { time: '10:00', occupancy: 800 },
      { time: '11:00', occupancy: 1500 },
      { time: '12:00', occupancy: 2800 },
      { time: '13:00', occupancy: 3200 },
      { time: '14:00', occupancy: 3500 },
      { time: '15:00', occupancy: 4200 },
      { time: '16:00', occupancy: 4800 },
      { time: '17:00', occupancy: 4500 },
    ],
    status: 'Ativo',
    temperature: 24,
    humidity: 65,
  },
  {
    id: 2,
    name: 'Área de Alimentação',
    category: 'Serviços',
    capacity: 1500,
    currentOccupancy: 890,
    evolution: [
      { time: '08:00', occupancy: 0 },
      { time: '09:00', occupancy: 50 },
      { time: '10:00', occupancy: 200 },
      { time: '11:00', occupancy: 450 },
      { time: '12:00', occupancy: 1200 },
      { time: '13:00', occupancy: 1450 },
      { time: '14:00', occupancy: 980 },
      { time: '15:00', occupancy: 750 },
      { time: '16:00', occupancy: 890 },
      { time: '17:00', occupancy: 1100 },
    ],
    status: 'Ativo',
    temperature: 26,
    humidity: 70,
  },
  {
    id: 3,
    name: 'Stand de Exposições',
    category: 'Comercial',
    capacity: 2000,
    currentOccupancy: 1350,
    evolution: [
      { time: '08:00', occupancy: 0 },
      { time: '09:00', occupancy: 100 },
      { time: '10:00', occupancy: 600 },
      { time: '11:00', occupancy: 1000 },
      { time: '12:00', occupancy: 1200 },
      { time: '13:00', occupancy: 1100 },
      { time: '14:00', occupancy: 1350 },
      { time: '15:00', occupancy: 1600 },
      { time: '16:00', occupancy: 1800 },
      { time: '17:00', occupancy: 1650 },
    ],
    status: 'Ativo',
    temperature: 23,
    humidity: 60,
  },
  {
    id: 4,
    name: 'Área VIP',
    category: 'Premium',
    capacity: 300,
    currentOccupancy: 245,
    evolution: [
      { time: '08:00', occupancy: 0 },
      { time: '09:00', occupancy: 20 },
      { time: '10:00', occupancy: 80 },
      { time: '11:00', occupancy: 150 },
      { time: '12:00', occupancy: 200 },
      { time: '13:00', occupancy: 230 },
      { time: '14:00', occupancy: 245 },
      { time: '15:00', occupancy: 280 },
      { time: '16:00', occupancy: 290 },
      { time: '17:00', occupancy: 275 },
    ],
    status: 'Ativo',
    temperature: 22,
    humidity: 55,
  },
  {
    id: 5,
    name: 'Estacionamento',
    category: 'Infraestrutura',
    capacity: 1000,
    currentOccupancy: 780,
    evolution: [
      { time: '08:00', occupancy: 50 },
      { time: '09:00', occupancy: 200 },
      { time: '10:00', occupancy: 450 },
      { time: '11:00', occupancy: 650 },
      { time: '12:00', occupancy: 780 },
      { time: '13:00', occupancy: 820 },
      { time: '14:00', occupancy: 900 },
      { time: '15:00', occupancy: 950 },
      { time: '16:00', occupancy: 920 },
      { time: '17:00', occupancy: 850 },
    ],
    status: 'Ativo',
    temperature: 20,
    humidity: 45,
  },
  {
    id: 6,
    name: 'Área de Descanso',
    category: 'Bem-estar',
    capacity: 800,
    currentOccupancy: 320,
    evolution: [
      { time: '08:00', occupancy: 0 },
      { time: '09:00', occupancy: 30 },
      { time: '10:00', occupancy: 100 },
      { time: '11:00', occupancy: 180 },
      { time: '12:00', occupancy: 320 },
      { time: '13:00', occupancy: 450 },
      { time: '14:00', occupancy: 380 },
      { time: '15:00', occupancy: 280 },
      { time: '16:00', occupancy: 320 },
      { time: '17:00', occupancy: 250 },
    ],
    status: 'Ativo',
    temperature: 25,
    humidity: 58,
  },
];

// Variável global para armazenar os dados atuais
let eventAreas: EventArea[] = loadDataFromFile();

// Rotas da API

// Rota para upload de dados
app.post('/api/upload-data', (req, res) => {
  try {
    const { areas } = req.body;

    if (!areas || !Array.isArray(areas)) {
      return res
        .status(400)
        .json({ error: 'Dados inválidos. Esperado array de áreas.' });
    }

    // Atualizar os dados em memória
    eventAreas = areas;

    // Salvar no arquivo
    saveDataToFile(eventAreas);

    res.json({
      message: 'Dados carregados com sucesso!',
      count: areas.length,
    });
  } catch (error) {
    console.error('Erro ao fazer upload dos dados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para resetar dados para o padrão
app.post('/api/reset-data', (req, res) => {
  try {
    eventAreas = getDefaultData();
    saveDataToFile(eventAreas);
    res.json({ message: 'Dados resetados para o padrão!' });
  } catch (error) {
    console.error('Erro ao resetar dados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter status dos dados
app.get('/api/data-status', (req, res) => {
  res.json({
    source: fs.existsSync(dataFilePath) ? 'file' : 'default',
    filePath: dataFilePath,
    count: eventAreas.length,
    lastModified: fs.existsSync(dataFilePath)
      ? fs.statSync(dataFilePath).mtime
      : null,
  });
});

app.get('/api/areas', (req, res) => {
  res.json(eventAreas);
});

app.get('/api/areas/:id', (req, res) => {
  const areaId = parseInt(req.params.id);
  const area = eventAreas.find((a) => a.id === areaId);

  if (!area) {
    return res.status(404).json({ error: 'Área não encontrada' });
  }

  res.json(area);
});

app.get('/api/summary', (req, res) => {
  const totalCapacity = eventAreas.reduce(
    (sum, area) => sum + area.capacity,
    0
  );
  const totalOccupancy = eventAreas.reduce(
    (sum, area) => sum + area.currentOccupancy,
    0
  );
  const occupancyRate = ((totalOccupancy / totalCapacity) * 100).toFixed(1);

  const areasByCategory = eventAreas.reduce(
    (acc, area) => {
      if (!acc[area.category]) {
        acc[area.category] = [];
      }
      acc[area.category].push(area);
      return acc;
    },
    {} as { [key: string]: typeof eventAreas }
  );

  res.json({
    totalAreas: eventAreas.length,
    totalCapacity,
    totalOccupancy,
    occupancyRate: parseFloat(occupancyRate),
    areasByCategory,
    activeAreas: eventAreas.filter((a) => a.status === 'Ativo').length,
    averageTemperature: (
      eventAreas.reduce((sum, area) => sum + area.temperature, 0) /
      eventAreas.length
    ).toFixed(1),
    averageHumidity: (
      eventAreas.reduce((sum, area) => sum + area.humidity, 0) /
      eventAreas.length
    ).toFixed(1),
  });
});

app.get('/api/realtime', (req, res) => {
  // Simula dados em tempo real com pequenas variações
  const realtimeData = eventAreas.map((area) => ({
    id: area.id,
    name: area.name,
    currentOccupancy:
      area.currentOccupancy + Math.floor(Math.random() * 20 - 10),
    capacity: area.capacity,
    temperature: area.temperature + (Math.random() * 2 - 1),
    humidity: area.humidity + (Math.random() * 4 - 2),
    lastUpdate: new Date().toISOString(),
  }));

  res.json(realtimeData);
});

// Rota para evolução temporal de todas as áreas
app.get('/api/evolution', (req, res) => {
  const evolutionData = eventAreas.map((area) => ({
    name: area.name,
    data: area.evolution.map((point) => ({
      x: point.time,
      y: point.occupancy,
    })),
  }));

  res.json(evolutionData);
});

// === NOVAS ROTAS PARA CRONOGRAMA DE PARADA ===

// Rota para upload de dados de cronograma operacional
app.post('/api/cronograma/operacional', (req, res) => {
  try {
    const { fases, atividades, metadata } = req.body;

    if (!fases || !atividades || !metadata) {
      return res.status(400).json({
        error: 'Dados inválidos. Esperado fases, atividades e metadata.',
      });
    }

    const cronogramaData: CronogramaData = {
      fases,
      atividades,
      metadata: {
        ...metadata,
        ultimaAtualizacao: new Date().toISOString(),
      },
    };

    saveCronogramaToFile(cronogramaData);

    res.json({
      message: 'Cronograma operacional carregado com sucesso!',
      fases: fases.length,
      atividades: atividades.length,
    });
  } catch (error) {
    console.error('Erro ao fazer upload do cronograma operacional:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para upload de dados de cronograma de preparação
app.post('/api/cronograma/preparacao', (req, res) => {
  try {
    const { fase, atividades, metadata } = req.body;

    if (!fase || !atividades || !metadata) {
      return res.status(400).json({
        error: 'Dados inválidos. Esperado fase, atividades e metadata.',
      });
    }

    // Carregar dados existentes ou criar novo
    let cronogramaData = loadCronogramaFromFile();
    if (!cronogramaData) {
      cronogramaData = {
        fases: [],
        atividades: [],
        metadata: {
          titulo: 'Cronograma PFUS3 2025',
          dataInicio: '',
          dataFim: '',
          duracaoTotal: '',
          progressoGeral: 0,
          ultimaAtualizacao: new Date().toISOString(),
        },
      };
    }

    // Atualizar ou adicionar fase de preparação
    const preparacaoIndex = cronogramaData.fases.findIndex(
      (f) => f.id === 'preparacao'
    );
    if (preparacaoIndex >= 0) {
      cronogramaData.fases[preparacaoIndex] = fase;
    } else {
      cronogramaData.fases.unshift(fase); // Adicionar no início
    }

    // Adicionar/atualizar atividades de preparação
    const atividadesPreparacao = atividades.map((ativ: any) => ({
      ...ativ,
      fase: 'preparacao',
    }));

    // Remover atividades antigas de preparação e adicionar novas
    cronogramaData.atividades = cronogramaData.atividades.filter(
      (ativ) => ativ.fase !== 'preparacao'
    );
    cronogramaData.atividades = [
      ...atividadesPreparacao,
      ...cronogramaData.atividades,
    ];

    // Atualizar metadata
    cronogramaData.metadata = {
      ...cronogramaData.metadata,
      titulo: metadata.titulo || cronogramaData.metadata.titulo,
      dataInicio: metadata.dataInicio || cronogramaData.metadata.dataInicio,
      progressoGeral: Math.round(
        cronogramaData.fases.reduce((acc, f) => acc + f.progress, 0) /
          cronogramaData.fases.length
      ),
      ultimaAtualizacao: new Date().toISOString(),
    };

    saveCronogramaToFile(cronogramaData);

    res.json({
      message: 'Cronograma de preparação carregado com sucesso!',
      atividades: atividades.length,
      progresso: fase.progress,
    });
  } catch (error) {
    console.error('Erro ao fazer upload do cronograma de preparação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter dados do cronograma
app.get('/api/cronograma', (req, res) => {
  try {
    console.log('🔍 Requisição recebida para /api/cronograma');
    const cronogramaData = loadCronogramaFromFile();

    if (!cronogramaData) {
      console.log('⚠️ Cronograma não encontrado, retornando dados vazios');
      return res.status(404).json({
        message: 'Nenhum cronograma encontrado',
        fases: [],
        atividades: [],
        metadata: null,
      });
    }

    console.log('✅ Cronograma encontrado, retornando dados');
    res.json(cronogramaData);
  } catch (error) {
    console.error('❌ Erro ao carregar cronograma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter fases do cronograma
app.get('/api/cronograma/fases', (req, res) => {
  try {
    const cronogramaData = loadCronogramaFromFile();

    if (!cronogramaData) {
      return res.json([]);
    }

    res.json(cronogramaData.fases);
  } catch (error) {
    console.error('Erro ao carregar fases:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter atividades por fase
app.get('/api/cronograma/atividades/:faseId', (req, res) => {
  try {
    const { faseId } = req.params;
    const cronogramaData = loadCronogramaFromFile();

    if (!cronogramaData) {
      return res.json([]);
    }

    const atividadesFase = cronogramaData.atividades.filter(
      (ativ) => ativ.fase === faseId
    );

    res.json(atividadesFase);
  } catch (error) {
    console.error('Erro ao carregar atividades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para estatísticas do cronograma
app.get('/api/cronograma/estatisticas', (req, res) => {
  try {
    const cronogramaData = loadCronogramaFromFile();

    if (!cronogramaData) {
      return res.json({
        totalFases: 0,
        totalAtividades: 0,
        progressoGeral: 0,
        fasesCompletas: 0,
        fasesEmAndamento: 0,
        fasesPendentes: 0,
        atividadesCriticas: 0,
        atividadesAtrasadas: 0,
      });
    }

    const stats = {
      totalFases: cronogramaData.fases.length,
      totalAtividades: cronogramaData.atividades.length,
      progressoGeral: cronogramaData.metadata.progressoGeral,
      fasesCompletas: cronogramaData.fases.filter(
        (f) => f.status === 'completed'
      ).length,
      fasesEmAndamento: cronogramaData.fases.filter(
        (f) => f.status === 'in-progress'
      ).length,
      fasesPendentes: cronogramaData.fases.filter(
        (f) => f.status === 'not-started'
      ).length,
      atividadesCriticas: cronogramaData.atividades.filter((a) => a.isCritical)
        .length,
      atividadesAtrasadas: cronogramaData.atividades.filter(
        (a) => a.status === 'delayed'
      ).length,
      ultimaAtualizacao: cronogramaData.metadata.ultimaAtualizacao,
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos CSV são permitidos'));
    }
  },
});

// Rota para fazer backup de arquivo atual
app.get('/api/csv/backup/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    console.log(`📥 Solicitação de backup do tipo: ${tipo}`);

    let fileName = '';
    if (tipo === 'preparacao') {
      fileName = 'cronograma-preparacao-real.csv';
    } else if (tipo === 'operacional') {
      fileName = 'cronograma-operacional.csv';
    } else {
      return res
        .status(400)
        .json({ error: 'Tipo inválido. Use: preparacao ou operacional' });
    }

    const frontendPublicPath = path.join(
      __dirname,
      '../../frontend/dashboard/public',
      fileName
    );

    if (fs.existsSync(frontendPublicPath)) {
      const csvContent = fs.readFileSync(frontendPublicPath, 'utf-8');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `backup-${tipo}-${timestamp}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${backupName}"`
      );
      res.send(csvContent);

      console.log(`✅ Backup criado: ${backupName}`);
    } else {
      res.status(404).json({ error: 'Arquivo não encontrado' });
    }
  } catch (error) {
    console.error('❌ Erro ao fazer backup:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para upload de CSV
app.post(
  '/api/csv/upload/:tipo',
  upload.single('csvFile'),
  async (req, res) => {
    try {
      const { tipo } = req.params;
      console.log(`📤 Upload de CSV do tipo: ${tipo}`);

      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      let fileName = '';
      if (tipo === 'preparacao') {
        fileName = 'cronograma-preparacao-real.csv';
      } else if (tipo === 'operacional') {
        fileName = 'cronograma-operacional.csv';
      } else {
        return res
          .status(400)
          .json({ error: 'Tipo inválido. Use: preparacao ou operacional' });
      }

      const csvContent = req.file.buffer.toString('utf-8');

      // Validar estrutura básica do CSV
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        return res.status(400).json({
          error: 'CSV deve ter pelo menos header e uma linha de dados',
        });
      }

      const headers = lines[0].split(',');
      if (headers.length < 5) {
        return res
          .status(400)
          .json({ error: 'CSV deve ter pelo menos 5 colunas' });
      }

      // Definir caminhos de destino
      const frontendPublicPath = path.join(
        __dirname,
        '../../frontend/dashboard/public',
        fileName
      );
      const frontendBuildPath = path.join(
        __dirname,
        '../../frontend/dashboard/build',
        fileName
      );

      // Fazer backup do arquivo atual (se existir)
      if (fs.existsSync(frontendPublicPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(
          __dirname,
          '../../frontend/dashboard/public',
          `backup-${tipo}-${timestamp}.csv`
        );
        fs.copyFileSync(frontendPublicPath, backupPath);
        console.log(`💾 Backup salvo: backup-${tipo}-${timestamp}.csv`);
      }

      // Salvar novo arquivo
      fs.writeFileSync(frontendPublicPath, csvContent, 'utf-8');
      console.log(`✅ Arquivo salvo: ${frontendPublicPath}`);

      // Salvar também na pasta build (se existir)
      if (fs.existsSync(path.dirname(frontendBuildPath))) {
        fs.writeFileSync(frontendBuildPath, csvContent, 'utf-8');
        console.log(`✅ Arquivo salvo também em build: ${frontendBuildPath}`);
      }

      // Retornar estatísticas do arquivo
      const stats = {
        fileName: fileName,
        originalName: req.file.originalname,
        size: req.file.size,
        totalLines: lines.length,
        headers: headers.length,
        uploadedAt: new Date().toISOString(),
        backupCreated: fs.existsSync(frontendPublicPath),
      };

      res.json({
        success: true,
        message: `Arquivo ${tipo} atualizado com sucesso!`,
        stats: stats,
      });

      console.log(`🎉 Upload concluído para ${tipo}:`, stats);
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
);

// Rota para validar CSV antes do upload
app.post(
  '/api/csv/validate/:tipo',
  upload.single('csvFile'),
  async (req, res) => {
    try {
      const { tipo } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const lines = csvContent.trim().split('\n');
      const headers = lines[0]?.split(',') || [];
      const dataRows = lines.slice(1);

      const errors: string[] = [];

      // Validações específicas por tipo
      if (tipo === 'preparacao') {
        const requiredHeaders = ['ID', 'Task Name', '% Complete', '% Physical'];
        requiredHeaders.forEach((header) => {
          if (
            !headers.some((h) => h.toLowerCase().includes(header.toLowerCase()))
          ) {
            errors.push(`Header obrigatório não encontrado: ${header}`);
          }
        });

        if (headers.length < 10) {
          errors.push('CSV de preparação deve ter pelo menos 10 colunas');
        }
      } else if (tipo === 'operacional') {
        const requiredHeaders = ['Activity ID', 'Activity Name', 'Duration'];
        requiredHeaders.forEach((header) => {
          if (
            !headers.some((h) => h.toLowerCase().includes(header.toLowerCase()))
          ) {
            errors.push(`Header obrigatório não encontrado: ${header}`);
          }
        });
      }

      // Validar dados
      if (dataRows.length === 0) {
        errors.push('CSV está vazio');
      }

      if (dataRows.length > 0) {
        const firstRowLength = headers.length;
        dataRows.forEach((row, index) => {
          if (row.split(',').length !== firstRowLength) {
            errors.push(`Linha ${index + 2}: número de colunas inconsistente`);
          }
        });
      }

      const isValid = errors.length === 0;

      res.json({
        isValid,
        errors,
        stats: {
          totalLines: lines.length,
          headers: headers.length,
          dataRows: dataRows.length,
          headersList: headers,
        },
      });
    } catch (error) {
      console.error('❌ Erro na validação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// Rota para listar arquivos CSV disponíveis
app.get('/api/csv/status', async (req, res) => {
  try {
    const publicPath = path.join(__dirname, '../../frontend/dashboard/public');
    const files = [
      'cronograma-preparacao-real.csv',
      'cronograma-operacional.csv',
    ];

    const status = files.map((fileName) => {
      const filePath = path.join(publicPath, fileName);
      const exists = fs.existsSync(filePath);

      let stats = null;
      if (exists) {
        const fileStat = fs.statSync(filePath);
        stats = {
          size: fileStat.size,
          lastModified: fileStat.mtime.toISOString(),
          created: fileStat.ctime.toISOString(),
        };
      }

      return {
        fileName,
        exists,
        stats,
        type: fileName.includes('preparacao') ? 'preparacao' : 'operacional',
      };
    });

    res.json({ files: status });
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Servir o React app para todas as rotas não-API em produção
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(
      path.join(__dirname, '../../frontend/dashboard/build/index.html')
    );
  });
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Handler para erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada:', promise, 'razão:', reason);
});

export default app;
