import React, { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Custom shader to remove white/light background AND displace walls
const chromaKeyShader = {
  uniforms: {
    uTexture: { value: null },
    uThreshold: { value: 0.1 }, // Tolerance for "white"
    uSmoothness: { value: 0.1 },
    uOpacity: { value: 1.0 },
    uDisplacementScale: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float uDisplacementScale;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      if (uDisplacementScale > 0.01) {
        vec4 texColor = texture2D(uTexture, uv);
        // Calculate luminance (brightness)
        float brightness = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
        
        // Invert: Dark pixels (walls) -> High displacement (1.0)
        // Light pixels (floor) -> Low displacement (0.0)
        float displacement = 1.0 - smoothstep(0.4, 0.8, brightness);
        
        pos.z += displacement * uDisplacementScale;
      }

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
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

export function FloorPlane({ image, position, visible = true, opacity = 1, displacementScale = 0 }) {
  const texture = useTexture(image);

  const baseWidth = 10;
  const ratio = texture.image ? (texture.image.height / texture.image.width) : 1;
  const height = baseWidth * ratio;

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTexture: { value: texture },
      uThreshold: { value: 0.15 }, // Adjusted threshold
      uSmoothness: { value: 0.1 },
      uOpacity: { value: opacity },
      uDisplacementScale: { value: displacementScale }
    },
    vertexShader: chromaKeyShader.vertexShader,
    fragmentShader: chromaKeyShader.fragmentShader,
    transparent: true,
    side: THREE.DoubleSide
  }), [texture, opacity, displacementScale]);

  return (
    <group position={position} visible={visible}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        {/* Increase segments for better displacement resolution */}
        <planeGeometry args={[baseWidth, height, 128, 128]} />
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
