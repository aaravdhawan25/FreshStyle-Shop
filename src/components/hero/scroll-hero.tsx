"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { INITIAL_TARGET, type MotionTarget } from "./motion-target";

const HeroCanvas = dynamic(() => import("./hero-canvas"), { ssr: false });

const DARK = "#121212";
const LIGHT = "#efede8";
const PAGE_DARK = "#0b0b0c";

export function ScrollHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const precisionRef = useRef<HTMLDivElement>(null);
  const craftRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const target = useRef<MotionTarget>({ ...INITIAL_TARGET });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Static fallback: skip the scrubbed timeline, show the CTA outright.
      gsap.set([headlineRef.current, ctaRef.current], { autoAlpha: 1 });
      gsap.set(scrollHintRef.current, { autoAlpha: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      // 100-unit timeline scrubbed across the full 400vh scroll distance.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });

      const m = target.current;

      // ——— Act 1 (0–25): spin up, drift left, headline hands off to PRECISION
      tl.to(m, { ry: 2.3, rz: -0.3, x: -0.24, scale: 1.3, duration: 25 }, 0)
        .to(headlineRef.current, { autoAlpha: 0, y: -70, duration: 8 }, 4)
        .to(scrollHintRef.current, { autoAlpha: 0, duration: 4 }, 2)
        .to(bgRef.current, { backgroundColor: LIGHT, duration: 14 }, 10)
        .fromTo(
          precisionRef.current,
          { autoAlpha: 0, y: 110 },
          { autoAlpha: 1, y: 0, duration: 10 },
          14
        );

      // ——— Act 2 (25–55): sweep right, full tumble, CRAFT
      tl.to(m, { ry: 4.6, rx: 0.35, rz: 0.25, x: 0.24, y: 0.02, scale: 1.45, duration: 30 }, 25)
        .to(precisionRef.current, { autoAlpha: 0, y: -110, duration: 8 }, 30)
        .fromTo(
          craftRef.current,
          { autoAlpha: 0, y: 110 },
          { autoAlpha: 1, y: 0, duration: 10 },
          40
        );

      // ——— Act 3 (55–78): drop low center, STYLE emerges from behind
      tl.to(m, { ry: 6.9, rx: -0.2, rz: -0.5, x: 0, y: -0.14, scale: 1.35, duration: 23 }, 55)
        .to(craftRef.current, { autoAlpha: 0, y: -110, duration: 8 }, 58)
        .fromTo(
          styleRef.current,
          { autoAlpha: 0, scale: 0.92 },
          { autoAlpha: 1, scale: 1, duration: 10 },
          66
        );

      // ——— Act 4 (78–100): settle center, hand back to the dark page, CTA
      tl.to(m, { ry: 8.4, rx: 0, rz: 0, x: 0, y: -0.06, scale: 1.05, duration: 22 }, 78)
        .to(styleRef.current, { autoAlpha: 0, duration: 8 }, 80)
        .to(bgRef.current, { backgroundColor: PAGE_DARK, duration: 16 }, 80)
        .fromTo(
          ctaRef.current,
          { autoAlpha: 0, y: 60 },
          { autoAlpha: 1, y: 0, duration: 10 },
          88
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Animated backdrop */}
        <div
          ref={bgRef}
          className="absolute inset-0"
          style={{ backgroundColor: DARK }}
        />

        {/* Typography layers — blend-difference flips them dark on the
            light backdrop automatically, matching the reference. */}
        <div className="pointer-events-none absolute inset-0 z-10 text-white mix-blend-difference">
          <div
            ref={headlineRef}
            className="absolute inset-x-0 top-[16%] px-6 text-center"
          >
            <p className="text-xs uppercase tracking-[0.5em] opacity-70">
              Lawrence Township, NJ
            </p>
            <h1 className="font-display mt-4 text-[clamp(2.4rem,7vw,6rem)] leading-none">
              AVEX BARBER LOUNGE
            </h1>
            <p className="mt-4 text-sm uppercase tracking-[0.35em] opacity-80">
              Clean fades. Sharp lines.
            </p>
          </div>

          <div
            ref={precisionRef}
            className="absolute right-[6%] top-1/2 -translate-y-1/2 text-right opacity-0"
          >
            <span className="block text-xs uppercase tracking-[0.5em] opacity-70">01</span>
            <span className="font-display block text-[clamp(3rem,9vw,8rem)] leading-none">
              PRECISION
            </span>
          </div>

          <div
            ref={craftRef}
            className="absolute left-[6%] top-1/2 -translate-y-1/2 opacity-0"
          >
            <span className="block text-xs uppercase tracking-[0.5em] opacity-70">02</span>
            <span className="font-display block text-[clamp(3rem,9vw,8rem)] leading-none">
              CRAFT
            </span>
          </div>

          <div
            ref={styleRef}
            className="absolute inset-x-0 top-[30%] text-center opacity-0"
          >
            <span className="block text-xs uppercase tracking-[0.5em] opacity-70">03</span>
            <span className="font-display block text-[clamp(4rem,14vw,13rem)] leading-none">
              STYLE
            </span>
          </div>

          <div
            ref={scrollHintRef}
            className="absolute inset-x-0 bottom-8 text-center text-[10px] uppercase tracking-[0.5em] opacity-60"
          >
            Scroll
          </div>
        </div>

        {/* 3D canvas sits above the backdrop, below the CTA */}
        <div className="absolute inset-0 z-20">
          <HeroCanvas target={target} />
        </div>

        {/* CTA — outside the blend layer so the gold button renders true */}
        <div
          ref={ctaRef}
          className="absolute inset-x-0 bottom-[12%] z-30 flex flex-col items-center gap-5 text-center opacity-0"
        >
          <p className="font-display text-3xl text-foreground sm:text-4xl">
            Your chair is waiting.
          </p>
          <Link
            href="/book"
            className="rounded-full bg-gold px-10 py-4 text-sm font-semibold text-black transition hover:bg-gold-soft"
          >
            Book an Appointment
          </Link>
        </div>
      </div>
    </section>
  );
}
