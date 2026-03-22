'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function EnergyParticles({ count = 500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 1.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00BCD4"
        size={0.03}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

function GlobeNodes({ count = 20 }: { count?: number }) {
  const nodesRef = useRef<THREE.Group>(null);

  const nodePositions = useMemo(() => {
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.52;
      nodes.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        )
      );
    }
    return nodes;
  }, [count]);

  useFrame((state) => {
    if (nodesRef.current) {
      nodesRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.3;
        mesh.scale.setScalar(scale);
      });
    }
  });

  return (
    <group ref={nodesRef}>
      {nodePositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#00BCD4" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function GlobeRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <>
      <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2, 0.008, 16, 100]} />
        <meshBasicMaterial color="#00BCD4" transparent opacity={0.3} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-Math.PI / 6, Math.PI / 3, 0]}>
        <torusGeometry args={[2.2, 0.006, 16, 100]} />
        <meshBasicMaterial color="#1B4F8A" transparent opacity={0.25} />
      </mesh>
    </>
  );
}

export function EnergyGlobe() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main globe */}
      <Sphere args={[1.5, 64, 64]}>
        <meshPhysicalMaterial
          color="#0A0E1A"
          metalness={0.1}
          roughness={0.7}
          transparent
          opacity={0.85}
          emissive="#00BCD4"
          emissiveIntensity={0.05}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <Sphere args={[1.52, 32, 32]}>
        <meshBasicMaterial
          color="#00BCD4"
          wireframe
          transparent
          opacity={0.08}
        />
      </Sphere>

      {/* City nodes */}
      <GlobeNodes />

      {/* Orbital rings */}
      <GlobeRings />

      {/* Particle streams */}
      <EnergyParticles count={400} />
    </group>
  );
}
