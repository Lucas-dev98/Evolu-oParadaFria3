import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Cpu, HardDrive } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  dataSize: number;
  lastUpdate: Date;
}

interface PerformanceMonitorProps {
  visible: boolean;
  dataLoaded: boolean;
  activitiesCount: number;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  visible,
  dataLoaded,
  activitiesCount,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    dataSize: 0,
    lastUpdate: new Date(),
  });

  const [startTime] = useState(performance.now());

  useEffect(() => {
    if (dataLoaded) {
      const loadTime = performance.now() - startTime;

      // Simular medição de uso de memória (em navegadores que suportam)
      const memoryUsage = (performance as any).memory
        ? (performance as any).memory.usedJSHeapSize / 1024 / 1024
        : 0;

      setMetrics((prev) => ({
        ...prev,
        loadTime,
        memoryUsage,
        dataSize: activitiesCount,
        lastUpdate: new Date(),
      }));
    }
  }, [dataLoaded, activitiesCount, startTime]);

  if (!visible) return null;

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatMemory = (mb: number) => {
    if (mb < 1) return `${Math.round(mb * 1024)}KB`;
    return `${mb.toFixed(1)}MB`;
  };

  const getPerformanceStatus = () => {
    if (metrics.loadTime < 1000)
      return { color: 'text-green-600', label: 'Excelente' };
    if (metrics.loadTime < 3000)
      return { color: 'text-yellow-600', label: 'Bom' };
    return { color: 'text-red-600', label: 'Lento' };
  };

  const status = getPerformanceStatus();

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs max-w-xs">
      <div className="flex items-center space-x-2 mb-2">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        <span className="font-semibold">Performance</span>
        <span className={status.color}>{status.label}</span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span>Carregamento:</span>
          </div>
          <span className="font-mono">{formatTime(metrics.loadTime)}</span>
        </div>

        {metrics.memoryUsage > 0 && (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <Cpu className="w-3 h-3 text-gray-400" />
              <span>Memória:</span>
            </div>
            <span className="font-mono">
              {formatMemory(metrics.memoryUsage)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <HardDrive className="w-3 h-3 text-gray-400" />
            <span>Atividades:</span>
          </div>
          <span className="font-mono">{metrics.dataSize.toLocaleString()}</span>
        </div>

        <div className="text-xs text-gray-500 mt-2 pt-1 border-t">
          Atualizado: {metrics.lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
