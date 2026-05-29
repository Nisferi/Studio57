import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { SaveSystem } from '../SaveSystem.js';
import { LOCALES } from '../data/locales.js';
import { PixelUI } from '../systems/PixelUI.js';

const DARK = 0x04000e;
const GOLD = 0xffd700;

// Ending type calculation
function calcEnding(gs) {
  if (gs.fbiSuspicion >= 80) return 'arrested';
  if (gs.reputation >= 65 && gs.totalEarned >= 20000) return 'legend';
  if (gs.stash >= 8000)                               return 'exile';
  return 'quiet';
}

const ENDINGS = {
  arrested: {
    color:   '#ff2020',
    bgColor: 0x050000,
    title:   { ru: 'АРЕСТОВАН', en: 'ARRESTED' },
    hughes:  {
      ru: '«Виктор Нойман? Агент Хьюз. Налоговое мошенничество и рэкет. У меня восемнадцать страниц доказательств.»',
      en: '"Victor Neumann? Agent Hughes. Tax fraud and racketeering. I have eighteen pages of evidence."',
    },
    epilogue: {
      ru: 'Ты провёл три года в федеральной тюрьме Алленвуд. Studio 57 закрыли через неделю. Имя — в газетах, репутация — в пропасти.',
      en: 'Three years in Allenwood federal prison. Studio 57 closed within a week. Your name — in the headlines, your reputation — in the gutter.',
    },
    stars: 1,
  },
  legend: {
    color:   '#ffd700',
    bgColor: 0x0a0008,
    title:   { ru: 'ЛЕГЕНДА', en: 'THE LEGEND' },
    hughes:  {
      ru: '«Господин Нойман. Мы следим за вами три года. Честно говоря — я впечатлён. Но работа есть работа.»',
      en: '"Mr. Neumann. We\'ve been watching you for three years. Frankly — I\'m impressed. But a job\'s a job."',
    },
    epilogue: {
      ru: 'Ты заплатил налоги, нанял адвоката и договорился. Двадцать восемь месяцев в Алленвуде — и вышел с легендой вместо имени. Studio 57 вошёл в историю.',
      en: 'You paid the taxes, hired a lawyer, made a deal. Twenty-eight months in Allenwood — and walked out with a legend instead of a name. Studio 57 went down in history.',
    },
    stars: 5,
  },
  exile: {
    color:   '#44ccff',
    bgColor: 0x000e18,
    title:   { ru: 'ЭМИГРАЦИЯ', en: 'THE EXILE' },
    hughes:  {
      ru: '«Нойман. Три чемодана и два паспорта. Умно. Но Цюрих — не так далеко, как вам кажется.»',
      en: '"Neumann. Three suitcases and two passports. Smart. But Zurich isn\'t as far as you think."',
    },
    epilogue: {
      ru: 'Ты увидел, куда ветер дует, раньше других. Билет в один конец, тайник конвертирован в швейцарские франки. Нью-Йорк до сих пор говорит о тебе.',
      en: 'You saw which way the wind was blowing before anyone else. One-way ticket, stash converted to Swiss francs. New York still talks about you.',
    },
    stars: 4,
  },
  quiet: {
    color:   '#aaaaaa',
    bgColor: 0x080808,
    title:   { ru: 'ТИХИЙ УХОД', en: 'THE QUIET EXIT' },
    hughes:  {
      ru: '«Нойман. Мы оба знаем, чем вы занимались. Ваш адвокат позвонил первым. Хорошее решение.»',
      en: '"Neumann. We both know what you\'ve been doing. Your lawyer called first. Smart move."',
    },
    epilogue: {
      ru: 'Ты продал клуб девелоперу в \'81-м. Заплатил налоги. Хватило на домик во Флориде. Никто не пишет о тебе книги. Зато и не пришли.',
      en: "You sold the club to a developer in '81. Paid your taxes. Enough for a place in Florida. Nobody writes books about you. But nobody ever came for you either.",
    },
    stars: 3,
  },
};

export class EndingScene extends Phaser.Scene {
  constructor() { super({ key: 'Ending' }); }

  create() {
    const { width: W, height: H } = this.scale;
    const L    = LOCALES[GameState.lang];
    const lang = GameState.lang;
    const type = calcEnding(GameState);
    const end  = ENDINGS[type];

    // Background
    this.add.rectangle(0, 0, W, H, end.bgColor).setOrigin(0);
    this.drawStarfield(W, H);

    // CRT scanlines
    const scanG = this.add.graphics().setDepth(60).setAlpha(0.05);
    for (let sy = 0; sy < H; sy += 4) {
      scanG.fillStyle(0x000000);
      scanG.fillRect(0, sy, W, 2);
    }

    // ── TITLE ────────────────────────────────────────────────────────────────
    const titleY = H * 0.08;
    PixelUI.neonText(this, W / 2, titleY, end.title[lang] || end.title.en, '16px', end.color, {
      depth: 5, glowLayers: [18, 9, 4], glowAlphas: [0.12, 0.24, 0.50],
    });

    // Night count badge
    const bdG = this.add.graphics().setDepth(6);
    bdG.fillStyle(0x1a0044, 0.90);
    bdG.fillRoundedRect(W / 2 - 64, titleY + 18, 128, 18, 4);
    bdG.lineStyle(1, GOLD, 0.5);
    bdG.strokeRoundedRect(W / 2 - 64, titleY + 18, 128, 18, 4);
    this.add.text(W / 2, titleY + 27, `${lang === 'ru' ? 'НОЧЕЙ' : 'NIGHTS'}: ${GameState.totalNights}  |  $${GameState.totalEarned?.toLocaleString() || 0}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(7);

    // ── AGENT HUGHES PORTRAIT + DIALOGUE ────────────────────────────────────
    const dialogY = H * 0.27;
    PixelUI.panel(this, W / 2, dialogY, W * 0.88, 88, {
      bgColor: 0x060010, bgAlpha: 0.95,
      borderColor: 0x444466, cornerSize: 5, depth: 4,
    });

    // Hughes pixel portrait
    this.drawHughesPortrait(W * 0.12, dialogY);

    // "AGENT HUGHES:" label
    this.add.text(W * 0.20, dialogY - 36, lang === 'ru' ? 'АГЕНТ ХЬЮЗ:' : 'AGENT HUGHES:', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#cc4444',
    }).setDepth(5);

    // Typewriter effect for Hughes dialogue
    const hughesTxt = this.add.text(W * 0.20, dialogY - 22, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#ccbbbb',
      wordWrap: { width: W * 0.70 }, lineSpacing: 4,
    }).setDepth(5);

    const fullText = end.hughes[lang] || end.hughes.en;
    this.typewriterEffect(hughesTxt, fullText, 28);

    // ── EPILOGUE PANEL ──────────────────────────────────────────────────────
    const epilogueY = H * 0.57;
    PixelUI.panel(this, W / 2, epilogueY, W * 0.88, 100, {
      bgColor: 0x020008, bgAlpha: 0.96,
      borderColor: parseInt(end.color.replace('#', ''), 16) || GOLD,
      cornerSize: 6, depth: 4,
    });

    this.add.text(W / 2, epilogueY, end.epilogue[lang] || end.epilogue.en, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#cccccc',
      wordWrap: { width: W * 0.80 }, lineSpacing: 5, align: 'center',
    }).setOrigin(0.5).setDepth(5);

    // ── STARS RATING ─────────────────────────────────────────────────────────
    const starsY = epilogueY + 62;
    for (let s = 0; s < 5; s++) {
      const filled = s < end.stars;
      this.add.text(W / 2 - 40 + s * 20, starsY, filled ? '★' : '☆', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px', color: filled ? '#ffd700' : '#333333',
      }).setOrigin(0.5).setDepth(5);
    }

    // ── STATS GRID ───────────────────────────────────────────────────────────
    const statsY = H * 0.76;
    const statsItems = [
      { label: lang === 'ru' ? 'ЗАРАБОТАНО' : 'EARNED',    value: `$${(GameState.totalEarned || 0).toLocaleString()}`,   color: '#40ff80' },
      { label: lang === 'ru' ? 'СТЭШ'       : 'STASH',     value: `$${(GameState.stash || 0).toLocaleString()}`,         color: '#ff9922' },
      { label: 'FBI',                                        value: `${Math.round(GameState.fbiSuspicion)}%`,             color: GameState.fbiSuspicion >= 70 ? '#ff2020' : '#ff6644' },
      { label: lang === 'ru' ? 'РЕПУТАЦИЯ' : 'REPUTATION', value: `${GameState.reputation}`,                             color: '#aa44ff' },
    ];
    const cellW = W * 0.88 / 4;
    statsItems.forEach((item, i) => {
      const sx = W * 0.06 + i * cellW + cellW / 2;
      const miniG = this.add.graphics().setDepth(4);
      miniG.fillStyle(0x08001a, 0.88);
      miniG.fillRoundedRect(sx - cellW / 2 + 3, statsY - 14, cellW - 6, 30, 3);
      miniG.lineStyle(1, 0x332255, 0.7);
      miniG.strokeRoundedRect(sx - cellW / 2 + 3, statsY - 14, cellW - 6, 30, 3);
      this.add.text(sx, statsY - 5, item.label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '5px', color: '#666688',
      }).setOrigin(0.5).setDepth(5);
      this.add.text(sx, statsY + 6, item.value, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px', color: item.color,
        stroke: '#000000', strokeThickness: 1,
      }).setOrigin(0.5).setDepth(5);
    });

    // ── RESTART BUTTON ────────────────────────────────────────────────────────
    const { bg } = PixelUI.button(this, W / 2, H * 0.912, 200, 44, lang === 'ru' ? '▶ ИГРАТЬ СНОВА' : '▶ PLAY AGAIN', {
      baseColor: 0x1a0044, hoverColor: 0x2a0066, borderColor: 0xaa44ff,
      fontSize: '9px', depth: 20,
    });
    bg.on('pointerdown', () => {
      GameState.reset();
      SaveSystem.clear();
      this.scene.start('Menu');
    });

    this.cameras.main.fadeIn(600, 4, 0, 14);
  }

  typewriterEffect(textObj, fullText, msPerChar = 35) {
    let i = 0;
    this.time.addEvent({
      delay: msPerChar,
      repeat: fullText.length - 1,
      callback: () => {
        i++;
        textObj.setText(fullText.slice(0, i));
      },
    });
  }

  drawHughesPortrait(x, y) {
    const g = this.add.graphics().setDepth(5);
    const s = 2;
    // Background circle
    g.fillStyle(0x1a0820);
    g.fillCircle(x, y, 20);
    g.lineStyle(1, 0x664466, 0.7);
    g.strokeCircle(x, y, 20);
    // Head
    g.fillStyle(0xd4b090);
    g.fillRect(x - 7 * s, y - 5 * s, 14 * s, 10 * s);
    // Hair (short, dark)
    g.fillStyle(0x1a1a1a);
    g.fillRect(x - 7 * s, y - 10 * s, 14 * s, 6 * s);
    g.fillRect(x - 7 * s, y - 5 * s, 2 * s, 2 * s);
    g.fillRect(x + 5 * s, y - 5 * s, 2 * s, 2 * s);
    // Eyes — serious
    g.fillStyle(0x222222);
    g.fillRect(x - 4 * s, y - 3 * s, 2 * s, 2 * s);
    g.fillRect(x + 2 * s, y - 3 * s, 2 * s, 2 * s);
    // Stern eyebrows
    g.fillStyle(0x1a1a1a);
    g.fillRect(x - 4 * s, y - 5 * s, 3 * s, s);
    g.fillRect(x + 2 * s, y - 5 * s, 3 * s, s);
    // Thin mouth (pursed)
    g.fillStyle(0xaa7766);
    g.fillRect(x - 2 * s, y + s, 4 * s, s);
    // Suit (dark grey)
    g.fillStyle(0x222233);
    g.fillRect(x - 8 * s, y + 5 * s, 16 * s, 10 * s);
    // White shirt collar
    g.fillStyle(0xeeeeee);
    g.fillRect(x - 2 * s, y + 5 * s, 4 * s, 3 * s);
    // FBI badge glint
    g.fillStyle(0xffd700, 0.9);
    g.fillRect(x + 4 * s, y + 7 * s, 4 * s, 3 * s);
    g.lineStyle(1, 0xaa8800);
    g.strokeRect(x + 4 * s, y + 7 * s, 4 * s, 3 * s);
  }

  drawStarfield(W, H) {
    const g = this.add.graphics();
    for (let i = 0; i < 50; i++) {
      g.fillStyle(0xffffff, Math.random() * 0.45 + 0.08);
      g.fillRect(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H * 0.45),
        Math.random() > 0.8 ? 2 : 1, 1
      );
    }
  }
}
