import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';

// ─── Brand ────────────────────────────────────────────────────────────────────
const B = {
  primary: '#FF7F11',
  accent:  '#A182EE',
  dark:    '#080812',
  white:   '#FFFFFF',
  muted:   'rgba(255,255,255,0.4)',
};

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

// ─── Moving Bokeh / Particle Layer ───────────────────────────────────────────
const Particles: React.FC<{ count?: number; seed?: number }> = ({ count = 30, seed = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: count }).map((_, i) => {
        const rng = (n: number) => Math.sin(n * seed * 127.1 + i * 311.7) * 0.5 + 0.5;
        const x = rng(1) * width;
        const y = rng(2) * height;
        const r = 2 + rng(3) * 5;
        const speed = 0.2 + rng(4) * 0.5;
        const color = i % 3 === 0 ? B.primary : i % 3 === 1 ? B.accent : B.white;
        const drift = Math.sin((frame / 60) * speed + i) * 30;
        const floatY = ((frame * speed * 0.4) % (height + 20)) - 10;
        const opacity = 0.15 + rng(5) * 0.3;
        const baseY = (rng(6) * height - floatY + height) % height;

        return (
          <div key={i} style={{
            position: 'absolute',
            left: x + drift,
            top: baseY,
            width: r * 2,
            height: r * 2,
            borderRadius: '50%',
            backgroundColor: color,
            opacity,
            filter: `blur(${r * 0.5}px)`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Globe Orbs Background ────────────────────────────────────────────────────
const OrbBg: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: B.dark, overflow: 'hidden' }}>
      {/* Primary glow — animates position */}
      <div style={{
        position: 'absolute',
        left: `${30 + Math.sin(frame / 80) * 10}%`,
        top:  `${20 + Math.cos(frame / 100) * 8}%`,
        width: 700, height: 700,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${B.primary}50 0%, transparent 65%)`,
        filter: 'blur(60px)',
        transform: 'translate(-50%, -50%)',
      }} />
      {/* Accent orb */}
      <div style={{
        position: 'absolute',
        left: `${70 + Math.cos(frame / 70) * 8}%`,
        top:  `${65 + Math.sin(frame / 90) * 6}%`,
        width: 600, height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${B.accent}45 0%, transparent 65%)`,
        filter: 'blur(60px)',
        transform: 'translate(-50%, -50%)',
      }} />
      {/* Dark vignette */}
      <AbsoluteFill style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(8,8,18,0.85) 100%)',
      }} />
      <Particles count={25} seed={7} />
    </AbsoluteFill>
  );
};

// ─── Logo SVG Icon ────────────────────────────────────────────────────────────
const LogoMark: React.FC<{ size?: number }> = ({ size = 100 }) => (
  <div style={{
    width: size, height: size,
    borderRadius: size * 0.28,
    background: `linear-gradient(135deg, ${B.primary} 0%, ${B.accent} 100%)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: `0 0 ${size * 0.8}px ${B.primary}55, 0 0 ${size * 0.4}px ${B.accent}33, 0 ${size * 0.2}px ${size * 0.5}px rgba(0,0,0,0.5)`,
    flexShrink: 0,
  }}>
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 40 40" fill="none">
      <rect x="4" y="6"  width="32" height="24" rx="4" stroke="white" strokeWidth="2.5" fill="none"/>
      <path d="M4 14l16 9 16-9" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M10 34h20" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
    </svg>
  </div>
);

// ─── Glitch Flash ─────────────────────────────────────────────────────────────
const Glitch: React.FC<{ fromFrame: number; duration?: number }> = ({ fromFrame, duration = 6 }) => {
  const frame = useCurrentFrame();
  const local = frame - fromFrame;
  if (local < 0 || local > duration) return null;
  const op = local < duration / 2 ? 1 : 0;
  const rgbShift = local * 6;
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(90deg, ${B.primary}22, ${B.accent}22)`,
      opacity: op * 0.8,
      transform: `translateX(${rgbShift}px)`,
    }} />
  );
};

// ─── SCENE A: Pure Brand Intro — cinematic widescreen logo + tagline ──────────
// Duration: 150 frames (2.5s)
const SceneA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo drops in with elastic spring
  const logoS = spring({ frame, fps, config: { damping: 10, stiffness: 60, mass: 1.1 } });
  const logoY = interpolate(logoS, [0, 1], [-120, 0]);

  // Letterbox bars slide out (cinematic reveal)
  const barH = interpolate(spring({ frame, fps, config: { damping: 18, stiffness: 80 } }), [0, 1], [220, 0]);

  // Word-by-word title
  const word1 = spring({ frame: frame - 20, fps, config: { damping: 14, stiffness: 100 } });
  const word2 = spring({ frame: frame - 35, fps, config: { damping: 14, stiffness: 100 } });

  const tagOp  = clamp((frame - 60) / 20);
  const pillOp = clamp((frame - 75) / 20);

  const exitOp = interpolate(frame, [130, 150], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: exitOp }}>
      <OrbBg />

      {/* Cinematic letterbox bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: barH, backgroundColor: '#000', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: barH, backgroundColor: '#000', zIndex: 10 }} />

      {/* Center content */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 0 }}>
        {/* Logo */}
        <div style={{ transform: `translateY(${logoY}px) scale(${logoS})`, marginBottom: 44 }}>
          <LogoMark size={110} />
        </div>

        {/* Brand name — word-by-word slide */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
          <span style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 110, fontWeight: 900, color: B.white,
            letterSpacing: '-5px', lineHeight: 1,
            opacity: word1,
            transform: `translateY(${interpolate(word1, [0,1], [40,0])}px)`,
            display: 'inline-block',
          }}>Xelo</span>
          <span style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 110, fontWeight: 900, letterSpacing: '-5px', lineHeight: 1,
            background: `linear-gradient(90deg, ${B.primary} 0%, ${B.accent} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            opacity: word2,
            transform: `translateY(${interpolate(word2, [0,1], [40,0])}px)`,
            display: 'inline-block',
          }}>Flow</span>
        </div>

        {/* Tagline */}
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 400,
          color: B.muted, margin: '20px 0 0', letterSpacing: '0.5px',
          opacity: tagOp,
          transform: `translateY(${interpolate(tagOp, [0,1], [20,0])}px)`,
        }}>
          The AI OS for your inbox.
        </p>

        {/* Badge pill */}
        <div style={{
          marginTop: 36,
          padding: '12px 36px', borderRadius: 100,
          background: `linear-gradient(90deg, ${B.primary}22, ${B.accent}22)`,
          border: `1.5px solid ${B.primary}66`,
          color: B.primary, fontFamily: 'Inter', fontWeight: 700,
          fontSize: 17, letterSpacing: '3px',
          opacity: pillOp,
          transform: `scale(${interpolate(pillOp, [0, 1], [0.85, 1])})`,
        }}>
          XELOFLOW.COM
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── SCENE B: 3-word rapid-fire feature punches ───────────────────────────────
// Duration: 180 frames (3s) — 3 × 60-frame punches
const Punch: React.FC<{ line1: string; line2: string; sub: string; localFrame: number }> = ({ line1, line2, sub, localFrame }) => {
  const { fps } = useVideoConfig();
  const s1  = spring({ frame: localFrame,      fps, config: { damping: 10, stiffness: 120 } });
  const s2  = spring({ frame: localFrame - 8,  fps, config: { damping: 10, stiffness: 120 } });
  const sub1 = clamp((localFrame - 18) / 15);
  const exitOp = interpolate(localFrame, [44, 58], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      justifyContent: 'center', alignItems: 'flex-start',
      padding: '0 14%', opacity: exitOp,
    }}>
      <div>
        <div style={{
          fontFamily: 'Inter', fontSize: 96, fontWeight: 900, color: B.white,
          letterSpacing: '-4px', lineHeight: 0.95,
          opacity: s1, transform: `translateY(${interpolate(s1, [0,1], [60,0])}px)`,
        }}>{line1}</div>
        <div style={{
          fontFamily: 'Inter', fontSize: 96, fontWeight: 900, letterSpacing: '-4px', lineHeight: 0.95,
          background: `linear-gradient(90deg, ${B.primary}, ${B.accent})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          opacity: s2, transform: `translateY(${interpolate(s2, [0,1], [60,0])}px)`,
        }}>{line2}</div>
        <p style={{
          fontFamily: 'Inter', fontSize: 26, fontWeight: 400, color: B.muted,
          margin: '24px 0 0', lineHeight: 1.5, maxWidth: 520,
          opacity: sub1, transform: `translateY(${interpolate(sub1,[0,1],[20,0])}px)`,
        }}>{sub}</p>
      </div>
    </AbsoluteFill>
  );
};

const SceneB: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <OrbBg />
      {/* Flash cuts between punches */}
      <Glitch fromFrame={58} />
      <Glitch fromFrame={118} />

      <Sequence from={0}   durationInFrames={62}>
        <Punch line1="Inbox." line2="Automated." sub="AI that drafts, replies, and prioritizes — before you open a single thread." localFrame={frame} />
      </Sequence>
      <Sequence from={60}  durationInFrames={62}>
        <Punch line1="Zero" line2="Noise." sub="Your important emails rise to the top. Everything else gets handled." localFrame={frame - 60} />
      </Sequence>
      <Sequence from={120} durationInFrames={62}>
        <Punch line1="10 Hours" line2="Saved." sub="Every week. Because your inbox finally works for you, not against you." localFrame={frame - 120} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ─── SCENE C: Frosted-glass inbox mockup zooms in ─────────────────────────────
// Duration: 150 frames (2.5s)
const rows = [
  { label: 'PRIORITY', color: B.primary,  from: 'Sequoia Capital',   text: "Re: Pitch deck — let's schedule a call" },
  { label: 'DRAFTED',  color: B.accent,   from: 'AI Response Ready', text: 'Reply drafted for "HR Team" (review in 1 click)' },
  { label: 'DIGEST',   color: '#22C55E',  from: 'Daily Digest',      text: '3 newsletters summarized — read in 30 sec' },
  { label: 'MUTED',    color: '#6B7280',  from: 'LinkedIn',           text: 'Notifications silenced automatically' },
];

const SceneC: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelS = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });
  const panelScale = interpolate(panelS, [0, 1], [0.82, 1]);
  const panelY     = interpolate(panelS, [0, 1], [120, 0]);

  const titleOp = clamp((frame - 15) / 20);
  const exitOp  = interpolate(frame, [130, 150], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: exitOp }}>
      <OrbBg />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 6%', gap: 40 }}>
        {/* Title above */}
        <div style={{
          textAlign: 'center',
          opacity: titleOp,
          transform: `translateY(${interpolate(titleOp, [0,1],[30,0])}px)`,
        }}>
          <h2 style={{
            fontFamily: 'Inter', fontSize: 56, fontWeight: 900, color: B.white,
            margin: 0, letterSpacing: '-2px', lineHeight: 1.1,
          }}>
            Your inbox,<br />
            <span style={{
              background: `linear-gradient(90deg, ${B.primary}, ${B.accent})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>sorted by AI.</span>
          </h2>
        </div>

        {/* Glassmorphism Panel */}
        <div style={{
          width: '88%',
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 28,
          padding: '28px 28px',
          boxShadow: `0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 80px ${B.primary}18`,
          transform: `scale(${panelScale}) translateY(${panelY}px)`,
          opacity: panelS,
        }}>
          {/* Window chrome */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            {['#FF5F57','#FFBD2E','#28C840'].map((c,i) => (
              <div key={i} style={{ width:12, height:12, borderRadius:'50%', background:c }} />
            ))}
            <div style={{
              flex:1, height:26, borderRadius:8, marginLeft:12,
              background:'rgba(255,255,255,0.06)',
              display:'flex', alignItems:'center', paddingLeft:14,
            }}>
              <span style={{ fontFamily:'Inter', fontSize:13, color:B.muted }}>Xelo Flow · Inbox</span>
            </div>
            <div style={{
              padding:'5px 16px', borderRadius:100,
              background:`${B.primary}22`, color:B.primary,
              fontFamily:'Inter', fontWeight:700, fontSize:13,
            }}>AI Active</div>
          </div>

          {/* Email rows */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {rows.map((r, i) => {
              const rowS = spring({ frame: frame - 20 - i * 12, fps, config: { damping: 15 } });
              return (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:16,
                  padding:'16px 20px', borderRadius:16,
                  background: i === 0 ? `linear-gradient(90deg, ${B.primary}20, rgba(255,255,255,0.04))` : 'rgba(255,255,255,0.04)',
                  border:`1px solid ${i === 0 ? B.primary + '44' : 'rgba(255,255,255,0.07)'}`,
                  opacity: rowS,
                  transform:`translateX(${interpolate(rowS,[0,1],[30,0])}px)`,
                  boxShadow: i === 0 ? `0 0 24px ${B.primary}22` : 'none',
                }}>
                  <div style={{
                    width:42, height:42, borderRadius:'50%', flexShrink:0,
                    background:`${r.color}28`, border:`1.5px solid ${r.color}55`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'Inter', fontWeight:800, fontSize:16, color:'white',
                  }}>{r.from[0]}</div>

                  <div style={{ flex:1, overflow:'hidden' }}>
                    <div style={{ fontFamily:'Inter', fontWeight: i===0?800:500, fontSize:16, color: i===0? B.white: B.muted }}>{r.from}</div>
                    <div style={{ fontFamily:'Inter', fontSize:13, color:B.muted, marginTop:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.text}</div>
                  </div>

                  <div style={{
                    padding:'5px 14px', borderRadius:100, flexShrink:0,
                    background:`${r.color}22`, color:r.color,
                    fontFamily:'Inter', fontWeight:700, fontSize:12, letterSpacing:'1px',
                    border:`1px solid ${r.color}44`,
                  }}>{r.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── SCENE D: Explosive Outro ─────────────────────────────────────────────────
// Duration: 150 frames (2.5s)
const SceneD: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s     = spring({ frame, fps, config: { damping: 13, stiffness: 80 } });
  const btnS  = spring({ frame: frame - 30, fps, config: { damping: 10, stiffness: 90 } });
  const urlOp = clamp((frame - 50) / 20);

  // Pulsing glow on button
  const pulse = 1 + Math.sin((frame / 60) * 3) * 0.04;

  return (
    <AbsoluteFill>
      <OrbBg />
      <Particles count={40} seed={3} />

      <AbsoluteFill style={{ justifyContent:'center', alignItems:'center', flexDirection:'column', gap:0 }}>
        <LogoMark size={90} />

        <h1 style={{
          fontFamily:'Inter', fontSize:100, fontWeight:900,
          color:B.white, letterSpacing:'-4px', lineHeight:1,
          margin:'36px 0 0', textAlign:'center',
          opacity: s,
          transform:`translateY(${interpolate(s,[0,1],[50,0])}px)`,
        }}>
          Zero inbox.<br />
          <span style={{
            background:`linear-gradient(90deg, ${B.primary}, ${B.accent})`,
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>Infinite output.</span>
        </h1>

        {/* CTA pill */}
        <div style={{
          marginTop:50,
          padding:'24px 72px',
          background:`linear-gradient(135deg, ${B.primary}, ${B.accent})`,
          borderRadius:100, color:'white',
          fontFamily:'Inter', fontWeight:800, fontSize:28,
          letterSpacing:'-0.5px',
          boxShadow:`0 0 80px ${B.primary}55, 0 0 40px ${B.accent}33, 0 20px 50px rgba(0,0,0,0.5)`,
          opacity: btnS,
          transform: `scale(${interpolate(btnS,[0,1],[0.7,1]) * pulse})`,
        }}>
          Get Early Access — It's Free
        </div>

        <div style={{
          marginTop:28, fontFamily:'Inter', fontSize:20,
          color:B.muted, letterSpacing:'3px', opacity: urlOp,
        }}>
          XELOFLOW.COM
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── ROOT — Total: 630 frames = 10.5s @ 60fps ─────────────────────────────────
// A: 0–150   (logo reveal)
// B: 148–330 (3× punches + glitch)
// C: 328–480 (inbox mockup)
// D: 478–630 (outro CTA)
export const TeaserMax: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: B.dark }}>
    <Sequence from={0}   durationInFrames={152}><SceneA /></Sequence>
    <Glitch fromFrame={148} />
    <Sequence from={150} durationInFrames={182}><SceneB /></Sequence>
    <Glitch fromFrame={330} />
    <Sequence from={328} durationInFrames={154}><SceneC /></Sequence>
    <Glitch fromFrame={480} />
    <Sequence from={478} durationInFrames={152}><SceneD /></Sequence>
  </AbsoluteFill>
);
