import React from 'react';
import { PhaseType } from '../types/phases';

interface PhaseCardProps {
  type: PhaseType;
  title: string;
  icon: string;
  progress: number;
  bgColor: string;
  textColor: string;
  progressColor: string;
  onClick: () => void;
}

export default function PhaseCard({
  type,
  title,
  icon,
  progress,
  bgColor,
  textColor,
  progressColor,
  onClick,
}: PhaseCardProps) {
  return (
    <div
      className={`${bgColor} rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow`}
      onClick={onClick}
      data-testid={`phase-card-${type}`}
    >
      <h3 className={`font-semibold ${textColor}`}>
        {icon} {title}
      </h3>
      <p className={`text-2xl font-bold ${progressColor}`}>
        {progress.toFixed(2)}%
      </p>
    </div>
  );
}
