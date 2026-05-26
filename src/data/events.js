// Random macro-events that can trigger during a night.
// Each event has soft/medium text variants and a resolve() effect on GameState.
export const NIGHT_EVENTS = [
  {
    id: 'bianca_horse',
    unlockNight: 2,
    chance: 0.12,
    title: { ru: '🐴 БЬЯНКА И КОНЬ!', en: '🐴 BIANCA & THE HORSE!' },
    body_soft: {
      ru: 'Знаменитая тусовщица хочет въехать на танцпол верхом на лошади!\nПрибыль: +$800 Хайп\nРиск: 40% — ущерб $400',
      en: 'Famous socialite wants to ride a horse onto the dance floor!\nGain: +$800 Hype\nRisk: 40% — damage $400',
    },
    body_medium: {
      ru: 'Бьянка Ягуар появилась у входа верхом. Охрана в шоке.\n+40% репутации ИЛИ $400 ущерба бару.',
      en: 'Bianca Jaguar arrived on horseback. Security is stunned.\n+40% reputation OR $400 bar damage.',
    },
    choices: [
      { key: 'allow', label: { ru: 'ВПУСТИТЬ', en: 'ALLOW' } },
      { key: 'deny',  label: { ru: 'ОТКАЗАТЬ', en: 'DENY'  } },
    ],
    resolve(choice, GameState) {
      if (choice === 'allow') {
        GameState.velvetBox  += 800;
        GameState.reputation  = Math.min(100, GameState.reputation + 15);
        if (Math.random() < 0.4) {
          GameState.velvetBox -= 400;
          return { ok: false, msg_key: 'ev_fight' };
        }
        return { ok: true, msg_key: 'ev_celeb_in' };
      }
      return { ok: true, msg_key: null };
    },
  },

  {
    id: 'drug_deal',
    unlockNight: 1,
    chance: 0.15,
    title_soft:   { ru: '💊 ПОДОЗРИТЕЛЬНАЯ СДЕЛКА', en: '💊 SUSPICIOUS DEAL' },
    title_medium: { ru: '💊 СДЕЛКА С ПОРОШКОМ',     en: '💊 COCAINE DEAL' },
    body_soft: {
      ru: 'В углу происходит что-то странное. Реагируешь?',
      en: 'Something strange happening in the corner. You react?',
    },
    body_medium: {
      ru: 'Охрана доложила о сделке в туалете. Что делаешь?',
      en: 'Security reports a deal in the restroom. What do you do?',
    },
    choices: [
      { key: 'ignore',  label: { ru: 'ИГНОРИРОВАТЬ', en: 'IGNORE' } },
      { key: 'bribe',   label: { ru: 'ДАТЬ ВЗЯТКУ',  en: 'BRIBE' } },
      { key: 'call_out',label: { ru: 'ВЫГНАТЬ',       en: 'KICK OUT' } },
    ],
    resolve(choice, GameState) {
      if (choice === 'ignore') {
        GameState.policeHeat = Math.min(100, GameState.policeHeat + 10);
        return { ok: true, delta: 0 };
      }
      if (choice === 'bribe') {
        const bribeCost = 200;
        if (GameState.velvetBox >= bribeCost) {
          GameState.velvetBox -= bribeCost;
          GameState.stash += 500; // dealer is grateful
        }
        return { ok: true, delta: -bribeCost };
      }
      // kick out
      GameState.reputation = Math.max(0, GameState.reputation - 5);
      return { ok: true, delta: 0 };
    },
  },

  {
    id: 'vip_room',
    unlockNight: 2,
    chance: 0.10,
    title_soft:   { ru: '💋 ЗАКРЫТАЯ ВЕЧЕРИНКА', en: '💋 PRIVATE AFTER-PARTY' },
    title_medium: { ru: '💋 ИНЦИДЕНТ В VIP',      en: '💋 VIP ROOM INCIDENT' },
    body_soft: {
      ru: 'Кто-то устраивает закрытую вечеринку в подсобке. Позволить?',
      en: 'Someone is hosting a private party in the back room. Allow?',
    },
    body_medium: {
      ru: 'Две звезды уединились в VIP-номере. Скандальные фото обойдутся дорого или поднимут хайп.',
      en: 'Two stars slipped into the VIP room. Scandalous photos mean big trouble or big hype.',
    },
    choices: [
      { key: 'allow',  label: { ru: 'РАЗРЕШИТЬ', en: 'ALLOW' } },
      { key: 'deny',   label: { ru: 'ЗАПРЕТИТЬ', en: 'FORBID' } },
    ],
    resolve(choice, GameState) {
      if (choice === 'allow') {
        if (Math.random() < 0.5) {
          // Scandal → police
          GameState.policeHeat = Math.min(100, GameState.policeHeat + 20);
          return { ok: false, msg: 'SCANDAL!' };
        }
        GameState.reputation = Math.min(100, GameState.reputation + 20);
        GameState.velvetBox += 600;
        return { ok: true, msg: '+HYPE!' };
      }
      return { ok: true, msg: null };
    },
  },

  {
    id: 'corrupt_cop',
    unlockNight: 1,
    chance: 0.13,
    title_soft:   { ru: '🤝 СМАЗАЛИ РУКИ',   en: '🤝 GREASED PALMS' },
    title_medium: { ru: '💵 ОФИЦЕР У ВХОДА', en: '💵 OFFICER AT THE DOOR' },
    body_soft: {
      ru: 'Полицейский намекает, что всё может «исчезнуть» за небольшое вознаграждение.',
      en: 'An officer hints that everything can disappear for a small fee.',
    },
    body_medium: {
      ru: 'Детектив Коллинз ждёт в переулке. $500 и он не заметит ФБР-интерес к вашему клубу.',
      en: 'Detective Collins is waiting in the alley. $500 and he forgets the FBI tip.',
    },
    choices: [
      { key: 'bribe',  label: { ru: 'ДАТЬ $500',  en: 'PAY $500' } },
      { key: 'refuse', label: { ru: 'ОТКАЗАТЬ',   en: 'REFUSE'   } },
    ],
    resolve(choice, GameState) {
      if (choice === 'bribe') {
        if (GameState.velvetBox >= 500 || GameState.stash >= 500) {
          const fromVelvet = Math.min(500, GameState.velvetBox);
          GameState.velvetBox -= fromVelvet;
          if (fromVelvet < 500) GameState.stash -= (500 - fromVelvet);
          GameState.fbiSuspicion = Math.max(0, GameState.fbiSuspicion - 25);
          GameState.policeHeat   = Math.max(0, GameState.policeHeat   - 30);
          return { ok: true, delta: -500 };
        }
        return { ok: false, msg: 'NOT ENOUGH!' };
      }
      // refuse — cop files a report
      GameState.policeHeat = Math.min(100, GameState.policeHeat + 15);
      return { ok: true, delta: 0 };
    },
  },
];
