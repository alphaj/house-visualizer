import React from 'react';

export function HumanScale({ position }) {
    return (
        <group position={position}>
            {/* Body */}
            <mesh position={[0, 0.9, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 1.8, 16]} />
                <meshStandardMaterial color="#007bff" />
            </mesh>
            {/* Head */}
            <mesh position={[0, 1.8 + 0.15, 0]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#ffccaa" />
            </mesh>
        </group>
    );
}
