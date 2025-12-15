import React, { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Custom shader to remove white/light background
const chromaKeyShader = {
  uniforms: {
    uTexture: { value: null },
    uThreshold: { value: 0.1 }, // Tolerance for "white"
    uSmoothness: { value: 0.1 },
    uOpacity: { value: 1.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uThreshold;
    uniform float uSmoothness;
    uniform float uOpacity;
    varying vec2 vUv;

    void main() {
      vec4 texColor = texture2D(uTexture, vUv);
      
      // Calculate distance from white (1.0, 1.0, 1.0)
      float dist = distance(texColor.rgb, vec3(1.0, 1.0, 1.0));
      
      // Smooth alpha transition
      float alpha = smoothstep(uThreshold, uThreshold + uSmoothness, dist);
      
      gl_FragColor = vec4(texColor.rgb, texColor.a * alpha * uOpacity);
      
      // Discard largely transparent pixels to correct depth sorting issues if needed
      if (gl_FragColor.a < 0.1) discard;
    }
  `
};

export function FloorPlane({ image, position, visible = true, opacity = 1 }) {
  const texture = useTexture(image);

  const baseWidth = 10;
  const ratio = texture.image ? (texture.image.height / texture.image.width) : 1;
  const height = baseWidth * ratio;

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTexture: { value: texture },
      uThreshold: { value: 0.15 }, // Adjusted threshold
      uSmoothness: { value: 0.1 },
      uOpacity: { value: opacity }
    },
    vertexShader: chromaKeyShader.vertexShader,
    fragmentShader: chromaKeyShader.fragmentShader,
    transparent: true,
    side: THREE.DoubleSide
  }), [texture, opacity]);

  return (
    <group position={position} visible={visible}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[baseWidth, height]} />
        <shaderMaterial attach="material" args={[shaderArgs]} />
      </mesh>

      {/* Floor Slab (Thickness) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <boxGeometry args={[baseWidth, height, 0.1]} />
        <meshStandardMaterial color="#e0e0e0" opacity={0.6 * opacity} transparent />
      </mesh>
    </group>
  );
}
