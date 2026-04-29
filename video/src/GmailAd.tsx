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

const ORANGE = '#FF7F11';
const PURPLE = '#A182EE';
const BLACK = '#000000';
const WHITE = '#FFFFFF';

// ── Helpers ─────────────────────────────────────────────────────────────────
const useFade = (inStart: number, inEnd: number, outStart?: number, outEnd?: number) => {
  const frame = useCurrentFrame();
  if (outStart !== undefined && outEnd !== undefined) {
    return interpolate(frame, [inStart, inEnd, outStart, outEnd], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
  }
  return interpolate(frame, [inStart, inEnd], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
};

// ── Background gradient overlay ──────────────────────────────────────────────
const DarkOverlay: React.FC<{ strength?: number }> = ({ strength = 0.6 }) => (
  <AbsoluteFill style={{
    background: `linear-gradient(to top, rgba(0,0,0,${strength}) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)`,
    pointerEvents: 'none',
    zIndex: 5,
  }} />
);

// ── Scene: full-screen video with text ───────────────────────────────────────
const VideoScene: React.FC<{
  src: string;
  headline: string;
  sub?: string;
  accent?: string;
  textPos?: 'top' | 'bottom' | 'center';
  duration: number;
}> = ({ src, headline, sub, accent = WHITE, textPos = 'bottom', duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoom = interpolate(frame, [0, duration], [1.0, 1.12], { easing: Easing.out(Easing.quad) });
  const headSpr = spring({ frame: frame - 15, fps, config: { damping: 14, stiffness: 80 } });
  const subSpr  = spring({ frame: frame - 30, fps, config: { damping: 12, stiffness: 60 } });
  const fadeOut = interpolate(frame, [duration - 12, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const justMap = { top: 'flex-start', bottom: 'flex-end', center: 'center' };

  return (
    <AbsoluteFill style={{ backgroundColor: BLACK, opacity: fadeOut }}>
      {/* Video */}
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: '50% 50%' }}>
        <Video src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loop />
      </AbsoluteFill>

      <DarkOverlay strength={textPos === 'center' ? 0.5 : 0.65} />

      {/* Text block */}
      <AbsoluteFill style={{
        justifyContent: justMap[textPos] as any,
        alignItems: 'center',
        padding: 80,
        paddingBottom: textPos === 'bottom' ? 140 : 80,
        paddingTop: textPos === 'top' ? 140 : 80,
        zIndex: 10,
        flexDirection: 'column',
        gap: 20,
      }}>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 88,
          fontWeight: 900,
          color: accent,
          textAlign: 'center',
          lineHeight: 1.05,
          letterSpacing: '-2px',
          textShadow: '0 6px 30px rgba(0,0,0,0.7)',
          transform: `translateY(${interpolate(headSpr, [0, 1], [60, 0])}px)`,
          opacity: headSpr,
        }}>
          {headline}
        </div>

        {sub && (
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 44,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.88)',
            textAlign: 'center',
            textShadow: '0 4px 20px rgba(0,0,0,0.6)',
            transform: `translateY(${interpolate(subSpr, [0, 1], [40, 0])}px)`,
            opacity: subSpr,
          }}>
            {sub}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Flash cut transition ──────────────────────────────────────────────────────
const FlashCut: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 4, 8], [1, 0.6, 0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: WHITE, opacity, zIndex: 100, pointerEvents: 'none' }} />
  );
};

// ── Orange brand wipe ─────────────────────────────────────────────────────────
const OrangeWipe: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 18], [100, -5], { easing: Easing.out(Easing.exp), extrapolateRight: 'clamp' });
  const textSpr = spring({ frame: frame - 12, fps: 60, config: { damping: 12 } });
  const fade = interpolate(frame, [totalFrames - 15, totalFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: fade, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        top: `${y}%`,
        background: `linear-gradient(160deg, ${ORANGE} 0%, #C55C00 100%)`,
        zIndex: 1,
      }} />
      <AbsoluteFill style={{
        zIndex: 2, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 24,
      }}>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 110,
          fontWeight: 900,
          color: WHITE,
          letterSpacing: '-4px',
          transform: `scale(${interpolate(textSpr, [0, 1], [0.7, 1])})`,
          opacity: textSpr,
        }}>
          XELO<span style={{ color: 'rgba(255,255,255,0.4)' }}>FLOW</span>
        </div>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 40,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.9)',
          opacity: textSpr,
          transform: `translateY(${interpolate(textSpr, [0, 1], [20, 0])}px)`,
        }}>
          AI handles your Gmail inbox ⚡
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Final CTA screen ──────────────────────────────────────────────────────────
const CTAScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bg   = spring({ frame, fps, config: { damping: 20 } });
  const title = spring({ frame: frame - 10, fps, config: { damping: 14 } });
  const btn  = spring({ frame: frame - 25, fps, config: { damping: 12 } });
  const url  = spring({ frame: frame - 40, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(circle at 40% 40%, #1a0a2e 0%, #050510 100%)`,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      gap: 40,
    }}>
      {/* Glow blobs */}
      <div style={{
        position: 'absolute', top: '5%', left: '10%',
        width: 400, height: 400,
        background: `radial-gradient(circle, ${ORANGE}33 0%, transparent 70%)`,
        filter: 'blur(60px)',
        opacity: bg,
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%',
        width: 350, height: 350,
        background: `radial-gradient(circle, ${PURPLE}33 0%, transparent 70%)`,
        filter: 'blur(60px)',
        opacity: bg,
      }} />

      {/* Logo mark */}
      <div style={{
        width: 120, height: 120,
        background: `linear-gradient(135deg, ${ORANGE}, ${PURPLE})`,
        borderRadius: 36,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 64,
        boxShadow: `0 20px 60px ${ORANGE}55`,
        transform: `scale(${title})`,
        opacity: title,
      }}>
        ⚡
      </div>

      {/* Headline */}
      <div style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 96,
        fontWeight: 900,
        color: WHITE,
        textAlign: 'center',
        letterSpacing: '-3px',
        lineHeight: 1.05,
        opacity: title,
        transform: `translateY(${interpolate(title, [0, 1], [40, 0])}px)`,
      }}>
        Stop managing email.<br />
        <span style={{
          background: `linear-gradient(90deg, ${ORANGE}, ${PURPLE})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Let AI do it.
        </span>
      </div>

      {/* CTA Button */}
      <div style={{
        background: `linear-gradient(135deg, ${ORANGE}, #E06000)`,
        padding: '32px 90px',
        borderRadius: 100,
        fontFamily: 'Inter, sans-serif',
        fontSize: 48,
        fontWeight: 800,
        color: WHITE,
        boxShadow: `0 20px 50px ${ORANGE}77`,
        transform: `scale(${btn})`,
        opacity: btn,
        letterSpacing: '-0.5px',
      }}>
        Try Free — xeloflow.com
      </div>

      {/* Sub */}
      <div style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 34,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: 400,
        opacity: url,
        transform: `translateY(${interpolate(url, [0, 1], [20, 0])}px)`,
      }}>
        No credit card required
      </div>
    </AbsoluteFill>
  );
};

// ── MAIN COMPOSITION ──────────────────────────────────────────────────────────
// Total: 660 frames = 11 seconds @ 60fps
//   Scene 1: vid1  0   → 90   (1.5s)
//   Flash:         90  → 98
//   Scene 2: vid2  90  → 180
//   Flash:         180 → 188
//   Scene 3: vid3  180 → 270
//   Flash:         270 → 278
//   Scene 4: vid4  270 → 360
//   OrangeWipe:    360 → 450  (1.5s — brand moment)
//   Scene 5: vid5  450 → 540
//   Scene 6: vid6  540 → 600
//   CTA:           600 → 720  (2s)

const D = 90; // frames per clip

export const GmailAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <Audio src={staticFile('promo_music.mp3')}
        volume={(f) => interpolate(f, [0, 20, 680, 720], [0, 0.6, 0.6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />

      {/* ── Clip 1 ── */}
      <Sequence from={0} durationInFrames={D + 10}>
        <VideoScene src="vid1.mp4" headline="700 unread emails." sub="Every. Single. Day." textPos="bottom" duration={D + 10} />
      </Sequence>
      <Sequence from={D} durationInFrames={10}><FlashCut /></Sequence>

      {/* ── Clip 2 ── */}
      <Sequence from={D} durationInFrames={D + 10}>
        <VideoScene src="vid2.mp4" headline="Your inbox is out of control." textPos="top" accent={ORANGE} duration={D + 10} />
      </Sequence>
      <Sequence from={D * 2} durationInFrames={10}><FlashCut /></Sequence>

      {/* ── Clip 3 ── */}
      <Sequence from={D * 2} durationInFrames={D + 10}>
        <VideoScene src="vid3.mp4" headline="What if AI read it for you?" textPos="center" duration={D + 10} />
      </Sequence>
      <Sequence from={D * 3} durationInFrames={10}><FlashCut /></Sequence>

      {/* ── Clip 4 ── */}
      <Sequence from={D * 3} durationInFrames={D + 10}>
        <VideoScene src="vid4.mp4" headline="Drafted. Sorted. Handled." sub="In seconds." textPos="bottom" accent={ORANGE} duration={D + 10} />
      </Sequence>

      {/* ── Orange Brand Wipe ── */}
      <Sequence from={D * 4} durationInFrames={90}>
        <OrangeWipe totalFrames={90} />
      </Sequence>

      {/* ── Clip 5 ── */}
      <Sequence from={D * 5} durationInFrames={D + 10}>
        <VideoScene src="vid5.mp4" headline="Focus on what matters." textPos="top" duration={D + 10} />
      </Sequence>
      <Sequence from={D * 6} durationInFrames={10}><FlashCut /></Sequence>

      {/* ── Clip 6 ── */}
      <Sequence from={D * 6} durationInFrames={D}>
        <VideoScene src="vid6.mp4" headline="Get your time back." sub="XeloFlow does the rest." textPos="bottom" accent={WHITE} duration={D} />
      </Sequence>

      {/* ── CTA Outro ── */}
      <Sequence from={D * 7} durationInFrames={120}>
        <CTAScreen />
      </Sequence>
    </AbsoluteFill>
  );
};
