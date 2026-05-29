import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { LOCALES } from '../data/locales.js';
import { AudioSystem } from '../systems/AudioSystem.js';

const DARK = 0x18103C;
const GOLD = 0xffd700;

// Zone ids for event display
const ZONE = { DANCE: 'dance', VIP: 'vip', BAR: 'bar', BATHROOM: 'bathroom', ENTRANCE: 'entrance' };

export class ClubScene extends Phaser.Scene {
  constructor() { super({ key: 'Club' }); }

  create() {
    const { width: W, height: H } = this.scale;
    const L = LOCALES[GameState.lang];
    this.W = W; this.H = H;
    this.beat = 0;
    this.activeAlerts = {};  // zone → alert object

    this.add.rectangle(0, 0, W, H, DARK).setOrigin(0);

    this.buildCeiling(W, H);
    this.buildDanceFloor(W, H);
    this.buildVIPZone(W, H);
    this.buildBar(W, H);
    this.buildBathroomDoor(W, H);
    this.buildEntrance(W, H);
    this.buildGuestDots(W, H);
    this.buildDiscoBall(W, H);
    this.buildHUD(W, H, L);
    this.buildNav(W, H, L);
    this.buildScanlines(W, H);

    // Beat pulse — 120 BPM = 500ms
    this.beatTimer = this.time.addEvent({
      delay: 500, callback: this.onBeat, callbackScope: this, loop: true,
    });

    // Check for new events every 1.5s
    this.eventCheckTimer = this.time.addEvent({
      delay: 1500, callback: this.syncEvents, callbackScope: this, loop: true,
    });

    // Persist last known stats to detect changes
    this._lastFights = GameState.nightStats.fights;
    this._lastCelebs = GameState.nightStats.celebsHosted.length;
    this._lastFBI    = GameState.fbiSuspicion;
  }

  // ─── CEILING ────────────────────────────────────────────────────────────────

  buildCeiling(W, H) {
    const g = this.add.graphics();
    g.fillStyle(0x0E0828);
    g.fillRect(0, 0, W, H * 0.15);

    // Rig bars
    g.fillStyle(0x2A1A00);
    g.fillRect(W * 0.05, 2, W * 0.90, 8);
    g.lineStyle(1, 0x554420, 0.6);
    g.strokeRect(W * 0.05, 2, W * 0.90, 8);

    // Spotlight cones (brighter)
    const spots = [
      { x: W * 0.15, color: 0xFF0088, alpha: 0.16 },
      { x: W * 0.35, color: 0x0088FF, alpha: 0.16 },
      { x: W * 0.65, color: 0x00FFCC, alpha: 0.16 },
      { x: W * 0.85, color: 0xFF8800, alpha: 0.16 },
    ];
    spots.forEach(s => {
      g.fillStyle(s.color, s.alpha);
      g.fillTriangle(s.x, 10, s.x - 40, H * 0.55, s.x + 40, H * 0.55);
    });

    // Save spots for beat animation
    this.spotlightG = this.add.graphics();
    this.spotColors = spots;
  }

  // ─── DANCE FLOOR ────────────────────────────────────────────────────────────

  buildDanceFloor(W, H) {
    const g = this.add.graphics();
    const floorY = H * 0.15;
    const floorH = H * 0.40;

    // Checkerboard floor
    const tW = Math.ceil(W / 10);
    const tH = Math.ceil(floorH / 8);
    for (let c = 0; c < 10; c++) {
      for (let r = 0; r < 8; r++) {
        const even = (c + r) % 2 === 0;
        g.fillStyle(even ? 0x2A1858 : 0x0E0828);
        g.fillRect(c * tW, floorY + r * tH, tW, tH);
      }
    }

    // Floor glow blobs
    const blobs = [
      { x: W * 0.20, y: floorY + floorH * 0.5, c: 0xFF0088, r: 40 },
      { x: W * 0.50, y: floorY + floorH * 0.4, c: 0x0088FF, r: 52 },
      { x: W * 0.80, y: floorY + floorH * 0.5, c: 0x00FFCC, r: 40 },
    ];
    blobs.forEach(b => {
      g.fillStyle(b.c, 0.16);
      g.fillCircle(b.x, b.y, b.r);
    });

    // Dance zone tap area
    const danceZone = this.add.rectangle(W / 2, floorY + floorH / 2, W, floorH, 0x000000, 0)
      .setInteractive();
    danceZone.on('pointerdown', () => this.onZoneTap(ZONE.DANCE));
  }

  // ─── VIP ZONE ───────────────────────────────────────────────────────────────

  buildVIPZone(W, H) {
    const g = this.add.graphics();
    const vy = H * 0.56;
    const vh = H * 0.12;

    g.fillStyle(0x221058, 0.9);
    g.fillRect(0, vy, W * 0.55, vh);
    g.lineStyle(2, 0xAA55FF);
    g.strokeRect(0, vy, W * 0.55, vh);

    // VIP rope
    g.lineStyle(4, 0xAA0055);
    g.beginPath();
    g.moveTo(0, vy);
    g.lineTo(W * 0.55, vy);
    g.strokePath();

    // Gold posts
    g.fillStyle(GOLD);
    g.fillRect(W * 0.53, vy - 8, 5, 14);
    g.fillCircle(W * 0.555, vy - 8, 5);

    this.add.text(W * 0.14, vy + vh / 2, '✦ VIP ✦', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#9933ff',
    }).setOrigin(0.5);

    // VIP glow (pulsing)
    this.vipGlow = this.add.rectangle(W * 0.275, vy + vh / 2, W * 0.55, vh, 0x6600ff, 0.04);
    this.tweens.add({
      targets: this.vipGlow, alpha: { from: 0.02, to: 0.09 },
      duration: 1200, yoyo: true, repeat: -1,
    });

    // VIP tap zone
    const vipZone = this.add.rectangle(W * 0.275, vy + vh / 2, W * 0.55, vh, 0, 0).setInteractive();
    vipZone.on('pointerdown', () => this.onZoneTap(ZONE.VIP));

    this.vipY = vy; this.vipH = vh;
  }

  // ─── BAR ────────────────────────────────────────────────────────────────────

  buildBar(W, H) {
    const g = this.add.graphics();
    const bx = W * 0.58;
    const by = H * 0.56;
    const bw = W * 0.42;
    const bh = H * 0.12;

    g.fillStyle(0x3A1010, 0.9);
    g.fillRect(bx, by, bw, bh);
    g.lineStyle(2, 0xFF6633);
    g.strokeRect(bx, by, bw, bh);

    // Bar counter
    g.fillStyle(0x602000);
    g.fillRect(bx + 4, by + bh - 18, bw - 8, 14);
    g.lineStyle(1, 0xAA5500);
    g.strokeRect(bx + 4, by + bh - 18, bw - 8, 14);

    // Bottles
    const bottleColors = [0xff4400, 0x00aa44, 0x4444ff, 0xffaa00];
    bottleColors.forEach((col, i) => {
      const bix = bx + 12 + i * 22;
      const biy = by + 8;
      g.fillStyle(col, 0.8);
      g.fillRect(bix, biy, 8, 20);
      g.fillRect(bix + 2, biy - 6, 4, 7);
      g.fillStyle(0xffffff, 0.2);
      g.fillRect(bix + 1, biy + 2, 2, 8);
    });

    this.add.text(bx + bw / 2, by + bh / 2 - 6, '🍸 BAR', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ff6633',
    }).setOrigin(0.5);

    // Bar income counter (updates each second)
    this.barIncomeTxt = this.add.text(bx + bw / 2, by + bh / 2 + 10, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#40ff80',
    }).setOrigin(0.5);

    // Bar tap zone
    const barZone = this.add.rectangle(bx + bw / 2, by + bh / 2, bw, bh, 0, 0).setInteractive();
    barZone.on('pointerdown', () => this.onZoneTap(ZONE.BAR));

    this.barZoneX = bx + bw / 2;
    this.barZoneY = by + bh / 2;
  }

  // ─── BATHROOM DOOR ──────────────────────────────────────────────────────────

  buildBathroomDoor(W, H) {
    const g = this.add.graphics();
    const dx = W * 0.02;
    const dy = H * 0.71;
    const dw = W * 0.28;
    const dh = H * 0.13;

    g.fillStyle(0x160830);
    g.fillRect(dx, dy, dw, dh);
    g.lineStyle(2, 0x6600AA);
    g.strokeRect(dx, dy, dw, dh);

    // Door handle
    g.fillStyle(0x886600);
    g.fillCircle(dx + dw - 10, dy + dh / 2, 4);

    // Neon sign "RESTROOM"
    this.add.text(dx + dw / 2, dy + 14, '🚻', {
      fontSize: '16px',
    }).setOrigin(0.5);

    const cv = GameState.contentVersion;
    const isAdult = cv === 'adult' || cv === 'max';
    const label = isAdult ? '💊 RESTROOM' : 'RESTROOM';

    this.add.text(dx + dw / 2, dy + dh - 18, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#aa44ff',
    }).setOrigin(0.5);

    // Pulsing doorframe glow
    this.bathroomGlow = this.add.rectangle(dx + dw / 2, dy + dh / 2, dw, dh, 0x440088, 0.04);
    this.tweens.add({
      targets: this.bathroomGlow, alpha: { from: 0.02, to: 0.10 },
      duration: 900, yoyo: true, repeat: -1,
    });

    // Tap zone
    const bathZone = this.add.rectangle(dx + dw / 2, dy + dh / 2, dw, dh, 0, 0).setInteractive();
    bathZone.on('pointerdown', () => this.onZoneTap(ZONE.BATHROOM));

    this.bathX = dx + dw / 2; this.bathY = dy + dh / 2;
  }

  // ─── ENTRANCE ───────────────────────────────────────────────────────────────

  buildEntrance(W, H) {
    const g = this.add.graphics();
    const ex = W * 0.33;
    const ey = H * 0.71;
    const ew = W * 0.65;
    const eh = H * 0.13;

    g.fillStyle(0x08000a);
    g.fillRect(ex, ey, ew, eh);
    g.lineStyle(2, GOLD);
    g.strokeRect(ex, ey, ew, eh);

    // Door shape
    g.fillStyle(0x1a0030);
    g.fillRect(ex + ew * 0.3, ey + 4, ew * 0.4, eh - 8);
    g.lineStyle(1, 0x664400);
    g.strokeRect(ex + ew * 0.3, ey + 4, ew * 0.4, eh - 8);

    this.add.text(ex + ew / 2, ey + eh / 2, '🚪 ENTRANCE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#c8a060',
    }).setOrigin(0.5);

    this.entrX = ex + ew / 2; this.entrY = ey + eh / 2;
  }

  // ─── GUEST DOTS (pulsing on dance floor) ────────────────────────────────────

  buildGuestDots(W, H) {
    this.guestDots = [];
    const floorY = H * 0.15;
    const floorH = H * 0.38;

    const dotColors = [
      0xff66aa, 0x66aaff, 0xffcc00, 0x44ffcc,
      0xff8844, 0xcc44ff, 0xffffff, 0x00ff88,
    ];

    for (let i = 0; i < 24; i++) {
      const x = W * 0.06 + Math.random() * W * 0.88;
      const y = floorY + H * 0.04 + Math.random() * (floorH - H * 0.06);
      const col = dotColors[i % dotColors.length];
      const dot = this.add.graphics();
      dot.fillStyle(col, 0.92);
      dot.fillCircle(0, 0, 4 + Math.random() * 3);
      dot.setPosition(x, y);

      // Idle sway tween
      this.tweens.add({
        targets: dot,
        x: x + Phaser.Math.Between(-8, 8),
        y: y + Phaser.Math.Between(-6, 6),
        duration: 800 + Math.random() * 600,
        yoyo: true, repeat: -1,
        ease: 'Sine.InOut',
        delay: Math.random() * 400,
      });

      this.guestDots.push({ dot, baseX: x, baseY: y, col });
    }
  }

  // ─── DISCO BALL ─────────────────────────────────────────────────────────────

  buildDiscoBall(W, H) {
    const bx = W * 0.5;
    const by = H * 0.06;

    const ballG = this.add.graphics();
    ballG.fillStyle(0xdddddd);
    ballG.fillCircle(bx, by, 14);

    // Mirror tiles
    const tileColors = [0xffffff, 0xaaddff, 0xffeeaa, 0xaaffcc];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 6; col++) {
        const tx = bx - 12 + col * 5;
        const ty = by - 12 + row * 5;
        ballG.fillStyle(tileColors[(row + col) % tileColors.length], 0.7);
        ballG.fillRect(tx, ty, 4, 4);
      }
    }

    // Thin cord
    const cordG = this.add.graphics();
    cordG.lineStyle(1, 0x666666);
    cordG.beginPath(); cordG.moveTo(bx, 0); cordG.lineTo(bx, by - 14); cordG.strokePath();

    // Slow rotation
    this.tweens.add({
      targets: ballG, angle: 360,
      duration: 8000, repeat: -1, ease: 'Linear',
    });

    // Floor light spots
    this.floorSpots = [];
    const spotCols = [0xff0055, 0x0055ff, 0x00ffaa, 0xffaa00];
    for (let i = 0; i < 4; i++) {
      const sg = this.add.graphics();
      const sx = W * 0.15 + i * W * 0.22;
      const sy = H * 0.50 + Math.random() * H * 0.05;
      sg.fillStyle(spotCols[i], 0.22);
      sg.fillCircle(sx, sy, 24);
      this.floorSpots.push(sg);
      this.tweens.add({
        targets: sg, alpha: { from: 0.05, to: 0.20 },
        duration: 700 + i * 200, yoyo: true, repeat: -1, delay: i * 180,
      });
    }
  }

  // ─── HUD STRIP ──────────────────────────────────────────────────────────────

  buildHUD(W, H, L) {
    this.add.rectangle(0, 0, W, 44, 0x0A0820, 0.92).setOrigin(0).setDepth(50);

    this.add.text(8, 6, `${L.night_label} ${GameState.nightNumber}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ffd700',
    }).setDepth(51);

    this.velvetTxt = this.add.text(8, 24, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#40ff80',
    }).setDepth(51);

    this.stashTxt = this.add.text(W * 0.38, 24, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#ff8800',
    }).setDepth(51);

    // FBI indicator
    this.fbiBadge = this.add.text(W - 8, 6, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ff4040',
    }).setOrigin(1, 0).setDepth(51);

    this.repTxt = this.add.text(W - 8, 24, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#aa88ff',
    }).setOrigin(1, 0).setDepth(51);

    this.updateHUD();
  }

  updateHUD() {
    const L = LOCALES[GameState.lang];
    const nightScene = this.scene.get('Night');
    const vb = nightScene?.velvetBox ?? 0;
    this.velvetTxt.setText(`💰 $${Math.max(0, vb)}`);
    this.stashTxt.setText(`🔒 $${GameState.stash}`);
    this.fbiBadge.setText(`FBI ${Math.round(GameState.fbiSuspicion)}%`);
    const fbiPct = GameState.fbiSuspicion / 100;
    this.fbiBadge.setColor(fbiPct > 0.6 ? '#ff0000' : fbiPct > 0.35 ? '#ff8800' : '#ff4040');
    this.repTxt.setText(`★ REP ${Math.round(GameState.reputation)}`);
  }

  // ─── BOTTOM NAV ─────────────────────────────────────────────────────────────

  buildNav(W, H, L) {
    const navY = H * 0.87;

    // DOOR button — back to face control
    const doorBg = this.add.rectangle(W * 0.27, navY, W * 0.40, 40, 0x1a0040)
      .setStrokeStyle(2, GOLD).setInteractive().setDepth(50);
    const doorTxt = this.add.text(W * 0.27, navY, '◀ DOOR', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(51);
    doorBg.on('pointerover',  () => doorBg.setFillStyle(0x2a0060));
    doorBg.on('pointerout',   () => doorBg.setFillStyle(0x1a0040));
    doorBg.on('pointerdown',  () => this.goToDoor());
    doorTxt.setInteractive(); doorTxt.on('pointerdown', () => this.goToDoor());

    // HIDE CASH button
    const hideBg = this.add.rectangle(W * 0.73, navY, W * 0.40, 40, 0x332200)
      .setStrokeStyle(2, GOLD).setInteractive().setDepth(50);
    const hideTxt = this.add.text(W * 0.73, navY, `💰 HIDE`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(51);
    hideBg.on('pointerover',  () => hideBg.setFillStyle(0x553300));
    hideBg.on('pointerout',   () => hideBg.setFillStyle(0x332200));
    hideBg.on('pointerdown',  () => this.quickHide());
    hideTxt.setInteractive(); hideTxt.on('pointerdown', () => this.quickHide());

    // Guest/fight stats bar
    this.statsBar = this.add.text(W / 2, H * 0.95, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#666666', align: 'center',
    }).setOrigin(0.5).setDepth(51);
  }

  // ─── SCANLINES ──────────────────────────────────────────────────────────────

  buildScanlines(W, H) {
    const g = this.add.graphics().setDepth(200).setAlpha(1);
    g.fillStyle(0x000000, 0.04);
    for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
  }

  // ─── BEAT ANIMATION ─────────────────────────────────────────────────────────

  onBeat() {
    this.beat++;
    this.updateHUD();

    const hype = GameState.reputation / 100;

    // Pulse random subset of guest dots
    const count = Math.floor(4 + hype * 10);
    Phaser.Utils.Array.Shuffle(this.guestDots).slice(0, count).forEach(d => {
      this.tweens.add({
        targets: d.dot, scaleX: 1.35, scaleY: 1.35,
        duration: 120, yoyo: true, ease: 'Quad.Out',
      });
    });

    // Spotlight flicker on beat 1 of every 4
    if (this.beat % 4 === 0) {
      this.spotlightG.clear();
      const col = this.spotColors[Math.floor(Math.random() * this.spotColors.length)];
      this.spotlightG.fillStyle(col.color, 0.12);
      this.spotlightG.fillTriangle(
        col.x, 10,
        col.x - 50, this.H * 0.55,
        col.x + 50, this.H * 0.55
      );
      this.time.delayedCall(200, () => this.spotlightG.clear());
    }

    // Update stats bar
    const ns = GameState.nightStats;
    this.statsBar.setText(
      `✓ ${ns.approved}  ✗ ${ns.rejected}  ⚡ ${ns.fights}  ★ ${ns.celebsHosted.length}`
    );
    if (this.barIncomeTxt) {
      const barLevel = Math.max(1, GameState.upgrades.bar + 1);
      this.barIncomeTxt.setText(`+$${25 * barLevel}/5s`);
    }
  }

  // ─── EVENT SYNC ─────────────────────────────────────────────────────────────

  syncEvents() {
    const ns  = GameState.nightStats;

    // New fight?
    if (ns.fights > this._lastFights) {
      this._lastFights = ns.fights;
      this.showZoneAlert(ZONE.DANCE, '⚡ FIGHT!', 0xff4400, 3000);
    }

    // New celeb?
    if (ns.celebsHosted.length > this._lastCelebs) {
      this._lastCelebs = ns.celebsHosted.length;
      this.showZoneAlert(ZONE.VIP, '★ VIP IN!', 0xffd700, 3500);
    }

    // FBI spike?
    if (GameState.fbiSuspicion > this._lastFBI + 10) {
      this._lastFBI = GameState.fbiSuspicion;
      this.showZoneAlert(ZONE.ENTRANCE, '🔦 FBI!', 0xff0000, 2500);
    }
    this._lastFBI = GameState.fbiSuspicion;
  }

  showZoneAlert(zone, msg, color, dur) {
    // Zone anchor positions
    const anchors = {
      [ZONE.DANCE]:    { x: this.W * 0.5,  y: this.H * 0.35 },
      [ZONE.VIP]:      { x: this.W * 0.2,  y: this.vipY + this.vipH / 2 },
      [ZONE.BAR]:      { x: this.barZoneX, y: this.barZoneY },
      [ZONE.BATHROOM]: { x: this.bathX,    y: this.bathY },
      [ZONE.ENTRANCE]: { x: this.entrX,    y: this.entrY },
    };
    const pos = anchors[zone] || { x: this.W / 2, y: this.H / 2 };

    // Destroy previous alert for this zone
    if (this.activeAlerts[zone]) {
      this.activeAlerts[zone].forEach(o => o.destroy());
    }

    const bg = this.add.rectangle(pos.x, pos.y - 16, 100, 26, 0x000000, 0.82)
      .setStrokeStyle(2, color).setDepth(80);
    const txt = this.add.text(pos.x, pos.y - 16, msg, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: Phaser.Display.Color.IntegerToColor(color).rgba,
    }).setOrigin(0.5).setDepth(81);

    // Pulse animation
    this.tweens.add({
      targets: [bg, txt], scaleX: 1.08, scaleY: 1.08,
      duration: 300, yoyo: true, repeat: 3, ease: 'Quad.InOut',
    });

    this.activeAlerts[zone] = [bg, txt];
    this.time.delayedCall(dur, () => {
      bg.destroy(); txt.destroy();
      delete this.activeAlerts[zone];
    });
  }

  // ─── ZONE TAP HANDLERS ──────────────────────────────────────────────────────

  onZoneTap(zone) {
    const ns = GameState.nightStats;
    let info = '';

    if (zone === ZONE.DANCE) {
      info = `${ns.approved} GUESTS IN\n${ns.fights} FIGHTS\nHYPE ${Math.round(GameState.reputation)}`;
    } else if (zone === ZONE.VIP) {
      const celebs = ns.celebsHosted.length;
      info = celebs > 0
        ? `${celebs} VIP TONIGHT\n★ ZONE ACTIVE`
        : 'VIP ZONE EMPTY\nWait for stars...';
    } else if (zone === ZONE.BAR) {
      const barLevel = Math.max(1, GameState.upgrades.bar + 1);
      info = `BAR LVL ${barLevel}\n$${25 * barLevel} / 5 SEC`;
    } else if (zone === ZONE.BATHROOM) {
      // Navigate to bathroom scene
      this.scene.pause('Club');
      this.scene.launch('Bathroom');
      return;
    } else if (zone === ZONE.ENTRANCE) {
      info = `FBI: ${Math.round(GameState.fbiSuspicion)}%\nPOLICE: ${Math.round(GameState.policeHeat)}%`;
    }

    this.showInfoPopup(info);
  }

  showInfoPopup(text) {
    if (this._infoPopup) {
      this._infoPopup.forEach(o => o.destroy());
    }
    const bg = this.add.rectangle(this.W / 2, this.H * 0.82, this.W * 0.72, 52, 0x000000, 0.90)
      .setStrokeStyle(2, GOLD).setDepth(90);
    const txt = this.add.text(this.W / 2, this.H * 0.82, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ffffff', align: 'center', lineSpacing: 6,
    }).setOrigin(0.5).setDepth(91);
    this._infoPopup = [bg, txt];
    this.time.delayedCall(2200, () => {
      if (this._infoPopup) { this._infoPopup.forEach(o => o.destroy()); this._infoPopup = null; }
    });
  }

  // ─── ACTIONS ────────────────────────────────────────────────────────────────

  goToDoor() {
    // Resume NightScene and put Club to sleep
    this.scene.sleep('Club');
    this.scene.resume('Night');
  }

  quickHide() {
    // Delegate to NightScene's hideMoney()
    const night = this.scene.get('Night');
    if (night && night.hideMoney) {
      night.hideMoney();
      this.updateHUD();
    }
  }

  shutdown() {
    this.beatTimer?.remove();
    this.eventCheckTimer?.remove();
  }
}
