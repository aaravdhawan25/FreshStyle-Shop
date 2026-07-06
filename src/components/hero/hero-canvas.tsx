"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Clippers } from "./clippers";
import type { MotionTarget } from "./motion-target";

export default function HeroCanvas({
  target,
}: {
  target: React.RefObject<MotionTarget>;
}) {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 6], fov: 35 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <directionalLight position={[-5, -2, 3]} intensity={0.5} color="#e4c98a" />

      {/* Procedural studio lighting baked into an env map — gives the
          metals their brushed reflections with zero external assets. */}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.4} position={[0, 4, 6]} scale={[9, 1.5, 1]} />
        <Lightformer intensity={1.2} position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer intensity={1.6} position={[6, 2, 1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#e4c98a" />
        <Lightformer intensity={0.8} position={[0, -5, 3]} rotation-x={Math.PI / 2} scale={[8, 3, 1]} />
      </Environment>

      <Clippers target={target} />
    </Canvas>
  );
}
