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
  primary: '#FF7F11',
  accent:  '#A182EE',
  dark:    '#05050A',
  white:   '#FFFFFF',
};

// --- Scene 1: The Disruptor Hook (0-1s) ---
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const s = spring({ frame, fps, config: { damping: 10, mass: 0.5 } });
  const scale = interpolate(s, [0, 1], [4, 1]);
  const rotate = interpolate(s, [0, 1], [15, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: B.primary, justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{
        fontFamily: 'Inter', fontSize: 180, fontWeight: 900, color: B.white,
        textAlign: 'center', transform: `scale(${scale}) rotate(${rotate}deg)`,
        margin: 0, textShadow: '0 20px 80px rgba(0,0,0,0.4)',
      }}>
        STOP.
      </h1>
    </AbsoluteFill>
  );
};

// --- Scene 2: The Chaos Reveal (1-3s) ---
const ChaosScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Managing Email is a nightmare."
  return (
    <AbsoluteFill style={{ backgroundColor: B.dark }}>
       <DynamicCaptions 
          text="Your inbox is stealing your life." 
          startFrame={0} 
          durationInFrames={120} 
          fontSize={110}
          color={B.white}
       />
       {/* Background of floating, chaotic particles */}
       <AbsoluteFill style={{ opacity: 0.3 }}>
          {Array.from({ length: 20 }).map((_, i) => {
            const rot = (frame * (1 + i * 0.1)) % 360;
            return (
              <div key={i} style={{
                position: 'absolute',
                left: `${(i * 7) % 100}%`,
                top: `${(i * 13) % 100}%`,
                width: 100, height: 100,
                border: '1px solid white',
                transform: `rotate(${rot}deg)`,
                opacity: 0.2
              }} />
            )
          })}
       </AbsoluteFill>
    </AbsoluteFill>
  );
};

// --- Scene 3: The Result (3-7s) ---
const ResultScene: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: B.dark }}>
             <DynamicCaptions 
                text="Xelo Flow handles it so you don't have to." 
                startFrame={0} 
                durationInFrames={240} 
                fontSize={90}
                color={B.accent}
             />
        </AbsoluteFill>
    )
}

// --- Outro (7-10s) ---
const Outro: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: B.primary, justifyContent: 'center', alignItems: 'center' }}>
            <h1 style={{ fontFamily: 'Inter', fontSize: 100, fontWeight: 900, color: 'white', textAlign: 'center' }}>
                XELOFLOW.COM
            </h1>
            <p style={{ fontFamily: 'Inter', fontSize: 30, color: 'white', marginTop: 20 }}>
                Link in Bio.
            </p>
        </AbsoluteFill>
    )
}

export const ViralHook: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: B.dark }}>
      <Audio 
        src={staticFile('promo_music.mp3')} 
        volume={(f) => interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })}
      />
      
      <Sequence from={0} durationInFrames={60}>
        <HookScene />
      </Sequence>
      
      <Sequence from={60} durationInFrames={120}>
        <ChaosScene />
      </Sequence>

      <Sequence from={180} durationInFrames={240}>
        <ResultScene />
      </Sequence>

      <Sequence from={420} durationInFrames={180}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
