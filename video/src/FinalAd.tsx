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
} from 'remotion';
import { DynamicCaptions } from './DynamicCaptions';

const CONFIG = {
  segment1End: 510, // Frame where Clock segment ends (8.5 seconds)
  segment2End: 765, // Frame where Bot Showcase ends (12.75 seconds)
  ctaStart: 1091,   // Frame where CTA appears on top of footage (approx 18.2s)
};

const B = {
  primary: '#FF7F11',
  accent:  '#A182EE',
  white:   '#FFFFFF',
};

// --- Smooth Flash Transition ---
const FlashTransition: React.FC<{ frameTrigger: number }> = ({ frameTrigger }) => {
  const frame = useCurrentFrame();
  const local = frame - frameTrigger;
  
  if (local < -10 || local > 20) return null; // Only render around the trigger point
  
  // Opacity peaks at trigger frame, quickly fades in and out
  const op = interpolate(local, [-10, 0, 20], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${B.primary}, ${B.white})`,
      opacity: op,
      mixBlendMode: 'overlay', // Makes the flash look cooler over the video
    }} />
  );
}

// --- Text Overlay Scene 1: The Clock ---
const SceneClock: React.FC = () => {
    return (
        <AbsoluteFill>
             {/* Note: I stagger the start frames of the captions to tell a story */}
             <DynamicCaptions text="Time is running out..." startFrame={30} durationInFrames={100} fontSize={80} color={B.white} />
             <DynamicCaptions text="Don't let that stop you." startFrame={130} durationInFrames={100} fontSize={80} color={B.white} />
             <DynamicCaptions text="Reclaim your time with Xelo Flow." startFrame={220} durationInFrames={120} fontSize={90} color={B.primary} />
        </AbsoluteFill>
    )
}

// --- Text Overlay Scene 2: Bot Showcase ---
const SceneBot: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const slideIn = spring({
        frame: frame - 20,
        fps,
        config: { damping: 14 }
    });

    const xPos = interpolate(slideIn, [0, 1], [-100, 40]);
    const opacity = interpolate(slideIn, [0, 1], [0, 1]);

    // Minor text added to bottom left so it doesn't block the UI
    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            <div style={{
                position: 'absolute',
                bottom: 80,
                left: xPos,
                opacity,
                background: 'rgba(5,5,10,0.7)',
                backdropFilter: 'blur(10px)',
                padding: '20px 40px',
                borderRadius: 20,
                border: `1px solid ${B.accent}55`,
            }}>
                <h2 style={{ fontFamily: 'Inter', fontSize: 40, color: B.white, margin: 0 }}>AI that thinks for you.</h2>
                <p style={{ fontFamily: 'Inter', fontSize: 24, color: B.primary, marginTop: 10, margin: 0 }}>Always working.</p>
            </div>
        </AbsoluteFill>
    )
}

// --- Text Overlay Scene 3: Man Working ---
const SceneWorking: React.FC = () => {
    return (
        <AbsoluteFill>
             <DynamicCaptions text="Busy work is dead." startFrame={10} durationInFrames={70} fontSize={90} color={B.white} />
             <DynamicCaptions text="Automate your inbox." startFrame={80} durationInFrames={80} fontSize={100} color={B.white} />
             <DynamicCaptions text="Level up your game." startFrame={160} durationInFrames={120} fontSize={120} color={B.primary} />
        </AbsoluteFill>
    )
}

// --- Text Overlay Outro ---
const SceneOutro: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const slideUp = spring({
        frame: frame - 10,
        fps,
        config: { damping: 14, stiffness: 100 }
    });

    const scale = interpolate(slideUp, [0, 1], [0.8, 1]);
    const opacity = interpolate(slideUp, [0, 1], [0, 1]);

    return (
        <AbsoluteFill style={{
            background: 'radial-gradient(circle, rgba(5, 5, 10, 0.4) 0%, rgba(5, 5, 10, 0.9) 100%)', // Subtle gradient overlay
            backdropFilter: 'blur(4px)', // Slight blur to make text pop over the video
            justifyContent: 'center',
            alignItems: 'center',
            opacity: interpolate(frame, [0, 15], [0, 1]) 
        }}>
           <div style={{
               transform: `scale(${scale})`,
               opacity,
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center'
           }}>
              <h1 style={{ fontFamily: 'Inter', fontSize: 130, fontWeight: 900, color: B.white, margin: 0, letterSpacing: '-4px', textShadow: '0 0 40px rgba(0,0,0,0.8)' }}>XELO FLOW</h1>
              <div style={{
                  marginTop: 40,
                  padding: '24px 72px',
                  background: `linear-gradient(135deg, ${B.primary}, ${B.accent})`,
                  borderRadius: 100,
                  color: B.white,
                  fontFamily: 'Inter',
                  fontWeight: 800,
                  fontSize: 32,
                  boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 60px ${B.primary}66`
              }}>
                  Get Early Access
              </div>
              <p style={{ fontFamily: 'Inter', fontSize: 28, color: B.white, opacity: 0.8, marginTop: 30, letterSpacing: '4px', textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>XELOFLOW.COM</p>
           </div>
        </AbsoluteFill>
    )
}

export const FinalAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      
      {/* 1. Base Video Layer */}
      <Video 
        src={staticFile('0421_1.mp4')} 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* 2. Text Overlays */}
      <Sequence from={0} durationInFrames={CONFIG.segment1End}>
        <SceneClock />
      </Sequence>
      
      <Sequence from={CONFIG.segment1End} durationInFrames={CONFIG.segment2End - CONFIG.segment1End}>
        <SceneBot />
      </Sequence>

      <Sequence from={CONFIG.segment2End}>
        <SceneWorking />
      </Sequence>

      <Sequence from={CONFIG.ctaStart}>
        <SceneOutro />
      </Sequence>

      {/* 3. Transitions Between Segments */}
      <FlashTransition frameTrigger={CONFIG.segment1End} />
      <FlashTransition frameTrigger={CONFIG.segment2End} />
      <FlashTransition frameTrigger={CONFIG.ctaStart} />

    </AbsoluteFill>
  );
};
