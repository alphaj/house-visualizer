import React, { useEffect } from 'react';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';

export function SunControl({ timeOfDay = 12 }) {
    // Map time (0-24) to sun position
    // 6am = sunrise, 12 = noon, 18 = sunset

    const phi = THREE.MathUtils.mapLinear(timeOfDay, 6, 18, 0, Math.PI);
    const theta = Math.PI * 0.2; // Slight angle for variety

    const sunPosition = new THREE.Vector3().setFromSphericalCoords(100, phi, theta);

    return (
        <>
            <Sky distance={450000} sunPosition={sunPosition} incliniation={0} azimuth={0.25} />
            <directionalLight
                position={sunPosition}
                intensity={1.5}
                castShadow
                shadow-mapSize={[2048, 2048]}
            >
                <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
            </directionalLight>
            <ambientLight intensity={timeOfDay > 18 || timeOfDay < 6 ? 0.2 : 0.6} />
        </>
    );
}
