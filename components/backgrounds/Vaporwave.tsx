import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { generateVaporwaveTextures } from '../../utils/textureGenerator';

const RetroSun = () => {
  return (
    <mesh position={[0, 8, -20]}>
      <circleGeometry args={[10, 64]} />
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
            vec3 color = mix(colorBottom, colorTop, vUv.y);
            float scanline = step(0.1, mod(vUv.y * 10.0, 1.0));
            if (vUv.y < 0.5) color *= scanline;
            float horizonFade = smoothstep(0.0, 0.2, vUv.y);
            gl_FragColor = vec4(color, horizonFade);
          }
        `}
      />
    </mesh>
  );
};

const TerrainPlane = ({ position, textures }: { position: [number, number, number], textures: any }) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position}>
      {/* Widen geometry to 2 to cover screen, keep length 2 for loop logic */}
      <planeGeometry args={[2, 2, 24, 24]} />
      <meshStandardMaterial
        map={textures.gridTexture}
        displacementMap={textures.displacementTexture}
        displacementScale={0.4}
        metalnessMap={textures.metalnessTexture}
        metalness={0.96}
        roughness={0.5}
      />
    </mesh>
  );
};

const InfiniteTerrain = () => {
  const plane1 = useRef<THREE.Mesh>(null);
  const plane2 = useRef<THREE.Mesh>(null);
  const plane3 = useRef<THREE.Mesh>(null);
  const plane4 = useRef<THREE.Mesh>(null);
  
  const textures = useMemo(() => generateVaporwaveTextures(), []);

  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();
    const speed = 0.15;
    const totalLength = 8; // 4 planes * 2 length
    const offset = 6; // Shift range to [-6, 2]

    // Independent cycling logic
    // Each plane is offset by 2 units in the cycle
    if (plane1.current && plane2.current && plane3.current && plane4.current) {
      plane1.current.position.z = ((elapsedTime * speed) % totalLength) - offset;
      plane2.current.position.z = ((elapsedTime * speed + 2) % totalLength) - offset;
      plane3.current.position.z = ((elapsedTime * speed + 4) % totalLength) - offset;
      plane4.current.position.z = ((elapsedTime * speed + 6) % totalLength) - offset;
    }
  });

  return (
    <group>
      <group ref={plane1}>
        <TerrainPlane position={[0, -0.3, 0]} textures={textures} />
      </group>
      <group ref={plane2}>
        <TerrainPlane position={[0, -0.3, 0]} textures={textures} />
      </group>
      <group ref={plane3}>
        <TerrainPlane position={[0, -0.3, 0]} textures={textures} />
      </group>
      <group ref={plane4}>
        <TerrainPlane position={[0, -0.3, 0]} textures={textures} />
      </group>
    </group>
  );
};

const SceneLights = () => {
  return (
    <>
      <ambientLight intensity={10} color="#ffffff" />
      
      {/* Right Spotlight aiming left */}
      <spotLight
        color="#d53c3d"
        intensity={20}
        distance={25}
        angle={Math.PI * 0.1}
        penumbra={0.25}
        position={[0.5, 0.75, 2.2]}
        target-position={[-0.25, 0.25, 0.25]}
      />

      {/* Left Spotlight aiming right */}
      <spotLight
        color="#d53c3d"
        intensity={20}
        distance={25}
        angle={Math.PI * 0.1}
        penumbra={0.25}
        position={[-0.5, 0.75, 2.2]}
        target-position={[0.25, 0.25, 0.25]}
      />
    </>
  );
};

const Vaporwave: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-[#000000]">
      <Canvas camera={{ position: [0, 0.06, 1.1], fov: 75 }} frameloop="always">
        <fog attach="fog" args={['#000000', 1, 2.5]} />
        <SceneLights />
        <RetroSun />
        <InfiniteTerrain />
      </Canvas>
    </div>
  );
};

export default Vaporwave;
