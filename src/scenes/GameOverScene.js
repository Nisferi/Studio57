import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { SaveSystem } from '../SaveSystem.js';
import { LOCALES } from '../data/locales.js';

export class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOver' }); }

  init(data) {
    this.reason = data?.reason || 'bankrupt'; // 'fbi' | 'bankrupt'
  }

  create() {
    const { width: W, height: H } = this.scale;
    const L = LOCALES[GameState.lang];

    // Dark blood-red background
    this.add.rectangle(0, 0, W, H, 0x050000).setOrigin(0);
    this.drawRaidScene(W, H);

    const title = this.reason === 'fbi' ? L.go_busted : L.go_bankrupt;
    const sub   = this.reason === 'fbi' ? L.go_fbi_text : L.go_bank_text;

    // Flash animation on title
    const titleTxt = this.add.text(W / 2, H * 0.22, title, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px', color: '#ff0000',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: titleTxt, alpha: { from: 1, to: 0.3 },
      duration: 600, yoyo: true, repeat: -1,
    });

    this.add.text(W / 2, H * 0.35, sub, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#ff8888',
      wordWrap: { width: W * 0.8 }, align: 'center',
    }).setOrigin(0.5);

    // Score
    this.add.text(W / 2, H * 0.47, `${L.go_score}: ${GameState.totalNights}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px', color: '#ffd700',
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.55, `Total earned: $${GameState.totalEarned || 0}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#888888',
    }).setOrigin(0.5);

    // Restart button
    const bg = this.add.rectangle(W / 2, H * 0.70, 200, 48, 0x440000)
      .setStrokeStyle(2, 0xff4444).setInteractive();
    const txt = this.add.text(W / 2, H * 0.70, L.go_restart, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5);
    bg.on('pointerover', () => { bg.setFillStyle(0x660000); txt.setColor('#ff4444'); });
    bg.on('pointerout',  () => { bg.setFillStyle(0x440000); txt.setColor('#ffffff'); });
    bg.on('pointerdown', () => {
      GameState.reset();
      SaveSystem.clear();
      this.scene.start('Menu');
    });
    txt.setInteractive(); txt.on('pointerdown', () => {
      GameState.reset();
      SaveSystem.clear();
      this.scene.start('Menu');
    });
  }

  drawRaidScene(W, H) {
    const g = this.add.graphics();
    // Police lights (strobe effect)
    g.fillStyle(0x000044, 0.5);
    g.fillRect(0, 0, W / 2, H);
    g.fillStyle(0x440000, 0.5);
    g.fillRect(W / 2, 0, W / 2, H);

    // FBI agents silhouettes
    for (let i = 0; i < 3; i++) {
      const ax = W * (0.2 + i * 0.3);
      const ay = H * 0.8;
      g.fillStyle(0x111111);
      // Body
      g.fillRect(ax - 8, ay - 50, 16, 40);
      // Head
      g.fillRect(ax - 6, ay - 68, 12, 16);
      // Arms
      g.fillRect(ax - 18, ay - 44, 10, 6);
      g.fillRect(ax + 8,  ay - 44, 10, 6);
    }

    // Flashlight beams
    g.fillStyle(0xffffff, 0.08);
    g.fillTriangle(W * 0.2, H * 0.75, W * 0.35, H * 0.10, W * 0.50, H * 0.30);
    g.fillTriangle(W * 0.8, H * 0.75, W * 0.65, H * 0.10, W * 0.50, H * 0.30);
  }
}
