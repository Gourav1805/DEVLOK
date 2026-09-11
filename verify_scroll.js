const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = path.join(__dirname, 'verify_artifacts');
if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Launching Chrome with remote debugging...');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--user-data-dir=C:\\Users\\madaa\\AppData\\Local\\Temp\\chrome_test',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1920,1080',
    'http://localhost:3000'
  ]);

  await sleep(2500);
  const failures = [];
  function check(name, cond, extra) {
    console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (extra ? ' | ' + extra : ''));
    if (!cond) failures.push(name);
  }

  try {
    const list = await getJson('http://127.0.0.1:9223/json/list');
    console.log('Tabs found:', list.length);
    const targetTab = list.find((t) => t.url.includes('localhost:3000')) || list[0];

    if (!targetTab || !targetTab.webSocketDebuggerUrl) {
      throw new Error('No debugger target found');
    }

    const ws = new globalThis.WebSocket(targetTab.webSocketDebuggerUrl);

    await new Promise((res) => ws.addEventListener('open', res));

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (event) => {
          const parsed = JSON.parse(event.data);
          if (parsed.id === id) {
            ws.removeEventListener('message', handler);
            if (parsed.error) reject(parsed.error);
            else resolve(parsed.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', { expression, returnByValue: true });
      if (res.exceptionDetails) return { __error: res.exceptionDetails.text };
      return res.result ? res.result.value : null;
    }

    async function captureScreenshot(filename) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.data, 'base64');
      const outPath = path.join(artifactDir, filename);
      fs.writeFileSync(outPath, buffer);
      console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
      return outPath;
    }

    // Console errors
    const consoleErrors = [];
    // (polled via evaluate below after each step)

    await sleep(2000);
    await captureScreenshot('scroll_000_top.png');

    // 1. Required app.js wiring present
    const ids = ['hero-canvas','hero-scroll-track','hero-content-box','hud-frame-counter','hud-frame-progress-bar','hud-altitude-val','hud-resolution','hud-scroll-prompt','preload-status-pill','preload-label','query-animated-text','terminal-input','terminal-run-btn','query-execute-btn','demo','features','mission','hud-stage-val','terminal-trace','querySubmit'];
    const missing = await evaluate('(function(){var ids=' + JSON.stringify(ids) + ';return ids.filter(function(i){return !document.getElementById(i);});})()');
    check('app.js DOM wiring (all required IDs exist)', Array.isArray(missing) && missing.length === 0, 'missing=' + JSON.stringify(missing));

    // 1b. No competing hero engine stacked on the frame hero
    const competing = await evaluate('!!document.querySelector(".sq-hero")');
    check('no competing sq-hero stacked on frame hero', competing === false);
    const trackVh = await evaluate('(function(){var t=document.getElementById("hero-scroll-track");var h=t.getBoundingClientRect().height;return Math.round(h/window.innerHeight*100)/100;})()');
    check('hero track tuned 2.4-3.1x viewport', trackVh >= 2.4 && trackVh <= 3.1, trackVh + 'vh');

    // 2. Frame counter exists internally but is NOT visible
    const counterVisible = await evaluate('(function(){var el=document.getElementById("hud-frame-counter");if(!el)return "missing";var s=getComputedStyle(el);var r=el.getBoundingClientRect();return (s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0)?"visible":"hidden";})()');
    check('frame counter hidden from users', counterVisible === 'hidden', 'state=' + counterVisible);

    // 3. Hero beats: exactly <=1 active at a time across scroll
    async function activeBeats() {
      return evaluate('(function(){return Array.prototype.filter.call(document.querySelectorAll(".hero-beat"),function(b){return b.classList.contains("active");}).map(function(b){return b.getAttribute("data-beat");});})()');
    }
    let beatsOk = true;
    const stops = [0.2, 1.1, 2.2, 3.2];
    for (const s of stops) {
      await evaluate('window.scrollTo(0, window.innerHeight * ' + s + ');');
      await sleep(900);
      const ab = await activeBeats();
      console.log('  scroll x' + s + ' active beats: ' + JSON.stringify(ab));
      if (!Array.isArray(ab) || ab.length > 1) beatsOk = false;
    }
    check('hero beats exclusive (<=1 visible)', beatsOk);
    await captureScreenshot('scroll_050_beats.png');

    // 4. Reverse scroll returns to a single/zero beat, no stuck overlap
    await evaluate('window.scrollTo(0, 0);');
    await sleep(900);
    const abTop = await activeBeats();
    check('reverse scroll to top clean', Array.isArray(abTop) && abTop.length <= 1, JSON.stringify(abTop));

    // 4b. Frame reach: hidden counter hits 001 / ~120 / 240 across the track
    async function frameNum() {
      const t = await evaluate('document.getElementById("hud-frame-counter").textContent');
      const m = /FRAME (\d+)/.exec(t || '');
      return m ? parseInt(m[1], 10) : -1;
    }
    async function settleFrame(isDone, timeoutMs) {
      const t0 = Date.now();
      let last = -2, stable = 0, cur = -1;
      while (Date.now() - t0 < timeoutMs) {
        cur = await frameNum();
        if (cur === last) { stable++; } else { stable = 0; last = cur; }
        if (stable >= 3 && isDone(cur)) return cur;
        await sleep(250);
      }
      return cur;
    }
    const fTop = await settleFrame(function(f){ return f <= 2; }, 6000);
    check('frame 1 at top', fTop <= 2, 'frame=' + fTop);
    const trackH = await evaluate('document.getElementById("hero-scroll-track").offsetHeight');
    const vh = await evaluate('window.innerHeight');
    await evaluate('window.scrollTo(0, ' + Math.round((trackH - vh) / 2) + ');');
    const fMid = await settleFrame(function(f){ return f >= 95 && f <= 145; }, 6000);
    check('frame ~120 at mid-track', fMid >= 95 && fMid <= 145, 'frame=' + fMid);
    await evaluate('window.scrollTo(0, ' + trackH + ');');
    const fEnd = await settleFrame(function(f){ return f >= 235; }, 6000);
    check('frame 240 reached at hero end', fEnd >= 235, 'frame=' + fEnd);
    const pxMean = await evaluate('(function(){try{var c=document.getElementById("hero-canvas");var x=c.getContext("2d");var d=x.getImageData(0,0,c.width,c.height).data;var s=0,n=0;for(var i=0;i<d.length;i+=16000){s+=d[i]+d[i+1]+d[i+2];n++;}return (s/n).toFixed(1);}catch(e){return -1;}})()');
    check('canvas never blank at hero end', Number(pxMean) > 2, 'meanRGB=' + pxMean);
    // 4c. No dead space: next section starts right where the sticky hero releases
    const gap = await evaluate('(function(){var t=document.getElementById("hero-scroll-track");var m=document.getElementById("mission");return Math.round(m.getBoundingClientRect().top - t.getBoundingClientRect().bottom);})()');
    await evaluate('window.scrollTo(0, 0);');
    await sleep(600);
    check('no gap between hero and mission', gap === 0, 'gap=' + gap + 'px');

    // 5. Nav links resolve
    const navTargets = await evaluate('(function(){return Array.prototype.map.call(document.querySelectorAll(".nav-link"),function(a){return a.getAttribute("href");}).filter(function(h){return h&&h.charAt(0)==="#";}).map(function(h){return [h, !!document.querySelector(h)];});})()');
    const navOk = Array.isArray(navTargets) && navTargets.length >= 7 && navTargets.every(function(p){return p[1];});
    check('nav links all resolve', navOk, JSON.stringify(navTargets));

    // 6. Demos preserved on disk
    const demos = ['satquery-agent-decides.html','satquery-crossmodal.html','satquery-find-the-change.html','satquery-mission-selector.html','time-leaves-evidence.html'];
    const missingDemos = demos.filter(function(d){ return !fs.existsSync(path.join(__dirname, d)); });
    check('standalone demos preserved', missingDemos.length === 0, 'missing=' + JSON.stringify(missingDemos));

    // 7. Downstream sections present
    const sections = ['mission','question','agent','multimodal','change','evidence','adaptation','missions','demo'];
    const missingSec = await evaluate('(function(){var s=' + JSON.stringify(sections) + ';return s.filter(function(i){return !document.getElementById(i);});})()');
    check('all story sections present', Array.isArray(missingSec) && missingSec.length === 0, 'missing=' + JSON.stringify(missingSec));

    // 8. Mobile viewport: no horizontal overflow
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(600);
    const overflow = await evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1');
    check('mobile 390px no horizontal overflow', overflow === true);
    await captureScreenshot('mobile_390.png');
    await send('Emulation.clearDeviceMetricsOverride');
    await sleep(400);

    // 9. Console errors since load
    const errors = await evaluate('(function(){return (window.__sqErrors||[]).slice(0,10);})()');
    check('no tracked JS errors', Array.isArray(errors) && errors.length === 0, JSON.stringify(errors));

    // Downstream content
    await evaluate('document.getElementById("features").scrollIntoView();');
    await sleep(500);
    await captureScreenshot('downstream_features.png');

    ws.close();
    if (failures.length) {
      console.error('FAILURES: ' + failures.join('; '));
      process.exit(2);
    }
    console.log('All scroll verifications passed successfully!');
  } finally {
    chrome.kill();
  }
}

run().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
