import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const AbstractLines: React.FC<{ color1: string; color2: string; bgColor: string }> = ({ color1, color2, bgColor }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  // Progress from 0 to 1
  const progress = frame / durationInFrames;
  // Multiply by 2 PI for a perfect loop over the duration
  const time = progress * Math.PI * 2;

  const numLines = 30; // How many string lines
  const pointsPerLine = 60; // Resolution of the curve

  const lines = Array.from({ length: numLines }).map((_, lineIndex) => {
    // Determine color based on index (half orange, half purple)
    const isPrimaryColor = lineIndex % 2 === 0;
    const strokeColor = isPrimaryColor ? color1 : color2;

    // Slight variance per line
    const yOffset = (lineIndex - numLines / 2) * 5; 
    const phaseOffset = lineIndex * 0.15;
    const amplitudeMultiplier = 1 + lineIndex * 0.02;

    let d = '';
    for (let i = 0; i < pointsPerLine; i++) {
      const xProgress = i / (pointsPerLine - 1);
      const x = xProgress * width;

      // Complex organic math combining multiple sine waves
      // The `time` variable drives the looping animation
      const wave1 = Math.sin((xProgress * Math.PI * 2) + time + phaseOffset) * 150 * amplitudeMultiplier;
      const wave2 = Math.cos((xProgress * Math.PI * 4) - time * 1.5) * 80;
      
      // We pinch the ends to keep them relatively stable, and expand the middle
      const pinch = Math.sin(xProgress * Math.PI); 

      // Swoop the base path upward from bottom-left to mid-right
      const baseCurve = height * 0.8 - xProgress * (height * 0.4);

      const y = baseCurve + (wave1 + wave2) * pinch + yOffset;

      if (i === 0) {
        d += `M ${x} ${y} `;
      } else {
        d += `L ${x} ${y} `;
      }
    }

    return (
        <path
            key={lineIndex}
            d={d}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1.2}
            // Very soft opacity for a premium, ethereal look
            opacity={0.25} 
        />
    );
  });

  return (
    <div style={{ flex: 1, backgroundColor: bgColor, position: 'relative', overflow: 'hidden' }}>
        
      {/* Mesh Gradient Background Layer */}
      <div style={{
          position: 'absolute',
          inset: 0,
          background: bgColor,
          zIndex: 0,
      }}>
          {/* Top Right Orange Glow */}
          <div style={{
              position: 'absolute',
              top: '-10%',
              right: '-10%',
              width: '60%',
              height: '60%',
              background: `radial-gradient(circle, ${color1}33 0%, transparent 70%)`,
              filter: 'blur(80px)',
          }} />
          
          {/* Bottom Left Purple Glow */}
          <div style={{
              position: 'absolute',
              bottom: '-10%',
              left: '-10%',
              width: '70%',
              height: '70%',
              background: `radial-gradient(circle, ${color2}22 0%, transparent 70%)`,
              filter: 'blur(100px)',
          }} />
      </div>

      {/* Background SVG Canvas */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        
        {/* Dot Grid Pattern */}
        <defs>
          <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#ccc" opacity="0.4" />
          </pattern>
          
          {/* Mask to smoothly fade out the dots from left to right */}
          <linearGradient id="fadeMask" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="30%" stopColor="white" stopOpacity="0.5" />
            <stop offset="70%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Apply Dot Pattern on the left half */}
        <rect width="70%" height="100%" fill="url(#dotPattern)" mask="url(#fadeMask)" />

        {/* Flowing Lines */}
        <g>
           {lines}
        </g>
      </svg>
    </div>
  );
};
