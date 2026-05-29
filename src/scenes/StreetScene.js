/**
 * StreetScene — pre-night exterior phase.
 * Player sees the street, the crowd, and can make 1-2 quick decisions
 * before opening the doors. Lasts ~20 seconds or until player proceeds.
 */
import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { LOCALES } from '../data/locales.js';
import { getArnieLine } from '../data/arnie_lines.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { PixelUI } from '../systems/PixelUI.js';

const DARK  = 0x020008;
const GOLD  = 0xffd700;
const PINK  = 0xff00a0;

// Crowd silhouette palette
const CROWD_COLORS = [0x7800a8, 0x903010, 0x0055a8, 0x484488, 0x707020, 0x185060];

export class StreetScene extends Phaser.Scene {
  constructor() { super({ key: 'Street' }); }

  create() {
    const { width: W, height: H } = this.scale;
    this.W = W; this.H = H;
    const L = LOCALES[GameState.lang];

    this.buildExterior(W, H);
    this.buildCrowd(W, H);
    this.buildNeonSign(W, H);
    this.buildUI(W, H, L);
    this.buildArnieDialogue(W, H);

    // Countdown to auto-open
    this.countdown = 20;
    this.clockEvt = this.time.addEvent({
      delay: 1000,
      callback: this.onTick,
      callbackScope: this,
      loop: true,
    });

    // Ambient — low volume before doors open
    AudioSystem.resume();

    // Entrance animation
    this.cameras.main.fadeIn(400, 2, 0, 8);
  }

  // ─── BACKGROUND ────────────────────────────────────────────────────────────

  buildExterior(W, H) {
    const g = this.add.graphics();

    // ── 1. NIGHT SKY ──────────────────────────────────────────────────────────
    g.fillGradientStyle(0x06001e, 0x06001e, 0x1e0060, 0x1e0060, 1);
    g.fillRect(0, 0, W, H);

    // Horizon glow — two-layer pink/violet
    g.fillStyle(0xcc00ff, 0.18);
    g.fillRect(0, H * 0.18, W, H * 0.10);
    g.fillStyle(0xff0088, 0.09);
    g.fillRect(0, H * 0.22, W, H * 0.06);

    // Stars
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * 0.55 + 0.1;
      g.fillStyle(0xffffff, a);
      g.fillRect(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H * 0.22),
        Math.random() > 0.8 ? 2 : 1, Math.random() > 0.8 ? 2 : 1
      );
    }

    // Moon halo
    g.fillStyle(0xfff0c0, 0.06);
    g.fillCircle(W * 0.82, H * 0.06, 28);
    // Moon
    g.fillStyle(0xfff8e0, 0.9);
    g.fillCircle(W * 0.82, H * 0.06, 14);

    // ── 2. BACKGROUND BUILDINGS ───────────────────────────────────────────────
    const buildings = [
      { x: 0.02, w: 0.08, h: 0.38, col: 0x050010, tank: false },
      { x: 0.10, w: 0.06, h: 0.28, col: 0x040008, tank: false },
      { x: 0.16, w: 0.12, h: 0.44, col: 0x060014, tank: true  },
      { x: 0.28, w: 0.05, h: 0.22, col: 0x040008, tank: false },
      { x: 0.66, w: 0.11, h: 0.35, col: 0x050010, tank: false },
      { x: 0.78, w: 0.07, h: 0.45, col: 0x060014, tank: true  },
      { x: 0.86, w: 0.06, h: 0.26, col: 0x040008, tank: false },
      { x: 0.92, w: 0.08, h: 0.32, col: 0x050010, tank: true  },
    ];
    buildings.forEach(b => {
      g.fillStyle(b.col);
      g.fillRect(W * b.x, H * (0.26 - b.h), W * b.w, H * b.h);
      // Windows
      for (let wy = 0; wy < Math.floor(b.h * 18); wy++) {
        for (let wx = 0; wx < Math.floor(b.w * 12); wx++) {
          if (Math.random() > 0.55) {
            g.fillStyle(Math.random() > 0.3 ? 0xffd060 : 0x08080e, 1);
            g.fillRect(
              W * b.x + wx * (W * b.w / Math.floor(b.w * 12)),
              H * (0.26 - b.h) + wy * (H * b.h / Math.floor(b.h * 18)),
              3, 2
            );
          }
        }
      }
      // Water tower on select buildings
      if (b.tank) {
        const tx = W * (b.x + b.w * 0.5);
        const ty = H * (0.26 - b.h) - 1;
        // Support legs
        g.fillStyle(0x0a0010);
        g.fillRect(tx - 5, ty - 10, 2, 10);
        g.fillRect(tx + 3, ty - 10, 2, 10);
        // Tank body
        g.fillRect(tx - 7, ty - 18, 14, 9);
        // Tank cap (two small circles simulate a cylinder dome)
        g.fillCircle(tx, ty - 18, 7);
        g.fillStyle(0x110020);
        g.fillCircle(tx, ty - 18, 4);
      }
    });

    // ── 3. MAIN CLUB BUILDING ─────────────────────────────────────────────────
    // Base
    g.fillStyle(0x0a001c);
    g.fillRect(W * 0.17, H * 0.04, W * 0.66, H * 0.56);

    // Cornice (top trim)
    g.fillStyle(0x220055);
    g.fillRect(W * 0.17, H * 0.04, W * 0.66, H * 0.025);
    // Neon accent strip on cornice
    g.fillStyle(0xff00cc, 0.55);
    g.fillRect(W * 0.17, H * 0.04, W * 0.66, 2);
    g.fillStyle(0xff00cc, 0.20);
    g.fillRect(W * 0.17, H * 0.04, W * 0.66, 5);

    // Pilasters (4 vertical columns across the facade)
    g.fillStyle(0x0d0028);
    const pilX = [0.19, 0.36, 0.61, 0.78];
    pilX.forEach(px => {
      g.fillRect(W * px, H * 0.04, W * 0.018, H * 0.56);
    });

    // Club windows — 3 rows × 6 cols, arched style
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 6; c++) {
        const wx = W * 0.215 + c * W * 0.094;
        const wy = H * 0.075 + r * H * 0.068;
        const ww = W * 0.05;
        const wh = H * 0.04;
        const lit = Math.random() > 0.4;
        const winCol   = lit ? 0xffd060 : 0x050008;
        const frameCol = lit ? 0xffb020 : 0x0a0018;
        // Window body
        g.fillStyle(winCol);
        g.fillRect(wx, wy, ww, wh);
        // Arch cap (small square on top simulates arch top)
        g.fillRect(wx + ww * 0.25, wy - wh * 0.25, ww * 0.5, wh * 0.28);
        // Inner frame
        g.lineStyle(1, frameCol);
        g.strokeRect(wx, wy, ww, wh);
      }
    }

    // Marquee above entrance
    g.fillStyle(0x1a0040);
    g.fillRect(W * 0.20, H * 0.355, W * 0.60, H * 0.025);
    g.lineStyle(2, GOLD, 0.9);
    g.strokeRect(W * 0.20, H * 0.355, W * 0.60, H * 0.025);

    // ── 4. CLUB ENTRANCE ──────────────────────────────────────────────────────
    // Warm light emanating from inside (glow behind arch)
    g.fillStyle(0xff8800, 0.18);
    g.fillRect(W * 0.38, H * 0.40, W * 0.24, H * 0.20);
    g.fillStyle(0xff8800, 0.08);
    g.fillCircle(W * 0.50, H * 0.42, W * 0.11);

    // Arch base rectangle
    g.fillStyle(DARK);
    g.fillRect(W * 0.37, H * 0.40, W * 0.26, H * 0.20);
    // Arch top — filled semicircle (approximated with a circle clipped by the rect)
    g.fillCircle(W * 0.50, H * 0.40, W * 0.13);

    // Gold arch outline
    g.lineStyle(3, GOLD, 1);
    g.strokeRect(W * 0.37, H * 0.40, W * 0.26, H * 0.20);
    // Gold arch top stroke
    g.beginPath();
    g.arc(W * 0.50, H * 0.40, W * 0.13, Math.PI, 0, false);
    g.strokePath();

    // Door panels
    g.fillStyle(0x1a0830);
    g.fillRect(W * 0.38, H * 0.41, W * 0.115, H * 0.185);
    g.fillRect(W * 0.505, H * 0.41, W * 0.115, H * 0.185);
    g.lineStyle(1, 0x3a1860);
    g.strokeRect(W * 0.38, H * 0.41, W * 0.115, H * 0.185);
    g.strokeRect(W * 0.505, H * 0.41, W * 0.115, H * 0.185);

    // Door handles
    g.fillStyle(GOLD, 0.9);
    g.fillCircle(W * 0.493, H * 0.50, 3);
    g.fillCircle(W * 0.507, H * 0.50, 3);

    // Steps (3 lines)
    g.lineStyle(1, 0x282828);
    g.strokeLineShape(new Phaser.Geom.Line(W * 0.37, H * 0.600, W * 0.63, H * 0.600));
    g.strokeLineShape(new Phaser.Geom.Line(W * 0.38, H * 0.605, W * 0.62, H * 0.605));
    g.strokeLineShape(new Phaser.Geom.Line(W * 0.39, H * 0.610, W * 0.61, H * 0.610));

    // Red carpet
    g.fillStyle(0x5a0010, 1);
    g.fillRect(W * 0.45, H * 0.60, W * 0.10, H * 0.05);

    // ── 5. SIDEWALK ───────────────────────────────────────────────────────────
    // Base asphalt — purple-tinted
    g.fillStyle(0x0c0c1a);
    g.fillRect(0, H * 0.60, W, H * 0.40);

    // Retrowave perspective grid on street
    g.lineStyle(1, 0xff00c8, 0.16);
    const vp2 = W / 2;
    for (let gi = 0; gi <= 7; gi++) {
      const gy = H * 0.60 + (gi / 7) * H * 0.40;
      g.strokeLineShape(new Phaser.Geom.Line(0, gy, W, gy));
    }
    for (let gi = 0; gi <= 12; gi++) {
      const gx = W * (gi / 12);
      g.strokeLineShape(new Phaser.Geom.Line(vp2, H * 0.60, gx, H));
    }
    // Curb neon glow
    g.fillStyle(0x9900cc, 0.25);
    g.fillRect(0, H * 0.60, W, 3);

    // Sidewalk expansion lines
    g.lineStyle(1, 0x1a1a1a);
    for (let i = 0; i < 5; i++) {
      g.strokeLineShape(new Phaser.Geom.Line(
        W * 0.05 + i * W * 0.18, H * 0.63,
        W * 0.05 + i * W * 0.18, H * 0.66
      ));
    }

    // Lamp post (left side)
    g.fillStyle(0x2a2a2a);
    g.fillRect(W * 0.08 - 1, H * 0.44, 3, H * 0.17);   // pole
    g.fillRect(W * 0.08 - 5, H * 0.44, 10, 3);          // arm bracket
    // Lamp head
    g.fillStyle(0xffd060, 0.9);
    g.fillRect(W * 0.08 - 6, H * 0.42, 12, 5);

    // Litter / cigarette butts
    const litterSpots = [
      [W * 0.14, H * 0.64], [W * 0.32, H * 0.67], [W * 0.55, H * 0.65],
      [W * 0.68, H * 0.63], [W * 0.85, H * 0.68],
    ];
    g.fillStyle(0x333333);
    litterSpots.forEach(([lx, ly]) => g.fillRect(lx, ly, 2, 1));

    // Searchlights
    g.fillStyle(0xffffff, 0.04);
    g.fillTriangle(W * 0.12, H * 0.60, 0, 0, W * 0.22, 0);
    g.fillStyle(0xffffff, 0.03);
    g.fillTriangle(W * 0.88, H * 0.60, W * 0.76, 0, W, 0);

    // Limo parked right
    this.drawLimo(g, W * 0.68, H * 0.655);
  }

  drawLimo(g, x, y) {
    // Shadow under car
    g.fillStyle(0x000000, 0.45);
    g.fillRect(x - 2, y + 6, 110, 5);

    // ── Lower body (main chassis) ──
    g.fillStyle(0x0d0d0d);
    g.fillRect(x, y - 10, 100, 16);

    // ── Upper cabin ──
    g.fillStyle(0x111111);
    g.fillRect(x + 10, y - 20, 68, 11);

    // Chrome outline — chassis
    g.lineStyle(1, 0x3a3a3a, 0.9);
    g.strokeRect(x, y - 10, 100, 16);
    // Chrome outline — cabin
    g.strokeRect(x + 10, y - 20, 68, 11);

    // Chrome molding (horizontal mid-line)
    g.lineStyle(1, 0x555555, 0.7);
    g.strokeLineShape(new Phaser.Geom.Line(x + 2, y - 2, x + 98, y - 2));

    // ── Windows (4) ──
    g.fillStyle(0x0a1520);
    g.fillRect(x + 13, y - 19, 14, 9);
    g.fillRect(x + 30, y - 19, 14, 9);
    g.fillRect(x + 47, y - 19, 14, 9);
    g.fillRect(x + 64, y - 19, 14, 9);
    // Window frames
    g.lineStyle(1, 0x1e2a38);
    g.strokeRect(x + 13, y - 19, 14, 9);
    g.strokeRect(x + 30, y - 19, 14, 9);
    g.strokeRect(x + 47, y - 19, 14, 9);
    g.strokeRect(x + 64, y - 19, 14, 9);

    // ── Hood / front section ──
    g.fillStyle(0x0d0d0d);
    g.fillRect(x + 92, y - 14, 14, 10);
    g.lineStyle(1, 0x3a3a3a);
    g.strokeRect(x + 92, y - 14, 14, 10);

    // ── Headlights (front, 2) ──
    g.fillStyle(0xffd080, 0.95);
    g.fillRect(x + 98, y - 12, 5, 3);
    g.fillRect(x + 98, y - 7,  5, 3);

    // ── Tail lights (rear, 2) ──
    g.fillStyle(0xff1010, 0.9);
    g.fillRect(x - 3, y - 10, 4, 4);
    g.fillRect(x - 3, y - 5,  4, 4);

    // ── Licence plate (rear) ──
    g.fillStyle(0xddddcc);
    g.fillRect(x - 2, y + 1, 10, 4);

    // ── Wheels (4 — two axles) ──
    const wheelPositions = [x + 16, x + 40, x + 62, x + 86];
    wheelPositions.forEach(wx => {
      // Tyre
      g.fillStyle(0x111111);
      g.fillCircle(wx, y + 7, 8);
      // Rim
      g.fillStyle(0x404040);
      g.fillCircle(wx, y + 7, 5);
      // Chrome hub
      g.fillStyle(0xaaaaaa);
      g.fillCircle(wx, y + 7, 2);
    });
  }

  buildNeonSign(W, H) {
    const glows = ['#ff00cc', '#ff40d4', '#ff80e0'];
    glows.forEach((c, i) => {
      this.add.text(W / 2, H * 0.17, 'STUDIO 57', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '22px', color: c,
        stroke: c, strokeThickness: (3 - i) * 7,
      }).setOrigin(0.5).setAlpha(0.12 + i * 0.28);
    });
    this.neonTop = this.add.text(W / 2, H * 0.17, 'STUDIO 57', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '22px', color: '#ffffff',
      stroke: '#ffffff', strokeThickness: 1,
    }).setOrigin(0.5);

    // Random neon flicker
    const flicker = () => {
      this.neonTop.setAlpha(Math.random() > 0.15 ? 1 : 0.25);
      this.time.delayedCall(55 + Math.random() * 90, () => {
        this.neonTop?.setAlpha(1);
        this.time.delayedCall(2200 + Math.random() * 4000, flicker);
      });
    };
    this.time.delayedCall(1200 + Math.random() * 1800, flicker);

    // Night label + year
    const L = LOCALES[GameState.lang];
    this.add.text(W / 2, H * 0.24, `${L.night_label} ${GameState.nightNumber}  ·  ${this.getEpochYear()}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#888888',
    }).setOrigin(0.5);
  }

  getEpochYear() {
    const epoch = GameState.epoch || 70;
    const base  = epoch === 70 ? 1977 : epoch === 80 ? 1980 : epoch === 90 ? 1990 : 2000;
    return base + (GameState.epochNight || 1) - 1;
  }

  // ─── CROWD ─────────────────────────────────────────────────────────────────

  buildCrowd(W, H) {
    // Back-row static silhouettes (depth 0)
    const staticG = this.add.graphics().setDepth(0);
    for (let i = 0; i < 22; i++) {
      const cx  = W * 0.05 + Math.random() * W * 0.90;
      const cy  = H * 0.585 + Math.random() * 8;
      const col = CROWD_COLORS[Math.floor(Math.random() * CROWD_COLORS.length)];
      staticG.fillStyle(col, 0.45 + Math.random() * 0.25);
      staticG.fillCircle(cx, cy - 6, 3);
      staticG.fillRect(cx - 2, cy - 3, 5, 8);
    }

    // Front-row animated containers (depth 1)
    const frontCount = Math.min(18, 12 + Math.floor(GameState.reputation / 6));
    for (let i = 0; i < frontCount; i++) {
      const col   = CROWD_COLORS[Math.floor(Math.random() * CROWD_COLORS.length)];
      const scale = 0.8 + Math.random() * 0.55;
      const cx    = W * 0.04 + Math.random() * W * 0.92;
      const cy    = H * 0.615 + Math.floor(Math.random() * 2) * 9;

      const fig = this.add.graphics();
      fig.fillStyle(col, 0.85 + Math.random() * 0.15);
      // Head
      fig.fillCircle(0, -9, 4);
      // Body
      fig.fillRect(-3, -5, 6, 10);
      // Arms — three random poses
      const arm = Math.floor(Math.random() * 3);
      if (arm === 0) { fig.fillRect(-7, -3, 4, 2); fig.fillRect(3, -3, 4, 2); }
      else if (arm === 1) { fig.fillRect(-8, -6, 5, 2); fig.fillRect(3, -6, 5, 2); }
      else { fig.fillRect(-6, -1, 3, 2); fig.fillRect(3, -1, 3, 2); }

      const c = this.add.container(cx, cy, [fig]).setScale(scale).setDepth(1);
      this.tweens.add({
        targets: c,
        y: cy - (2 + Math.random() * 3),
        duration: 600 + Math.random() * 700,
        yoyo: true, repeat: -1,
        ease: 'Sine.InOut',
        delay: Math.random() * 1100,
      });
    }

    // Velvet rope (depth 3, on top of crowd)
    const ropeG = this.add.graphics().setDepth(3);
    ropeG.fillStyle(0xd4a030);
    [[W * 0.10, H * 0.65], [W * 0.90, H * 0.65]].forEach(([px, py]) => {
      ropeG.fillRect(px - 3, py - 40, 6, 46);
      ropeG.fillCircle(px, py - 40, 6);
      // Golden finial
      ropeG.fillStyle(0xffe050);
      ropeG.fillCircle(px, py - 46, 4);
      ropeG.fillStyle(0xd4a030);
    });
    ropeG.lineStyle(6, 0x880044);
    ropeG.beginPath();
    for (let i = 0; i <= 20; i++) {
      const t  = i / 20;
      const bx = Phaser.Math.Linear(W * 0.10, W * 0.90, t);
      const by = H * 0.63 + Math.sin(t * Math.PI) * 14;
      i === 0 ? ropeG.moveTo(bx, by) : ropeG.lineTo(bx, by);
    }
    ropeG.strokePath();

    // Paparazzi flash (depth 5)
    this.paparazziG = this.add.graphics().setDepth(5);
    this.time.addEvent({
      delay: Phaser.Math.Between(2000, 4000),
      callback: this.flashPaparazzi,
      callbackScope: this,
      loop: true,
    });
  }

  flashPaparazzi() {
    const g = this.paparazziG;
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(this.W * 0.82, this.H * 0.58, 12);
    this.time.delayedCall(80, () => g.clear());
  }

  // ─── UI ────────────────────────────────────────────────────────────────────

  buildUI(W, H, L) {
    // ── HUD bar (chrome pixel style) ────────────────────────────────────────
    this.add.rectangle(0, 0, W, 46, 0x000000, 0.92).setOrigin(0).setDepth(20);

    const hudG = this.add.graphics().setDepth(21);
    // Gold bottom edge
    hudG.fillStyle(GOLD, 0.30);
    hudG.fillRect(0, 44, W, 2);
    // Corner accents
    hudG.fillStyle(GOLD, 0.55);
    [[0, 0], [W - 6, 0], [0, 38], [W - 6, 38]].forEach(([hx, hy]) =>
      hudG.fillRect(hx, hy, 6, 6)
    );
    // Vertical dividers
    hudG.fillStyle(GOLD, 0.15);
    hudG.fillRect(Math.floor(W * 0.34), 5, 1, 33);
    hudG.fillRect(Math.floor(W * 0.67), 5, 1, 33);

    this.add.text(10, 9, `${L.night_label} ${GameState.nightNumber}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 2,
    }).setDepth(22);

    this.add.text(W / 2, 9, `🔒 $${GameState.stash.toLocaleString()}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#ff9922',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setDepth(22);

    this.add.text(W - 10, 9, `★ ${GameState.reputation}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#aa44ff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(1, 0).setDepth(22);

    // ── Crowd count + timer ────────────────────────────────────────────────
    this.crowdTxt = this.add.text(W / 2, H * 0.715, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#888888',
    }).setOrigin(0.5).setDepth(10);
    this.updateCrowdTxt();

    this.timerTxt = this.add.text(W / 2, H * 0.750, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#88bbff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(21);

    // ── OPEN DOORS button (3D pixel style) ────────────────────────────────
    const { bg: openBg } = PixelUI.button(
      this, W / 2, H * 0.885, 210, 48,
      `🚪 ${L.office_open || 'OPEN TONIGHT'}`,
      { baseColor: 0x004d22, hoverColor: 0x007733, borderColor: 0x44ff88, fontSize: '8px', depth: 20 }
    );
    openBg.on('pointerdown', () => this.openDoors());

    // ── HYPE button ────────────────────────────────────────────────────────
    const { bg: hypeBg } = PixelUI.button(
      this, W * 0.20, H * 0.885, 82, 36, '⏳ HYPE',
      { baseColor: 0x440066, hoverColor: 0x660099, borderColor: PINK, textColor: '#ff44cc', fontSize: '7px', depth: 20 }
    );
    hypeBg.on('pointerdown', () => this.hypeDelay());
  }

  updateCrowdTxt() {
    const count = 35 + Math.floor(GameState.reputation / 2);
    const L = LOCALES[GameState.lang];
    this.crowdTxt.setText(`~${count} people waiting`);
  }

  // ─── ARNIE DIALOGUE ────────────────────────────────────────────────────────

  buildArnieDialogue(W, H) {
    const line = getArnieLine(GameState);

    const bw  = W * 0.84;
    const bh  = 56;
    const py  = H * 0.795;
    const px  = W / 2 - bw / 2 + 6;

    PixelUI.panel(this, W / 2, py, bw, bh, {
      bgColor: 0x04020e, bgAlpha: 0.93,
      borderColor: 0xffd700, cornerSize: 5, depth: 10,
    });

    // Pixel Arnie face (left edge)
    this.drawArnieFace(W * 0.08, py, line.portrait);

    // Label + line
    this.add.text(px + 18, py - bh / 2 + 8, 'ARNIE:', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#ffd700',
    }).setDepth(12);
    this.add.text(px + 18, py - bh / 2 + 22, line.text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#cccccc',
      wordWrap: { width: bw - 52 }, lineSpacing: 4,
    }).setDepth(12);
  }

  drawArnieFace(x, y, portrait) {
    const g = this.add.graphics().setDepth(11);
    const s = 2;
    const portraits = {
      neutral:  { skinTone: 0xd4a574, eyeColor: 0x222222, mouth: 'neutral' },
      worried:  { skinTone: 0xd4a574, eyeColor: 0x222222, mouth: 'frown' },
      scared:   { skinTone: 0xb8906a, eyeColor: 0x222222, mouth: 'open' },
      excited:  { skinTone: 0xd4a574, eyeColor: 0x222222, mouth: 'smile' },
      pleased:  { skinTone: 0xd4a574, eyeColor: 0x222222, mouth: 'smile' },
      amused:   { skinTone: 0xd4a574, eyeColor: 0x222222, mouth: 'smile' },
      nervous:  { skinTone: 0xb8906a, eyeColor: 0x222222, mouth: 'frown' },
      serious:  { skinTone: 0xd4a574, eyeColor: 0x222222, mouth: 'neutral' },
      tense:    { skinTone: 0xb8906a, eyeColor: 0x222222, mouth: 'frown' },
      relieved: { skinTone: 0xd4a574, eyeColor: 0x222222, mouth: 'smile' },
      intro:    { skinTone: 0xd4a574, eyeColor: 0x222222, mouth: 'smile' },
    };
    const p = portraits[portrait] || portraits.neutral;

    // Head
    g.fillStyle(p.skinTone);
    g.fillRect(x - 4 * s, y - 5 * s, 8 * s, 8 * s);
    // Hair (dark, short)
    g.fillStyle(0x1a0a00);
    g.fillRect(x - 4 * s, y - 8 * s, 8 * s, 4 * s);
    // Eyes
    g.fillStyle(p.eyeColor);
    g.fillRect(x - 3 * s, y - 3 * s, s, s);
    g.fillRect(x + 2 * s, y - 3 * s, s, s);
    // Portrait-specific eyebrows
    if (portrait === 'worried' || portrait === 'scared' || portrait === 'nervous' || portrait === 'tense') {
      g.fillStyle(0x1a0a00);
      g.fillRect(x - 3 * s, y - 5 * s, 2 * s, s);
      g.fillRect(x + 1 * s, y - 5 * s, 2 * s, s);
    }
    // Mouth
    g.fillStyle(0x993333);
    if (p.mouth === 'smile') {
      g.fillRect(x - 2 * s, y, 4 * s, s);
      g.fillRect(x - 3 * s, y - s, s, s);
      g.fillRect(x + 2 * s, y - s, s, s);
    } else if (p.mouth === 'frown') {
      g.fillRect(x - 2 * s, y + s, 4 * s, s);
      g.fillRect(x - 3 * s, y, s, s);
      g.fillRect(x + 2 * s, y, s, s);
    } else if (p.mouth === 'open') {
      g.fillStyle(0x330000);
      g.fillRect(x - 2 * s, y - s, 4 * s, 3 * s);
    } else {
      g.fillRect(x - 2 * s, y, 4 * s, s);
    }
    // Body hint (shirt collar)
    g.fillStyle(0x1a3a6a);
    g.fillRect(x - 3 * s, y + 3 * s, 6 * s, 4 * s);
    g.fillStyle(p.skinTone);
    g.fillRect(x - s, y + 2 * s, 2 * s, 3 * s);
  }

  // ─── ACTIONS ───────────────────────────────────────────────────────────────

  hypeDelay() {
    // Add 5 seconds to countdown (build hype, bigger crowd feel)
    this.countdown += 5;
    GameState.reputation = Math.min(100, GameState.reputation + 2);
    this.floatText(this.W / 2, this.H * 0.55, 'HYPE! +2 REP', PINK);
  }

  openDoors() {
    if (this.opened) return;
    this.opened = true;
    this.clockEvt?.remove();
    this.cameras.main.fadeOut(300, 2, 0, 8, () => {
      GameState.resetNightStats();
      this.scene.start('Night');
    });
  }

  onTick() {
    this.countdown--;
    this.timerTxt.setText(`OPEN IN: ${this.countdown}s`);
    if (this.countdown <= 5) this.timerTxt.setColor('#ff4040');
    if (this.countdown <= 0) this.openDoors();
  }

  floatText(x, y, msg, color) {
    const t = this.add.text(x, y, msg, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px', color,
      backgroundColor: '#000000cc',
      padding: { x: 8, y: 5 },
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({
      targets: t, y: y - 40, alpha: { from: 1, to: 0 },
      duration: 1500, onComplete: () => t.destroy(),
    });
  }
}
