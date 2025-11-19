import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RetroSun = () => {
  return (
    <mesh position={[0, 0, -20]}>
      <circleGeometry args={[12, 64]} />
      <shaderMaterial
        transparent
        uniforms={{
          colorTop: { value: new THREE.Color('#ff00ff') },
          colorBottom: { value: new THREE.Color('#ffbd00') }
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 colorTop;
          uniform vec3 colorBottom;
          varying vec2 vUv;
          void main() {
            // Gradient
            vec3 color = mix(colorBottom, colorTop, vUv.y);
            
            // Scanlines
            float scanline = step(0.1, mod(vUv.y * 10.0, 1.0));
            if (vUv.y < 0.5) {
                color *= scanline;
            }
            
            // Horizon blend (fade out bottom)
            float horizonFade = smoothstep(0.0, 0.2, vUv.y);
            
            gl_FragColor = vec4(color, horizonFade);
          }
        `}
      />
    </mesh>
  );
};

const InfiniteGrid = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      // Invert direction: was -=, now +=
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[100, 100, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        side={THREE.DoubleSide}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new THREE.Color('#ff00ff') },
          uBgColor: { value: new THREE.Color('#1e002e') }
        }}
        vertexShader={`
          varying vec2 vUv;
          varying float vDepth;
          void main() {
            vUv = uv;
            vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
            vDepth = -viewPos.z; // Positive depth
            gl_Position = projectionMatrix * viewPos;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          uniform vec3 uBgColor;
          varying vec2 vUv;
          varying float vDepth;

          void main() {
            // Grid logic
            float scale = 20.0;
            
            // Move Y to simulate forward movement
            // Slower speed: 0.5 instead of 2.0
            vec2 gridUv = vUv * scale;
            gridUv.y += uTime * 0.5; 

            // Create lines
            float thickness = 0.05;
            float xLine = step(1.0 - thickness, mod(gridUv.x, 1.0));
            float yLine = step(1.0 - thickness, mod(gridUv.y, 1.0));
            float grid = max(xLine, yLine);

            // Fade out into distance to prevent jitter (Moiré)
            // vDepth is distance from camera.
            // Fade starts at 10, ends at 40.
            float alpha = 1.0 - smoothstep(10.0, 40.0, vDepth);
            
            vec3 color = mix(uBgColor, uColor, grid);
            
            // Mix with background color based on alpha to simulate fog
            vec3 finalColor = mix(uBgColor, color, alpha);
            
            gl_FragColor = vec4(finalColor, 1.0);
          }
        `}
      />
    </mesh>
  );
};

const Vaporwave: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-[#1e002e]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e002e] via-[#3b0764] to-[#1e002e]" />
      <Canvas camera={{ position: [0, 3, 5], fov: 60 }} frameloop="always">
        <RetroSun />
        <InfiniteGrid />
      </Canvas>
    </div>
  );
};

export default Vaporwave;
