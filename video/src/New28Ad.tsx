import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Video,
  Audio,
  staticFile,
} from 'remotion';

const ORANGE = '#FF7F11';
const WHITE  = '#FFFFFF';

// ─── Text that animates in at the TOP ────────────────────────────────────────
const TopText: React.FC<{
  lines: string[];
  accentLine?: number;
  delayFrames?: number;
}> = ({ lines, accentLine, delayFrames = 12 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{
      position: 'absolute',
      top: 80,
      left: 40,
      right: 40,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      zIndex: 20,
    }}>
      {lines.map((line, i) => {
        const spr = spring({
          frame: frame - (delayFrames + i * 10),
          fps,
          config: { damping: 14, stiffness: 90 },
        });
        const isAccent = i === accentLine;
        return (
          <div key={i} style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: isAccent ? 92 : 72,
            fontWeight: 900,
            color: isAccent ? ORANGE : WHITE,
            textAlign: 'center',
            lineHeight: 1.05,
            letterSpacing: '-2px',
            textShadow: isAccent
              ? `0 0 40px ${ORANGE}88, 0 4px 20px rgba(0,0,0,0.9)`
              : '0 4px 20px rgba(0,0,0,0.9)',
            opacity: spr,
            transform: `translateY(${interpolate(spr, [0, 1], [-30, 0])}px)`,
          }}>
            {line}
          </div>
        );
      })}
    </div>
  );
};

// ─── Top gradient so text is always readable ──────────────────────────────────
const TopGradient: React.FC = () => (
  <AbsoluteFill style={{
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 35%, transparent 60%)',
    zIndex: 10,
    pointerEvents: 'none',
  }} />
);

// ─── Flash between segments ───────────────────────────────────────────────────
const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 4, 12], [1, 0.6, 0], {
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{
      backgroundColor: WHITE,
      opacity,
      zIndex: 50,
      pointerEvents: 'none',
    }} />
  );
};

// ─── Full video (contain) with blurred fill behind ───────────────────────────
const FullVideo: React.FC<{ startFrom?: number; endAt?: number }> = ({ startFrom = 0, endAt }) => (
  <AbsoluteFill style={{ backgroundColor: '#000' }}>
    {/* Blurred background fill to cover black bars */}
    <AbsoluteFill style={{ filter: 'blur(28px)', transform: 'scale(1.15)', opacity: 0.5 }}>
      <Video
        src={staticFile('new28.mp4')}
        startFrom={startFrom}
        endAt={endAt}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </AbsoluteFill>
    {/* Main video — fully visible, nothing cropped */}
    <AbsoluteFill>
      <Video
        src={staticFile('new28.mp4')}
        startFrom={startFrom}
        endAt={endAt}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </AbsoluteFill>
  </AbsoluteFill>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
// Adjust HALF to match actual video — 270 frames = 4.5s @ 60fps
const HALF      = 270;
const FLASH_DUR = 15;
const TOTAL     = HALF * 2 + FLASH_DUR;

export const New28Ad: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#000' }}>
    <Audio
      src={staticFile('promo_music.mp3')}
      volume={(f) =>
        interpolate(f, [0, 20, TOTAL - 20, TOTAL], [0, 0.5, 0.5, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      }
    />

    {/* ── PART 1 ── */}
    <Sequence from={0} durationInFrames={HALF + FLASH_DUR}>
      <FullVideo startFrom={0} endAt={HALF + FLASH_DUR} />
      <TopGradient />
      <TopText
        lines={['Is your inbox got', 'you feeling like this?']}
        accentLine={1}
        delayFrames={15}
      />
    </Sequence>

    {/* ── FLASH ── */}
    <Sequence from={HALF} durationInFrames={FLASH_DUR}>
      <Flash />
    </Sequence>

    {/* ── PART 2 ── */}
    <Sequence from={HALF + FLASH_DUR} durationInFrames={HALF}>
      <FullVideo startFrom={HALF + FLASH_DUR} />
      <TopGradient />
      <TopText
        lines={['Well, let us introduce you to', 'XeloFlow ⚡']}
        accentLine={1}
        delayFrames={15}
      />
    </Sequence>
  </AbsoluteFill>
);
