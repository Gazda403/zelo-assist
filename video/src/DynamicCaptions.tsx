import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';

interface CaptionsProps {
  text: string;
  startFrame: number;
  durationInFrames: number;
  color?: string;
  fontSize?: number;
}

export const DynamicCaptions: React.FC<CaptionsProps> = ({
  text,
  startFrame,
  durationInFrames,
  color = '#FFFFFF',
  fontSize = 90,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0 || relativeFrame > durationInFrames) return null;

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      pointerEvents: 'none',
      top: '20%', // Positioned slightly lower for better visibility
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: '0 100px',
        textAlign: 'center',
      }}>
        {words.map((word, i) => {
          const wordDelay = i * 4; // Reveal each word with a slight delay
          const wordFrame = relativeFrame - wordDelay;
          
          if (wordFrame < 0) return null;

          const s = spring({
            frame: wordFrame,
            fps,
            config: { damping: 12, stiffness: 100, mass: 0.5 },
          });

          const scale = interpolate(s, [0, 1], [0.5, 1]);
          const opacity = interpolate(s, [0, 1], [0, 1]);
          const rotate = interpolate(s, [0, 1], [-10, 0]);

          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 900,
                fontSize,
                color,
                marginRight: '0.3em',
                textShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.2)',
                transform: `scale(${scale}) rotate(${rotate}deg)`,
                opacity,
                textTransform: 'uppercase',
                letterSpacing: '-2px',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
