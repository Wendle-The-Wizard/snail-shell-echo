// Wendle's shell drawing. A spiral that grows outward like a real snail shell!
const canvas = document.getElementById('shell');
const ctx = canvas.getContext('2d');

function drawShell() {
  const w = canvas.width, h = canvas.height;
  const cx = w / 2 + 10, cy = h / 2 - 20;
  ctx.clearRect(0, 0, w, h);

  // the soft little body under the shell
  ctx.fillStyle = '#8fc98a';
  ctx.beginPath();
  ctx.ellipse(w / 2, 300, 150, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  // head and two feelers
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

  // shell: a round base filled with warm color
  const R = 120;
  const grad = ctx.createRadialGradient(cx - 30, cy - 30, 10, cx, cy, R);
  grad.addColorStop(0, '#f6c98b');
  grad.addColorStop(1, '#c9794a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy + 20, R, 0, Math.PI * 2);
  ctx.fill();

  // the spiral: radius grows with the angle (Archimedean spiral)
  ctx.strokeStyle = '#7a3e22';
  ctx.lineWidth = 6;
  ctx.beginPath();
  const turns = 3.5;
  const steps = 300;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    const r = t * (R - 10);
    const x = cx + Math.cos(a) * r;
    const y = cy + 20 + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // shell rim
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy + 20, R, 0, Math.PI * 2);
  ctx.stroke();
}

drawShell();
