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

    this.add.rectangle(0, 0, W, H, DARK).setOrigin(0);
    this.drawStars(W, H);

    this.add.text(W / 2, H * 0.06, 'STUDIO 57', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px', color: '#ff00a0',
      stroke: '#ff00a0', strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.13, L.vs_choose, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ffd700',
    }).setOrigin(0.5);

    const cardH = H * 0.31;
    const cardW = W * 0.82;

    // Safe card
    const safeDesc   = lang === 'ru' ? 'Таблетки и символы.\nДля всех возрастов. Без 18+ сцен.' : 'Pills & symbols.\nFor all ages. No 18+ scenes.';
    const adultDesc  = lang === 'ru' ? 'Прямой текст. Пиксельные намёки.\nРейтинг 18+. Как Papers Please.' : 'Direct text. Pixel hints.\nRated 18+. Like Papers Please.';
    const maxDesc    = lang === 'ru' ? 'Полный реализм. Грязь и разврат.\nPиксельные сцены. Только для взрослых.' : 'Full realism. Grit & vice.\nPixel art scenes. Adults only.';

    this.makeCard(W / 2, H * 0.26, cardW, cardH, 'safe',
      lang === 'ru' ? '🌟 СЕМЕЙНАЯ' : '🌟 FAMILY',
      safeDesc, 0x1a0040, 0x8844ff, lang);

    this.makeCard(W / 2, H * 0.57, cardW, cardH, 'adult',
      lang === 'ru' ? '🔞 ВЕРСИЯ 18+' : '🔞 RATED 18+',
      adultDesc, 0x300010, 0xff4444, lang);

    this.makeCard(W / 2, H * 0.83, cardW, cardH * 0.55, 'max',
      lang === 'ru' ? '⚠ МАКСИМУМ (NSFW)' : '⚠ MAXIMUM (NSFW)',
      maxDesc, 0x1a0000, 0xff0000, lang);

    // Language toggle
    const langBtn = this.add.text(W * 0.88, H * 0.02, `🌐 ${L.menu_lang}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#aaaaaa',
      backgroundColor: '#111111',
      padding: { x: 8, y: 5 },
    }).setOrigin(0.5, 0).setInteractive();
    langBtn.on('pointerdown', () => {
      GameState.lang = GameState.lang === 'ru' ? 'en' : 'ru';
      window.__studio57Lang = GameState.lang;
      this.scene.restart();
    });
  }

  makeCard(cx, cy, cw, ch, version, title, desc, bgColor, strokeColor, lang) {
    const L = LOCALES[lang];
    const strokeColors = { safe: 0x8844ff, adult: 0xff4444, max: 0xff0000 };
    const sc = strokeColors[version];

    const bg = this.add.rectangle(cx, cy, cw, ch, bgColor)
      .setStrokeStyle(2, sc).setInteractive();

    this.add.text(cx - cw / 2 + 16, cy - ch * 0.28, title, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0, 0.5);

    this.add.text(cx - cw / 2 + 16, cy + ch * 0.04, desc, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#888888',
      wordWrap: { width: cw * 0.65 }, align: 'left',
    }).setOrigin(0, 0.5);

    const btnW = 80, btnH = 28;
    const btnX = cx + cw / 2 - btnW / 2 - 10;
    const btnBg = this.add.rectangle(btnX, cy, btnW, btnH, sc)
      .setInteractive();
    const btnTxt = this.add.text(btnX, cy, L.ok, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#000000',
    }).setOrigin(0.5);

    const select = () => {
      GameState.contentVersion = version;
      window.__studio57Lang = GameState.lang;
      SaveSystem.save();
      this.scene.start('Menu');
    };
    bg.on('pointerdown', select);
    btnBg.on('pointerdown', select);
    btnTxt.setInteractive(); btnTxt.on('pointerdown', select);

    bg.on('pointerover', () => bg.setStrokeStyle(3, GOLD));
    bg.on('pointerout',  () => bg.setStrokeStyle(2, sc));
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
