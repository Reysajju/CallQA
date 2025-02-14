import React from 'react';

export interface HeroProps {
  title: string;
  description?: string;
  backgroundImage: string;
  overlayOpacity?: string;
  children?: React.ReactNode;
  height?: string;
  textAlignment?: 'left' | 'center' | 'right';
}

export function Hero({ 
  title, 
  description, 
  backgroundImage, 
  overlayOpacity = '70', 
  children,
  height = 'h-[500px]',
  textAlignment = 'center'
}: HeroProps) {
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  };

  return (
    <div className={`relative ${height} w-full overflow-hidden`}>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div 
        className={`absolute inset-0 bg-brand-dark/${overlayOpacity}`}
      />
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col justify-center h-full ${alignmentClasses[textAlignment]}`}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xl text-gray-200 max-w-3xl">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}