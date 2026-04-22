import React from 'react';
import { AbsoluteFill, Video, staticFile, useVideoConfig } from 'remotion';

export interface VerticalFormatterProps {
  videoSrc: string;
}

export const VerticalFormatter: React.FC<VerticalFormatterProps> = ({ videoSrc = 'formatter_target.mp4' }) => {
  const { width, height } = useVideoConfig();
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#080808' }}>
      {/* ─── Blurred Background ─── */}
      <AbsoluteFill style={{ 
        filter: 'blur(40px) saturate(1.5)', 
        opacity: 0.4,
        transform: 'scale(1.1)' 
      }}>
        <Video
          src={staticFile(videoSrc)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          muted
        />
      </AbsoluteFill>

      {/* ─── Gradient Vignette ─── */}
      <AbsoluteFill style={{
        background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.8) 100%)'
      }} />

      {/* ─── Foreground Video ─── */}
      <AbsoluteFill style={{ 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '24px'
      }}>
        <div style={{
          width: '100%',
          boxShadow: '0 30px 60px rgba(0,0,0,0.7), 0 0 40px rgba(255,255,255,0.05)',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Video
            src={staticFile(videoSrc)}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
