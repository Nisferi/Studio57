import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { SaveSystem } from '../SaveSystem.js';
import { LOCALES } from '../data/locales.js';
import { EconomySystem } from '../systems/EconomySystem.js';
import { REP_NIGHT_END, REP_LIGHTS_BONUS } from '../data/tuning.js';
import { PixelUI } from '../systems/PixelUI.js';

const DARK = 0x0e0840;
const GOLD = 0xffd700;

export class EndNightScene extends Phaser.Scene {
  constructor() { super({ key: 'EndNight' }); }

  create() {
    const { width: W, height: H } = this.scale;
    const L = LOCALES[GameState.lang];

    // ── Calculate financials ──────────────────────────────────────────────
    const revenue = GameState.nightEarnings || 0;
    const { tax, net } = EconomySystem.calcTax(revenue);

    GameState.velvetBox     = (GameState.velvetBox || 0) + net;
    GameState.nightEarnings = 0;
    GameState.totalEarned   = (GameState.totalEarned || 0) + net;
    GameState.totalTaxPaid  = (GameState.totalTaxPaid || 0) + tax;
    GameState.reputation    = Math.min(100, (GameState.reputation || 50) + REP_NIGHT_END);

    if (GameState.upgrades?.lights > 0) {
      const bonus = REP_LIGHTS_BONUS[GameState.upgrades.lights - 1] || 0;
      GameState.reputation = Math.min(100, GameState.reputation + bonus);
    }

    const totalFunds = GameState.velvetBox + GameState.stash;
    const bankrupt   = totalFunds <= 0 && net <= 0;
    const nightJustEnded = GameState.nightNumber;

    // Save recap before incrementing night number
    const nsSnap = GameState.nightStats || {};
    GameState.lastNight = {
      nightNumber: nightJustEnded,
      approved:    nsSnap.approved || 0,
      rejected:    nsSnap.rejected || 0,
      fights:      nsSnap.fights || 0,
      celebsHosted: [...(nsSnap.celebsHosted || [])],
      netEarned:   net,
    };

    if (!bankrupt) {
      GameState.nightNumber++;
      GameState.totalNights++;
    } else {
      GameState.bankrupt = true;
    }

    SaveSystem.save();

    // ── Background ────────────────────────────────────────────────────────
    this.add.rectangle(0, 0, W, H, DARK).setOrigin(0);
    this.drawStarfield(W, H);

    // Scanline overlay (subtle CRT feel)
    const scanG = this.add.graphics().setDepth(60).setAlpha(0.05);
    for (let sy = 0; sy < H; sy += 4) {
      scanG.fillStyle(0x000000);
      scanG.fillRect(0, sy, W, 2);
    }

    // ── Title ─────────────────────────────────────────────────────────────
    const titleY = H * 0.075;
    PixelUI.neonText(this, W / 2, titleY, L.end_title, '13px', '#ffd700', {
      depth: 5, glowLayers: [12, 6, 2], glowAlphas: [0.10, 0.22, 0.42],
    });

    // Night badge pill — wider with glow (#42)
    const badgeG = this.add.graphics().setDepth(6);
    badgeG.fillStyle(0xffd700, 0.12);
    badgeG.fillRoundedRect(W / 2 - 60, titleY + 14, 120, 22, 7);
    badgeG.fillStyle(0x1a0044, 0.96);
    badgeG.fillRoundedRect(W / 2 - 58, titleY + 15, 116, 20, 6);
    badgeG.lineStyle(2, GOLD, 0.80);
    badgeG.strokeRoundedRect(W / 2 - 58, titleY + 15, 116, 20, 6);
    this.add.text(W / 2, titleY + 25, `NIGHT  ${nightJustEnded}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(7);

    // ── Stats panel ───────────────────────────────────────────────────────
    const panelW = Math.min(W * 0.88, 320);
    const panelH = 248;
    const panelCX = W / 2;
    const panelCY = H * 0.50;

    PixelUI.panel(this, panelCX, panelCY, panelW, panelH, {
      bgColor: 0x180e50, bgAlpha: 0.96,
      borderColor: 0xcc88ff, cornerSize: 7, depth: 4,
    });

    // Panel header
    this.add.text(panelCX, panelCY - panelH / 2 + 14, '── FINANCIAL REPORT ──', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#8855cc',
    }).setOrigin(0.5).setDepth(5);

    // Thin separator under header
    const sepG = this.add.graphics().setDepth(5);
    sepG.lineStyle(1, 0x7722aa, 0.6);
    sepG.strokeLineShape(new Phaser.Geom.Line(
      panelCX - panelW / 2 + 10, panelCY - panelH / 2 + 24,
      panelCX + panelW / 2 - 10, panelCY - panelH / 2 + 24,
    ));

    const rows = [
      { label: L.end_revenue,     value: `$${revenue.toLocaleString()}`,         color: '#40ff80' },
      { label: L.end_tax,         value: `-$${tax.toLocaleString()}`,             color: '#ff4040' },
      { label: '─────────────',   value: '',                                      color: '#331155' },
      { label: L.end_net,         value: `$${net.toLocaleString()}`,              color: net >= 0 ? '#40ff80' : '#ff4040' },
      { label: '',                value: '',                                      color: '' },
      { label: L.end_stash_total, value: `$${GameState.stash.toLocaleString()}`,  color: '#ff8800' },
    ];

    const lx    = panelCX - panelW / 2 + 14;
    const rx    = panelCX + panelW / 2 - 14;
    const rowY0 = panelCY - panelH / 2 + 34;

    rows.forEach((row, i) => {
      const ry = rowY0 + i * 33;
      if (row.label) {
        this.add.text(lx, ry, row.label, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '7px', color: '#aaaaaa',
          wordWrap: { width: panelW * 0.56 },
        }).setDepth(5);
      }
      if (row.value) {
        const vt = this.add.text(rx, ry, row.value, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px', color: row.color,
          stroke: '#000000', strokeThickness: 1,
        }).setOrigin(1, 0).setDepth(5);

        // Pop-in tween on net row
        if (i === 3) {
          vt.setScale(0.6);
          this.tweens.add({ targets: vt, scaleX: 1, scaleY: 1, duration: 250, ease: 'Back.Out', delay: 300 });
        }
      }
    });

    // ── Night stat badges ─────────────────────────────────────────────────
    const ns     = GameState.nightStats || { approved: 0, rejected: 0, fights: 0, celebsHosted: [] };
    const statsY = panelCY + panelH / 2 + 22;
    const badges = [
      { icon: '✓', val: ns.approved,                     color: '#44ff88', label: 'IN',    border: 0x22aa55 },
      { icon: '✗', val: ns.rejected,                     color: '#ff4444', label: 'OUT',   border: 0xaa2222 },
      { icon: '⚡', val: ns.fights,                       color: '#ffaa00', label: 'FIGHT', border: 0xaa6600 },
      { icon: '★', val: (ns.celebsHosted || []).length,  color: '#ffd700', label: 'VIP',   border: 0xaa8800 },
    ];
    const badgeW = Math.floor(panelW / 4) - 6;
    badges.forEach((b, i) => {
      const bx = panelCX - panelW / 2 + 14 + i * (panelW / 4);
      const badBg = this.add.graphics().setDepth(5);
      badBg.fillStyle(0x180a40, 0.92);
      badBg.fillRoundedRect(bx, statsY - 10, badgeW, 28, 4);
      badBg.lineStyle(2, b.border, 0.90);
      badBg.strokeRoundedRect(bx, statsY - 10, badgeW, 28, 4);
      this.add.text(bx + badgeW / 2, statsY - 2, `${b.icon} ${b.val}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px', color: b.color,
      }).setOrigin(0.5, 0).setDepth(6);
      this.add.text(bx + badgeW / 2, statsY + 10, b.label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '5px', color: '#555577',
      }).setOrigin(0.5, 0).setDepth(6);
    });

    // ── FBI warning ───────────────────────────────────────────────────────
    if (GameState.fbiSuspicion >= 50) {
      const warnColor = GameState.fbiSuspicion >= 80 ? '#ff2222' : '#ff8800';
      const warnY = statsY + 44;
      const warnG = this.add.graphics().setDepth(5);
      warnG.fillStyle(0x200000, 0.90);
      warnG.fillRect(panelCX - panelW / 2 + 2, warnY, panelW - 4, 20);
      warnG.lineStyle(1, 0xff2200, 0.55);
      warnG.strokeRect(panelCX - panelW / 2 + 2, warnY, panelW - 4, 20);
      this.add.text(W / 2, warnY + 10, `⚠ FBI: ${Math.round(GameState.fbiSuspicion)}%`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px', color: warnColor,
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(6);
    }

    // ── Bankrupt / Continue ───────────────────────────────────────────────
    if (bankrupt) {
      PixelUI.neonText(this, W / 2, H * 0.83, L.end_bankrupt, '12px', '#ff0000', { depth: 8 });
      const { bg } = PixelUI.button(this, W / 2, H * 0.918, 180, 42, L.go_restart, {
        baseColor: 0x440000, hoverColor: 0x660000, borderColor: 0xff2200,
        fontSize: '8px', depth: 20,
      });
      bg.on('pointerdown', () => { GameState.reset(); SaveSystem.save(); this.scene.start('Menu'); });
    } else {
      const { bg } = PixelUI.button(this, W / 2, H * 0.918, 210, 48, L.end_continue, {
        baseColor: 0x004422, hoverColor: 0x006633, borderColor: 0x44ff88,
        fontSize: '9px', depth: 20,
      });
      bg.on('pointerdown', () => {
        if (nightJustEnded >= 15) {
          this.scene.start('Ending');
        } else {
          this.scene.start('Office');
        }
      });
    }

    this.cameras.main.fadeIn(400, 2, 0, 8);
  }

  drawStarfield(W, H) {
    // More stars + cross sparkle on large ones (#39, #40)
    const g = this.add.graphics();
    for (let i = 0; i < 85; i++) {
      const sx  = Phaser.Math.Between(0, W);
      const sy  = Phaser.Math.Between(0, H * 0.42);
      const big = Math.random() > 0.76;
      const a   = Math.random() * 0.62 + 0.18;
      const t   = Math.random();
      const col = t > 0.72 ? 0xaaceff : t > 0.50 ? 0xfff6cc : 0xffffff;
      g.fillStyle(col, a);
      g.fillRect(sx, sy, big ? 2 : 1, big ? 2 : 1);
      if (big && Math.random() > 0.55) {
        g.fillStyle(col, a * 0.30);
        g.fillRect(sx - 3, sy, 8, 1);
        g.fillRect(sx, sy - 3, 2, 8);
      }
    }

    // Animated falling star (#41)
    const launchStar = () => {
      const sx = Phaser.Math.Between(W * 0.1, W * 0.8);
      const sg = this.add.graphics().setDepth(2);
      sg.lineStyle(1, 0xffffff, 0.85);
      sg.strokeLineShape(new Phaser.Geom.Line(sx, 0, sx + 18, 10));
      sg.lineStyle(1, 0xffd700, 0.30);
      sg.strokeLineShape(new Phaser.Geom.Line(sx - 5, -3, sx + 18, 10));
      this.tweens.add({
        targets: sg, x: W * 0.35, y: H * 0.18, alpha: 0,
        duration: 800, ease: 'Quad.Out',
        onComplete: () => {
          sg.destroy();
          if (this.scene.isActive('EndNight')) {
            this.time.delayedCall(Phaser.Math.Between(4000, 9000), launchStar);
          }
        },
      });
    };
    this.time.delayedCall(Phaser.Math.Between(1500, 4000), launchStar);
  }
}
