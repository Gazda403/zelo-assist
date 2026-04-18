import React, { useMemo, useRef } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const SEPARATION = 40;
const AMOUNTX = 60;
const AMOUNTY = 60;

const Particles: React.FC<{ color1: string; color2: string; totalFrames: number }> = ({ color1, color2, totalFrames }) => {
  const frame = useCurrentFrame();
  const pointsRef = useRef<THREE.Points>(null);

  // Generate grid positions once
  const { positions, colors } = useMemo(() => {
    const numParticles = AMOUNTX * AMOUNTY;
    const positions = new Float32Array(numParticles * 3);
    const colors = new Float32Array(numParticles * 3);
    
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);

    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        // Center the grid
        positions[i * 3] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        positions[i * 3 + 1] = 0; // Y will be updated dynamically
        positions[i * 3 + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
        
        // Mix colors gradient across the field
        const mixRatio = ix / AMOUNTX;
        const col = c1.clone().lerp(c2, mixRatio);
        col.toArray(colors, i * 3);

        i++;
      }
    }
    return { positions, colors };
  }, [color1, color2]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const p = pointsRef.current.geometry.attributes.position.array as Float32Array;

    // Use loop math. frame goes from 0 to totalFrames
    const progress = frame / totalFrames; 
    const phaseOffset = progress * Math.PI * 2; // Full circle so it loops

    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        // More ambient, slower math (phaseOffset multipliers MUST be integers to loop perfectly)
        const wave1 = Math.sin((ix * 0.8 + phaseOffset * 2) * 0.3) * 25;
        const wave2 = Math.cos((iy * 0.8 + phaseOffset * 2) * 0.3) * 25;
        const wave3 = Math.sin((ix + iy + phaseOffset * 1) * 0.1) * 50;
        
        p[i * 3 + 1] = wave1 + wave2 + wave3;
        i++;
      }
    }
    // Tell threejs to update positions
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      {/* 
        Normal blending for white background, softer opacity
      */}
      <pointsMaterial
        size={8}
        vertexColors
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  );
};

export const ParticleWave: React.FC<{ color1: string; color2: string; bgColor: string }> = ({ color1, color2, bgColor }) => {
  const { durationInFrames } = useVideoConfig();

  return (
    <div style={{ flex: 1, backgroundColor: bgColor }}>
      <ThreeCanvas 
        width={1920} 
        height={1080}
        camera={{ position: [0, 800, 1500], fov: 60 }} // Look slightly down on the wave
      >
        <ambientLight intensity={1} />
        <Particles color1={color1} color2={color2} totalFrames={durationInFrames} />
      </ThreeCanvas>
    </div>
  );
};
