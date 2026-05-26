/**
 * Central singleton holding all runtime game state.
 * Scenes read/write this directly; SaveSystem serialises it.
 */
export const GameState = {
  // Meta
  lang: 'ru',           // 'ru' | 'en'
  contentVersion: null, // 'soft' | 'medium' — chosen on first run

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

  // Unlocked content flags
  flags: {
    tutorialDone: false,
    firstCelebSeen: false,
    firstRaidSeen: false,
  },

  // Monetisation stubs — populated when IAP is wired up
  store: {
    premiumSkins: [],
    boosters: [],
    adFreeUnlocked: false,
  },

  reset() {
    Object.assign(this, {
      nightNumber: 1, totalNights: 0,
      velvetBox: 0, stash: 0, totalEarned: 0, totalTaxPaid: 0, bankrupt: false,
      fbiSuspicion: 0, policeHeat: 0, reputation: 50,
      upgrades: { sound: 0, bar: 0, security: 0, lights: 0, vipLounge: 0 },
      nightStats: { approved: 0, rejected: 0, fights: 0, policeVisits: 0, underageSlipped: 0, celebsHosted: [] },
      flags: { tutorialDone: false, firstCelebSeen: false, firstRaidSeen: false },
    });
  },

  resetNightStats() {
    this.nightStats = { approved: 0, rejected: 0, fights: 0, policeVisits: 0, underageSlipped: 0, celebsHosted: [] };
  },
};
