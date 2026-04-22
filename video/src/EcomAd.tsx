import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Audio,
  Video,
  staticFile,
} from 'remotion';
import { DynamicCaptions } from './DynamicCaptions';

// ─── Brand ────────────────────────────────────────────────────────────────────
const B = {
  primary: '#FF7F11',
  accent:  '#A182EE',
  dark:    '#05050A',
  white:   '#FFFFFF',
  danger:  '#E53935',
};

// ─── Scene 1: Happy Man Hook (0-3s / 180f) ────────────────────────────────────
// Shows the "happy man" video with text: "Is your inbox booming?"
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textSpring = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 12, mass: 0.6 } });
  const textY      = interpolate(textSpring, [0, 1], [80, 0]);
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);

  // Slight zoom on video for drama
  const zoom = interpolate(frame, [0, 180], [1, 1.06], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: B.dark }}>
      {/* Background video */}
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Video
          src={staticFile('happy_man.mp4')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          startFrom={0}
          endAt={180}
          muted
        />
      </AbsoluteFill>

      {/* Dark gradient overlay at bottom for text readability */}
      <AbsoluteFill style={{
        background: 'linear-gradient(to top, rgba(5,5,10,0.92) 0%, rgba(5,5,10,0.3) 50%, transparent 100%)',
      }} />

      {/* Hook text */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 120 }}>
        <div style={{
          transform: `translateY(${textY}px)`,
          opacity: textOpacity,
          textAlign: 'center',
          padding: '0 40px',
        }}>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 72,
            fontWeight: 900,
            color: B.white,
            lineHeight: 1.15,
            textShadow: '0 4px 40px rgba(0,0,0,0.8)',
          }}>
            Is your business<br />
            <span style={{ color: B.primary }}>booming?</span> 📈
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Inbox Chaos Animation (3-6s / 180f) ────────────────────────────
// Animated envelope with wave of notification bubbles flooding in
const InboxChaos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const envelopeSpring = spring({ frame, fps, config: { damping: 14, mass: 0.7 } });
  const envelopeScale  = interpolate(envelopeSpring, [0, 1], [0, 1]);

  // Generate notification bubbles that fly in from sides
  const notifCount = Math.floor(interpolate(frame, [20, 160], [0, 28], { extrapolateRight: 'clamp' }));
  const notifLabels = [
    '1 new message', '47 unread', 'URGENT!!!', 'Reply needed',
    'Follow up?', '⚠️ Overdue', '3 new orders', 'Complaint #44',
    'FWD: Invoice', 'RE: RE: RE:', '99+ emails', 'Customer angry',
    'Refund req.', 'Meeting?', 'Hello??', 'Did you see this?',
    'ASAP!!!', 'Late reply', 'Where r u?', 'Still waiting...',
    '📦 Lost order', '😡 1 star review', 'Need answer NOW', 'Call me back',
    'Tracking info?', 'Wrong item!', 'New ticket', 'Escalation',
  ];

  // Shake background
  const shakeX = frame > 60 ? Math.sin(frame * 1.2) * interpolate(frame, [60, 160], [0, 12], { extrapolateRight: 'clamp' }) : 0;
  const shakeY = frame > 60 ? Math.cos(frame * 0.9) * interpolate(frame, [60, 160], [0, 6], { extrapolateRight: 'clamp' }) : 0;

  const bgPulse = interpolate(frame, [0, 180], [5, 40]);

  return (
    <AbsoluteFill style={{
      background: `rgb(${bgPulse}, 5, 10)`,
      transform: `translate(${shakeX}px, ${shakeY}px)`,
      overflow: 'hidden',
    }}>
      {/* Giant envelope icon center */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          transform: `scale(${envelopeScale})`,
          position: 'relative',
          textAlign: 'center',
        }}>
          {/* Envelope body */}
          <div style={{
            width: 280,
            height: 200,
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            border: `3px solid rgba(229,57,53,${0.4 + (frame / 180) * 0.6})`,
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 ${60 + frame}px rgba(229,57,53,0.5)`,
            margin: '0 auto',
          }}>
            <span style={{ fontSize: 100 }}>✉️</span>
          </div>

          {/* Unread badge */}
          <div style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: B.danger,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter',
            fontSize: 28,
            fontWeight: 900,
            color: B.white,
            boxShadow: '0 0 30px rgba(229,57,53,0.8)',
            opacity: frame > 20 ? 1 : 0,
          }}>
            {Math.min(99, notifCount * 4)}+
          </div>
        </div>
      </AbsoluteFill>

      {/* Floating notification chips */}
      {Array.from({ length: notifCount }).map((_, i) => {
        const angle = (i / 28) * Math.PI * 2;
        const radius = 300 + (i % 3) * 120;
        const x = 50 + Math.cos(angle) * 35;
        const y = 50 + Math.sin(angle) * 55;
        const delay = i * 5;
        const appeared = frame > delay;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
            background: 'rgba(229,57,53,0.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(229,57,53,0.5)',
            borderRadius: 12,
            padding: '10px 18px',
            fontFamily: 'Inter',
            fontSize: 22,
            color: B.white,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            opacity: appeared
              ? interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateRight: 'clamp' })
              : 0,
            boxShadow: '0 4px 16px rgba(229,57,53,0.3)',
          }}>
            {notifLabels[i % notifLabels.length]}
          </div>
        );
      })}

      {/* Caption text at bottom */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60 }}>
        <div style={{
          fontFamily: 'Inter',
          fontSize: 68,
          fontWeight: 900,
          color: B.white,
          textAlign: 'center',
          padding: '0 40px',
          opacity: interpolate(frame, [60, 90], [0, 1], { extrapolateRight: 'clamp' }),
          textShadow: '0 4px 30px rgba(0,0,0,0.9)',
          lineHeight: 1.2,
        }}>
          Don't waste your time on emails.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Scene 3: XeloFlow Magic Transition (6-8s / 120f) ────────────────────────
const MagicScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s      = spring({ frame, fps, config: { damping: 10, mass: 0.5 } });
  const scale  = interpolate(s, [0, 1], [0.3, 1]);
  const glow   = interpolate(frame, [0, 120], [0, 300], { extrapolateRight: 'clamp' });

  // Particles shooting outward
  const particles = Array.from({ length: 16 }, (_, i) => {
    const angle   = (i / 16) * Math.PI * 2;
    const dist    = interpolate(frame, [0, 80], [0, 350], { extrapolateRight: 'clamp' });
    const px      = Math.cos(angle) * dist;
    const py      = Math.sin(angle) * dist;
    const opacity = interpolate(frame, [40, 100], [1, 0], { extrapolateRight: 'clamp' });
    return { px, py, opacity };
  });

  return (
    <AbsoluteFill style={{
      background: 'radial-gradient(ellipse at center, #1a0a3e 0%, #05050A 100%)',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      {/* Particle burst */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        {particles.map((p, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: i % 2 === 0 ? B.primary : B.accent,
            transform: `translate(${p.px}px, ${p.py}px)`,
            opacity: p.opacity,
            boxShadow: `0 0 20px ${i % 2 === 0 ? B.primary : B.accent}`,
          }} />
        ))}
      </AbsoluteFill>

      {/* Glow ring */}
      <div style={{
        position: 'absolute',
        width: glow,
        height: glow,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(161,130,238,0.25) 0%, transparent 70%)',
      }} />

      {/* Logo + tagline */}
      <div style={{
        transform: `scale(${scale})`,
        textAlign: 'center',
        zIndex: 10,
      }}>
        <div style={{
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${B.primary}, ${B.accent})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 28px',
          boxShadow: '0 0 80px rgba(161,130,238,0.9)',
          fontSize: 80,
        }}>⚡</div>

        <div style={{
          fontFamily: 'Inter',
          fontSize: 88,
          fontWeight: 900,
          color: B.white,
          letterSpacing: 2,
        }}>XELO FLOW</div>

        <div style={{
          fontFamily: 'Inter',
          fontSize: 38,
          color: B.accent,
          marginTop: 12,
          opacity: interpolate(frame, [30, 70], [0, 1], { extrapolateRight: 'clamp' }),
        }}>Let us do the magic. ✨</div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: App Showcase Clips (8-14s / 360f) ──────────────────────────────
// Three 2-3 second cutouts of real app footage, each with a label
interface ShowcaseClipProps {
  src: string;
  label: string;
  startFrom?: number;
}

const ShowcaseClip: React.FC<ShowcaseClipProps> = ({ src, label, startFrom = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame, fps, config: { damping: 14, mass: 0.6 } });
  const slideY = interpolate(s, [0, 1], [60, 0]);
  const opacity = interpolate(s, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0f', overflow: 'hidden' }}>
      {/* Blurred background version (fills frame, looks good) */}
      <AbsoluteFill style={{ filter: 'blur(24px)', transform: 'scale(1.1)', opacity: 0.4 }}>
        <Video
          src={staticFile(src)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          startFrom={startFrom}
          muted
        />
      </AbsoluteFill>

      {/* Actual video — contained so full UI is visible */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Video
          src={staticFile(src)}
          style={{ width: '100%', height: 'auto', maxHeight: '85%', objectFit: 'contain' }}
          startFrom={startFrom}
          muted
        />
      </AbsoluteFill>

      {/* Gradient overlay at bottom only */}
      <AbsoluteFill style={{
        background: 'linear-gradient(to top, rgba(5,5,10,0.92) 0%, transparent 40%)',
      }} />

      {/* XeloFlow top badge */}
      <div style={{
        position: 'absolute',
        top: 40,
        left: 40,
        background: `linear-gradient(135deg, ${B.primary}, ${B.accent})`,
        borderRadius: 20,
        padding: '8px 24px',
        fontFamily: 'Inter',
        fontSize: 24,
        fontWeight: 700,
        color: B.white,
        boxShadow: '0 4px 20px rgba(255,127,17,0.4)',
        opacity,
      }}>⚡ XELO FLOW</div>

      {/* Feature label at bottom */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 80 }}>
        <div style={{
          transform: `translateY(${slideY}px)`,
          opacity,
          fontFamily: 'Inter',
          fontSize: 52,
          fontWeight: 800,
          color: B.white,
          textAlign: 'center',
          textShadow: '0 4px 30px rgba(0,0,0,0.9)',
          padding: '0 60px',
        }}>{label}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Scene 5: CTA Outro (14-17s / 180f) ──────────────────────────────────────
const CTAOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s     = spring({ frame, fps, config: { damping: 12, mass: 0.7 } });
  const scale = interpolate(s, [0, 1], [0.6, 1]);

  const btnOpacity = interpolate(frame, [40, 70], [0, 1], { extrapolateRight: 'clamp' });
  const btnY       = interpolate(frame, [40, 70], [30, 0], { extrapolateRight: 'clamp' });

  // Subtle background pulse
  const pulse = Math.sin(frame * 0.08) * 0.03 + 1;

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${B.primary} 0%, ${B.accent} 100%)`,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      {/* Animated background blobs */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        top: -200,
        right: -200,
        transform: `scale(${pulse})`,
      }} />
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        bottom: -150,
        left: -100,
        transform: `scale(${1 / pulse})`,
      }} />

      {/* Main content */}
      <div style={{
        textAlign: 'center',
        transform: `scale(${scale})`,
        zIndex: 10,
        padding: '0 60px',
      }}>
        <div style={{
          fontFamily: 'Inter',
          fontSize: 110,
          fontWeight: 900,
          color: B.white,
          letterSpacing: 2,
          textShadow: '0 10px 60px rgba(0,0,0,0.25)',
          lineHeight: 1,
        }}>XELOFLOW</div>

        <div style={{
          fontFamily: 'Inter',
          fontSize: 36,
          color: 'rgba(255,255,255,0.85)',
          marginTop: 20,
          fontWeight: 500,
        }}>AI Email. Zero Effort. More Growth.</div>

        {/* CTA Button */}
        <div style={{
          opacity: btnOpacity,
          transform: `translateY(${btnY}px)`,
          marginTop: 50,
          display: 'inline-block',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,255,255,0.4)',
          borderRadius: 50,
          padding: '20px 60px',
          fontFamily: 'Inter',
          fontSize: 34,
          fontWeight: 700,
          color: B.white,
          letterSpacing: 1,
        }}>
          🔗 Try Free → Link in Bio
        </div>

        <div style={{
          fontFamily: 'Inter',
          fontSize: 26,
          color: 'rgba(255,255,255,0.6)',
          marginTop: 28,
          opacity: btnOpacity,
        }}>xeloflow.com</div>
      </div>
    </AbsoluteFill>
  );
};

// ─── MAIN COMPOSITION ─────────────────────────────────────────────────────────
export const EcomAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: B.dark }}>
      <Audio
        src={staticFile('promo_music.mp3')}
        volume={(f) => interpolate(f, [0, 30, 750, 780], [0, 0.55, 0.55, 0], { extrapolateRight: 'clamp' })}
      />

      {/* Scene 1: Hook — Happy Man (0-3s / 180f) */}
      <Sequence from={0} durationInFrames={180}>
        <HookScene />
      </Sequence>

      {/* Scene 2: Inbox Chaos (3-6s / 180f) */}
      <Sequence from={180} durationInFrames={180}>
        <InboxChaos />
      </Sequence>

      {/* Scene 3: XeloFlow Magic (6-8s / 120f) */}
      <Sequence from={360} durationInFrames={120}>
        <MagicScene />
      </Sequence>

      {/* Scene 4a: App clip 1 — showcase_1 (8-10s / 120f) */}
      <Sequence from={480} durationInFrames={120}>
        <ShowcaseClip
          src="showcase_1.mp4"
          label="AI writes your emails ✍️"
          startFrom={0}
        />
      </Sequence>

      {/* Scene 4b: App clip 2 — showcase_2 (10-12s / 120f) */}
      <Sequence from={600} durationInFrames={120}>
        <ShowcaseClip
          src="showcase_2.mp4"
          label="Smart inbox. Zero clutter. 📥"
          startFrom={0}
        />
      </Sequence>

      {/* Scene 4c: App clip 3 — showcase_3 (12-14s / 120f) */}
      <Sequence from={720} durationInFrames={120}>
        <ShowcaseClip
          src="showcase_3.mp4"
          label="Respond 10x faster. ⚡"
          startFrom={0}
        />
      </Sequence>

      {/* Scene 5: CTA Outro (14-17s / 180f) */}
      <Sequence from={840} durationInFrames={180}>
        <CTAOutro />
      </Sequence>
    </AbsoluteFill>
  );
};
