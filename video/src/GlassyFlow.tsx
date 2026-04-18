import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const GlassyFlow: React.FC<{ color1: string; color2: string; bgColor: string }> = ({ color1, color2, bgColor }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const progress = frame / durationInFrames;
  const time = progress * Math.PI * 2;

  // --- 1. Floating Blobs (The "Glassy" Gradient) ---
  const blobs = [
    { color: color1, size: '70%', initialPos: { x: 20, y: 10 }, speed: 1 },
    { color: color2, size: '80%', initialPos: { x: 70, y: 60 }, speed: 1.2 },
    { color: '#56CCF2', size: '50%', initialPos: { x: 10, y: 80 }, speed: 0.8 }, // Subtle blue accent
  ].map((blob, i) => {
    // Smooth orbit motion
    const moveX = Math.sin(time * blob.speed) * 10;
    const moveY = Math.cos(time * blob.speed) * 10;

    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: blob.size,
          height: blob.size,
          left: `${blob.initialPos.x + moveX}%`,
          top: `${blob.initialPos.y + moveY}%`,
          background: `radial-gradient(circle, ${blob.color}44 0%, transparent 70%)`,
          filter: 'blur(120px)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
        }}
      />
    );
  });

  // --- 2. Flowing Lines (The "Moving Thingy") ---
  const numLines = 25;
  const pointsPerLine = 50;
  const lines = Array.from({ length: numLines }).map((_, lineIndex) => {
    const isPrimaryColor = lineIndex % 2 === 0;
    const strokeColor = isPrimaryColor ? color1 : color2;
    const yOffset = (lineIndex - numLines / 2) * 8; 
    const phaseOffset = lineIndex * 0.2;

    let d = '';
    for (let i = 0; i < pointsPerLine; i++) {
      const xProgress = i / (pointsPerLine - 1);
      const x = xProgress * width;

      const wave1 = Math.sin((xProgress * Math.PI * 2) + time + phaseOffset) * 120;
      const wave2 = Math.cos((xProgress * Math.PI * 4) - time * 1.2) * 60;
      const pinch = Math.sin(xProgress * Math.PI); 
      const baseCurve = height * 0.75 - xProgress * (height * 0.3);
      const y = baseCurve + (wave1 + wave2) * pinch + yOffset;

      if (i === 0) d += `M ${x} ${y} `;
      else d += `L ${x} ${y} `;
    }

    return (
      <path
        key={lineIndex}
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        opacity={0.4}
      />
    );
  });

  return (
    <div style={{ flex: 1, backgroundColor: bgColor, position: 'relative', overflow: 'hidden' }}>
      {/* Background Blobs */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {blobs}
      </div>

      {/* SVG for Grid and Lines */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <defs>
          <pattern id="dotGrid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#000" opacity="0.1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" />
        <g>{lines}</g>
      </svg>
      
      {/* Glassy Overlay for extra "frosted" look */}
      <div style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          pointerEvents: 'none',
          zIndex: 2,
      }} />
    </div>
  );
};
