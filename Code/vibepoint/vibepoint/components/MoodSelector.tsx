'use client';

import { useState, useRef, useEffect } from 'react';
import { MoodCoordinates } from '@/types';

interface MoodSelectorProps {
  onMoodSelect?: (coordinates: MoodCoordinates) => void;
  onColorChange?: (color: string) => void;
  selectedMood?: MoodCoordinates;
  showStats?: boolean;
  showHeader?: boolean;
  className?: string;
  gradientClassName?: string;
}

const MoodSelector = ({ 
  onMoodSelect, 
  onColorChange,
  selectedMood, 
  showStats = true, 
  showHeader = true,
  className = '',
  gradientClassName = ''
}: MoodSelectorProps) => {
  const [internalMood, setInternalMood] = useState<MoodCoordinates | null>(selectedMood || { x: 0.5, y: 0.5 });
  const currentMood = selectedMood !== undefined ? selectedMood : internalMood;
  const [happiness, setHappiness] = useState(currentMood ? currentMood.y : 0.5);
  const [motivation, setMotivation] = useState(currentMood ? currentMood.x : 0.5);
  const [selectedColor, setSelectedColor] = useState('#1A1A2E');
  
  // Hidden canvas for color sampling
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Sample exact color from the gradient image
  const sampleColorFromCanvas = (x: number, y: number, skipImageLoadedCheck = false): string => {
    if (!canvasRef.current) return '#1A1A2E';
    if (!skipImageLoadedCheck && !imageLoaded) return '#1A1A2E';
    
    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    if (!ctx) return '#1A1A2E';
    
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    if (width === 0 || height === 0) return '#1A1A2E';
    // Convert normalized coordinates to pixel coordinates
    const px = Math.min(Math.floor(x * width), width - 1);
    const py = Math.min(Math.floor(y * height), height - 1);
    
    // Get pixel color
    const pixel = ctx.getImageData(px, py, 1, 1).data;
    return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  };

  // Load gradient image into hidden canvas for pixel sampling
  useEffect(() => {
    const img = new window.Image();
    img.src = '/emotion_gradient.png';
    
    img.onload = () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvasRef.current.width = img.width;
          canvasRef.current.height = img.height;
          ctx.drawImage(img, 0, 0);
          setImageLoaded(true);
          
          // Set initial color - skip imageLoaded check since we just loaded it
          if (currentMood) {
            const initialColor = sampleColorFromCanvas(currentMood.x, 1 - currentMood.y, true);
            setSelectedColor(initialColor);
            onColorChange?.(initialColor);
          } else {
            const initialColor = sampleColorFromCanvas(0.5, 0.5, true);
            setSelectedColor(initialColor);
            onColorChange?.(initialColor);
          }
        }
      }
    };
    
    img.onerror = () => {
      console.error('Failed to load emotion gradient image');
      setSelectedColor('#1A1A2E');
      onColorChange?.('#1A1A2E');
    };
  }, [currentMood, onColorChange]);

  // Sync internal state when selectedMood prop changes
  useEffect(() => {
    if (currentMood && imageLoaded) {
      setHappiness(currentMood.y);
      setMotivation(currentMood.x);
      const color = sampleColorFromCanvas(currentMood.x, 1 - currentMood.y);
      setSelectedColor(color);
      onColorChange?.(color);
    }
  }, [currentMood?.x, currentMood?.y, imageLoaded]);

  const handleGradientClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setHasInteracted(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Happiness increases from bottom to top (inverted Y)
    const happinessValue = 1 - y;
    // Motivation increases from left to right
    const motivationValue = x;
    
    setMotivation(motivationValue);
    setHappiness(happinessValue);
    
    // Sample exact color from gradient image
    const color = sampleColorFromCanvas(x, y);
    setSelectedColor(color);
    onColorChange?.(color);
    
    // Call onMoodSelect callback
    const mood = { x: motivationValue, y: happinessValue };
    if (selectedMood === undefined) {
      setInternalMood(mood);
    }
    onMoodSelect?.(mood);
  };

  // Handle dragging
  const [isDragging, setIsDragging] = useState(false);
  const handleMouseDown = () => {
    setHasInteracted(true);
    setIsDragging(true);
  };
  const handleMouseUp = () => setIsDragging(false);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleGradientClick(e);
  };

  return (
    <div className={`w-full ${showHeader ? 'max-w-2xl mx-auto px-4 py-8' : ''} ${className}`}>
      {showHeader && (
        <div className="mb-8">
          <h1 className="text-2xl font-light text-center mb-8 text-gray-600 tracking-wide">
            INTUITIVE MOOD MAPPING
          </h1>
        </div>
      )}
      
      <div className="max-w-2xl mx-auto">
        {/* HAPPINESS label - top center */}
        <div className="text-center text-sm text-gray-400 mb-3 tracking-wider">
          HAPPINESS
        </div>
        
        <div className="relative mb-3 flex justify-center items-center">
          {/* Container for gradient - 76.5% width (85% * 0.9) */}
          <div className="relative" style={{ width: '76.5%' }}>
            {/* MOTIVATION label - left side, vertically centered */}
            <div 
              className="absolute top-1/2 text-xs text-gray-400 tracking-wider whitespace-nowrap z-30 pointer-events-none"
              style={{ 
                right: '100%',
                marginRight: '12px',
                transform: 'translateY(-50%)'
              }}
            >
              MOTIVATION
            </div>
            
            {/* MOTIVATION label - right side, vertically centered */}
            <div 
              className="absolute top-1/2 text-xs text-gray-400 tracking-wider whitespace-nowrap z-30 pointer-events-none"
              style={{ 
                left: '100%',
                marginLeft: '12px',
                transform: 'translateY(-50%)'
              }}
            >
              MOTIVATION
            </div>
            {/* Gradient frame border - outer decorative border */}
            <div 
              className="absolute inset-0 rounded-[40px] p-[2px] z-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #F97316 100%)'
              }}
            >
              <div className="w-full h-full rounded-[38px] bg-transparent" />
            </div>
            
            {/* Gradient Image - Using CSS background-image */}
            <div 
              className={`relative w-full aspect-square rounded-[40px] overflow-hidden cursor-crosshair shadow-lg ${gradientClassName}`}
              style={{
                backgroundImage: 'url(/emotion_gradient.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                zIndex: 5
              }}
            onClick={handleGradientClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
          >
              {/* Percentage overlays - simplified to 0% and 100% at edges */}
              {/* Top center - 100% (happy) */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-white/60 font-medium pointer-events-none z-10" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                100%
              </div>
              
              {/* Bottom center - 0% (unhappy) */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-white/60 font-medium pointer-events-none z-10" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                0%
              </div>
              
              {/* Left center - 0% (unmotivated) */}
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-white/60 font-medium pointer-events-none z-10" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                0%
              </div>
              
              {/* Right center - 100% (motivated) */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-white/60 font-medium pointer-events-none z-10" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                100%
              </div>
              
              {/* Tap anywhere instruction - above center, disappears on interaction */}
              {!hasInteracted && (
                <div 
                  className="absolute top-[25%] left-1/2 transform -translate-x-1/2 text-center pointer-events-none"
                  style={{ 
                    zIndex: 15,
                    textShadow: '0 2px 4px rgba(0,0,0,0.7)',
                    transition: 'opacity 0.3s ease-out'
                  }}
                >
                  <p className="text-sm font-medium text-white/90 leading-tight">
                    Drag the selector anywhere<br />to capture your current state
                  </p>
                </div>
              )}
            </div>
          
            {/* Mood marker */}
            {currentMood && (
              <div
                className="absolute w-8 h-8 rounded-full border-4 border-white shadow-lg pointer-events-none z-20"
                style={{
                  left: `${currentMood.x * 100}%`,
                  top: `${(1 - currentMood.y) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              >
                <div className="w-full h-full rounded-full bg-white opacity-60" />
              </div>
            )}
          </div>
        </div>
        
        {/* HAPPINESS label - bottom center */}
        <div className="text-center text-sm text-gray-400 mb-8 tracking-wider">
          HAPPINESS
        </div>
        
        {showStats && currentMood && (
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1 tracking-wider">HAPPINESS</div>
              <div 
                className="text-[56px] font-semibold leading-none tracking-tight transition-colors duration-300"
                style={{ 
                  fontFamily: 'Outfit, sans-serif',
                  color: selectedColor,
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}
              >
                {Math.round((currentMood?.y || 0) * 100)}%
              </div>
            </div>
            
            <div className="text-2xl text-gray-300">•</div>
            
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1 tracking-wider">MOTIVATION</div>
              <div 
                className="text-[56px] font-semibold leading-none tracking-tight transition-colors duration-300"
                style={{ 
                  fontFamily: 'Outfit, sans-serif',
                  color: selectedColor,
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}
              >
                {Math.round((currentMood?.x || 0) * 100)}%
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden canvas for color sampling */}
      <canvas ref={canvasRef} className="hidden" />
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default MoodSelector;
