import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';

// --- Brand Guidelines ---
const B = {
  primary: '#FF7F11', // Vibrant Orange
  accent: '#A182EE',  // Vibrant Purple
  dark: '#05050A',    // Deep Dark
  white: '#FFFFFF',
  muted: 'rgba(255,255,255,0.4)',
  red: '#FF4D4D',     // Stress Red
};

// --- Helpers ---
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

// --- Components ---

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: B.dark, overflow: 'hidden' }}>
      {/* Primary Glow */}
      <div style={{
        position: 'absolute',
        left: `${50 + Math.sin(frame / 60) * 10}%`,
        top: `${50 + Math.cos(frame / 80) * 10}%`,
        width: 800,
        height: 800,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${B.primary}40 0%, transparent 70%)`,
        filter: 'blur(80px)',
        transform: 'translate(-50%, -50%)',
      }} />
      {/* Accent Glow */}
      <div style={{
        position: 'absolute',
        left: `${20 + Math.cos(frame / 70) * 15}%`,
        top: `${80 + Math.sin(frame / 90) * 10}%`,
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${B.accent}30 0%, transparent 70%)`,
        filter: 'blur(100px)',
        transform: 'translate(-50%, -50%)',
      }} />
      {/* Cinematic Grain */}
      <AbsoluteFill style={{
        background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
        opacity: 0.3,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};

const GlitchText: React.FC<{ text: string; size?: number; color?: string }> = ({ text, size = 120, color = B.white }) => {
  const frame = useCurrentFrame();
  const shift = Math.sin(frame * 2) * 5;
  const op = frame % 5 === 0 ? 0.8 : 1;

  return (
    <div style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', fontSize: size, fontWeight: 900, color, letterSpacing: '-5px' }}>
      <span style={{ position: 'absolute', top: 0, left: 0, transform: `translateX(${shift}px)`, color: B.primary, opacity: 0.5, mixBlendMode: 'screen' }}>{text}</span>
      <span style={{ position: 'absolute', top: 0, left: 0, transform: `translateX(${-shift}px)`, color: B.accent, opacity: 0.5, mixBlendMode: 'screen' }}>{text}</span>
      <span style={{ position: 'relative', opacity: op }}>{text}</span>
    </div>
  );
};

// Scene 1: The Clock Hook (0-180)
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame, fps, config: { damping: 12 } });
  const scale = interpolate(s, [0, 1], [0.8, 1]);
  const y = interpolate(s, [0, 1], [50, 0]);

  // Countdown timer effect
  const seconds = (15 - (frame / fps)).toFixed(2);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <div style={{ transform: `scale(${scale}) translateY(${y}px)`, textAlign: 'center' }}>
        <GlitchText text="TIME IS" size={140} />
        <GlitchText text="DRAINING." size={160} color={B.primary} />
      </div>
      <div style={{
        marginTop: 60,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 80,
        color: B.white,
        opacity: 0.7,
        textShadow: `0 0 40px ${B.primary}66`,
      }}>
        00:00:{seconds.padStart(5, '0')}
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: The Chaos (180-360)
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame, fps, config: { damping: 14 } });
  const rotate = interpolate(frame, [0, 180], [0, -5]);
  const stressOp = interpolate(frame, [0, 180], [0, 0.6]);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <AbsoluteFill style={{
        background: `radial-gradient(circle, transparent 40%, ${B.red}44 100%)`,
        opacity: stressOp,
      }} />
      <div style={{ transform: `rotate(${rotate}deg) scale(${interpolate(s, [0, 1], [0.9, 1])})`, textAlign: 'center', padding: '0 80px' }}>
        <h2 style={{ fontFamily: 'Inter', fontSize: 100, fontWeight: 900, color: B.white, lineHeight: 0.9, marginBottom: 40 }}>
          STOP<br/>DROWNING<br/>IN EMAIL.
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              height: 100,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              width: '100%',
              backdropFilter: 'blur(10px)',
              transform: `translateX(${i * 20}px)`,
              opacity: interpolate(frame, [i * 20, i * 20 + 30], [0, 1], { extrapolateRight: 'clamp' }),
            }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: The Transformation (360-540)
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sweep = interpolate(frame, [0, 120], [-100, 200]);
  const s = spring({ frame, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {/* Light Sweep */}
      <div style={{
        position: 'absolute',
        width: '200%',
        height: '200%',
        background: `linear-gradient(90deg, transparent, ${B.primary}44, transparent)`,
        transform: `translateX(${sweep}%) rotate(45deg)`,
        pointerEvents: 'none',
      }} />

      <div style={{ transform: `scale(${interpolate(s, [0, 1], [0.5, 1])})`, textAlign: 'center' }}>
        <div style={{
          width: 200, height: 200, borderRadius: 50,
          background: `linear-gradient(135deg, ${B.primary}, ${B.accent})`,
          margin: '0 auto 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 100px ${B.primary}88`,
        }}>
          <span style={{ fontSize: 120 }}>⚡</span>
        </div>
        <h1 style={{
          fontFamily: 'Inter', fontSize: 120, fontWeight: 900, color: B.white,
          letterSpacing: '-6px',
        }}>
          XELO FLOW
        </h1>
      </div>
    </AbsoluteFill>
  );
};

// Scene 4: The Stats (540-720)
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame, fps, config: { damping: 12 } });
  const count = interpolate(frame, [0, 120], [0, 10], { extrapolateRight: 'clamp' }).toFixed(0);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 60px' }}>
      <div style={{ textAlign: 'center', opacity: s, transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)` }}>
        <div style={{
          fontSize: 300, fontWeight: 900, color: B.primary,
          lineHeight: 1, letterSpacing: '-20px',
          textShadow: `0 20px 80px ${B.primary}44`,
        }}>
          {count}H
        </div>
        <div style={{
          fontSize: 60, fontWeight: 800, color: B.white,
          marginTop: -20, opacity: 0.8,
        }}>
          SAVED EVERY WEEK.
        </div>
        <p style={{ fontSize: 32, color: B.muted, marginTop: 40, fontFamily: 'Inter' }}>
          AI handles the drafts.<br/>You handle the growth.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Scene 5: The Outro (720-900)
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame, fps, config: { damping: 10, mass: 0.8 } });
  const pulse = 1 + Math.sin(frame / 10) * 0.05;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <div style={{ transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Inter', fontSize: 120, fontWeight: 900, color: B.white, lineHeight: 0.9, letterSpacing: '-5px' }}>
          ZERO INBOX.<br/>
          <span style={{ background: `linear-gradient(90deg, ${B.primary}, ${B.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            INFINITE SCALE.
          </span>
        </h2>

        <div style={{
          marginTop: 80,
          padding: '40px 100px',
          background: `linear-gradient(135deg, ${B.primary}, ${B.accent})`,
          borderRadius: 100,
          color: B.white,
          fontSize: 48,
          fontWeight: 900,
          boxShadow: `0 20px 80px ${B.primary}66`,
          transform: `scale(${pulse})`,
        }}>
          GET EARLY ACCESS
        </div>

        <div style={{ marginTop: 40, fontSize: 32, color: B.muted, letterSpacing: 4, fontWeight: 700 }}>
          XELOFLOW.COM
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const InspireAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: B.dark }}>
      <Background />
      
      <Sequence from={0} durationInFrames={180}>
        <Scene1 />
      </Sequence>

      <Sequence from={180} durationInFrames={180}>
        <Scene2 />
      </Sequence>

      <Sequence from={360} durationInFrames={180}>
        <Scene3 />
      </Sequence>

      <Sequence from={540} durationInFrames={180}>
        <Scene4 />
      </Sequence>

      <Sequence from={720} durationInFrames={180}>
        <Scene5 />
      </Sequence>
    </AbsoluteFill>
  );
};
