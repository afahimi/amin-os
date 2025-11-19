import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, Line, Stars } from '@react-three/drei';
import * as THREE from 'three';

const Nodes = () => {
  const count = 40;
  // Generate random positions
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10; // z
    }
    return pos;
  }, []);

  // Generate random connections
  const connections = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      // Connect each node to 2 others to form a web
      const start = new THREE.Vector3(positions[i*3], positions[i*3+1], positions[i*3+2]);
      for (let j = 0; j < 2; j++) {
        const targetIdx = Math.floor(Math.random() * count);
        const end = new THREE.Vector3(positions[targetIdx*3], positions[targetIdx*3+1], positions[targetIdx*3+2]);
        points.push(start);
        points.push(end);
      }
    }
    return points;
  }, [positions]);

  return (
    <group>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#22d3ee"
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
      <Line 
        points={connections}
        color="#a855f7"
        opacity={0.1}
        transparent
        lineWidth={1}
      />
    </group>
  );
};

const SceneContent = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <Nodes />
      </Float>
    </group>
  );
};

const ThinkingNebula: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#050608]">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <color attach="background" args={['#050608']} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.5} />
        <SceneContent />
      </Canvas>
      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#050608_100%)] opacity-80" />
    </div>
  );
};

export default ThinkingNebula;