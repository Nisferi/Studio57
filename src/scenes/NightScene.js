import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { SaveSystem } from '../SaveSystem.js';
import { LOCALES } from '../data/locales.js';
import { generateGuest, STYLE, INTOX, SKIN_PALETTES, HAIR_COLORS } from '../data/guests.js';
import { CELEBRITIES } from '../data/celebrities.js';
import { NIGHT_EVENTS } from '../data/events.js';
import { AudioSystem } from '../systems/AudioSystem.js';

const DARK    = 0x020008;
const GOLD    = 0xffd700;
const CREAM   = 0xf5e6c8;
const GREEN   = 0x00aa44;
const RED     = 0xaa0022;

const NIGHT_DURATION = 55; // seconds per night
const GUEST_INTERVAL_MIN = 3200;
const GUEST_INTERVAL_MAX = 5000;
const BAR_TICK_MS = 5000;

export class NightScene extends Phaser.Scene {
  constructor() { super({ key: 'Night' }); }

  init() {
    this.velvetBox        = 0;
    this.fines            = 0;
    this.timeLeft         = NIGHT_DURATION;
    this.guestQueue       = [];
    this.currentGuest     = null;
    this.deciding         = false;
    this.barMultiplier    = 1 + (GameState.upgrades.bar * 0.5);
    this.fightChance      = Math.max(0.05, 0.5 - GameState.upgrades.security * 0.15);
    this.slyInClub        = false;  // Sly Steel: no fights
    this.barBoost         = 1;      // Lisa Monelli / Mini Michael
    this.ticketMultiplier = 1;      // Donald Trumpet: 3× tickets
    this.celebTimers      = [];     // periodic celeb effect timers
    this.nightEvents      = [];
    this.eventPending     = false;
    this.tutorialStep     = 0;
    this.raidInProgress   = false;
  }

  create() {
    const { width: W, height: H } = this.scale;
    const L = LOCALES[GameState.lang];

    this.W = W; this.H = H;

    this.buildBackground(W, H);
    this.buildHUD(W, H, L);
    this.buildGuestCard(W, H, L);
    this.buildButtons(W, H, L);
    this.buildVelvetRope(W, H);

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-A', () => this.decide(true));
    this.input.keyboard.on('keydown-D', () => this.decide(false));
    this.input.keyboard.on('keydown-H', () => this.hideMoney());

    // Resume audio (user gesture just happened)
    AudioSystem.resume();
    AudioSystem.startDiscoLoop();

    // Timers
    this.clockEvent = this.time.addEvent({ delay: 1000, callback: this.onTick, callbackScope: this, loop: true });
    this.barEvent   = this.time.addEvent({ delay: BAR_TICK_MS, callback: this.onBarTick, callbackScope: this, loop: true });
    this.scheduleNextGuest();

    // Tutorial overlay for first night
    if (GameState.nightNumber === 1 && !GameState.flags.tutorialDone) {
      this.buildTutorial(W, H);
    }

    // Schedule recurring character appearances
    this.scheduleCollinsAppearance(L);
  }

  // ─── BACKGROUND ────────────────────────────────────────────────────────────

  buildBackground(W, H) {
    const g = this.add.graphics();

    // ── CEILING (top third of screen) ──────────────────────────────────────────
    // Dark club ceiling base
    g.fillStyle(0x03000a);
    g.fillRect(0, 0, W, H * 0.28);

    // Ceiling spotlight frames (left and right rigs)
    const rigPositions = [W * 0.08, W * 0.22, W * 0.78, W * 0.92];
    rigPositions.forEach(rx => {
      g.fillStyle(0x221100);
      g.fillRect(rx - 10, 2, 20, 14);
      g.lineStyle(1, 0x443300);
      g.strokeRect(rx - 10, 2, 20, 14);
      // Cable to spotlight
      g.lineStyle(1, 0x332200);
      g.beginPath();
      g.moveTo(rx, 0);
      g.lineTo(rx, 16);
      g.strokePath();
    });

    // Cables between rigs (horizontal wires across ceiling)
    g.lineStyle(1, 0x1a0800);
    g.beginPath();
    g.moveTo(W * 0.08, 10); g.lineTo(W * 0.92, 10);
    g.strokePath();
    g.beginPath();
    g.moveTo(W * 0.22, 8); g.lineTo(W * 0.78, 8);
    g.strokePath();

    // ── WALLS (middle section H*0.28 – H*0.62) ─────────────────────────────────
    // Main wall background
    g.fillStyle(0x08001a);
    g.fillRect(0, H * 0.28, W, H * 0.34);

    // Left decorative panel — vertical alternating stripes
    const panelColors = [0x0d0025, 0x12002e, 0x08001a, 0x150035];
    for (let i = 0; i < 8; i++) {
      g.fillStyle(panelColors[i % panelColors.length]);
      g.fillRect(i * W * 0.04, H * 0.28, W * 0.04, H * 0.34);
    }
    // Right decorative panel
    for (let i = 0; i < 8; i++) {
      g.fillStyle(panelColors[i % panelColors.length]);
      g.fillRect(W - (i + 1) * W * 0.04, H * 0.28, W * 0.04, H * 0.34);
    }

    // Center back wall (slightly lighter)
    g.fillStyle(0x0d0030);
    g.fillRect(W * 0.32, H * 0.28, W * 0.36, H * 0.34);

    // Stage / podium in the center of the back wall
    g.fillStyle(0x180040);
    g.fillRect(W * 0.38, H * 0.42, W * 0.24, H * 0.08);
    g.lineStyle(1, 0x6600aa);
    g.strokeRect(W * 0.38, H * 0.42, W * 0.24, H * 0.08);
    // Stage lip (front edge highlight)
    g.lineStyle(2, 0x9900ff);
    g.beginPath();
    g.moveTo(W * 0.38, H * 0.50);
    g.lineTo(W * 0.62, H * 0.50);
    g.strokePath();

    // Disco star decorations on side walls (small diamonds)
    const starXL = [W * 0.06, W * 0.14, W * 0.09, W * 0.18];
    const starXR = [W * 0.82, W * 0.91, W * 0.86, W * 0.95];
    const starY  = [H * 0.31, H * 0.37, H * 0.44, H * 0.51];
    const starColors = [0xff00ff, 0x00ffff, 0xffff00, 0xff8800];
    starXL.forEach((sx, i) => {
      g.fillStyle(starColors[i], 0.55);
      const r = 4;
      g.fillTriangle(sx, starY[i] - r, sx - r, starY[i] + r, sx + r, starY[i] + r);
      g.fillTriangle(sx, starY[i] + r, sx - r, starY[i] - r, sx + r, starY[i] - r);
    });
    starXR.forEach((sx, i) => {
      g.fillStyle(starColors[(i + 2) % starColors.length], 0.55);
      const r = 4;
      g.fillTriangle(sx, starY[i] - r, sx - r, starY[i] + r, sx + r, starY[i] + r);
      g.fillTriangle(sx, starY[i] + r, sx - r, starY[i] - r, sx + r, starY[i] - r);
    });

    // Ambient wall glow — tinted gradient at the base of the walls
    g.fillGradientStyle(0x000000, 0x000000, 0x1a0040, 0x1a0040, 0);
    g.fillRect(0, H * 0.50, W * 0.30, H * 0.12);
    g.fillGradientStyle(0x000000, 0x000000, 0x1a0040, 0x1a0040, 0);
    g.fillRect(W * 0.70, H * 0.50, W * 0.30, H * 0.12);

    // Silhouettes of background dancers (5 figures)
    const dancerX = [W * 0.10, W * 0.22, W * 0.50, W * 0.76, W * 0.88];
    dancerX.forEach((dx, i) => {
      const dy = H * 0.54;
      g.fillStyle(0x000000, 0.65);
      // Head
      g.fillCircle(dx, dy - 22, 6);
      // Body
      g.fillRect(dx - 5, dy - 16, 10, 16);
      // Arms (alternating raised/lowered for pose variety)
      if (i % 2 === 0) {
        g.fillRect(dx - 12, dy - 22, 7, 4);
        g.fillRect(dx + 5,  dy - 14, 7, 4);
      } else {
        g.fillRect(dx - 12, dy - 14, 7, 4);
        g.fillRect(dx + 5,  dy - 22, 7, 4);
      }
    });

    // ── ENTRY ARCH ──────────────────────────────────────────────────────────────
    g.fillStyle(0x020008);
    g.fillRect(W * 0.33, H * 0.35, W * 0.34, H * 0.27);
    g.lineStyle(3, 0xffd700);
    g.strokeRect(W * 0.33, H * 0.35, W * 0.34, H * 0.27);

    // ── DANCE FLOOR (H*0.62 – H*0.75) ──────────────────────────────────────────
    // Checkerboard tiles
    const tileW = Math.ceil(W / 12);
    const tileH = Math.ceil(H * 0.13 / 8);
    for (let col = 0; col < 12; col++) {
      for (let row = 0; row < 8; row++) {
        const even = (col + row) % 2 === 0;
        g.fillStyle(even ? 0x1a0030 : 0x000010);
        g.fillRect(col * tileW, H * 0.62 + row * tileH, tileW, tileH);
      }
    }

    // Colored light blobs on dance floor
    const blobData = [
      { x: W * 0.18, y: H * 0.67, r: 28, color: 0xff00ff },
      { x: W * 0.45, y: H * 0.70, r: 22, color: 0x0066ff },
      { x: W * 0.72, y: H * 0.66, r: 30, color: 0xffcc00 },
      { x: W * 0.88, y: H * 0.71, r: 18, color: 0x00ffcc },
    ];
    blobData.forEach(({ x, y, r, color }) => {
      g.fillStyle(color, 0.15);
      g.fillCircle(x, y, r);
    });

    // Front edge of dance floor — shiny border strip
    g.fillStyle(0x440066);
    g.fillRect(0, H * 0.745, W, 4);
    g.lineStyle(1, 0xcc44ff);
    g.beginPath();
    g.moveTo(0, H * 0.745);
    g.lineTo(W, H * 0.745);
    g.strokePath();

    // ── FLOOR BELOW DANCE FLOOR ─────────────────────────────────────────────────
    g.fillStyle(0x050005);
    g.fillRect(0, H * 0.75, W, H * 0.25);

    // ── NEON SIGN ───────────────────────────────────────────────────────────────
    this.drawNeonSign(W / 2, H * 0.13);

    // ── DISCO BALL ──────────────────────────────────────────────────────────────
    this.buildDiscoBall(W, H);
  }

  buildDiscoBall(W, H) {
    const cx = W / 2;
    const ballY = H * 0.08;
    const ballR = 22;

    // Suspension wire from ceiling top
    const wire = this.add.graphics();
    wire.lineStyle(1, 0x888888, 0.8);
    wire.beginPath();
    wire.moveTo(cx, 0);
    wire.lineTo(cx, ballY - ballR);
    wire.strokePath();

    // Disco ball container (so we can tween-rotate child graphics)
    const ballContainer = this.add.container(cx, ballY);

    const ballG = this.add.graphics();
    // Metallic base circle
    ballG.fillStyle(0x888888, 1);
    ballG.fillCircle(0, 0, ballR);
    // Highlight sheen
    ballG.fillStyle(0xdddddd, 0.5);
    ballG.fillCircle(-ballR * 0.3, -ballR * 0.3, ballR * 0.35);

    // Mirror tile mosaic — grid of small rectangles clipped to circle shape
    const tileSize = 4;
    const tileColors = [0xffffff, 0xcccccc, 0xffd700, 0xaaaaaa, 0xffffff, 0x88ccff, 0xffffff, 0xffccaa];
    for (let ty = -ballR + 2; ty < ballR - 2; ty += tileSize + 1) {
      for (let tx = -ballR + 2; tx < ballR - 2; tx += tileSize + 1) {
        if (tx * tx + ty * ty < (ballR - 2) * (ballR - 2)) {
          const col = tileColors[Math.floor(Math.random() * tileColors.length)];
          ballG.fillStyle(col, Math.random() * 0.5 + 0.5);
          ballG.fillRect(tx, ty, tileSize, tileSize);
        }
      }
    }

    // Thin outline
    ballG.lineStyle(1, 0xaaaaaa, 0.7);
    ballG.strokeCircle(0, 0, ballR);

    ballContainer.add(ballG);

    // Slow rotation tween on the container
    this.tweens.add({
      targets: ballContainer,
      angle: 360,
      duration: 8000,
      repeat: -1,
      ease: 'Linear',
    });

    // Light rays from the disco ball (static graphics behind the container)
    const rayG = this.add.graphics();
    const rayAngles = [-70, -30, 20, 60, 110, 150];
    const rayLength = H * 0.55;
    rayAngles.forEach(angleDeg => {
      const rad = Phaser.Math.DegToRad(angleDeg);
      const ex = cx + Math.cos(rad) * rayLength;
      const ey = ballY + Math.sin(rad) * rayLength;
      const spreadR = 18;
      const perpX = -Math.sin(rad) * spreadR;
      const perpY =  Math.cos(rad) * spreadR;
      rayG.fillStyle(0xffffff, 0.04);
      rayG.fillTriangle(
        cx + Math.cos(rad) * ballR,
        ballY + Math.sin(rad) * ballR,
        ex + perpX, ey + perpY,
        ex - perpX, ey - perpY
      );
    });

    // Move rays behind the ball
    rayG.setDepth(-1);
    ballContainer.setDepth(1);
    wire.setDepth(0);

    // ── ANIMATED FLOOR SPOTS ────────────────────────────────────────────────────
    const spotData = [
      { x: W * 0.20, y: H * 0.68, color: 0xff00ff, r: 14 },
      { x: W * 0.50, y: H * 0.71, color: 0x00ccff, r: 12 },
      { x: W * 0.80, y: H * 0.67, color: 0xffdd00, r: 16 },
      { x: W * 0.35, y: H * 0.70, color: 0x00ff88, r: 10 },
    ];
    spotData.forEach((sd, idx) => {
      const spotG = this.add.graphics();
      spotG.fillStyle(sd.color, 0.25);
      spotG.fillCircle(0, 0, sd.r);
      spotG.x = sd.x;
      spotG.y = sd.y;

      // Each spot drifts in a small elliptical path
      const orbitRX = 30 + idx * 12;
      const orbitRY = 10;
      const startAngle = (idx / spotData.length) * Math.PI * 2;
      const duration = 4000 + idx * 800;
      this.tweens.add({
        targets: spotG,
        x: { from: sd.x - orbitRX, to: sd.x + orbitRX },
        duration: duration,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut',
        delay: idx * 600,
      });
      this.tweens.add({
        targets: spotG,
        alpha: { from: 0.15, to: 0.55 },
        duration: duration / 2,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut',
        delay: idx * 300,
      });
    });
  }

  drawNeonSign(x, y) {
    const glows = ['#ff00a0','#ff40a8','#ff80c0'];
    glows.forEach((c, i) => {
      this.add.text(x, y, 'STUDIO 57', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '18px', color: c, stroke: c,
        strokeThickness: (3 - i) * 5, alpha: 0.2 + i * 0.25,
      }).setOrigin(0.5);
    });
    this.add.text(x, y, 'STUDIO 57', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5);
  }

  // ─── HUD ────────────────────────────────────────────────────────────────────

  buildHUD(W, H, L) {
    const bg = this.add.rectangle(0, 0, W, 52, 0x000000, 0.88).setOrigin(0).setDepth(50);

    // Night label
    this.add.text(8, 6, `${L.night_label} ${GameState.nightNumber}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ffd700',
    }).setDepth(51);

    // Timer
    this.timerText = this.add.text(W / 2, 6, `${L.shift}: ${NIGHT_DURATION}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ffffff',
    }).setOrigin(0.5, 0).setDepth(51);

    // Velvet box
    this.velvetText = this.add.text(8, 26, `${L.velvet_box}: $0`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#40ff80',
    }).setDepth(51);

    // Stash
    this.stashText = this.add.text(W / 2, 26, `${L.stash}: $${GameState.stash}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ff8800',
    }).setOrigin(0.5, 0).setDepth(51);

    // FBI bar (right side)
    const fbiX = W - 8;
    const fbiW = 85;
    this.add.text(fbiX - fbiW - 26, 6, `${L.fbi}:`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ff4040',
    }).setOrigin(1, 0).setDepth(51);

    this.add.rectangle(fbiX - fbiW / 2, 16, fbiW, 10, 0x330000).setDepth(51);

    this.fbiBar = this.add.rectangle(fbiX - fbiW + 1, 16, 0, 8, 0xff2020)
      .setOrigin(0, 0.5).setDepth(52);
    this.fbiBarMax = fbiW - 2;

    this.add.rectangle(fbiX - fbiW / 2, 16, fbiW, 10)
      .setStrokeStyle(1, 0xff4040).setDepth(52);

    // Police heat bar
    this.add.text(fbiX - fbiW - 26, 30, 'POLICE:', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#4488ff',
    }).setOrigin(1, 0).setDepth(51);

    this.add.rectangle(fbiX - fbiW / 2, 39, fbiW, 8, 0x001133).setDepth(51);

    this.policeBar = this.add.rectangle(fbiX - fbiW + 1, 39, 0, 6, 0x4488ff)
      .setOrigin(0, 0.5).setDepth(52);

    this.updateHUD(L);
  }

  updateHUD(L) {
    if (!L) L = LOCALES[GameState.lang];
    const safe = (v) => Math.max(0, v);
    this.velvetText.setText(`${L.velvet_box}: $${safe(this.velvetBox)}`);
    this.stashText.setText(`${L.stash}: $${safe(GameState.stash)}`);
    this.timerText.setText(`${L.shift}: ${this.timeLeft}`);

    const fbiPct   = Math.min(1, GameState.fbiSuspicion / 100);
    const policePct = Math.min(1, GameState.policeHeat / 100);
    this.fbiBar.width   = fbiPct   * this.fbiBarMax;
    this.policeBar.width = policePct * this.fbiBarMax;

    if (this.timeLeft <= 10) this.timerText.setColor('#ff4040');
    if (fbiPct > 0.7) this.fbiBar.setFillStyle(0xff0000);
  }

  // ─── GUEST CARD ─────────────────────────────────────────────────────────────

  buildGuestCard(W, H, L) {
    const cx = W / 2;
    const cy = H * 0.505;
    const cw = Math.min(W * 0.82, 300);
    const ch = 190;

    this.cardCX = cx; this.cardCY = cy; this.cardW = cw; this.cardH = ch;

    this.cardContainer = this.add.container(cx, cy).setDepth(30).setVisible(false);

    // Polaroid frame
    const frame = this.add.rectangle(0, 0, cw, ch, CREAM).setStrokeStyle(2, 0xc8a060);
    this.cardContainer.add(frame);

    // Tape strips on corners
    const tape = this.add.graphics();
    tape.fillStyle(0xffff88, 0.6);
    tape.fillRect(-cw / 2 - 8, -ch / 2 - 6, 28, 12);
    tape.fillRect(cw / 2 - 20, -ch / 2 - 6, 28, 12);
    this.cardContainer.add(tape);

    // Portrait area (left of card)
    const phW = 80; const phH = 100;
    const phX = -cw / 2 + phW / 2 + 12;
    const phY = -10;
    const photoFrame = this.add.rectangle(phX, phY, phW, phH, 0x1a0828)
      .setStrokeStyle(1, 0x8a6a4a);
    this.cardContainer.add(photoFrame);

    // Portrait graphics drawn per-guest
    this.portraitG = this.add.graphics();
    this.cardContainer.add(this.portraitG);
    this.portraitOffX = phX;
    this.portraitOffY = phY;
    this.portraitW    = phW;
    this.portraitH    = phH;

    // Celebrity badge (hidden by default)
    this.celebBadge = this.add.text(phX, phY + phH / 2 + 10, '★ VIP ★', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ffd700',
    }).setOrigin(0.5).setVisible(false);
    this.cardContainer.add(this.celebBadge);

    // Text panel (right side)
    const tx = phX + phW / 2 + 12;
    const tw = cw / 2 - (phX + phW / 2) - 12;

    const textStyle = (sz, col) => ({
      fontFamily: '"Press Start 2P", monospace',
      fontSize: sz, color: col,
      wordWrap: { width: tw + 30 },
    });

    this.guestNameTxt  = this.add.text(tx, -ch / 2 + 16, '---', textStyle('8px','#2a1a0a'));
    this.guestAgeTxt   = this.add.text(tx, -ch / 2 + 40, '', textStyle('10px','#2a1a0a'));
    this.guestStyleTxt = this.add.text(tx, -ch / 2 + 68, '', textStyle('8px','#2a1a0a'));
    this.guestStateTxt = this.add.text(tx, -ch / 2 + 90, '', textStyle('8px','#2a1a0a'));
    this.guestDescTxt  = this.add.text(tx, -ch / 2 + 115, '', textStyle('7px','#666666'));
    this.warningTxt    = this.add.text(0,  ch / 2 - 22, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ff2020',
      stroke: '#330000', strokeThickness: 2,
    }).setOrigin(0.5);

    // ID label watermark
    this.add.text(-cw / 2 + 6, ch / 2 - 14, L.id_label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#c8b898', alpha: 0.5,
    });

    [this.guestNameTxt, this.guestAgeTxt, this.guestStyleTxt,
     this.guestStateTxt, this.guestDescTxt, this.warningTxt].forEach(t =>
      this.cardContainer.add(t));

    // Subtle fake-ID visual hint (night 4+): faint worn/yellow tint over age field
    this.fakeIdHintG = this.add.graphics().setVisible(false);
    this.cardContainer.add(this.fakeIdHintG);

    // Stamp
    this.stampTxt = this.add.text(0, 0, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '26px', color: '#00aa44',
      stroke: '#003311', strokeThickness: 3, alpha: 0.88,
    }).setOrigin(0.5).setRotation(-0.45);
    this.cardContainer.add(this.stampTxt);
  }

  updateGuestCard(guest) {
    const L = LOCALES[GameState.lang];
    const minAge = GameState.nightNumber >= 4 ? 21 : 18;

    this.guestNameTxt.setText(guest.name);
    this.guestAgeTxt.setText(`${L.age_label}: ${guest.shownAge}`);

    const styleNames  = [L.style_ultra, L.style_clean, L.style_stylish, L.style_normal, L.style_trashy];
    const styleColors = ['#9900ff','#4488ff','#ff6600','#888888','#664422'];
    this.guestStyleTxt.setText(`${L.style_label}: ${styleNames[guest.style]}`);
    this.guestStyleTxt.setColor(styleColors[guest.style]);

    const stateNames  = [L.state_sober, L.state_tipsy, L.state_wasted];
    const stateColors = ['#00aa00','#ffaa00','#ff2200'];
    this.guestStateTxt.setText(`${L.state_label}: ${stateNames[guest.intox]}`);
    this.guestStateTxt.setColor(stateColors[guest.intox]);

    if (guest.isCelebrity && guest.celebrity) {
      const desc = guest.celebrity.desc[GameState.lang] || guest.celebrity.desc.en;
      this.guestDescTxt.setText(desc);
      this.celebBadge.setVisible(true);
    } else {
      this.guestDescTxt.setText('');
      this.celebBadge.setVisible(false);
    }

    // Warnings
    const warns = [];
    if (guest.intox === INTOX.WASTED) warns.push(L.warn_wasted);
    if (guest.style === STYLE.TRASHY)  warns.push(L.warn_dress);
    // Show underage warning only if no fake ID (real age visible)
    if (!guest.hasFakeId && guest.realAge < minAge) warns.push(L.warn_underage);
    this.warningTxt.setText(warns.join('  '));

    this.stampTxt.setText('');

    // Night 4+: subtle visual hint that the ID might be tampered
    this.fakeIdHintG.clear().setVisible(false);
    if (guest.hasFakeId && GameState.nightNumber >= 4) {
      const ch = this.cardH;
      const cw = this.cardW;
      const tx = this.portraitOffX + this.portraitW / 2 + 12;
      // Faint yellow tint over the age line
      this.fakeIdHintG.fillStyle(0xffee00, 0.10);
      this.fakeIdHintG.fillRect(tx - 4, -ch / 2 + 32, cw * 0.45, 18);
      // Tiny "ink bleed" dot near birthdate — suggests reprinted card
      this.fakeIdHintG.fillStyle(0x442200, 0.30);
      this.fakeIdHintG.fillRect(tx + cw * 0.38, -ch / 2 + 36, 3, 3);
      this.fakeIdHintG.setVisible(true);
    }

    this.drawPortrait(guest);
  }

  drawPortrait(guest) {
    const g = this.portraitG;
    g.clear();
    const px = this.portraitOffX;
    const py = this.portraitOffY;
    const s  = 3; // pixel size

    const skin = SKIN_PALETTES[guest.skinIdx];

    // ── Body ──
    const outfitHex = parseInt(guest.outfitColor.replace('#', ''), 16);
    g.fillStyle(outfitHex);
    g.fillRect(px - 7 * s, py + 2 * s, 14 * s, 10 * s);

    // Collar / neck
    g.fillStyle(skin.main);
    g.fillRect(px - s, py - s, 2 * s, 3 * s);

    // Head
    g.fillStyle(skin.main);
    g.fillRect(px - 4 * s, py - 9 * s, 8 * s, 8 * s);
    // Cheeks shadow
    g.fillStyle(skin.shadow);
    g.fillRect(px - 4 * s, py - 3 * s, 2 * s, 2 * s);
    g.fillRect(px + 2 * s, py - 3 * s, 2 * s, 2 * s);

    // Hair
    const hc = guest.hairColor;
    g.fillStyle(hc);
    switch (guest.hairType) {
      case 'afro':
        g.fillRect(px - 7 * s, py - 14 * s, 14 * s, 8 * s);
        g.fillRect(px - 5 * s, py - 16 * s, 10 * s, 4 * s);
        break;
      case 'pompadour':
        g.fillRect(px - 4 * s, py - 14 * s, 8 * s, 6 * s);
        g.fillRect(px - 3 * s, py - 16 * s, 5 * s, 3 * s);
        break;
      case 'straight_long':
        g.fillRect(px - 4 * s, py - 12 * s, 8 * s, 4 * s);
        g.fillRect(px - 5 * s, py - 10 * s, 2 * s, 8 * s);
        g.fillRect(px + 3 * s, py - 10 * s, 2 * s, 8 * s);
        break;
      case 'feathered':
        g.fillRect(px - 5 * s, py - 13 * s, 10 * s, 5 * s);
        g.fillRect(px - 6 * s, py - 10 * s, 2 * s, 4 * s);
        g.fillRect(px + 4 * s, py - 10 * s, 2 * s, 4 * s);
        break;
      case 'bob':
        g.fillRect(px - 4 * s, py - 12 * s, 8 * s, 6 * s);
        g.fillRect(px - 5 * s, py - 8 * s, 10 * s, 3 * s);
        break;
      case 'shag':
        g.fillRect(px - 5 * s, py - 14 * s, 10 * s, 6 * s);
        g.fillRect(px - 3 * s, py - 16 * s, 6 * s, 4 * s);
        g.fillRect(px - 5 * s, py - 8 * s, 3 * s, 3 * s);
        g.fillRect(px + 2 * s, py - 8 * s, 3 * s, 3 * s);
        break;
      default: // natural / curly
        g.fillRect(px - 4 * s, py - 12 * s, 8 * s, 4 * s);
    }

    // Eyes
    if (guest.intox === INTOX.WASTED) {
      // X eyes
      g.fillStyle(0xff2020);
      g.fillRect(px - 3 * s, py - 6 * s, s, s);
      g.fillRect(px - 2 * s, py - 7 * s, s, s);
      g.fillRect(px + s,     py - 6 * s, s, s);
      g.fillRect(px + 2 * s, py - 7 * s, s, s);
    } else {
      g.fillStyle(0x111111);
      g.fillRect(px - 3 * s, py - 6 * s, s + 1, s + 1);
      g.fillRect(px + s + 1, py - 6 * s, s + 1, s + 1);
    }

    // Mouth
    if (guest.intox === INTOX.TIPSY) {
      g.fillStyle(0xff4444); // wide grin
      g.fillRect(px - 2 * s, py - 2 * s, 4 * s, s);
    } else {
      g.fillStyle(0x993333);
      g.fillRect(px - s, py - 2 * s, 2 * s, s);
    }

    // Accessories
    if (guest.style === STYLE.ULTRA) {
      // Glitter dots
      g.fillStyle(0xffd700);
      for (let i = 0; i < 5; i++) {
        g.fillRect(
          px + Phaser.Math.Between(-6, 6) * s,
          py + Phaser.Math.Between(2, 8) * s,
          s, s
        );
      }
    }

    // Sunglasses for stylish
    if (guest.style <= STYLE.STYLISH && Math.random() < 0.3) {
      g.fillStyle(0x111111, 0.85);
      g.fillRect(px - 4 * s, py - 7 * s, 3 * s, 2 * s);
      g.fillRect(px + s,     py - 7 * s, 3 * s, 2 * s);
      g.lineStyle(1, 0x444444);
      g.strokeRect(px - 4 * s, py - 7 * s, 3 * s, 2 * s);
      g.strokeRect(px + s,     py - 7 * s, 3 * s, 2 * s);
    }
  }

  // ─── DECISION BUTTONS ───────────────────────────────────────────────────────

  buildButtons(W, H, L) {
    const btnY  = H * 0.81;
    const bw = Math.min(W * 0.38, 140);
    const bh = 48;

    // REJECT
    const rejBg = this.add.rectangle(W * 0.27, btnY, bw, bh, RED)
      .setStrokeStyle(2, 0xff4444).setInteractive().setDepth(30);
    const rejTxt = this.add.text(W * 0.27, btnY, `✗  ${L.reject}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(31);

    rejBg.on('pointerover', () => rejBg.setFillStyle(0xdd0033));
    rejBg.on('pointerout',  () => rejBg.setFillStyle(RED));
    rejBg.on('pointerdown', () => this.decide(false));
    rejTxt.setInteractive(); rejTxt.on('pointerdown', () => this.decide(false));

    // APPROVE
    const appBg = this.add.rectangle(W * 0.73, btnY, bw, bh, GREEN)
      .setStrokeStyle(2, 0x44ff88).setInteractive().setDepth(30);
    const appTxt = this.add.text(W * 0.73, btnY, `✓  ${L.approve}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(31);

    appBg.on('pointerover', () => appBg.setFillStyle(0x00cc55));
    appBg.on('pointerout',  () => appBg.setFillStyle(GREEN));
    appBg.on('pointerdown', () => this.decide(true));
    appTxt.setInteractive(); appTxt.on('pointerdown', () => this.decide(true));

    // HIDE MONEY
    const hideBg = this.add.rectangle(W / 2, H * 0.91, 180, 36, 0x664400)
      .setStrokeStyle(2, GOLD).setInteractive().setDepth(30);
    const hideTxt = this.add.text(W / 2, H * 0.91, `💰 ${L.hide_money}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(31);

    hideBg.on('pointerover', () => hideBg.setFillStyle(0x885500));
    hideBg.on('pointerout',  () => hideBg.setFillStyle(0x664400));
    hideBg.on('pointerdown', () => this.hideMoney());
    hideTxt.setInteractive(); hideTxt.on('pointerdown', () => this.hideMoney());

    // Key hint
    this.add.text(W / 2, H * 0.96, '[A] Deny  [D] Approve  [H] Hide', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#444444',
    }).setOrigin(0.5).setDepth(30);
  }

  buildVelvetRope(W, H) {
    const g = this.add.graphics().setDepth(20);
    const ry = H * 0.68;

    // Posts
    g.fillStyle(0xd4a030);
    [[W * 0.1, ry], [W * 0.9, ry]].forEach(([px, py]) => {
      g.fillRect(px - 4, py - 42, 8, 50);
      g.fillCircle(px, py - 42, 7);
    });

    // Velvet rope (bezier approximation)
    g.lineStyle(7, 0x880044, 1);
    g.beginPath();
    g.moveTo(W * 0.1, ry - 20);
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const bx = Phaser.Math.Linear(W * 0.1, W * 0.9, t);
      const by = (ry - 20) + Math.sin(t * Math.PI) * 14;
      i === 0 ? g.moveTo(bx, by) : g.lineTo(bx, by);
    }
    g.strokePath();
  }

  // ─── TUTORIAL ────────────────────────────────────────────────────────────────

  buildTutorial(W, H) {
    const L = LOCALES[GameState.lang];
    const steps = [
      { text: L.tutorial_age  || '👁 CHECK the guest\'s AGE in the ID card!',   y: H * 0.51 },
      { text: L.tutorial_btn  || '✓ APPROVE or ✗ REJECT guests',                 y: H * 0.77 },
      { text: L.tutorial_hide || '💰 HIDE MONEY to stash cash from the taxman!', y: H * 0.88 },
    ];

    this.tutorialBg  = this.add.rectangle(W / 2, 0, W * 0.94, 36, 0x000000, 0.85)
      .setStrokeStyle(1, 0xffd700).setDepth(90).setOrigin(0.5, 0).setVisible(false);
    this.tutorialTxt = this.add.text(W / 2, 8, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#ffd700',
      wordWrap: { width: W * 0.88 }, align: 'center',
    }).setOrigin(0.5, 0).setDepth(91).setVisible(false);

    const nextBtn = this.add.text(W - 8, 22, 'NEXT ▶', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 6, y: 3 },
    }).setOrigin(1, 0.5).setDepth(92).setInteractive().setVisible(false);
    nextBtn.on('pointerdown', () => this.advanceTutorial(steps, nextBtn));

    this.tutorialNextBtn = nextBtn;
    this.tutorialSteps   = steps;
    this.advanceTutorial(steps, nextBtn);
  }

  advanceTutorial(steps, nextBtn) {
    const i = this.tutorialStep;
    if (i >= steps.length) {
      this.tutorialBg.setVisible(false);
      this.tutorialTxt.setVisible(false);
      nextBtn.setVisible(false);
      GameState.flags.tutorialDone = true;
      return;
    }
    const { text } = steps[i];
    this.tutorialBg.setVisible(true).setY(steps[i].y - 20);
    this.tutorialTxt.setVisible(true).setText(text).setY(steps[i].y - 16);
    nextBtn.setVisible(true).setY(steps[i].y - 8);
    this.tutorialStep++;

    // Auto-advance after 6 sec if player doesn't click
    if (this.tutorialAutoTimer) this.tutorialAutoTimer.remove();
    this.tutorialAutoTimer = this.time.delayedCall(6000, () => {
      this.advanceTutorial(steps, nextBtn);
    });
  }

  // ─── GUEST SPAWNING ─────────────────────────────────────────────────────────

  scheduleNextGuest() {
    if (this.timeLeft <= 4) return;
    const delay = Phaser.Math.Between(GUEST_INTERVAL_MIN, GUEST_INTERVAL_MAX);
    this.guestSpawnTimer = this.time.delayedCall(delay, this.spawnGuest, [], this);
  }

  spawnGuest() {
    if (this.timeLeft <= 0) return;

    let guest;
    const nightNum = GameState.nightNumber;
    const celebChance = nightNum >= 2 ? 0.10 : 0;

    if (Math.random() < celebChance) {
      const eligible = CELEBRITIES.filter(c =>
        c.unlockNight <= nightNum &&
        (!c.requireUpgrade || GameState.upgrades[c.requireUpgrade] > 0)
      );
      if (eligible.length) {
        const celeb = eligible[Phaser.Math.Between(0, eligible.length - 1)];
        guest = {
          id: `celeb_${celeb.id}`,
          name: celeb.name,
          firstName: celeb.name.split(' ')[0],
          gender: 'M',
          realAge: celeb.age, shownAge: celeb.shownAge, hasFakeId: false,
          style: celeb.style, intox: celeb.intox,
          isCelebrity: true, celebrity: celeb,
          ticketRevenue: celeb.ticketRevenue,
          barRevenue: celeb.barRevenue,
          skinIdx: celeb.skinIdx,
          hairColor: celeb.hairColor,
          hairType: celeb.hairType,
          outfitColor: celeb.outfitColor,
        };
      }
    }

    if (!guest) guest = generateGuest(nightNum);

    this.guestQueue.push(guest);
    if (!this.currentGuest && !this.deciding) this.showNextGuest();

    this.scheduleNextGuest();
  }

  showNextGuest() {
    if (this.guestQueue.length === 0) {
      this.currentGuest = null;
      this.cardContainer.setVisible(false);
      return;
    }

    this.currentGuest = this.guestQueue.shift();
    this.deciding = false;
    this.updateGuestCard(this.currentGuest);

    this.cardContainer.setVisible(true).setAlpha(0).setScale(0.85);
    this.tweens.add({
      targets: this.cardContainer,
      alpha: 1, scaleX: 1, scaleY: 1,
      duration: 260, ease: 'Back.Out',
    });
  }

  // ─── DECISIONS ──────────────────────────────────────────────────────────────

  decide(approve) {
    if (!this.currentGuest || this.deciding) return;
    this.deciding = true;

    const L     = LOCALES[GameState.lang];
    const guest = this.currentGuest;
    const minAge = GameState.nightNumber >= 4 ? 21 : 18;

    if (approve) {
      AudioSystem.playStamp(true);
      this.showStamp(L.stamp_in, true);
      this.velvetBox += Math.round(guest.ticketRevenue * this.ticketMultiplier);
      GameState.nightStats.approved++;
      this.processEntry(guest, minAge, L);
    } else {
      AudioSystem.playStamp(false);
      this.showStamp(L.stamp_out, false);
      GameState.nightStats.rejected++;
      if (guest.isCelebrity) {
        GameState.reputation = Math.max(0, GameState.reputation - 5);
      }
    }

    this.updateHUD(L);
    this.time.delayedCall(820, () => {
      this.currentGuest = null;
      this.showNextGuest();
    });
  }

  processEntry(guest, minAge, L) {
    // Underage slip
    if (guest.realAge < minAge) {
      GameState.nightStats.underageSlipped++;
      if (Math.random() < 0.40) {
        const fine = 500;
        this.velvetBox = Math.max(0, this.velvetBox - fine);
        this.fines += fine;
        GameState.fbiSuspicion = Math.min(100, GameState.fbiSuspicion + 15);
        GameState.policeHeat   = Math.min(100, GameState.policeHeat + 20);
        GameState.nightStats.policeVisits++;
        this.showEvent(L.ev_police, `${L.ev_fine} -$${fine}`, '#ff4040');
      }
    }

    // Fight from wasted guest
    if (guest.intox === INTOX.WASTED) {
      const fc = this.slyInClub ? 0 : this.fightChance;
      if (Math.random() < fc) {
        const dmg = 300;
        this.velvetBox = Math.max(0, this.velvetBox - dmg);
        this.fines += dmg;
        GameState.policeHeat = Math.min(100, GameState.policeHeat + 10);
        GameState.nightStats.fights++;
        this.showEvent(L.ev_fight, `-$${dmg}`, '#ff6600');
      }
    }

    // Reputation damage from trashy guest
    if (guest.style === STYLE.TRASHY) {
      GameState.reputation = Math.max(0, GameState.reputation - 2);
    }

    // Celebrity effects
    if (guest.isCelebrity && guest.celebrity) {
      const celeb = guest.celebrity;
      GameState.nightStats.celebsHosted.push(celeb.id);
      this.velvetBox += celeb.entryBonus;
      this.showEvent(L.ev_celeb_in, `+$${celeb.entryBonus}`, '#ffd700');

      if (!GameState.flags.firstCelebSeen) GameState.flags.firstCelebSeen = true;

      switch (celeb.effect) {
        case 'no_fights':
          this.slyInClub = true;
          break;
        case 'bar_boost':
          this.barBoost = celeb.effectValue;       // Lisa: ×2.5 bar income
          break;
        case 'full_dance_floor':
          this.barBoost = Math.max(this.barBoost, celeb.effectValue); // Mini Michael: ×1.5
          break;
        case 'big_ticket':
          this.ticketMultiplier = 3;               // Trumpet: 3× all tickets
          this.showEvent('TRUMP EFFECT', '3× TICKETS!', '#f0f0f0');
          break;
        case 'fan_rush': {
          // Swagger: instantly add guests to queue
          const n = celeb.effectValue;
          for (let i = 0; i < n; i++) this.guestQueue.push(generateGuest(GameState.nightNumber));
          if (!this.currentGuest && !this.deciding) this.showNextGuest();
          this.showEvent('FAN RUSH!', `+${n} guests`, '#ff6030');
          break;
        }
        case 'hype_boost': {
          // Warholder: +2 reputation every 10 sec while in club
          const timer = this.time.addEvent({
            delay: 10000,
            callback: () => {
              GameState.reputation = Math.min(100, GameState.reputation + celeb.effectValue);
              this.floatText(this.W / 2, this.H * 0.35, `WARHOL REP +${celeb.effectValue}`, '#e8e8e8', 900);
            },
            loop: true,
          });
          this.celebTimers.push(timer);
          break;
        }
      }
    }

    // Random macro event
    this.maybeFireEvent(L);
  }

  scheduleCollinsAppearance(L) {
    const n  = GameState.nightNumber;
    const cm = GameState.characterMemory.collins;
    const collinsEv = NIGHT_EVENTS.find(e => e.id === 'corrupt_cop');
    if (!collinsEv) return;

    if (n === 3 && !cm.met) {
      // First meeting — guaranteed after 18 s
      this.time.delayedCall(18000, () => {
        if (!this.eventPending && !this.raidInProgress) {
          cm.met = true;
          this.fireEvent(collinsEv, L);
        }
      });
    } else if (n === 5 && !cm.hostile) {
      // Second meeting — 20 s in
      this.time.delayedCall(20000, () => {
        if (!this.eventPending && !this.raidInProgress) this.fireEvent(collinsEv, L);
      });
    } else if (n >= 7 && cm.hostile) {
      // Collins snitched — FBI penalty at night start
      this.time.delayedCall(3000, () => {
        GameState.fbiSuspicion = Math.min(100, GameState.fbiSuspicion + 20);
        this.updateHUD(L);
        this.floatText(this.W / 2, this.H * 0.3, 'COLLINS SNITCHED! FBI +20%', '#ff0000', 3000);
      });
    }
  }

  maybeFireEvent(L) {
    if (this.eventPending) return;
    const nightNum = GameState.nightNumber;
    for (const ev of NIGHT_EVENTS) {
      if (ev.unlockNight > nightNum) continue;
      if (ev.id === 'corrupt_cop') continue; // Collins scheduled separately
      if (Math.random() < ev.chance * 0.15) { // scaled down per-guest check
        this.fireEvent(ev, L);
        return;
      }
    }
  }

  fireEvent(ev, L) {
    this.eventPending = true;
    // Sync local night earnings so event resolve() can read/modify them
    GameState.nightEarnings = this.velvetBox;
    this.scene.launch('EventPopup', { event: ev, onClose: (result) => {
      // Pull changes back from event
      this.velvetBox = GameState.nightEarnings;
      this.eventPending = false;
      this.updateHUD(L);
      if (result?.msg) {
        const color = result.ok !== false ? '#40ff80' : '#ff4040';
        this.floatText(this.W / 2, this.H * 0.45, result.msg, color, 2000);
      }
    }});
  }

  hideMoney() {
    const L = LOCALES[GameState.lang];
    if (this.velvetBox < 200) {
      this.floatText(this.W / 2, this.H * 0.70, 'NOT ENOUGH!', '#ff4040');
      return;
    }
    this.velvetBox         -= 200;
    GameState.stash        += 200;
    GameState.fbiSuspicion  = Math.min(100, GameState.fbiSuspicion + 12);
    AudioSystem.playCoins();
    this.updateHUD(L);
    this.floatText(this.W / 2, this.H * 0.70, '-$200 → STASH', '#ff8800');

    // Advance tutorial step 2 if active
    if (this.tutorialStep === 3 && this.tutorialSteps) {
      if (this.tutorialAutoTimer) this.tutorialAutoTimer.remove();
      this.advanceTutorial(this.tutorialSteps, this.tutorialNextBtn);
    }
  }

  showStamp(text, approve) {
    this.stampTxt.setText(text);
    this.stampTxt.setColor(approve ? '#00cc44' : '#cc0022');
    this.stampTxt.setStroke(approve ? '#003311' : '#330000', 3);
    this.stampTxt.setAlpha(0).setScale(2.2);
    this.tweens.add({
      targets: this.stampTxt,
      alpha: 1, scaleX: 1, scaleY: 1,
      duration: 180, ease: 'Back.Out',
    });
  }

  showEvent(title, body, color) {
    this.floatText(this.W / 2, this.H * 0.60, `${title}\n${body}`, color, 2200);
  }

  floatText(x, y, msg, color, dur = 1500) {
    const t = this.add.text(x, y, msg, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px', color,
      backgroundColor: '#000000cc',
      padding: { x: 8, y: 5 }, align: 'center',
    }).setOrigin(0.5).setDepth(60);
    this.tweens.add({
      targets: t, y: y - 50, alpha: { from: 1, to: 0 },
      duration: dur, onComplete: () => t.destroy(),
    });
  }

  // ─── TIMERS ──────────────────────────────────────────────────────────────────

  onTick() {
    this.timeLeft--;
    const L = LOCALES[GameState.lang];
    this.updateHUD(L);

    if (this.timeLeft === 15) AudioSystem.speedUp();

    // Random macro event check each second
    if (!this.eventPending && Math.random() < 0.025) {
      const eligible = NIGHT_EVENTS.filter(e => e.unlockNight <= GameState.nightNumber);
      if (eligible.length) {
        const ev = eligible[Phaser.Math.Between(0, eligible.length - 1)];
        if (Math.random() < ev.chance) this.fireEvent(ev, L);
      }
    }

    // FBI raid check
    if (GameState.fbiSuspicion >= 40 && Math.random() < GameState.fbiSuspicion / 100 * 0.02) {
      this.triggerFBIRaid(L);
    }

    if (this.timeLeft <= 0) this.endNight(L);
  }

  onBarTick() {
    const barLevel = Math.max(1, GameState.upgrades.bar + 1);
    const income   = Math.round(25 * barLevel * this.barBoost);
    this.velvetBox += income;
    AudioSystem.playCoins();
    this.floatText(this.W * 0.75, this.H * 0.55, `BAR +$${income}`, '#40ff80', 1000);
    this.updateHUD();
  }

  triggerFBIRaid(L) {
    if (this.raidInProgress) return;
    this.raidInProgress = true;
    if (!GameState.flags.firstRaidSeen) GameState.flags.firstRaidSeen = true;

    AudioSystem.playAlarm();
    this.eventPending = true;
    GameState.nightEarnings = this.velvetBox;

    const raidEvent = {
      id: 'fbi_raid_live',
      title_safe: { ru: '🔦 АГЕНТЫ У ДВЕРИ', en: '🔦 AGENTS AT THE DOOR' },
      body_safe: {
        ru: 'Двое в костюмах. Федеральные значки.\nВремя решать быстро.',
        en: 'Two men in suits. Federal badges.\nDecide fast.',
      },
      choices: [
        { key: 'open',  label: { ru: 'ОТКРЫТЬ ДВЕРЬ',  en: 'OPEN THE DOOR'  } },
        { key: 'stall', label: { ru: 'ТЯНУТЬ ВРЕМЯ',   en: 'STALL FOR TIME' } },
      ],
      resolve(choice, gs) {
        if (choice === 'open') {
          const seized = gs.stash;
          gs.stash = 0;
          gs.fbiSuspicion = Math.max(0, gs.fbiSuspicion - 30);
          return {
            msg: seized > 0 ? `SEIZED: -$${seized}. SUSPICION ↓` : 'NOTHING FOUND. SUSPICION ↓',
            ok: false, seized,
          };
        }
        // Stall — 45 % they leave early
        if (Math.random() < 0.45) {
          gs.fbiSuspicion = Math.max(0, gs.fbiSuspicion - 8);
          return { msg: 'THEY LEFT... FOR NOW.', ok: true, seized: 0 };
        }
        // Stall failed — forced entry
        const seized = gs.stash;
        gs.stash = 0;
        gs.fbiSuspicion = Math.min(100, gs.fbiSuspicion + 20);
        return { msg: `FORCED ENTRY! SEIZED: -$${seized}`, ok: false, seized };
      },
    };

    this.scene.launch('EventPopup', {
      event: raidEvent,
      onClose: (result) => {
        this.velvetBox = GameState.nightEarnings;
        this.eventPending = false;
        AudioSystem.stop();
        this.clockEvent?.remove();
        this.barEvent?.remove();
        this.guestSpawnTimer?.remove();
        this.celebTimers.forEach(t => t?.remove());

        const seized = result?.seized || 0;
        this.time.delayedCall(300, () => {
          this.saveNightResult(0, seized);
          if (this.velvetBox <= 0 && GameState.stash <= 0) {
            GameState.bankrupt = true;
            this.scene.start('GameOver', { reason: 'fbi' });
          } else {
            this.scene.start('EndNight');
          }
        });
      },
    });
  }

  // ─── END OF NIGHT ────────────────────────────────────────────────────────────

  endNight(L) {
    if (!L) L = LOCALES[GameState.lang];
    this.clockEvent?.remove();
    this.barEvent?.remove();
    this.guestSpawnTimer?.remove();
    this.celebTimers.forEach(t => t?.remove());
    AudioSystem.stop();
    this.saveNightResult(this.fines, 0);
    this.scene.start('EndNight');
  }

  saveNightResult(fines, seized) {
    // Store night's gross earnings separately; EndNightScene will tax and add to velvetBox
    GameState.nightEarnings = Math.max(0, this.velvetBox);
    SaveSystem.save();
  }
}
