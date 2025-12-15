import React, { useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export function MeasurementTool({ isActive }) {
    const [points, setPoints] = useState([]);
    const { scene, camera } = useThree();

    const handleClick = (e) => {
        if (!isActive) return;
        e.stopPropagation();

        // Only allow two points
        if (points.length >= 2) {
            setPoints([e.point]);
        } else {
            setPoints([...points, e.point]);
        }
    };

    // Add global click listener to the scene
    // Note: We'll rely on the parent Canvas `onPointerMissed` or mesh events for clicks
    // But for now, we'll attach this listener logic to the meshes in the scene via a wrapper or Context
    // Simplest approach: This component renders a large transparent plane to catch clicks if active

    return (
        <group>
            {isActive && (
                <mesh
                    visible={false}
                    onClick={handleClick}
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, 5, 0]}
                >
                    <planeGeometry args={[100, 100]} />
                </mesh>
            )}

            {/* Render Points */}
            {points.map((p, i) => (
                <mesh key={i} position={p}>
                    <sphereGeometry args={[0.1, 16, 16]} />
                    <meshBasicMaterial color="red" />
                </mesh>
            ))}

            {/* Render Line */}
            {points.length === 2 && (
                <>
                    <line>
                        <bufferGeometry>
                            <bufferAttribute
                                attach="attributes-position"
                                count={2}
                                array={new Float32Array([
                                    points[0].x, points[0].y, points[0].z,
                                    points[1].x, points[1].y, points[1].z
                                ])}
                                itemSize={3}
                            />
                        </bufferGeometry>
                        <lineBasicMaterial color="red" linewidth={2} />
                    </line>
                    <Html position={[
                        (points[0].x + points[1].x) / 2,
                        (points[0].y + points[1].y) / 2 + 0.5,
                        (points[0].z + points[1].z) / 2
                    ]}>
                        <div style={{ background: 'black', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>
                            {points[0].distanceTo(points[1]).toFixed(2)}m
                        </div>
                    </Html>
                </>
            )}
        </group>
    );
}
