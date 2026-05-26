import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { SaveSystem } from '../SaveSystem.js';
import { LOCALES } from '../data/locales.js';

const DARK = 0x020008;
const GOLD = 0xffd700;

export class EndNightScene extends Phaser.Scene {
  constructor() { super({ key: 'EndNight' }); }

  create() {
    const { width: W, height: H } = this.scale;
    const L = LOCALES[GameState.lang];

    // ── Calculate financials ──
    const revenue   = GameState.velvetBox;
    const taxRate   = 0.30;
    const tax       = Math.round(revenue * taxRate);
    const net       = revenue - tax;

    // Apply results to GameState
    GameState.velvetBox   = net;
    GameState.totalEarned = (GameState.totalEarned || 0) + net;
    GameState.totalTaxPaid = (GameState.totalTaxPaid || 0) + tax;
    GameState.reputation   = Math.min(100, (GameState.reputation || 50) + 3);

    // Upgrade reputation from lights
    if (GameState.upgrades.lights > 0) {
      const bonus = [5, 12, 20][GameState.upgrades.lights - 1] || 0;
      GameState.reputation = Math.min(100, GameState.reputation + bonus);
    }

    // Check bankruptcy
    const totalFunds = GameState.velvetBox + GameState.stash;
    const bankrupt   = totalFunds <= 0 && net <= 0;

    if (!bankrupt) {
      GameState.nightNumber++;
      GameState.totalNights++;
    } else {
      GameState.bankrupt = true;
    }

    SaveSystem.save();

    // ── UI ──
    this.add.rectangle(0, 0, W, H, DARK).setOrigin(0);
    this.drawStars(W, H);

    this.add.text(W / 2, H * 0.07, L.end_title, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    const panelW = Math.min(W * 0.86, 310);
    const panelY = H * 0.20;
    this.add.rectangle(W / 2, panelY + 130, panelW, 270, 0x0a0018)
      .setStrokeStyle(2, 0x8844ff).setOrigin(0.5, 0);

    const rows = [
      { label: L.end_revenue, value: `$${revenue}`,  color: '#40ff80' },
      { label: L.end_tax,     value: `-$${tax}`,     color: '#ff4040' },
      { label: '─────────────────', value: '',        color: '#444444' },
      { label: L.end_net,     value: `$${net}`,      color: net >= 0 ? '#40ff80' : '#ff4040' },
      { label: '',            value: '',              color: '#444444' },
      { label: L.end_stash_total, value: `$${GameState.stash}`, color: '#ff8800' },
    ];

    rows.forEach((row, i) => {
      const ry = panelY + 145 + i * 36;
      this.add.text(W * 0.15, ry, row.label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px', color: '#aaaaaa',
        wordWrap: { width: W * 0.5 },
      });
      if (row.value) {
        this.add.text(W * 0.85, ry, row.value, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '9px', color: row.color,
        }).setOrigin(1, 0);
      }
    });

    // Night stats
    const ns = GameState.nightStats;
    const statsY = panelY + 360;
    const statStr = [
      `✓ ${ns.approved}   ✗ ${ns.rejected}   ⚡ ${ns.fights}`,
      ns.celebsHosted.length ? `★ VIP: ${ns.celebsHosted.length}` : '',
    ].filter(Boolean).join('   ');
    this.add.text(W / 2, statsY, statStr, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#888888',
    }).setOrigin(0.5);

    // FBI suspicion warning
    if (GameState.fbiSuspicion >= 50) {
      const warnColor = GameState.fbiSuspicion >= 80 ? '#ff0000' : '#ff8800';
      this.add.text(W / 2, statsY + 26, `⚠ FBI: ${Math.round(GameState.fbiSuspicion)}%`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px', color: warnColor,
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5);
    }

    if (bankrupt) {
      // Bankruptcy screen
      this.add.text(W / 2, H * 0.78, L.end_bankrupt, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px', color: '#ff0000',
        stroke: '#330000', strokeThickness: 3,
      }).setOrigin(0.5);

      this.makeBtn(W / 2, H * 0.88, 180, 42, L.go_restart, 0x440000, 0x660000, () => {
        GameState.reset();
        SaveSystem.save();
        this.scene.start('Menu');
      });
    } else {
      this.makeBtn(W / 2, H * 0.86, 200, 48, L.end_continue, 0x004422, 0x006633, () => {
        this.scene.start('Office');
      });
    }
  }

  makeBtn(cx, cy, bw, bh, label, cn, ch, cb) {
    const bg = this.add.rectangle(cx, cy, bw, bh, cn)
      .setStrokeStyle(2, GOLD).setInteractive();
    const txt = this.add.text(cx, cy, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5);
    bg.on('pointerover', () => { bg.setFillStyle(ch); txt.setColor('#ffd700'); });
    bg.on('pointerout',  () => { bg.setFillStyle(cn); txt.setColor('#ffffff'); });
    bg.on('pointerdown', cb);
    txt.setInteractive(); txt.on('pointerdown', cb);
  }

  drawStars(W, H) {
    const g = this.add.graphics();
    for (let i = 0; i < 40; i++) {
      g.fillStyle(0xffffff, Math.random() * 0.4 + 0.1);
      g.fillRect(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H * 0.3), 2, 2);
    }
  }
}
