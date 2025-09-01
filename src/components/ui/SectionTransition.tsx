import React from 'react';

interface SectionTransitionProps {
  children: React.ReactNode;
  className?: string;
  topGradient?: string;
  bottomGradient?: string;
  marginTop?: string;
}

const SectionTransition: React.FC<SectionTransitionProps> = ({
  children,
  className = '',
  topGradient = 'from-transparent via-gray-900/50 to-gray-900',
  bottomGradient = 'from-gray-900 via-gray-800/60 to-transparent',
  marginTop = '-mt-16'
}) => {
  return (
    <div className={`relative ${marginTop} ${className}`}>
      {/* Top gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b ${topGradient} pointer-events-none z-10`} />
      
      {/* Content */}
      <div className="relative z-20">
        {children}
      </div>
      
      {/* Bottom gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t ${bottomGradient} pointer-events-none z-10`} />
    </div>
  );
};

export default SectionTransition;