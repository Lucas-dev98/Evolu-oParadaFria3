import React from 'react';
import { PhaseType } from '../types/phases';
import PhaseDashboardComponent from './PhaseDashboardComponent';
import ImageCarousel from './ImageCarouselComponent';
import OperationalDataSectionComponent from './OperationalDataSectionComponent';

interface DashboardViewProps {
  paradaData: any;
  operacionalData: any;
  onPhaseClick: (phaseType: PhaseType) => void;
}

export default function DashboardView({
  paradaData,
  operacionalData,
  onPhaseClick,
}: DashboardViewProps) {
  return (
    <div className="space-y-6">
      {/* Dashboard Principal das Fases */}
      <PhaseDashboardComponent
        paradaData={paradaData}
        onPhaseClick={onPhaseClick}
      />

      {/* Seção de Imagens */}
      <ImageCarousel images={[]} />

      {/* Dados operacionais */}
      <OperationalDataSectionComponent operacionalData={operacionalData} />
    </div>
  );
}
