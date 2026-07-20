import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

export function AcousticRoom3D() {
  return (
    <div style={{ width: '100%', height: '500px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', margin: '2rem 0', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
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
          <meshStandardMaterial color="#1f1f1f" />
        </mesh>
        {/* Right Speaker */}
        <mesh position={[2, -0.5, -3]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 3, 1]} />
          <meshStandardMaterial color="#1f1f1f" />
        </mesh>

        {/* Listener Position (Abstract Head) */}
        <mesh position={[0, -0.5, 1]} castShadow receiveShadow>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.2} metalness={0.8} />
        </mesh>

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
  );
}
