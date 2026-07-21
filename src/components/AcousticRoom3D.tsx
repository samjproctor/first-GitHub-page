import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useAudioSimulation } from '../hooks/useAudioSimulation';

// Internal component to handle camera sync to audio listener
function AudioSync({
  updateListener
}: {
  updateListener: (x: number, y: number, z: number) => void
}) {
  const { camera } = useThree();
  
  useFrame(() => {
    // Sync the listener position with the camera position
    updateListener(camera.position.x, camera.position.y, camera.position.z);
  });
  return null;
}

export function AcousticRoom3D() {
  const { initAudio, isEngineReady, updateListener, updateSource, audioEngine } = useAudioSimulation();

  useEffect(() => {
    if (isEngineReady) {
      // Create sound sources for the speakers
      const leftSpeaker = audioEngine.createTestToneSource('speaker-left', 220); // A3
      const rightSpeaker = audioEngine.createTestToneSource('speaker-right', 440); // A4
      
      // Initial positioning
      updateSource('speaker-left', -2, -0.5, -3);
      updateSource('speaker-right', 2, -0.5, -3);

      if (leftSpeaker) audioEngine.setSourceVolume('speaker-left', 0.5);
      if (rightSpeaker) audioEngine.setSourceVolume('speaker-right', 0.5);
    }
  }, [isEngineReady, audioEngine, updateSource]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2rem 0' }}>
      {!isEngineReady ? (
        <button 
          onClick={initAudio}
          style={{ padding: '0.8rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Initialize Audio Engine
        </button>
      ) : (
        <div style={{ padding: '0.8rem', background: '#10b981', color: 'white', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
          Audio Engine Running - Move camera to hear spatial audio
        </div>
      )}

      <div style={{ width: '100%', height: '500px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
        <Canvas camera={{ position: [5, 4, 8], fov: 50 }} shadows>
          <color attach="background" args={['#1a1a1a']} />
          <fog attach="fog" args={['#1a1a1a', 5, 25]} />
          
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[5, 10, 3]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize-width={1024} 
            shadow-mapSize-height={1024} 
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} />

          {isEngineReady && <AudioSync updateListener={updateListener} />}

          {/* Room - Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
          
          {/* Room - Back Wall */}
          <mesh position={[0, 1, -7.5]} receiveShadow>
            <boxGeometry args={[15, 6, 0.2]} />
            <meshStandardMaterial color="#333333" />
          </mesh>

          {/* Room - Left Wall */}
          <mesh position={[-7.5, 1, 0]} receiveShadow>
            <boxGeometry args={[0.2, 6, 15]} />
            <meshStandardMaterial color="#333333" />
          </mesh>

          {/* Placeholder Acoustic Panels on Walls */}
          <mesh position={[-7.4, 1.5, -2]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 2.5, 3]} />
            <meshStandardMaterial color="#a05252" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.5, -7.4]} castShadow receiveShadow>
            <boxGeometry args={[4, 2, 0.2]} />
            <meshStandardMaterial color="#527aa0" roughness={0.9} />
          </mesh>

          {/* Center Object / Desk / Speaker placeholder */}
          {/* Left Speaker */}
          <mesh position={[-2, -0.5, -3]} castShadow receiveShadow>
            <boxGeometry args={[0.8, 3, 1]} />
            <meshStandardMaterial color="#1f1f1f" emissive="#3b82f6" emissiveIntensity={isEngineReady ? 0.5 : 0} />
          </mesh>
          {/* Right Speaker */}
          <mesh position={[2, -0.5, -3]} castShadow receiveShadow>
            <boxGeometry args={[0.8, 3, 1]} />
            <meshStandardMaterial color="#1f1f1f" emissive="#10b981" emissiveIntensity={isEngineReady ? 0.5 : 0} />
          </mesh>

          {/* Listener Position (Abstract Head) is now replaced by the camera position itself visually */}
          {/* We keep a grid for reference */}
          <Grid infiniteGrid fadeDistance={25} sectionColor="#666" cellColor="#333" position={[0, -1.99, 0]} />

          <OrbitControls 
            makeDefault
            enablePan={false} 
            minPolarAngle={Math.PI / 8} 
            maxPolarAngle={Math.PI / 2 - 0.05} 
            minDistance={3} 
            maxDistance={15} 
          />
        </Canvas>
      </div>
    </div>
  );
}
