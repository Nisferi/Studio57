import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { SaveSystem } from '../SaveSystem.js';
import { LOCALES } from '../data/locales.js';
import { UPGRADES, getUpgradeNextLevel } from '../data/upgrades.js';
import { getArnieLine } from '../data/arnie_lines.js';

const DARK = 0x020008;
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
    this.add.rectangle(0, 0, W, H, 0x0a0018).setOrigin(0);
    this.drawOfficeBg(W, H);

    // Title
    this.add.text(W / 2, H * 0.06, L.office_title, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.12, L.office_sub, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#888888',
    }).setOrigin(0.5);

    // Funds display
    const funds = GameState.velvetBox + GameState.stash;
    this.fundsText = this.add.text(W / 2, H * 0.18, `${L.office_funds}: $${funds}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px', color: '#40ff80',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    // Upgrade cards
    const cardH   = (H * 0.52) / UPGRADE_KEYS.length;
    const cardW   = Math.min(W * 0.90, 340);
    const startY  = H * 0.23;

    UPGRADE_KEYS.forEach((key, i) => {
      this.buildUpgradeCard(W / 2, startY + i * cardH + cardH / 2, cardW, cardH - 8, key, i, L);
    });

    // Arnie dialogue panel
    this.buildArniePanel(W, H);

    // OPEN TONIGHT button
    this.makeBtn(W / 2, H * 0.92, 200, 46, L.office_open, 0x006620, 0x009940, () => {
      GameState.resetNightStats();
      SaveSystem.save();
      this.scene.start('Street');
    });

    // Back to menu
    this.add.text(W * 0.08, H * 0.03, '←', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px', color: '#888888',
      backgroundColor: '#111111',
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
    const line   = getArnieLine(GameState);
    const panW   = W * 0.88;
    const panH   = 66;
    const panY   = H * 0.80;

    const bg = this.add.rectangle(W / 2, panY, panW, panH, 0x0d0820)
      .setStrokeStyle(1, 0x332266);

    // Small avatar circle
    const avatarX = W / 2 - panW / 2 + 20;
    const g = this.add.graphics();
    g.fillStyle(0x3a2a6a);
    g.fillCircle(avatarX, panY, 14);
    g.lineStyle(1, 0x6644aa);
    g.strokeCircle(avatarX, panY, 14);
    // Eyes
    g.fillStyle(0xffffff);
    g.fillCircle(avatarX - 4, panY - 2, 2);
    g.fillCircle(avatarX + 4, panY - 2, 2);

    this.add.text(avatarX + 24, panY - panH / 2 + 8, 'ARNIE:', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#aa88ff',
    });

    this.add.text(avatarX + 24, panY - panH / 2 + 22, line.text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#cccccc',
      wordWrap: { width: panW - avatarX - 20 },
    });
  }

  drawOfficeBg(W, H) {
    const g = this.add.graphics();
    // Desk
    g.fillStyle(0x3a1a00);
    g.fillRect(0, H * 0.75, W, H * 0.15);
    // Desk surface line
    g.lineStyle(2, 0x5a2a00);
    g.strokeLineShape(new Phaser.Geom.Line(0, H * 0.75, W, H * 0.75));
    // Filing cabinet
    g.fillStyle(0x1a1a2a);
    g.fillRect(W * 0.75, H * 0.55, W * 0.2, H * 0.2);
    g.lineStyle(1, 0x333355);
    for (let i = 1; i <= 3; i++) g.strokeLineShape(
      new Phaser.Geom.Line(W * 0.75, H * (0.55 + i * 0.05), W * 0.95, H * (0.55 + i * 0.05))
    );
    // Window (night outside)
    g.fillStyle(0x020008);
    g.fillRect(W * 0.04, H * 0.55, W * 0.25, H * 0.18);
    g.lineStyle(2, 0x4a3a00);
    g.strokeRect(W * 0.04, H * 0.55, W * 0.25, H * 0.18);
    // City lights outside window
    for (let i = 0; i < 15; i++) {
      g.fillStyle(Math.random() > 0.5 ? 0xffd060 : 0xff6040, Math.random() * 0.8 + 0.2);
      g.fillRect(
        W * 0.05 + Phaser.Math.Between(0, W * 0.22),
        H * 0.56 + Phaser.Math.Between(0, H * 0.14),
        3, 3
      );
    }
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
