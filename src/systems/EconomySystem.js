import {
  TAX_RATE,
  BAR_BASE_INCOME, BAR_UPGRADE_MULT,
  FIGHT_BASE_CHANCE, FIGHT_MIN_CHANCE, FIGHT_SECURITY_REDUCTION,
  CELEB_VIP_BOOST,
} from '../data/tuning.js';

export const EconomySystem = {
  /**
   * Apply tax to gross velvetBox income.
   * @param {number} gross
   * @returns {{ tax: number, net: number }}
   */
  calcTax(gross) {
    const tax = Math.floor(gross * TAX_RATE);
    return { tax, net: gross - tax };
  },

  /**
   * Bar income per tick.
   * @param {number} barLevel  0-3
   * @param {number} barBoost  multiplier from celebrity effects (default 1)
   * @returns {number}
   */
  calcBarTick(barLevel, barBoost = 1) {
    const mult = BAR_UPGRADE_MULT[Math.min(barLevel, BAR_UPGRADE_MULT.length - 1)];
    return Math.round(BAR_BASE_INCOME * mult * barBoost);
  },

  /**
   * Fight probability this guest visit.
   * @param {number} securityLevel  0-3
   * @returns {number}  0.0 – 1.0
   */
  calcFightChance(securityLevel) {
    return Math.max(FIGHT_MIN_CHANCE, FIGHT_BASE_CHANCE - securityLevel * FIGHT_SECURITY_REDUCTION);
  },

  /**
   * Bar income multiplier from upgrade level (used in init for barMultiplier field).
   * @param {number} barLevel  0-3
   * @returns {number}
   */
  calcBarMultiplier(barLevel) {
    return BAR_UPGRADE_MULT[Math.min(barLevel, BAR_UPGRADE_MULT.length - 1)];
  },

  /**
   * Celebrity spawn chance boost from VIP lounge upgrade.
   * @param {number} vipLevel  0-3
   * @returns {number}  multiplier (1.0 = no boost)
   */
  calcCelebChanceBoost(vipLevel) {
    return CELEB_VIP_BOOST[Math.min(vipLevel, CELEB_VIP_BOOST.length - 1)];
  },
};
