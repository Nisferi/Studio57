// Random macro-events that trigger during a night.
// Each event has safe/adult/max text variants.
// resolve() modifies GameState directly; NightScene syncs velvetBox before/after.
export const NIGHT_EVENTS = [
  {
    id: 'bianca_horse',
    unlockNight: 2,
    chance: 0.12,
    title_safe:   { ru: '🐴 БЬЯНКА И КОНЬ!',        en: '🐴 BIANCA & THE HORSE!' },
    title_adult:  { ru: '🐴 БЬЯНКА ВЕРХОМ!',         en: '🐴 BIANCA ON HORSEBACK!' },
    title_max:    { ru: '🐴 БЬЯНКА. КОНЬ. ШОУ.',     en: '🐴 BIANCA. HORSE. SCENE.' },
    body_safe: {
      ru: 'Знаменитая тусовщица хочет въехать на танцпол верхом на лошади!\nПрибыль: +$800 Хайп\nРиск: 40% — ущерб $400',
      en: 'Famous socialite wants to ride a horse onto the dance floor!\nGain: +$800 Hype\nRisk: 40% — damage $400',
    },
    body_adult: {
      ru: 'Бьянка Ягуар появилась у входа верхом. В мини-платье. Охрана в шоке.\n+40% репутации ИЛИ $400 ущерба бару.',
      en: 'Bianca Jaguar arrived on horseback. In a minidress. Security stunned.\n+40% reputation OR $400 bar damage.',
    },
    body_max: {
      ru: 'Бьянка Ягуар въехала на белом жеребце прямо сквозь толпу — в том, чём мать родила под норковой шубой. Толпа взорвалась. Журналисты сошли с ума.',
      en: 'Bianca Jaguar rode a white stallion through the crowd — wearing nothing under the mink coat. The crowd erupted. Journalists went insane.',
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
          return { ok: false, msg: 'CHAOS! -$400' };
        }
        return { ok: true, msg: 'HYPE! +$800' };
      }
      return { ok: true, msg: null };
    },
  },

  {
    id: 'drug_deal',
    unlockNight: 1,
    chance: 0.15,
    title_safe:   { ru: '💊 ПОДОЗРИТЕЛЬНАЯ СДЕЛКА', en: '💊 SUSPICIOUS DEAL' },
    title_adult:  { ru: '💊 СДЕЛКА С ПОРОШКОМ',     en: '💊 COCAINE DEAL' },
    title_max:    { ru: '💊 КОКАИН В ТУАЛЕТЕ',       en: '💊 COKE IN THE RESTROOM' },
    body_safe: {
      ru: 'В углу происходит что-то странное. Охрана смотрит вопросительно.',
      en: 'Something strange happening in the corner. Security looks to you.',
    },
    body_adult: {
      ru: 'Охрана доложила о сделке в мужском туалете. Дилер — постоянный клиент. Что делаешь?',
      en: 'Security reports a deal in the restroom. The dealer is a regular. What do you do?',
    },
    body_max: {
      ru: 'Виктор — в туалете трое на зеркале. Белая линия, свёрнутая купюра. Дилер подмигивает: «Всем от нас привет, шеф». Мелкий риск или мелкий доход?',
      en: 'Victor — three guys in the restroom, on the mirror. White line, rolled bill. The dealer winks: "Compliments of the house, boss." Small risk or small gain?',
    },
    choices: [
      { key: 'ignore',   label: { ru: 'ИГНОРИРОВАТЬ', en: 'IGNORE'   } },
      { key: 'bribe',    label: { ru: 'КРЫШЕВАТЬ',    en: 'PROTECT'  } },
      { key: 'call_out', label: { ru: 'ВЫГНАТЬ',      en: 'KICK OUT' } },
    ],
    resolve(choice, GameState) {
      if (choice === 'ignore') {
        GameState.policeHeat = Math.min(100, GameState.policeHeat + 10);
        return { ok: true, msg: 'Police heat +10', delta: 0 };
      }
      if (choice === 'bribe') {
        const cost = 200;
        if (GameState.velvetBox >= cost) {
          GameState.velvetBox -= cost;
          GameState.stash     += 500;
          return { ok: true, msg: '-$200 → STASH +$500' };
        }
        return { ok: false, msg: 'NOT ENOUGH CASH!' };
      }
      GameState.reputation = Math.max(0, GameState.reputation - 5);
      return { ok: true, msg: 'Rep -5' };
    },
  },

  {
    id: 'vip_room',
    unlockNight: 2,
    chance: 0.10,
    title_safe:   { ru: '💋 ЗАКРЫТАЯ ВЕЧЕРИНКА', en: '💋 PRIVATE PARTY' },
    title_adult:  { ru: '💋 ИНЦИДЕНТ В VIP',      en: '💋 VIP INCIDENT' },
    title_max:    { ru: '💋 VIP НОМЕР — ЧТО-ТО ПРОИСХОДИТ', en: '💋 VIP ROOM — SOMETHING\'S HAPPENING' },
    body_safe: {
      ru: 'Кто-то устроил закрытую вечеринку в подсобке. Риск скандала. Выгода — хайп.',
      en: 'Someone is hosting a private party in the back room. Risk of scandal. Gain: hype.',
    },
    body_adult: {
      ru: 'Две звезды заперлись в VIP. Охрана слышит смех. Журналист Daily Post топчется снаружи.',
      en: 'Two stars locked themselves in the VIP room. Security hears laughter. A Daily Post reporter is outside.',
    },
    body_max: {
      ru: 'Охранник Виктор доложил: в VIP-номере четыре звезды, два журналиста, белый порошок на столике и нижнее бельё на полу. Хайп или катастрофа?',
      en: 'Guard Victor reports: 4 stars in the VIP room, 2 journalists, white powder on the table, underwear on the floor. Hype or disaster?',
    },
    choices: [
      { key: 'allow', label: { ru: 'РАЗРЕШИТЬ',  en: 'ALLOW'  } },
      { key: 'deny',  label: { ru: 'ЗАПРЕТИТЬ',  en: 'FORBID' } },
    ],
    resolve(choice, GameState) {
      if (choice === 'allow') {
        if (Math.random() < 0.5) {
          GameState.policeHeat = Math.min(100, GameState.policeHeat + 20);
          return { ok: false, msg: 'SCANDAL! Police +20' };
        }
        GameState.reputation = Math.min(100, GameState.reputation + 20);
        GameState.velvetBox  += 600;
        return { ok: true, msg: 'HYPE! Rep +20, +$600' };
      }
      return { ok: true, msg: null };
    },
  },

  {
    id: 'corrupt_cop',
    unlockNight: 1,
    chance: 0.13,
    title_safe:   { ru: '🤝 СМАЗАЛИ РУКИ',   en: '🤝 GREASED PALMS'     },
    title_adult:  { ru: '💵 КОП У ВХОДА',    en: '💵 COP AT THE DOOR'   },
    title_max:    { ru: '💵 ДЕТ. КОЛЛИНЗ',   en: '💵 DET. COLLINS'      },
    body_safe: {
      ru: 'Полицейский намекает, что всё может «исчезнуть» за небольшое вознаграждение.',
      en: 'An officer hints that things can disappear for a small fee.',
    },
    body_adult: {
      ru: 'Детектив Коллинз ждёт в переулке. $500 — и он не заметит интерес ФБР к вашему клубу.',
      en: 'Detective Collins is waiting in the alley. $500 and he forgets the FBI tip.',
    },
    body_max: {
      ru: 'Коллинз показывает папку. Там ксерокс вашей бухгалтерии. «Пятьсот, Виктор. Иначе это уйдёт наверх. У меня семья». Жирный ублюдок щурится.',
      en: 'Collins shows a folder. A xerox of your ledger. "$500, Victor. Otherwise this goes up the chain. I got a family." The fat bastard squints at you.',
    },
    choices: [
      { key: 'bribe',  label: { ru: 'ДАТЬ $500',  en: 'PAY $500' } },
      { key: 'refuse', label: { ru: 'ОТКАЗАТЬ',   en: 'REFUSE'   } },
    ],
    resolve(choice, GameState) {
      if (choice === 'bribe') {
        const total = 500;
        const fromVelvet = Math.min(total, GameState.velvetBox);
        const remaining  = total - fromVelvet;
        if (fromVelvet + GameState.stash >= total) {
          GameState.velvetBox    -= fromVelvet;
          GameState.stash        -= remaining;
          GameState.fbiSuspicion  = Math.max(0, GameState.fbiSuspicion - 25);
          GameState.policeHeat    = Math.max(0, GameState.policeHeat   - 30);
          return { ok: true, msg: 'FBI -25%, Police -30%' };
        }
        return { ok: false, msg: 'NOT ENOUGH CASH!' };
      }
      GameState.policeHeat = Math.min(100, GameState.policeHeat + 15);
      return { ok: true, msg: 'Police heat +15' };
    },
  },
];
