import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// Tipos
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

// Caminho para o arquivo de dados persistidos
const dataFilePath = path.join(__dirname, 'areas-data.json');

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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
