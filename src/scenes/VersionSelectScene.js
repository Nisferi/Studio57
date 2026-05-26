import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { SaveSystem } from '../SaveSystem.js';
import { LOCALES } from '../data/locales.js';

const GOLD   = 0xffd700;
const PINK   = 0xff00a0;
const DARK   = 0x020008;

export class VersionSelectScene extends Phaser.Scene {
  constructor() { super({ key: 'VersionSelect' }); }

  create() {
    const { width: W, height: H } = this.scale;
    const lang = GameState.lang || 'ru';
    const L = LOCALES[lang];

    // Background
    this.add.rectangle(0, 0, W, H, DARK).setOrigin(0);
    this.drawStars(W, H);

    // Title
    this.add.text(W / 2, H * 0.10, 'STUDIO 57', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '22px', color: '#ff00a0',
      stroke: '#ff00a0', strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.18, L.vs_choose, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#ffd700',
    }).setOrigin(0.5);

    // Soft card
    this.makeCard(W * 0.25, H * 0.50, W * 0.38, H * 0.42, 'soft',
      L.vs_soft_title, L.vs_soft_desc, '🌟', 0x2a0050, lang);

    // Medium card
    this.makeCard(W * 0.75, H * 0.50, W * 0.38, H * 0.42, 'medium',
      L.vs_medium_title, L.vs_medium_desc, '🔞', 0x500020, lang);

    // Language toggle
    const langBtn = this.add.text(W * 0.5, H * 0.88, `🌐 ${L.menu_lang}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#aaaaaa',
      backgroundColor: '#111111',
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setInteractive();
    langBtn.on('pointerdown', () => {
      GameState.lang = GameState.lang === 'ru' ? 'en' : 'ru';
      window.__studio57Lang = GameState.lang;
      this.scene.restart();
    });
  }

  makeCard(cx, cy, cw, ch, version, title, desc, icon, bgColor, lang) {
    const L = LOCALES[lang];
    const bg = this.add.rectangle(cx, cy, cw, ch, bgColor)
      .setStrokeStyle(2, version === 'soft' ? 0x8844ff : 0xff4444)
      .setInteractive();

    this.add.text(cx, cy - ch * 0.3, icon, {
      fontSize: '32px',
    }).setOrigin(0.5);

    this.add.text(cx, cy - ch * 0.05, title, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ffffff',
      wordWrap: { width: cw - 20 }, align: 'center',
    }).setOrigin(0.5);

    this.add.text(cx, cy + ch * 0.2, desc, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#aaaaaa',
      wordWrap: { width: cw - 20 }, align: 'center',
    }).setOrigin(0.5);

    // SELECT button
    const btn = this.add.text(cx, cy + ch * 0.38, L.ok, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#000000',
      backgroundColor: version === 'soft' ? '#8844ff' : '#ff4444',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setInteractive();

    const select = () => {
      GameState.contentVersion = version;
      window.__studio57Lang = GameState.lang;
      SaveSystem.save();
      this.scene.start('Menu');
    };
    bg.on('pointerdown', select);
    btn.on('pointerdown', select);

    bg.on('pointerover', () => bg.setStrokeStyle(3, 0xffd700));
    bg.on('pointerout',  () => bg.setStrokeStyle(2, version === 'soft' ? 0x8844ff : 0xff4444));
  }

  drawStars(W, H) {
    const g = this.add.graphics();
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H * 0.5);
      g.fillStyle(0xffffff, Math.random() * 0.6 + 0.1);
      g.fillRect(x, y, 2, 2);
    }
  }
}
