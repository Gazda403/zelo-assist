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
  green: '#22C55E',   // Success Green
};

// --- Helpers ---
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

// --- Components ---

const Background: React.FC<{ color?: string; intense?: boolean }> = ({ color = B.primary, intense = false }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: B.dark, overflow: 'hidden' }}>
      {/* Dynamic Glow */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: intense ? 1200 : 800,
        height: intense ? 1200 : 800,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}${intense ? '66' : '33'} 0%, transparent 70%)`,
        filter: 'blur(100px)',
        transform: `translate(-50%, -50%) scale(${1 + Math.sin(frame / 30) * 0.1})`,
      }} />
      <AbsoluteFill style={{
        background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.06\'/%3E%3C/svg%3E")',
        opacity: 0.4,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};

const ImpactText: React.FC<{ text: string; size?: number; delay?: number }> = ({ text, size = 100, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14 } });
  
  return (
    <div style={{
      fontFamily: 'Inter, sans-serif',
      fontSize: size,
      fontWeight: 900,
      color: B.white,
      letterSpacing: '-4px',
      lineHeight: 0.95,
      opacity: interpolate(s, [0, 1], [0, 1]),
      transform: `translateY(${interpolate(s, [0, 1], [50, 0])}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
    }}>
      {text}
    </div>
  );
};

// Scene 1: The Hook (0-180)
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const revealS = spring({ frame: frame - 60, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center' }}>
        <ImpactText text="YOUR" size={120} delay={0} />
        <ImpactText text="COMPETITION" size={120} delay={10} />
        
        <div style={{
          marginTop: 40,
          opacity: interpolate(revealS, [0, 1], [0, 1]),
          transform: `scale(${interpolate(revealS, [0, 1], [0.5, 1])})`,
        }}>
          <span style={{
            fontFamily: 'Inter', fontSize: 130, fontWeight: 900,
            background: `linear-gradient(90deg, ${B.primary}, ${B.accent})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-5px',
          }}>
            IS SLEEPING.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: The Problem (180-360)
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Rapidly increasing number
  const unreadCount = Math.floor(interpolate(frame, [0, 120], [12, 4021], { extrapolateRight: 'clamp' }));
  const isMaxed = unreadCount >= 4021;
  
  // Shake effect when maxed
  const shakeX = isMaxed ? Math.sin(frame * 2) * 8 : 0;
  const shakeY = isMaxed ? Math.cos(frame * 3) * 8 : 0;
  
  const vignetteOp = interpolate(frame, [60, 120], [0, 0.8], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <AbsoluteFill style={{
        background: `radial-gradient(circle, transparent 30%, ${B.red}66 100%)`,
        opacity: vignetteOp,
      }} />
      
      <div style={{ transform: `translate(${shakeX}px, ${shakeY}px)`, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Inter', fontSize: 40, color: B.muted, fontWeight: 700, letterSpacing: 4, marginBottom: 20 }}>
          UNREAD MESSAGES
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 200,
          fontWeight: 900,
          color: isMaxed ? B.red : B.white,
          textShadow: isMaxed ? `0 0 60px ${B.red}` : 'none',
          lineHeight: 1,
        }}>
          {unreadCount.toLocaleString()}
        </div>
        
        {isMaxed && (
          <div style={{
            marginTop: 60,
            fontFamily: 'Inter', fontSize: 60, fontWeight: 900, color: B.white,
            background: B.red, padding: '20px 60px', borderRadius: 20,
            transform: `scale(${1 + Math.sin(frame) * 0.05})`
          }}>
            SYSTEM OVERLOAD
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: The Solution (360-540)
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const toggleS = spring({ frame: frame - 30, fps, config: { damping: 14 } });
  const isToggled = toggleS > 0.5;

  const bgSweep = interpolate(toggleS, [0, 1], [-100, 100]);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {/* Flash on toggle */}
      <div style={{
        position: 'absolute', inset: 0,
        background: B.white,
        opacity: interpolate(toggleS, [0.4, 0.5, 0.8], [0, 1, 0], { extrapolateRight: 'clamp' }),
        zIndex: 10, pointerEvents: 'none'
      }} />

      {isToggled && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, ${B.primary}22, ${B.accent}22)`,
          transform: `translateX(${bgSweep}%)`,
        }} />
      )}

      <div style={{ textAlign: 'center', zIndex: 20 }}>
        <h2 style={{
          fontFamily: 'Inter', fontSize: 80, fontWeight: 900,
          color: isToggled ? B.primary : B.muted,
          marginBottom: 60, transition: 'color 0.1s'
        }}>
          {isToggled ? "AI AUTOPILOT: ON" : "MANUAL MODE"}
        </h2>

        {/* Massive Toggle Switch */}
        <div style={{
          width: 400, height: 160, borderRadius: 100,
          background: isToggled ? `linear-gradient(90deg, ${B.primary}, ${B.accent})` : 'rgba(255,255,255,0.1)',
          border: `4px solid ${isToggled ? 'transparent' : 'rgba(255,255,255,0.2)'}`,
          position: 'relative', margin: '0 auto',
          boxShadow: isToggled ? `0 0 100px ${B.primary}88` : 'none',
        }}>
          <div style={{
            position: 'absolute',
            top: 10, left: 10,
            width: 132, height: 132, borderRadius: '50%',
            background: B.white,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            transform: `translateX(${interpolate(toggleS, [0, 1], [0, 240])}px)`,
          }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 4: The Feature (540-720)
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardS = spring({ frame, fps, config: { damping: 14 } });
  
  // Typing effect
  const fullText = "Hey Sarah,\n\nThanks for reaching out! I've reviewed the deck and I'm very interested. Let's schedule a call for next Tuesday.\n\nBest,\nAlex";
  const charsToShow = Math.floor(interpolate(frame, [30, 130], [0, fullText.length], { extrapolateRight: 'clamp' }));
  const typedText = fullText.slice(0, charsToShow);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 60px' }}>
      
      <ImpactText text="0.2 SECONDS." size={110} delay={0} />
      <div style={{ fontFamily: 'Inter', fontSize: 40, color: B.accent, fontWeight: 700, marginTop: 10, opacity: interpolate(cardS, [0, 1], [0, 1]) }}>
        PERFECT DRAFTS. EVERY TIME.
      </div>

      <div style={{
        marginTop: 60,
        width: '100%',
        maxWidth: 800,
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: `1px solid rgba(255,255,255,0.15)`,
        borderRadius: 30,
        padding: '40px',
        transform: `translateY(${interpolate(cardS, [0, 1], [100, 0])}px)`,
        opacity: cardS,
        boxShadow: `0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 30 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: B.primary, boxShadow: `0 0 20px ${B.primary}` }} />
          <div style={{ fontFamily: 'Inter', fontSize: 24, fontWeight: 700, color: B.white }}>AI Generating...</div>
        </div>
        
        <div style={{
          fontFamily: 'Inter', fontSize: 32, color: B.muted, lineHeight: 1.6,
          whiteSpace: 'pre-wrap', minHeight: 250,
        }}>
          {typedText}
          <span style={{ opacity: frame % 10 > 5 ? 1 : 0, color: B.primary }}>|</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 5: The Outro (720-900)
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame, fps, config: { damping: 12, mass: 0.8 } });
  const pulse = 1 + Math.sin(frame / 8) * 0.03;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <div style={{ transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Inter', fontSize: 110, fontWeight: 900, color: B.white, lineHeight: 1, letterSpacing: '-4px' }}>
          GET THE<br/>
          <span style={{ background: `linear-gradient(90deg, ${B.primary}, ${B.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            UNFAIR ADVANTAGE.
          </span>
        </h2>

        <div style={{
          marginTop: 80,
          padding: '35px 80px',
          background: B.white,
          borderRadius: 100,
          color: B.dark,
          fontSize: 42,
          fontWeight: 900,
          boxShadow: `0 0 80px ${B.white}66`,
          transform: `scale(${pulse})`,
        }}>
          START FOR FREE
        </div>

        <div style={{ marginTop: 40, fontSize: 28, color: B.muted, letterSpacing: 6, fontWeight: 700 }}>
          XELOFLOW.COM
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const VisionAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: B.dark }}>
      
      <Sequence from={0} durationInFrames={180}>
        <Background color={B.primary} />
        <Scene1 />
      </Sequence>

      <Sequence from={180} durationInFrames={180}>
        <Background color={B.red} intense />
        <Scene2 />
      </Sequence>

      <Sequence from={360} durationInFrames={180}>
        <Background color={B.accent} />
        <Scene3 />
      </Sequence>

      <Sequence from={540} durationInFrames={180}>
        <Background color={B.primary} />
        <Scene4 />
      </Sequence>

      <Sequence from={720} durationInFrames={180}>
        <Background color={B.accent} intense />
        <Scene5 />
      </Sequence>
    </AbsoluteFill>
  );
};
