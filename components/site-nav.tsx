"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/#blog", label: "博客", section: "blog" },
  { href: "/#novel", label: "小说", section: "novel" },
  { href: "/#about", label: "关于", section: "about" },
];

type Spring = { x: number; v: number };

// The edge moving toward the target leads on a stiffer spring, so the line
// stretches ahead and the trailing edge catches up.
const LEAD = { stiffness: 520, damping: 0.82 };
const TRAIL = { stiffness: 240, damping: 0.9 };
const FADE = { stiffness: 300, damping: 1 };

function step(spring: Spring, target: number, { stiffness, damping }: typeof LEAD, dt: number) {
  const c = 2 * damping * Math.sqrt(stiffness);
  spring.v += (-stiffness * (spring.x - target) - c * spring.v) * dt;
  spring.x += spring.v * dt;
}

function settled(spring: Spring, target: number) {
  return Math.abs(spring.x - target) < 0.1 && Math.abs(spring.v) < 0.1;
}

export function SiteNav() {
  const listRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const motion = useRef({ left: { x: 0, v: 0 }, right: { x: 0, v: 0 }, alpha: { x: 0, v: 0 }, frame: 0 });
  const [hovered, setHovered] = useState<number | null>(null);
  const [current, setCurrent] = useState<number | null>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const sections = links
      .map(({ section }) => document.getElementById(section))
      .filter((node): node is HTMLElement => node !== null);
    if (sections.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      }
      const index = links.findIndex(({ section }) => visible.has(section));
      setCurrent(index === -1 ? null : index);
    }, { rootMargin: "-40% 0px -55% 0px" });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const target = hovered ?? current;

  useEffect(() => {
    const list = listRef.current;
    const bar = barRef.current;
    if (!list || !bar) return;

    const state = motion.current;
    const anchor = target === null ? null : list.children[target]?.firstElementChild as HTMLElement | undefined;
    const goal = anchor
      ? { left: anchor.offsetLeft + 12, right: anchor.offsetLeft + anchor.offsetWidth - 12, alpha: 1 }
      : { left: state.left.x, right: state.right.x, alpha: 0 };

    const render = () => {
      const width = Math.max(state.right.x - state.left.x, 0);
      bar.style.transform = `translateX(${state.left.x}px) scaleX(${width})`;
      bar.style.opacity = String(Math.min(Math.max(state.alpha.x, 0), 1));
    };

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const appearing = state.alpha.x < 0.05;
    if (reduceMotion || (appearing && anchor)) {
      // Nothing to travel from: place the line, then let it fade in.
      state.left = { x: goal.left, v: 0 };
      state.right = { x: goal.right, v: 0 };
    }
    if (reduceMotion) {
      state.alpha = { x: goal.alpha, v: 0 };
      render();
      return;
    }

    const movingRight = goal.left > state.left.x;
    let last = performance.now();

    const tick = (now: number) => {
      let elapsed = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      while (elapsed > 0) {
        const dt = Math.min(elapsed, 1 / 240);
        step(state.left, goal.left, movingRight ? TRAIL : LEAD, dt);
        step(state.right, goal.right, movingRight ? LEAD : TRAIL, dt);
        step(state.alpha, goal.alpha, FADE, dt);
        elapsed -= dt;
      }
      render();
      const done = settled(state.left, goal.left) && settled(state.right, goal.right) && Math.abs(state.alpha.x - goal.alpha) < 0.005;
      state.frame = done ? 0 : requestAnimationFrame(tick);
    };

    cancelAnimationFrame(state.frame);
    state.frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(state.frame);
  }, [target]);

  return (
    <nav aria-label="主要导航" className="site-nav">
      <ul className="nav-links" ref={listRef} onPointerLeave={() => setHovered(null)}>
        {links.map(({ href, label }, index) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={current === index ? "true" : undefined}
              onPointerEnter={() => setHovered(index)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <span className="nav-indicator" ref={barRef} aria-hidden="true" />
    </nav>
  );
}
