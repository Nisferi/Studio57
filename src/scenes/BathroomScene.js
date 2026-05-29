import Phaser from 'phaser';
import { GameState } from '../GameState.js';
import { SaveSystem } from '../SaveSystem.js';

const DARK   = 0x020008;
const PURPLE = 0x6600cc;
const GOLD   = 0xffd700;

// Content layers per version
const CONTENT = {
  safe: {
    luis: {
      title:  { ru: '💊 НЕЗНАКОМЕЦ',     en: '💊 STRANGER'       },
      offer:  { ru: 'Кто-то просит «сохранить пакет» на ночь за $300.',
                en: 'Someone asks you to "hold a package" for the night. $300.' },
      yes:    { ru: 'ВЗЯТЬ',             en: 'TAKE IT'            },
      no:     { ru: 'ОТКАЗАТЬ',          en: 'REFUSE'             },
    },
    vip: {
      title:  { ru: '💋 VIP КАБИНКА',    en: '💋 VIP BOOTH'       },
      offer:  { ru: 'Знаменитость хочет приватную встречу. Риск огласки.',
                en: 'A celebrity wants a private meeting. Exposure risk.' },
      yes:    { ru: 'СОГЛАСИТЬСЯ',       en: 'AGREE'              },
      no:     { ru: 'ОТКАЗАТЬ',          en: 'DENY'               },
    },
    fixer: {
      title:  { ru: '🔧 ФИКСЕР',         en: '🔧 FIXER'           },
      offer:  { ru: 'Агент предлагает «почистить» ваши досье за $800.',
                en: 'An agent offers to "clean" your records for $800.' },
      yes:    { ru: 'ЗАПЛАТИТЬ',         en: 'PAY'                },
      no:     { ru: 'ОТКАЗАТЬ',          en: 'REFUSE'             },
    },
  },
  adult: {
    luis: {
      title:  { ru: '💊 ЛУИС',           en: '💊 LUIS'            },
      offer:  { ru: 'Луис предлагает хранить кокаин за $300/ночь. FBI +15%.',
                en: 'Luis offers to stash coke for $300/night. FBI +15%.' },
      yes:    { ru: 'ВЗЯТЬ СДЕЛКУ',      en: 'TAKE DEAL'          },
      no:     { ru: 'ПРОГНАТЬ',          en: 'SEND AWAY'          },
    },
    vip: {
      title:  { ru: '💋 КАБИНКА #2',     en: '💋 BOOTH #2'        },
      offer:  { ru: 'Звезда хочет приватное шоу. 70% — $500 + REP. 30% — скандал.',
                en: 'Star wants a private show. 70% — $500 + REP. 30% — scandal.' },
      yes:    { ru: 'ВПУСТИТЬ',          en: 'LET IN'             },
      no:     { ru: 'ОТКАЗАТЬ',          en: 'DENY'               },
    },
    fixer: {
      title:  { ru: '🔧 ФИКСЕР',         en: '🔧 FIXER'           },
      offer:  { ru: '$800 — FBI −20%. Если FBI ≥70% — ловушка. Рискуешь?',
                en: '$800 — FBI −20%. If FBI ≥70% — it\'s a trap. Risk it?' },
      yes:    { ru: 'ЗАПЛАТИТЬ $800',    en: 'PAY $800'           },
      no:     { ru: 'УЙТИ',             en: 'WALK AWAY'          },
    },
  },
  max: {
    luis: {
      title:  { ru: '💊 ЛУИС & КОКС',    en: '💊 LUIS & COKE'     },
      offer:  { ru: 'Луис нарезает дорожки на крышке. «Хочешь заработать? Храни пакет — $300. Или сам угостись.»',
                en: 'Luis cuts lines on the lid. "Want to earn? Hold the package — $300. Or try a bump."' },
      yes:    { ru: '[$300] ВЗЯТЬ',      en: '[$300] TAKE IT'     },
      no:     { ru: 'ПРОЙТИ МИМО',       en: 'PASS'               },
    },
    vip: {
      title:  { ru: '💋 ЧАСТНАЯ ВЕЧЕРИНКА', en: '💋 PRIVATE PARTY' },
      offer:  { ru: 'Звезда тянет вас за руку в кабинку. Шёпот, духи, зеркало в пол.',
                en: 'The star pulls you into the booth. Whispers, perfume, floor-to-ceiling mirror.' },
      yes:    { ru: 'ВОЙТИ',             en: 'ENTER'              },
      no:     { ru: 'УЙТИ',             en: 'LEAVE'              },
    },
    fixer: {
      title:  { ru: '🔧 ЧИСТИЛЬЩИК',     en: '🔧 THE CLEANER'     },
      offer:  { ru: 'Мужчина в дорогом пиджаке: «$800 — и ваш файл в DC исчезнет. Но если вас пасут — я сам за вами слежу.»',
                en: 'Man in expensive suit: "$800 — your DC file disappears. But if they\'re watching — I\'m watching you too."' },
      yes:    { ru: 'ЗАПЛАТИТЬ',         en: 'PAY UP'             },
      no:     { ru: 'УЙТИ',             en: 'WALK'               },
    },
  },
};

function getContent() {
  const v = GameState.contentVersion || 'safe';
  return CONTENT[v] || CONTENT.safe;
}

// ─────────────────────────────────────────────────────────────────────────────

export class BathroomScene extends Phaser.Scene {
  constructor() { super({ key: 'Bathroom' }); }

  create() {
    const { width: W, height: H } = this.scale;
    this.W = W; this.H = H;
    this.lang = GameState.lang;

    this.drawRoom(W, H);
    this.drawCabinets(W, H);
    this.buildHUD(W, H);
    this.buildBackBtn(W, H);

    // Ambient flicker on neon sign
    this.time.addEvent({
      delay: Phaser.Math.Between(1800, 3200),
      loop: true,
      callback: this.flickerSign, callbackScope: this,
    });
  }

  // ─── ROOM ────────────────────────────────────────────────────────────────────

  drawRoom(W, H) {
    const g = this.add.graphics();

    // Floor — dark tile grid
    g.fillStyle(0x0a000f);
    g.fillRect(0, 0, W, H);

    // Tile grid
    g.lineStyle(1, 0x1a0030, 0.6);
    for (let x = 0; x <= W; x += 40) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.strokePath();
    }
    for (let y = 0; y <= H; y += 40) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.strokePath();
    }

    // Ceiling gradient band
    g.fillStyle(0x1a0030, 0.7);
    g.fillRect(0, 0, W, 55);

    // Neon sign
    this.neonSign = this.add.text(W / 2, 22, '🚽  BATHROOM', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px', color: '#cc44ff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10);

    // Purple under-glow from sign
    const glow = this.add.graphics().setDepth(9);
    glow.fillStyle(0x6600cc, 0.18);
    glow.fillEllipse(W / 2, 55, 220, 30);

    // Separator line
    const sepG = this.add.graphics().setDepth(2);
    sepG.lineStyle(2, PURPLE, 0.8);
    sepG.beginPath(); sepG.moveTo(0, 55); sepG.lineTo(W, 55); sepG.strokePath();

    // Stall dividers — vertical panels left/right edges
    this.drawWallDetails(W, H, g);
  }

  drawWallDetails(W, H, g) {
    // Left wall strip
    g.fillStyle(0x0e0020);
    g.fillRect(0, 55, 18, H - 55);
    // Right wall strip
    g.fillRect(W - 18, 55, 18, H - 55);

    // Graffiti blobs (procedural dots for flavour)
    const flavG = this.add.graphics().setDepth(1);
    flavG.lineStyle(1, 0x330055, 0.5);
    [[30, 120], [360, 200], [50, 350], [340, 420], [80, 550]].forEach(([x, y]) => {
      flavG.strokeCircle(x, y, Phaser.Math.Between(4, 10));
    });
  }

  // ─── CABINETS ────────────────────────────────────────────────────────────────

  drawCabinets(W, H) {
    const content = getContent();
    const lang    = this.lang;

    // Three cabinets evenly spaced
    const cabinetData = [
      { key: 'luis',  icon: '💊', color: 0x1a0030, hoverColor: 0x2a0050 },
      { key: 'vip',   icon: '💋', color: 0x00150a, hoverColor: 0x002518 },
      { key: 'fixer', icon: '🔧', color: 0x1a1000, hoverColor: 0x2a1800 },
    ];

    const startY  = 75;
    const spacing = (H * 0.86 - startY) / 3;
    const cW      = W * 0.88;
    const cx      = W / 2;

    cabinetData.forEach((cab, i) => {
      const cy   = startY + i * spacing + spacing / 2;
      const data = content[cab.key];

      this.buildCabinet(cx, cy, cW, spacing - 8, cab, data, lang);
    });
  }

  buildCabinet(cx, cy, cW, cH, cab, data, lang) {
    const g = this.add.graphics().setDepth(3);

    // Cabinet background
    g.fillStyle(cab.color);
    g.fillRoundedRect(cx - cW / 2, cy - cH / 2, cW, cH, 8);
    g.lineStyle(2, 0x440088, 0.9);
    g.strokeRoundedRect(cx - cW / 2, cy - cH / 2, cW, cH, 8);

    // Door frame top band
    g.fillStyle(0x1a0040, 0.8);
    g.fillRoundedRect(cx - cW / 2, cy - cH / 2, cW, 32, { tl: 8, tr: 8, bl: 0, br: 0 });

    // Icon
    this.add.text(cx - cW / 2 + 16, cy - cH / 2 + 14, cab.icon, {
      fontSize: '18px',
    }).setOrigin(0, 0.5).setDepth(5);

    // Title
    this.add.text(cx - cW / 2 + 48, cy - cH / 2 + 14, data.title[lang] || data.title.en, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#cc88ff',
    }).setOrigin(0, 0.5).setDepth(5);

    // Offer text
    this.add.text(cx - cW / 2 + 12, cy - cH / 2 + 42, data.offer[lang] || data.offer.en, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#aaaaaa',
      wordWrap: { width: cW - 24 },
    }).setOrigin(0, 0).setDepth(5);

    // Buttons YES / NO
    const btnY  = cy + cH / 2 - 24;
    const btnW  = cW * 0.40;
    const btnH  = 32;
    const yesX  = cx - btnW / 2 - 6;
    const noX   = cx + btnW / 2 + 6;

    this.buildCabBtn(yesX, btnY, btnW, btnH, data.yes[lang] || data.yes.en, '#00ff88', 0x003d1a, 0x005a26, () => this.onChoice(cab.key, true));
    this.buildCabBtn(noX,  btnY, btnW, btnH, data.no[lang]  || data.no.en,  '#ff4444', 0x3d0000, 0x5a0000, () => this.onChoice(cab.key, false));
  }

  buildCabBtn(x, y, w, h, label, textColor, bgNorm, bgHover, callback) {
    const bg = this.add.rectangle(x, y, w, h, bgNorm)
      .setStrokeStyle(1, 0x663399)
      .setInteractive()
      .setDepth(6);

    this.add.text(x, y, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: textColor,
    }).setOrigin(0.5).setDepth(7);

    bg.on('pointerover',  () => bg.setFillStyle(bgHover));
    bg.on('pointerout',   () => bg.setFillStyle(bgNorm));
    bg.on('pointerdown',  () => {
      bg.setFillStyle(bgNorm);
      callback();
    });
  }

  // ─── CHOICES ─────────────────────────────────────────────────────────────────

  onChoice(key, accept) {
    if (key === 'luis')  this.resolveLuis(accept);
    if (key === 'vip')   this.resolveVIP(accept);
    if (key === 'fixer') this.resolveFixer(accept);
  }

  resolveLuis(accept) {
    if (accept) {
      GameState.stash         = (GameState.stash || 0) + 300;
      GameState.fbiSuspicion  = Math.min(100, (GameState.fbiSuspicion || 0) + 15);
      GameState.characterMemory.overdoseEvents = (GameState.characterMemory.overdoseEvents || 0) + 1;
      this.showResult(
        this.lang === 'ru' ? '+$300 тайник | FBI +15%' : '+$300 stash | FBI +15%',
        '#ff8800',
      );
    } else {
      this.showResult(
        this.lang === 'ru' ? 'Луис уходит. Чисто.' : 'Luis leaves. Clean.',
        '#40ff80',
      );
    }
  }

  resolveVIP(accept) {
    if (accept) {
      const success = Math.random() < 0.70;
      if (success) {
        GameState.stash      = (GameState.stash || 0) + 500;
        GameState.reputation = Math.min(100, (GameState.reputation || 50) + 10);
        this.showResult(
          this.lang === 'ru' ? '+$500 тайник | REP +10 ✓' : '+$500 stash | REP +10 ✓',
          '#ffd700',
        );
      } else {
        GameState.reputation    = Math.max(0, (GameState.reputation || 50) - 15);
        GameState.fbiSuspicion  = Math.min(100, (GameState.fbiSuspicion || 0) + 20);
        GameState.nightStats.fights = (GameState.nightStats.fights || 0) + 1;
        this.showResult(
          this.lang === 'ru' ? 'Скандал! REP −15 | FBI +20' : 'Scandal! REP −15 | FBI +20',
          '#ff4444',
        );
        this.cameras.main.shake(200, 0.012);
      }
    } else {
      GameState.reputation = Math.max(0, (GameState.reputation || 50) - 3);
      this.showResult(
        this.lang === 'ru' ? 'Отказ. REP −3' : 'Denied. REP −3',
        '#888888',
      );
    }
  }

  resolveFixer(accept) {
    const isTrap = GameState.fbiSuspicion >= 70;

    if (accept) {
      const totalFunds = (GameState.velvetBox || 0) + (GameState.stash || 0);
      if (totalFunds < 800) {
        this.showResult(
          this.lang === 'ru' ? 'Недостаточно денег!' : 'Not enough funds!',
          '#ff4444',
        );
        return;
      }

      // Deduct $800
      let rem = 800;
      if ((GameState.velvetBox || 0) >= rem) {
        GameState.velvetBox -= rem;
      } else {
        rem -= (GameState.velvetBox || 0);
        GameState.velvetBox = 0;
        GameState.stash = Math.max(0, (GameState.stash || 0) - rem);
      }

      if (isTrap && Math.random() < 0.50) {
        // FBI agent — raid triggered
        GameState.fbiSuspicion = Math.min(100, (GameState.fbiSuspicion || 0) + 30);
        this.showResult(
          this.lang === 'ru' ? '⚠️ ЛОВУШКА! FBI +30 | −$800' : '⚠️ TRAP! FBI +30 | −$800',
          '#ff2222',
        );
        this.cameras.main.shake(350, 0.018);
        this.cameras.main.flash(180, 255, 0, 0);
        this.time.delayedCall(1200, () => this.closeScene());
      } else {
        GameState.fbiSuspicion = Math.max(0, (GameState.fbiSuspicion || 0) - 20);
        this.showResult(
          this.lang === 'ru' ? 'Чисто. FBI −20% | −$800' : 'Clean. FBI −20% | −$800',
          '#40ff80',
        );
      }
    } else {
      this.showResult(
        this.lang === 'ru' ? 'Вы уходите. Ничего не изменилось.' : 'You walk. Nothing changed.',
        '#888888',
      );
    }
  }

  // ─── RESULT TOAST ────────────────────────────────────────────────────────────

  showResult(msg, color) {
    SaveSystem.save();

    const W = this.W, H = this.H;

    // Dim overlay
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55)
      .setDepth(20).setInteractive();

    const panel = this.add.rectangle(W / 2, H / 2, W * 0.82, 100, 0x0a0018)
      .setStrokeStyle(2, 0xaa44ff)
      .setDepth(21);

    const txt = this.add.text(W / 2, H / 2 - 14, msg, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color,
      align: 'center',
      wordWrap: { width: W * 0.74 },
    }).setOrigin(0.5).setDepth(22);

    const closeTxt = this.add.text(W / 2, H / 2 + 30,
      this.lang === 'ru' ? '— ЗАКРЫТЬ —' : '— CLOSE —', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#666666',
      backgroundColor: '#111111',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(22).setInteractive();

    closeTxt.on('pointerdown', () => {
      overlay.destroy(); panel.destroy(); txt.destroy(); closeTxt.destroy();
    });

    overlay.on('pointerdown', () => {
      overlay.destroy(); panel.destroy(); txt.destroy(); closeTxt.destroy();
    });

    // Update HUD
    this.refreshHUD();
  }

  // ─── HUD ────────────────────────────────────────────────────────────────────

  buildHUD(W, H) {
    const y = H * 0.88;

    this.add.rectangle(W / 2, y, W, 44, 0x08001a).setDepth(10);
    this.add.graphics().setDepth(10).lineStyle(1, PURPLE, 0.6)
      .beginPath().moveTo(0, y - 22).lineTo(W, y - 22).strokePath();

    this.hudStash = this.add.text(20, y, `💰$${GameState.stash || 0}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ffd700',
    }).setOrigin(0, 0.5).setDepth(11);

    this.hudFBI = this.add.text(W / 2, y, `FBI ${GameState.fbiSuspicion || 0}%`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: this.fbiBadgeColor(),
    }).setOrigin(0.5).setDepth(11);

    this.hudRep = this.add.text(W - 20, y, `REP ${GameState.reputation || 50}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#aaddff',
    }).setOrigin(1, 0.5).setDepth(11);
  }

  fbiBadgeColor() {
    const f = GameState.fbiSuspicion || 0;
    if (f >= 70) return '#ff2222';
    if (f >= 40) return '#ff8800';
    return '#40ff80';
  }

  refreshHUD() {
    this.hudStash?.setText(`💰$${GameState.stash || 0}`);
    this.hudFBI?.setText(`FBI ${GameState.fbiSuspicion || 0}%`).setColor(this.fbiBadgeColor());
    this.hudRep?.setText(`REP ${GameState.reputation || 50}`);
  }

  // ─── BACK BUTTON ────────────────────────────────────────────────────────────

  buildBackBtn(W, H) {
    const lang = this.lang;
    this.add.text(W / 2, H * 0.95, lang === 'ru' ? '← КЛУБ' : '← CLUB', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#666666',
      backgroundColor: '#111111',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(15).setInteractive()
      .on('pointerdown', () => this.closeScene());
  }

  closeScene() {
    SaveSystem.save();
    this.scene.stop('Bathroom');
    const club = this.scene.get('Club');
    if (club && this.scene.isSleeping('Club')) {
      this.scene.resume('Club');
    } else if (club) {
      this.scene.resume('Club');
    }
  }

  // ─── SIGN FLICKER ────────────────────────────────────────────────────────────

  flickerSign() {
    if (!this.neonSign) return;
    const orig = this.neonSign.alpha;
    this.tweens.add({
      targets: this.neonSign,
      alpha: 0.1,
      duration: 60,
      yoyo: true,
      repeat: 1,
      onComplete: () => this.neonSign?.setAlpha(orig),
    });
  }
}
