import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { SaveSystem } from '../SaveSystem.js';
import { LOCALES } from '../data/locales.js';
import { UPGRADES, getUpgradeNextLevel } from '../data/upgrades.js';
import { getArnieLine } from '../data/arnie_lines.js';
import { PixelUI } from '../systems/PixelUI.js';

const DARK = 0x0a0838;
const GOLD = 0xffd700;

const UPGRADE_KEYS = ['sound','bar','security','lights','vipLounge'];
const UPGRADE_ICONS = ['🎵','🍸','🛡️','💡','👑'];

export class OfficeScene extends Phaser.Scene {
  constructor() { super({ key: 'Office' }); }

  create() {
    const { width: W, height: H } = this.scale;
    const L = LOCALES[GameState.lang];

    this.W = W; this.H = H;
    this.buildScene(W, H, L);
  }

  buildScene(W, H, L) {
    // Background — office interior
    this.add.rectangle(0, 0, W, H, 0x100838).setOrigin(0);
    this.drawOfficeBg(W, H);

    // Title
    PixelUI.neonText(this, W / 2, H * 0.06, L.office_title, '11px', '#ffd700', {
      depth: 3, glowLayers: [10, 5, 2], glowAlphas: [0.10, 0.20, 0.38],
    });

    this.add.text(W / 2, H * 0.115, L.office_sub, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#666688',
    }).setOrigin(0.5);

    // Funds display
    const funds = GameState.velvetBox + GameState.stash;
    const fundsG = this.add.graphics().setDepth(3);
    fundsG.fillStyle(0x002211, 0.90);
    fundsG.fillRoundedRect(W / 2 - 110, H * 0.155, 220, 22, 5);
    fundsG.lineStyle(1, 0x44ff88, 0.45);
    fundsG.strokeRoundedRect(W / 2 - 110, H * 0.155, 220, 22, 5);
    this.fundsText = this.add.text(W / 2, H * 0.166, `💰 ${L.office_funds}: $${funds.toLocaleString()}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#40ff80',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(4);

    // Upgrade cards
    const cardH   = (H * 0.52) / UPGRADE_KEYS.length;
    const cardW   = Math.min(W * 0.90, 340);
    const startY  = H * 0.23;

    UPGRADE_KEYS.forEach((key, i) => {
      this.buildUpgradeCard(W / 2, startY + i * cardH + cardH / 2, cardW, cardH - 8, key, i, L);
    });

    // Arnie dialogue panel
    this.buildArniePanel(W, H);

    // Booked event display
    const ev = GameState.bookedEvent;
    const lang = GameState.lang;
    const evLabel = ev
      ? (ev.label?.[lang] || ev.label?.en || ev.id)
      : (lang === 'ru' ? 'Без эвента' : 'No event');
    const evColor = ev ? '#ffd700' : '#444444';

    this.add.text(W / 2, H * 0.81, lang === 'ru' ? `📅 ЭВЕНТ: ${evLabel}` : `📅 EVENT: ${evLabel}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: evColor,
      backgroundColor: '#0a0018',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5);

    // EVENTS button
    const { bg: evBg } = PixelUI.button(
      this, W * 0.27, H * 0.87, 140, 34,
      lang === 'ru' ? '📅 ЭВЕНТ' : '📅 EVENTS',
      { baseColor: 0x1a0040, hoverColor: 0x2a0060, borderColor: 0x8844ff, fontSize: '8px', depth: 10 }
    );
    evBg.on('pointerdown', () => this.scene.start('Events'));

    // OPEN TONIGHT button
    const { bg: openBg } = PixelUI.button(
      this, W * 0.73, H * 0.87, 140, 34, L.office_open,
      { baseColor: 0x004d22, hoverColor: 0x007733, borderColor: 0x44ff88, fontSize: '8px', depth: 10 }
    );
    openBg.on('pointerdown', () => {
      GameState.resetNightStats();
      SaveSystem.save();
      this.scene.start('Street');
    });

    // Back to menu
    this.add.text(W * 0.08, H * 0.03, '←', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px', color: '#666688',
      backgroundColor: '#0a0018',
      padding: { x: 8, y: 4 },
    }).setInteractive().on('pointerdown', () => this.scene.start('Menu'));
  }

  buildUpgradeCard(cx, cy, cw, ch, key, iconIdx, L) {
    const currentLevel = GameState.upgrades[key] || 0;
    const maxLevel     = UPGRADES[key].levels.length;
    const next         = getUpgradeNextLevel(key, currentLevel);
    const isMaxed      = currentLevel >= maxLevel;
    const canAfford    = next && (GameState.velvetBox + GameState.stash) >= next.cost;

    const bgColor  = isMaxed ? 0x1a1a2e : canAfford ? 0x0a1a0a : 0x1a0a0a;
    const strColor = isMaxed ? 0xffd700 : canAfford ? 0x44ff88 : 0xff4444;

    const bg = this.add.rectangle(cx, cy, cw, ch, bgColor)
      .setStrokeStyle(2, strColor);

    // Icon
    this.add.text(cx - cw / 2 + 18, cy, UPGRADE_ICONS[iconIdx], {
      fontSize: '20px',
    }).setOrigin(0.5);

    // Name + desc
    const nameKey = UPGRADES[key].levels[0].label_key;
    const descKey = UPGRADES[key].levels[0].bonus_key;
    this.add.text(cx - cw / 2 + 38, cy - ch * 0.25, L[nameKey] || nameKey, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ffffff',
    });
    this.add.text(cx - cw / 2 + 38, cy + 2, L[descKey] || descKey, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#888888',
      wordWrap: { width: cw * 0.55 },
    });

    // Level pips
    for (let lvl = 0; lvl < maxLevel; lvl++) {
      const pip = this.add.rectangle(
        cx + cw / 2 - 30 + lvl * 16, cy + ch * 0.28,
        12, 8,
        lvl < currentLevel ? 0xffd700 : 0x333333
      ).setStrokeStyle(1, 0x555555);
    }

    // Buy / Max button
    if (isMaxed) {
      this.add.text(cx + cw / 2 - 44, cy - ch * 0.2, L.office_maxed, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px', color: '#ffd700',
        backgroundColor: '#222200',
        padding: { x: 6, y: 3 },
      }).setOrigin(0.5);
    } else if (next) {
      const btnW = 70, btnH = 26;
      const btnX = cx + cw / 2 - btnW / 2 - 8;
      const btnY = cy - ch * 0.15;
      const btnC = canAfford ? 0x004400 : 0x440000;
      const btnH2= canAfford ? 0x006600 : 0x660000;

      const btnBg = this.add.rectangle(btnX, btnY, btnW, btnH, btnC)
        .setStrokeStyle(1, canAfford ? 0x44ff88 : 0xff4444)
        .setInteractive();

      const label = `${L.office_buy}\n$${next.cost}`;
      const btnTxt = this.add.text(btnX, btnY, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px', color: canAfford ? '#ffffff' : '#884444',
        align: 'center',
      }).setOrigin(0.5);

      if (canAfford) {
        btnBg.on('pointerover', () => btnBg.setFillStyle(btnH2));
        btnBg.on('pointerout',  () => btnBg.setFillStyle(btnC));
        btnBg.on('pointerdown', () => this.buyUpgrade(key, next.cost));
        btnTxt.setInteractive(); btnTxt.on('pointerdown', () => this.buyUpgrade(key, next.cost));
      }
    }
  }

  buyUpgrade(key, cost) {
    const totalFunds = GameState.velvetBox + GameState.stash;
    if (totalFunds < cost) return;

    // Deduct from velvetBox first, then stash
    if (GameState.velvetBox >= cost) {
      GameState.velvetBox -= cost;
    } else {
      const fromVelvet = GameState.velvetBox;
      GameState.velvetBox = 0;
      GameState.stash -= (cost - fromVelvet);
    }

    GameState.upgrades[key] = (GameState.upgrades[key] || 0) + 1;
    SaveSystem.save();

    // Rebuild UI
    this.scene.restart();
  }

  buildArniePanel(W, H) {
    const line  = getArnieLine(GameState);
    const panW  = W * 0.88;
    const panH  = 60;
    const panY  = H * 0.805;

    PixelUI.panel(this, W / 2, panY, panW, panH, {
      bgColor: 0x06020f, bgAlpha: 0.95,
      borderColor: 0xffd700, cornerSize: 5, depth: 8,
    });

    const avatarX = W / 2 - panW / 2 + 22;
    const ag = this.add.graphics().setDepth(9);
    // Avatar background
    ag.fillStyle(0x1a0a3a);
    ag.fillCircle(avatarX, panY, 16);
    ag.lineStyle(1, 0x6644aa, 0.8);
    ag.strokeCircle(avatarX, panY, 16);
    // Simple face
    ag.fillStyle(0xd4a574);
    ag.fillRect(avatarX - 7, panY - 8, 14, 14);
    ag.fillStyle(0x1a0a00);
    ag.fillRect(avatarX - 7, panY - 12, 14, 5);
    ag.fillStyle(0x222222);
    ag.fillRect(avatarX - 4, panY - 5, 2, 2);
    ag.fillRect(avatarX + 2, panY - 5, 2, 2);
    ag.fillStyle(0x993333);
    ag.fillRect(avatarX - 3, panY + 1, 6, 2);

    const tx = avatarX + 24;
    this.add.text(tx, panY - panH / 2 + 9, 'ARNIE:', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#ffd700',
    }).setDepth(9);
    this.add.text(tx, panY - panH / 2 + 23, line.text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#cccccc',
      wordWrap: { width: panW - 60 }, lineSpacing: 3,
    }).setDepth(9);
  }

  drawOfficeBg(W, H) {
    const g = this.add.graphics();

    // ── 1. WALLS ──────────────────────────────────────────────────────────────
    // Base wall colour — dark reddish-brown (wood panelling)
    g.fillStyle(0x0f0808);
    g.fillRect(0, 0, W, H * 0.75);

    // Vertical wood panel strips
    const panelColors = [0x120a08, 0x0d0606, 0x110908, 0x0e0707, 0x130b09, 0x0c0505];
    const panelWidths = [0.09, 0.11, 0.08, 0.10, 0.12, 0.09, 0.10, 0.08, 0.11, 0.09];
    let px = 0;
    for (let i = 0; i < panelWidths.length; i++) {
      g.fillStyle(panelColors[i % panelColors.length]);
      g.fillRect(px, 0, W * panelWidths[i], H * 0.75);
      px += W * panelWidths[i];
    }

    // Chair rail — horizontal moulding at H*0.45
    g.lineStyle(3, 0x3a1a08);
    g.strokeLineShape(new Phaser.Geom.Line(0, H * 0.45, W, H * 0.45));
    // Thin highlight above and shadow below
    g.lineStyle(1, 0x5a2a10);
    g.strokeLineShape(new Phaser.Geom.Line(0, H * 0.445, W, H * 0.445));
    g.lineStyle(1, 0x1a0804);
    g.strokeLineShape(new Phaser.Geom.Line(0, H * 0.455, W, H * 0.455));

    // Baseboard — dark strip at bottom of wall
    g.fillStyle(0x1a0a06);
    g.fillRect(0, H * 0.73, W, H * 0.02);
    g.lineStyle(1, 0x2a1008);
    g.strokeLineShape(new Phaser.Geom.Line(0, H * 0.73, W, H * 0.73));

    // ── 2. WINDOW ────────────────────────────────────────────────────────────
    const winX = W * 0.08;
    const winY = H * 0.50;
    const winW = W * 0.26;
    const winH = H * 0.22;

    // Night sky fill
    g.fillStyle(0x010510);
    g.fillRect(winX, winY, winW, winH);

    // City glow — faint purple at bottom of window
    g.fillStyle(0x200030);
    g.setBlendMode(Phaser.BlendModes.ADD);
    g.fillRect(winX, winY + winH * 0.55, winW, winH * 0.45);
    g.setBlendMode(Phaser.BlendModes.NORMAL);
    // Re-clip glow (draw translucent rect same region, alpha)
    g.fillStyle(0x200030, 0.4);
    g.fillRect(winX, winY + winH * 0.55, winW, winH * 0.45);

    // City lights — 25 points, varied colour and size
    const lightColors = [0xffd060, 0xff8030, 0xff4040, 0xffffff, 0xaad0ff, 0xffb030, 0xff6060, 0xe0e0ff];
    const lightSizes  = [[1,1],[2,2],[3,2],[2,1],[1,2]];
    // Use a simple seeded-ish sequence so it looks the same every frame
    const seedVals = [17,43,7,61,29,53,11,37,71,19,47,3,59,23,67,13,41,5,31,73,79,2,83,89,97];
    for (let i = 0; i < 25; i++) {
      const sv = seedVals[i];
      const lx = winX + 4 + ((sv * 37) % (winW - 8));
      const ly = winY + 3 + ((sv * 53) % (winH - 6));
      const col = lightColors[sv % lightColors.length];
      const sz  = lightSizes[sv % lightSizes.length];
      const alpha = 0.3 + (sv % 7) * 0.1;
      g.fillStyle(col, alpha);
      g.fillRect(lx, ly, sz[0], sz[1]);
    }

    // Glass reflections — faint diagonal streaks
    g.lineStyle(1, 0xffffff, 0.04);
    g.strokeLineShape(new Phaser.Geom.Line(winX + winW * 0.15, winY + 2, winX + winW * 0.25, winY + winH * 0.4));
    g.strokeLineShape(new Phaser.Geom.Line(winX + winW * 0.60, winY + 4, winX + winW * 0.72, winY + winH * 0.35));

    // Window frame (outer wooden frame)
    g.lineStyle(4, 0x5a3010);
    g.strokeRect(winX, winY, winW, winH);

    // Window glazing bars (cross in the middle)
    g.lineStyle(2, 0x4a2808);
    g.strokeLineShape(new Phaser.Geom.Line(winX, winY + winH * 0.5, winX + winW, winY + winH * 0.5));
    g.strokeLineShape(new Phaser.Geom.Line(winX + winW * 0.5, winY, winX + winW * 0.5, winY + winH));

    // ── 3. WALL SAFE ─────────────────────────────────────────────────────────
    const sfX = W * 0.36;
    const sfY = H * 0.50;
    const sfW = W * 0.14;
    const sfH = H * 0.18;

    // Safe body
    g.fillStyle(0x222222);
    g.fillRect(sfX, sfY, sfW, sfH);

    // Safe door frame
    g.lineStyle(2, 0x333333);
    g.strokeRect(sfX + 3, sfY + 3, sfW - 6, sfH - 6);

    // Horizontal seam (door split)
    g.lineStyle(1, 0x111111);
    g.strokeLineShape(new Phaser.Geom.Line(sfX + 3, sfY + sfH * 0.5, sfX + sfW - 3, sfY + sfH * 0.5));

    // Dial / combination lock — circle
    const dialCX = sfX + sfW * 0.5;
    const dialCY = sfY + sfH * 0.4;
    g.fillStyle(0x444444);
    g.fillCircle(dialCX, dialCY, 10);
    g.lineStyle(1, 0x666666);
    g.strokeCircle(dialCX, dialCY, 10);
    // Dial notch
    g.lineStyle(1, 0x888888);
    g.strokeLineShape(new Phaser.Geom.Line(dialCX, dialCY - 5, dialCX, dialCY - 9));

    // Handle
    g.fillStyle(0x666666);
    g.fillRect(sfX + sfW * 0.65, sfY + sfH * 0.42, 8, 4);

    // ── 4. DESK ───────────────────────────────────────────────────────────────
    // Desk top surface
    g.fillStyle(0x4a2408);
    g.fillRect(0, H * 0.73, W, H * 0.05);

    // Wood grain texture — horizontal strips
    const grainColors = [0x3e1e06, 0x562a0a, 0x3e1e06, 0x4e2208, 0x562a0a];
    for (let i = 0; i < grainColors.length; i++) {
      g.fillStyle(grainColors[i]);
      g.fillRect(0, H * 0.73 + i * (H * 0.01), W, H * 0.009);
    }

    // Front edge highlight
    g.fillStyle(0x6a3010);
    g.fillRect(0, H * 0.73, W, 4);

    // Desk legs (visible at sides)
    g.fillStyle(0x2a1004);
    g.fillRect(0, H * 0.78, W * 0.06, H * 0.22);
    g.fillRect(W * 0.94, H * 0.78, W * 0.06, H * 0.22);

    // ── 5. DESK OBJECTS ───────────────────────────────────────────────────────

    // — Telephone —
    g.fillStyle(0x1a1a1a);
    g.fillRect(W * 0.30, H * 0.695, W * 0.14, H * 0.03);
    // Handset (slightly rotated feel — offset rect on top)
    g.fillStyle(0x2a2a2a);
    g.fillRect(W * 0.29, H * 0.685, W * 0.04, H * 0.015);
    g.fillRect(W * 0.41, H * 0.69,  W * 0.04, H * 0.015);
    // Keypad buttons (3 cols × 2 rows)
    g.fillStyle(0x3a3a3a);
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        g.fillRect(
          W * 0.33 + col * (W * 0.033),
          H * 0.698 + row * (H * 0.012),
          W * 0.022, H * 0.009
        );
      }
    }

    // — Ashtray —
    g.fillStyle(0x222222);
    g.fillCircle(W * 0.55, H * 0.722, 8);
    g.lineStyle(1, 0x555555);
    g.strokeCircle(W * 0.55, H * 0.722, 8);
    // Cigarette butt hint
    g.fillStyle(0xaa8866);
    g.fillRect(W * 0.547, H * 0.718, 5, 2);

    // — Whiskey glass —
    g.fillStyle(0x3a2a10);
    g.fillRect(W * 0.62, H * 0.695, W * 0.05, H * 0.033);
    // Amber liquid inside
    g.fillStyle(0x8a4a10, 0.7);
    g.fillRect(W * 0.621, H * 0.708, W * 0.048, H * 0.018);
    // Glass rim highlight
    g.lineStyle(1, 0x6a5a30);
    g.strokeRect(W * 0.62, H * 0.695, W * 0.05, H * 0.033);

    // — Papers / documents stack —
    // Bottom sheet (slightly offset)
    g.fillStyle(0xd8c8a0);
    g.fillRect(W * 0.695, H * 0.700, W * 0.12, H * 0.03);
    // Middle sheet
    g.fillStyle(0xddd0aa);
    g.fillRect(W * 0.69, H * 0.697, W * 0.12, H * 0.03);
    // Top sheet
    g.fillStyle(0xe8dab8);
    g.fillRect(W * 0.685, H * 0.694, W * 0.12, H * 0.03);
    // Lines of text on top sheet
    g.lineStyle(1, 0xaaa090);
    for (let li = 0; li < 4; li++) {
      g.strokeLineShape(new Phaser.Geom.Line(
        W * 0.69, H * 0.698 + li * (H * 0.006),
        W * 0.79, H * 0.698 + li * (H * 0.006)
      ));
    }

    // ── 6. FILING CABINET ────────────────────────────────────────────────────
    const fcX = W * 0.74;
    const fcY = H * 0.53;
    const fcW = W * 0.21;
    const fcH = H * 0.20;

    // Cabinet body
    g.fillStyle(0x1e1e2e);
    g.fillRect(fcX, fcY, fcW, fcH);

    // Top label plate
    g.fillStyle(0x4a4a5a);
    g.fillRect(fcX + fcW * 0.2, fcY + 3, fcW * 0.6, fcH * 0.07);

    // 4 drawer sections
    const drawerH = fcH * 0.22;
    for (let d = 0; d < 4; d++) {
      const dy = fcY + fcH * 0.1 + d * (fcH * 0.225);
      // Drawer face
      g.fillStyle(0x242436);
      g.fillRect(fcX + 3, dy, fcW - 6, drawerH);
      // Drawer border / chrome moulding
      g.lineStyle(1, 0x3a3a50);
      g.strokeRect(fcX + 3, dy, fcW - 6, drawerH);
      // Chrome strip between drawers
      g.lineStyle(1, 0x4a4a60);
      g.strokeLineShape(new Phaser.Geom.Line(fcX, dy + drawerH, fcX + fcW, dy + drawerH));
      // Drawer handle — small centred rect
      g.fillStyle(0x3a3a4a);
      g.fillRect(fcX + fcW * 0.35, dy + drawerH * 0.38, fcW * 0.3, drawerH * 0.25);
      g.lineStyle(1, 0x5a5a6a);
      g.strokeRect(fcX + fcW * 0.35, dy + drawerH * 0.38, fcW * 0.3, drawerH * 0.25);
    }

    // Cabinet outer border
    g.lineStyle(1, 0x2e2e40);
    g.strokeRect(fcX, fcY, fcW, fcH);

    // ── 7. POSTER ON WALL ────────────────────────────────────────────────────
    const postX = W * 0.52;
    const postY = H * 0.52;
    const postW = W * 0.18;
    const postH = H * 0.16;

    g.fillStyle(0x1a0030);
    g.fillRect(postX, postY, postW, postH);

    // Coloured band stripes (concert poster feel)
    const bandColors = [0x8800aa, 0xdd0044, 0xff6600, 0xffcc00, 0x0044cc];
    for (let b = 0; b < bandColors.length; b++) {
      g.fillStyle(bandColors[b], 0.6);
      g.fillRect(postX + 4, postY + 4 + b * (postH * 0.16), postW - 8, postH * 0.12);
    }

    // Poster frame
    g.lineStyle(2, 0x4a2060);
    g.strokeRect(postX, postY, postW, postH);
    g.lineStyle(1, 0x6a30a0);
    g.strokeRect(postX + 2, postY + 2, postW - 4, postH - 4);
  }

  makeBtn(cx, cy, bw, bh, label, cn, ch, cb) {
    const bg = this.add.rectangle(cx, cy, bw, bh, cn).setStrokeStyle(2, GOLD).setInteractive();
    const txt = this.add.text(cx, cy, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5);
    bg.on('pointerover', () => { bg.setFillStyle(ch); txt.setColor('#ffd700'); });
    bg.on('pointerout',  () => { bg.setFillStyle(cn); txt.setColor('#ffffff'); });
    bg.on('pointerdown', cb);
    txt.setInteractive(); txt.on('pointerdown', cb);
  }
}
