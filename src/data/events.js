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

  {
    id: 'irs_audit_escalation',
    unlockNight: 7,
    chance: 0.22,
    title_safe:  { ru: '📋 ПИСЬМО ОТ IRS',         en: '📋 LETTER FROM THE IRS'       },
    title_adult: { ru: '📋 НАЛОГОВАЯ ПРОВЕРКА',     en: '📋 TAX AUDIT NOTICE'           },
    title_max:   { ru: '📋 IRS AUDIT — ТЕБЯ ЖДУТ', en: '📋 IRS AUDIT — THEY WANT YOU' },
    body_safe: {
      ru: 'Заказное письмо. Налоговая служба хочет объяснений по доходам за прошлый квартал.',
      en: 'Certified mail. The IRS wants an explanation for last quarter\'s income figures.',
    },
    body_adult: {
      ru: 'Арни бледный: «Они уже смотрят на наш кэш. Если тайник найдут — это уголовное».',
      en: "Arnie is pale: \"They're already looking at our cash. If they find the stash — that's criminal.\"",
    },
    body_max: {
      ru: 'Детальный запрос — суммы, даты, имена. Они либо знают, либо догадываются. Арни хочет нанять дорогого адвоката.',
      en: 'Detailed request — amounts, dates, names. They either know or suspect. Arnie wants to hire an expensive lawyer.',
    },
    choices: [
      { key: 'ignore',    label: { ru: 'ИГНОРИРОВАТЬ',        en: 'IGNORE IT'         } },
      { key: 'accountant',label: { ru: 'НАНЯТЬ БУХГАЛТЕРА',   en: 'HIRE AN ACCOUNTANT'} },
      { key: 'destroy',   label: { ru: 'УНИЧТОЖИТЬ ЗАПИСИ',   en: 'DESTROY THE RECORDS'} },
    ],
    resolve(choice, gs) {
      if (choice === 'ignore') {
        gs.fbiSuspicion = Math.min(100, gs.fbiSuspicion + 20);
        return { ok: false, msg: 'Ignored. FBI suspicion +20%.' };
      }
      if (choice === 'accountant') {
        const cost = 500;
        gs.nightEarnings  = Math.max(0, gs.nightEarnings - cost);
        gs.fbiSuspicion   = Math.max(0, gs.fbiSuspicion - 15);
        return { ok: true, msg: `-$${cost} accountant. FBI -15%.` };
      }
      // destroy records
      gs.fbiSuspicion = Math.min(100, gs.fbiSuspicion + 8);
      return { ok: false, msg: 'Records gone. But they noticed. FBI +8%.' };
    },
  },

  {
    id: 'fire_inspector',
    unlockNight: 8,
    chance: 0.18,
    title_safe:  { ru: '🚒 ПОЖАРНЫЙ ИНСПЕКТОР',   en: '🚒 FIRE INSPECTOR'      },
    title_adult: { ru: '🚒 ИНСПЕКТОР ХОЧЕТ ЧТО-ТО', en: '🚒 INSPECTOR WANTS SOMETHING' },
    title_max:   { ru: '🚒 ИНСПЕКТОР И КОНВЕРТ',  en: '🚒 INSPECTOR AND THE ENVELOPE' },
    body_safe: {
      ru: 'Пожарный инспектор прибыл с проверкой. Танцпол переполнен — нарушение норм.',
      en: 'Fire inspector arrived for a check. Dance floor is over capacity — violation.',
    },
    body_adult: {
      ru: 'Инспектор намекает: $300 в конверте — и все нарушения исчезнут до следующего квартала.',
      en: 'The inspector hints: $300 in an envelope — and all violations disappear until next quarter.',
    },
    body_max: {
      ru: 'Инспектор пьян, его рука уже тянется к кошельку. «Пятьсот или закрываем вас завтра, понятно?»',
      en: 'The inspector is drunk, his hand already reaching for the envelope. "Five hundred or we shut you down tomorrow, understood?"',
    },
    choices: [
      { key: 'bribe',   label: { ru: 'ДАТЬ ВЗЯТКУ ($300)',    en: 'BRIBE ($300)'         } },
      { key: 'comply',  label: { ru: 'СОБЛЮДАТЬ НОРМЫ',       en: 'COMPLY WITH RULES'    } },
      { key: 'ignore',  label: { ru: 'ВЫГНАТЬ ЕГО',           en: 'THROW HIM OUT'        } },
    ],
    resolve(choice, gs) {
      if (choice === 'bribe') {
        gs.nightEarnings  = Math.max(0, gs.nightEarnings - 300);
        gs.fbiSuspicion   = Math.min(100, gs.fbiSuspicion + 5);
        return { ok: true, msg: '-$300. He left happy. FBI +5%.' };
      }
      if (choice === 'comply') {
        gs.nightEarnings = Math.max(0, gs.nightEarnings - 200);
        gs.policeHeat    = Math.max(0, gs.policeHeat - 10);
        return { ok: true, msg: 'Bar closed 10 min. -$200. HEAT -10.' };
      }
      gs.policeHeat    = Math.min(100, gs.policeHeat + 25);
      gs.fbiSuspicion  = Math.min(100, gs.fbiSuspicion + 10);
      return { ok: false, msg: 'He called backup. HEAT +25, FBI +10%.' };
    },
  },

  {
    id: 'bathroom_incident',
    unlockNight: 9,
    chance: 0.14,
    title_safe:  { ru: '🚨 ЧП В ТУАЛЕТЕ',          en: '🚨 INCIDENT IN THE RESTROOM' },
    title_adult: { ru: '🚨 ПЕРЕДОЗ В ТУАЛЕТЕ',      en: '🚨 OVERDOSE IN THE RESTROOM' },
    title_max:   { ru: '🚨 ТЕЛО В ТРЕТЬЕЙ КАБИНКЕ', en: '🚨 BODY IN STALL THREE'      },
    body_safe: {
      ru: 'В туалете чрезвычайная ситуация. Охрана ждёт решения.',
      en: 'Emergency in the restroom. Security is waiting for your call.',
    },
    body_adult: {
      ru: 'Гость потерял сознание в кабинке. Возможно передоз. Скорая привлечёт полицию.',
      en: 'Guest passed out in a stall. Possible overdose. An ambulance will bring the police.',
    },
    body_max: {
      ru: 'Тело на полу, игла рядом. Охрана смотрит на тебя: «Мы вызываем скорую или нет?» У тебя 10 секунд.',
      en: 'Body on the floor, needle nearby. Security stares at you: "Do we call an ambulance or not?" Ten seconds.',
    },
    choices: [
      { key: 'ambulance', label: { ru: 'ВЫЗВАТЬ СКОРУЮ',      en: 'CALL AMBULANCE'    } },
      { key: 'quiet',     label: { ru: 'ВЫНЕСТИ ТИХО',        en: 'HANDLE QUIETLY'    } },
      { key: 'ignore',    label: { ru: 'ПРОДОЛЖАТЬ РАБОТУ',   en: 'KEEP THE MUSIC ON' } },
    ],
    resolve(choice, gs) {
      if (choice === 'ambulance') {
        gs.fbiSuspicion = Math.min(100, gs.fbiSuspicion + 18);
        gs.policeHeat   = Math.min(100, gs.policeHeat + 12);
        gs.reputation   = Math.min(100, gs.reputation + 5);
        return { ok: true, msg: 'Ambulance called. FBI +18%. HEAT +12. REP +5.' };
      }
      if (choice === 'quiet') {
        if (Math.random() < 0.45) {
          gs.fbiSuspicion = Math.min(100, gs.fbiSuspicion + 35);
          return { ok: false, msg: 'Witness saw. FBI +35%!' };
        }
        return { ok: true, msg: 'Handled quietly. Avoided press.' };
      }
      gs.reputation = Math.max(0, gs.reputation - 20);
      gs.fbiSuspicion = Math.min(100, gs.fbiSuspicion + 8);
      return { ok: false, msg: 'Word spread. REP -20. FBI +8%.' };
    },
  },

  {
    id: 'rival_club',
    unlockNight: 8,
    chance: 0.15,
    title_safe:  { ru: '🗡 КОНКУРЕНТ ДЕЙСТВУЕТ',    en: '🗡 RIVAL IS MOVING'         },
    title_adult: { ru: '🗡 КЛУБ «PARADISE» ПЛАТИТ', en: '🗡 PARADISE CLUB IS PAYING' },
    title_max:   { ru: '🗡 САБОТАЖ ОТ «PARADISE»',  en: '🗡 SABOTAGE FROM PARADISE'  },
    body_safe: {
      ru: 'Конкурирующий клуб переманивает ваших постоянных гостей. Репутация под угрозой.',
      en: 'A rival club is poaching your regulars. Your reputation is at risk.',
    },
    body_adult: {
      ru: 'Paradise Club нанял людей, которые шепчут в толпе что ваш бар продаёт левый алкоголь.',
      en: 'Paradise Club hired people whispering in your crowd that your bar sells bootleg liquor.',
    },
    body_max: {
      ru: '«Paradise» подкупил двух ваших охранников. Они уже договорились с конкурентом.',
      en: 'Paradise bribed two of your security guys. They\'ve already made a deal with the competition.',
    },
    choices: [
      { key: 'counter',  label: { ru: 'ОТВЕТИТЬ ТЕМ ЖЕ',    en: 'COUNTER-CAMPAIGN'  } },
      { key: 'pay',      label: { ru: 'ПЕРЕКУПИТЬ ОБРАТНО',  en: 'BUY THEM BACK'     } },
      { key: 'ignore',   label: { ru: 'ИГНОРИРОВАТЬ',        en: 'IGNORE IT'         } },
    ],
    resolve(choice, gs) {
      if (choice === 'counter') {
        gs.nightEarnings = Math.max(0, gs.nightEarnings - 200);
        gs.reputation    = Math.min(100, gs.reputation + 8);
        return { ok: true, msg: '-$200 campaign. REP +8.' };
      }
      if (choice === 'pay') {
        gs.nightEarnings = Math.max(0, gs.nightEarnings - 400);
        gs.reputation    = Math.min(100, gs.reputation + 3);
        return { ok: true, msg: '-$400 paid. Staff loyal again.' };
      }
      gs.reputation = Math.max(0, gs.reputation - 12);
      return { ok: false, msg: 'Ignored. REP -12.' };
    },
  },

  {
    id: 'license_threat',
    unlockNight: 12,
    chance: 0.20,
    title_safe:  { ru: '📜 УГРОЗА ЛИЦЕНЗИИ',       en: '📜 LICENSE THREAT'            },
    title_adult: { ru: '📜 ЧИНОВНИК ХОЧЕТ БОЛЬШЕ', en: '📜 OFFICIAL WANTS MORE'       },
    title_max:   { ru: '📜 ЛИЦЕНЗИЮ ХОТЯТ ОТОЗВАТЬ', en: '📜 THEY WANT TO PULL YOUR LICENSE' },
    body_safe: {
      ru: 'Городской инспектор грозит отозвать лицензию на работу клуба.',
      en: 'A city inspector threatens to revoke the club\'s operating license.',
    },
    body_adult: {
      ru: 'Чиновник из Комитета по лицензированию намекает: $1000 и всё уладится. Или $800 и адвокат.',
      en: 'Official from the Licensing Board hints: $1,000 and it goes away. Or $800 and a lawyer.',
    },
    body_max: {
      ru: 'Прямо говорит: «Дай тысячу, завтра бумаги исчезнут. Нет — клуб закрыт через 48 часов».',
      en: 'Straight up: "Give me a thousand, the papers disappear tomorrow. No — the club is closed in 48 hours."',
    },
    choices: [
      { key: 'bribe',  label: { ru: 'ЗАПЛАТИТЬ $1000',     en: 'PAY $1,000'          } },
      { key: 'lawyer', label: { ru: 'НАНЯТЬ АДВОКАТА $800', en: 'HIRE LAWYER $800'    } },
      { key: 'fight',  label: { ru: 'БОРОТЬСЯ ПУБЛИЧНО',   en: 'FIGHT IT PUBLICLY'   } },
    ],
    resolve(choice, gs) {
      if (choice === 'bribe') {
        gs.nightEarnings = Math.max(0, gs.nightEarnings - 1000);
        gs.fbiSuspicion  = Math.min(100, gs.fbiSuspicion + 12);
        return { ok: true, msg: '-$1000 paid. License safe. FBI +12%.' };
      }
      if (choice === 'lawyer') {
        gs.nightEarnings = Math.max(0, gs.nightEarnings - 800);
        gs.fbiSuspicion  = Math.max(0, gs.fbiSuspicion - 8);
        return { ok: true, msg: '-$800 lawyer. Clean. FBI -8%.' };
      }
      gs.policeHeat   = Math.min(100, gs.policeHeat + 30);
      gs.reputation   = Math.min(100, gs.reputation + 10);
      gs.fbiSuspicion = Math.min(100, gs.fbiSuspicion + 15);
      return { ok: false, msg: 'Fought it. Press covered it. HEAT +30. FBI +15%.' };
    },
  },

  {
    id: 'local_talent',
    unlockNight: 1,
    chance: 0.13,
    title_safe:  { ru: '🎸 МУЗЫКАНТ ИЩЕТ СЦЕНУ', en: '🎸 MUSICIAN AT THE DOOR' },
    title_adult: { ru: '🎸 НЕИЗДАННЫЙ АРТИСТ',   en: '🎸 UNSIGNED ARTIST'      },
    title_max:   { ru: '🎸 БУДУЩАЯ ЗВЕЗДА?',      en: '🎸 FUTURE STAR?'         },
    body_safe: {
      ru: 'Молодой музыкант просит разрешения сыграть несколько песен. Бесплатно. Может быть хорошо, может — нет.',
      en: 'A young musician asks to play a few songs. For free. Could be great, could be a disaster.',
    },
    body_adult: {
      ru: 'Неизданный артист с гитарой. Говорит, что его знает весь Гринвич-Виллидж. Фанаты могут прийти следом.',
      en: 'Unsigned artist with a guitar. Claims everyone in Greenwich Village knows him. Fans might follow.',
    },
    body_max: {
      ru: 'Парень с гитарой и харизмой. Говорит: «Дайте 20 минут — я заполню зал». Арни говорит «нет». Толпа на улице уже собирается.',
      en: 'Guy with a guitar and presence. Says: "Give me 20 minutes — I\'ll fill the room." Arnie says no. Crowd outside is already forming.',
    },
    choices: [
      { key: 'allow', label: { ru: 'ДАТЬ ПЛОЩАДКУ',  en: 'LET HIM PLAY' } },
      { key: 'deny',  label: { ru: 'ОТКАЗАТЬ',        en: 'REFUSE'       } },
    ],
    resolve(choice, gs) {
      if (choice === 'allow') {
        if (Math.random() < 0.55) {
          gs.reputation   = Math.min(100, gs.reputation + 12);
          gs.nightEarnings += 400;
          return { ok: true, msg: 'CROWD LOVED IT! REP +12, +$400' };
        }
        gs.reputation = Math.max(0, gs.reputation - 6);
        return { ok: false, msg: 'Off-key disaster. REP -6.' };
      }
      return { ok: true, msg: null };
    },
  },

  {
    id: 'celebrity_birthday',
    unlockNight: 2,
    chance: 0.09,
    title_safe:  { ru: '🎂 ДЕНЬ РОЖДЕНИЯ ЗВЕЗДЫ', en: '🎂 CELEBRITY BIRTHDAY'   },
    title_adult: { ru: '🎂 ВИП-ПРАЗДНИК',          en: '🎂 VIP BIRTHDAY BASH'   },
    title_max:   { ru: '🎂 BIRTHDAY PARTY В VIP',  en: '🎂 VIP BIRTHDAY PARTY'  },
    body_safe: {
      ru: 'Известная личность хочет отметить день рождения в вашем клубе. Нужен торт и бутылки шампанского.',
      en: 'A well-known figure wants to celebrate their birthday at your club. Needs cake and champagne.',
    },
    body_adult: {
      ru: 'Знаменитость хочет закрытый VIP-вечер для 20 человек. Стоимость организации — $500, доход — до $2000.',
      en: 'Celebrity wants a private VIP evening for 20 guests. Setup costs $500, potential intake up to $2,000.',
    },
    body_max: {
      ru: 'Звезда хочет «самое безумное» день рождения Нью-Йорка. Шампанское, кокаин на столике, никаких журналистов. Организация $500 — доход $2500.',
      en: 'Star wants "the wildest" birthday in New York. Champagne, coke on the table, no journalists. Setup $500 — intake $2,500.',
    },
    choices: [
      { key: 'host',    label: { ru: 'ОРГАНИЗОВАТЬ ($500)', en: 'HOST IT ($500)'  } },
      { key: 'decline', label: { ru: 'ОТКАЗАТЬ',            en: 'DECLINE'        } },
    ],
    resolve(choice, gs) {
      if (choice === 'host') {
        if (gs.nightEarnings < 500 && gs.stash < 500) {
          return { ok: false, msg: 'NOT ENOUGH CASH!' };
        }
        gs.nightEarnings = Math.max(0, gs.nightEarnings - 500);
        const payout = 1200 + Math.round(Math.random() * 1000);
        gs.nightEarnings += payout;
        gs.reputation    = Math.min(100, gs.reputation + 18);
        return { ok: true, msg: `BIRTHDAY BASH! +$${payout} REP +18` };
      }
      gs.reputation = Math.max(0, gs.reputation - 5);
      return { ok: false, msg: 'They went to Paradise Club. REP -5.' };
    },
  },

  {
    id: 'power_outage',
    unlockNight: 3,
    chance: 0.10,
    title_safe:  { ru: '💡 СВЕТ ОТКЛЮЧИЛСЯ',     en: '💡 LIGHTS OUT'          },
    title_adult: { ru: '💡 АВАРИЙНОЕ ОТКЛЮЧЕНИЕ', en: '💡 POWER OUTAGE'        },
    title_max:   { ru: '💡 ТЕМНОТА. ХАОС. ВЫБОР', en: '💡 DARK. CHAOS. CHOOSE' },
    body_safe: {
      ru: 'Электричество неожиданно отключилось. Толпа замерла. Как поступить?',
      en: 'Power cut unexpectedly. The crowd froze. What do you do?',
    },
    body_adult: {
      ru: 'Весь блок обесточен. Генератор сломан. Свечи — романтика или пожарная опасность?',
      en: 'The whole block is down. Generator is broken. Candles — romantic or fire hazard?',
    },
    body_max: {
      ru: 'Кромешная тьма. Кто-то завизжал. Кто-то смеётся. В темноте происходит то, о чём утром молчат.',
      en: 'Pitch black. Someone screamed. Someone is laughing. In the dark, things happen that nobody talks about in the morning.',
    },
    choices: [
      { key: 'candles',      label: { ru: 'ЗАЖЕЧЬ СВЕЧИ',       en: 'LIGHT CANDLES'    } },
      { key: 'electrician',  label: { ru: 'ВЫЗВАТЬ ЭЛЕКТРИКА ($300)', en: 'CALL ELECTRICIAN ($300)' } },
      { key: 'send_home',    label: { ru: 'ЗАКРЫТЬ НА НОЧЬ',    en: 'CLOSE FOR THE NIGHT' } },
    ],
    resolve(choice, gs) {
      if (choice === 'candles') {
        gs.reputation  = Math.min(100, gs.reputation + 10);
        gs.nightEarnings += 200;
        return { ok: true, msg: 'Romantic! BAR +$200. REP +10.' };
      }
      if (choice === 'electrician') {
        if (gs.nightEarnings < 300) return { ok: false, msg: 'NOT ENOUGH CASH!' };
        gs.nightEarnings -= 300;
        return { ok: true, msg: '-$300. Lights back in 5 min.' };
      }
      gs.nightEarnings = Math.round(gs.nightEarnings * 0.4);
      return { ok: false, msg: 'Night ended early. Lost 60% revenue.' };
    },
  },

  {
    id: 'paparazzi_tip',
    unlockNight: 1,
    chance: 0.12,
    title_safe:  { ru: '📷 ПАПАРАЦЦИ У ВХОДА',    en: '📷 PAPARAZZI OUTSIDE'    },
    title_adult: { ru: '📷 ФОТОГРАФ ЖДЁТ ЗВЁЗД',  en: '📷 PHOTOGRAPHER WAITING' },
    title_max:   { ru: '📷 DAILY NEWS ЖДЁТ',       en: '📷 DAILY NEWS IS WAITING' },
    body_safe: {
      ru: 'Фотограф топчется у входа. Говорит, что снимает для модного журнала.',
      en: 'A photographer is lurking outside. Says he\'s shooting for a fashion magazine.',
    },
    body_adult: {
      ru: 'Папарацци из Daily News. Если сейчас зайдёт звезда — завтра первая полоса. Позволить?',
      en: 'Paparazzi from the Daily News. If a star walks in now — it\'s the front page tomorrow. Allow him?',
    },
    body_max: {
      ru: 'Известный папарацци. Его снимки продают по $5000. Он видел что-то в VIP. Хочет $500 за молчание.',
      en: 'Famous paparazzi. His shots sell for $5,000. He saw something in the VIP. Wants $500 to stay quiet.',
    },
    choices: [
      { key: 'allow',   label: { ru: 'ПУСТИТЬ',            en: 'LET HIM IN'      } },
      { key: 'pay_off', label: { ru: 'ОТКУПИТЬСЯ ($500)',   en: 'PAY OFF ($500)'  } },
      { key: 'block',   label: { ru: 'ВЫГНАТЬ',             en: 'BLOCK HIM'       } },
    ],
    resolve(choice, gs) {
      if (choice === 'allow') {
        if (Math.random() < 0.5) {
          gs.reputation = Math.min(100, gs.reputation + 20);
          gs.nightEarnings += 300;
          return { ok: true, msg: 'FRONT PAGE TOMORROW! REP +20, +$300' };
        }
        gs.fbiSuspicion = Math.min(100, gs.fbiSuspicion + 12);
        gs.policeHeat   = Math.min(100, gs.policeHeat + 8);
        return { ok: false, msg: 'SCANDAL PHOTOS! FBI +12%, HEAT +8' };
      }
      if (choice === 'pay_off') {
        if (gs.nightEarnings < 500) return { ok: false, msg: 'NOT ENOUGH CASH!' };
        gs.nightEarnings -= 500;
        return { ok: true, msg: '-$500. He walked away.' };
      }
      gs.reputation = Math.max(0, gs.reputation - 4);
      return { ok: true, msg: 'Blocked. He left angry. REP -4.' };
    },
  },

  {
    id: 'city_official',
    unlockNight: 4,
    chance: 0.11,
    title_safe:  { ru: '🏛 ЧИНОВНИК У ВХОДА',     en: '🏛 OFFICIAL AT THE DOOR'   },
    title_adult: { ru: '🏛 ПОЛИТИК ДЛЯ СВОИХ',    en: '🏛 POLITICIAN WANTS IN'    },
    title_max:   { ru: '🏛 МЭРИЯ ТОЖЕ ТУСУЕТСЯ',  en: '🏛 CITY HALL PARTIES TOO'  },
    body_safe: {
      ru: 'Чиновник в костюме намекает, что VIP-доступ снял бы часть вопросов к клубу.',
      en: 'A city official in a suit hints that VIP access could make certain questions about the club disappear.',
    },
    body_adult: {
      ru: 'Помощник мэра хочет попасть без очереди — и без документов. Взамен — «добрая воля» горадминистрации.',
      en: "The mayor's aide wants in without a line — and without paperwork. In return — the city's goodwill.",
    },
    body_max: {
      ru: 'Чиновник из Комиссии по зонированию. «Впустите меня и двух подруг — и я потеряю заявление на закрытие вашего клуба». Улыбается.',
      en: 'Official from the Zoning Commission. "Let me and two friends in — and I\'ll lose the petition to shut you down." He smiles.',
    },
    choices: [
      { key: 'vip',    label: { ru: 'ПУСТИТЬ VIP',        en: 'GRANT VIP ACCESS' } },
      { key: 'normal', label: { ru: 'КАК ОБЫЧНОГО ГОСТЯ', en: 'TREAT NORMALLY'   } },
      { key: 'refuse', label: { ru: 'ОТКАЗАТЬ',            en: 'REFUSE'           } },
    ],
    resolve(choice, gs) {
      if (choice === 'vip') {
        gs.fbiSuspicion = Math.max(0, gs.fbiSuspicion - 15);
        gs.policeHeat   = Math.max(0, gs.policeHeat - 20);
        gs.reputation   = Math.min(100, gs.reputation + 5);
        return { ok: true, msg: 'He owes you now. FBI -15%, HEAT -20.' };
      }
      if (choice === 'normal') {
        return { ok: true, msg: 'Paid full price. Grumbled but left.' };
      }
      gs.policeHeat = Math.min(100, gs.policeHeat + 18);
      return { ok: false, msg: 'Refused. City not happy. HEAT +18.' };
    },
  },

  {
    id: 'fashion_disaster',
    unlockNight: 5,
    chance: 0.09,
    title_safe:  { ru: '👗 ДРЕСС-КОД ПОД УГРОЗОЙ', en: '👗 DRESS CODE CRISIS'   },
    title_adult: { ru: '👗 ЗВЕЗДА В ТРЕНИКИ?',       en: '👗 STAR IN SWEATPANTS?' },
    title_max:   { ru: '👗 ЭТО НЕВОЗМОЖНО',          en: '👗 UNBELIEVABLE OUTFIT' },
    body_safe: {
      ru: 'Известный человек пришёл в явно неподходящей одежде. Его все узнают. Что делать?',
      en: 'A recognizable person showed up in clearly inappropriate clothing. Everyone knows them. What do you do?',
    },
    body_adult: {
      ru: 'Знаменитость пришла в джинсах и кедах. Охрана остановила. Толпа ждёт вашего решения.',
      en: 'Celebrity arrived in jeans and sneakers. Security stopped them. The crowd is watching your call.',
    },
    body_max: {
      ru: 'Это рок-звезда первого класса. В спортивных штанах. Пьяная. С двумя фотографами позади.',
      en: 'First-class rock star. In sweatpants. Drunk. With two photographers right behind them.',
    },
    choices: [
      { key: 'allow',  label: { ru: 'ВПУСТИТЬ КАК ЕСТЬ',      en: 'LET THEM IN'          } },
      { key: 'vip',    label: { ru: 'VIP — ЧЕРЕЗ ЧЁРНЫЙ ВХД', en: 'VIP — BACK ENTRANCE'  } },
      { key: 'refuse', label: { ru: 'ДРЕСС-КОД — ЕСТЬ ДРЕСС-КОД', en: 'RULES ARE RULES' } },
    ],
    resolve(choice, gs) {
      if (choice === 'allow') {
        gs.reputation = Math.max(0, gs.reputation - 8);
        gs.nightEarnings += 250;
        return { ok: false, msg: 'Word got out. REP -8. +$250 from their tab.' };
      }
      if (choice === 'vip') {
        gs.reputation = Math.min(100, gs.reputation + 6);
        gs.nightEarnings += 400;
        return { ok: true, msg: 'Handled smoothly. REP +6. +$400' };
      }
      gs.reputation = Math.min(100, gs.reputation + 10);
      return { ok: true, msg: 'Strict. Standards intact. REP +10.' };
    },
  },
];
