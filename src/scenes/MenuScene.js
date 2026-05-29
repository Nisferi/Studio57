import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { SaveSystem } from '../SaveSystem.js';
import { LOCALES } from '../data/locales.js';
import { PixelUI } from '../systems/PixelUI.js';

const DARK = 0x0a0838;

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'Menu' }); }

  create() {
    const { width: W, height: H } = this.scale;
    const L = LOCALES[GameState.lang];

    this.drawSky(W, H);
    this.drawCity(W, H);
    this.drawSearchlights(W, H);
    this.drawCrowd(W, H);
    this.drawSignBoard(W, H);
    this.drawHeroSign(W, H, L);
    this.drawStats(W, H, L);
    this.drawButtons(W, H, L);
    this.drawFooter(W, H, L);
    this.animateDiscoBall(W, H);
    this.startAmbientAnimations(W, H);
  }

  // ─── SKY ────────────────────────────────────────────────────────────────────

  drawSky(W, H) {
    const g = this.add.graphics();

    // Retrowave night gradient — vivid purple-blue, richer and deeper (#16)
    const bands = [
      [0,          0x0c0638],
      [H * 0.05,   0x180e62],
      [H * 0.11,   0x251688],
      [H * 0.18,   0x341ea8],
      [H * 0.25,   0x4228c8],
      [H * 0.32,   0x5030e0],
    ];
    bands.forEach(([y, col], i) => {
      const nextY = bands[i + 1] ? bands[i + 1][0] : H * 0.42;
      g.fillStyle(col);
      g.fillRect(0, y, W, nextY - y);
    });

    // City-light horizon haze — magenta/violet glow (stronger)
    g.fillStyle(0xcc00ff, 0.26);
    g.fillRect(0, H * 0.29, W, H * 0.12);
    g.fillStyle(0xff0088, 0.18);
    g.fillRect(0, H * 0.34, W, H * 0.07);
    g.fillStyle(0xff44cc, 0.10);
    g.fillRect(0, H * 0.36, W, H * 0.05);

    // Stars — three colour types; large ones get a cross-sparkle (#18)
    this.starGraphics = this.add.graphics().setDepth(1);
    this.stars = [];
    for (let i = 0; i < 120; i++) {
      const sx  = Phaser.Math.Between(0, W);
      const sy  = Phaser.Math.Between(0, H * 0.36);
      const big = Math.random() > 0.72;
      const a   = Math.random() * 0.80 + 0.20;
      const t   = Math.random();
      const col = t > 0.72 ? 0xaaceff : t > 0.50 ? 0xfff6cc : 0xffffff;
      this.starGraphics.fillStyle(col, a);
      this.starGraphics.fillRect(sx, sy, big ? 2 : 1, big ? 2 : 1);
      if (big && Math.random() > 0.44) {
        this.starGraphics.fillStyle(col, a * 0.35);
        this.starGraphics.fillRect(sx - 3, sy, 8, 1);
        this.starGraphics.fillRect(sx, sy - 3, 2, 8);
      }
      this.stars.push({ x: sx, y: sy, a, big, col });
    }

    // Moon — warm halo rings, craters, rim glow (improvement #17)
    g.fillStyle(0xffd080, 0.05);
    g.fillCircle(W * 0.84, H * 0.055, 56);
    g.fillStyle(0xffddaa, 0.10);
    g.fillCircle(W * 0.84, H * 0.055, 42);
    g.fillStyle(0xffe8cc, 0.18);
    g.fillCircle(W * 0.84, H * 0.055, 30);
    g.fillStyle(0xfff4e0, 0.94);
    g.fillCircle(W * 0.84, H * 0.055, 18);
    g.lineStyle(1, 0xffe090, 0.70);
    g.strokeCircle(W * 0.84, H * 0.055, 18);
    // Craters — 3 details
    g.fillStyle(0xddcc88, 0.38);
    g.fillCircle(W * 0.84 + 5, H * 0.055 - 4, 4);
    g.fillCircle(W * 0.84 - 6, H * 0.055 + 5, 3);
    g.fillCircle(W * 0.84 + 2, H * 0.055 + 6, 2);
  }

  // ─── CITY ────────────────────────────────────────────────────────────────────

  drawCity(W, H) {
    const g = this.add.graphics().setDepth(2);

    // Distant skyline gradient (fog)
    g.fillStyle(0x1a0048, 0.5);
    g.fillRect(0, H * 0.22, W, H * 0.14);

    // Background buildings — more vivid purples, richer neon tops (#21, #26)
    const bgBldgs = [
      { x: 0.00, w: 0.07, h: 0.34, col: 0x200c72 },
      { x: 0.07, w: 0.05, h: 0.22, col: 0x180a52 },
      { x: 0.11, w: 0.09, h: 0.40, col: 0x2a1090 },
      { x: 0.63, w: 0.10, h: 0.28, col: 0x1e0a70 },
      { x: 0.74, w: 0.07, h: 0.38, col: 0x240e88 },
      { x: 0.82, w: 0.08, h: 0.26, col: 0x180a52 },
      { x: 0.91, w: 0.09, h: 0.33, col: 0x200c72 },
    ];
    const winPalette = [0xffd050, 0x80d8ff, 0x88ff70, 0xff8844, 0xcc44ff, 0x44ffcc];
    bgBldgs.forEach(b => {
      g.fillStyle(b.col);
      g.fillRect(W * b.x, H * (0.30 - b.h), W * b.w, H * b.h + 2);
      // Neon accent strip on building tops — more buildings (improvement #21)
      if (Math.random() > 0.38) {
        const neonTopCols = [0xff00c8, 0x00ccff, 0xffcc00, 0xff4488];
        g.fillStyle(neonTopCols[Math.floor(Math.random() * neonTopCols.length)], 0.42);
        g.fillRect(W * b.x, H * (0.30 - b.h), W * b.w, 2);
        g.fillStyle(neonTopCols[0], 0.12);
        g.fillRect(W * b.x, H * (0.30 - b.h), W * b.w, 5);
      }
      // Windows — warm/cool/green colour mix
      for (let wr = 0; wr < Math.ceil(b.h * 15); wr++) {
        for (let wc = 0; wc < Math.ceil(b.w * 10); wc++) {
          if (Math.random() > 0.46) {
            const wCol = winPalette[Math.floor(Math.random() * winPalette.length)];
            g.fillStyle(wCol, Math.random() * 0.65 + 0.30);
            g.fillRect(
              W * b.x + 2 + wc * (W * b.w / Math.ceil(b.w * 10)),
              H * (0.30 - b.h) + 3 + wr * (H * b.h / Math.ceil(b.h * 15)),
              2, 2
            );
          }
        }
      }
    });

    // ── Main Club Building ────────────────────────────────────────────────────
    const bX = W * 0.17; const bY = H * 0.07;
    const bW = W * 0.66; const bH = H * 0.50;

    // Building body — rich deep purple (not near-black)
    g.fillStyle(0x1a0868);
    g.fillRect(bX, bY, bW, bH);

    // Cornice ornament (top band)
    g.fillStyle(0x3010a0);
    g.fillRect(bX, bY, bW, H * 0.022);
    g.lineStyle(2, 0xffd700, 0.8);
    g.strokeRect(bX + 2, bY + 2, bW - 4, H * 0.022 - 4);

    // Decorative horizontal bands
    g.fillStyle(0x280888, 0.85);
    g.fillRect(bX, bY + bH * 0.32, bW, 3);
    g.fillRect(bX, bY + bH * 0.60, bW, 3);

    // Side pilasters
    [0.19, 0.36, 0.61, 0.78].forEach(px => {
      g.fillStyle(0x130548);
      g.fillRect(W * px, bY, W * 0.016, bH);
      // Pilaster highlight
      g.fillStyle(0xffffff, 0.04);
      g.fillRect(W * px + 1, bY, 2, bH);
    });

    // Windows — 4 rows × 6 cols with arched tops
    const winRows = 4; const winCols = 6;
    for (let r = 0; r < winRows; r++) {
      for (let c = 0; c < winCols; c++) {
        const wx = bX + W * 0.040 + c * bW * 0.152;
        const wy = bY + H * 0.038 + r * H * 0.064;
        const ww = W * 0.048; const wh = H * 0.038;
        const lit = Math.random() > 0.35;
        const winPaletteMain = [0xffd060, 0x80d8ff, 0x88ff80, 0xffaa40];
        const winCol = lit
          ? winPaletteMain[Math.floor(Math.random() * winPaletteMain.length)]
          : 0x050018;
        g.fillStyle(winCol);
        g.fillRect(wx, wy, ww, wh);
        // Arch cap
        if (lit) {
          g.fillStyle(winCol);
          g.fillRect(wx + ww * 0.25, wy - wh * 0.22, ww * 0.5, wh * 0.25);
        }
        g.lineStyle(1, lit ? 0xffcc40 : 0x080018, 0.8);
        g.strokeRect(wx, wy, ww, wh);
      }
    }

    // ── Entrance marquee ─────────────────────────────────────────────────────
    const mX = bX + bW * 0.08; const mY = bY + bH * 0.66;
    const mW = bW * 0.84; const mH = H * 0.028;
    g.fillStyle(0x1a0044);
    g.fillRect(mX, mY, mW, mH);
    // Marquee bulb lights
    g.fillStyle(0xffd700, 0.9);
    for (let bi = 0; bi < 14; bi++) {
      g.fillCircle(mX + 8 + bi * (mW - 16) / 13, mY + mH / 2, 2);
    }
    g.lineStyle(1, 0xffd700, 0.6);
    g.strokeRect(mX, mY, mW, mH);

    // ── Club entrance ────────────────────────────────────────────────────────
    const enX = W * 0.37; const enY = bY + bH * 0.72;
    const enW = W * 0.26; const enH = H * 0.26;

    // Warm inner glow (golden light spilling out)
    g.fillStyle(0xff9900, 0.12);
    g.fillRect(enX, enY, enW, enH + 5);
    g.fillStyle(0xff6600, 0.07);
    g.fillCircle(enX + enW / 2, enY + enH * 0.3, enW * 0.55);

    // Door panels
    g.fillStyle(0x0e041c);
    g.fillRect(enX + 3, enY, enW / 2 - 5, enH - 2);
    g.fillRect(enX + enW / 2 + 3, enY, enW / 2 - 5, enH - 2);
    g.lineStyle(1, 0x2a1040, 0.9);
    g.strokeRect(enX + 3, enY, enW / 2 - 5, enH - 2);
    g.strokeRect(enX + enW / 2 + 3, enY, enW / 2 - 5, enH - 2);

    // Door handles
    g.fillStyle(0xffd700, 0.8);
    g.fillCircle(enX + enW / 2 - 6, enY + enH * 0.5, 3);
    g.fillCircle(enX + enW / 2 + 6, enY + enH * 0.5, 3);

    // Gold arch outline
    g.lineStyle(3, 0xffd700, 0.9);
    g.strokeRect(enX, enY, enW, enH);
    g.beginPath();
    g.arc(enX + enW / 2, enY, enW * 0.40, Math.PI, 0, false);
    g.strokePath();
    g.lineStyle(1, 0xffee80, 0.4);
    g.beginPath();
    g.arc(enX + enW / 2, enY, enW * 0.38, Math.PI, 0, false);
    g.strokePath();

    // Side red velvet rope posts at entrance
    const postY = H * 0.78;
    [[W * 0.26, postY], [W * 0.74, postY]].forEach(([px, py]) => {
      g.fillStyle(0xd4a030);
      g.fillRect(px - 3, py - 38, 6, 45);
      g.fillCircle(px, py - 38, 5);
      g.fillStyle(0xd4a030, 0.6);
      g.fillCircle(px, py - 38, 8);
    });
    // Velvet rope
    g.lineStyle(5, 0x880044, 0.9);
    g.beginPath();
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const rx = W * 0.26 + (W * 0.74 - W * 0.26) * t;
      const ry = postY - 18 + Math.sin(t * Math.PI) * 12;
      i === 0 ? g.moveTo(rx, ry) : g.lineTo(rx, ry);
    }
    g.strokePath();

    // Sidewalk — dark purple tint
    g.fillStyle(0x10101e);
    g.fillRect(0, H * 0.82, W, H * 0.18);
    // Retrowave perspective grid — brighter pink (#24)
    g.lineStyle(1, 0xff00c8, 0.28);
    for (let gi = 0; gi <= 8; gi++) {
      const gy = H * 0.82 + (gi / 8) * H * 0.18;
      g.strokeLineShape(new Phaser.Geom.Line(0, gy, W, gy));
    }
    const vp = W / 2;
    for (let gi = 0; gi <= 14; gi++) {
      const gx = W * (gi / 14);
      g.strokeLineShape(new Phaser.Geom.Line(vp, H * 0.82, gx, H));
    }
    // Curb glow — stronger (#24)
    g.fillStyle(0xcc00ff, 0.30);
    g.fillRect(0, H * 0.82, W, 3);
    g.fillStyle(0x9900cc, 0.15);
    g.fillRect(0, H * 0.823, W, 4);
  }

  // ─── SEARCHLIGHTS ────────────────────────────────────────────────────────────

  drawSearchlights(W, H) {
    const groundY = H * 0.82;

    // Left searchlight
    this.slLeft = this.add.graphics().setDepth(3).setAlpha(0);
    this.slLeft.fillStyle(0xffffff, 0.06);
    this.slLeft.fillTriangle(W * 0.10, groundY, W * 0.06, 0, W * 0.18, 0);

    // Right searchlight
    this.slRight = this.add.graphics().setDepth(3).setAlpha(0);
    this.slRight.fillStyle(0xffffff, 0.06);
    this.slRight.fillTriangle(W * 0.90, groundY, W * 0.82, 0, W * 0.94, 0);

    // Sweep left beam
    this.tweens.add({
      targets: this.slLeft,
      alpha: { from: 0, to: 1 },
      duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.InOut',
    });
    this.tweens.add({
      targets: this.slRight,
      alpha: { from: 0, to: 1 },
      delay: 1100,
      duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.InOut',
    });
  }

  // ─── CROWD ───────────────────────────────────────────────────────────────────

  drawCrowd(W, H) {
    const groundY = H * 0.82;
    const CROWD = [0xcc00e8, 0xd05010, 0x0080e0, 0x7060c8, 0xb0b030, 0x2870b0, 0xe00080, 0x00a888];

    // Create crowd figure containers for bobbing (improvement #20 — more figures)
    this.crowdFigures = [];
    const figCount = 22;
    for (let i = 0; i < figCount; i++) {
      const fx = W * 0.04 + (W * 0.92 / figCount) * i + Phaser.Math.Between(-6, 6);
      const baseY = groundY - 2;
      const scale = 0.7 + Math.random() * 0.5;
      const col   = CROWD[i % CROWD.length];
      const g     = this.add.graphics().setDepth(9);

      // Head
      g.fillStyle(col);
      g.fillCircle(fx, baseY - 18 * scale, 5 * scale);
      // Body
      g.fillRect(fx - 4 * scale, baseY - 13 * scale, 8 * scale, 14 * scale);
      // Arms (varied poses)
      if (i % 3 === 0) {
        g.fillRect(fx - 10 * scale, baseY - 22 * scale, 6 * scale, 3 * scale);
        g.fillRect(fx + 4 * scale,  baseY - 10 * scale, 6 * scale, 3 * scale);
      } else if (i % 3 === 1) {
        g.fillRect(fx - 10 * scale, baseY - 10 * scale, 6 * scale, 3 * scale);
        g.fillRect(fx + 4 * scale,  baseY - 22 * scale, 6 * scale, 3 * scale);
      } else {
        g.fillRect(fx - 10 * scale, baseY - 18 * scale, 6 * scale, 3 * scale);
        g.fillRect(fx + 4 * scale,  baseY - 18 * scale, 6 * scale, 3 * scale);
      }

      this.crowdFigures.push(g);

      // Bob up/down tween with random delay and duration
      this.tweens.add({
        targets: g,
        y: { from: 0, to: -4 * scale },
        duration: 600 + Math.random() * 600,
        delay: Math.random() * 800,
        yoyo: true, repeat: -1, ease: 'Sine.InOut',
      });
    }

    // Ground glow — stronger neon haze from sign (improvement #19)
    const glowG = this.add.graphics().setDepth(8);
    glowG.fillStyle(0xdd00ff, 0.22);
    glowG.fillEllipse(W / 2, groundY + 5, W * 0.90, 48);
    glowG.fillStyle(0xff0088, 0.14);
    glowG.fillEllipse(W / 2, groundY + 5, W * 0.65, 28);
    glowG.fillStyle(0xffd700, 0.06);
    glowG.fillEllipse(W / 2, groundY + 8, W * 0.35, 16);
  }

  // ─── SIGN BOARD ──────────────────────────────────────────────────────────────

  drawSignBoard(W, H) {
    const g = this.add.graphics().setDepth(6);
    const sx = W * 0.18; const sy = H * 0.57;
    const sw = W * 0.64; const sh = H * 0.054;

    // Board backing
    g.fillStyle(0x0a0025);
    g.fillRect(sx, sy, sw, sh);

    // Ornamental bulb border
    const bulbColors = [0xff00d0, 0xffd700, 0x00e8ff, 0xff5500];
    const bulbCount  = 24;
    for (let bi = 0; bi < bulbCount; bi++) {
      const bx  = sx + 6 + bi * (sw - 12) / (bulbCount - 1);
      const col = bulbColors[bi % bulbColors.length];
      // Halo glow
      g.fillStyle(col, 0.22);
      g.fillCircle(bx, sy + 5, 5);
      g.fillCircle(bx, sy + sh - 5, 5);
      // Core bulb
      g.fillStyle(col, 1.0);
      g.fillCircle(bx, sy + 5, 2);
      g.fillCircle(bx, sy + sh - 5, 2);
    }

    g.lineStyle(2, 0xffd700, 0.6);
    g.strokeRect(sx, sy, sw, sh);

    // Board text will be drawn by drawHeroSign
  }

  // ─── HERO NEON SIGN ──────────────────────────────────────────────────────────

  drawHeroSign(W, H, L) {
    // Neon "STUDIO 57"
    const signY = H * 0.595;
    const neon = PixelUI.neonText(this, W / 2, signY, 'STUDIO  57', '22px', '#ff00cc', {
      depth: 7, glowLayers: [24, 12, 5], glowAlphas: [0.10, 0.24, 0.55],
    });

    // Flicker animation
    let flickering = false;
    this.time.addEvent({
      delay: Phaser.Math.Between(2500, 5000),
      loop: true,
      callback: () => {
        if (flickering) return;
        flickering = true;
        const flicks = [0, 1, 0, 1, 0.3, 1];
        flicks.forEach((a, i) => {
          this.time.delayedCall(i * 55, () => neon.setAlpha(a));
        });
        this.time.delayedCall(flicks.length * 55 + 80, () => { flickering = false; });
      },
    });

    // Subtitle
    this.add.text(W / 2, H * 0.632, L.menu_sub, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#c8a060',
    }).setOrigin(0.5).setDepth(7);
  }

  // ─── STATS PANEL ─────────────────────────────────────────────────────────────

  drawStats(W, H, L) {
    const panelY = H * 0.685;
    PixelUI.panel(this, W / 2, panelY, W * 0.84, H * 0.095, {
      bgColor: 0x060018, bgAlpha: 0.92, borderColor: 0xffd700, depth: 6,
    });

    // Night number
    this.add.text(W * 0.17, panelY - 16, `${L.night_label}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#888888',
    }).setOrigin(0.5).setDepth(8);
    this.add.text(W * 0.17, panelY + 4, `#${GameState.nightNumber}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(8);

    // Funds
    const funds = GameState.velvetBox + GameState.stash;
    this.add.text(W * 0.50, panelY - 16, L.office_funds || 'FUNDS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#888888',
    }).setOrigin(0.5).setDepth(8);
    this.add.text(W * 0.50, panelY + 4, `$${funds.toLocaleString()}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px', color: '#40ff80',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(8);

    // FBI %
    const fbiPct = Math.round(GameState.fbiSuspicion);
    const fbiCol = fbiPct >= 60 ? '#ff2020' : fbiPct >= 35 ? '#ff8020' : '#ff4444';
    this.add.text(W * 0.84, panelY - 16, 'FBI', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#888888',
    }).setOrigin(0.5).setDepth(8);
    this.add.text(W * 0.84, panelY + 4, `${fbiPct}%`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px', color: fbiCol,
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(8);

    // Reputation
    this.add.text(W * 0.50, panelY + 24, `♦ REP ${GameState.reputation}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#aa66ff',
    }).setOrigin(0.5).setDepth(8);
  }

  // ─── BUTTONS ─────────────────────────────────────────────────────────────────

  drawButtons(W, H, L) {
    // START NIGHT
    const { bg: startBg } = PixelUI.button(this, W / 2, H * 0.81, 220, 48, `▶  ${L.menu_start}`, {
      baseColor: 0x005520, hoverColor: 0x008833, borderColor: 0x44ff88,
      textColor: '#ffffff', fontSize: '9px', depth: 10,
    });
    startBg.on('pointerdown', () => {
      GameState.resetNightStats();
      this.cameras.main.fadeOut(250, 0, 0, 8, (_c, p) => {
        if (p >= 1) this.scene.start('Street');
      });
    });

    // OFFICE
    const { bg: officeBg } = PixelUI.button(this, W / 2, H * 0.888, 180, 36, L.menu_office, {
      baseColor: 0x1a0050, hoverColor: 0x2e0080, borderColor: 0xaa66ff,
      textColor: '#ccaaff', fontSize: '8px', depth: 10,
    });
    officeBg.on('pointerdown', () => this.scene.start('Office'));

    // Language toggle
    this.add.text(W * 0.88, H * 0.03, L.menu_lang, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#777777',
      backgroundColor: '#111111',
      padding: { x: 7, y: 4 },
    }).setOrigin(0.5, 0).setInteractive().setDepth(12)
      .on('pointerdown', () => {
        GameState.lang = GameState.lang === 'ru' ? 'en' : 'ru';
        window.__studio57Lang = GameState.lang;
        SaveSystem.save();
        this.scene.restart();
      });
  }

  // ─── FOOTER ──────────────────────────────────────────────────────────────────

  drawFooter(W, H, L) {
    // Footer with more visible text (#27)
    this.add.text(W / 2, H * 0.963, 'v0.3  ·  VELVET & STASH', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#7755aa',
    }).setOrigin(0.5).setDepth(6);
  }

  // ─── DISCO BALL ──────────────────────────────────────────────────────────────

  animateDiscoBall(W, H) {
    const ballY = H * 0.047;
    const ballContainer = PixelUI.discoBall(this, W / 2, ballY, 16);
    ballContainer.setDepth(12);

    // Rotate the ball slowly
    this.tweens.add({
      targets: ballContainer,
      angle: 360,
      duration: 10000,
      repeat: -1,
      ease: 'Linear',
    });

    // Cast 6 colored light flashes onto city
    const flashColors = [0xff00a0, 0x0088ff, 0xffd700, 0x00ffcc, 0xff6600, 0xaa44ff];
    const flashG = this.add.graphics().setDepth(4);
    let flashIdx = 0;
    this.time.addEvent({
      delay: 320,
      loop: true,
      callback: () => {
        flashG.clear();
        const col = flashColors[flashIdx % flashColors.length];
        const angle = (flashIdx * 47) % 360;
        const rad   = Phaser.Math.DegToRad(angle);
        const len   = H * 0.45;
        const ex = W / 2 + Math.cos(rad) * len;
        const ey = ballY + Math.sin(rad) * len;
        flashG.fillStyle(col, 0.06);
        flashG.fillTriangle(W / 2, ballY, ex - 20, ey, ex + 20, ey);
        flashIdx++;
      },
    });
  }

  // ─── AMBIENT ANIMATIONS ──────────────────────────────────────────────────────

  startAmbientAnimations(W, H) {
    // Random window flicker
    const winG = this.add.graphics().setDepth(3);
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        winG.clear();
        for (let i = 0; i < 3; i++) {
          const row = Phaser.Math.Between(0, 3);
          const col = Phaser.Math.Between(0, 5);
          const wx = W * 0.17 + W * 0.040 + col * W * 0.66 * 0.152;
          const wy = H * 0.07 + H * 0.038 + row * H * 0.064;
          const winCols = [0xffd060, 0x80d8ff, 0x88ff70, 0xff8844];
          winG.fillStyle(Math.random() > 0.3 ? winCols[Math.floor(Math.random() * winCols.length)] : 0x040010, Math.random() * 0.6 + 0.4);
          winG.fillRect(wx, wy, W * 0.048, H * 0.038);
        }
      },
    });

    // Neon rain — subtle falling colored dots (#23)
    const rainColors = [0xff00cc, 0x00aaff, 0xffd700, 0x00ffcc, 0xff5500];
    const spawnRainDrop = () => {
      const rx = Phaser.Math.Between(0, W);
      const rg = this.add.graphics().setDepth(5).setAlpha(0);
      const col = rainColors[Math.floor(Math.random() * rainColors.length)];
      rg.fillStyle(col, 0.7);
      rg.fillRect(0, 0, 1, Phaser.Math.Between(4, 9));
      rg.x = rx; rg.y = H * 0.05;
      this.tweens.add({
        targets: rg, y: H * 0.40, alpha: { from: 0.55, to: 0 },
        duration: Phaser.Math.Between(1400, 2800),
        onComplete: () => rg.destroy(),
      });
    };
    this.time.addEvent({
      delay: 280, loop: true,
      callback: () => { if (Math.random() > 0.55) spawnRainDrop(); },
    });

    // Shooting star (#19) — fires occasionally across the sky
    const shootingStar = () => {
      const sx = Phaser.Math.Between(0, W * 0.6);
      const sy = Phaser.Math.Between(0, H * 0.20);
      const sg = this.add.graphics().setDepth(2);
      sg.lineStyle(1, 0xffffff, 0.9);
      sg.strokeLineShape(new Phaser.Geom.Line(sx, sy, sx + 24, sy + 12));
      sg.lineStyle(1, 0xffd700, 0.35);
      sg.strokeLineShape(new Phaser.Geom.Line(sx - 6, sy - 3, sx + 24, sy + 12));
      this.tweens.add({
        targets: sg, x: W * 0.55, y: H * 0.15, alpha: 0,
        duration: 700, ease: 'Quad.Out',
        onComplete: () => sg.destroy(),
      });
      this.time.delayedCall(Phaser.Math.Between(6000, 14000), shootingStar);
    };
    this.time.delayedCall(Phaser.Math.Between(2000, 5000), shootingStar);

    // Camera fade-in
    this.cameras.main.fadeIn(500, 2, 0, 8);
  }
}
