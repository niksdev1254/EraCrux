import React from 'react';

interface PremiumBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'mesh' | 'dots';
  className?: string;
}

const PremiumBackground: React.FC<PremiumBackgroundProps> = ({ 
  children, 
  variant = 'default',
  className = '' 
}) => {
  const getBackgroundClass = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30';
      case 'mesh':
        return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/20';
      case 'dots':
        return 'bg-white dark:bg-gray-900 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]';
      default:
        return 'bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800';
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${getBackgroundClass()} ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 dark:to-black/10 pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PremiumBackground;