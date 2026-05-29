import { GameState } from './GameState.js';

const SAVE_KEY = 'studio57_save';
const SAVE_VERSION = 2;

function getUserId() {
  try {
    return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'local';
  } catch {
    return 'local';
  }
}

function key() {
  return `${SAVE_KEY}_${getUserId()}`;
}

export const SaveSystem = {
  save() {
    const payload = {
      v: SAVE_VERSION,
      lang: GameState.lang,
      contentVersion: GameState.contentVersion,
      nightNumber: GameState.nightNumber,
      totalNights: GameState.totalNights,
      velvetBox: GameState.velvetBox,
      stash: GameState.stash,
      totalEarned: GameState.totalEarned,
      totalTaxPaid: GameState.totalTaxPaid,
      bankrupt: GameState.bankrupt,
      fbiSuspicion: GameState.fbiSuspicion,
      policeHeat: GameState.policeHeat,
      reputation: GameState.reputation,
      upgrades: { ...GameState.upgrades },
      flags: { ...GameState.flags },
      store: { ...GameState.store },
      epoch: GameState.epoch,
      epochNight: GameState.epochNight,
      epochsCompleted: [...GameState.epochsCompleted],
      characterMemory: JSON.parse(JSON.stringify(GameState.characterMemory)),
      bookedEvent: GameState.bookedEvent ? { ...GameState.bookedEvent } : null,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(key(), JSON.stringify(payload));
    } catch (e) {
      console.warn('Save failed:', e);
    }
    // TODO: sync to Telegram CloudStorage when backend is ready
  },

  load() {
    try {
      const raw = localStorage.getItem(key());
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data) return false;

      // v1 → v2 migration: fields absent in v1 use GameState defaults
      if (data.v === 1) {
        data.v = 2;
        data.bankrupt = false;
        data.epoch = 70;
        data.epochNight = 1;
        data.epochsCompleted = [];
        data.characterMemory = null;
        data.bookedEvent = null;
      }

      if (data.v !== SAVE_VERSION) return false;

      Object.assign(GameState, {
        lang: data.lang || 'ru',
        contentVersion: data.contentVersion || null,
        nightNumber: data.nightNumber || 1,
        totalNights: data.totalNights || 0,
        velvetBox: data.velvetBox || 0,
        stash: data.stash || 0,
        totalEarned: data.totalEarned || 0,
        totalTaxPaid: data.totalTaxPaid || 0,
        bankrupt: data.bankrupt || false,
        fbiSuspicion: data.fbiSuspicion || 0,
        policeHeat: data.policeHeat || 0,
        reputation: data.reputation || 50,
        upgrades: { ...GameState.upgrades, ...(data.upgrades || {}) },
        flags: { ...GameState.flags, ...(data.flags || {}) },
        store: { ...GameState.store, ...(data.store || {}) },
        epoch: data.epoch || 70,
        epochNight: data.epochNight || 1,
        epochsCompleted: data.epochsCompleted || [],
        characterMemory: data.characterMemory
          ? { ...GameState.characterMemory, ...data.characterMemory }
          : GameState.characterMemory,
        bookedEvent: data.bookedEvent || null,
      });
      return true;
    } catch (e) {
      console.warn('Load failed:', e);
      return false;
    }
  },

  clear() {
    localStorage.removeItem(key());
  },
};
