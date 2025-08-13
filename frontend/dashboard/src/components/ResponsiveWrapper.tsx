import React from 'react';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  mobileFullWidth?: boolean;
  touchOptimized?: boolean;
}

const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  className = '',
  mobileFullWidth = false,
  touchOptimized = false,
}) => {
  const baseClasses = [
    // Base responsive padding
    'px-2 xs:px-4 sm:px-6 lg:px-8',
    'py-2 xs:py-3 sm:py-4 lg:py-6',
    // Mobile optimizations
    mobileFullWidth ? 'w-full' : '',
    touchOptimized ? 'touch-target' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={baseClasses}>{children}</div>;
};

export default ResponsiveWrapper;

// Hook para detectar tamanho da tela
export const useResponsive = () => {
  const [screenSize, setScreenSize] = React.useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    // Check initial size
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return screenSize;
};

// Componente para grids responsivos
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: string;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 4 },
  gap = '4',
  className = '',
}) => {
  const gridClasses = [
    'grid',
    `grid-cols-${cols.mobile || 1}`,
    cols.tablet ? `md:grid-cols-${cols.tablet}` : '',
    cols.desktop ? `lg:grid-cols-${cols.desktop}` : '',
    `gap-${gap}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={gridClasses}>{children}</div>;
};

// Componente para texto responsivo
interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  size = 'base',
  className = '',
}) => {
  const sizeMap = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-sm sm:text-base lg:text-lg',
    lg: 'text-base sm:text-lg lg:text-xl',
    xl: 'text-lg sm:text-xl lg:text-2xl',
    '2xl': 'text-xl sm:text-2xl lg:text-3xl',
    '3xl': 'text-2xl sm:text-3xl lg:text-4xl',
  };

  const textClasses = [sizeMap[size], className].filter(Boolean).join(' ');

  return <span className={textClasses}>{children}</span>;
};
