/* Dependency-free SATQUERY guide. Set `stage` or call setStage(name). */
const stages = {
  beginning: ['01 / THE QUESTION', 'Ask me anything about the Earth.', 'EARTH OBSERVATION', 'optical'],
  agent: ['02 / THE AGENT', "I don't use one model for every question.", 'MODEL ROUTING', 'sar'],
  sensors: ['03 / OPTICAL + SAR', "Sometimes one sensor isn't enough.", 'SENSOR FUSION', 'fusion'],
  change: ['04 / CHANGE', "Let's see what changed.", 'CHANGE DETECTION', 'change'],
  final: ['05 / THE EVIDENCE', "Your question. Earth's evidence.", 'EVIDENCE READY', 'fusion']
};
class MissionGuide extends HTMLElement {
  static observedAttributes = ['stage', 'src'];
  constructor() {
    super();
    const root = this.attachShadow({mode: 'open'});
    root.innerHTML = `
      <link rel="stylesheet" href="${new URL('./mission-guide.css', import.meta.url)}">
      <aside aria-label="SATQUERY mission guide">
        <header><span class="status"></span> MISSION GUIDE <button type="button" aria-label="Pause guide animation" aria-pressed="false">Ⅱ</button></header>
        <div class="scene" aria-hidden="true">
          <div class="halo"></div><div class="orbit one"></div><div class="orbit two"></div>
          <div class="float"><div class="portrait"><img alt="" draggable="false"></div></div>
          <div class="panel telemetry"><span>LIVE CONTEXT</span><b class="context"></b><div class="bars"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
          <div class="panel map"><span class="layer-label">OPTICAL</span><svg viewBox="0 0 100 62"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="currentColor" stroke-width=".4"/></pattern></defs><rect width="100" height="62" fill="url(#grid)"/><path class="terrain" d="M0 46 15 32 28 38 43 13 58 24 73 7 100 18V62H0Z"/><path class="river" d="M20 0 37 15 29 29 58 43 70 62"/><rect class="target" x="49" y="23" width="24" height="20"/><path class="scan" d="M0 30H100"/></svg><small>GROUND / LAYER <span class="layer-number">01</span></small></div>
        </div>
        <div class="message" aria-live="polite" aria-atomic="true"><p class="eyebrow"></p><p class="dialogue"></p></div>
        <footer><span class="dots" aria-hidden="true">·····</span><span>QUESTION → EVIDENCE</span></footer>
      </aside>`;
    this.pauseButton = root.querySelector('button');
    this.pauseButton.onclick = () => {
      const paused = this.toggleAttribute('paused');
      this.pauseButton.setAttribute('aria-pressed', String(paused));
      this.pauseButton.setAttribute('aria-label', `${paused ? 'Resume' : 'Pause'} guide animation`);
      this.pauseButton.textContent = paused ? '▷' : 'Ⅱ';
      this.resetParallax();
    };
    root.querySelector('.scene').onpointermove = e => {
      if (this.hasAttribute('paused') || matchMedia('(prefers-reduced-motion: reduce)').matches || e.pointerType === 'touch') return;
      const bounds = e.currentTarget.getBoundingClientRect();
      this.style.setProperty('--px', `${((e.clientX - bounds.left) / bounds.width - .5) * 5}px`);
      this.style.setProperty('--py', `${((e.clientY - bounds.top) / bounds.height - .5) * 4}px`);
    };
    root.querySelector('.scene').onpointerleave = () => this.resetParallax();
  }
  resetParallax() { this.style.setProperty('--px', '0px'); this.style.setProperty('--py', '0px'); }
  connectedCallback() {
    this.render();
    this.observer = new IntersectionObserver(entries => this.toggleAttribute('offscreen', !entries[0].isIntersecting));
    this.observer.observe(this);
  }
  disconnectedCallback() { this.observer?.disconnect(); }
  attributeChangedCallback() { this.render(); }
  setStage(stage) {
    if (!Object.hasOwn(stages, stage)) throw new RangeError(`Unknown mission stage: ${stage}`);
    this.setAttribute('stage', stage);
  }
  render() {
    const stage = Object.hasOwn(stages, this.getAttribute('stage')) ? this.getAttribute('stage') : 'beginning';
    const [label, dialogue, context, layer] = stages[stage];
    const root = this.shadowRoot;
    root.querySelector('.eyebrow').textContent = label;
    root.querySelector('.dialogue').textContent = dialogue;
    root.querySelector('.context').textContent = context;
    root.querySelector('.layer-label').textContent = layer.toUpperCase();
    root.querySelector('.layer-number').textContent = `0${Object.keys(stages).indexOf(stage) + 1}`;
    root.querySelector('.map').dataset.layer = layer;
    root.querySelector('img').src = this.getAttribute('src') || new URL('./mission-guide.png', import.meta.url).href;
  }
}
if (!customElements.get('satquery-guide')) customElements.define('satquery-guide', MissionGuide);
