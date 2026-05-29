/**
 * Central tuning constants — all game-balance numbers live here.
 * Import from this file instead of hardcoding magic numbers in scenes.
 */

// ─── Time ────────────────────────────────────────────────────────────────────
export const NIGHT_DURATION        = 55;    // seconds
export const GUEST_INTERVAL_MIN    = 3200;  // ms
export const GUEST_INTERVAL_MAX    = 5000;  // ms
export const BAR_TICK_MS           = 5000;  // ms between bar income ticks

// ─── Economy ─────────────────────────────────────────────────────────────────
export const HIDE_AMOUNT           = 200;   // $ per hide-money action
export const HIDE_FBI_GAIN         = 12;    // FBI% added per hide
export const TAX_RATE              = 0.30;  // 30% on velvetBox income

export const BAR_BASE_INCOME       = 25;    // $ per tick at upgrade level 0
// Multiplier applied to BAR_BASE_INCOME at each upgrade level (index = level 0-3)
export const BAR_UPGRADE_MULT      = [1.0, 1.5, 2.0, 3.0];

// ─── Security / Fights ───────────────────────────────────────────────────────
export const FIGHT_DAMAGE          = 300;   // $ deducted when fight occurs
export const FIGHT_POLICE_GAIN     = 10;    // policeHeat added per fight
export const FIGHT_BASE_CHANCE     = 0.50;  // base fight probability per guest
export const FIGHT_MIN_CHANCE      = 0.05;  // floor fight probability
export const FIGHT_SECURITY_REDUCTION = 0.15; // reduction per security upgrade level

// ─── Underage entry ──────────────────────────────────────────────────────────
export const UNDERAGE_FINE         = 500;   // $ fine for letting underage in
export const UNDERAGE_FBI_GAIN     = 15;    // FBI% added
export const UNDERAGE_POLICE_GAIN  = 20;    // policeHeat added
export const UNDERAGE_CATCH_CHANCE = 0.40;  // probability player is caught

// ─── Reputation ──────────────────────────────────────────────────────────────
export const REP_TRASHY_EARLY      = 2;     // reputation loss for trashy dress (nights 1-3)
export const REP_TRASHY_LATE       = 3;     // reputation loss for trashy dress (nights 4+)
export const REP_REJECT_VIP        = 5;     // reputation loss for rejecting VIP
export const REP_NIGHT_END         = 3;     // reputation gained per completed night

// Reputation bonus per lights upgrade level (index = level 1-3)
export const REP_LIGHTS_BONUS      = [5, 12, 20];

// ─── Celebrities ─────────────────────────────────────────────────────────────
export const CELEB_BASE_CHANCE     = 0.10;  // base probability per guest spawn
// celebChanceBoost multiplier per vipLounge upgrade level (index = level 0-3)
export const CELEB_VIP_BOOST       = [1.0, 1.4, 1.8, 2.5];

// ─── FBI Raid ─────────────────────────────────────────────────────────────────
export const FBI_RAID_THRESHOLD    = 40;    // FBI% floor before raid can trigger
export const FBI_RAID_TICK_CHANCE  = 0.02;  // base per-second raid probability multiplier
