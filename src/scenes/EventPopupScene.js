/**
 * Modal event popup — launched on top of NightScene.
 * Shows a comic-style card with choices.
 * Supports three content tiers: safe / adult / max.
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
    const cv   = GameState.contentVersion; // 'safe' | 'adult' | 'max'
    const ev   = this.eventData;

    const isAdultPlus = cv === 'adult' || cv === 'max';
    const isMax       = cv === 'max';

    // Dim overlay
    this.add.rectangle(0, 0, W, H, 0x000000, 0.72).setOrigin(0);

    // Comic panel
    const pw = Math.min(W * 0.88, 320);
    const ph = Math.min(H * 0.62, 370);
    const px = W / 2;
    const py = H / 2 - 16;

    this.add.rectangle(px, py, pw, ph, 0xfaf0d0).setStrokeStyle(4, 0x000000);

    // Title bar
    const titleBg = isMax ? 0x880000 : isAdultPlus ? 0xdd0020 : 0x220066;
    this.add.rectangle(px, py - ph / 2 + 18, pw, 36, titleBg);

    const titleKey = isMax && ev.title_max
      ? (ev.title_max[lang] || ev.title_max.en)
      : isAdultPlus && ev.title_adult
      ? (ev.title_adult[lang] || ev.title_adult.en)
      : ev.title_safe
      ? (ev.title_safe[lang]  || ev.title_safe.en)
      : (ev.title?.[lang]     || ev.title?.en || '!');

    this.add.text(px, py - ph / 2 + 18, titleKey, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
      wordWrap: { width: pw - 20 }, align: 'center',
    }).setOrigin(0.5);

    // Body text
    const bodyObj = isMax && ev.body_max
      ? ev.body_max
      : isAdultPlus && ev.body_adult
      ? ev.body_adult
      : ev.body_safe;
    const body = bodyObj?.[lang] || bodyObj?.en || '';

    this.add.text(px, py - ph / 2 + 70, body, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#1a0a00',
      wordWrap: { width: pw - 30 }, align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5, 0);

    // Result text area (filled after choice)
    this.resultTxt = this.add.text(px, py + ph / 2 - 48, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#00aa44',
      backgroundColor: '#000000aa',
      padding: { x: 6, y: 4 }, align: 'center',
    }).setOrigin(0.5);

    // Choices
    const choices   = ev.choices || [{ key: 'ok', label: { ru: 'OK', en: 'OK' } }];
    const btnH      = 38;
    const gap       = 10;
    const totalBtnH = choices.length * (btnH + gap);
    const startY    = py + ph / 2 - totalBtnH - 52;

    choices.forEach((choice, i) => {
      const by   = startY + i * (btnH + gap);
      const label = choice.label[lang] || choice.label.en;
      const fgColors = [0x004400, 0x440000, 0x004444, 0x330033];
      const hColors  = [0x006600, 0x660000, 0x006666, 0x550055];

      const bg = this.add.rectangle(px, by, pw * 0.78, btnH, fgColors[i % fgColors.length])
        .setStrokeStyle(2, 0x000000).setInteractive();
      this.add.text(px, by, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px', color: '#ffffff',
      }).setOrigin(0.5);

      bg.on('pointerover', () => bg.setFillStyle(hColors[i % hColors.length]));
      bg.on('pointerout',  () => bg.setFillStyle(fgColors[i % fgColors.length]));
      bg.on('pointerdown', () => this.handleChoice(choice.key));
    });

    // Speed lines (comic mood effect)
    const g = this.add.graphics().setAlpha(0.05);
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

    if (result?.msg) {
      const color = result.ok ? '#00aa44' : '#cc2222';
      this.resultTxt.setText(result.msg).setColor(color);
      this.time.delayedCall(900, () => {
        this.scene.stop();
        this.onClose(result);
      });
    } else {
      this.scene.stop();
      this.onClose(result);
    }
  }
}
