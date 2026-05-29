/**
 * Modal event popup — launched on top of NightScene.
 * Shows a comic-style card with choices.
 * Supports three content tiers: safe / adult / max.
 */
import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { LOCALES } from '../data/locales.js';
import { PixelUI } from '../systems/PixelUI.js';

export class EventPopupScene extends Phaser.Scene {
  constructor() { super({ key: 'EventPopup' }); }

  init(data) {
    this.eventData = data.event;
    this.onClose   = data.onClose || (() => {});
  }

  create() {
    const { width: W, height: H } = this.scale;
    const L    = LOCALES[GameState.lang];
    const lang = GameState.lang;
    const cv   = GameState.contentVersion; // 'safe' | 'adult' | 'max'
    const ev   = this.eventData;

    const isAdultPlus = cv === 'adult' || cv === 'max';
    const isMax       = cv === 'max';

    // Dim overlay with radial vignette
    this.add.rectangle(0, 0, W, H, 0x000000, 0.76).setOrigin(0);

    const pw = Math.min(W * 0.90, 330);
    const ph = Math.min(H * 0.65, 390);
    const px = W / 2;
    const py = H / 2 - 12;

    // Outer glow halo
    const haloG = this.add.graphics().setDepth(8);
    const titleBg    = isMax ? 0x880000 : isAdultPlus ? 0xcc0020 : 0x1a0055;
    const titleBorder = isMax ? 0xff2200 : isAdultPlus ? 0xff4466 : 0x8844ff;
    haloG.fillStyle(titleBorder, 0.08);
    haloG.fillRoundedRect(px - pw / 2 - 6, py - ph / 2 - 6, pw + 12, ph + 12, 8);

    // Comic panel — cream background
    this.add.rectangle(px, py, pw, ph, 0xf5e8c0).setDepth(9)
      .setStrokeStyle(3, 0x1a0a00);

    // Speed lines (drawn before content so they're behind)
    const speedG = this.add.graphics().setDepth(10).setAlpha(0.06);
    for (let i = 0; i < 14; i++) {
      speedG.lineStyle(1 + (i % 2), 0x1a0a00);
      speedG.strokeLineShape(new Phaser.Geom.Line(
        px + Phaser.Math.Between(-pw / 2, pw / 2), py - ph / 2,
        px, py + ph * 0.1
      ));
    }

    // Title bar
    const titleBarG = this.add.graphics().setDepth(11);
    titleBarG.fillStyle(titleBg);
    titleBarG.fillRect(px - pw / 2, py - ph / 2, pw, 40);
    titleBarG.lineStyle(2, titleBorder, 0.8);
    titleBarG.strokeRect(px - pw / 2, py - ph / 2, pw, 40);

    // Title border accent strips
    titleBarG.fillStyle(titleBorder, 0.35);
    titleBarG.fillRect(px - pw / 2, py - ph / 2, pw, 3);
    titleBarG.fillRect(px - pw / 2, py - ph / 2 + 37, pw, 3);

    const titleKey = isMax && ev.title_max
      ? (ev.title_max[lang] || ev.title_max.en)
      : isAdultPlus && ev.title_adult
      ? (ev.title_adult[lang] || ev.title_adult.en)
      : ev.title_safe
      ? (ev.title_safe[lang]  || ev.title_safe.en)
      : (ev.title?.[lang]     || ev.title?.en || '!');

    this.add.text(px, py - ph / 2 + 20, titleKey, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
      wordWrap: { width: pw - 20 }, align: 'center',
    }).setOrigin(0.5).setDepth(12);

    // Body text
    const bodyObj = isMax && ev.body_max
      ? ev.body_max
      : isAdultPlus && ev.body_adult
      ? ev.body_adult
      : ev.body_safe;
    const body = bodyObj?.[lang] || bodyObj?.en || '';

    this.add.text(px, py - ph / 2 + 58, body, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#2a1000',
      wordWrap: { width: pw - 28 }, align: 'center',
      lineSpacing: 7,
    }).setOrigin(0.5, 0).setDepth(12);

    // Result text (shown after choice)
    this.resultTxt = this.add.text(px, py + ph / 2 - 44, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#00aa44',
      backgroundColor: '#000000cc',
      padding: { x: 6, y: 4 }, align: 'center',
    }).setOrigin(0.5).setDepth(13);

    // Choices
    const choices   = ev.choices || [{ key: 'ok', label: { ru: 'OK', en: 'OK' } }];
    const choiceBtnH = 38;
    const gap        = 10;
    const totalBtnH  = choices.length * (choiceBtnH + gap);
    const startY     = py + ph / 2 - totalBtnH - 56;

    const choicePalette = [
      { base: 0x004422, hover: 0x006633, border: 0x44ff88 },
      { base: 0x440000, hover: 0x660000, border: 0xff4444 },
      { base: 0x003344, hover: 0x005566, border: 0x44aaff },
      { base: 0x330033, hover: 0x550055, border: 0xff44ff },
    ];

    choices.forEach((choice, i) => {
      const by    = startY + i * (choiceBtnH + gap);
      const label = choice.label[lang] || choice.label.en;
      const pal   = choicePalette[i % choicePalette.length];

      // Shadow
      const shG = this.add.graphics().setDepth(11);
      shG.fillStyle(0x000000, 0.45);
      shG.fillRect(px - pw * 0.40 + 3, by - choiceBtnH / 2 + 3, pw * 0.80, choiceBtnH);

      const cbg = this.add.rectangle(px, by, pw * 0.80, choiceBtnH, pal.base)
        .setStrokeStyle(2, pal.border).setInteractive().setDepth(12);

      // Top highlight strip
      const hlG = this.add.graphics().setDepth(13);
      hlG.fillStyle(0xffffff, 0.12);
      hlG.fillRect(px - pw * 0.40 + 2, by - choiceBtnH / 2 + 2, pw * 0.80 - 4, 2);

      this.add.text(px, by, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px', color: '#ffffff',
        stroke: '#000000', strokeThickness: 2,
        wordWrap: { width: pw * 0.76 }, align: 'center',
      }).setOrigin(0.5).setDepth(14);

      cbg.on('pointerover', () => {
        cbg.setFillStyle(pal.hover);
        this.tweens.add({ targets: [cbg, hlG], scaleX: 1.02, scaleY: 1.02, duration: 60, ease: 'Quad.Out' });
      });
      cbg.on('pointerout', () => {
        cbg.setFillStyle(pal.base);
        this.tweens.add({ targets: [cbg, hlG], scaleX: 1, scaleY: 1, duration: 60, ease: 'Quad.Out' });
      });
      cbg.on('pointerdown', () => this.handleChoice(choice.key));
    });
  }

  handleChoice(choiceKey) {
    if (!this.eventData.resolve) {
      this.scene.stop();
      this.onClose(null);
      return;
    }
    const result = this.eventData.resolve(choiceKey, GameState);

    if (result?.msg) {
      const color = result.ok !== false ? '#00aa44' : '#cc2222';
      this.resultTxt.setText(result.msg).setColor(color);
      this.time.delayedCall(900, () => {
        this.scene.stop();
        this.onClose(result);
      });
    } else {
      this.scene.stop();
      this.onClose(result || null);
    }
  }
}
