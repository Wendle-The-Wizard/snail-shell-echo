// Wendle's keys: each one plays a note, and the shell remembers it.
const NOTES = [
  { name: 'C', freq: 261.63 },
  { name: 'D', freq: 293.66 },
  { name: 'E', freq: 329.63 },
  { name: 'F', freq: 349.23 },
  { name: 'G', freq: 392.0 },
  { name: 'A', freq: 440.0 },
  { name: 'B', freq: 493.88 }
];

const WAIT_MS = 1500; // how long the shell waits before the echo (step 4)
let audioCtx = null;

// step 3: the recorded note and the waiting timer
let recorded = null;
let waitTimer = null;
let waitStart = 0;
let rafId = 0;

const memoryEl = document.getElementById('memory');
const fillEl = document.getElementById('fill');
const hintEl = document.getElementById('hint');

function playNote(freq) {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.4, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 1.3);
}

// the bar fills up while the shell waits
function tickBar() {
  const p = Math.min(1, (performance.now() - waitStart) / WAIT_MS);
  fillEl.style.width = (p * 100) + '%';
  if (p < 1) rafId = requestAnimationFrame(tickBar);
}

// remember the note, then wait a moment
function record(n) {
  recorded = n;
  clearTimeout(waitTimer);
  cancelAnimationFrame(rafId);
  memoryEl.textContent = 'The shell remembers: ' + n.name;
  hintEl.textContent = 'Listening... waiting a moment.';
  waitStart = performance.now();
  tickBar();
  if (window.setShellNote) window.setShellNote(n.name);
  waitTimer = setTimeout(function () {
    // the wait is over; step 4 will hum recorded.freq back here
    hintEl.textContent = 'The wait is over. Echo comes next!';
    fillEl.style.width = '100%';
    if (window.setShellNote) window.setShellNote(null);
  }, WAIT_MS);
}

function press(b, n) {
  b.classList.add('down');
  playNote(n.freq);
  record(n);
}

const keysEl = document.getElementById('keys');
NOTES.forEach(function (n) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'key';
  const label = document.createElement('span');
  label.textContent = n.name;
  b.appendChild(label);
  b.setAttribute('aria-label', 'Play note ' + n.name);
  b.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    press(b, n);
  });
  const up = function () { b.classList.remove('down'); };
  b.addEventListener('pointerup', up);
  b.addEventListener('pointerleave', up);
  b.addEventListener('pointercancel', up);
  b.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
      e.preventDefault();
      press(b, n);
    }
  });
  b.addEventListener('keyup', up);
  keysEl.appendChild(b);
});
