import React, { useRef } from 'react';
import {
  Composition,
  Sequence,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  spring,
  staticFile,
  Video,
  Audio,
  AbsoluteFill,
} from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';

// --- Brand Colors ---
const BRAND_COLORS = {
  primary: '#FF7F11',
  accent: '#A182EE',
  background: '#FAFAF9',
  dark: '#0f0f1a',
};

// --- Scene 1: Glassy Intro ---
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 30, // standard fade up duration
  });

  const logoY = interpolate(
    spring({ frame, fps, config: { damping: 14 } }),
    [0, 1],
    [50, 0]
  );
  
  const textScale = spring({
    frame: frame - 15,
    fps,
    config: { damping: 10, stiffness: 60 }
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND_COLORS.background }}>
      {/* Background Ambience reusing out_ambient but blurred */}
      <Video
        src={staticFile('out_ambient.mp4')}
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, filter: 'blur(10px)' }}
        loop
        muted
      />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity }}>
        <h1 style={{
          fontSize: 120,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 900,
          background: `linear-gradient(to right, ${BRAND_COLORS.primary}, ${BRAND_COLORS.accent})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          transform: `translateY(${logoY}px) scale(${interpolate(textScale, [0, 1], [0.95, 1])})`
        }}>
          XELO FLOW
        </h1>
        <p style={{
          fontSize: 32,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          color: '#666',
          marginTop: 20,
          opacity: Math.min(1, Math.max(0, (frame - 30) / 30)),
          transform: `translateY(${Math.max(0, 20 - frame)}px)`
        }}>
          The AI Box
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// --- 3D Elements for Scene 2 ---
const FloatingCard: React.FC<{ videoRef: React.RefObject<HTMLVideoElement | null> }> = ({ videoRef }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meshRef = useRef<THREE.Mesh>(null);

  const entryProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
    durationInFrames: 60,
  });

  const floatY = Math.sin((frame / fps) * 1.2) * 0.04;
  const floatRX = Math.cos((frame / fps) * 0.8) * 0.015;

  const posY = interpolate(entryProgress, [0, 1], [-3, 0]) + floatY;
  const opacity = interpolate(entryProgress, [0, 0.6], [0, 1]);

  const videoTexture = videoRef.current
    ? new THREE.VideoTexture(videoRef.current as HTMLVideoElement)
    : null;

  if (videoTexture) {
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.colorSpace = THREE.SRGBColorSpace;
  }

  return (
    <group position={[1.2, posY, 0]}>
      {/* Glow */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[3.8, 2.5]} />
        <meshBasicMaterial color={BRAND_COLORS.primary} transparent opacity={0.08 * entryProgress} />
      </mesh>

      {/* Frame */}
      <mesh
        ref={meshRef}
        rotation={[floatRX, -0.28, 0.04]}
        position={[0, 0, 0]}
      >
        <planeGeometry args={[3.6, 2.3]} />
        <meshStandardMaterial
          color={BRAND_COLORS.dark}
          transparent
          opacity={0.9 * opacity}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Screen */}
      <mesh
        rotation={[floatRX, -0.28, 0.04]}
        position={[0, 0, 0.01]}
      >
        <planeGeometry args={[3.5, 2.2]} />
        {videoTexture ? (
          <meshBasicMaterial map={videoTexture} transparent opacity={opacity} />
        ) : (
          <meshBasicMaterial color="#0f0f1a" transparent opacity={opacity} />
        )}
      </mesh>

      {/* Edge Highlights */}
      <mesh rotation={[floatRX, -0.28, 0.04]} position={[0, 1.12, 0.02]}>
        <planeGeometry args={[3.5, 0.04]} />
        <meshBasicMaterial color={BRAND_COLORS.primary} transparent opacity={0.6 * opacity} />
      </mesh>
      <mesh rotation={[floatRX, -0.28, 0.04]} position={[-1.76, 0, 0.02]}>
        <planeGeometry args={[0.04, 2.2]} />
        <meshBasicMaterial color={BRAND_COLORS.accent} transparent opacity={0.4 * opacity} />
      </mesh>
    </group>
  );
};

// --- Scene 2: 3D Inbox Reveal ---
const InboxRevealScene: React.FC = () => {
    const { width, height } = useVideoConfig();
    const frame = useCurrentFrame();
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const titleOpacity = spring({
        frame: frame - 30, // delay title slightly
        fps: 60,
        config: { damping: 200 }
    });

    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            <Video
                src={staticFile('out_ambient.mp4')}
                style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
                loop
                muted
            />
            {/* Using the promo_ad video for the 3D inbox reveal to integrate the user's video into the aesthetic */}
            <Video
                ref={videoRef as any}
                src={staticFile('promo_ad.mp4')}
                style={{ display: 'none', filter: 'sepia(0.2) hue-rotate(-30deg) saturate(1.2)' }}
                loop
                muted
            />
            
            <ThreeCanvas width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
                 <ambientLight intensity={0.4} />
                 <spotLight position={[-4, 4, 4]} intensity={1.5} color={BRAND_COLORS.primary} angle={0.4} penumbra={0.8} />
                 <spotLight position={[5, -2, 3]} intensity={0.8} color={BRAND_COLORS.accent} angle={0.5} penumbra={1} />
                 <pointLight position={[0, 0, 3]} intensity={0.3} color={BRAND_COLORS.background} />
                 <FloatingCard videoRef={videoRef} />
            </ThreeCanvas>

            <div style={{
                position: 'absolute',
                top: '15%',
                left: '8%',
                width: '40%',
                zIndex: 2,
                fontFamily: 'Inter, sans-serif',
                opacity: titleOpacity,
            }}>
                <h1 style={{
                    fontSize: 72,
                    color: 'white',
                    fontWeight: 900,
                    margin: 0,
                    textShadow: '0 4px 30px rgba(0,0,0,0.5)',
                }}>
                  Priority.<br/>Always on.
                </h1>
                <p style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)', marginTop: 20, lineHeight: 1.5 }}>
                  The first email system that filters, thinks, and drafts for you—before you even open it.
                </p>
            </div>
        </AbsoluteFill>
    )
}

// --- Scene 3: Feature Callouts (Simple & Clean) ---
const FeatureCallout: React.FC<{ title: string, subtitle: string, imageFile?: string, alignRight?: boolean }> = ({ title, subtitle, imageFile, alignRight }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const slideIn = spring({
        frame,
        fps,
        config: { damping: 15 },
        durationInFrames: 45
    });

    const contentX = alignRight ? 
        interpolate(slideIn, [0, 1], [50, 0]) : 
        interpolate(slideIn, [0, 1], [-50, 0]);

    return (
        <AbsoluteFill style={{ backgroundColor: BRAND_COLORS.background }}>
             {/* Abstract Lines BG reused behind callouts */}
            <Video
                src={staticFile('out_ambient.mp4')}
                style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.05 }}
                loop
                muted
            />
            
            <div style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                flexDirection: alignRight ? 'row-reverse' : 'row',
                alignItems: 'center',
                padding: '0 8%',
                gap: '5%'
            }}>
                <div style={{ 
                    flex: 1, 
                    transform: `translateX(${contentX}px)`,
                    opacity: slideIn
                }}>
                    <h2 style={{
                        fontSize: 64,
                        fontFamily: 'Inter',
                        fontWeight: 800,
                        margin: 0,
                        color: BRAND_COLORS.dark,
                        lineHeight: 1.1
                    }}>
                        {title}
                    </h2>
                    <p style={{
                        fontSize: 28,
                        fontFamily: 'Inter',
                        color: '#666',
                        marginTop: 20
                    }}>
                        {subtitle}
                    </p>
                </div>

                <div style={{
                     flex: 1.5,
                     height: '70%',
                     backgroundColor: 'white',
                     borderRadius: 24,
                     boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                     position: 'relative',
                     overflow: 'hidden',
                     transform: `scale(${interpolate(slideIn, [0, 1], [0.95, 1])})`,
                     opacity: slideIn
                }}>
                    {/* Inserting the resized/cropped promo_ad video into the Feature Callout Frame */}
                    <AbsoluteFill style={{ overflow: 'hidden', borderRadius: 24 }}>
                        <Video
                            src={staticFile('promo_ad.mp4')}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.2)' }}
                            muted
                            loop
                        />
                    </AbsoluteFill>
                </div>
            </div>
        </AbsoluteFill>
    );
};

// --- Scene 4: Outro ---
const OutroScene: React.FC = () => {
    const frame = useCurrentFrame();
    
    return (
        <AbsoluteFill style={{ 
            backgroundColor: BRAND_COLORS.dark, 
            justifyContent: 'center', 
            alignItems: 'center',
            opacity: Math.min(1, frame / 30)
        }}>
            <h1 style={{
                fontSize: 80,
                fontFamily: 'Inter',
                fontWeight: 900,
                color: 'white',
                margin: 0
            }}>
                Ready to delegate?
            </h1>
            <div style={{
                marginTop: 40,
                padding: '16px 48px',
                backgroundColor: BRAND_COLORS.primary,
                borderRadius: 100,
                color: 'white',
                fontSize: 24,
                fontFamily: 'Inter',
                fontWeight: 600
            }}>
                Get Early Access
            </div>
        </AbsoluteFill>
    )
}

// --- Main Sequence Composition ---
export const XeloPromo: React.FC = () => {
  return (
    <div style={{ flex: 1, backgroundColor: 'black' }}>
      <Audio 
         src={staticFile('promo_music.mp3')} 
         volume={(f) => interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })}
      />

      <Sequence from={0} durationInFrames={120}>
        <IntroScene />
      </Sequence>

      <Sequence from={120} durationInFrames={360}>
        <InboxRevealScene />
      </Sequence>

      <Sequence from={480} durationInFrames={240}>
        <FeatureCallout 
            title="Enhanced writing and sending." 
            subtitle="Let the Auto-Acknowledgment Bot handle common inquiries instantly while you focus on deep work."
            alignRight={false}
        />
      </Sequence>

      <Sequence from={720} durationInFrames={240}>
        <FeatureCallout 
            title="Live in the future." 
            subtitle="The Startup Bot filters noise and surfaces Critical Priority emails like investor outreach automatically."
            alignRight={true}
        />
      </Sequence>

      <Sequence from={960} durationInFrames={180}>
          <OutroScene />
      </Sequence>

    </div>
  );
};
