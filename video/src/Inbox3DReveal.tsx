import React, { useRef } from 'react';
import { useCurrentFrame, useVideoConfig, Video, staticFile, interpolate, spring } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// --- The 3D floating screen card ---
const FloatingCard: React.FC<{ videoRef: React.RefObject<HTMLVideoElement | null> }> = ({ videoRef }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const meshRef = useRef<THREE.Mesh>(null);

  // Entry spring animation — card pops up from below
  const entryProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
    durationInFrames: 60,
  });

  // Breathing float animation — subtle continuous drift
  const floatY = Math.sin((frame / fps) * 1.2) * 0.04;
  const floatRX = Math.cos((frame / fps) * 0.8) * 0.015;

  // Entry animation: slides up from -3 to 0, fades in
  const posY = interpolate(entryProgress, [0, 1], [-3, 0]) + floatY;
  const opacity = interpolate(entryProgress, [0, 0.6], [0, 1]);

  // Live video texture from the <video> element
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
      {/* --- Screen card --- */}
      {/* Glowing shadow/halo behind the card */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[3.8, 2.5]} />
        <meshBasicMaterial color="#FF7F11" transparent opacity={0.08 * entryProgress} />
      </mesh>

      {/* Main card shell (slightly larger than the screen for border effect) */}
      <mesh 
        ref={meshRef}
        rotation={[floatRX, -0.28, 0.04]}
        position={[0, 0, 0]}
      >
        <planeGeometry args={[3.6, 2.3]} />
        <meshStandardMaterial
          color="#1a1a2e"
          transparent
          opacity={0.9 * opacity}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* The actual video screen (slightly inset) */}
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

      {/* Top edge highlight — simulates screen edge glow */}
      <mesh rotation={[floatRX, -0.28, 0.04]} position={[0, 1.12, 0.02]}>
        <planeGeometry args={[3.5, 0.04]} />
        <meshBasicMaterial color="#FF7F11" transparent opacity={0.6 * opacity} />
      </mesh>

      {/* Left edge highlight */}
      <mesh rotation={[floatRX, -0.28, 0.04]} position={[-1.76, 0, 0.02]}>
        <planeGeometry args={[0.04, 2.2]} />
        <meshBasicMaterial color="#A182EE" transparent opacity={0.4 * opacity} />
      </mesh>
    </group>
  );
};

// --- The 3D scene container ---
const Scene3D: React.FC<{ videoRef: React.RefObject<HTMLVideoElement | null> }> = ({ videoRef }) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <spotLight position={[-4, 4, 4]} intensity={1.5} color="#FF7F11" angle={0.4} penumbra={0.8} />
      <spotLight position={[5, -2, 3]} intensity={0.8} color="#A182EE" angle={0.5} penumbra={1} />
      <pointLight position={[0, 0, 3]} intensity={0.3} color="#FAFAF9" />
      <FloatingCard videoRef={videoRef} />
    </>
  );
};

// --- Main Exported Composition ---
export const Inbox3DReveal: React.FC = () => {
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>

      {/* === Layer 1: Background Video (out_ambient.mp4) === */}
      <Video
        src={staticFile('out_ambient.mp4')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
        loop
        muted
      />

      {/* === Layer 2: Hidden <video> for 3D texture source === */}
      <Video
        ref={videoRef as any}
        src={staticFile('inbox_recording.mp4')}
        style={{ display: 'none' }}
        loop
        muted
      />

      {/* === Layer 3: Three.js 3D Scene === */}
      <ThreeCanvas
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
      >
        <Scene3D videoRef={videoRef} />
      </ThreeCanvas>

      {/* === Layer 4: Text Overlay (top-center, like reference image) === */}
      <div style={{
        position: 'absolute',
        top: '10%',
        width: '100%',
        textAlign: 'center',
        zIndex: 2,
        opacity: Math.min(1, frame / 30),
        fontFamily: 'Inter, -apple-system, sans-serif',
        pointerEvents: 'none',
      }}>
        <p style={{
          fontSize: 22,
          color: '#FF7F11',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          margin: 0,
          marginBottom: 8,
          opacity: 0.85,
        }}>
          XeloFlow
        </p>
        <h1 style={{
          fontSize: 72,
          color: 'white',
          fontWeight: 900,
          margin: 0,
          lineHeight: 1.1,
          textShadow: '0 4px 30px rgba(0,0,0,0.3)',
        }}>
          AI Inbox
        </h1>
        <p style={{
          fontSize: 24,
          color: 'rgba(255,255,255,0.6)',
          fontWeight: 500,
          margin: '12px 0 0 0',
        }}>
          Priority. Always on.
        </p>
      </div>
    </div>
  );
};
