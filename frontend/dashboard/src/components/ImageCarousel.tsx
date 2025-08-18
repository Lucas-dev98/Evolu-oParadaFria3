import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  height?: string;
  autoPlay?: boolean;
  interval?: number;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  height = '220px',
  autoPlay = true,
  interval = 4000,
}) => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const prev = () => setCurrent((current - 1 + images.length) % images.length);
  const next = () => setCurrent((current + 1) % images.length);

  // Auto-play functionality com pause no hover
  useEffect(() => {
    if (!autoPlay || !images || images.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images, isHovered]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full flex flex-col items-center mb-6">
        <div
          className="relative w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-modern-xl border-2 border-gray-200 dark:border-gray-600"
          style={{ height }}
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              Nenhuma imagem disponível
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Corrige índice fora do array
  const safeIndex = Math.max(0, Math.min(current, images.length - 1));

  return (
    <div
      className="w-full flex flex-col items-center mb-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative w-full group overflow-hidden rounded-modern-xl shadow-modern-lg"
        style={{ height }}
      >
        {/* Main image */}
        <img
          src={images[safeIndex]}
          alt={`Planta Industrial - Imagem ${safeIndex + 1}`}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            console.error('❌ Erro ao carregar imagem:', images[safeIndex]);
            // Opcional: adicionar imagem de fallback
            // e.currentTarget.src = '/path/to/fallback-image.jpg';
          }}
          onLoad={() => {
            console.log('✅ Imagem carregada com sucesso:', images[safeIndex]);
          }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Navigation buttons - melhorados */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-modern-md hover:shadow-modern-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110"
          onClick={prev}
          aria-label="Imagem anterior"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>

        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-modern-md hover:shadow-modern-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110"
          onClick={next}
          aria-label="Próxima imagem"
        >
          <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Image counter */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm rounded-modern-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {safeIndex + 1} / {images.length}
        </div>

        {/* Auto-play indicator */}
        {autoPlay && !isHovered && (
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-primary-500/80 backdrop-blur-sm text-white text-xs rounded-modern-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Auto
          </div>
        )}
      </div>

      {/* Enhanced indicators */}
      <div className="flex gap-2 mt-4">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`
              relative overflow-hidden rounded-modern-sm transition-all duration-300 border-2
              ${
                idx === safeIndex
                  ? 'w-8 h-3 bg-primary-500 border-primary-500 shadow-glow-blue'
                  : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }
            `}
            onClick={() => setCurrent(idx)}
            aria-label={`Ir para imagem ${idx + 1}`}
          >
            {idx === safeIndex && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 animate-pulse-soft" />
            )}
          </button>
        ))}
      </div>

      {/* Pause indicator when hovered */}
      {isHovered && autoPlay && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <div className="w-1 h-3 bg-gray-400 rounded-sm" />
          <div className="w-1 h-3 bg-gray-400 rounded-sm" />
          <span className="ml-1">Pausado</span>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
