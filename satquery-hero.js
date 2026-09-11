/**
 * SATQUERY hero — behaviour module.
 * --------------------------------------------------------------------------
 * Framework-agnostic. Exposes a single entry point, `initSatQueryHero`,
 * that wires up everything inside one container element. Nothing here
 * touches globals or does document-wide queries, so it is safe to call
 * from a React `useEffect` on mount and to tear down on unmount.
 *
 * React/Next.js usage:
 *
 *   useEffect(() => {
 *     const teardown = initSatQueryHero(containerRef.current);
 *     return teardown;
 *   }, []);
 *
 * Vanilla usage:
 *
 *   <script type="module">
 *     import { initSatQueryHero } from "./satquery-hero.js";
 *     initSatQueryHero(document.querySelector(".sq-hero"));
 *   </script>
 */

export function initSatQueryHero(root) {
  if (!root) return () => {};

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const canvas = root.querySelector("[data-sq-layer='stars']");
  const cleanupFns = [];

  if (canvas) {
    cleanupFns.push(setupStarfield(canvas, prefersReducedMotion));
  }

  if (!prefersReducedMotion) {
    cleanupFns.push(setupParallax(root));
  }

  return () => cleanupFns.forEach((fn) => fn && fn());
}

/* ---------------------------------------------------------------------- */
/* Starfield                                                               */
/* ---------------------------------------------------------------------- */

function setupStarfield(canvas, prefersReducedMotion) {
  const ctx = canvas.getContext("2d");
  let stars = [];
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let rafId = null;

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
  }

  function seedStars() {
    const density = Math.round((width * height) / 9000);
    stars = Array.from({ length: Math.max(density, 60) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.75, // keep the densest field above the earth
      r: Math.random() * 1.1 + 0.2,
      baseAlpha: Math.random() * 0.5 + 0.3,
      twinkleSpeed: Math.random() * 0.015 + 0.004,
      phase: Math.random() * Math.PI * 2,
      drift: Math.random() * 0.02 + 0.005,
    }));
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      const twinkle = prefersReducedMotion
        ? star.baseAlpha
        : star.baseAlpha + Math.sin(time * star.twinkleSpeed + star.phase) * 0.25;
      ctx.globalAlpha = Math.max(0, Math.min(1, twinkle));
      ctx.fillStyle = "#eef4f7";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();

      if (!prefersReducedMotion) {
        star.y += star.drift;
        if (star.y > height * 0.78) {
          star.y = -2;
          star.x = Math.random() * width;
        }
      }
    }
    ctx.globalAlpha = 1;

    if (!prefersReducedMotion) {
      rafId = requestAnimationFrame(draw);
    }
  }

  resize();
  draw(0);

  if (prefersReducedMotion) {
    // Single static paint, no animation loop.
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    ro.disconnect();
  };
}

/* ---------------------------------------------------------------------- */
/* Pointer / device-tilt parallax                                          */
/* ---------------------------------------------------------------------- */

function setupParallax(root) {
  const maxShift = 14; // px, kept subtle on purpose
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId = null;

  function onPointerMove(event) {
    const rect = root.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    targetX = nx * maxShift;
    targetY = ny * maxShift;
  }

  function onPointerLeave() {
    targetX = 0;
    targetY = 0;
  }

  function tick() {
    // Ease toward the target for a smooth, weighty feel.
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    root.style.setProperty("--sq-px", `${currentX.toFixed(2)}px`);
    root.style.setProperty("--sq-py", `${currentY.toFixed(2)}px`);
    rafId = requestAnimationFrame(tick);
  }

  root.addEventListener("pointermove", onPointerMove);
  root.addEventListener("pointerleave", onPointerLeave);
  rafId = requestAnimationFrame(tick);

  return () => {
    root.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerleave", onPointerLeave);
    if (rafId) cancelAnimationFrame(rafId);
  };
}
