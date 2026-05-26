// Upgrade definitions. Each level costs more and adds bonuses.
// 'effect' is read by NightScene / OfficeScene.
export const UPGRADES = {
  sound: {
    key: 'sound',
    levels: [
      { cost: 300,  label_key: 'upgrade_sound', bonus_key: 'upgrade_sound_desc', effect: { prestige: 5 } },
      { cost: 800,  label_key: 'upgrade_sound', bonus_key: 'upgrade_sound_desc', effect: { prestige: 12 } },
      { cost: 2000, label_key: 'upgrade_sound', bonus_key: 'upgrade_sound_desc', effect: { prestige: 25 } },
    ],
  },
  bar: {
    key: 'bar',
    levels: [
      { cost: 400,  label_key: 'upgrade_bar', bonus_key: 'upgrade_bar_desc', effect: { barMult: 1.5 } },
      { cost: 1000, label_key: 'upgrade_bar', bonus_key: 'upgrade_bar_desc', effect: { barMult: 2.0 } },
      { cost: 2500, label_key: 'upgrade_bar', bonus_key: 'upgrade_bar_desc', effect: { barMult: 3.0 } },
    ],
  },
  security: {
    key: 'security',
    levels: [
      { cost: 500,  label_key: 'upgrade_security', bonus_key: 'upgrade_security_desc', effect: { fightReduce: 0.4 } },
      { cost: 1200, label_key: 'upgrade_security', bonus_key: 'upgrade_security_desc', effect: { fightReduce: 0.7 } },
      { cost: 3000, label_key: 'upgrade_security', bonus_key: 'upgrade_security_desc', effect: { fightReduce: 0.9 } },
    ],
  },
  lights: {
    key: 'lights',
    levels: [
      { cost: 350,  label_key: 'upgrade_lights', bonus_key: 'upgrade_lights_desc', effect: { repBonus: 5 } },
      { cost: 900,  label_key: 'upgrade_lights', bonus_key: 'upgrade_lights_desc', effect: { repBonus: 12 } },
      { cost: 2200, label_key: 'upgrade_lights', bonus_key: 'upgrade_lights_desc', effect: { repBonus: 20 } },
    ],
  },
  vipLounge: {
    key: 'vipLounge',
    levels: [
      { cost: 1500, label_key: 'upgrade_vip', bonus_key: 'upgrade_vip_desc', effect: { celebBonus: 0.5 } },
      { cost: 3500, label_key: 'upgrade_vip', bonus_key: 'upgrade_vip_desc', effect: { celebBonus: 1.0 } },
      { cost: 7000, label_key: 'upgrade_vip', bonus_key: 'upgrade_vip_desc', effect: { celebBonus: 2.0 } },
    ],
  },
};

export function getUpgradeNextLevel(key, currentLevel) {
  const upg = UPGRADES[key];
  if (!upg || currentLevel >= upg.levels.length) return null;
  return upg.levels[currentLevel];
}

export function getUpgradeCost(key, currentLevel) {
  const next = getUpgradeNextLevel(key, currentLevel);
  return next ? next.cost : null;
}
