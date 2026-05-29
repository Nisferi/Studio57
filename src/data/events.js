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
        GameState.nightEarnings  += 800;
        GameState.reputation  = Math.min(100, GameState.reputation + 15);
        if (Math.random() < 0.4) {
          GameState.nightEarnings -= 400;
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
        if (GameState.nightEarnings >= cost) {
          GameState.nightEarnings -= cost;
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
        GameState.nightEarnings  += 600;
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
        const fromVelvet = Math.min(total, GameState.nightEarnings);
        const remaining  = total - fromVelvet;
        if (fromVelvet + GameState.stash >= total) {
          GameState.nightEarnings    -= fromVelvet;
          GameState.stash        -= remaining;
          GameState.fbiSuspicion  = Math.max(0, GameState.fbiSuspicion - 25);
          GameState.policeHeat    = Math.max(0, GameState.policeHeat   - 30);
          GameState.characterMemory.collins.bribeCount += 1;
          return { ok: true, msg: 'FBI -25%, Police -30%' };
        }
        return { ok: false, msg: 'NOT ENOUGH CASH!' };
      }
      // Refused Collins
      GameState.characterMemory.collins.refusedCount += 1;
      if (GameState.characterMemory.collins.refusedCount >= 3) {
        GameState.characterMemory.collins.hostile = true;
      }
      GameState.policeHeat = Math.min(100, GameState.policeHeat + 15);
      return { ok: true, msg: 'Police heat +15' };
    },
  },

  {
    id: 'journalist_at_door',
    unlockNight: 2,
    chance: 0.11,
    title_safe:   { ru: '📸 РЕПОРТЁР У ВХОДА',  en: '📸 REPORTER AT THE DOOR' },
    title_adult:  { ru: '📸 ПРЕССА ЖДЁТ',        en: '📸 PRESS IS WAITING'     },
    title_max:    { ru: '📸 DAILY POST',          en: '📸 DAILY POST'           },
    body_safe: {
      ru: 'Журналист хочет написать репортаж о клубе. Впустить — хайп. Отказать — тихо.',
      en: 'A journalist wants to write a piece about the club. Let in — hype. Refuse — keep quiet.',
    },
    body_adult: {
      ru: 'Репортёр Daily Post с камерой. Хочет снять звёзд. Может быть скандал, а может — реклама на первую полосу.',
      en: 'Daily Post reporter with a camera. Wants shots of the stars. Could be a scandal — or a front-page ad.',
    },
    body_max: {
      ru: 'Марк Харрис, Daily Post. «Виктор, у меня фото из VIP. Либо я пишу хорошую статью — либо плохую». Выбирай.',
      en: 'Mark Harris, Daily Post. "Victor, I have shots from the VIP. Either I write a good story — or a bad one." Choose.',
    },
    choices: [
      { key: 'allow',    label: { ru: 'ВПУСТИТЬ',     en: 'LET IN'  } },
      { key: 'exclusive',label: { ru: 'ЭКСКЛЮЗИВ',    en: 'EXCLUSIVE' } },
      { key: 'deny',     label: { ru: 'ОТКАЗАТЬ',     en: 'REFUSE'  } },
    ],
    resolve(choice, GameState) {
      if (choice === 'allow') {
        if (Math.random() < 0.35) {
          GameState.policeHeat = Math.min(100, GameState.policeHeat + 10);
          return { ok: false, msg: 'SCANDAL PHOTOS! Police +10' };
        }
        GameState.reputation = Math.min(100, GameState.reputation + 12);
        return { ok: true, msg: 'PRESS COVERAGE! Rep +12' };
      }
      if (choice === 'exclusive') {
        const cost = 300;
        if (GameState.nightEarnings >= cost) {
          GameState.nightEarnings  -= cost;
          GameState.reputation  = Math.min(100, GameState.reputation + 25);
          return { ok: true, msg: '-$300 → FRONT PAGE! Rep +25' };
        }
        return { ok: false, msg: 'NOT ENOUGH CASH!' };
      }
      return { ok: true, msg: 'Kept quiet.' };
    },
  },

  {
    id: 'brawl_entrance_random',
    unlockNight: 2,
    chance: 0.10,
    title_safe:   { ru: '⚔ ПЬЯНЫЙ У ВХОДА',   en: '⚔ DRUNK AT THE DOOR'   },
    title_adult:  { ru: '⚔ БОЙНЯ У ШНУРА',     en: '⚔ BRAWL AT THE ROPE'   },
    title_max:    { ru: '⚔ КРОВЬ НА ТРОТУАРЕ', en: '⚔ BLOOD ON THE SIDEWALK' },
    body_safe: {
      ru: 'Пьяный посетитель устроил скандал у входа. Нет охранника — никто не вмешивается.',
      en: 'A drunk patron is making a scene at the entrance. No bouncer — nobody steps in.',
    },
    body_adult: {
      ru: 'Пьяный Кевин бьёт Тони. Улица смотрит. Если не остановить — полиция приедет.',
      en: 'Drunk Kevin is swinging at Tony. The street is watching. Stop it or the cops come.',
    },
    body_max: {
      ru: 'Кровь на тротуаре. Двое дерутся, третий уже без сознания. Ваша охрана — это вы.',
      en: 'Blood on the sidewalk. Two fighting, one already down. Your security — is you.',
    },
    choices: [
      { key: 'intervene', label: { ru: 'ВМЕШАТЬСЯ',       en: 'STEP IN'       } },
      { key: 'call_cops', label: { ru: 'ВЫЗВАТЬ ПОЛИЦИЮ', en: 'CALL THE COPS' } },
      { key: 'ignore',    label: { ru: 'ЗАКРЫТЬ ДВЕРЬ',   en: 'CLOSE THE DOOR' } },
    ],
    resolve(choice, GameState) {
      if (choice === 'intervene') {
        GameState.reputation = Math.max(0, GameState.reputation - 3);
        GameState.policeHeat = Math.min(100, GameState.policeHeat + 5);
        return { ok: true, msg: 'Broke it up. REP -3.' };
      }
      if (choice === 'call_cops') {
        GameState.policeHeat = Math.min(100, GameState.policeHeat + 25);
        GameState.fbiSuspicion = Math.min(100, GameState.fbiSuspicion + 5);
        return { ok: false, msg: 'Cops came. HEAT +25.' };
      }
      GameState.reputation = Math.max(0, GameState.reputation - 5);
      GameState.policeHeat = Math.min(100, GameState.policeHeat + 15);
      return { ok: false, msg: 'Escalated! REP -5.', dmgToVelvet: 400 };
    },
  },

  {
    id: 'collins_escalation',
    unlockNight: 6,
    chance: 0.20,
    title_safe:   { ru: '🚔 ЗНАКОМЫЙ КОП',        en: '🚔 FAMILIAR COP'          },
    title_adult:  { ru: '🚔 КОЛЛИНЗ ХОЧЕТ БОЛЬШЕ', en: '🚔 COLLINS WANTS MORE'    },
    title_max:    { ru: '🚔 КОЛЛИНЗ: ЭТО ПОСЛЕДНИЙ РАЗ', en: '🚔 COLLINS: LAST CHANCE' },
    body_safe: {
      ru: 'Полицейский намекает, что его терпение не безграничное. Хочет компенсацию.',
      en: "An officer hints his patience isn't unlimited. He wants compensation.",
    },
    body_adult: {
      ru: 'Коллинз злой. «Тысяча. Сейчас. Или я перестаю смотреть в другую сторону».',
      en: 'Collins is angry. "A grand. Right now. Or I stop looking the other way."',
    },
    body_max: {
      ru: 'Коллинз ставит папку на стол. «$1000. Или ваш клуб закрывается в пятницу. Это не шантаж — это счёт за услуги». Улыбается.',
      en: 'Collins slaps a folder on the desk. "$1000. Or your club closes Friday. This isn\'t blackmail — it\'s a service invoice." He smiles.',
    },
    choices: [
      { key: 'pay',    label: { ru: 'ЗАПЛАТИТЬ $1000', en: 'PAY $1000'   } },
      { key: 'refuse', label: { ru: 'ОТКАЗАТЬ',         en: 'REFUSE'      } },
    ],
    resolve(choice, GameState) {
      if (choice === 'pay') {
        const total = 1000;
        const fromVelvet = Math.min(total, GameState.nightEarnings);
        const remaining  = total - fromVelvet;
        if (fromVelvet + GameState.stash >= total) {
          GameState.nightEarnings  -= fromVelvet;
          GameState.stash      -= remaining;
          GameState.fbiSuspicion = Math.max(0, GameState.fbiSuspicion - 30);
          GameState.policeHeat   = Math.max(0, GameState.policeHeat   - 35);
          GameState.characterMemory.collins.bribeCount += 1;
          return { ok: true, msg: '-$1000 → FBI -30% Police -35%' };
        }
        return { ok: false, msg: 'NOT ENOUGH CASH!' };
      }
      GameState.characterMemory.collins.refusedCount += 1;
      if (GameState.characterMemory.collins.refusedCount >= 2) {
        GameState.characterMemory.collins.hostile = true;
      }
      GameState.fbiSuspicion = Math.min(100, GameState.fbiSuspicion + 20);
      GameState.policeHeat   = Math.min(100, GameState.policeHeat   + 20);
      return { ok: false, msg: 'Collins angry! FBI +20% Heat +20%' };
    },
  },

  {
    id: 'irs_audit_letter',
    unlockNight: 3,
    chance: 0.09,
    title_safe:   { ru: '✉️ ПИСЬМО ОТ IRS',      en: '✉️ IRS LETTER'          },
    title_adult:  { ru: '✉️ НАЛОГОВАЯ ПРОВЕРКА', en: '✉️ TAX AUDIT NOTICE'    },
    title_max:    { ru: '✉️ ЭТО АГЕНТ ХЬЮЗ',     en: '✉️ AGENT HUGHES'        },
    body_safe: {
      ru: 'Налоговая служба прислала предупреждение. Возможна проверка. Лучше вывести часть денег.',
      en: 'The IRS sent a warning notice. Audit possible. Better to move some funds.',
    },
    body_adult: {
      ru: 'Официальное уведомление об аудите. У вас 48 часов. Тайник — риск. Задекларировать — потеря 30%.',
      en: 'Official audit notice. 48 hours. The stash is a risk. Declare — lose 30%. Panic or act smart.',
    },
    body_max: {
      ru: 'Агент Дональд Хьюз, IRS. Знает про мусорные мешки. Знает про вентиляцию. «Советую задекларировать до пятницы». Или рискнуть?',
      en: 'Agent Donald Hughes, IRS. Knows about the trash bags. Knows about the vents. "I suggest you declare by Friday." Or gamble?',
    },
    choices: [
      { key: 'declare', label: { ru: 'ЗАДЕКЛАРИРОВАТЬ (−30%)', en: 'DECLARE (−30%)' } },
      { key: 'hide',    label: { ru: 'СПРЯТАТЬ В ТАЙНИК',      en: 'HIDE IN STASH'  } },
      { key: 'ignore',  label: { ru: 'ИГНОРИРОВАТЬ',           en: 'IGNORE'         } },
    ],
    resolve(choice, GameState) {
      if (choice === 'declare') {
        const tax = Math.round(GameState.nightEarnings * 0.30);
        GameState.nightEarnings    -= tax;
        GameState.totalTaxPaid += tax;
        GameState.fbiSuspicion  = Math.max(0, GameState.fbiSuspicion - 20);
        return { ok: true, msg: `-$${tax} taxes → FBI -20%` };
      }
      if (choice === 'hide') {
        const moved = Math.round(GameState.nightEarnings * 0.5);
        GameState.nightEarnings    -= moved;
        GameState.stash        += moved;
        GameState.fbiSuspicion  = Math.min(100, GameState.fbiSuspicion + 15);
        GameState.characterMemory.hughes.evadedCount += 1;
        return { ok: true, msg: `STASH +$${moved} | FBI +15%` };
      }
      // ignore
      GameState.fbiSuspicion = Math.min(100, GameState.fbiSuspicion + 25);
      return { ok: false, msg: 'FBI INTEREST +25%!' };
    },
  },
];
