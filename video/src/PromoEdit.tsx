import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Sequence
} from 'remotion';

// --- Brand Colors ---
const BRAND_COLORS = {
  primary: '#FF7F11',
  accent: '#A182EE',
  background: '#FAFAF9',
  dark: '#0f0f1a',
};

export const PromoEdit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = spring({
    frame: frame - 30,
    fps,
    config: { damping: 200 }
  });

  const titleScale = spring({
      frame: frame - 30,
      fps,
      config: { damping: 12, stiffness: 80 }
  });

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {/* Original Video with Filter / Processing */}
      <AbsoluteFill>
        <OffthreadVideo 
          src={staticFile('promo_ad.mp4')} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        
        {/* Recolor / Rebrand Overlays using Mix Blend Modes */}
        {/* Colorize with Primary Brand Color */}
        <AbsoluteFill style={{
          backgroundColor: BRAND_COLORS.primary,
          mixBlendMode: 'color',
          opacity: 0.3
        }} />
        
        {/* Glow/Accent Overlay */}
        <AbsoluteFill style={{
          backgroundColor: BRAND_COLORS.accent,
          mixBlendMode: 'overlay',
          opacity: 0.2
        }} />
      </AbsoluteFill>

      {/* Modern UI Rebranding Overlays */}
      <Sequence from={0}>
          <div style={{
              position: 'absolute',
              top: 50,
              left: 50,
              display: 'flex',
              alignItems: 'center',
              gap: 15,
              opacity: titleOpacity,
          }}>
              {/* Fake XeloFlow Logo */}
              <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: 15,
                  background: `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.accent})`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
              }}>
                  <div style={{ width: 30, height: 30, backgroundColor: 'white', borderRadius: '50%' }} />
              </div>
              <h1 style={{
                  fontSize: 48,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 900,
                  color: 'white',
                  margin: 0,
                  textShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}>
                  XELO FLOW
              </h1>
          </div>
      </Sequence>

      <Sequence from={60}>
          <div style={{
              position: 'absolute',
              bottom: 100,
              left: 50,
              width: '60%',
          }}>
              <h2 style={{
                  fontSize: 72,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 800,
                  color: 'white',
                  margin: 0,
                  lineHeight: 1.1,
                  textShadow: '0 4px 20px rgba(0,0,0,0.6)',
                  transform: `scale(${interpolate(titleScale, [0, 1], [0.9, 1])})`,
                  opacity: titleOpacity
              }}>
                  The AI OS for your Inbox.
              </h2>
              <p style={{
                  fontSize: 32,
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255,255,255,0.9)',
                  marginTop: 20,
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  opacity: Math.max(0, interpolate(frame, [80, 100], [0, 1]))
              }}>
                  Automate replies. Surface priorities. Win your time back.
              </p>
          </div>
      </Sequence>
      
      {/* Progress Bar styled to brand */}
      <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 10,
          width: `${(frame / 600) * 100}%`,
          background: `linear-gradient(to right, ${BRAND_COLORS.primary}, ${BRAND_COLORS.accent})`,
          boxShadow: `0 0 20px ${BRAND_COLORS.primary}`
      }} />
    </AbsoluteFill>
  );
};
