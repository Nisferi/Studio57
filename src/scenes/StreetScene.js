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

const DARK  = 0x020008;
const GOLD  = 0xffd700;
const PINK  = 0xff00a0;

// Crowd silhouette palette
const CROWD_COLORS = [0x3a0050, 0x501a00, 0x001a40, 0x302030, 0x403010, 0x102030];

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
    g.fillGradientStyle(0x000005, 0x000005, 0x0a0020, 0x0a0020, 1);
    g.fillRect(0, 0, W, H);

    // Horizon purple glow
    g.fillStyle(0x3a0060, 0.15);
    g.fillRect(0, H * 0.20, W, H * 0.06);

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
    g.fillStyle(0x1a0040);
    g.fillRect(W * 0.17, H * 0.04, W * 0.66, H * 0.025);

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
    // Base asphalt
    g.fillStyle(0x0a0a0a);
    g.fillRect(0, H * 0.60, W, H * 0.40);

    // Textured stripes
    for (let i = 0; i < 8; i++) {
      g.fillStyle(i % 2 === 0 ? 0x0c0c0c : 0x080808);
      g.fillRect(0, H * 0.60 + i * (H * 0.40 / 8), W, H * 0.40 / 8);
    }

    // Kerbstone / curb
    g.fillStyle(0x1e1e1e);
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
    // Glow layers
    const glows = ['#ff00a0', '#ff40a8', '#ff80c0'];
    glows.forEach((c, i) => {
      this.add.text(W / 2, H * 0.17, 'STUDIO 57', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '20px', color: c,
        stroke: c, strokeThickness: (3 - i) * 6, alpha: 0.15 + i * 0.25,
      }).setOrigin(0.5);
    });
    this.add.text(W / 2, H * 0.17, 'STUDIO 57', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5);

    // Night number
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
    const count = 35 + GameState.reputation;        // more reputation = bigger crowd
    const g = this.add.graphics();

    // Crowd occupies H 0.55 – 0.70
    for (let i = 0; i < count; i++) {
      const cx  = W * 0.04 + Math.random() * W * 0.92;
      const row = Math.floor(Math.random() * 3);
      const cy  = H * 0.58 + row * 10 + Math.random() * 5;
      const col = CROWD_COLORS[Math.floor(Math.random() * CROWD_COLORS.length)];

      g.fillStyle(col, 0.7 + Math.random() * 0.3);
      // Head
      g.fillCircle(cx, cy - 8, 4);
      // Body
      g.fillRect(cx - 3, cy - 4, 6, 10);
    }

    // Velvet rope posts
    g.fillStyle(0xd4a030);
    [[W * 0.10, H * 0.65], [W * 0.90, H * 0.65]].forEach(([px, py]) => {
      g.fillRect(px - 3, py - 40, 6, 46);
      g.fillCircle(px, py - 40, 6);
    });
    g.lineStyle(6, 0x880044);
    g.beginPath();
    g.moveTo(W * 0.10, H * 0.63);
    for (let i = 0; i <= 20; i++) {
      const t  = i / 20;
      const bx = Phaser.Math.Linear(W * 0.10, W * 0.90, t);
      const by = H * 0.63 + Math.sin(t * Math.PI) * 12;
      i === 0 ? g.moveTo(bx, by) : g.lineTo(bx, by);
    }
    g.strokePath();

    // Paparazzi (camera flash effect) — right of crowd
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
    // HUD bar
    this.add.rectangle(0, 0, W, 44, 0x000000, 0.88).setOrigin(0).setDepth(20);

    // Night + stats
    this.add.text(8, 8, `${L.night_label} ${GameState.nightNumber}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ffd700',
    }).setDepth(21);

    this.add.text(W / 2, 8, `${L.stash}: $${GameState.stash}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ff8800',
    }).setOrigin(0.5, 0).setDepth(21);

    this.add.text(W - 8, 8, `REP: ${GameState.reputation}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#4488ff',
    }).setOrigin(1, 0).setDepth(21);

    // Crowd count
    this.crowdTxt = this.add.text(W / 2, H * 0.72, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#888888',
    }).setOrigin(0.5);
    this.updateCrowdTxt();

    // Timer
    this.timerTxt = this.add.text(W / 2, H * 0.76, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(21);

    // OPEN DOORS button
    const openBg = this.add.rectangle(W / 2, H * 0.89, 200, 48, 0x006620)
      .setStrokeStyle(2, 0x44ff88).setInteractive().setDepth(20);
    const openTxt = this.add.text(W / 2, H * 0.89, L.office_open || 'OPEN TONIGHT', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(21).setInteractive();

    const openDoors = () => this.openDoors();
    openBg.on('pointerdown', openDoors);
    openTxt.on('pointerdown', openDoors);
    openBg.on('pointerover', () => openBg.setFillStyle(0x009940));
    openBg.on('pointerout',  () => openBg.setFillStyle(0x006620));

    // Hype button — delay entry to build crowd
    const hypeBg = this.add.rectangle(W * 0.22, H * 0.89, 80, 36, 0x440066)
      .setStrokeStyle(1, PINK).setInteractive().setDepth(20);
    this.add.text(W * 0.22, H * 0.89, '⏳ HYPE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#ff00a0',
    }).setOrigin(0.5).setDepth(21).setInteractive()
      .on('pointerdown', () => this.hypeDelay());

    hypeBg.on('pointerover', () => hypeBg.setFillStyle(0x660088));
    hypeBg.on('pointerout',  () => hypeBg.setFillStyle(0x440066));
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
    const lang = GameState.lang;

    // Arnie portrait area
    const px = W * 0.10;
    const py = H * 0.78;
    const bw = W * 0.78;
    const bh = 50;

    this.add.rectangle(W / 2, py, bw, bh, 0x000000, 0.82)
      .setStrokeStyle(1, 0x333333).setDepth(10);

    // Pixel Arnie face
    this.drawArnieFace(px - 16, py, line.portrait);

    // Arnie name label
    this.add.text(px + 2, py - bh / 2 + 6, 'ARNIE:', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#ffd700',
    }).setDepth(11);

    // Dialogue text
    this.add.text(px + 2, py - bh / 2 + 18, line.text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#cccccc',
      wordWrap: { width: bw - 26 }, lineSpacing: 4,
    }).setDepth(11);
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
