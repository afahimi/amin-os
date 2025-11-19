import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

const PixelNightSky: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-[#020617]">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <color attach="background" args={['#020617']} />
        {/* Reduced count, slower speed, smaller factor for less chaos */}
        <Stars radius={50} depth={50} count={1000} factor={3} saturation={0} fade speed={0.2} />
      </Canvas>
    </div>
  );
};

export default PixelNightSky;
