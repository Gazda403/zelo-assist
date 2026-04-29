import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Video,
  staticFile
} from 'remotion';

// --- Brand ---
const B = {
  primary: '#FF7F11',
  white: '#FFFFFF',
  dark: '#05050A',
};

// Unified animation for the icons passing on Z-axis and shrinking to logo
const IconsAndLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Hazy lighting for phase 1 (0-90)
  const hazeOpacity = interpolate(frame, [0, 50], [0, 0.25], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const hazeFadeOut = interpolate(frame, [90, 120], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Phase 2: Golden Hour Glow (90-195)
  const goldenGlow = interpolate(frame, [90, 120], [0, 0.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const goldenFadeOut = interpolate(frame, [195, 225], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Spring to shrink icons to logo (91-195)
  // We start the shrink spring at frame 90
  const shrinkSpring = spring({ frame: Math.max(0, frame - 90), fps, config: { damping: 14, mass: 0.8 } });
  
  // Logo entrance
  const logoScale = interpolate(shrinkSpring, [0, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const logoOpacity = interpolate(frame, [90, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  // Clean dissolve at frame 195
  const phase2Dissolve = interpolate(frame, [185, 205], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Generate 30 icons (tiny bit more chaos)
  const iconData = React.useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      xOffset: (Math.random() - 0.5) * 150, // %
      yOffset: (Math.random() - 0.5) * 150, // %
      zStart: -2000 + Math.random() * 1000,
      speed: 6 + Math.random() * 8, // Slower
      isClean: i % 2 === 0, // Half messy notifications, half clean
    }));
  }, []);

  return (
    <AbsoluteFill style={{ perspective: '1000px' }}>
      {/* Hazy Overlay */}
      {frame < 120 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(229,57,53,${hazeOpacity}) 100%)`,
          mixBlendMode: 'overlay',
          opacity: hazeFadeOut,
        }} />
      )}

      {/* Golden Hour Glow */}
      {frame >= 90 && frame < 225 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 30%, rgba(255,127,17,${goldenGlow}) 0%, transparent 70%)`,
          mixBlendMode: 'soft-light',
          opacity: goldenFadeOut,
        }} />
      )}

      {/* Icons Animation */}
      {frame < 195 && iconData.map((icon) => {
        // Z-axis movement for fanning out
        let zPos = icon.zStart + frame * icon.speed;
        if (zPos > 500) zPos = -2000;

        // The messy bubbles
        const isMessyPhase = frame < 90;
        
        // Shrink target is center (0, 0, 0 in transform)
        const shrinkTranslateX = interpolate(shrinkSpring, [0, 1], [icon.xOffset, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const shrinkTranslateY = interpolate(shrinkSpring, [0, 1], [icon.yOffset, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const shrinkTranslateZ = interpolate(shrinkSpring, [0, 1], [zPos, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

        return (
          <div key={icon.id} style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) translateX(${shrinkTranslateX}vw) translateY(${shrinkTranslateY}vh) translateZ(${shrinkTranslateZ}px)`,
            opacity: interpolate(shrinkSpring, [0, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * phase2Dissolve,
          }}>
            {isMessyPhase ? (
              <div style={{
                background: 'rgba(229, 57, 53, 0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: '50%',
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter',
                fontSize: 22,
                fontWeight: 'bold',
                color: '#fff',
                boxShadow: '0 4px 15px rgba(229,57,53,0.3)',
              }}>
                999+
              </div>
            ) : (
              <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 12,
                padding: '12px 20px',
                fontFamily: 'Inter',
                fontSize: 32,
                color: '#FF7F11',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
              }}>
                {icon.isClean ? '📧' : '📅'}
              </div>
            )}
          </div>
        );
      })}

      {/* Xelo Flow Logo */}
      {frame >= 90 && frame < 205 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${logoScale})`,
          opacity: logoOpacity * phase2Dissolve,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 100,
        }}>
          <div style={{
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${B.primary} 0%, #fff 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 80px rgba(255,127,17,0.8)`,
          }}>
            <span style={{ fontSize: 80 }}>⚡</span>
          </div>
          <div style={{
            marginTop: 20,
            fontFamily: 'Inter',
            fontSize: 48,
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}>XELO FLOW</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// Phase 3: Horizon UI
const HorizonUI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Assembly animation (from frame 195)
  const uiSpring = spring({ frame: Math.max(0, frame - 195), fps, config: { damping: 14 } });
  const uiY = interpolate(uiSpring, [0, 1], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const uiOpacity = interpolate(uiSpring, [0, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      opacity: uiOpacity,
    }}>
      {/* Background Blur for the horizon */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backdropFilter: `blur(${interpolate(frame, [195, 225], [0, 16], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
        background: 'rgba(0,0,0,0.3)',
      }} />

      {/* Minimalist UI Overlay */}
      <div style={{
        transform: `translateY(${uiY}px)`,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: 40,
        padding: '60px 80px',
        boxShadow: '0 20px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '85%',
      }}>
        <div style={{
          fontFamily: 'Inter',
          fontSize: 64,
          fontWeight: 900,
          background: `linear-gradient(135deg, ${B.dark} 0%, #333 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 16,
          lineHeight: 1.1,
        }}>Your Inbox, On Autopilot.</div>
        
        <div style={{
          fontFamily: 'Inter',
          fontSize: 28,
          color: '#666',
          marginBottom: 40,
          fontWeight: 500,
          lineHeight: 1.4,
        }}>
          Stop drowning in emails.<br/>
          Let AI handle the noise while you scale.
        </div>
        
        <div style={{
          background: `linear-gradient(135deg, ${B.primary} 0%, #E66A00 100%)`,
          padding: '20px 48px',
          borderRadius: 100,
          fontFamily: 'Inter',
          fontSize: 26,
          fontWeight: 800,
          color: B.white,
          letterSpacing: 1,
          boxShadow: `0 10px 30px rgba(255,127,17,0.4)`,
        }}>
          XELO FLOW ⚡
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CinematicAd: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Temporal Scaling: original video is 5.3s, slow to 10s.
  // 5.3s = ~159 frames at 30fps.
  // We use playbackRate 0.5 to make it safe and last long enough.
  const playbackRate = 0.5;

  // Zoom effect (Ken Burns) starting around frame 150
  const zoomScale = interpolate(frame, [150, 300], [1, 1.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: B.dark, overflow: 'hidden' }}>
      
      {/* Background Video Layer */}
      <AbsoluteFill style={{ 
        transform: `scale(${zoomScale})`, 
        transformOrigin: 'center center' 
      }}>
        <Video 
          src={staticFile('wmremove-transformed.mp4')} 
          playbackRate={playbackRate}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loop={true}
        />
      </AbsoluteFill>

      {/* Frame 0-195: Icons fanning out & shrinking */}
      {frame < 195 && <IconsAndLogo />}

      {/* Frame 195-300: Horizon UI */}
      {frame >= 195 && <HorizonUI />}

    </AbsoluteFill>
  );
};
