/**
 * Modal event popup — launched on top of NightScene.
 * Shows a comic-style card with choices.
 */
import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { LOCALES } from '../data/locales.js';

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
    const cv   = GameState.contentVersion;
    const ev   = this.eventData;

    // Dim overlay
    this.add.rectangle(0, 0, W, H, 0x000000, 0.72).setOrigin(0);

    // Comic panel frame
    const pw = Math.min(W * 0.88, 320);
    const ph = Math.min(H * 0.60, 360);
    const px = W / 2;
    const py = H / 2 - 20;

    // Halftone-style border (comic effect)
    const frame = this.add.rectangle(px, py, pw, ph, 0xfaf0d0)
      .setStrokeStyle(4, 0x000000);

    // Title bar
    this.add.rectangle(px, py - ph / 2 + 18, pw, 36, 0xdd0020);

    const titleKey = cv === 'medium' && ev.title_medium
      ? ev.title_medium[lang] || ev.title_medium.en
      : ev.title?.[lang] || ev.title?.en || '!';

    this.add.text(px, py - ph / 2 + 18, titleKey, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
      wordWrap: { width: pw - 20 }, align: 'center',
    }).setOrigin(0.5);

    // Body text
    const bodyObj = cv === 'medium' && ev.body_medium ? ev.body_medium : ev.body_soft;
    const body = bodyObj?.[lang] || bodyObj?.en || '';

    this.add.text(px, py - ph / 2 + 70, body, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#1a0a00',
      wordWrap: { width: pw - 30 }, align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5, 0);

    // Choices
    const choices = ev.choices || [{ key: 'ok', label: { ru: 'OK', en: 'OK' } }];
    const btnH = 38;
    const totalBtnH = choices.length * (btnH + 10);
    const startY = py + ph / 2 - totalBtnH - 16;

    choices.forEach((choice, i) => {
      const by = startY + i * (btnH + 10);
      const label = choice.label[lang] || choice.label.en;
      const colors = [0x004400, 0x440000, 0x004444, 0x330033];
      const hovers = [0x006600, 0x660000, 0x006666, 0x550055];

      const bg = this.add.rectangle(px, by, pw * 0.78, btnH, colors[i % colors.length])
        .setStrokeStyle(2, 0x000000).setInteractive();
      this.add.text(px, by, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px', color: '#ffffff',
      }).setOrigin(0.5);

      bg.on('pointerover', () => bg.setFillStyle(hovers[i % hovers.length]));
      bg.on('pointerout',  () => bg.setFillStyle(colors[i % colors.length]));
      bg.on('pointerdown', () => this.handleChoice(choice.key));
    });

    // Speed lines (comic effect)
    const g = this.add.graphics().setAlpha(0.06);
    for (let i = 0; i < 12; i++) {
      g.lineStyle(1, 0x000000);
      g.strokeLineShape(new Phaser.Geom.Line(
        px + Phaser.Math.Between(-pw / 2, pw / 2), py - ph / 2,
        px, py
      ));
    }
  }

  handleChoice(choiceKey) {
    const result = this.eventData.resolve?.(choiceKey, GameState);
    this.scene.stop();
    this.onClose(result);
  }
}
