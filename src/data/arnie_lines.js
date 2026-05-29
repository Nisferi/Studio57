/**
 * Arnie Gluck's contextual office dialogue.
 * Lines selected based on GameState conditions.
 * Arnie = Ian Schrager protype: financial brain, cautious, dry wit.
 */

export const ARNIE_LINES = [
  // ── FBI / Risk ────────────────────────────────────────────────────────────
  {
    id: 'fbi_high',
    condition: gs => gs.fbiSuspicion >= 60,
    priority: 10,
    portrait: 'worried',
    text: {
      ru: 'Виктор. ФБР уже на 60%. Мне звонил Коллинз. Надо притормозить с тайником.',
      en: "Victor. FBI's at 60%. Collins called me. We need to slow down the stash.",
    },
  },
  {
    id: 'fbi_raid_happened',
    condition: gs => gs.flags.firstRaidSeen,
    priority: 9,
    portrait: 'scared',
    text: {
      ru: 'После того рейда я не сплю. Нужен адвокат. Хороший. Тысяч на двадцать.',
      en: "I haven't slept since the raid. We need a lawyer. A good one. Twenty grand.",
    },
  },
  {
    id: 'stash_large',
    condition: gs => gs.stash >= 5000,
    priority: 8,
    portrait: 'nervous',
    text: {
      ru: '${stash} в вентиляции. Виктор — это уже не игра. Надо вывести деньги.',
      en: '${stash} in the ducts. Victor — this isn\'t a game anymore. We need to move the money.',
    },
  },
  {
    id: 'police_high',
    condition: gs => gs.policeHeat >= 70,
    priority: 7,
    portrait: 'worried',
    text: {
      ru: 'Третий раз за месяц приезжала полиция. Соседи жалуются. Надо дать Коллинзу.',
      en: 'Third time this month the cops showed. Neighbors are complaining. Pay Collins.',
    },
  },

  // ── Celebrities ───────────────────────────────────────────────────────────
  {
    id: 'celeb_andy',
    condition: gs => gs.nightStats?.celebsHosted?.includes('warholder'),
    priority: 6,
    portrait: 'excited',
    text: {
      ru: 'Уорхолдер был прошлой ночью. Это лучше рекламы в Times Square. Серьёзно.',
      en: "Warholder was here last night. That's better than a Times Square ad. Seriously.",
    },
  },
  {
    id: 'celeb_trumpet',
    condition: gs => gs.nightStats?.celebsHosted?.includes('trumpet'),
    priority: 6,
    portrait: 'amused',
    text: {
      ru: 'Trumpet опять приходил. Рассказывал всем про свою башню. Но три тысячи оставил.',
      en: "Trumpet came again. Telling everyone about his tower. But he left three grand.",
    },
  },
  {
    id: 'first_celeb',
    condition: gs => gs.flags.firstCelebSeen && gs.nightNumber <= 4,
    priority: 5,
    portrait: 'excited',
    text: {
      ru: 'Ты видел? К нам пришли знаменитые. Это меняет всё. Теперь будут ещё.',
      en: "Did you see that? Famous people came. This changes everything. More will follow.",
    },
  },

  // ── Finance ───────────────────────────────────────────────────────────────
  {
    id: 'good_profit',
    condition: gs => gs.velvetBox + gs.stash > 3000 && gs.nightNumber >= 3,
    priority: 4,
    portrait: 'pleased',
    text: {
      ru: 'Неплохо, Виктор. Неплохо. Но 30% уходит IRS. Запомни — прячь больше.',
      en: "Not bad, Victor. Not bad. But 30% goes to IRS. Remember — hide more.",
    },
  },
  {
    id: 'broke',
    condition: gs => gs.nightNumber > 1 && gs.velvetBox + gs.stash < 200,
    priority: 9,
    portrait: 'scared',
    text: {
      ru: 'У нас почти ничего. Ещё одна плохая ночь — и всё. Думай.',
      en: "We have almost nothing left. One more bad night — it's over. Think.",
    },
  },

  // ── Night-specific ────────────────────────────────────────────────────────
  {
    id: 'night_1',
    condition: gs => gs.nightNumber === 1,
    priority: 3,
    portrait: 'intro',
    text: {
      ru: 'Первая ночь. Слушай: проверяй возраст. Прячь часть денег. И не пускай совсем пьяных.',
      en: "First night. Listen: check ages. Hide some cash. And don't let in the completely wasted.",
    },
  },
  {
    id: 'night_4_rules',
    condition: gs => gs.nightNumber === 4,
    priority: 8,
    portrait: 'serious',
    text: {
      ru: 'С сегодня только 21+. Полиция предупредила. И дресс-код — без исключений. Смотри на ID внимательно.',
      en: "21+ only from tonight. Police warned us. Dress code — no exceptions. Look at the IDs closely.",
    },
  },
  {
    id: 'night_5_fake_ids',
    condition: gs => gs.nightNumber === 5,
    priority: 7,
    portrait: 'worried',
    text: {
      ru: 'Начали ходить с фальшивыми ID. Смотри на печать — если размытая или желтоватая, это подделка.',
      en: "They're coming in with fake IDs now. Check the print — if it looks blurry or yellowish, it's a fake.",
    },
  },
  {
    id: 'night_6_heat',
    condition: gs => gs.nightNumber === 6 && gs.fbiSuspicion >= 30,
    priority: 8,
    portrait: 'tense',
    text: {
      ru: 'Шестая ночь. ФБР нюхает воздух. Не прячь сегодня — пусть касса выглядит чистой.',
      en: "Night six. FBI is sniffing around. Don't hide tonight — let the books look clean.",
    },
  },
  {
    id: 'night_6_ok',
    condition: gs => gs.nightNumber === 6 && gs.fbiSuspicion < 30,
    priority: 6,
    portrait: 'pleased',
    text: {
      ru: 'Шесть ночей. Ты держишься. Ещё немного — и мы сможем думать о расширении.',
      en: "Six nights. You're holding on. A bit more — and we can think about expanding.",
    },
  },
  {
    id: 'night_7_danger',
    condition: gs => gs.nightNumber === 7,
    priority: 8,
    portrait: 'scared',
    text: {
      ru: 'Седьмая. В газете написали про нас. Жди журналистов и агентов. Будь осторожен с тайником.',
      en: "Night seven. The papers wrote about us. Expect journalists and agents. Be careful with the stash.",
    },
  },
  {
    id: 'night_9_peak',
    condition: gs => gs.nightNumber === 9,
    priority: 7,
    portrait: 'tense',
    text: {
      ru: 'Мы на вершине, Виктор. И ФБР смотрит каждую ночь. Иногда я думаю — стоит ли.',
      en: "We're at the top, Victor. And the FBI watches every night. Sometimes I wonder — is it worth it.",
    },
  },

  // ── Collins arc ───────────────────────────────────────────────────────────
  {
    id: 'collins_hostile',
    condition: gs => gs.characterMemory?.collins?.hostile,
    priority: 10,
    portrait: 'scared',
    text: {
      ru: 'Коллинз больше не звонит. Это плохо. Значит — уже работает против нас.',
      en: "Collins stopped calling. That's bad. It means he's already working against us.",
    },
  },
  {
    id: 'collins_paid_well',
    condition: gs => gs.characterMemory?.collins?.bribeCount >= 3,
    priority: 5,
    portrait: 'relieved',
    text: {
      ru: 'Коллинз на нашей стороне. Пока платим — всё тихо. Он хороший инвестмент.',
      en: "Collins is on our side. As long as we pay — all quiet. He's a good investment.",
    },
  },

  // ── Default ───────────────────────────────────────────────────────────────
  {
    id: 'default_ok',
    condition: () => true,
    priority: 0,
    portrait: 'neutral',
    text: {
      ru: 'Отдохни немного. Сегодня ночью снова у шнура.',
      en: "Rest a bit. Tonight we're back at the rope.",
    },
  },
];

/**
 * Pick the highest-priority matching line for the current GameState.
 */
export function getArnieLine(GameState) {
  const lang = GameState.lang || 'ru';
  const candidates = ARNIE_LINES
    .filter(l => l.condition(GameState))
    .sort((a, b) => b.priority - a.priority);

  const line = candidates[0] || ARNIE_LINES[ARNIE_LINES.length - 1];
  let text = line.text[lang] || line.text.en;

  // Template substitution: {stash} → actual value
  text = text.replace('{stash}', GameState.stash);

  return { id: line.id, portrait: line.portrait, text };
}
