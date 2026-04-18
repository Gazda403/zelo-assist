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
  primary:  '#FF7F11',
  accent:   '#A182EE',
  dark:     '#0A0A14',
  card:     '#12121F',
  border:   'rgba(255,255,255,0.08)',
  muted:    'rgba(255,255,255,0.35)',
  white:    '#FFFFFF',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const fadeIn = (frame: number, from = 0, over = 20) =>
  clamp((frame - from) / over);
const fadeOut = (frame: number, from: number, over = 20) =>
  clamp(1 - (frame - from) / over);

// ─── Shared: Ambient Bokeh Background ────────────────────────────────────────
const BokehBg: React.FC<{ tone?: 'dark' | 'light' }> = ({ tone = 'dark' }) => {
  const frame = useCurrentFrame();
  const bg = tone === 'dark' ? B.dark : '#F0EFF8';

  const orbs = [
    { x: 15,  y: 20,  r: 500, color: `${B.primary}28`, speed: 0.4 },
    { x: 80,  y: 70,  r: 600, color: `${B.accent}22`,  speed: 0.25 },
    { x: 50,  y: 90,  r: 400, color: `${B.primary}18`, speed: 0.55 },
    { x: 20,  y: 75,  r: 350, color: `${B.accent}30`,  speed: 0.35 },
    { x: 85,  y: 10,  r: 420, color: `${B.primary}20`, speed: 0.45 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: 'hidden' }}>
      {orbs.map((o, i) => {
        const floatX = Math.sin((frame / 60) * o.speed + i * 1.2) * 40;
        const floatY = Math.cos((frame / 60) * o.speed * 0.7 + i) * 30;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${o.x}%`,
              top:  `${o.y}%`,
              width:  o.r,
              height: o.r,
              borderRadius: '50%',
              background: o.color,
              filter: 'blur(80px)',
              transform: `translate(${floatX}px, ${floatY}px)`,
              pointerEvents: 'none',
            }}
          />
        );
      })}
      {/* Cinematic grain */}
      <AbsoluteFill style={{
        background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
        backgroundSize: '256px 256px',
        opacity: 0.4,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};

// ─── Shared: Logo ─────────────────────────────────────────────────────────────
const Logo: React.FC<{ size?: number; glow?: boolean }> = ({ size = 80, glow = true }) => (
  <div style={{
    width: size, height: size,
    borderRadius: size * 0.26,
    background: `linear-gradient(135deg, ${B.primary} 0%, ${B.accent} 100%)`,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    boxShadow: glow ? `0 0 ${size * 0.6}px ${B.primary}55, 0 ${size * 0.15}px ${size * 0.4}px rgba(0,0,0,0.4)` : 'none',
    flexShrink: 0,
  }}>
    {/* Abstract inbox mark */}
    <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 40 40" fill="none">
      <rect x="4" y="4" width="32" height="24" rx="4" stroke="white" strokeWidth="3" fill="none"/>
      <path d="M4 12l16 10 16-10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="10" y="32" width="20" height="4" rx="2" fill="white" opacity="0.7"/>
    </svg>
  </div>
);

// ─── SCENE 1: Cinematic Intro ─────────────────────────────────────────────────
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoS = spring({ frame, fps, config: { damping: 11, stiffness: 70, mass: 0.9 } });
  const logoY = interpolate(spring({ frame, fps, config: { damping: 14 } }), [0, 1], [80, 0]);

  const line1Op = fadeIn(frame, 20, 25);
  const line1Y  = interpolate(clamp(frame - 20, 0, 25) / 25, [0, 1], [40, 0]);
  const line2Op = fadeIn(frame, 38, 25);
  const line2Y  = interpolate(clamp(frame - 38, 0, 25) / 25, [0, 1], [40, 0]);
  const tagOp   = fadeIn(frame, 55, 20);

  const exitOp  = fadeOut(frame, 105, 15);

  return (
    <AbsoluteFill style={{ opacity: exitOp }}>
      <BokehBg />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <div style={{
          transform: `scale(${logoS}) translateY(${logoY}px)`,
          marginBottom: 48,
        }}>
          <Logo size={130} />
        </div>

        <h1 style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 100,
          fontWeight: 900,
          color: B.white,
          margin: 0,
          letterSpacing: '-4px',
          lineHeight: 1,
          opacity: line1Op,
          transform: `translateY(${line1Y}px)`,
          textAlign: 'center',
        }}>
          Xelo <span style={{
            background: `linear-gradient(90deg, ${B.primary}, ${B.accent})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Flow</span>
        </h1>

        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 34,
          fontWeight: 500,
          color: B.muted,
          margin: '16px 0 0',
          letterSpacing: '0.5px',
          opacity: line2Op,
          transform: `translateY(${line2Y}px)`,
        }}>
          The AI OS for your inbox.
        </p>

        {/* Pill tag */}
        <div style={{
          marginTop: 40,
          padding: '12px 32px',
          borderRadius: 100,
          border: `1.5px solid ${B.primary}66`,
          background: `${B.primary}18`,
          color: B.primary,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: '2px',
          opacity: tagOp,
        }}>
          EARLY ACCESS
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── SCENE 2: Inbox Chaos (3D Perspective Stack) ──────────────────────────────
const EmailCard: React.FC<{
  index: number; total: number; frame: number; fps: number;
  from: string; preview: string; tag?: string; tagColor?: string; unread?: boolean;
}> = ({ index, total, frame, fps, from, preview, tag, tagColor, unread }) => {
  const delay = index * 12;
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 90, mass: 0.8 } });

  const stackOffsetY = (total - 1 - index) * 14;
  const stackOffsetX = index * 3;
  const stackScale   = 1 - (total - 1 - index) * 0.025;
  const stackZ       = index * 8;

  const entryY = interpolate(s, [0, 1], [120, 0]);

  return (
    <div style={{
      position: 'absolute',
      width: '100%',
      opacity: s,
      transform: `translateY(${stackOffsetY + entryY}px) translateX(${stackOffsetX}px) scale(${stackScale}) translateZ(${stackZ}px)`,
      zIndex: index,
    }}>
      <div style={{
        background: index === total - 1
          ? `linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))`
          : `rgba(255,255,255,0.04)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${index === total - 1 ? 'rgba(255,255,255,0.18)' : B.border}`,
        borderRadius: 20,
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        boxShadow: index === total - 1
          ? `0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)`
          : `0 8px 20px rgba(0,0,0,0.3)`,
      }}>
        {/* Avatar */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: tagColor
            ? `linear-gradient(135deg, ${tagColor}88, ${tagColor}44)`
            : `linear-gradient(135deg, ${B.primary}66, ${B.accent}44)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 800, color: 'white', fontFamily: 'Inter',
          boxShadow: tagColor ? `0 0 16px ${tagColor}44` : 'none',
        }}>
          {from[0]}
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{
              fontFamily: 'Inter', fontSize: 18, fontWeight: unread ? 800 : 500,
              color: unread ? B.white : B.muted,
            }}>{from}</span>
            {tag && (
              <span style={{
                padding: '4px 12px', borderRadius: 100,
                background: `${tagColor || B.primary}33`,
                color: tagColor || B.primary,
                fontSize: 13, fontWeight: 700, fontFamily: 'Inter', letterSpacing: '1px',
              }}>{tag}</span>
            )}
          </div>
          <div style={{
            fontFamily: 'Inter', fontSize: 16, color: B.muted,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{preview}</div>
        </div>

        {unread && (
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: B.primary, boxShadow: `0 0 12px ${B.primary}`,
          }} />
        )}
      </div>
    </div>
  );
};

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOp = fadeIn(frame, 0, 20);
  const exitOp  = fadeOut(frame, 160, 20);

  // Show as a vertical list with slight chaos rotation, not absolute stacks
  const emails = [
    { from: 'Newsletter',  preview: 'This week in tech: 47 things to know about AI...', tag: 'PROMO',     tagColor: '#6B7280' },
    { from: 'HR Team',     preview: 'Please complete your mandatory training by Friday',  tag: 'INTERNAL', tagColor: '#3B82F6' },
    { from: 'LinkedIn',    preview: 'You have 14 new connection requests waiting...',      tag: 'SOCIAL',   tagColor: '#0A66C2' },
    { from: 'Sequoia',     preview: "Re: Your pitch deck — we're very interested in a call", tag: 'PRIORITY', tagColor: B.primary, unread: true },
  ];

  return (
    <AbsoluteFill style={{ opacity: exitOp }}>
      <BokehBg />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 12%' }}>
        {/* Title */}
        <div style={{ marginBottom: 60, opacity: titleOp }}>
          <h2 style={{
            fontFamily: 'Inter', fontSize: 64, fontWeight: 900, color: B.white,
            margin: 0, lineHeight: 1.05, letterSpacing: '-2px',
          }}>
            Your inbox is a mess.
          </h2>
          <p style={{
            fontFamily: 'Inter', fontSize: 26, color: B.muted, margin: '16px 0 0',
          }}>
            The signal is buried under the noise. Every. Single. Day.
          </p>
        </div>

        {/* Vertical list with staggered entry + slight skew per card for chaos feel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
          {emails.map((e, i) => {
            const delay = i * 14;
            const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 90 } });
            const chaosRot = [1.2, -0.8, 0.5, -0.3][i];
            const chaosX   = [8, -6, 4, -2][i];
            return (
              <div key={i} style={{
                opacity: s,
                transform: `translateX(${interpolate(s, [0,1], [-60, chaosX])}px) rotate(${interpolate(s, [0,1], [0, chaosRot])}deg)`,
                display: 'flex', alignItems: 'center', gap: 18,
                background: e.unread
                  ? `linear-gradient(90deg, ${B.primary}22, rgba(255,255,255,0.05))`
                  : 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${e.unread ? B.primary + '55' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 18,
                padding: '18px 24px',
                boxShadow: e.unread ? `0 0 30px ${B.primary}22` : '0 4px 20px rgba(0,0,0,0.3)',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                  background: `${e.tagColor}44`,
                  border: `2px solid ${e.tagColor}66`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Inter', fontWeight: 800, fontSize: 18, color: 'white',
                }}>
                  {e.from[0]}
                </div>
                {/* Text */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontFamily: 'Inter', fontWeight: e.unread ? 800 : 500, fontSize: 17, color: e.unread ? B.white : B.muted }}>{e.from}</div>
                  <div style={{ fontFamily: 'Inter', fontSize: 14, color: B.muted, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.preview}</div>
                </div>
                {/* Tag */}
                <div style={{
                  padding: '5px 14px', borderRadius: 100,
                  background: `${e.tagColor}22`, color: e.tagColor,
                  fontFamily: 'Inter', fontWeight: 700, fontSize: 12, letterSpacing: '1px',
                  border: `1px solid ${e.tagColor}44`, flexShrink: 0,
                }}>{e.tag}</div>
                {e.unread && <div style={{ width: 9, height: 9, borderRadius: '50%', background: B.primary, boxShadow: `0 0 10px ${B.primary}`, flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── SCENE 3: Transition Flash ─────────────────────────────────────────────────
const SceneFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 4, 12, 18], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${B.primary}, ${B.accent})`,
      opacity: op,
    }} />
  );
};

// ─── SCENE 4: AI Solution (Split Panel) ──────────────────────────────────────
const StatCount: React.FC<{ value: string; label: string; frame: number; delay?: number }> = ({ value, label, frame, delay = 0 }) => {
  const s = spring({ frame: frame - delay, fps: 60, config: { damping: 12, stiffness: 80 } });
  return (
    <div style={{ opacity: clamp(s), transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)` }}>
      <div style={{
        fontFamily: 'Inter', fontSize: 72, fontWeight: 900, lineHeight: 1,
        background: `linear-gradient(90deg, ${B.primary}, ${B.accent})`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>{value}</div>
      <div style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 500, color: B.muted, marginTop: 8 }}>{label}</div>
    </div>
  );
};

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftS  = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  const rightS = spring({ frame: frame - 10, fps, config: { damping: 16, stiffness: 90 } });
  const exitOp = fadeOut(frame, 220, 20);

  // Simulated rows turning from "chaos" to sorted
  const rows = [
    { from: 'Sequoia Capital',   preview: "Re: Pitch deck — we're interested", badge: 'PRIORITY', color: B.primary, delay: 30 },
    { from: 'AI Drafted Reply',  preview: 'Draft ready for "HR Team" email...', badge: 'DRAFTED', color: B.accent, delay: 50 },
    { from: 'Newsletter Digest', preview: 'Summarized: 5 key insights for you', badge: 'SUMMARY', color: '#22C55E', delay: 70 },
  ];

  return (
    <AbsoluteFill style={{ opacity: exitOp }}>
      <BokehBg />
      <AbsoluteFill style={{ display: 'flex', alignItems: 'stretch', padding: '60px 10%', gap: 80 }}>

        {/* LEFT: Copy */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          opacity: leftS,
          transform: `translateX(${interpolate(leftS, [0, 1], [-60, 0])}px)`,
        }}>
          <div style={{
            display: 'inline-block', padding: '8px 20px', borderRadius: 100,
            background: `${B.primary}22`, border: `1px solid ${B.primary}55`,
            color: B.primary, fontFamily: 'Inter', fontWeight: 700,
            fontSize: 16, letterSpacing: '2px', marginBottom: 32,
            alignSelf: 'flex-start',
          }}>
            AI-POWERED
          </div>

          <h2 style={{
            fontFamily: 'Inter', fontSize: 68, fontWeight: 900, color: B.white,
            margin: 0, lineHeight: 1.08, letterSpacing: '-2px',
          }}>
            Meet your<br />
            <span style={{
              background: `linear-gradient(90deg, ${B.primary}, ${B.accent})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Email Autopilot.</span>
          </h2>

          <p style={{
            fontFamily: 'Inter', fontSize: 24, color: B.muted,
            margin: '24px 0 0', lineHeight: 1.6, maxWidth: 440,
            opacity: fadeIn(frame, 20, 25),
          }}>
            Xelo Flow filters the noise, drafts your replies, and surfaces what matters—automatically.
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: 50, marginTop: 50,
            opacity: fadeIn(frame, 35, 25),
          }}>
            <StatCount value="10h"   label="saved per week"    frame={frame} delay={40} />
            <StatCount value="94%"   label="less inbox anxiety" frame={frame} delay={55} />
            <StatCount value="3×"    label="faster responses"  frame={frame} delay={70} />
          </div>
        </div>

        {/* RIGHT: Animated Dashboard */}
        <div style={{
          flex: 1.1,
          opacity: rightS,
          transform: `translateX(${interpolate(rightS, [0, 1], [80, 0])}px) perspective(1200px) rotateY(${interpolate(rightS, [0, 1], [12, 4])}deg) rotateX(${interpolate(rightS, [0, 1], [4, 2])}deg)`,
          display: 'flex', alignItems: 'center',
        }}>
          <div style={{
            width: '100%',
            background: `linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)`,
            backdropFilter: 'blur(30px)',
            border: `1px solid rgba(255,255,255,0.1)`,
            borderRadius: 28,
            padding: '32px 28px',
            boxShadow: `0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 80px ${B.primary}18`,
          }}>
            {/* Window chrome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              {['#FF5F57', '#FFBD2E', '#28C840'].map((c, i) => (
                <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: c }} />
              ))}
              <div style={{
                flex: 1, height: 28, borderRadius: 8,
                background: 'rgba(255,255,255,0.06)', marginLeft: 20,
                display: 'flex', alignItems: 'center', paddingLeft: 16,
              }}>
                <span style={{ fontFamily: 'Inter', fontSize: 13, color: B.muted }}>Xelo Flow — Inbox</span>
              </div>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <Logo size={38} glow={false} />
              <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 20, color: B.white }}>Inbox</span>
              <div style={{
                marginLeft: 'auto', padding: '6px 16px', borderRadius: 100,
                background: `${B.primary}22`, color: B.primary,
                fontFamily: 'Inter', fontWeight: 700, fontSize: 14,
              }}>AI Active</div>
            </div>

            {/* Sorted email rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {rows.map((r, i) => {
                const rowS = spring({ frame: frame - r.delay, fps, config: { damping: 14 } });
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 18px', borderRadius: 16,
                    background: i === 0
                      ? `linear-gradient(90deg, ${B.primary}22, transparent)`
                      : 'rgba(255,255,255,0.04)',
                    border: i === 0 ? `1px solid ${B.primary}44` : `1px solid ${B.border}`,
                    opacity: rowS,
                    transform: `translateX(${interpolate(rowS, [0, 1], [20, 0])}px)`,
                    boxShadow: i === 0 ? `0 0 30px ${B.primary}22` : 'none',
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                      background: `${r.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1.5px solid ${r.color}55`,
                    }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: B.white,
                        marginBottom: 5,
                      }}>{r.from}</div>
                      <div style={{ fontFamily: 'Inter', fontSize: 14, color: B.muted }}>{r.preview}</div>
                    </div>
                    <div style={{
                      padding: '5px 12px', borderRadius: 100,
                      background: `${r.color}22`, color: r.color,
                      fontFamily: 'Inter', fontWeight: 700, fontSize: 12, letterSpacing: '1px',
                      border: `1px solid ${r.color}44`,
                    }}>{r.badge}</div>
                  </div>
                );
              })}
            </div>

            {/* Shimmer bottom line */}
            <div style={{
              marginTop: 24, height: 3, borderRadius: 2,
              background: `linear-gradient(90deg, ${B.primary}, ${B.accent}, ${B.primary})`,
              backgroundSize: '200% 100%',
              opacity: 0.6,
            }} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── SCENE 5: Feature Spotlight ───────────────────────────────────────────────
const Scene5Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // SVG icon renderers — no emoji
  const FeatureIcons = [
    // Lightning bolt — speed/drafts
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill={B.primary} stroke={B.primary} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>,
    // Target / crosshair — priority
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke={B.accent} strokeWidth="2"/>
      <circle cx="12" cy="12" r="5" stroke={B.accent} strokeWidth="2"/>
      <circle cx="12" cy="12" r="1.5" fill={B.accent}/>
      <line x1="12" y1="3" x2="12" y2="6" stroke={B.accent} strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="18" x2="12" y2="21" stroke={B.accent} strokeWidth="2" strokeLinecap="round"/>
      <line x1="3" y1="12" x2="6" y2="12" stroke={B.accent} strokeWidth="2" strokeLinecap="round"/>
      <line x1="18" y1="12" x2="21" y2="12" stroke={B.accent} strokeWidth="2" strokeLinecap="round"/>
    </svg>,
    // Checkmark shield — auto-handle
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 6V12C4 16.418 7.582 20.278 12 22C16.418 20.278 20 16.418 20 12V6L12 2Z" stroke="#22C55E" strokeWidth="2" strokeLinejoin="round" fill="rgba(34,197,94,0.15)"/>
      <path d="M8.5 12L11 14.5L15.5 10" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>,
  ];
  const features = [
    { title: 'Instant Drafts',   sub: 'AI writes replies that sound exactly like you',    iconColor: B.primary },
    { title: 'Priority Filter',  sub: 'Investor emails never get buried again',            iconColor: B.accent  },
    { title: 'Auto-Acknowledge', sub: 'Handle routine threads without lifting a finger',   iconColor: '#22C55E' },
  ];

  const exitOp = fadeOut(frame, 155, 20);

  return (
    <AbsoluteFill style={{ opacity: exitOp }}>
      <BokehBg />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 10%' }}>
        <h2 style={{
          fontFamily: 'Inter', fontSize: 62, fontWeight: 900, color: B.white,
          margin: '0 0 64px', letterSpacing: '-2px', textAlign: 'center',
          opacity: fadeIn(frame, 0, 20),
        }}>
          Everything your inbox<br />
          <span style={{
            background: `linear-gradient(90deg, ${B.primary}, ${B.accent})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>was never meant to do.</span>
        </h2>

        <div style={{ display: 'flex', gap: 32, width: '100%' }}>
          {features.map((f, i) => {
            const s = spring({ frame: frame - i * 20, fps, config: { damping: 14 } });
            return (
              <div key={i} style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: 24,
                padding: '40px 32px',
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [50, 0])}px) scale(${interpolate(s, [0, 1], [0.95, 1])})`,
                boxShadow: `0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`,
              }}>
                {/* Clean SVG icon in a tinted circle */}
                <div style={{
                  width: 68, height: 68, borderRadius: 18, marginBottom: 24,
                  background: `${f.iconColor}18`,
                  border: `1.5px solid ${f.iconColor}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {FeatureIcons[i]}
                </div>
                <div style={{
                  fontFamily: 'Inter', fontSize: 28, fontWeight: 800, color: B.white,
                  marginBottom: 14, lineHeight: 1.2,
                }}>{f.title}</div>
                <div style={{ fontFamily: 'Inter', fontSize: 18, color: B.muted, lineHeight: 1.6 }}>{f.sub}</div>
                <div style={{
                  marginTop: 28, height: 3, width: '40%', borderRadius: 2,
                  background: `linear-gradient(90deg, ${f.iconColor}, ${B.accent})`,
                  opacity: 0.7,
                }} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── SCENE 6: Outro CTA ───────────────────────────────────────────────────────
const Scene6Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgS  = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  const txtS = spring({ frame: frame - 15, fps, config: { damping: 14 } });
  const btnS = spring({ frame: frame - 35, fps, config: { damping: 10, stiffness: 100 } });
  const urlS = spring({ frame: frame - 50, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{
      transform: `translateY(${interpolate(bgS, [0, 1], [1080, 0])}px)`,
      overflow: 'hidden',
    }}>
      {/* Gradient BG */}
      <AbsoluteFill style={{
        background: `linear-gradient(140deg, ${B.dark} 0%, #1A0A2E 50%, #0A1420 100%)`,
      }} />
      {/* Glow orb center */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        width: 900, height: 900,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, ${B.primary}30 0%, ${B.accent}20 40%, transparent 70%)`,
        filter: 'blur(40px)',
      }} />

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <Logo size={90} />

        <h1 style={{
          fontFamily: 'Inter', fontSize: 104, fontWeight: 900, color: B.white,
          margin: '40px 0 0', letterSpacing: '-4px', textAlign: 'center', lineHeight: 1,
          opacity: txtS,
          transform: `translateY(${interpolate(txtS, [0, 1], [40, 0])}px)`,
        }}>
          Take back<br />
          <span style={{
            background: `linear-gradient(90deg, ${B.primary}, ${B.accent})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>your morning.</span>
        </h1>

        <p style={{
          fontFamily: 'Inter', fontSize: 26, color: B.muted,
          margin: '24px 0 0', opacity: fadeIn(frame, 30, 20),
        }}>
          Stop managing email. Start getting things done.
        </p>

        {/* CTA Button */}
        <div style={{
          marginTop: 56,
          padding: '22px 72px',
          background: `linear-gradient(135deg, ${B.primary}, ${B.accent})`,
          borderRadius: 100,
          color: 'white',
          fontFamily: 'Inter', fontWeight: 800, fontSize: 30,
          boxShadow: `0 0 60px ${B.primary}55, 0 20px 50px rgba(0,0,0,0.4)`,
          opacity: btnS,
          transform: `scale(${interpolate(btnS, [0, 1], [0.7, 1])})`,
          letterSpacing: '-0.5px',
        }}>
          Get Early Access — It's Free
        </div>

        {/* URL */}
        <div style={{
          marginTop: 30,
          fontFamily: 'Inter', fontSize: 20, color: B.muted,
          letterSpacing: '2px', opacity: urlS,
        }}>
          xeloflow.com
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── ROOT COMPOSITION ─────────────────────────────────────────────────────────
//
//  Timeline (60 fps):
//  [0   – 120]  Scene 1: Intro
//  [118 – 120]  Flash
//  [120 – 300]  Scene 2: Chaos
//  [298 – 300]  Flash
//  [300 – 540]  Scene 4: Solution dashboard
//  [538 – 540]  Flash
//  [540 – 720]  Scene 5: 3 Feature cards
//  [718 – 720]  Flash
//  [720 – 960]  Scene 6: Outro

export const ReplicaAd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: B.dark }}>
    <Sequence from={0}   durationInFrames={120}><Scene1 /></Sequence>
    <Sequence from={118} durationInFrames={22}><SceneFlash /></Sequence>
    <Sequence from={120} durationInFrames={180}><Scene2 /></Sequence>
    <Sequence from={298} durationInFrames={22}><SceneFlash /></Sequence>
    <Sequence from={300} durationInFrames={240}><Scene4 /></Sequence>
    <Sequence from={538} durationInFrames={22}><SceneFlash /></Sequence>
    <Sequence from={540} durationInFrames={180}><Scene5Features /></Sequence>
    <Sequence from={718} durationInFrames={22}><SceneFlash /></Sequence>
    <Sequence from={720} durationInFrames={240}><Scene6Outro /></Sequence>
  </AbsoluteFill>
);
