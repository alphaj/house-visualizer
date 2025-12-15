import React, { useMemo } from 'react';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import SunCalc from 'suncalc';

export function SunControl({ timeOfDay = 12, seasonMonth = 0, northOffset = 0 }) {
    // 139 May Road, Mt Roskill, Auckland
    const LAT = -36.91;
    const LON = 174.74;

    const sunPosition = useMemo(() => {
        // Construct date: Year 2025 (arbitrary), Month (0-11), Day 15
        const date = new Date(2025, seasonMonth, 15);

        // Set time (hours + fraction)
        const hours = Math.floor(timeOfDay);
        const minutes = (timeOfDay - hours) * 60;
        date.setHours(hours, minutes, 0);

        // Get sun position from library
        const { azimuth, altitude } = SunCalc.getPosition(date, LAT, LON);

        // Convert to Three.js coordinates (Y is up)
        // Azimuth: 0 is South in SunCalc reference, but we need to adjust for Three.js
        // We also apply the user's "North Offset" rotation here.

        // SunCalc: azimuth 0 is South, increasing westward? No, usually 0 is South, Math.PI is North.
        // Let's verify standard SunCalc: "azimuth in radians (direction along the horizon, measured from south to west)"
        // So 0 = South, PI/2 = West, PI = North, 3PI/2 = East.

        // Three.js: +Z is usually 'South' or 'Front', -Z is 'North' or 'Back'.
        // We need to map this carefully.

        // Let's convert Spherical (radius, phi, theta) to Cartesian.
        // Phi (elevation angle from +Y): PI/2 - altitude
        const phi = Math.PI / 2 - altitude;

        // Theta (azimuth around +Y): 
        // We want to apply the North Offset.
        // If NorthOffset = 0, we assume the model's -Z is North.

        const theta = azimuth + (northOffset * Math.PI / 180);

        return new THREE.Vector3().setFromSphericalCoords(100, phi, theta);
    }, [timeOfDay, seasonMonth, northOffset]);

    return (
        <>
            <Sky distance={450000} sunPosition={sunPosition} opacity={1} />
            <directionalLight
                position={sunPosition}
                intensity={1.5}
                castShadow
                shadow-mapSize={[2048, 2048]}
            >
                <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
            </directionalLight>
            <ambientLight intensity={sunPosition.y < 0 ? 0.1 : 0.4} />
            {/* Lower ambient light at night */}
        </>
    );
}
