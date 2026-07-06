"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group } from "three";
import type { MotionTarget } from "./motion-target";

const CHARCOAL = "#1a1a1c";
const CHARCOAL_LIGHT = "#232326";
const GOLD = "#c8a15c";
const GOLD_SOFT = "#e4c98a";

// Alternating tooth heights give the comb edge a machined look.
const TEETH = Array.from({ length: 11 }, (_, i) => ({
  x: -0.42 + i * 0.084,
  h: i % 2 === 0 ? 0.17 : 0.13,
}));

export function Clippers({ target }: { target: React.RefObject<MotionTarget> }) {
  const group = useRef<Group>(null);
  const { viewport } = useThree();

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    const m = target.current;

    // Scroll-driven pose from the GSAP timeline, plus a gentle idle
    // float/wobble so the object never feels frozen between scrolls.
    group.current.rotation.x = m.rx + Math.sin(t * 0.7) * 0.03;
    group.current.rotation.y = m.ry + Math.sin(t * 0.5) * 0.05;
    group.current.rotation.z = m.rz;
    group.current.position.x = m.x * viewport.width;
    group.current.position.y = m.y * viewport.height + Math.sin(t * 0.9) * 0.06;
    // Shrink the model on narrow viewports so it never overflows the frame.
    const fit = Math.min(1, Math.max(0.55, viewport.width / 7));
    group.current.scale.setScalar(m.scale * fit);
  });

  return (
    <group ref={group} rotation={[-0.12, 0, 0]}>
      {/* Main housing */}
      <RoundedBox args={[1.15, 2.3, 0.6]} radius={0.14} smoothness={4}>
        <meshStandardMaterial color={CHARCOAL} metalness={0.6} roughness={0.38} />
      </RoundedBox>

      {/* Front face plate */}
      <RoundedBox args={[0.95, 1.9, 0.1]} radius={0.05} smoothness={4} position={[0, -0.08, 0.29]}>
        <meshStandardMaterial color={CHARCOAL_LIGHT} metalness={0.55} roughness={0.3} />
      </RoundedBox>

      {/* Gold speed dial */}
      <mesh position={[0, -0.55, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.05, 16, 48]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.22} />
      </mesh>
      <mesh position={[0, -0.55, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.05, 32]} />
        <meshStandardMaterial color={CHARCOAL} metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Power switch */}
      <RoundedBox args={[0.18, 0.46, 0.07]} radius={0.03} smoothness={4} position={[0, 0.42, 0.33]}>
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.28} />
      </RoundedBox>

      {/* Neck connecting body to blade */}
      <mesh position={[0, 1.22, 0]}>
        <boxGeometry args={[0.92, 0.26, 0.5]} />
        <meshStandardMaterial color={CHARCOAL} metalness={0.6} roughness={0.35} />
      </mesh>

      {/* Blade base — brushed gold */}
      <mesh position={[0, 1.42, 0.02]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[1.02, 0.18, 0.5]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.32} />
      </mesh>

      {/* Comb teeth */}
      {TEETH.map(({ x, h }, i) => (
        <mesh key={i} position={[x, 1.53 + h / 2 - 0.08, 0.14]} rotation={[-0.18, 0, 0]}>
          <boxGeometry args={[0.05, h, 0.07]} />
          <meshStandardMaterial color={GOLD_SOFT} metalness={1} roughness={0.2} />
        </mesh>
      ))}

      {/* Tail cap with gold trim ring */}
      <mesh position={[0, -1.22, 0]}>
        <cylinderGeometry args={[0.42, 0.34, 0.28, 32]} />
        <meshStandardMaterial color={CHARCOAL} metalness={0.6} roughness={0.38} />
      </mesh>
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[0.47, 0.47, 0.045, 48]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.22} />
      </mesh>
    </group>
  );
}
