import React from 'react';
import { FloorPlane } from './FloorPlane';

export function HouseModel({ floorSpacing = 3, opacity = 1, visibility, displacementScale = 0 }) {
    return (
        <group>
            {/* Bottom Floor */}
            <FloorPlane
                image="/textures/bottom.jpg"
                position={[0, 0, 0]}
                visible={visibility.bottom}
                opacity={opacity}
                displacementScale={displacementScale}
            />

            {/* Middle Floor */}
            <FloorPlane
                image="/textures/middle.png"
                position={[0, floorSpacing, 0]}
                visible={visibility.middle}
                opacity={opacity}
                displacementScale={displacementScale}
            />

            {/* Top Floor */}
            <FloorPlane
                image="/textures/top.png"
                position={[0, floorSpacing * 2, 0]}
                visible={visibility.top}
                opacity={opacity}
                displacementScale={displacementScale}
            />
        </group>
    );
}
