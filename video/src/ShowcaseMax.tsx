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

// ─── Brand ────────────────────────────────────────────────────────────────────
const B = {
  primary: '#FF7F11', // Bright Orange
  accent:  '#A182EE', // Soft Purple
  dark:    '#05050A', // Deepest black-blue
  white:   '#FFFFFF',
  muted:   'rgba(255,255,255,0.4)',
};

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

// ─── Background ───────────────────────────────────────────────────────────────
const SpotlightBg: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: B.dark, overflow: 'hidden' }}>
      {/* Top ambient sweep */}
      <div style={{
        position: 'absolute',
        left: '20%', top: '-20%',
        width: '60%', height: '60%',
        background: `radial-gradient(ellipse, ${B.primary}33 0%, transparent 70%)`,
        filter: 'blur(80px)',
        transform: `rotate(${frame * 0.1}deg) scale(${1 + Math.sin(frame/40)*0.1})`,
      }} />
      {/* Bottom ambient sweep */}
      <div style={{
        position: 'absolute',
        right: '10%', bottom: '-20%',
        width: '60%', height: '60%',
        background: `radial-gradient(ellipse, ${B.accent}22 0%, transparent 70%)`,
        filter: 'blur(80px)',
        transform: `rotate(${-frame * 0.1}deg)`,
      }} />
      {/* Heavy Vignette */}
      <AbsoluteFill style={{
        background: 'radial-gradient(circle at center, transparent 30%, rgba(5,5,10,0.95) 100%)',
      }} />
    </AbsoluteFill>
  );
};

// ─── SCENE 1: The Problem (0-2s) ──────────────────────────────────────────────
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Email is broken." drops in, stays, slides up
  const text1Op = interpolate(frame, [0, 10, 80, 100], [0, 1, 1, 0]);
  const text1S  = interpolate(spring({ frame, fps, config: { damping: 14 } }), [0, 1], [0.8, 1]);
  const text1Y  = interpolate(spring({ frame: frame - 40, fps, config: { damping: 14 } }), [0, 1], [0, -80]);

  // "We fixed it." comes in below it
  const text2S  = spring({ frame: frame - 50, fps, config: { damping: 12, stiffness: 100 } });
  const text2Op = interpolate(frame, [100, 120], [1, 0]);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {/* Text 1 */}
      <h1 style={{
        position: 'absolute',
        fontFamily: 'Inter', fontSize: 110, fontWeight: 900,
        color: B.white, letterSpacing: '-4px', margin: 0,
        opacity: text1Op, transform: `translateY(${text1Y}px) scale(${text1S})`,
      }}>
        Email is broken.
      </h1>

      {/* Text 2 */}
      <h1 style={{
        position: 'absolute',
        fontFamily: 'Inter', fontSize: 130, fontWeight: 900,
        letterSpacing: '-5px', margin: 0,
        background: `linear-gradient(135deg, ${B.primary}, ${B.accent})`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        opacity: text2Op,
        transform: `translateY(${interpolate(text2S, [0,1], [80, 40])}px) scale(${interpolate(text2S, [0,1], [0.8, 1])})`,
      }}>
        We fixed it.
      </h1>
    </AbsoluteFill>
  );
};

// ─── SCENE 2: The App Hero Reveal (2-5s) ──────────────────────────────────────
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // App window swings up in 3D perspective
  const appS = spring({ frame, fps, config: { damping: 14, stiffness: 60 } });
  
  // Continuous smooth rotation for that premium showcase feel
  const rotX = interpolate(appS, [0, 1], [40, 10]) + Math.sin(frame/40)*2;
  const rotY = interpolate(appS, [0, 1], [-20, -5]) + Math.cos(frame/50)*2;
  const yPos = interpolate(appS, [0, 1], [400, 0]);
  const scale = interpolate(appS, [0, 1], [0.5, 0.95]);

  // Light sweep across the glass
  const sweepX = interpolate(frame, [20, 80], [-100, 200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const exitOp = interpolate(frame, [160, 180], [1, 0]);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', perspective: 1500, opacity: exitOp }}>
      <div style={{
        width: 1100, height: 700,
        transform: `translateY(${yPos}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`,
        transformStyle: 'preserve-3d',
      }}>
        {/* Main App Glass Layer */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 24,
          boxShadow: `0 50px 100px rgba(0,0,0,0.8), inset 0 2px 2px rgba(255,255,255,0.2), 0 0 60px ${B.primary}22`,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{ height: 60, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, zIndex: 10, background: 'rgba(10,10,20,0.8)', backdropFilter: 'blur(10px)' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#FF5F57' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#28C840' }} />
            <div style={{ marginLeft: 20, fontFamily: 'Inter', color: B.white, fontWeight: 700, fontSize: 16 }}>Xelo Flow</div>
          </div>
          
          {/* Body Video Component */}
          <div style={{ flex: 1, position: 'relative', background: '#000' }}>
            <video 
              src={staticFile('0414_fixed.mp4')} 
              autoPlay 
              loop 
              muted 
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          {/* Light sweep effect overlay */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: 0, width: '150%',
            background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.15) 50%, transparent 80%)',
            transform: `translateX(${sweepX}%)`,
            pointerEvents: 'none',
            zIndex: 20
          }} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── SCENE 3: Feature Callouts (5-8s) ─────────────────────────────────────────
// Three rapid zooms into specific features
const FeatureZoom: React.FC<{ frame: number; fps: number; title: string; subtitle: string; icon: string; color: string; offsetFrame: number }> = ({ frame, fps, title, subtitle, icon, color, offsetFrame }) => {
  const localTime = frame - offsetFrame;
  if (localTime < 0 || localTime > 60) return null;

  const inS = spring({ frame: localTime, fps, config: { damping: 14, stiffness: 100 } });
  const outOp = interpolate(localTime, [50, 60], [1, 0]);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: outOp }}>
      <div style={{
        transform: `scale(${interpolate(inS, [0, 1], [0.5, 1])}) translateY(${interpolate(inS, [0,1], [100, 0])}px)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <div style={{
          width: 140, height: 140, borderRadius: 40,
          background: `linear-gradient(135deg, ${color}33, ${color}00)`,
          border: `2px solid ${color}88`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 80px ${color}44`,
          marginBottom: 40,
        }}>
          {/* Mock icon using CSS/emoji for speed, but styled geometrically */}
          <span style={{ fontSize: 60, textShadow: `0 0 20px ${color}` }}>{icon}</span>
        </div>
        <h2 style={{ fontFamily: 'Inter', fontSize: 80, fontWeight: 900, color: B.white, margin: 0, letterSpacing: '-2px' }}>{title}</h2>
        <p style={{ fontFamily: 'Inter', fontSize: 32, color: B.muted, margin: '16px 0 0' }}>{subtitle}</p>
      </div>
    </AbsoluteFill>
  );
}

const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <FeatureZoom frame={frame} fps={fps} offsetFrame={0} title="AI Drafts." subtitle="Replies written in your exact tone." icon="⚡" color={B.primary} />
      <FeatureZoom frame={frame} fps={fps} offsetFrame={60} title="Priority Sort." subtitle="Signal automatically separated from noise." icon="🎯" color={B.accent} />
      <FeatureZoom frame={frame} fps={fps} offsetFrame={120} title="Auto-Pilot." subtitle="Routine threads handled without you." icon="🤖" color="#22C55E" />
    </AbsoluteFill>
  );
};

// ─── SCENE 4: Outro Lockup (8-10s) ────────────────────────────────────────────
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleS = spring({ frame, fps, config: { damping: 14 } });
  const ctaS   = spring({ frame: frame - 20, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{
        fontFamily: 'Inter', fontSize: 100, fontWeight: 900, color: B.white,
        letterSpacing: '-3px', margin: 0, textAlign: 'center', lineHeight: 1.1,
        opacity: titleS, transform: `translateY(${interpolate(titleS, [0,1], [40, 0])}px)`,
      }}>
        Don't just manage email.<br />
        <span style={{
          background: `linear-gradient(90deg, ${B.primary}, ${B.accent})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Conquer it.</span>
      </h1>

      {/* Button */}
      <div style={{
        marginTop: 60,
        padding: '28px 80px',
        background: `linear-gradient(135deg, ${B.primary}, ${B.accent})`,
        borderRadius: 100,
        fontFamily: 'Inter', fontSize: 32, fontWeight: 800, color: B.white,
        boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 60px ${B.primary}55`,
        opacity: ctaS, transform: `scale(${interpolate(ctaS, [0,1], [0.8, 1])})`,
      }}>
        XELOFLOW.COM
      </div>
    </AbsoluteFill>
  );
};

// ─── MAIN COMPOSITION (10 seconds = 600 frames) ───────────────────────────────
export const ShowcaseMax: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio 
        src={staticFile('promo_music.mp3')} 
        volume={(f) => interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })}
      />
      
      <SpotlightBg />
      <Sequence from={0}   durationInFrames={120}><Scene1 /></Sequence>
      <Sequence from={120} durationInFrames={180}><Scene2 /></Sequence>
      <Sequence from={300} durationInFrames={180}><Scene3 /></Sequence>
      <Sequence from={480} durationInFrames={120}><Scene4 /></Sequence>
    </AbsoluteFill>
  );
};
