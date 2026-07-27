import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Icosahedron, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

const AnimatedOrb = () => {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.25;
      ref.current.rotation.y += delta * 0.35;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
      <Icosahedron ref={ref} args={[1, 4]}>
        
        <MeshDistortMaterial
          color="#22e39a"
          emissive="#0a8a5a"
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.85}
          distort={0.4}
          speed={2.5}
        />
      </Icosahedron>
    </Float>
  );
};

const WalletOrb3D = ({ className = "" }: { className?: string }) => (
  <div className={`w-full h-full ${className}`}>
    <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 3]} intensity={2} color="#22e39a" />
      <pointLight position={[-3, -2, -2]} intensity={1.2} color="#0ea5e9" />
      <AnimatedOrb />
      <Sparkles count={40} scale={4} size={2} speed={0.5} color="#5cffb4" />
    </Canvas>
  </div>
);

export default WalletOrb3D;
