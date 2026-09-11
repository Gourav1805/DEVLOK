/**
 * SatQuery AI — Scroll-Driven Frame Animation Engine
 * 
 * Implements:
 * 1. Sequential 240-frame WebP loading (frame_0001.webp to frame_0240.webp)
 * 2. High-performance requestAnimationFrame linear interpolation (lerp)
 * 3. Bidirectional smooth scrub (scroll down -> forward, scroll up -> reverse)
 * 4. Freezes on scroll stop (zero idle CPU/GPU consumption)
 * 5. Object-fit: cover responsive canvas rendering with Retina/High-DPI support
 * 6. Progressive batch preloading with nearest-frame cache fallback (zero stutter/flicker)
 * 7. Mobile-specific optimization (DPI clamp & touch support)
 * 8. prefers-reduced-motion accessibility compliance
 * 9. Live orbital telemetry HUD and interactive UI controls
 */

(function () {
  'use strict';

  // --- Configuration ---
  const TOTAL_FRAMES = 240;
  const FRAME_PREFIX = 'assets/frames/frame_';
  const FRAME_EXT = '.webp';
  const LERP_DAMPING = 0.12; // Smoothing factor (0.05 = heavy momentum, 0.25 = snappy)
  
  // Mobile / Performance detection
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // DOM Elements
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for faster composite
  const heroTrack = document.getElementById('hero-scroll-track');
  const heroContentBox = document.getElementById('hero-content-box');
  const frameCounterEl = document.getElementById('hud-frame-counter');
  const frameProgressBarEl = document.getElementById('hud-frame-progress-bar');
  const altitudeEl = document.getElementById('hud-altitude-val');
  const resolutionEl = document.getElementById('hud-resolution');
  const scrollPromptEl = document.getElementById('hud-scroll-prompt');
  const preloadPill = document.getElementById('preload-status-pill');
  const preloadLabel = document.getElementById('preload-label');
  const queryAnimatedText = document.getElementById('query-animated-text');
  const terminalInput = document.getElementById('terminal-input');
  const terminalRunBtn = document.getElementById('terminal-run-btn');

  // Animation State
  const frames = new Array(TOTAL_FRAMES + 1); // 1-indexed (1 to 240)
  const loadedFrames = new Set();
  let currentFrame = 1.0;
  let targetFrame = 1.0;
  let lastDrawnFrameIndex = -1;
  let isAnimating = false;
  let isFirstFrameReady = false;

  // Helper: Format frame filename: 1 -> "assets/frames/frame_0001.webp"
  function getFrameUrl(index) {
    const padded = String(index).padStart(4, '0');
    return `${FRAME_PREFIX}${padded}${FRAME_EXT}`;
  }

  // Helper: Find nearest loaded frame if the requested frame is still downloading
  function getNearestLoadedFrame(target) {
    if (loadedFrames.has(target)) return target;
    if (loadedFrames.size === 0) return 1;

    let closest = 1;
    let minDiff = Infinity;
    for (const idx of loadedFrames) {
      const diff = Math.abs(idx - target);
      if (diff < minDiff) {
        minDiff = diff;
        closest = idx;
      }
    }
    return closest;
  }

  // --- High-DPI Responsive Canvas Resize (object-fit: cover) ---
  function resizeCanvas() {
    // Clamp DPR to 1.5 on mobile to protect VRAM and battery, 2.0 on desktop
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    const newWidth = Math.round(displayWidth * dpr);
    const newHeight = Math.round(displayHeight * dpr);

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      // Redraw immediately after resize
      renderFrame(Math.round(currentFrame), true);
      paintPlaceholder(); // no-op once frame 1 has rendered
    }
  }

  // Draw image on canvas using object-fit: cover algorithm
  function drawCoverImage(img) {
    if (!img) return;

    const cW = canvas.width;
    const cH = canvas.height;
    const iW = img.naturalWidth || 1920;
    const iH = img.naturalHeight || 1080;

    const canvasRatio = cW / cH;
    const imgRatio = iW / iH;

    let sW, sH, sX, sY;

    if (canvasRatio > imgRatio) {
      // Canvas is wider than image aspect: crop top & bottom
      sW = iW;
      sH = iW / canvasRatio;
      sX = 0;
      sY = (iH - sH) / 2;
    } else {
      // Canvas is taller than image aspect: crop left & right
      sH = iH;
      sW = iH * canvasRatio;
      sX = (iW - sW) / 2;
      sY = 0;
    }

    ctx.drawImage(img, sX, sY, sW, sH, 0, 0, cW, cH);
  }

  // Deep-space placeholder so the canvas is never blank before frame 1 arrives
  function paintPlaceholder() {
    if (!canvas || isFirstFrameReady) return;
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, '#070d17');
    g.addColorStop(0.55, '#04070c');
    g.addColorStop(1, '#02040a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Render specific frame
  function renderFrame(frameIndex, forceRedraw = false) {
    const clampedIndex = Math.max(1, Math.min(TOTAL_FRAMES, frameIndex));
    const effectiveIndex = getNearestLoadedFrame(clampedIndex);

    if (effectiveIndex === lastDrawnFrameIndex && !forceRedraw) {
      return; // Skip redundant paint
    }

    const img = frames[effectiveIndex];
    if (img && img.complete) {
      drawCoverImage(img);
      lastDrawnFrameIndex = effectiveIndex;
    }
  }

  // --- Preloader System ---
  function preloadSingleFrame(index) {
    return new Promise((resolve) => {
      if (frames[index] && frames[index].complete) {
        resolve(frames[index]);
        return;
      }

      const img = new Image();
      img.src = getFrameUrl(index);
      img.onload = () => {
        frames[index] = img;
        loadedFrames.add(index);
        resolve(img);
      };
      img.onerror = () => {
        // Retry once or ignore gracefully
        resolve(null);
      };
    });
  }

  // Progressive batch loader
  async function loadFramesProgressively() {
    let loadedCount = 1; // frame 1 already loaded

    // Phase 1: Immediately preload the next 30 frames for initial scroll responsiveness
    const initialBatch = [];
    for (let i = 2; i <= Math.min(35, TOTAL_FRAMES); i++) {
      initialBatch.push(
        preloadSingleFrame(i).then(() => {
          loadedCount++;
          updatePreloadUI(loadedCount);
        })
      );
    }
    await Promise.all(initialBatch);

    // Phase 2: Stream remaining frames in concurrent queues
    const CONCURRENCY = isMobile ? 4 : 8;
    const remainingIndices = [];
    for (let i = 36; i <= TOTAL_FRAMES; i++) {
      remainingIndices.push(i);
    }

    async function worker() {
      while (remainingIndices.length > 0) {
        const nextIdx = remainingIndices.shift();
        await preloadSingleFrame(nextIdx);
        loadedCount++;
        updatePreloadUI(loadedCount);
      }
    }

    const workers = [];
    for (let w = 0; w < CONCURRENCY; w++) {
      workers.push(worker());
    }
    await Promise.all(workers);

    // All frames preloaded
    if (preloadPill) {
      preloadPill.classList.add('loaded');
      preloadLabel.textContent = 'ORBITAL CACHE SYNCHRONIZED (240/240)';
      setTimeout(() => {
        preloadPill.style.opacity = '0';
      }, 3500);
    }
  }

  function updatePreloadUI(count) {
    if (!preloadLabel) return;
    const pct = Math.round((count / TOTAL_FRAMES) * 100);
    preloadLabel.textContent = `BUFFERING FRAMES: ${pct}% (${count}/${TOTAL_FRAMES})`;
  }

  // --- Scroll Progress & Target Frame Mapping ---
  function calculateScrollProgress() {
    if (!heroTrack) return 0;
    const rect = heroTrack.getBoundingClientRect();
    const scrollTravel = heroTrack.offsetHeight - window.innerHeight;
    if (scrollTravel <= 0) return 0;

    // rect.top is 0 when at top of hero, -scrollTravel when scrolled to end of hero
    const progress = -rect.top / scrollTravel;
    return Math.max(0, Math.min(1, progress));
  }

  function onScroll() {
    if (prefersReducedMotion) return;

    const progress = calculateScrollProgress();
    
    // Map progress [0, 1] to target frame [1, 240]
    targetFrame = 1 + progress * (TOTAL_FRAMES - 1);

    // Update telemetry HUD synchronously with scroll
    updateTelemetry(progress);

    // Trigger RAF tick loop if not currently active
    if (!isAnimating) {
      isAnimating = true;
      requestAnimationFrame(tick);
    }
  }

  // --- RAF Physics Interpolation (Lerp) Engine ---
  function tick() {
    const diff = targetFrame - currentFrame;

    // If within threshold, settle and freeze
    if (Math.abs(diff) < 0.01) {
      currentFrame = targetFrame;
      renderFrame(Math.round(currentFrame));
      isAnimating = false; // Freeze animation, stop loop to conserve GPU/CPU
      return;
    }

    // Smooth linear interpolation towards targetFrame
    currentFrame += diff * LERP_DAMPING;
    renderFrame(Math.round(currentFrame));

    // Continue loop
    requestAnimationFrame(tick);
  }

  // --- Telemetry & UI Dynamic Updates ---
  function updateTelemetry(progress) {
    const frameNumber = Math.round(1 + progress * (TOTAL_FRAMES - 1));
    const paddedNum = String(frameNumber).padStart(3, '0');

    // Update Frame HUD
    if (frameCounterEl) {
      frameCounterEl.textContent = `FRAME ${paddedNum} / 240`;
    }
    if (frameProgressBarEl) {
      const pct = (progress * 100).toFixed(1);
      frameProgressBarEl.style.width = `${Math.max(1, pct)}%`;
    }

    // Dynamic Altitude Simulation: 680km down to 1.2km
    if (altitudeEl) {
      let altText;
      if (progress < 0.2) {
        altText = '680 KM (LEO)';
      } else if (progress < 0.45) {
        altText = `${Math.round(680 - (progress - 0.2) * 2000)} KM (MESOSPHERE)`;
      } else if (progress < 0.75) {
        altText = `${(15 - (progress - 0.45) * 40).toFixed(1)} KM (STRATOSPHERE)`;
      } else if (progress < 0.95) {
        altText = '1.20 KM (TERRESTRIAL AOI)';
      } else {
        altText = 'INSPECTION COMPLETE';
      }
      altitudeEl.textContent = altText;
    }

    // Dynamic Resolution: 0.30 m/px -> 0.05 m/px
    if (resolutionEl) {
      if (progress > 0.6) {
        resolutionEl.textContent = '0.05 M/PX (SUPER-RES)';
      } else if (progress > 0.3) {
        resolutionEl.textContent = '0.15 M/PX (HIGH-RES)';
      } else {
        resolutionEl.textContent = '0.30 M/PX';
      }
    }

    // Fade center content slightly as user zooms deeply into the port analysis
    if (heroContentBox) {
      if (progress > 0.18 && progress < 0.88) {
        // Smoothly dim typography so the detailed satellite analytics frame is clearly visible
        const fade = Math.max(0.2, 1 - (progress - 0.18) * 2.2);
        heroContentBox.style.opacity = fade.toFixed(2);
        heroContentBox.style.transform = `scale(${(1 - progress * 0.08).toFixed(3)}) translateY(${-progress * 20}px)`;
      } else if (progress >= 0.88) {
        // Frame 240 is the outro brand frame ("SATQUERY AI: Ask. Analyze. Understand Earth.")
        heroContentBox.style.opacity = '0';
        heroContentBox.style.pointerEvents = 'none';
      } else {
        heroContentBox.style.opacity = '1';
        heroContentBox.style.transform = 'scale(1) translateY(0px)';
        heroContentBox.style.pointerEvents = 'auto';
      }
    }

    // Fade scroll prompt indicator after user begins scrolling
    if (scrollPromptEl) {
      if (progress > 0.04) {
        scrollPromptEl.style.opacity = '0';
      } else {
        scrollPromptEl.style.opacity = '1';
      }
    }
  }

  // --- Query Rotator Animation ---
  const sampleQueries = [
    '"What changed between these two dates at the terminal docks?"',
    '"Detect vessel congestion and container density at Berth 4."',
    '"Highlight optical and SAR discrepancies in Sector 12."',
    '"Estimate grain silo volumetric changes in agricultural zones."',
    '"Identify surface water retention variance across the reservoir."'
  ];
  let queryIndex = 0;

  function rotateQueryText() {
    if (!queryAnimatedText) return;
    queryAnimatedText.style.opacity = '0';
    setTimeout(() => {
      queryIndex = (queryIndex + 1) % sampleQueries.length;
      queryAnimatedText.textContent = sampleQueries[queryIndex];
      queryAnimatedText.style.opacity = '1';
    }, 400);
  }
  setInterval(rotateQueryText, 4500);

  // --- Interactive Terminal Demo Controls ---
  function initTerminalDemo() {
    const chips = document.querySelectorAll('.query-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-query');
        if (terminalInput && q) {
          terminalInput.value = q;
        }
      });
    });

    if (terminalRunBtn) {
      terminalRunBtn.addEventListener('click', () => {
        terminalRunBtn.textContent = 'Processing...';
        terminalRunBtn.style.opacity = '0.7';
        setTimeout(() => {
          terminalRunBtn.textContent = 'Verified ✓';
          terminalRunBtn.style.opacity = '1';
          setTimeout(() => {
            terminalRunBtn.textContent = 'Run Inference';
          }, 2000);
        }, 600);
      });
    }

    const queryExecuteBtn = document.getElementById('query-execute-btn');
    if (queryExecuteBtn) {
      queryExecuteBtn.addEventListener('click', () => {
        const demoSection = document.getElementById('demo');
        if (demoSection) {
          demoSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  // --- Accessibility: prefers-reduced-motion Handling ---
  function handleReducedMotion() {
    if (!prefersReducedMotion) return;

    // In reduced-motion mode:
    // 1. Immediately load and draw frame 1 (or signature satellite overview)
    // 2. Do not attach scroll scrubbing listeners
    // 3. Keep layout at standard hero viewport height
    preloadSingleFrame(1).then(() => {
      renderFrame(1, true);
    });

    if (preloadPill) {
      preloadPill.style.display = 'none';
    }
  }

  // --- Initialization ---
  async function init() {
    // 1. Resize canvas to display dimensions
    resizeCanvas();
    paintPlaceholder(); // never show an empty canvas while frame 1 loads
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // 2. Handle prefers-reduced-motion
    if (prefersReducedMotion) {
      handleReducedMotion();
      initTerminalDemo();
      return;
    }

    // 3. Stage 1: Load Frame 1 with top priority (Instant Paint)
    const firstFrame = await preloadSingleFrame(1);
    if (firstFrame) {
      isFirstFrameReady = true;
      renderFrame(1, true);
    }

    // 4. Attach scroll listener
    window.addEventListener('scroll', onScroll, { passive: true });

    // 5. Initialize current position (e.g. if refreshed while scrolled down)
    onScroll();

    // 6. Stage 2: Progressive background loading for frames 2 -> 240
    loadFramesProgressively();

    // 7. Interactive features
    initTerminalDemo();
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
