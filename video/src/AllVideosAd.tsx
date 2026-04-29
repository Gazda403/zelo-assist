import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
  Video,
  Audio,
  staticFile,
} from 'remotion';

// Brand colors
const B = {
  primary: '#FF7F11', // Bright Orange
  accent:  '#A182EE', // Soft Purple
  dark:    '#05050A', // Deepest black-blue
  white:   '#FFFFFF',
};

const VideoClip: React.FC<{ src: string; duration: number }> = ({ src, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const scale = interpolate(frame, [0, duration], [1.05, 1.2], {
    easing: Easing.out(Easing.quad),
  });

  const opacity = interpolate(frame, [0, 10, duration - 10, duration], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: B.dark, opacity }}>
      <Video
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};

const OverlayText: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spr = spring({ frame: frame - delay, fps, config: { damping: 12 } });
  
  const opacity = interpolate(spr, [0, 1], [0, 1]);
  const translateY = interpolate(spr, [0, 1], [40, 0]);

  return (
    <div style={{
      position: 'absolute',
      bottom: '15%',
      left: '10%',
      right: '10%',
      fontFamily: 'Inter, sans-serif',
      fontSize: 80,
      fontWeight: 900,
      color: B.white,
      textAlign: 'center',
      textShadow: '0 10px 30px rgba(0,0,0,0.8)',
      opacity,
      transform: `translateY(${translateY}px)`,
      zIndex: 100,
      lineHeight: 1.1,
    }}>
      {text}
    </div>
  );
};

export const AllVideosAd: React.FC = () => {
  const clips = [
    { src: 'vid1.mp4', text: 'Tired of Email Chaos?' },
    { src: 'vid2.mp4', text: 'Meet XeloFlow AI' },
    { src: 'vid3.mp4', text: 'Handles your Inbox' },
    { src: 'vid4.mp4', text: 'Drafts perfect replies' },
    { src: 'vid5.mp4', text: 'Automates the routine' },
    { src: 'vid6.mp4', text: 'Get your time back' },
  ];

  const clipDuration = 90; // 1.5 seconds per clip at 60fps
  const totalClipsDuration = clips.length * clipDuration;
  const outroDuration = 120;
  
  return (
    <AbsoluteFill style={{ backgroundColor: B.dark }}>
      <Audio src={staticFile('promo_music.mp3')} volume={0.5} />
      
      {clips.map((clip, i) => (
        <Sequence key={i} from={i * clipDuration} durationInFrames={clipDuration + 15}>
          <VideoClip src={clip.src} duration={clipDuration + 15} />
          <OverlayText text={clip.text} delay={10} />
        </Sequence>
      ))}

      {/* Outro */}
      <Sequence from={totalClipsDuration} durationInFrames={outroDuration}>
        <AbsoluteFill style={{ 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: B.dark,
          background: `radial-gradient(circle at center, #1a1a2e 0%, ${B.dark} 100%)`
        }}>
          <div style={{
            fontSize: 120,
            fontWeight: 900,
            color: B.white,
            fontFamily: 'Inter, sans-serif',
            textAlign: 'center',
            marginBottom: 40,
            letterSpacing: '-4px'
          }}>
            XELO <span style={{ color: B.primary }}>FLOW</span>
          </div>
          <div style={{
            fontSize: 40,
            color: B.white,
            opacity: 0.8,
            fontFamily: 'Inter, sans-serif',
            marginBottom: 80,
            fontWeight: 500
          }}>
            Your AI Inbox Assistant
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${B.primary}, ${B.accent})`,
            padding: '24px 80px',
            borderRadius: 100,
            fontSize: 48,
            fontWeight: 800,
            color: B.white,
            boxShadow: `0 20px 50px ${B.primary}66`,
            cursor: 'pointer'
          }}>
            START NOW ⚡
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
