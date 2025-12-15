import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { HouseModel } from './components/HouseModel';
import { HumanScale } from './components/HumanScale';

function App() {
  const [spacing, setSpacing] = useState(3);
  const [opacity, setOpacity] = useState(1);
  const [visibility, setVisibility] = useState({ bottom: true, middle: true, top: true });
  const [showPerson, setShowPerson] = useState(true);
  const [insideView, setInsideView] = useState(false);

  const toggleFloor = (floor) => {
    setVisibility(prev => ({ ...prev, [floor]: !prev[floor] }));
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f0f0f0' }}>
      <Canvas>
        {insideView ? (
          <PerspectiveCamera makeDefault position={[0, spacing + 1.7, 5]} fov={60} />
        ) : (
          <PerspectiveCamera makeDefault position={[10, 15, 15]} fov={45} />
        )}

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

        <Suspense fallback={null}>
          <group position={[0, -2, 0]}>
            <HouseModel floorSpacing={spacing} opacity={opacity} visibility={visibility} />
            {showPerson && <HumanScale position={[2, spacing, 2]} />}
          </group>
          <Environment preset="city" />
          <ContactShadows position={[0, -0.1, 0]} opacity={0.4} scale={20} blur={2} far={4} />
        </Suspense>

        <OrbitControls
          target={insideView ? [0, spacing + 1.7, 0] : [0, 0, 0]}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        fontFamily: 'system-ui, sans-serif',
        minWidth: '200px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>House Visualizer</h3>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500 }}>
            Floor Spacing: {spacing}m
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={spacing}
            onChange={e => setSpacing(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500 }}>
            Opacity: {Math.round(opacity * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={opacity}
            onChange={e => setOpacity(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={visibility.top}
              onChange={() => toggleFloor('top')}
            />
            <span>Top Floor (Level 2)</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={visibility.middle}
              onChange={() => toggleFloor('middle')}
            />
            <span>Middle Floor (Level 1)</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={visibility.bottom}
              onChange={() => toggleFloor('bottom')}
            />
            <span>Bottom Floor (Ground)</span>
          </label>
        </div>

        <div style={{ marginTop: '15px', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={showPerson}
              onChange={() => setShowPerson(!showPerson)}
            />
            <span>Show Person (Scale)</span>
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
            {insideView ? 'Exit Inside View' : 'Go Inside (Level 1)'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;
