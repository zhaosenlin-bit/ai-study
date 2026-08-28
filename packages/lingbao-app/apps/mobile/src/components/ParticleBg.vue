<template>
  <canvas ref="canvasRef" class="particle-bg" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);
let raf = 0;
let particles: { x: number; y: number; r: number; vx: number; vy: number; c: string }[] = [];
const colors = ["#7e8cff", "#ff6cab", "#41e0c4", "#ffb84a"];

function resize() {
  const c = canvasRef.value!;
  c.width = window.innerWidth * devicePixelRatio;
  c.height = window.innerHeight * devicePixelRatio;
  c.style.width = window.innerWidth + "px";
  c.style.height = window.innerHeight + "px";
}

function init() {
  particles = [];
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 1 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

function draw() {
  const c = canvasRef.value!;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.scale(devicePixelRatio, devicePixelRatio);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
    if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.c;
    ctx.globalAlpha = 0.6;
    ctx.fill();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  raf = requestAnimationFrame(draw);
}

onMounted(() => {
  resize();
  init();
  draw();
  window.addEventListener("resize", () => { resize(); init(); });
});

onUnmounted(() => cancelAnimationFrame(raf));
</script>

<style scoped>
.particle-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
</style>
