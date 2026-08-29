import { useEffect, useRef } from "react";
import { SUN, PLANETS, COMETS, type CelestialBody } from "../data/bodies";

export interface CanvasSettings {
  playing: boolean;
  speed: number;
  scaleK: number;
  showOrbits: boolean;
  showLabels: boolean;
  showComets: boolean;
  reducedMotion: boolean;
}

interface Props {
  settings: CanvasSettings;
  selectedId: string | null;
  resetToken: number;
  onSelect: (id: string | null) => void;
  onTick: (simDays: number) => void;
}

const TAU = Math.PI * 2;
const NEPTUNE_A = 30.05;
/** суток модели в 1 реальную секунду при скорости ×1 */
const DAYS_PER_SEC = 10;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Решение уравнения Кеплера M = E − e·sinE методом Ньютона */
function solveKepler(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 8; i++) {
    E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  return E;
}

/** Нелинейный радиус диска планеты, чтобы Меркурий виден рядом с Юпитером */
function planetRadius(km: number): number {
  return 3 + 9.5 * Math.pow(km / 142984, 0.42);
}

interface Twinkle {
  x: number;
  y: number;
  r: number;
  phase: number;
  spd: number;
  warm: boolean;
}

interface CometParticle {
  t: number;
  s: number;
  size: number;
}

function makeParticles(n: number, seed: number): CometParticle[] {
  const arr: CometParticle[] = [];
  for (let i = 0; i < n; i++) {
    const rnd = (k: number) => {
      const x = Math.sin(i * 127.1 + seed * 311.7 + k * 74.7) * 43758.5453;
      return x - Math.floor(x);
    };
    arr.push({ t: 0.06 + rnd(1) * 0.94, s: rnd(2) * 2 - 1, size: 0.8 + rnd(3) * 1.9 });
  }
  return arr;
}

const COMET_PARTICLES: Record<string, { ion: CometParticle[]; dust: CometParticle[] }> = {};
COMETS.forEach((c, idx) => {
  COMET_PARTICLES[c.id] = {
    ion: makeParticles(34, idx + 1),
    dust: makeParticles(34, idx + 40),
  };
});

interface BodyPos {
  x: number;
  y: number;
  r: number;
}

function buildBackground(w: number, h: number, dpr: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext("2d")!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);

  const base = g.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, "#080d1c");
  base.addColorStop(0.5, "#04070f");
  base.addColorStop(1, "#03040c");
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);

  const blob = (x: number, y: number, r: number, color: string) => {
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, color);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = rg;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  };
  const m = Math.max(w, h);
  blob(w * 0.15, h * 0.24, m * 0.42, "rgba(26,84,108,0.14)");
  blob(w * 0.88, h * 0.72, m * 0.45, "rgba(112,64,28,0.11)");
  blob(w * 0.72, h * 0.12, m * 0.3, "rgba(22,56,116,0.10)");
  blob(w * 0.32, h * 0.88, m * 0.34, "rgba(18,88,88,0.09)");

  // диагональная полоса Млечного Пути
  for (let i = 0; i < 560; i++) {
    const t = Math.random();
    const bx = t * w * 1.3 - w * 0.15;
    const by =
      (1 - t) * h * 1.1 - h * 0.05 + (Math.random() - 0.5) * h * 0.17;
    const a = 0.04 + Math.random() * 0.15;
    g.fillStyle = `rgba(205,222,255,${a})`;
    g.fillRect(bx, by, Math.random() < 0.85 ? 0.6 : 1.1, 0.6);
  }

  // статичные дальние звёзды
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const a = 0.14 + Math.random() * 0.5;
    const r = Math.random() < 0.88 ? 0.4 + Math.random() * 0.7 : 1 + Math.random() * 0.8;
    g.fillStyle =
      Math.random() < 0.18 ? `rgba(255,231,196,${a})` : `rgba(206,222,252,${a})`;
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.fill();
    if (r > 1.2) {
      g.fillStyle = `rgba(220,235,255,${a * 0.22})`;
      g.beginPath();
      g.arc(x, y, r * 2.5, 0, TAU);
      g.fill();
    }
  }

  const vg = g.createRadialGradient(w / 2, h / 2, m * 0.3, w / 2, h / 2, m * 0.78);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(2,4,10,0.55)");
  g.fillStyle = vg;
  g.fillRect(0, 0, w, h);
  return c;
}

function genTwinkles(w: number, h: number): Twinkle[] {
  const arr: Twinkle[] = [];
  for (let i = 0; i < 150; i++) {
    arr.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.5 + Math.random() * 1.1,
      phase: Math.random() * TAU,
      spd: 0.5 + Math.random() * 1.9,
      warm: Math.random() < 0.14,
    });
  }
  return arr;
}

export default function SolarSystemCanvas({
  settings,
  selectedId,
  resetToken,
  onSelect,
  onTick,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sRef = useRef(settings);
  const selRef = useRef(selectedId);
  const onSelRef = useRef(onSelect);
  const onTickRef = useRef(onTick);
  const resetRef = useRef(resetToken);
  const simDaysRef = useRef(0);

  useEffect(() => {
    sRef.current = settings;
    selRef.current = selectedId;
    onSelRef.current = onSelect;
    onTickRef.current = onTick;
  });

  useEffect(() => {
    if (resetToken !== resetRef.current) {
      resetRef.current = resetToken;
      simDaysRef.current = 0;
    }
  }, [resetToken]);

  useEffect(() => {
    const cvs = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = cvs.getContext("2d")!;

    const sizeRef = { w: 0, h: 0, dpr: 1 };
    let bg: HTMLCanvasElement | null = null;
    let twinkles: Twinkle[] = [];
    const posMap: Record<string, BodyPos> = {};
    const prevComet: Record<string, BodyPos> = {};
    let hoverId: string | null = null;
    let offX = 0;
    let wallT = 0;
    let last = performance.now();
    let lastReport = 0;
    let raf = 0;
    let shoot: { x: number; y: number; vx: number; vy: number; life: number; max: number } | null =
      null;
    let shootTimer = 4;

    const onResize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.w = rect.width;
      sizeRef.h = rect.height;
      sizeRef.dpr = dpr;
      cvs.width = Math.round(rect.width * dpr);
      cvs.height = Math.round(rect.height * dpr);
      bg = buildBackground(rect.width, rect.height, dpr);
      twinkles = genTwinkles(rect.width, rect.height);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);
    onResize();

    const hitTest = (px: number, py: number): string | null => {
      let best: string | null = null;
      let bestD = Infinity;
      for (const id of Object.keys(posMap)) {
        const p = posMap[id];
        const d = Math.hypot(px - p.x, py - p.y);
        const th = Math.max(p.r + 8, 14);
        if (d < th && d < bestD) {
          bestD = d;
          best = id;
        }
      }
      return best;
    };

    const onMove = (e: PointerEvent) => {
      const r = cvs.getBoundingClientRect();
      hoverId = hitTest(e.clientX - r.left, e.clientY - r.top);
      cvs.style.cursor = hoverId ? "pointer" : "default";
    };
    const onLeave = () => {
      hoverId = null;
    };
    const onClick = (e: MouseEvent) => {
      const r = cvs.getBoundingClientRect();
      onSelRef.current(hitTest(e.clientX - r.left, e.clientY - r.top));
    };
    cvs.addEventListener("pointermove", onMove);
    cvs.addEventListener("pointerleave", onLeave);
    cvs.addEventListener("click", onClick);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const s = sRef.current;
      const w = sizeRef.w;
      const h = sizeRef.h;
      if (!w || !h || !bg) return;

      let dt = (now - last) / 1000;
      last = now;
      dt = clamp(dt, 0, 0.1);
      wallT += dt;
      if (s.playing) simDaysRef.current += dt * s.speed * DAYS_PER_SEC;
      const simDays = simDaysRef.current;

      if (now - lastReport > 200) {
        lastReport = now;
        onTickRef.current(simDays);
      }

      ctx.setTransform(sizeRef.dpr, 0, 0, sizeRef.dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(bg, 0, 0, w, h);

      /* ---- мерцающие звёзды ---- */
      for (const st of twinkles) {
        const tw = s.reducedMotion
          ? 0.5
          : 0.5 + 0.5 * Math.sin(wallT * st.spd + st.phase);
        ctx.globalAlpha = 0.1 + tw * 0.6;
        ctx.fillStyle = st.warm ? "#ffe9c9" : "#cfe0ff";
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* ---- падающие звёзды ---- */
      if (!s.reducedMotion) {
        shootTimer -= dt;
        if (shootTimer <= 0 && !shoot) {
          shootTimer = 5 + Math.random() * 7;
          const dirX = Math.random() < 0.5 ? -1 : 1;
          shoot = {
            x: w * 0.12 + Math.random() * w * 0.76,
            y: Math.random() * h * 0.35,
            vx: dirX * (380 + Math.random() * 260),
            vy: 160 + Math.random() * 130,
            life: 0,
            max: 0.8 + Math.random() * 0.4,
          };
        }
        if (shoot) {
          shoot.life += dt;
          if (shoot.life > shoot.max) shoot = null;
          else {
            const k = 1 - shoot.life / shoot.max;
            const grad = ctx.createLinearGradient(
              shoot.x,
              shoot.y,
              shoot.x - shoot.vx * 0.14,
              shoot.y - shoot.vy * 0.14,
            );
            grad.addColorStop(0, `rgba(235,245,255,${0.85 * k})`);
            grad.addColorStop(1, "rgba(235,245,255,0)");
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(shoot.x, shoot.y);
            ctx.lineTo(shoot.x - shoot.vx * 0.14, shoot.y - shoot.vy * 0.14);
            ctx.stroke();
            shoot.x += shoot.vx * dt;
            shoot.y += shoot.vy * dt;
          }
        }
      }

      /* ---- геометрия сцены ---- */
      const offTarget = w >= 1100 && selRef.current ? -84 : 0;
      offX += (offTarget - offX) * (s.reducedMotion ? 1 : 0.065);
      const cx = w / 2 + offX;
      const cy = h / 2 - 12;
      const maxR = Math.max(110, Math.min(w / 2 - 34, h / 2 - 126));
      const sunR = clamp(maxR * 0.06, 15, 26);
      const inner = sunR + 15;
      const orbitR = (a: number) =>
        inner + (maxR - inner) * Math.pow(a / NEPTUNE_A, s.scaleK);

      for (const k of Object.keys(posMap)) delete posMap[k];

      /* ---- орбитальные линии планет ---- */
      if (s.showOrbits) {
        for (const b of PLANETS) {
          const sel = selRef.current === b.id;
          const hov = hoverId === b.id;
          ctx.beginPath();
          ctx.arc(cx, cy, orbitR(b.aAU), 0, TAU);
          ctx.strokeStyle = hexToRgba(b.chip, sel ? 0.5 : hov ? 0.36 : 0.13);
          ctx.lineWidth = sel ? 1.4 : 1;
          ctx.stroke();
        }
      }

      /* ---- траектории комет (эллипсы по Кеплеру) ---- */
      const cometState: {
        b: CelestialBody;
        x: number;
        y: number;
        rAU: number;
        vx: number;
        vy: number;
      }[] = [];
      if (s.showComets) {
        for (const c of COMETS) {
          const e = c.eccentricity!;
          // прямое движение — против часовой стрелки (ось y направлена вниз)
          const dir = c.retrograde ? 1 : -1;
          const sel = selRef.current === c.id;
          // путь
          ctx.beginPath();
          for (let i = 0; i <= 160; i++) {
            const E = (i / 160) * TAU;
            const rp = c.aAU * (1 - e * Math.cos(E));
            const nu =
              2 *
              Math.atan2(
                Math.sqrt(1 + e) * Math.sin(E / 2),
                Math.sqrt(1 - e) * Math.cos(E / 2),
              );
            const ang = (c.argPeriDeg! * Math.PI) / 180 + dir * nu;
            const rr = orbitR(rp);
            const px = cx + Math.cos(ang) * rr;
            const py = cy + Math.sin(ang) * rr;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.setLineDash([4, 7]);
          ctx.strokeStyle = hexToRgba(c.chip, sel ? 0.55 : 0.17);
          ctx.lineWidth = sel ? 1.4 : 1;
          ctx.stroke();
          ctx.setLineDash([]);

          // маркер перигелия
          const periR = orbitR(c.aAU * (1 - e));
          const periAng = (c.argPeriDeg! * Math.PI) / 180;
          const ppx = cx + Math.cos(periAng) * periR;
          const ppy = cy + Math.sin(periAng) * periR;
          ctx.save();
          ctx.translate(ppx, ppy);
          ctx.rotate(Math.PI / 4);
          ctx.strokeStyle = hexToRgba(c.chip, 0.65);
          ctx.lineWidth = 1;
          ctx.strokeRect(-2.4, -2.4, 4.8, 4.8);
          ctx.restore();

          // текущее положение
          const M0 = TAU * ((simDays - c.perihelionEpochDays!) / c.periodDays);
          const M = ((M0 % TAU) + TAU) % TAU;
          const E = solveKepler(M, e);
          const nu =
            2 *
            Math.atan2(
              Math.sqrt(1 + e) * Math.sin(E / 2),
              Math.sqrt(1 - e) * Math.cos(E / 2),
            );
          const rAU = c.aAU * (1 - e * Math.cos(E));
          const ang = (c.argPeriDeg! * Math.PI) / 180 + dir * nu;
          const rr = orbitR(rAU);
          const x = cx + Math.cos(ang) * rr;
          const y = cy + Math.sin(ang) * rr;

          const prev = prevComet[c.id];
          let vx = -Math.sin(ang) * dir;
          let vy = Math.cos(ang) * dir;
          if (prev) {
            const dx = x - prev.x;
            const dy = y - prev.y;
            const m2 = Math.hypot(dx, dy);
            if (m2 > 0.0001) {
              vx = dx / m2;
              vy = dy / m2;
            }
          }
          prevComet[c.id] = { x, y, r: 0 };
          cometState.push({ b: c, x, y, rAU, vx, vy });
        }
      } else {
        for (const k of Object.keys(prevComet)) delete prevComet[k];
      }

      /* ---- Солнце ---- */
      const pulse = s.reducedMotion ? 1 : 1 + Math.sin(wallT * 0.85) * 0.03;
      ctx.globalCompositeOperation = "lighter";
      const glow = ctx.createRadialGradient(cx, cy, sunR * 0.3, cx, cy, sunR * 5.4);
      glow.addColorStop(0, "rgba(255,170,64,0.34)");
      glow.addColorStop(0.4, "rgba(255,128,42,0.12)");
      glow.addColorStop(1, "rgba(255,110,30,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR * 5.4, 0, TAU);
      ctx.fill();

      const spikes = s.reducedMotion ? 0 : 1;
      if (spikes) {
        ctx.fillStyle = "rgba(255,190,90,0.07)";
        for (let i = 0; i < 14; i++) {
          const a0 = (i / 14) * TAU + wallT * 0.03;
          const len = sunR * (1.6 + 0.7 * Math.sin(wallT * 0.6 + i * 2.1));
          const aW = 0.05;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a0 - aW) * sunR * 0.9, cy + Math.sin(a0 - aW) * sunR * 0.9);
          ctx.lineTo(cx + Math.cos(a0) * (sunR + len), cy + Math.sin(a0) * (sunR + len));
          ctx.lineTo(cx + Math.cos(a0 + aW) * sunR * 0.9, cy + Math.sin(a0 + aW) * sunR * 0.9);
          ctx.closePath();
          ctx.fill();
        }
      }
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR * pulse);
      core.addColorStop(0, "#fff8e7");
      core.addColorStop(0.32, "#ffe2a3");
      core.addColorStop(0.72, "#ffb14e");
      core.addColorStop(1, "#ef7d2c");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR * pulse, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      posMap[SUN.id] = { x: cx, y: cy, r: sunR };

      /* ---- кометы: хвосты и ядра ---- */
      const labelJobs: { b: CelestialBody; x: number; y: number; r: number }[] = [];
      for (const cs of cometState) {
        const { b, x, y, rAU, vx, vy } = cs;
        const q = clamp((2.4 - rAU) / 2.4, 0, 1);
        const dSun = Math.hypot(x - cx, y - cy) || 1;
        const ux = (x - cx) / dSun;
        const uy = (y - cy) / dSun;
        let dx2 = ux - 0.65 * vx;
        let dy2 = uy - 0.65 * vy;
        const dm = Math.hypot(dx2, dy2) || 1;
        dx2 /= dm;
        dy2 /= dm;
        const L = 14 * q + 250 * Math.pow(q, 1.5);
        const parts = COMET_PARTICLES[b.id];

        ctx.globalCompositeOperation = "lighter";
        if (q <= 0.02) {
          // вдали от Солнца хвоста нет — только слабая кома
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = "#eaf7ff";
          ctx.beginPath();
          ctx.arc(x, y, 1.8, 0, TAU);
          ctx.fill();
          posMap[b.id] = { x, y, r: 8 };
          labelJobs.push({ b, x, y, r: 6 });
          continue;
        }
        // ионный хвост — прямой, от Солнца
        for (const p of parts.ion) {
          const tt = p.t;
          const px = x + ux * L * tt + -uy * p.s * tt * 9;
          const py = y + uy * L * tt + ux * p.s * tt * 9;
          ctx.globalAlpha = (1 - tt) * 0.42 * Math.max(q, 0.12);
          ctx.fillStyle = "#7fd6f2";
          ctx.beginPath();
          ctx.arc(px, py, p.size * (1 - tt * 0.5), 0, TAU);
          ctx.fill();
        }
        // пылевой хвост — изогнут, отстаёт от движения
        for (const p of parts.dust) {
          const tt = p.t;
          const bend = tt * tt * 26 * (vx * -uy - vy * ux > 0 ? 1 : -1);
          const px = x + dx2 * L * 0.92 * tt + -dy2 * (p.s * tt * 13 + bend * tt);
          const py = y + dy2 * L * 0.92 * tt + dx2 * (p.s * tt * 13 + bend * tt);
          ctx.globalAlpha = (1 - tt) * 0.3 * Math.max(q, 0.1);
          ctx.fillStyle = "#ffd9a0";
          ctx.beginPath();
          ctx.arc(px, py, p.size * (1 - tt * 0.4), 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // кома и ядро
        const coma = ctx.createRadialGradient(x, y, 0, x, y, 5 + 17 * q);
        coma.addColorStop(0, `rgba(190,235,255,${0.5 * Math.max(q, 0.15)})`);
        coma.addColorStop(1, "rgba(190,235,255,0)");
        ctx.fillStyle = coma;
        ctx.beginPath();
        ctx.arc(x, y, 5 + 17 * q, 0, TAU);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#f2fcff";
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, TAU);
        ctx.fill();

        posMap[b.id] = { x, y, r: 8 };
        labelJobs.push({ b, x, y, r: 6 });
      }

      /* ---- планеты: шлейфы, диски, кольца, спутники ---- */
      for (const b of PLANETS) {
        // знак «−»: при экранной оси y вниз планеты идут против часовой стрелки, как в реальности
        const ang = -((b.startAngleDeg * Math.PI) / 180 + TAU * (simDays / b.periodDays));
        const rD = orbitR(b.aAU);
        const pr = planetRadius(b.diameterKm);

        // шлейф позади планеты
        const segs = 18;
        const span = 0.5;
        ctx.lineWidth = clamp(pr * 0.42, 1.2, 3.2);
        for (let i = 1; i <= segs; i++) {
          const a0 = ang + (span * i) / segs;
          const a1 = ang + (span * (i - 1)) / segs;
          ctx.strokeStyle = hexToRgba(
            b.chip,
            0.3 * (1 - (i - 1) / segs) * (s.playing ? 1 : 0.4),
          );
          ctx.beginPath();
          ctx.arc(cx, cy, rD, a0, a1);
          ctx.stroke();
        }

        const x = cx + Math.cos(ang) * rD;
        const y = cy + Math.sin(ang) * rD;
        const sel = selRef.current === b.id;
        const hov = hoverId === b.id;
        const lx = cx - x;
        const ly = cy - y;
        const ld = Math.hypot(lx, ly) || 1;
        const ux = lx / ld;
        const uy = ly / ld;

        const ringHalf = (a0: number, a1: number) => {
          ctx.beginPath();
          ctx.ellipse(x, y, pr * 2.05, pr * 0.62, -0.42, a0, a1);
          ctx.strokeStyle = "rgba(216,197,152,0.5)";
          ctx.lineWidth = pr * 0.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(x, y, pr * 1.6, pr * 0.48, -0.42, a0, a1);
          ctx.strokeStyle = "rgba(240,224,182,0.4)";
          ctx.lineWidth = pr * 0.15;
          ctx.stroke();
        };
        if (b.id === "saturn") ringHalf(Math.PI, TAU);

        // диск
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(x, y, pr, 0, TAU);
        ctx.fill();
        // блик со стороны Солнца
        const hg = ctx.createRadialGradient(
          x + ux * pr * 0.45,
          y + uy * pr * 0.45,
          0,
          x + ux * pr * 0.45,
          y + uy * pr * 0.45,
          pr * 1.7,
        );
        hg.addColorStop(0, hexToRgba(b.glow, 0.85));
        hg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(x, y, pr, 0, TAU);
        ctx.fill();
        // тень с ночной стороны
        const sg = ctx.createRadialGradient(
          x - ux * pr * 0.7,
          y - uy * pr * 0.7,
          pr * 0.2,
          x - ux * pr * 0.7,
          y - uy * pr * 0.7,
          pr * 2.2,
        );
        sg.addColorStop(0, "rgba(4,8,18,0.78)");
        sg.addColorStop(0.55, "rgba(4,8,18,0.3)");
        sg.addColorStop(1, "rgba(4,8,18,0)");
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(x, y, pr, 0, TAU);
        ctx.fill();

        if (b.id === "saturn") ringHalf(0, Math.PI);

        // Луна у Земли
        if (b.id === "earth") {
          const mr = pr + 7;
          ctx.strokeStyle = "rgba(207,216,234,0.14)";
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.arc(x, y, mr, 0, TAU);
          ctx.stroke();
          const ma = TAU * (simDays / 27.32) + 0.8;
          ctx.fillStyle = "#cfd8ea";
          ctx.beginPath();
          ctx.arc(x + Math.cos(ma) * mr, y + Math.sin(ma) * mr, 1.6, 0, TAU);
          ctx.fill();
        }

        if (hov && !sel) {
          ctx.strokeStyle = hexToRgba(b.chip, 0.8);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(x, y, pr + 5, 0, TAU);
          ctx.stroke();
          ctx.strokeStyle = hexToRgba(b.chip, 0.25);
          ctx.beginPath();
          ctx.arc(x, y, pr + 9, 0, TAU);
          ctx.stroke();
        }

        posMap[b.id] = { x, y, r: pr };
        labelJobs.push({ b, x, y, r: pr });
      }

      /* ---- подписи ---- */
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.textAlign = "center";
      for (const j of labelJobs) {
        if (j.x < -60 || j.x > w + 60 || j.y < -40 || j.y > h + 40) continue;
        const sel = selRef.current === j.b.id;
        if (!s.showLabels && !sel) continue;
        ctx.fillStyle = sel ? "#ffd489" : "rgba(203,216,240,0.62)";
        ctx.fillText(j.b.short.toUpperCase(), j.x, j.y + j.r + 15);
      }
      // подпись Солнца
      if (s.showLabels || selRef.current === SUN.id) {
        ctx.fillStyle =
          selRef.current === SUN.id ? "#ffd489" : "rgba(255,212,137,0.6)";
        ctx.fillText("СОЛНЦЕ", cx, cy + sunR + 18);
      }

      /* ---- ретикула выбранного тела ---- */
      const selId = selRef.current;
      if (selId && posMap[selId]) {
        const p = posMap[selId];
        const body =
          selId === SUN.id
            ? SUN
            : [...PLANETS, ...COMETS].find((b) => b.id === selId)!;
        const isComet = body.type === "comet";
        const R = p.r + 8 + (s.reducedMotion ? 0 : Math.sin(wallT * 2.4) * 1.6);
        const L = 7;
        ctx.strokeStyle = isComet ? "#7fd6f2" : "#f6b04d";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        for (const sx of [-1, 1]) {
          for (const sy of [-1, 1]) {
            ctx.moveTo(p.x + sx * R, p.y + sy * R - sy * L);
            ctx.lineTo(p.x + sx * R, p.y + sy * R);
            ctx.lineTo(p.x + sx * R - sx * L, p.y + sy * R);
          }
        }
        ctx.stroke();
      }
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cvs.removeEventListener("pointermove", onMove);
      cvs.removeEventListener("pointerleave", onLeave);
      cvs.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
