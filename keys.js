// Wendle's keys: each one plays a note when clicked or tapped.
const NOTES = [
  { name: 'C', freq: 261.63 },
  { name: 'D', freq: 293.66 },
  { name: 'E', freq: 329.63 },
  { name: 'F', freq: 349.23 },
  { name: 'G', freq: 392.0 },
  { name: 'A', freq: 440.0 },
  { name: 'B', freq: 493.88 }
];

let audioCtx = null;

function playNote(freq) {
  // browsers want the audio to start after a tap, so we make it here
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
  // quick fade in and a gentle fade out so it does not click
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.4, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 1.3);
}

const keysEl = document.getElementById('keys');
NOTES.forEach(function (n) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'key';
  b.textContent = n.name;
  b.setAttribute('aria-label', 'Play note ' + n.name);
  b.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    b.classList.add('down');
    playNote(n.freq);
  });
  const up = function () { b.classList.remove('down'); };
  b.addEventListener('pointerup', up);
  b.addEventListener('pointerleave', up);
  b.addEventListener('pointercancel', up);
  // keyboard: Enter or Space
  b.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
      e.preventDefault();
      b.classList.add('down');
      playNote(n.freq);
    }
  });
  b.addEventListener('keyup', up);
  keysEl.appendChild(b);
});
