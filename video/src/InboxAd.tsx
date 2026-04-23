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

// ─── Flash transition overlay ─────────────────────────────────────────────────
const FlashTransition: React.FC<{ frameTrigger: number }> = ({ frameTrigger }) => {
  const frame = useCurrentFrame();
  const local = frame - frameTrigger;
  if (local < -10 || local > 20) return null;
  const op = interpolate(local, [-10, 0, 20], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${B.primary}, ${B.white})`,
      opacity: op,
      mixBlendMode: 'overlay',
    }} />
  );
};

// ─── Scene 1: Hook — real inbox footage (0-4s / 240f) ────────────────────────
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slight ken-burns zoom
  const zoom = interpolate(frame, [0, 240], [1, 1.08], { extrapolateRight: 'clamp' });

  // Text spring — enters at frame 30
  const textSpring = spring({ frame: Math.max(0, frame - 25), fps, config: { damping: 11, mass: 0.6 } });
  const textY      = interpolate(textSpring, [0, 1], [70, 0]);
  const textOp     = interpolate(textSpring, [0, 1], [0, 1]);

  // Shake the screen at the end to imply "chaos"
  const shakeStart = 170;
  const shakeX = frame > shakeStart
    ? Math.sin(frame * 1.8) * interpolate(frame, [shakeStart, 240], [0, 9], { extrapolateRight: 'clamp' })
    : 0;
  const shakeY = frame > shakeStart
    ? Math.cos(frame * 1.3) * interpolate(frame, [shakeStart, 240], [0, 5], { extrapolateRight: 'clamp' })
    : 0;

  // Red vignette that grows to emphasise stress
  const vignetteOp = interpolate(frame, [100, 240], [0, 0.55], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: B.dark, transform: `translate(${shakeX}px, ${shakeY}px)` }}>
      {/* Background video */}
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Video
          src={staticFile('0423 (2).mp4')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          startFrom={0}
          muted
        />
      </AbsoluteFill>

      {/* Red stress vignette */}
      <AbsoluteFill style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(229,57,53,0.7) 100%)',
        opacity: vignetteOp,
      }} />

      {/* Bottom gradient for text readability */}
      <AbsoluteFill style={{
        background: 'linear-gradient(to top, rgba(5,5,10,0.9) 0%, rgba(5,5,10,0.4) 40%, transparent 100%)',
      }} />

      {/* Hook text */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 100 }}>
        <div style={{
          transform: `translateY(${textY}px)`,
          opacity: textOp,
          textAlign: 'center',
          padding: '0 50px',
        }}>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 78,
            fontWeight: 900,
            color: B.white,
            lineHeight: 1.15,
            textShadow: '0 4px 40px rgba(0,0,0,0.9)',
          }}>
            Is your inbox<br />
            <span style={{ color: B.danger }}>looking like this?</span> 😩
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Magic Transition (4-6s / 120f) ─────────────────────────────────
const MagicScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s     = spring({ frame, fps, config: { damping: 10, mass: 0.5 } });
  const scale = interpolate(s, [0, 1], [0.3, 1]);
  const glow  = interpolate(frame, [0, 120], [0, 320], { extrapolateRight: 'clamp' });

  // Particles bursting outward
  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle   = (i / 20) * Math.PI * 2;
    const dist    = interpolate(frame, [0, 90], [0, 400], { extrapolateRight: 'clamp' });
    const px      = Math.cos(angle) * dist;
    const py      = Math.sin(angle) * dist;
    const opacity = interpolate(frame, [50, 110], [1, 0], { extrapolateRight: 'clamp' });
    return { px, py, opacity };
  });

  const taglineOp = interpolate(frame, [35, 70], [0, 1], { extrapolateRight: 'clamp' });

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
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: i % 2 === 0 ? B.primary : B.accent,
            transform: `translate(${p.px}px, ${p.py}px)`,
            opacity: p.opacity,
            boxShadow: `0 0 24px ${i % 2 === 0 ? B.primary : B.accent}`,
          }} />
        ))}
      </AbsoluteFill>

      {/* Glow ring */}
      <div style={{
        position: 'absolute',
        width: glow,
        height: glow,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(161,130,238,0.3) 0%, transparent 70%)',
      }} />

      {/* Logo + tagline */}
      <div style={{ transform: `scale(${scale})`, textAlign: 'center', zIndex: 10 }}>
        {/* Lightning icon */}
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
          fontFamily: 'Inter, sans-serif',
          fontSize: 90,
          fontWeight: 900,
          color: B.white,
          letterSpacing: 2,
          textShadow: '0 0 40px rgba(161,130,238,0.5)',
        }}>XELO FLOW</div>

        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 42,
          color: B.accent,
          marginTop: 16,
          opacity: taglineOp,
          fontWeight: 600,
          letterSpacing: 1,
        }}>Let us do the magic. ✨</div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Showcase Clip ───────────────────────────────────────────────────
interface ShowcaseClipProps {
  src: string;
  label: string;
  emoji?: string;
  startFrom?: number;
}

const ShowcaseClip: React.FC<ShowcaseClipProps> = ({ src, label, emoji = '', startFrom = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s       = spring({ frame, fps, config: { damping: 14, mass: 0.6 } });
  const slideY  = interpolate(s, [0, 1], [60, 0]);
  const opacity = interpolate(s, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0f', overflow: 'hidden' }}>
      {/* Blurred background fill */}
      <AbsoluteFill style={{ filter: 'blur(28px)', transform: 'scale(1.15)', opacity: 0.35 }}>
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
          style={{ width: '100%', height: 'auto', maxHeight: '82%', objectFit: 'contain' }}
          startFrom={startFrom}
          muted
        />
      </AbsoluteFill>

      {/* Bottom gradient */}
      <AbsoluteFill style={{
        background: 'linear-gradient(to top, rgba(5,5,10,0.95) 0%, transparent 45%)',
      }} />

      {/* Top badge */}
      <div style={{
        position: 'absolute',
        top: 40,
        left: 40,
        background: `linear-gradient(135deg, ${B.primary}, ${B.accent})`,
        borderRadius: 20,
        padding: '10px 28px',
        fontFamily: 'Inter, sans-serif',
        fontSize: 26,
        fontWeight: 700,
        color: B.white,
        boxShadow: '0 4px 20px rgba(255,127,17,0.45)',
        opacity,
      }}>⚡ XELO FLOW</div>

      {/* Feature label */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 90 }}>
        <div style={{
          transform: `translateY(${slideY}px)`,
          opacity,
          fontFamily: 'Inter, sans-serif',
          fontSize: 56,
          fontWeight: 800,
          color: B.white,
          textAlign: 'center',
          textShadow: '0 4px 30px rgba(0,0,0,0.9)',
          padding: '0 60px',
          lineHeight: 1.3,
        }}>
          {label} {emoji}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Scene 4: CTA Outro (12-15s / 180f) ──────────────────────────────────────
const CTAOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s      = spring({ frame, fps, config: { damping: 12, mass: 0.7 } });
  const scale  = interpolate(s, [0, 1], [0.6, 1]);
  const btnOp  = interpolate(frame, [45, 75], [0, 1], { extrapolateRight: 'clamp' });
  const btnY   = interpolate(frame, [45, 75], [30, 0],  { extrapolateRight: 'clamp' });
  const pulse  = Math.sin(frame * 0.08) * 0.03 + 1;

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${B.primary} 0%, ${B.accent} 100%)`,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute',
        width: 650,
        height: 650,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        top: -220,
        right: -220,
        transform: `scale(${pulse})`,
      }} />
      <div style={{
        position: 'absolute',
        width: 450,
        height: 450,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        bottom: -160,
        left: -120,
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
          fontFamily: 'Inter, sans-serif',
          fontSize: 112,
          fontWeight: 900,
          color: B.white,
          letterSpacing: 2,
          textShadow: '0 10px 60px rgba(0,0,0,0.25)',
          lineHeight: 1,
        }}>XELOFLOW</div>

        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 38,
          color: 'rgba(255,255,255,0.85)',
          marginTop: 20,
          fontWeight: 500,
        }}>AI Email. Zero Effort. More Growth.</div>

        {/* CTA pill */}
        <div style={{
          opacity: btnOp,
          transform: `translateY(${btnY}px)`,
          marginTop: 55,
          display: 'inline-block',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          border: '2px solid rgba(255,255,255,0.45)',
          borderRadius: 50,
          padding: '22px 65px',
          fontFamily: 'Inter, sans-serif',
          fontSize: 36,
          fontWeight: 700,
          color: B.white,
          letterSpacing: 1,
        }}>
          🔗 Get Early Access → Link in Bio
        </div>

        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 28,
          color: 'rgba(255,255,255,0.6)',
          marginTop: 30,
          opacity: btnOp,
          letterSpacing: 2,
        }}>xeloflow.com</div>
      </div>
    </AbsoluteFill>
  );
};

// ─── MAIN COMPOSITION ─────────────────────────────────────────────────────────
// Timeline (60fps):
//   0   – 240  (0-4s)   Scene 1: Inbox Hook
//   240 – 360  (4-6s)   Scene 2: Magic Transition
//   360 – 480  (6-8s)   Scene 3a: showcase_1
//   480 – 600  (8-10s)  Scene 3b: showcase_2
//   600 – 720  (10-12s) Scene 3c: showcase_3
//   720 – 900  (12-15s) Scene 4: CTA Outro
//   Total: 900f = 15s
export const InboxAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: B.dark }}>
      <Audio
        src={staticFile('promo_music.mp3')}
        volume={(f) =>
          interpolate(f, [0, 30, 870, 900], [0, 0.5, 0.5, 0], { extrapolateRight: 'clamp' })
        }
      />

      {/* Scene 1: Inbox Hook */}
      <Sequence from={0} durationInFrames={240}>
        <HookScene />
      </Sequence>

      {/* Scene 2: Magic */}
      <Sequence from={240} durationInFrames={120}>
        <MagicScene />
      </Sequence>

      {/* Scene 3a: showcase_1 */}
      <Sequence from={360} durationInFrames={120}>
        <ShowcaseClip
          src="showcase_1.mp4"
          label="AI writes your replies"
          emoji="✍️"
          startFrom={0}
        />
      </Sequence>

      {/* Scene 3b: showcase_2 */}
      <Sequence from={480} durationInFrames={120}>
        <ShowcaseClip
          src="showcase_2.mp4"
          label="Smart inbox. Zero clutter."
          emoji="📥"
          startFrom={0}
        />
      </Sequence>

      {/* Scene 3c: showcase_3 */}
      <Sequence from={600} durationInFrames={120}>
        <ShowcaseClip
          src="showcase_3.mp4"
          label="Respond 10x faster."
          emoji="⚡"
          startFrom={0}
        />
      </Sequence>

      {/* Scene 4: CTA Outro */}
      <Sequence from={720} durationInFrames={180}>
        <CTAOutro />
      </Sequence>

      {/* Flash transitions between scenes */}
      <FlashTransition frameTrigger={240} />
      <FlashTransition frameTrigger={360} />
      <FlashTransition frameTrigger={480} />
      <FlashTransition frameTrigger={600} />
      <FlashTransition frameTrigger={720} />
    </AbsoluteFill>
  );
};
