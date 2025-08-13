import React, { createContext, useContext, useState, useEffect } from 'react';

interface MobileContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
}

const MobileContext = createContext<MobileContextType | undefined>(undefined);

export const MobileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [screenInfo, setScreenInfo] = useState<MobileContextType>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
    orientation: 'landscape',
    isTouch: false,
  });

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenInfo({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
        screenWidth: width,
        screenHeight: height,
        orientation: height > width ? 'portrait' : 'landscape',
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      });
    };

    // Initial check
    updateScreenInfo();

    // Listen for resize events
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);

    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, []);

  return (
    <MobileContext.Provider value={screenInfo}>
      {children}
    </MobileContext.Provider>
  );
};

export const useMobile = (): MobileContextType => {
  const context = useContext(MobileContext);
  if (!context) {
    throw new Error('useMobile must be used within a MobileProvider');
  }
  return context;
};

// Hook para classes CSS responsivas
export const useResponsiveClasses = () => {
  const { isMobile, isTablet, isDesktop, isTouch } = useMobile();

  return {
    container: `
      ${isMobile ? 'px-2 py-2' : isTablet ? 'px-4 py-3' : 'px-6 py-4'}
      ${isMobile ? 'text-sm' : 'text-base'}
    `,
    card: `
      ${isMobile ? 'p-3 rounded-lg' : 'p-6 rounded-xl'}
      ${isMobile ? 'mb-3' : 'mb-6'}
      ${isTouch ? 'touch-target' : ''}
    `,
    button: `
      ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-base'}
      ${isTouch ? 'min-h-[44px] min-w-[44px]' : ''}
      transition-all duration-200
    `,
    grid: `
      grid gap-${isMobile ? '3' : isTablet ? '4' : '6'}
    `,
    text: {
      xs: isMobile ? 'text-xs' : 'text-sm',
      sm: isMobile ? 'text-sm' : 'text-base',
      base: isMobile ? 'text-base' : 'text-lg',
      lg: isMobile ? 'text-lg' : 'text-xl',
      xl: isMobile ? 'text-xl' : 'text-2xl',
    },
  };
};

// Componente wrapper para aplicar otimizações móveis automaticamente
interface MobileOptimizedProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'container' | 'card' | 'grid';
}

export const MobileOptimized: React.FC<MobileOptimizedProps> = ({
  children,
  className = '',
  variant = 'container',
}) => {
  const classes = useResponsiveClasses();
  const baseClass =
    variant === 'container'
      ? classes.container
      : variant === 'card'
        ? classes.card
        : variant === 'grid'
          ? classes.grid
          : '';

  return <div className={`${baseClass} ${className}`}>{children}</div>;
};
