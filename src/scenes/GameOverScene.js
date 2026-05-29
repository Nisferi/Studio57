import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { SaveSystem } from '../SaveSystem.js';
import { LOCALES } from '../data/locales.js';
import { PixelUI } from '../systems/PixelUI.js';

export class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOver' }); }

  init(data) {
    this.reason = data?.reason || 'bankrupt';
    this._strobeTimer = null;
  }

  create() {
    const { width: W, height: H } = this.scale;
    const L = LOCALES[GameState.lang];
    const isFBI = this.reason === 'fbi';

    // ── Background ──────────────────────────────────────────────────────────
    this.bgLeft  = this.add.rectangle(0, 0, W / 2, H, isFBI ? 0x0a0030 : 0x050000).setOrigin(0).setDepth(0);
    this.bgRight = this.add.rectangle(W / 2, 0, W / 2, H, isFBI ? 0x050000 : 0x050000).setOrigin(0).setDepth(0);

    if (isFBI) {
      this.startStrobeEffect(W, H);
    } else {
      // Bankrupt — dark red fade across screen
      const fadeG = this.add.graphics().setDepth(1);
      fadeG.fillStyle(0x1a0000, 0.6);
      fadeG.fillRect(0, 0, W, H);
    }

    // Scanlines
    const scanG = this.add.graphics().setDepth(60).setAlpha(0.07);
    for (let sy = 0; sy < H; sy += 4) {
      scanG.fillStyle(0x000000);
      scanG.fillRect(0, sy, W, 2);
    }

    // ── Scene silhouettes ───────────────────────────────────────────────────
    this.drawSceneArt(W, H, isFBI);

    // ── Title ───────────────────────────────────────────────────────────────
    const titleStr  = isFBI ? L.go_busted   : L.go_bankrupt;
    const titleColor = isFBI ? '#ff2020'    : '#ff8800';

    const titleTxt = this.add.text(W / 2, H * 0.14, titleStr, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px', color: titleColor,
      stroke: '#000000', strokeThickness: 4,
      shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: titleTxt, alpha: { from: 1, to: 0.4 },
      duration: 500, yoyo: true, repeat: -1, ease: 'Sine.InOut',
    });

    // Sub-text
    const subStr = isFBI ? L.go_fbi_text : L.go_bank_text;
    this.add.text(W / 2, H * 0.225, subStr, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#cc8888',
      wordWrap: { width: W * 0.82 }, align: 'center', lineSpacing: 6,
    }).setOrigin(0.5).setDepth(20);

    // ── Stats panel ─────────────────────────────────────────────────────────
    const panelW = Math.min(W * 0.88, 310);
    const panelH = 148;
    const panelCX = W / 2;
    const panelCY = H * 0.53;

    PixelUI.panel(this, panelCX, panelCY, panelW, panelH, {
      bgColor: 0x160004, bgAlpha: 0.95,
      borderColor: isFBI ? 0xff3322 : 0x884400,
      cornerSize: 7, depth: 18,
    });

    this.add.text(panelCX, panelCY - panelH / 2 + 14, '── FINAL REPORT ──', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: isFBI ? '#993322' : '#664400',
    }).setOrigin(0.5).setDepth(19);

    const lx   = panelCX - panelW / 2 + 14;
    const rx   = panelCX + panelW / 2 - 14;
    const rows = [
      { label: L.go_score,      value: `${GameState.totalNights}`,           color: '#ffd700' },
      { label: L.end_stash_total, value: `$${(GameState.stash || 0).toLocaleString()}`, color: '#ff8800' },
      { label: 'Total earned',  value: `$${(GameState.totalEarned || 0).toLocaleString()}`, color: '#aaaaaa' },
      { label: 'FBI level',     value: `${Math.round(GameState.fbiSuspicion || 0)}%`,       color: '#ff4444' },
    ];
    rows.forEach((row, i) => {
      const ry = panelCY - panelH / 2 + 34 + i * 26;
      this.add.text(lx, ry, row.label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px', color: '#888888',
      }).setDepth(19);
      this.add.text(rx, ry, row.value, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px', color: row.color,
        stroke: '#000000', strokeThickness: 1,
      }).setOrigin(1, 0).setDepth(19);
    });

    // ── Buttons ─────────────────────────────────────────────────────────────
    const doRestart = () => {
      this.stopStrobe();
      GameState.reset();
      SaveSystem.clear();
      this.scene.start('Menu');
    };

    const { bg: restartBg } = PixelUI.button(this, W / 2, H * 0.77, 210, 46, L.go_restart, {
      baseColor: 0x440000, hoverColor: 0x770000, borderColor: 0xff3333,
      fontSize: '9px', depth: 25,
    });
    restartBg.on('pointerdown', doRestart);

    // Fade in
    this.cameras.main.fadeIn(600, 0, 0, 0);
  }

  drawSceneArt(W, H, isFBI) {
    const g = this.add.graphics().setDepth(3);

    // Floor
    g.fillStyle(0x0a0004);
    g.fillRect(0, H * 0.72, W, H * 0.28);

    // Wall
    g.fillStyle(0x080002);
    g.fillRect(0, 0, W, H * 0.72);

    if (isFBI) {
      // ── FBI raid scene ──────────────────────────────────────────────────
      // Door frame in background
      g.fillStyle(0x1a0010);
      g.fillRect(W * 0.36, H * 0.40, W * 0.28, H * 0.32);
      g.lineStyle(2, 0x440022);
      g.strokeRect(W * 0.36, H * 0.40, W * 0.28, H * 0.32);

      // 3 agent silhouettes
      const agents = [{ x: W * 0.22, scale: 0.90 }, { x: W * 0.50, scale: 1.0 }, { x: W * 0.78, scale: 0.88 }];
      agents.forEach(({ x, scale }) => {
        const ay = H * 0.73;
        const sh = 54 * scale;
        const sw = 14 * scale;
        // Body
        g.fillStyle(0x111111);
        g.fillRect(x - sw / 2, ay - sh, sw, sh * 0.72);
        // Head
        g.fillRect(x - sw * 0.44, ay - sh - sw * 0.9, sw * 0.88, sw * 0.9);
        // Hat
        g.fillRect(x - sw * 0.55, ay - sh - sw * 1.18, sw * 1.1, sw * 0.30);
        // Gun arm
        g.fillRect(x + sw * 0.5, ay - sh * 0.55, sw * 0.9, 4);
        // Legs
        g.fillRect(x - sw * 0.38, ay - sh * 0.28, sw * 0.34, sh * 0.28);
        g.fillRect(x + sw * 0.04, ay - sh * 0.28, sw * 0.34, sh * 0.28);
      });

      // Flashlight cones from sides
      g.fillStyle(0xffffff, 0.05);
      g.fillTriangle(W * 0.05, H * 0.68, W * 0.40, H * 0.22, W * 0.55, H * 0.48);
      g.fillTriangle(W * 0.95, H * 0.68, W * 0.60, H * 0.22, W * 0.45, H * 0.48);

    } else {
      // ── Bankrupt scene: empty dance floor, overturned cash ──────────────
      // Stage/dance floor perspective
      g.fillStyle(0x0e0008);
      g.fillRect(W * 0.05, H * 0.55, W * 0.90, 3);

      // Empty bar silhouette
      g.fillStyle(0x0c0005);
      g.fillRect(W * 0.58, H * 0.44, W * 0.38, H * 0.12);
      g.fillRect(W * 0.60, H * 0.56, W * 0.35, H * 0.16);

      // Scattered money bills on the floor
      const bills = [[W * 0.15, H * 0.76], [W * 0.35, H * 0.80], [W * 0.55, H * 0.75], [W * 0.72, H * 0.82]];
      bills.forEach(([bx, by]) => {
        g.fillStyle(0x226600, 0.6);
        g.fillRect(bx, by, 16, 8);
        g.lineStyle(1, 0x33aa00, 0.4);
        g.strokeRect(bx, by, 16, 8);
      });

      // Lone person silhouette (dejected pose)
      const px = W * 0.50, py = H * 0.73;
      g.fillStyle(0x111111);
      g.fillRect(px - 7, py - 44, 14, 30);  // body
      g.fillRect(px - 5, py - 62, 10, 16);  // head
      // slumped arm
      g.fillRect(px - 18, py - 30, 12, 5);
      g.fillRect(px - 18, py - 25, 5, 12);
      // legs bent (sitting)
      g.fillRect(px - 8, py - 14, 7, 14);
      g.fillRect(px + 1,  py - 14, 7, 14);
    }
  }

  startStrobeEffect(W, H) {
    let frame = 0;
    this._strobeTimer = this.time.addEvent({
      delay: 180,
      loop: true,
      callback: () => {
        frame++;
        const isBlue = frame % 2 === 0;
        this.bgLeft.setFillStyle(isBlue ? 0x000080 : 0x040000, 1);
        this.bgRight.setFillStyle(isBlue ? 0x040000 : 0x800000, 1);
        this.cameras.main.setBackgroundColor(isBlue ? '#000050' : '#060000');
      },
    });
  }

  stopStrobe() {
    if (this._strobeTimer) {
      this._strobeTimer.remove();
      this._strobeTimer = null;
    }
  }

  shutdown() {
    this.stopStrobe();
  }
}
