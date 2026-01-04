import React, { useRef, useEffect, useState } from 'react';

interface Robot3DProps {
  isAnimating?: boolean;
  animationType?: 'idle' | 'wave' | 'point' | 'nod';
  size?: 'small' | 'medium' | 'large';
}

const Robot3D: React.FC<Robot3DProps> = ({ 
  isAnimating = true, 
  animationType = 'idle',
  size = 'medium' 
}) => {
  const robotRef = useRef<HTMLDivElement>(null);
  const [currentAnimation, setCurrentAnimation] = useState(animationType);

  const sizeClasses = {
    small: 'w-16 h-20',
    medium: 'w-20 h-24',
    large: 'w-24 h-28'
  };

  useEffect(() => {
    if (!isAnimating) return;

    const animations = ['idle', 'wave', 'point', 'nod'];
    const interval = setInterval(() => {
      const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
      setCurrentAnimation(randomAnimation as any);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const getAnimationClass = () => {
    switch (currentAnimation) {
      case 'wave':
        return 'animate-[robot-wave_1s_ease-in-out]';
      case 'point':
        return 'animate-[robot-point_1s_ease-in-out]';
      case 'nod':
        return 'animate-[robot-nod_1s_ease-in-out]';
      default:
        return 'animate-[robot-float_3s_ease-in-out_infinite]';
    }
  };

  return (
    <div 
      ref={robotRef}
      className={`${sizeClasses[size]} relative perspective-1000 ${getAnimationClass()}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Robot Container */}
      <div className="relative w-full h-full transform-gpu">
        
        {/* Head */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full shadow-lg border border-gray-300">
          {/* Visor Screen */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-900 rounded-lg shadow-inner">
            {/* Green Eyes */}
            <div className="absolute top-1 left-1 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-green-400 shadow-lg"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-green-400 shadow-lg"></div>
          </div>
          {/* Head Shine */}
          <div className="absolute top-1 left-2 w-3 h-3 bg-white opacity-60 rounded-full blur-sm"></div>
        </div>

        {/* Body */}
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-10 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-lg border border-gray-300">
          {/* Chest Panel */}
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-gray-800 rounded"></div>
          {/* Body Shine */}
          <div className="absolute top-0.5 left-1 w-2 h-2 bg-white opacity-60 rounded blur-sm"></div>
        </div>

        {/* Left Arm */}
        <div className="absolute top-11 left-1 w-3 h-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full shadow-md border border-gray-300 origin-top transform rotate-12">
          {/* Shoulder Joint */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full"></div>
          {/* Hand */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full"></div>
        </div>

        {/* Right Arm */}
        <div className="absolute top-11 right-1 w-3 h-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full shadow-md border border-gray-300 origin-top transform -rotate-12">
          {/* Shoulder Joint */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full"></div>
          {/* Hand */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full"></div>
        </div>

        {/* Left Leg */}
        <div className="absolute top-16 left-2 w-3 h-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full shadow-md border border-gray-300">
          {/* Hip Joint */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full"></div>
          {/* Foot */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gray-800 rounded-full"></div>
        </div>

        {/* Right Leg */}
        <div className="absolute top-16 right-2 w-3 h-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full shadow-md border border-gray-300">
          {/* Hip Joint */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full"></div>
          {/* Foot */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gray-800 rounded-full"></div>
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 blur-lg animate-pulse"></div>
      </div>
    </div>
  );
};

export default Robot3D;