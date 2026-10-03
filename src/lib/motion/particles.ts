import type { PersonaKey } from "@/data/personas";
import type { QualityTier } from "./tiers";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: "square" | "circle" | "line";
  active: boolean;
}

export class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private pool: Particle[] = [];
  private maxParticles: number;
  private persona: PersonaKey;
  private tier: QualityTier;
  private animFrameId = 0;
  private isRunning = false;
  private width = 0;
  private height = 0;
  private dpr = 1;

  constructor(canvas: HTMLCanvasElement, persona: PersonaKey, tier: QualityTier) {
    this.canvas = canvas;
    try {
      this.ctx =
        typeof canvas.getContext === "function" ? canvas.getContext("2d", { alpha: true }) : null;
    } catch {
      this.ctx = null;
    }
    this.persona = persona;
    this.tier = tier;

    if (tier === "low") {
      this.maxParticles = 0;
    } else if (tier === "medium") {
      this.maxParticles = 60;
    } else {
      this.maxParticles = 120;
    }

    this.initPool();
    this.resize();
  }

  private initPool(): void {
    this.pool = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        alpha: 1,
        maxLife: 60,
        life: 0,
        color: "#ffffff",
        rotation: 0,
        vRot: 0,
        shape: "circle",
        active: false,
      });
    }
  }

  public resize(): void {
    if (!this.canvas || typeof window === "undefined") return;
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(
      this.tier === "low" ? 1.25 : this.tier === "medium" ? 1.5 : 2,
      window.devicePixelRatio || 1,
    );
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.floor(rect.width * this.dpr);
    this.canvas.height = Math.floor(rect.height * this.dpr);
    if (this.ctx) {
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
  }

  public burst(originX?: number, originY?: number, count = 40): void {
    if (this.maxParticles === 0) return;
    const ox = originX ?? this.width / 2;
    const oy = originY ?? this.height / 2;
    const burstCount = Math.min(count, this.maxParticles);

    let spawned = 0;
    for (const p of this.pool) {
      if (spawned >= burstCount) break;
      if (!p.active) {
        this.spawnParticle(p, ox, oy);
        spawned++;
      }
    }
  }

  private spawnParticle(p: Particle, ox: number, oy: number): void {
    p.active = true;
    p.x = ox + (Math.random() - 0.5) * 40;
    p.y = oy + (Math.random() - 0.5) * 40;
    p.life = 0;
    p.maxLife = 45 + Math.random() * 45;
    p.alpha = 0.9;
    p.rotation = Math.random() * Math.PI * 2;
    p.vRot = (Math.random() - 0.5) * 0.1;

    if (this.persona === "career") {
      // Kotak emas arsitektural jatuh dengan gravitasi
      p.shape = "square";
      p.size = 3 + Math.random() * 5;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      const speed = 2 + Math.random() * 6;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.color = Math.random() > 0.4 ? "#F2B705" : "#FFEFD3";
    } else if (this.persona === "creative") {
      // Orb partikel bulat melayang naik dengan liukan
      p.shape = "circle";
      p.size = 2.5 + Math.random() * 6;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const speed = 1.5 + Math.random() * 4;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.color = Math.random() > 0.4 ? "#57D4DD" : Math.random() > 0.5 ? "#FFEFD3" : "#1F6F78";
    } else {
      // Garis kecepatan radial eksplorasi
      p.shape = "line";
      p.size = 4 + Math.random() * 8;
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.color = Math.random() > 0.4 ? "#3A8C9A" : "#57D4DD";
    }
  }

  public start(): void {
    if (this.isRunning || this.maxParticles === 0) return;
    this.isRunning = true;
    const loop = () => {
      if (!this.isRunning) return;
      this.update();
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animFrameId);
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  private update(): void {
    for (const p of this.pool) {
      if (!p.active) continue;

      p.life++;
      if (p.life >= p.maxLife) {
        p.active = false;
        continue;
      }

      const progress = p.life / p.maxLife;
      p.alpha = 1 - progress * progress;
      p.rotation += p.vRot;

      if (this.persona === "career") {
        // Gravitasi jatuh
        p.vy += 0.16;
        p.vx *= 0.98;
      } else if (this.persona === "creative") {
        // Apungan naik halus
        p.vy -= 0.04;
        p.vx += Math.sin(p.life * 0.1) * 0.15;
      } else {
        // Deakselerasi warp
        p.vx *= 0.95;
        p.vy *= 0.95;
      }

      p.x += p.vx;
      p.y += p.vy;
    }
  }

  private render(): void {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (const p of this.pool) {
      if (!p.active || p.alpha <= 0.01) continue;

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.strokeStyle = p.color;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      if (p.shape === "square") {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.shape === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(-p.size, 0);
        this.ctx.lineTo(p.size, 0);
        this.ctx.stroke();
      }

      this.ctx.restore();
    }
  }

  public destroy(): void {
    this.stop();
    this.pool = [];
  }
}
