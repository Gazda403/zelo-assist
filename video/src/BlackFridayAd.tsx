import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Audio,
  staticFile,
} from 'remotion';
import { DynamicCaptions } from './DynamicCaptions';

// --- Brand ---
const B = {
  primary:  '#FF7F11',
  accent:   '#A182EE',
  dark:     '#05050A',
  white:    '#FFFFFF',
  danger:   '#E53935',
  calm:     '#1A237E',
};

// ─── MONTHS ───────────────────────────────────────────────────────────────────
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const DAYS   = Array.from({ length: 30 }, (_, i) => i + 1);

// ─── Scene 1: Calendar Chaos (0-3s, 180 frames) ───────────────────────────────
const CalendarChaos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calendar flips: show one month per 10 frames, then settle on November
  const monthIndex = Math.min(Math.floor(frame / 10), 10); // 0-10 → JAN-NOV
  const month = MONTHS[monthIndex];

  // Background gets progressively more red and shaky
  const danger = interpolate(frame, [0, 180], [0, 1], { extrapolateRight: 'clamp' });
  const shakeX = frame > 60 ? Math.sin(frame * 0.8) * interpolate(frame, [60, 180], [0, 18], { extrapolateRight: 'clamp' }) : 0;
  const shakeY = frame > 60 ? Math.cos(frame * 1.1) * interpolate(frame, [60, 180], [0, 10], { extrapolateRight: 'clamp' }) : 0;

  // Emails pile up from bottom - each email card rises with the frame
  const emailCount = Math.floor(interpolate(frame, [30, 180], [0, 22], { extrapolateRight: 'clamp' }));

  const bgRed = Math.round(interpolate(danger, [0, 1], [5, 60]));
  const bgColor = `rgb(${bgRed}, 5, 10)`;

  return (
    <AbsoluteFill style={{
      backgroundColor: bgColor,
      transform: `translate(${shakeX}px, ${shakeY}px)`,
      overflow: 'hidden',
    }}>
      {/* Calendar card in center */}
      <AbsoluteFill style={{
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          border: `2px solid rgba(229,57,53,${0.3 + danger * 0.7})`,
          borderRadius: 32,
          padding: '40px 60px',
          textAlign: 'center',
          boxShadow: `0 0 ${80 * danger}px rgba(229,57,53,${0.5 * danger})`,
          transform: `scale(${interpolate(frame, [0, 30], [0.5, 1], { extrapolateRight: 'clamp' })})`,
        }}>
          {/* Month header */}
          <div style={{
            background: `rgba(229,57,53,${0.6 + danger * 0.4})`,
            borderRadius: '16px 16px 0 0',
            padding: '16px 40px',
            marginBottom: 16,
          }}>
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 72,
              fontWeight: 900,
              color: B.white,
              letterSpacing: 8,
            }}>{month}</span>
          </div>
          {/* Day grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 8,
            padding: 16,
          }}>
            {DAYS.slice(0, 28).map((d) => (
              <div key={d} style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: d === 29 || d === 30
                  ? `rgba(229,57,53,0.8)`
                  : 'rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter',
                fontSize: 22,
                color: B.white,
                fontWeight: 600,
              }}>{d}</div>
            ))}
          </div>
        </div>
      </AbsoluteFill>

      {/* Piling email cards from the bottom */}
      {Array.from({ length: emailCount }).map((_, i) => {
        const emails = [
          'Where is my order??',
          'REFUND REQUEST URGENT',
          'My package is lost!!!',
          'Wrong item received',
          'Order not delivered',
          'Customer complaint',
          'Track my shipment',
          'Cancel my order',
          '⚠️ Chargeback filed',
          'Damaged item arrived',
          'Need reply ASAP!!!',
          'Bad review incoming',
        ];
        const label = emails[i % emails.length];
        const x = interpolate(i, [0, 20], [5, 75]) + Math.sin(i * 1.3) * 10;
        const baseY = 105 - i * 5;
        return (
          <div key={i} style={{
            position: 'absolute',
            bottom: `${baseY}%`,
            left: `${x}%`,
            transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (i * 0.8)}deg)`,
            background: 'rgba(229,57,53,0.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(229,57,53,0.5)',
            borderRadius: 12,
            padding: '12px 24px',
            whiteSpace: 'nowrap',
            fontFamily: 'Inter',
            fontSize: 26,
            color: B.white,
            fontWeight: 600,
            zIndex: i + 1,
            boxShadow: '0 4px 20px rgba(229,57,53,0.3)',
          }}>{label}</div>
        );
      })}

      {/* "Black Friday" warning label */}
      {frame > 90 && (
        <div style={{
          position: 'absolute',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          background: B.danger,
          borderRadius: 16,
          padding: '12px 40px',
          fontFamily: 'Inter',
          fontSize: 36,
          fontWeight: 900,
          color: B.white,
          letterSpacing: 4,
          opacity: interpolate(frame, [90, 120], [0, 1], { extrapolateRight: 'clamp' }),
          zIndex: 100,
        }}>🛑 E-COM SCALE MODE</div>
      )}
    </AbsoluteFill>
  );
};

// ─── Scene 2: XeloFlow Drops In (3-5s, 120 frames) ────────────────────────────
const CoolantDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dropSpring = spring({ frame, fps, config: { damping: 12, mass: 0.8 } });
  const logoY     = interpolate(dropSpring, [0, 1], [-400, 0]);
  const logoScale = interpolate(dropSpring, [0, 1], [0.2, 1]);
  const glowRadius = interpolate(frame, [0, 60], [0, 200], { extrapolateRight: 'clamp' });

  // Coolant ripple spreading out
  const ripple1 = interpolate(frame, [20, 80], [0, 600], { extrapolateRight: 'clamp' });
  const ripple2 = interpolate(frame, [35, 95], [0, 600], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      background: 'radial-gradient(ellipse at center, #0D1B4E 0%, #05050A 100%)',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      {/* Coolant ripples */}
      {[ripple1, ripple2].map((r, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: r,
          height: r,
          borderRadius: '50%',
          border: `3px solid rgba(161,130,238,${0.6 - i * 0.2})`,
          opacity: interpolate(r, [0, 600], [1, 0]),
        }} />
      ))}

      {/* Glow burst */}
      <div style={{
        position: 'absolute',
        width: glowRadius * 2,
        height: glowRadius * 2,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(161,130,238,0.3) 0%, transparent 70%)',
      }} />

      {/* XeloFlow Logo Icon */}
      <div style={{
        transform: `translateY(${logoY}px) scale(${logoScale})`,
        zIndex: 10,
        textAlign: 'center',
      }}>
        {/* Simple circle icon representing XeloFlow */}
        <div style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${B.primary} 0%, ${B.accent} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          boxShadow: `0 0 80px rgba(161,130,238,0.8), 0 0 ${glowRadius * 0.5}px rgba(255,127,17,0.4)`,
        }}>
          <span style={{ fontSize: 100 }}>⚡</span>
        </div>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 80,
          fontWeight: 900,
          color: B.white,
          letterSpacing: 4,
        }}>XELOFLOW</div>
        <div style={{
          fontFamily: 'Inter',
          fontSize: 32,
          color: B.accent,
          marginTop: 8,
          letterSpacing: 2,
        }}>COOLING THE CHAOS</div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Auto-Reply (5-8s, 180 frames) ────────────────────────────────────
const AutoReply: React.FC = () => {
  const frame = useCurrentFrame();

  const emailPairs = [
    { q: 'Where is my order??',       a: '📦 Your order ships Nov 29th!' },
    { q: 'REFUND REQUEST URGENT',     a: '✅ Refund processed in 24 hrs.' },
    { q: 'My package is lost!!!',     a: '🔍 Investigating with carrier now.' },
    { q: 'Wrong item received',       a: '🔄 Replacement sent today!' },
  ];

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(160deg, #0D1B4E 0%, #05050A 100%)',
      overflow: 'hidden',
    }}>
      {/* Glassmorphic panel */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        right: '5%',
        bottom: '20%',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(161,130,238,0.3)',
        borderRadius: 32,
        padding: 40,
        overflow: 'hidden',
      }}>
        {/* Panel header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 32,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: 24,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: `linear-gradient(135deg, ${B.primary}, ${B.accent})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>⚡</div>
          <div>
            <div style={{ fontFamily: 'Inter', fontSize: 28, fontWeight: 700, color: B.white }}>XeloFlow AI</div>
            <div style={{ fontFamily: 'Inter', fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>Auto-Reply Active — Smart Inbox Mode</div>
          </div>
          <div style={{
            marginLeft: 'auto',
            background: 'rgba(76,175,80,0.2)',
            border: '1px solid rgba(76,175,80,0.5)',
            borderRadius: 20,
            padding: '6px 20px',
            fontFamily: 'Inter',
            fontSize: 20,
            color: '#81C784',
            fontWeight: 600,
          }}>● LIVE</div>
        </div>

        {/* Email rows */}
        {emailPairs.map(({ q, a }, i) => {
          const showAt = i * 35;
          const visible = frame >= showAt;
          const replyAt = showAt + 25;
          const replyVisible = frame >= replyAt;

          return (
            <div key={i} style={{
              marginBottom: 24,
              opacity: visible ? interpolate(frame, [showAt, showAt + 15], [0, 1], { extrapolateRight: 'clamp' }) : 0,
              transform: visible
                ? `translateX(${interpolate(frame, [showAt, showAt + 15], [-40, 0], { extrapolateRight: 'clamp' })}px)`
                : 'translateX(-40px)',
            }}>
              {/* Incoming email */}
              <div style={{
                background: 'rgba(229,57,53,0.15)',
                border: '1px solid rgba(229,57,53,0.3)',
                borderRadius: 12,
                padding: '12px 20px',
                fontFamily: 'Inter',
                fontSize: 22,
                color: B.white,
                marginBottom: 8,
              }}>📧 {q}</div>
              {/* Auto reply */}
              {replyVisible && (
                <div style={{
                  background: 'rgba(161,130,238,0.15)',
                  border: '1px solid rgba(161,130,238,0.4)',
                  borderRadius: 12,
                  padding: '12px 20px',
                  fontFamily: 'Inter',
                  fontSize: 22,
                  color: B.accent,
                  marginLeft: 40,
                  opacity: interpolate(frame, [replyAt, replyAt + 10], [0, 1], { extrapolateRight: 'clamp' }),
                }}>⚡ XeloFlow: {a}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* "While the founder sleeps" text at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: 'Inter',
        fontSize: 30,
        color: 'rgba(255,255,255,0.5)',
        opacity: interpolate(frame, [120, 150], [0, 1], { extrapolateRight: 'clamp' }),
      }}>😴 While the founder sleeps...</div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: Caption/Script Line ─────────────────────────────────────────────
const ScriptCaption: React.FC = () => (
  <AbsoluteFill style={{
    background: 'linear-gradient(160deg, #0D1B4E 0%, #05050A 100%)',
  }}>
    <DynamicCaptions
      text="Don't let your support inbox kill your business."
      startFrame={0}
      durationInFrames={150}
      fontSize={72}
      color={B.white}
    />
  </AbsoluteFill>
);

// ─── Scene 5: CTA Outro ────────────────────────────────────────────────────────
const CTAOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame, fps, config: { damping: 14, mass: 0.6 } });
  const scale = interpolate(s, [0, 1], [0.5, 1]);

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${B.primary} 0%, ${B.accent} 100%)`,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{ textAlign: 'center', transform: `scale(${scale})` }}>
        <div style={{
          fontFamily: 'Inter',
          fontSize: 100,
          fontWeight: 900,
          color: B.white,
          textShadow: '0 10px 60px rgba(0,0,0,0.3)',
        }}>XELOFLOW</div>
        <div style={{
          fontFamily: 'Inter',
          fontSize: 38,
          color: 'rgba(255,255,255,0.85)',
          marginTop: 16,
        }}>AI-Powered Email. Zero Stress. ⚡</div>
      </div>
    </AbsoluteFill>
  );
};

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────────
export const BlackFridayAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: B.dark }}>
      <Audio
        src={staticFile('promo_music.mp3')}
        volume={(f) => interpolate(f, [0, 30], [0, 0.7], { extrapolateRight: 'clamp' })}
      />

      {/* Scene 1: Calendar Chaos  — 0-3s (180f) */}
      <Sequence from={0} durationInFrames={180}>
        <CalendarChaos />
      </Sequence>

      {/* Scene 2: XeloFlow drops in — 3-5s (120f) */}
      <Sequence from={180} durationInFrames={120}>
        <CoolantDrop />
      </Sequence>

      {/* Scene 3: Auto-Replies    — 5-8s (180f) */}
      <Sequence from={300} durationInFrames={180}>
        <AutoReply />
      </Sequence>

      {/* Scene 4: Script caption  — 8-10.5s (150f) */}
      <Sequence from={480} durationInFrames={150}>
        <ScriptCaption />
      </Sequence>

      {/* Scene 5: CTA Outro       — 10.5-13s (150f) */}
      <Sequence from={630} durationInFrames={150}>
        <CTAOutro />
      </Sequence>
    </AbsoluteFill>
  );
};
