# SATQUERY mission guide

Serve this directory over HTTP and open `index.html` for the interactive demo (for example, `python -m http.server 8000`). No build or dependencies.

```html
<script type="module" src="/components/mission-guide.js"></script>
<satquery-guide stage="beginning"></satquery-guide>
```

Keep `mission-guide.js`, `mission-guide.css`, and `mission-guide.png` together. Assets resolve relative to the module. Each instance is isolated with Shadow DOM. Set its width with CSS; default is 320px.

```js
document.querySelector('satquery-guide').setStage('sensors');
// Or update the stage attribute from your story/scroll controller.
```

Stages: `beginning`, `agent`, `sensors`, `change`, `final`. Unknown attributes fall back to beginning; invalid `setStage()` calls throw. No AI backend is included. Telemetry and map overlays are illustrative.

The original supplied image is unchanged. A source-specific CSS silhouette mask hides most of its baked-in checkerboard. Portrait breathing and tilt move the intact illustration; anatomically independent head/hand motion requires separate source layers. Orbital lines, holographic scan and stage-specific map colors are separate CSS/SVG overlays. Optional `src` overrides the image, but different artwork needs its mask adjusted.

The pause button freezes animations, reduced-motion preferences disable motion and parallax, and offscreen animation pauses automatically. Dialogue updates use a polite live region. Mount the component alongside story content; it does not capture scrolling or obscure the page.

Manual smoke check: click all five stages and confirm dialogue and map labels update; pause and confirm all motion stops; resume; enable reduced motion and verify static artwork; check narrow viewport and keyboard focus.
