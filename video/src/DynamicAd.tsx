import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Video,
  staticFile,
  Easing
} from 'remotion';

const B = {
  primary: '#FF7F11',
  dark: '#05050A',
  white: '#FFFFFF',
  danger: '#E53935',
  success: '#4CAF50',
};

// ─── Scene 1: The Ticket Avalanche ──────────────────────────────────────────
const TicketAvalanche: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tickets = [
    "Where is my package?!",
    "REFUND ASAP!!!",
    "Wrong item sent",
    "Tracking number doesn't work",
    "Cancel my order",
    "Missing parts...",
    "I'm leaving a bad review",
    "Hello?? Anyone there??",
    "Update address please",
    "DISPUTE FILED"
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: B.dark, justifyContent: 'center', alignItems: 'center' }}>
      
      {/* Background Red Gradient (Static, no flashes) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at 50% 30%, rgba(229,57,53,0.15) 0%, transparent 80%)`,
      }} />

      {/* Headline */}
      <div style={{
        position: 'absolute',
        top: '15%',
        fontFamily: 'Inter',
        fontSize: 56,
        fontWeight: 900,
        color: B.white,
        textAlign: 'center',
        opacity: interpolate(frame, [0, 15], [0, 1]),
        transform: `translateY(${interpolate(frame, [0, 15], [20, 0])}px)`
      }}>
        Running an E-com store <br />
        <span style={{ color: B.danger }}>is a nightmare when...</span>
      </div>

      {/* Cascading Tickets */}
      {tickets.map((text, i) => {
        // Stagger the pop-ins every 8 frames
        const delay = 30 + i * 8;
        const popSpring = spring({
          frame: frame - delay,
          fps,
          config: { damping: 12, mass: 0.5 }
        });

        // Wiggle effect
        const rotate = Math.sin((frame - delay) / 5) * 2 * (i % 2 === 0 ? 1 : -1);
        
        // Final wipe-out at frame 110
        const exitY = interpolate(frame, [110, 125], [0, 1000], { easing: Easing.in(Easing.exp) });

        if (frame < delay) return null;

        return (
          <div key={i} style={{
            position: 'absolute',
            top: `${30 + i * 5}%`,
            left: `${10 + (i % 2) * 10 + Math.random() * 5}%`,
            transform: `scale(${popSpring}) rotate(${rotate}deg) translateY(${exitY}px)`,
            background: 'rgba(255, 255, 255, 0.95)',
            borderLeft: `8px solid ${B.danger}`,
            borderRadius: 12,
            padding: '16px 24px',
            fontFamily: 'Inter',
            fontSize: 28,
            fontWeight: 700,
            color: B.dark,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: i,
            width: '75%',
          }}>
            <div style={{ fontSize: 16, color: B.danger, marginBottom: 4, textTransform: 'uppercase' }}>New Ticket • Unassigned</div>
            {text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Scene 2: The XeloFlow Solution ──────────────────────────────────────────
const TheSolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Orange wave wiping the screen
  const waveY = interpolate(frame, [0, 20], [100, -10], { easing: Easing.out(Easing.ease) });
  
  const logoSpring = spring({ frame: frame - 15, fps, config: { damping: 10 } });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Orange Background */}
      <div style={{
        position: 'absolute',
        top: `${waveY}%`,
        left: 0, right: 0, bottom: 0,
        background: `linear-gradient(135deg, ${B.primary} 0%, #D45D00 100%)`,
        zIndex: 1,
      }} />

      {/* Center Text & Logo */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
        transform: `scale(${logoSpring})`,
        opacity: interpolate(frame, [45, 60], [1, 0]) // fades out before next scene
      }}>
        <div style={{
          width: 120, height: 120,
          background: B.white,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 64,
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          marginBottom: 24,
        }}>⚡</div>
        <div style={{
          fontFamily: 'Inter',
          fontSize: 64,
          fontWeight: 900,
          color: B.white,
          textShadow: '0 4px 10px rgba(0,0,0,0.2)',
        }}>XELO FLOW</div>
        <div style={{
          fontFamily: 'Inter',
          fontSize: 32,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.9)',
          marginTop: 16,
        }}>AI handles the inbox.</div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: The Freedom (Video Asset) ──────────────────────────────────────
const TheFreedom: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // The video fades in smoothly
  const fade = interpolate(frame, [0, 20], [0, 1]);
  
  // Slow Ken Burns zoom on the video
  const zoom = interpolate(frame, [0, 180], [1, 1.15]);

  // Text animations
  const text1 = spring({ frame: frame - 30, fps });
  const text2 = spring({ frame: frame - 70, fps });
  const button = spring({ frame: frame - 110, fps });

  return (
    <AbsoluteFill style={{ backgroundColor: B.dark, opacity: fade }}>
      
      {/* The Requested Video Asset */}
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: '50% 50%' }}>
        <Video 
          src={staticFile('wmremove-transformed.mp4')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          playbackRate={0.7} // slightly slower for a dreamy vibe
          loop
        />
      </AbsoluteFill>

      {/* Dark overlay for text readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
      }} />

      {/* Copy at the bottom */}
      <AbsoluteFill style={{
        justifyContent: 'flex-end',
        padding: 60,
        paddingBottom: 100,
      }}>
        <div style={{
          fontFamily: 'Inter',
          fontSize: 64,
          fontWeight: 900,
          color: B.white,
          textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          transform: `translateY(${interpolate(text1, [0, 1], [50, 0])}px)`,
          opacity: text1,
          lineHeight: 1.1,
          marginBottom: 16,
        }}>
          Get your <br/>
          <span style={{ color: B.primary }}>freedom</span> back.
        </div>

        <div style={{
          fontFamily: 'Inter',
          fontSize: 32,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.9)',
          transform: `translateY(${interpolate(text2, [0, 1], [30, 0])}px)`,
          opacity: text2,
          marginBottom: 40,
        }}>
          Let XeloFlow clear the tickets while you enjoy life.
        </div>

        {/* CTA Button */}
        <div style={{
          transform: `scale(${button})`,
          opacity: button,
        }}>
          <div style={{
            background: B.white,
            color: B.dark,
            padding: '24px 40px',
            borderRadius: 100,
            fontFamily: 'Inter',
            fontSize: 28,
            fontWeight: 800,
            display: 'inline-block',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}>
            Automate My Store ⚡
          </div>
        </div>
      </AbsoluteFill>

    </AbsoluteFill>
  );
};

// ─── Main Composition ─────────────────────────────────────────────────────────
export const DynamicAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: B.dark }}>
      
      {/* 0 to 4 Seconds (0 - 120 frames) */}
      <Sequence from={0} durationInFrames={120}>
        <TicketAvalanche />
      </Sequence>

      {/* 4 to 6 Seconds (120 - 180 frames) */}
      <Sequence from={120} durationInFrames={60}>
        <TheSolution />
      </Sequence>

      {/* 6 to 12 Seconds (180 - 360 frames) */}
      <Sequence from={180} durationInFrames={180}>
        <TheFreedom />
      </Sequence>

    </AbsoluteFill>
  );
};
