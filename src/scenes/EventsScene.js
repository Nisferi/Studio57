import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { SaveSystem } from '../SaveSystem.js';
import { LOCALES } from '../data/locales.js';

const DARK = 0x020008;
const GOLD = 0xffd700;

// ── Event catalogue ──────────────────────────────────────────────────────────
export const NIGHT_EVENTS_CATALOGUE = [
  {
    id: 'none',
    icon: '—',
    label: { ru: 'БЕЗ ЭВЕНТА',        en: 'NO EVENT'        },
    desc:  { ru: 'Обычная ночь',       en: 'Regular night'   },
    cost: 0,
    color: 0x111111,
    hoverColor: 0x222222,
    effect: { type: 'none' },
  },
  {
    id: 'themed',
    icon: '🎭',
    label: { ru: 'ТЕМАТИЧЕСКАЯ НОЧЬ', en: 'THEMED NIGHT'    },
    desc:  {
      ru: '+30% гостей. Дресс-код строже',
      en: '+30% guests. Stricter dress code',
    },
    cost: 200,
    color: 0x001a3a,
    hoverColor: 0x002a5a,
    effect: { type: 'themed', extraGuests: 8, styleBonus: true },
  },
  {
    id: 'open_bar',
    icon: '🍻',
    label: { ru: 'ОТКРЫТЫЙ БАР',      en: 'OPEN BAR'        },
    desc:  {
      ru: 'Бар ×2, больше пьяных гостей',
      en: 'Bar ×2, more drunk guests',
    },
    cost: 400,
    color: 0x1a0a00,
    hoverColor: 0x2a1500,
    effect: { type: 'open_bar', barBoost: 2.0, wastedBonus: 0.20 },
  },
  {
    id: 'press',
    icon: '📸',
    label: { ru: 'ПРЕСС-НОЧЬ',        en: 'PRESS NIGHT'     },
    desc:  {
      ru: 'Репутация +15 если всё OK, −20 при скандале',
      en: 'REP +15 if clean, −20 on scandal',
    },
    cost: 150,
    color: 0x0a1a00,
    hoverColor: 0x142800,
    effect: { type: 'press', repBonus: 15, repPenalty: 20 },
  },
  {
    id: 'vip_soiree',
    icon: '💎',
    label: { ru: 'VIP СОРЭ',          en: 'VIP SOIRÉE'      },
    desc:  {
      ru: 'Шанс знаменитости ×2. Тайник +$300',
      en: 'Celebrity chance ×2. Stash +$300',
    },
    cost: 500,
    color: 0x1a0040,
    hoverColor: 0x280060,
    effect: { type: 'vip_soiree', celebBoost: 2, stashBonus: 300 },
  },
  {
    id: 'concert',
    icon: '🎸',
    label: { ru: 'КОНЦЕРТ',           en: 'CONCERT'         },
    desc:  {
      ru: '$2000 касса, Хайп +20. Риск отмены 20%',
      en: '$2000 cash, Hype +20. 20% cancel risk',
    },
    cost: 600,
    color: 0x1a0a20,
    hoverColor: 0x281535,
    effect: { type: 'concert', income: 2000, hype: 20, cancelChance: 0.20 },
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export class EventsScene extends Phaser.Scene {
  constructor() { super({ key: 'Events' }); }

  create() {
    const { width: W, height: H } = this.scale;
    const L = LOCALES[GameState.lang];
    this.W = W; this.H = H;
    this.selected = GameState.bookedEvent?.id || 'none';

    this.add.rectangle(0, 0, W, H, 0x080014).setOrigin(0);
    this.drawBackground(W, H);
    this.buildHeader(W, H, L);
    this.buildEventCards(W, H, L);
    this.buildConfirmBtn(W, H, L);
    this.buildBackBtn(W, H, L);
  }

  // ─── BACKGROUND ─────────────────────────────────────────────────────────────

  drawBackground(W, H) {
    const g = this.add.graphics();
    // Subtle wallpaper pattern — diagonal lines
    g.lineStyle(1, 0x1a0040, 0.3);
    for (let x = -H; x < W + H; x += 24) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + H, H);
      g.strokePath();
    }
    // Top neon band
    g.fillStyle(0x1a0040, 0.5);
    g.fillRect(0, 0, W, 52);
    g.lineStyle(2, 0x8844ff);
    g.beginPath(); g.moveTo(0, 52); g.lineTo(W, 52); g.strokePath();
  }

  // ─── HEADER ─────────────────────────────────────────────────────────────────

  buildHeader(W, H, L) {
    const lang = GameState.lang;
    this.add.text(W / 2, 18, lang === 'ru' ? '📅 ЭВЕНТ НОЧИ' : '📅 BOOK EVENT', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(W / 2, 38, lang === 'ru'
      ? `Ночь ${GameState.nightNumber} — выбери один эвент:`
      : `Night ${GameState.nightNumber} — choose one:`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#888888',
    }).setOrigin(0.5);

    // Funds
    const funds = GameState.velvetBox + GameState.stash;
    this.add.text(W - 8, 8, `$${funds}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#40ff80',
    }).setOrigin(1, 0);
  }

  // ─── EVENT CARDS ────────────────────────────────────────────────────────────

  buildEventCards(W, H, L) {
    const lang   = GameState.lang;
    const funds  = GameState.velvetBox + GameState.stash;
    const startY = 62;
    const cardH  = (H * 0.78 - startY) / NIGHT_EVENTS_CATALOGUE.length;
    const cardW  = W * 0.92;
    const cx     = W / 2;

    this.cardObjects = {};

    NIGHT_EVENTS_CATALOGUE.forEach((ev, i) => {
      const cy      = startY + i * cardH + cardH / 2;
      const canAfford = funds >= ev.cost;
      const isSel   = this.selected === ev.id;

      const bgColor  = isSel ? (ev.hoverColor + 0x0a0a0a) : ev.color;
      const border   = isSel ? GOLD : (canAfford ? 0x443366 : 0x222222);

      const bg = this.add.rectangle(cx, cy, cardW, cardH - 6, bgColor)
        .setStrokeStyle(isSel ? 3 : 1, border)
        .setInteractive();

      // Icon + label
      this.add.text(cx - cardW / 2 + 14, cy - cardH * 0.18, ev.icon, {
        fontSize: '16px',
      }).setOrigin(0, 0.5);

      const labelColor = !canAfford && ev.cost > 0 ? '#444444' : '#ffffff';
      this.add.text(cx - cardW / 2 + 38, cy - cardH * 0.18, ev.label[lang] || ev.label.en, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px', color: labelColor,
      }).setOrigin(0, 0.5);

      // Cost badge
      const costStr = ev.cost === 0 ? 'FREE' : `-$${ev.cost}`;
      const costCol = ev.cost === 0 ? '#40ff80' : canAfford ? '#ff8800' : '#ff4444';
      this.add.text(cx + cardW / 2 - 8, cy - cardH * 0.18, costStr, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px', color: costCol,
      }).setOrigin(1, 0.5);

      // Description
      this.add.text(cx - cardW / 2 + 14, cy + cardH * 0.12, ev.desc[lang] || ev.desc.en, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px', color: canAfford ? '#aaaaaa' : '#444444',
        wordWrap: { width: cardW - 24 },
      }).setOrigin(0, 0);

      // Selected checkmark
      if (isSel) {
        this.add.text(cx + cardW / 2 - 8, cy + cardH * 0.12, '✓', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px', color: '#ffd700',
        }).setOrigin(1, 0);
      }

      this.cardObjects[ev.id] = bg;

      if (canAfford) {
        bg.on('pointerover', () => bg.setFillStyle(ev.hoverColor));
        bg.on('pointerout',  () => bg.setFillStyle(this.selected === ev.id ? ev.hoverColor + 0x0a0a0a : ev.color));
        bg.on('pointerdown', () => this.selectEvent(ev.id));
      }
    });
  }

  selectEvent(id) {
    this.selected = id;
    this.scene.restart(); // Simplest re-render — cheap since it's a menu scene
  }

  // ─── CONFIRM BUTTON ─────────────────────────────────────────────────────────

  buildConfirmBtn(W, H, L) {
    const lang = GameState.lang;
    const ev   = NIGHT_EVENTS_CATALOGUE.find(e => e.id === this.selected);
    const funds = GameState.velvetBox + GameState.stash;
    const can  = funds >= (ev?.cost || 0);
    const label = lang === 'ru' ? `✓ ПОДТВЕРДИТЬ` : `✓ CONFIRM`;

    const bg = this.add.rectangle(W / 2, H * 0.87, 220, 44, can ? 0x003d1a : 0x1a1a1a)
      .setStrokeStyle(2, can ? GOLD : 0x444444);

    const txt = this.add.text(W / 2, H * 0.87, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: can ? '#ffd700' : '#444444',
    }).setOrigin(0.5);

    if (can) {
      bg.setInteractive();
      bg.on('pointerover',  () => bg.setFillStyle(0x005a26));
      bg.on('pointerout',   () => bg.setFillStyle(0x003d1a));
      bg.on('pointerdown',  () => this.confirm());
      txt.setInteractive(); txt.on('pointerdown', () => this.confirm());
    }
  }

  confirm() {
    const ev    = NIGHT_EVENTS_CATALOGUE.find(e => e.id === this.selected);
    if (!ev) return;

    const funds = GameState.velvetBox + GameState.stash;
    if (funds < ev.cost) return;

    // Deduct cost from velvetBox first, then stash
    let remaining = ev.cost;
    if (GameState.velvetBox >= remaining) {
      GameState.velvetBox -= remaining;
    } else {
      remaining -= GameState.velvetBox;
      GameState.velvetBox = 0;
      GameState.stash = Math.max(0, GameState.stash - remaining);
    }

    GameState.bookedEvent = ev.cost === 0 ? null : { id: ev.id, label: ev.label, effect: ev.effect };
    SaveSystem.save();
    this.scene.start('Office');
  }

  // ─── BACK ────────────────────────────────────────────────────────────────────

  buildBackBtn(W, H, L) {
    const lang = GameState.lang;
    this.add.text(W / 2, H * 0.95, lang === 'ru' ? '← ОФИС' : '← OFFICE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#666666',
      backgroundColor: '#111111',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.scene.start('Office'));
  }
}
