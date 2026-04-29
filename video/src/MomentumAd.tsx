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

const Background: React.FC<{ type?: 'dark' | 'glow' | 'success' }> = ({ type = 'dark' }) => {
  const frame = useCurrentFrame();
  
  let bgColor = B.dark;
  let glowColor1 = 'transparent';
  let glowColor2 = 'transparent';

  if (type === 'glow') {
    glowColor1 = `${B.primary}22`;
    glowColor2 = `${B.accent}22`;
  } else if (type === 'success') {
    glowColor1 = `${B.green}22`;
    glowColor2 = `${B.primary}11`;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', left: '20%', top: '30%', width: 800, height: 800,
        background: `radial-gradient(circle, ${glowColor1} 0%, transparent 60%)`,
        filter: 'blur(100px)', transform: `translate(-50%, -50%) scale(${1 + Math.sin(frame / 40) * 0.2})`,
      }} />
      <div style={{
        position: 'absolute', left: '80%', top: '70%', width: 800, height: 800,
        background: `radial-gradient(circle, ${glowColor2} 0%, transparent 60%)`,
        filter: 'blur(100px)', transform: `translate(-50%, -50%) scale(${1 + Math.cos(frame / 50) * 0.2})`,
      }} />
      {/* Noise */}
      <AbsoluteFill style={{
        background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.06\'/%3E%3C/svg%3E")',
        opacity: 0.3, pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};

// Scene 1: The Hook (0-180)
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const text1S = spring({ frame, fps, config: { damping: 14 } });
  const text2S = spring({ frame: frame - 60, fps, config: { damping: 10, mass: 1.5 } });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Inter', fontSize: 100, fontWeight: 900, color: B.white,
          letterSpacing: '-4px', opacity: interpolate(text1S, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(text1S, [0, 1], [40, 0])}px)`,
        }}>
          YOU ARE A FOUNDER.
        </div>
        
        <div style={{
          fontFamily: 'Inter', fontSize: 120, fontWeight: 900,
          color: B.red, letterSpacing: '-5px', marginTop: 20,
          opacity: interpolate(text2S, [0, 1], [0, 1]),
          transform: `scale(${interpolate(text2S, [0, 1], [2, 1])})`,
          textShadow: `0 0 40px ${B.red}88`,
        }}>
          NOT A RECEPTIONIST.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: The Cost (180-360)
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Rapid money counter
  const cost = interpolate(frame, [0, 150], [0, 14500], { extrapolateRight: 'clamp' });
  const isHigh = cost > 10000;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', zIndex: 10 }}>
        <div style={{ fontFamily: 'Inter', fontSize: 40, color: B.muted, fontWeight: 700, letterSpacing: 4 }}>
          LOST TO EMAIL MANAGEMENT
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 180, fontWeight: 900,
          color: isHigh ? B.red : B.white,
          textShadow: isHigh ? `0 0 80px ${B.red}88` : 'none',
          marginTop: 20,
        }}>
          ${Math.floor(cost).toLocaleString()}
        </div>
      </div>

      {/* Blurry scrolling emails in background */}
      <AbsoluteFill style={{ filter: 'blur(8px)', opacity: 0.2, justifyContent: 'center', paddingLeft: 100 }}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} style={{
            height: 40, width: '80%', background: B.white, borderRadius: 10,
            marginBottom: 20, transform: `translateY(${-(frame * 5) + i * 60}px)`
          }} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 3: The Delegation (360-540)
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const orbS = spring({ frame, fps, config: { damping: 12 } });
  const pulse = 1 + Math.sin(frame / 15) * 0.1;

  const categories = [
    { name: 'PRIORITY', color: B.primary, delay: 40 },
    { name: 'DRAFTED', color: B.accent, delay: 70 },
    { name: 'ARCHIVED', color: B.muted, delay: 100 },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 80 }}>
        <h2 style={{ fontFamily: 'Inter', fontSize: 90, fontWeight: 900, color: B.white, letterSpacing: '-3px' }}>
          DELEGATE YOUR INBOX.
        </h2>
      </div>

      <div style={{ position: 'relative', width: '100%', height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {/* The AI Orb */}
        <div style={{
          width: 150, height: 150, borderRadius: '50%',
          background: `linear-gradient(135deg, ${B.primary}, ${B.accent})`,
          boxShadow: `0 0 100px ${B.primary}`,
          transform: `scale(${interpolate(orbS, [0, 1], [0, 1]) * pulse})`,
          zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <span style={{ fontSize: 60 }}>✨</span>
        </div>

        {/* Sorting lines shooting out */}
        {categories.map((cat, i) => {
          const lineS = spring({ frame: frame - cat.delay, fps, config: { damping: 14 } });
          const angle = -30 + i * 30; // -30, 0, 30
          
          return (
            <div key={i} style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: 300, height: 2,
              background: `linear-gradient(90deg, ${cat.color}88, transparent)`,
              transformOrigin: '0 50%',
              transform: `rotate(${angle}deg) scaleX(${interpolate(lineS, [0, 1], [0, 1])})`,
              opacity: lineS,
            }}>
              <div style={{
                position: 'absolute', right: 0, top: -25,
                background: `${cat.color}22`, border: `1px solid ${cat.color}88`,
                color: cat.color, fontFamily: 'Inter', fontWeight: 800,
                padding: '10px 20px', borderRadius: 100, fontSize: 24,
                transform: `rotate(${-angle}deg)`, // keep text upright
              }}>
                {cat.name}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Scene 4: Inbox Zero (540-720)
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const checkS = spring({ frame: frame - 20, fps, config: { damping: 12, mass: 1.2 } });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      
      <div style={{
        width: 250, height: 250, borderRadius: '50%',
        background: `radial-gradient(circle, ${B.green}44 0%, transparent 80%)`,
        border: `4px solid ${B.green}`,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        transform: `scale(${interpolate(checkS, [0, 1], [0, 1])})`,
        boxShadow: `0 0 100px ${B.green}66`,
      }}>
        {/* Draw Checkmark */}
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke={B.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
           <path d="M20 6L9 17L4 12" strokeDasharray="30" strokeDashoffset={interpolate(checkS, [0, 1], [30, 0])} />
        </svg>
      </div>

      <div style={{
        marginTop: 60, fontFamily: 'Inter', fontSize: 100, fontWeight: 900,
        color: B.white, letterSpacing: '-4px',
        opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateRight: 'clamp' }),
        transform: `translateY(${interpolate(frame, [40, 60], [30, 0], { extrapolateRight: 'clamp' })}px)`
      }}>
        WAKE UP TO ZERO.
      </div>
      
    </AbsoluteFill>
  );
};

// Scene 5: Outro (720-900)
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame, fps, config: { damping: 12, mass: 0.8 } });
  const pulse = 1 + Math.sin(frame / 12) * 0.04;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <div style={{ transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Inter', fontSize: 130, fontWeight: 900, color: B.white, lineHeight: 0.9, letterSpacing: '-6px' }}>
          CLAIM YOUR<br/>
          <span style={{ background: `linear-gradient(90deg, ${B.primary}, ${B.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            TIME BACK.
          </span>
        </h2>

        <div style={{
          marginTop: 80,
          padding: '40px 120px',
          background: `linear-gradient(135deg, ${B.primary}, ${B.accent})`,
          borderRadius: 100,
          color: B.white,
          fontSize: 50,
          fontWeight: 900,
          boxShadow: `0 20px 80px ${B.primary}66`,
          transform: `scale(${pulse})`,
        }}>
          XELOFLOW.COM
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const MomentumAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: B.dark }}>
      
      <Sequence from={0} durationInFrames={180}>
        <Background type="dark" />
        <Scene1 />
      </Sequence>

      <Sequence from={180} durationInFrames={180}>
        <Background type="dark" />
        <Scene2 />
      </Sequence>

      <Sequence from={360} durationInFrames={180}>
        <Background type="glow" />
        <Scene3 />
      </Sequence>

      <Sequence from={540} durationInFrames={180}>
        <Background type="success" />
        <Scene4 />
      </Sequence>

      <Sequence from={720} durationInFrames={180}>
        <Background type="glow" />
        <Scene5 />
      </Sequence>
      
    </AbsoluteFill>
  );
};
