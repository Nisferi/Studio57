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

    // Night sky gradient
    g.fillGradientStyle(0x000005, 0x000005, 0x0a0020, 0x0a0020, 1);
    g.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 60; i++) {
      const a = Math.random() * 0.5 + 0.1;
      g.fillStyle(0xffffff, a);
      g.fillRect(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H * 0.22),
        Math.random() > 0.8 ? 2 : 1, Math.random() > 0.8 ? 2 : 1
      );
    }

    // Far buildings (city skyline)
    const buildings = [
      { x: 0.02, w: 0.08, h: 0.38, col: 0x050010 },
      { x: 0.10, w: 0.06, h: 0.28, col: 0x040008 },
      { x: 0.16, w: 0.12, h: 0.44, col: 0x060014 },
      { x: 0.28, w: 0.05, h: 0.22, col: 0x040008 },
      { x: 0.66, w: 0.11, h: 0.35, col: 0x050010 },
      { x: 0.78, w: 0.07, h: 0.45, col: 0x060014 },
      { x: 0.86, w: 0.06, h: 0.26, col: 0x040008 },
      { x: 0.92, w: 0.08, h: 0.32, col: 0x050010 },
    ];
    buildings.forEach(b => {
      g.fillStyle(b.col);
      g.fillRect(W * b.x, H * (0.26 - b.h), W * b.w, H * b.h);
      // windows
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
    });

    // Main club building (centre)
    g.fillStyle(0x0c001e);
    g.fillRect(W * 0.18, H * 0.04, W * 0.64, H * 0.56);

    // Club windows — 3 rows
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 7; c++) {
        g.fillStyle(Math.random() > 0.35 ? 0xffd060 : 0x08080e);
        g.fillRect(W * 0.22 + c * W * 0.085, H * 0.07 + r * H * 0.07, W * 0.065, H * 0.045);
      }
    }

    // Club entrance arch
    g.fillStyle(DARK);
    g.fillRect(W * 0.36, H * 0.36, W * 0.28, H * 0.24);
    g.lineStyle(3, GOLD);
    g.strokeRect(W * 0.36, H * 0.36, W * 0.28, H * 0.24);

    // Door panels
    g.fillStyle(0x1a0830);
    g.fillRect(W * 0.37, H * 0.37, W * 0.12, H * 0.22);
    g.fillRect(W * 0.51, H * 0.37, W * 0.12, H * 0.22);
    g.lineStyle(1, 0x3a1860);
    g.strokeRect(W * 0.37, H * 0.37, W * 0.12, H * 0.22);
    g.strokeRect(W * 0.51, H * 0.37, W * 0.12, H * 0.22);

    // Sidewalk
    g.fillStyle(0x0c0c0c);
    g.fillRect(0, H * 0.60, W, H * 0.40);

    // Sidewalk lines
    g.lineStyle(1, 0x1a1a1a);
    for (let i = 0; i < 5; i++) {
      g.strokeLineShape(new Phaser.Geom.Line(
        W * 0.05 + i * W * 0.18, H * 0.63,
        W * 0.05 + i * W * 0.18, H * 0.66
      ));
    }

    // Searchlights sweeping
    g.fillStyle(0xffffff, 0.04);
    g.fillTriangle(W * 0.12, H * 0.60, 0, 0, W * 0.22, 0);
    g.fillStyle(0xffffff, 0.03);
    g.fillTriangle(W * 0.88, H * 0.60, W * 0.76, 0, W, 0);

    // Limo parked right
    this.drawLimo(g, W * 0.72, H * 0.66);
  }

  drawLimo(g, x, y) {
    // Body
    g.fillStyle(0x0a0a0a);
    g.fillRect(x, y - 12, 90, 18);
    g.fillRect(x + 14, y - 22, 58, 12);
    // Windows
    g.fillStyle(0x1a2a3a);
    for (let i = 0; i < 3; i++) {
      g.fillRect(x + 18 + i * 18, y - 20, 14, 9);
    }
    // Wheels
    g.fillStyle(0x111111);
    g.fillCircle(x + 18, y + 7, 8);
    g.fillCircle(x + 72, y + 7, 8);
    g.fillStyle(0x333333);
    g.fillCircle(x + 18, y + 7, 5);
    g.fillCircle(x + 72, y + 7, 5);
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
