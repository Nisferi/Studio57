/**
 * Central singleton holding all runtime game state.
 * Scenes read/write this directly; SaveSystem serialises it.
 */
export const GameState = {
  // Meta
  lang: 'ru',           // 'ru' | 'en'
  contentVersion: null, // 'safe' | 'adult' | 'max' — chosen on first run

  // Progress
  nightNumber: 1,
  totalNights: 0,

  // Finances
  velvetBox: 0,   // legal cash (taxed each night)
  stash: 0,       // hidden cash (no tax, but FBI risk)
  totalEarned: 0,
  totalTaxPaid: 0,
  bankrupt: false,

  // Risk
  fbiSuspicion: 0,   // 0–100
  policeHeat: 0,     // 0–100 — local police, separate from FBI
  reputation: 50,    // 0–100 club prestige

  // Upgrades  (level 0 = not bought, levels 1-3)
  upgrades: {
    sound: 0,
    bar: 0,
    security: 0,
    lights: 0,
    vipLounge: 0,
  },

  // Night stats (reset each night)
  nightStats: {
    approved: 0,
    rejected: 0,
    fights: 0,
    policeVisits: 0,
    underageSlipped: 0,
    celebsHosted: [],
  },

  // Epoch system — which decade we're in
  epoch: 70,               // 70 | 80 | 90 | 2000
  epochNight: 1,           // night within the current epoch (resets on epoch change)
  epochsCompleted: [],     // [70, 80, ...] epochs fully played

  // Character memory — drives epilogue fate generation
  characterMemory: {
    arnie: { trustLevel: 0, betrayed: false },       // trust +1 per correct stash call
    collins: { bribeCount: 0, refusedCount: 0, hostile: false },
    hughes: { evadedCount: 0, confrontedCount: 0 },
    loveStory: false,      // set true if same anonymous NPC appeared 5+ times
    overdoseEvents: 0,     // count of unresolved drug_deal events
    traitor: null,         // 'arnie' | 'collins' | null
  },

  // Concert system stub
  bookedConcert: null,     // { artistId, nightOffset, advancePaid } or null
  concertHistory: [],      // [{ artistId, income, success, night, epoch }]

  // Unlocked content flags
  flags: {
    tutorialDone: false,
    firstCelebSeen: false,
    firstRaidSeen: false,
    epilogue70Seen: false,
    epilogue80Seen: false,
    epilogue90Seen: false,
  },

  // Monetisation stubs — populated when IAP is wired up
  // Steam: base game paid, DLC for director's cut
  // Telegram: nights 1–3 free, 4–8 via Stars, 9–15 via Stars
  store: {
    premiumSkins: [],       // purchased skin IDs
    boosters: [],           // active booster IDs
    adFreeUnlocked: false,
    unlockedNights: 3,      // 3 = free; 8 = paid tier 1; 15 = paid tier 2
    unlockedCelebs: ['steel', 'warholder'], // free celebs
    hasDirectorsCut: false, // version 'max' DLC
    platform: 'web',        // 'web' | 'telegram' | 'steam'
  },

  reset() {
    Object.assign(this, {
      nightNumber: 1, totalNights: 0,
      velvetBox: 0, stash: 0, totalEarned: 0, totalTaxPaid: 0, bankrupt: false,
      fbiSuspicion: 0, policeHeat: 0, reputation: 50,
      upgrades: { sound: 0, bar: 0, security: 0, lights: 0, vipLounge: 0 },
      nightStats: { approved: 0, rejected: 0, fights: 0, policeVisits: 0, underageSlipped: 0, celebsHosted: [] },
      epoch: 70, epochNight: 1, epochsCompleted: [],
      characterMemory: {
        arnie: { trustLevel: 0, betrayed: false },
        collins: { bribeCount: 0, refusedCount: 0, hostile: false },
        hughes: { evadedCount: 0, confrontedCount: 0 },
        loveStory: false, overdoseEvents: 0, traitor: null,
      },
      bookedConcert: null, concertHistory: [],
      flags: { tutorialDone: false, firstCelebSeen: false, firstRaidSeen: false,
               epilogue70Seen: false, epilogue80Seen: false, epilogue90Seen: false },
    });
  },

  resetNightStats() {
    this.nightStats = { approved: 0, rejected: 0, fights: 0, policeVisits: 0, underageSlipped: 0, celebsHosted: [] };
  },
};
