// Wendle's keys: each one plays a note, the shell remembers it, then hums it back.
const NOTES = [
  { name: 'C', freq: 261.63 },
  { name: 'D', freq: 293.66 },
  { name: 'E', freq: 329.63 },
  { name: 'F', freq: 349.23 },
  { name: 'G', freq: 392.0 },
  { name: 'A', freq: 440.0 },
  { name: 'B', freq: 493.88 }
];

const WAIT_MS = 1500; // how long the shell waits before the echo
let audioCtx = null;

let recorded = null;
let waitTimer = null;
let endTimer = null;
let waitStart = 0;
let rafId = 0;

const memoryEl = document.getElementById('memory');
const fillEl = document.getElementById('fill');
const hintEl = document.getElementById('hint');
const keysEl = document.getElementById('keys');

function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// one soft sine blip; delay is in seconds from now
function blip(freq, vol, delay, len, soft) {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + (soft ? 0.12 : 0.02));
  gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
  osc.connect(gain);
  if (soft) {
    // a lowpass makes the echo sound far away and muffled, like inside a shell
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    gain.connect(lp);
    lp.connect(ac.destination);
  } else {
    gain.connect(ac.destination);
  }
  osc.start(t);
  osc.stop(t + len + 0.1);
}

// the echo: three hums, each quieter than the last
function hum(freq) {
  blip(freq, 0.18, 0, 1.0, true);
  blip(freq, 0.09, 0.55, 1.0, true);
  blip(freq, 0.04, 1.1, 1.0, true);
}

function tickBar() {
  const p = Math.min(1, (performance.now() - waitStart) / WAIT_MS);
  fillEl.style.width = (p * 100) + '%';
  if (p < 1) rafId = requestAnimationFrame(tickBar);
}

function record(n) {
  recorded = n;
  clearTimeout(waitTimer);
  clearTimeout(endTimer);
  cancelAnimationFrame(rafId);
  fillEl.classList.remove('echo');
  memoryEl.textContent = 'The shell remembers: ' + n.name;
  hintEl.textContent = 'Listening... waiting a moment.';
  waitStart = performance.now();
  tickBar();
  if (window.setShellNote) window.setShellNote(n.name);
  waitTimer = setTimeout(function () {
    fillEl.style.width = '100%';
    fillEl.classList.add('echo');
    hintEl.textContent = 'Hmmmm... the shell hums ' + recorded.name + ' back.';
    hum(recorded.freq);
    endTimer = setTimeout(function () {
      hintEl.textContent = 'Tap another key for a new echo.';
      if (window.setShellNote) window.setShellNote(null);
    }, 2200);
  }, WAIT_MS);
}

let lastBtn = null;
function press(b, n) {
  b.classList.add('down');
  if (lastBtn && lastBtn !== b) lastBtn.classList.remove('last');
  b.classList.add('last');
  lastBtn = b;
  setTimeout(function () { b.classList.remove('down'); }, 220);
  blip(n.freq, 0.4, 0, 1.2, false);
  record(n);
}

NOTES.forEach(function (n) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'key';
  const label = document.createElement('span');
  label.textContent = n.name;
  b.appendChild(label);
  b.setAttribute('aria-label', 'Play note ' + n.name);
  let lastPress = 0;
  // one guard so pointer, click and keyboard never play twice for one tap
  const go = function () {
    const now = performance.now();
    if (now - lastPress < 350) return;
    lastPress = now;
    press(b, n);
  };
  b.addEventListener('pointerdown', function (e) { e.preventDefault(); go(); });
  b.addEventListener('click', go);
  keysEl.appendChild(b);
});
