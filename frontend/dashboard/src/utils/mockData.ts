import { EventArea, DashboardSummary, EvolutionData } from '../types';

// Dados mockados para demonstração
export const mockAreas: EventArea[] = [
  {
    id: 1,
    name: 'Mobilização da Equipe',
    category: 'Preparação',
    capacity: 100,
    currentOccupancy: 100,
    status: 'completed',
    temperature: 25,
    humidity: 60,
    evolution: [
      { time: '08:00', occupancy: 20 },
      { time: '10:00', occupancy: 35 },
      { time: '12:00', occupancy: 50 },
      { time: '14:00', occupancy: 70 },
      { time: '16:00', occupancy: 85 },
      { time: '18:00', occupancy: 100 },
    ],
  },
  {
    id: 2,
    name: 'Canteiros e Infraestrutura',
    category: 'Infraestrutura',
    capacity: 100,
    currentOccupancy: 85,
    status: 'in-progress',
    temperature: 23,
    humidity: 55,
    evolution: [
      { time: '08:00', occupancy: 10 },
      { time: '10:00', occupancy: 25 },
      { time: '12:00', occupancy: 40 },
      { time: '14:00', occupancy: 55 },
      { time: '16:00', occupancy: 70 },
      { time: '18:00', occupancy: 85 },
    ],
  },
  {
    id: 3,
    name: 'Limpeza e Organização',
    category: 'Preparação',
    capacity: 100,
    currentOccupancy: 65,
    status: 'in-progress',
    temperature: 24,
    humidity: 58,
    evolution: [
      { time: '08:00', occupancy: 5 },
      { time: '10:00', occupancy: 15 },
      { time: '12:00', occupancy: 30 },
      { time: '14:00', occupancy: 45 },
      { time: '16:00', occupancy: 55 },
      { time: '18:00', occupancy: 65 },
    ],
  },
  {
    id: 4,
    name: 'Segurança e Permissões',
    category: 'Segurança',
    capacity: 100,
    currentOccupancy: 40,
    status: 'pending',
    temperature: 22,
    humidity: 52,
    evolution: [
      { time: '08:00', occupancy: 0 },
      { time: '10:00', occupancy: 10 },
      { time: '12:00', occupancy: 20 },
      { time: '14:00', occupancy: 25 },
      { time: '16:00', occupancy: 35 },
      { time: '18:00', occupancy: 40 },
    ],
  },
];

export const mockSummary: DashboardSummary = {
  totalAreas: 4,
  totalCapacity: 400,
  totalOccupancy: 290,
  occupancyRate: 72.5,
  activeAreas: 3,
  averageTemperature: '23.5°C',
  averageHumidity: '56.3%',
  areasByCategory: {
    Preparação: [mockAreas[0], mockAreas[2]],
    Infraestrutura: [mockAreas[1]],
    Segurança: [mockAreas[3]],
  },
};

export const mockEvolution: EvolutionData[] = [
  {
    name: 'Mobilização da Equipe',
    data: [
      { x: '08:00', y: 20 },
      { x: '10:00', y: 35 },
      { x: '12:00', y: 50 },
      { x: '14:00', y: 70 },
      { x: '16:00', y: 85 },
      { x: '18:00', y: 100 },
    ],
  },
  {
    name: 'Canteiros e Infraestrutura',
    data: [
      { x: '08:00', y: 10 },
      { x: '10:00', y: 25 },
      { x: '12:00', y: 40 },
      { x: '14:00', y: 55 },
      { x: '16:00', y: 70 },
      { x: '18:00', y: 85 },
    ],
  },
  {
    name: 'Limpeza e Organização',
    data: [
      { x: '08:00', y: 5 },
      { x: '10:00', y: 15 },
      { x: '12:00', y: 30 },
      { x: '14:00', y: 45 },
      { x: '16:00', y: 55 },
      { x: '18:00', y: 65 },
    ],
  },
  {
    name: 'Segurança e Permissões',
    data: [
      { x: '08:00', y: 0 },
      { x: '10:00', y: 10 },
      { x: '12:00', y: 20 },
      { x: '14:00', y: 25 },
      { x: '16:00', y: 35 },
      { x: '18:00', y: 40 },
    ],
  },
];

export const getMockData = () => {
  return {
    areas: mockAreas,
    summary: mockSummary,
    evolution: mockEvolution,
  };
};
