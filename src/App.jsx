import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, Html } from '@react-three/drei';
import { HouseModel } from './components/HouseModel';
import { HumanScale } from './components/HumanScale';
import { SunControl } from './components/SunControl';
import { MeasurementTool } from './components/MeasurementTool';
import * as THREE from 'three';

function App() {
  const [spacing, setSpacing] = useState(3);
  const [opacity, setOpacity] = useState(1);
  const [visibility, setVisibility] = useState({ bottom: true, middle: true, top: true });
  const [showPerson, setShowPerson] = useState(true);
  const [insideView, setInsideView] = useState(false);

  // New State
  const [timeOfDay, setTimeOfDay] = useState(14); // 2pm default
  const [wallHeight, setWallHeight] = useState(0); // 0 = flat, >0 = 3D
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);

  const toggleFloor = (floor) => {
    setVisibility(prev => ({ ...prev, [floor]: !prev[floor] }));
  };

  const handleCanvasClick = (e) => {
    if (!measurementMode) return;
    e.stopPropagation();
    // Logic moved to MeasurementTool or handled here.
    // Ideally MeasurementTool handles it but it needs to capture clicks on the meshes.
    // For simplicity, we'll let the user click on the floors.
    if (measurePoints.length >= 2) {
      setMeasurePoints([e.point]);
    } else {
      setMeasurePoints([...measurePoints, e.point]);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f0f0f0' }}>
      <Canvas onClick={handleCanvasClick}>
        {insideView ? (
          <PerspectiveCamera makeDefault position={[0, spacing + 1.7, 5]} fov={60} />
        ) : (
          <PerspectiveCamera makeDefault position={[10, 15, 15]} fov={45} />
        )}

        <SunControl timeOfDay={timeOfDay} />

        <Suspense fallback={null}>
          <group position={[0, -2, 0]}>
            {/* We need to update HouseModel to accept displacementScale. I'll pass it as a prop after updating the file. */}
            <HouseModel
              floorSpacing={spacing}
              opacity={opacity}
              visibility={visibility}
              displacementScale={wallHeight}
            />
            {showPerson && <HumanScale position={[2, spacing, 2]} />}

            {/* Measurement Visualization */}
            {measurementMode && measurePoints.map((p, i) => (
              <mesh key={i} position={p}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshBasicMaterial color="red" />
              </mesh>
            ))}
            {measurementMode && measurePoints.length === 2 && (
              <MeasurementLine start={measurePoints[0]} end={measurePoints[1]} />
            )}

          </group>
          {/* <Environment preset="city" /> Removing environment map so SunControl dominates lighting */}
          <ContactShadows position={[0, -0.1, 0]} opacity={0.4} scale={20} blur={2} far={4} />
        </Suspense>

        <OrbitControls
          target={insideView ? [0, spacing + 1.7, 0] : [0, 0, 0]}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          enabled={!measurementMode} // Disable orbit when measuring to avoid drag
        />
      </Canvas>

      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)',
        fontFamily: 'system-ui, sans-serif',
        minWidth: '220px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>House Visualizer Pro</h3>

        {/* Helper Message */}
        {measurementMode && (
          <div style={{ background: '#ffeb3b', padding: '8px', borderRadius: '4px', marginBottom: '10px', fontSize: '12px' }}>
            Click two points on the model to measure.
          </div>
        )}

        {/* --- Advanced Controls --- */}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 600 }}>
            ☀️ Time: {Math.floor(timeOfDay)}:00
          </label>
          <input
            type="range" min="6" max="20" step="0.5"
            value={timeOfDay} onChange={e => setTimeOfDay(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 600 }}>
            🧱 3D Walls: {(wallHeight * 10).toFixed(1)}m
          </label>
          <input
            type="range" min="0" max="3" step="0.1"
            value={wallHeight} onChange={e => setWallHeight(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <button
          onClick={() => {
            setMeasurementMode(!measurementMode);
            setMeasurePoints([]);
          }}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '15px',
            background: measurementMode ? '#e91e63' : '#eee',
            color: measurementMode ? 'white' : 'black',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          {measurementMode ? '📏 Stop Measuring' : '📏 Measure Dist'}
        </button>


        {/* --- Standard Controls --- */}
        <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '15px 0' }} />

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500 }}>
            Floor Spacing: {spacing}m
          </label>
          <input
            type="range" min="0" max="10" step="0.1"
            value={spacing} onChange={e => setSpacing(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500 }}>
            Opacity: {Math.round(opacity * 100)}%
          </label>
          <input
            type="range" min="0.1" max="1" step="0.1"
            value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={visibility.top} onChange={() => toggleFloor('top')} />
            <span>Top Floor</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={visibility.middle} onChange={() => toggleFloor('middle')} />
            <span>Middle Floor</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={visibility.bottom} onChange={() => toggleFloor('bottom')} />
            <span>Bottom Floor</span>
          </label>
        </div>

        <div style={{ marginTop: '15px', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
            <input type="checkbox" checked={showPerson} onChange={() => setShowPerson(!showPerson)} />
            <span>Show Person</span>
          </label>
          <button
            onClick={() => setInsideView(!insideView)}
            style={{
              width: '100%',
              padding: '8px',
              background: insideView ? '#4a90e2' : '#eee',
              color: insideView ? 'white' : 'black',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {insideView ? 'Exit Inside View' : 'Go Inside'}
          </button>
        </div>

      </div>
    </div>
  );
}

// Simple internal component for the line
function MeasurementLine({ start, end }) {
  const points = [start, end];
  const distance = start.distanceTo(end);

  return (
    <>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([start.x, start.y, start.z, end.x, end.y, end.z])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#e91e63" linewidth={3} />
      </line>
      <Html position={[(start.x + end.x) / 2, (start.y + end.y) / 2 + 0.5, (start.z + end.z) / 2]}>
        <div style={{ background: '#e91e63', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
          {distance.toFixed(2)}m
        </div>
      </Html>
    </>
  );
}

export default App;
