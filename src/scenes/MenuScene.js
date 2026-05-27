import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { SaveSystem } from '../SaveSystem.js';
import { LOCALES } from '../data/locales.js';

const DARK = 0x020008;
const GOLD = 0xffd700;
const PINK = 0xff00a0;

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'Menu' }); }

  create() {
    const { width: W, height: H } = this.scale;
    const L = LOCALES[GameState.lang];

    this.add.rectangle(0, 0, W, H, DARK).setOrigin(0);
    this.drawBackground(W, H);

    // Neon title
    this.drawNeonText(W / 2, H * 0.12, 'STUDIO 57', '22px', '#ff00a0');
    this.add.text(W / 2, H * 0.21, L.menu_sub, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#c0a060',
    }).setOrigin(0.5);

    // Night counter
    this.add.text(W / 2, H * 0.29, `${L.night_label}  ${GameState.nightNumber}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    // Funds display
    const funds = GameState.velvetBox + GameState.stash;
    this.add.text(W / 2, H * 0.37, `$ ${funds.toLocaleString()}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px', color: '#40ff80',
    }).setOrigin(0.5);

    // FBI suspicion bar
    this.drawSuspicionBar(W * 0.1, H * 0.44, W * 0.8, 14, L);

    // START button
    this.makeBtn(W / 2, H * 0.56, 200, 46, L.menu_start, 0x006620, 0x009940, () => {
      GameState.resetNightStats();
      this.scene.start('Street');
    });

    // OFFICE button
    this.makeBtn(W / 2, H * 0.67, 200, 38, L.menu_office, 0x1a0050, 0x3a0090, () => {
      this.scene.start('Office');
    });

    // Language toggle
    this.add.text(W * 0.88, H * 0.04, L.menu_lang, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#888888',
      backgroundColor: '#111111',
      padding: { x: 8, y: 5 },
    }).setOrigin(0.5, 0).setInteractive().on('pointerdown', () => {
      GameState.lang = GameState.lang === 'ru' ? 'en' : 'ru';
      window.__studio57Lang = GameState.lang;
      SaveSystem.save();
      this.scene.restart();
    });

    // Credits / version
    this.add.text(W / 2, H * 0.94, 'v0.1 MVP', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#333333',
    }).setOrigin(0.5);
  }

  drawBackground(W, H) {
    // Stars
    const g = this.add.graphics();
    for (let i = 0; i < 60; i++) {
      g.fillStyle(0xffffff, Math.random() * 0.5 + 0.1);
      g.fillRect(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H * 0.35), 2, 2);
    }

    // Building silhouette
    g.fillStyle(0x100020);
    g.fillRect(W * 0.02, H * 0.08, W * 0.96, H * 0.6);

    // Windows
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 9; c++) {
        const lit = Math.random() > 0.45;
        g.fillStyle(lit ? 0xffd060 : 0x0a0820);
        g.fillRect(W * 0.07 + c * W * 0.10, H * 0.10 + r * H * 0.08, W * 0.06, H * 0.05);
      }
    }

    // Entrance arch
    g.fillStyle(0x020008);
    g.fillRect(W * 0.35, H * 0.42, W * 0.30, H * 0.26);
    g.lineStyle(3, 0xffd700);
    g.strokeRect(W * 0.35, H * 0.42, W * 0.30, H * 0.26);

    // Ground
    g.fillStyle(0x0a0a0a);
    g.fillRect(0, H * 0.68, W, H * 0.32);

    // Searchlight beams
    g.fillStyle(0xffffff, 0.04);
    g.fillTriangle(W * 0.12, H * 0.68, W * 0.04, 0, W * 0.20, 0);
    g.fillTriangle(W * 0.88, H * 0.68, W * 0.80, 0, W * 0.96, 0);
  }

  drawNeonText(x, y, text, size, color) {
    // Glow layers
    [8, 4, 2].forEach((thick, i) => {
      this.add.text(x, y, text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: size,
        color: color,
        stroke: color,
        strokeThickness: thick,
        alpha: 0.15 + i * 0.2,
      }).setOrigin(0.5);
    });
    this.add.text(x, y, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: size, color: '#ffffff',
    }).setOrigin(0.5);
  }

  drawSuspicionBar(x, y, barW, barH, L) {
    const g = this.add.graphics();
    g.fillStyle(0x220000);
    g.fillRect(x, y, barW, barH);

    const pct = GameState.fbiSuspicion / 100;
    const fillColor = pct > 0.6 ? 0xff2020 : pct > 0.3 ? 0xff8020 : 0xff4040;
    g.fillStyle(fillColor);
    g.fillRect(x + 1, y + 1, (barW - 2) * pct, barH - 2);

    g.lineStyle(1, 0xff4040);
    g.strokeRect(x, y, barW, barH);

    this.add.text(x, y - 14, `${L.fbi} ${Math.round(GameState.fbiSuspicion)}%`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ff4040',
    });
  }

  makeBtn(cx, cy, bw, bh, label, colorNormal, colorHover, cb) {
    const bg = this.add.rectangle(cx, cy, bw, bh, colorNormal)
      .setStrokeStyle(2, GOLD).setInteractive();
    const txt = this.add.text(cx, cy, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5);

    bg.on('pointerover', () => { bg.setFillStyle(colorHover); txt.setColor('#ffd700'); });
    bg.on('pointerout',  () => { bg.setFillStyle(colorNormal); txt.setColor('#ffffff'); });
    bg.on('pointerdown', cb);
    txt.setInteractive();
    txt.on('pointerdown', cb);
  }
}
