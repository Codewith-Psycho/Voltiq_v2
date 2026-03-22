'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Box, Line, Billboard, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useVoltStore } from '@/lib/store';
import {
  AirVent, Droplets, WashingMachine, Tv, Lightbulb, Plug, Refrigerator, Fan, Smartphone, Zap
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  AirVent, Droplets, WashingMachine, Tv, Lightbulb, Plug, Refrigerator, Fan, Smartphone
};

// Helper component for particles moving along a line
function FlowParticles({ start, end, active }: { start: THREE.Vector3, end: THREE.Vector3, active: boolean }) {
  const points = useMemo(() => {
    return Array.from({ length: 3 }).map(() => ({
      progress: Math.random(),
      speed: 0.5 + Math.random() * 0.5,
    }));
  }, []);

  const particlesRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!active || !particlesRef.current) return;
    points.forEach((p, i) => {
      p.progress += p.speed * delta;
      if (p.progress > 1) p.progress = 0;
      
      const mesh = particlesRef.current!.children[i] as THREE.Mesh;
      if (mesh) {
        mesh.position.lerpVectors(start, end, p.progress);
      }
    });
  });

  if (!active) return null;

  return (
    <group ref={particlesRef}>
      {points.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#00e5ff" />
        </mesh>
      ))}
    </group>
  );
}

// Helper component for an Appliance Node
function ApplianceNode({ position, name, isOn, kw, iconName }: { position: THREE.Vector3, name: string, isOn: boolean, kw: number, iconName: string }) {
  const IconComponent = iconMap[iconName] || Zap;

  return (
    <group position={position}>
      <Html center transform sprite distanceFactor={8} zIndexRange={[100, 0]}
        style={{ pointerEvents: 'none' }}>
        <div className="flex flex-col items-center justify-center gap-1 pointer-events-none" style={{ transform: 'scale(0.85)' }}>
          {/* Top Label */}
          <div className="text-white text-[9px] font-medium tracking-wide whitespace-nowrap bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
            {name}
          </div>
          
          {/* Icon Box */}
          <div className={`flex items-center justify-center p-1.5 rounded-lg border 
            ${isOn ? 'bg-[#0a0f1c]/90 border-cyan-400/60 shadow-[0_0_8px_rgba(0,229,255,0.3)]' : 'bg-[#0a0f1c]/60 border-gray-700/40'} transition-all duration-300`}>
            <IconComponent className={`w-4 h-4 ${isOn ? 'text-cyan-400' : 'text-gray-500'}`} />
          </div>

          {/* Bottom kW label */}
          {isOn && (
            <div className="text-cyan-400 text-[8px] font-bold whitespace-nowrap">
              {kw} kW
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

export function EnergyFlowScene() {
  const appliances = useVoltStore(state => state.appliances);

  return (
    <div className="w-full h-[450px] lg:h-[500px] rounded-2xl overflow-hidden bg-volt-dark relative shadow-xl shadow-volt-blue/10 border border-white/5">
      {/* Decorative text overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-xl font-bold text-white">Live Energy Flow</h2>
        <p className="text-sm text-gray-400">Smart Meter Distribution</p>
      </div>

      <Canvas
        camera={{ position: [0, 5.5, 8], fov: 50 }}
        gl={{ antialias: true, failIfMajorPerformanceCaveat: false, powerPreference: 'default' }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); }, false);
        }}
      >
        <color attach="background" args={['#0a0f1c']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Environment preset="city" />

        {/* Central Smart Meter */}
        <group position={[0, 0, 0]}>
          <Box args={[1, 1.5, 1]}>
            <meshStandardMaterial color="#1B4F8A" metalness={0.8} roughness={0.2} />
          </Box>
          <Box args={[1.1, 0.08, 1.1]} position={[0, -0.75, 0]}>
            <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.5} />
          </Box>
          <Billboard>
            <Text position={[0, 1.2, 0]} fontSize={0.35} color="white" anchorX="center" anchorY="middle">
              Smart Meter
            </Text>
          </Billboard>
        </group>

        {/* Appliances and Connections */}
        {appliances.map((app, i) => {
          const angle = (i / appliances.length) * Math.PI * 2;
          const radius = 3.8;
          const pos = new THREE.Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
          );
          const meterPos = new THREE.Vector3(0, 0, 0);

          return (
            <group key={app.id}>
              {/* Connection Line */}
              <Line 
                points={[meterPos, pos]} 
                color={app.isOn ? "#00e5ff" : "#333"} 
                lineWidth={app.isOn ? 2 : 1}
                transparent
                opacity={app.isOn ? 0.6 : 0.2}
              />
              
              {/* Flowing particles */}
              <FlowParticles start={meterPos} end={pos} active={app.isOn} />

              {/* Appliance Node */}
              <ApplianceNode position={pos} name={app.name} isOn={app.isOn} kw={app.kw} iconName={app.iconName} />
            </group>
          );
        })}

        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2.5}
          minPolarAngle={Math.PI / 3.2}
        />
      </Canvas>
    </div>
  );
}
