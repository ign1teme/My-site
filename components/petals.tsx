"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type Petal = {
  x: number;
  y: number;
  size: number;
  fall: number;
  sway: number;
  swayRate: number;
  phase: number;
  spin: number;
  angle: number;
  flipRate: number;
  alpha: number;
};

// Chapters and blog posts are for reading; petals stay on the browsing pages.
const READING_PAGE = /^\/(blog\/[^/]+|novel\/[^/]+\/[^/]+)\/?$/;

function spawn(width: number, height: number, anywhere: boolean): Petal {
  const depth = Math.random();
  return {
    x: Math.random() * width,
    y: anywhere ? Math.random() * height : -20 - Math.random() * 80,
    size: 5 + depth * 6,
    fall: 14 + depth * 22,
    sway: 18 + Math.random() * 36,
    swayRate: 0.25 + Math.random() * 0.35,
    phase: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.9,
    angle: Math.random() * Math.PI * 2,
    flipRate: 0.6 + Math.random() * 1.2,
    alpha: 0.22 + depth * 0.4,
  };
}

function drawPetal(ctx: CanvasRenderingContext2D, s: number) {
  // A cherry petal: rounded body narrowing to a notched tip.
  ctx.beginPath();
  ctx.moveTo(0, s);
  ctx.bezierCurveTo(s * 0.95, s * 0.35, s * 0.8, -s * 0.7, s * 0.2, -s);
  ctx.lineTo(0, -s * 0.76);
  ctx.lineTo(-s * 0.2, -s);
  ctx.bezierCurveTo(-s * 0.8, -s * 0.7, -s * 0.95, s * 0.35, 0, s);
  ctx.fill();
}

export function Petals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const hidden = READING_PAGE.test(pathname ?? "");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (hidden || !canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let petals: Petal[] = [];
    let color = "";
    let frame = 0;
    let last = performance.now();

    const readColor = () => {
      color = getComputedStyle(document.documentElement).getPropertyValue("--petal").trim() || "pink";
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(6, Math.min(16, Math.round((width * height) / 90000)));
      while (petals.length < count) petals.push(spawn(width, height, true));
      petals = petals.slice(0, count);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      const wind = Math.sin(now / 9000) * 10;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      for (let i = 0; i < petals.length; i++) {
        const petal = petals[i];
        petal.phase += petal.swayRate * dt * Math.PI * 2;
        petal.y += petal.fall * dt;
        petal.x += (wind + Math.cos(petal.phase) * petal.sway * 0.6) * dt;
        petal.angle += petal.spin * dt;
        if (petal.y > height + 20 || petal.x < -40 || petal.x > width + 40) {
          petals[i] = spawn(width, height, false);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = petal.alpha;
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.angle + Math.sin(petal.phase) * 0.5);
        // Tumbling: the petal turns edge-on and back as it falls.
        ctx.scale(Math.max(Math.abs(Math.cos(now / 1000 * petal.flipRate + petal.phase)), 0.15), 1);
        drawPetal(ctx, petal.size);
        ctx.restore();
      }
      frame = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const themeObserver = new MutationObserver(readColor);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    readColor();
    resize();
    frame = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      ctx.clearRect(0, 0, width, height);
    };
  }, [hidden]);

  if (hidden) return null;
  return <canvas ref={canvasRef} className="petals" aria-hidden="true" />;
}
