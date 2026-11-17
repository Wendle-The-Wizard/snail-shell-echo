// Wendle's shell drawing. A spiral that grows outward like a real snail shell!
// Step 5: the shell glows while it listens and pulses while it hums.
const canvas = document.getElementById('shell');
const ctx = canvas.getContext('2d');
let heardNote = null; // the remembered note letter
let mode = 'idle';    // 'idle' | 'listen' | 'hum'
let glow = 0;         // 0..1 smooth glow strength
let spin = 0;         // little wobble of the spiral while listening

function drawShell(time) {
  const w = canvas.width, h = canvas.height;
  const cx = w / 2 + 10, cy = h / 2 - 20;
  ctx.clearRect(0, 0, w, h);

  // body
  ctx.fillStyle = '#8fc98a';
  ctx.beginPath();
  ctx.ellipse(w / 2, 300, 150, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(70, 278, 34, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8fc98a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(62, 255); ctx.lineTo(50, 215);
  ctx.moveTo(82, 255); ctx.lineTo(90, 215);
  ctx.stroke();
  ctx.fillStyle = '#f3e6c8';
  ctx.beginPath();
  ctx.arc(50, 213, 6, 0, Math.PI * 2);
  ctx.arc(90, 213, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d2440';
  ctx.beginPath();
  ctx.arc(48, 213, 2.5, 0, Math.PI * 2);
  ctx.arc(88, 213, 2.5, 0, Math.PI * 2);
  ctx.fill();

  const R = 120;
  const pulse = mode === 'hum' ? 1 + 0.04 * Math.sin(time / 90) : 1;

  // the glow: soft halo behind the shell
  if (glow > 0.01) {
    const gr = R * (1.5 + 0.1 * Math.sin(time / 200));
    const hg = ctx.createRadialGradient(cx, cy + 20, R * 0.6, cx, cy + 20, gr);
    const col = mode === 'hum' ? '143,201,138' : '255,226,140';
    hg.addColorStop(0, 'rgba(' + col + ',' + (0.85 * glow) + ')');
    hg.addColorStop(1, 'rgba(' + col + ',0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(cx, cy + 20, gr, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(cx, cy + 20);
  ctx.scale(pulse, pulse);
  ctx.translate(-cx, -(cy + 20));

  const grad = ctx.createRadialGradient(cx - 30, cy - 30, 10, cx, cy, R);
  grad.addColorStop(0, glow > 0.05 ? '#fff3c4' : '#f6c98b');
  grad.addColorStop(1, '#c9794a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy + 20, R, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#7a3e22';
  ctx.lineWidth = 6;
  ctx.beginPath();
  const turns = 3.5, steps = 300;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2 + spin;
    const r = t * (R - 10);
    const x = cx + Math.cos(a) * r;
    const y = cy + 20 + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy + 20, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  if (heardNote) {
    ctx.fillStyle = '#fff6dc';
    ctx.strokeStyle = '#7a3e22';
    ctx.lineWidth = 5;
    ctx.font = 'bold 56px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(heardNote, cx, 70);
    ctx.fillText(heardNote, cx, 70);
  }
}

// animation loop eases the glow toward its target
function frame(time) {
  const target = mode === 'idle' ? 0 : 1;
  glow += (target - glow) * 0.12;
  if (mode === 'listen') spin = 0.15 * Math.sin(time / 250);
  else spin *= 0.9;
  drawShell(time);
  requestAnimationFrame(frame);
}

// name = note letter or null; m = 'listen', 'hum' or 'idle'
window.setShellNote = function (name, m) {
  heardNote = name;
  mode = m || (name ? 'listen' : 'idle');
};

requestAnimationFrame(frame);
