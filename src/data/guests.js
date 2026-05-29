export const STYLE = { ULTRA: 0, CLEAN: 1, STYLISH: 2, NORMAL: 3, TRASHY: 4 };
export const INTOX = { SOBER: 0, TIPSY: 1, WASTED: 2 };

const NAMES_M = ['Tony','Frank','Bobby','Johnny','Sal','Richie','Eddie','Vinny','Marco','Carlo','Lou','Mike','Danny','Pete','Jerry','Rick','Steve','David','James','Nick','Ray','Al','Hank','Buddy','Larry','Gary','Barry','Terry','Ronnie','Donnie','Joey','Freddy','Paulie','Mikey','Louie','Carmine','Enzo','Roberto','Jorge','Curtis','Andre','Jerome','Calvin','Leon','Clyde'];
const NAMES_F = ['Gloria','Diana','Donna','Cindy','Linda','Karen','Debbie','Sandy','Lisa','Maria','Rosa','Angie','Tina','Pam','Susan','Barbara','Carol','Nancy','Janet','Rita','Sherry','Lola','Vera','Gina','Brenda','Cheryl','Patty','Sheila','Roxanne','Cleo','Vivian','Marlene','Yvette','Carmen','Rosario','Latoya','Keisha','Tamara','Denise','Tracey','Fiona'];
const SURNAMES = ['Smith','Johnson','Russo','Deluca','Fernandez','Brown','Davis','Miller','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Garcia','Martinez','Cohen','Klein','Murphy','O\'Brien','Romano','Vitale','Esposito','Rivera','Reyes','Washington','Jefferson','Robinson','Walker','Hall','Allen','Young','King','Scott','Green','Adams','Baker','Nelson','Carter','Mitchell','Perez'];

// Skin tone palettes (hex numbers)
export const SKIN_PALETTES = [
  { main: 0xFFE0B0, shadow: 0xD4A870 }, // ivory
  { main: 0xF5C380, shadow: 0xC8975A }, // warm tan
  { main: 0xD4956A, shadow: 0xA8623C }, // medium brown
  { main: 0x8B4513, shadow: 0x5E2D0A }, // deep brown
  { main: 0x3D1C00, shadow: 0x1A0900 }, // very dark
];

// Hair color palettes
export const HAIR_COLORS = [
  0x1A0A00, // black
  0x4A2A00, // dark brown
  0x8B4513, // chestnut
  0xC8A000, // dirty blonde
  0xFFCC00, // platinum blonde
  0xFF4400, // ginger
  0x888888, // grey
  0xF5E6C8, // silver/white
];

// 70s hair style types
export const HAIR_TYPES = ['afro','straight_long','feathered','pompadour','shag','bob','natural','curly'];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rndInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const AGENT_FIRST_M = ['Douglas','Bradley','Warren','Kenneth','Craig','Derek','Gerald','Harold'];
const AGENT_FIRST_F = ['Patricia','Diane','Barbara','Helen','Frances'];
const AGENT_SURNAMES = ['Hughes','Barnes','Hayes','Morgan','Cole','Fletcher','Warren','Grant','Briggs','Norris'];

function generateUndercoverAgent() {
  const isMale    = Math.random() > 0.30;
  const firstName = rnd(isMale ? AGENT_FIRST_M : AGENT_FIRST_F);
  const lastName  = rnd(AGENT_SURNAMES);
  const realAge   = rndInt(28, 46);
  const skinIdx   = rndInt(0, 2);
  const hairColor = rnd([0x1A0A00, 0x4A2A00, 0x888888, 0x222222]);
  return {
    id: `g_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name: `${firstName} ${lastName}`,
    firstName,
    gender: isMale ? 'M' : 'F',
    realAge,
    shownAge: realAge,
    hasFakeId: false,
    style: STYLE.CLEAN,
    intox: INTOX.SOBER,
    isCelebrity: false,
    celebrity: null,
    isUndercover: true,
    ticketRevenue: 50,
    barRevenue: 0,
    skinIdx,
    hairColor,
    hairType: 'pompadour',
    outfitColor: '#dce8f0',
  };
}

export function generateGuest(nightNumber, reputation = 50) {
  const undercoverChance = nightNumber >= 9 ? 0.09 + Math.min(0.06, (nightNumber - 9) * 0.012) : 0;
  if (Math.random() < undercoverChance) return generateUndercoverAgent();

  const isMale = Math.random() > 0.45;
  const firstName = rnd(isMale ? NAMES_M : NAMES_F);
  const lastName = rnd(SURNAMES);

  // Age — more borderline cases on later nights
  const underage_chance =
    nightNumber <= 3  ? 0.06 :
    nightNumber <= 6  ? 0.13 :
    nightNumber <= 9  ? 0.18 :
    nightNumber <= 12 ? 0.22 : 0.26;
  const ageRoll = Math.random();
  let realAge;
  if (ageRoll < underage_chance) {
    realAge = rndInt(16, 17); // underage
  } else {
    realAge = rndInt(18, 38);
  }

  const minAge = nightNumber >= 4 ? 21 : 18;
  const fakeIdProb =
    nightNumber <= 3  ? 0.58 :
    nightNumber <= 6  ? 0.68 :
    nightNumber <= 9  ? 0.78 :
    nightNumber <= 12 ? 0.88 : 0.94;
  const hasFakeId = realAge < minAge && Math.random() < fakeIdProb;
  const shownAge = hasFakeId ? rndInt(21, 27) : realAge;

  // Style — high reputation attracts better-dressed guests
  const repBonus   = Math.max(0, (reputation - 50) / 100) * 0.18; // up to +18% glamour at rep=100
  const trashBoost = Math.min(0.22, Math.max(0, (nightNumber - 1) * 0.016));
  const styleRoll  = Math.random();
  let style;
  if      (styleRoll < 0.04 + repBonus * 0.5)             style = STYLE.ULTRA;
  else if (styleRoll < 0.22 + repBonus)                    style = STYLE.CLEAN;
  else if (styleRoll < 0.52 + repBonus)                    style = STYLE.STYLISH;
  else if (styleRoll < (0.78 - trashBoost + repBonus))     style = STYLE.NORMAL;
  else                                                      style = STYLE.TRASHY;

  // Intoxication — wasted is rarer on night 1
  const wastedChance = nightNumber === 1 ? 0.05 : Math.min(0.28, 0.10 + nightNumber * 0.012);
  const tippyChance  = nightNumber === 1 ? 0.15 : Math.min(0.32, 0.20 + nightNumber * 0.008);
  const intoxRoll = Math.random();
  let intox;
  if      (intoxRoll < 1 - wastedChance - tippyChance) intox = INTOX.SOBER;
  else if (intoxRoll < 1 - wastedChance)                intox = INTOX.TIPSY;
  else                                                   intox = INTOX.WASTED;

  // Revenue
  const styleMultiplier = [3.0, 2.0, 1.5, 1.0, 0.4][style];
  const ticketRevenue = Math.round(50 * styleMultiplier);
  const barRevenue    = Math.round((30 + Math.random() * 70) * styleMultiplier);

  // Visuals
  const skinIdx   = rndInt(0, 4);
  const hairColor = rnd(HAIR_COLORS);
  const hairType  = rnd(HAIR_TYPES);

  const outfitPalette = [
    ['#e0c0ff','#ffd700','#ff80c0','#c0e0ff'],  // ULTRA
    ['#f0f0f0','#e8e8e8','#c8d8e8','#dce8f0'],   // CLEAN
    ['#ff6090','#60a0ff','#ffa030','#a060ff'],    // STYLISH
    ['#808080','#a08060','#708090','#9a9a9a'],    // NORMAL
    ['#604030','#505050','#403020','#554040'],    // TRASHY
  ];
  const outfitColor = rnd(outfitPalette[style]);

  return {
    id: `g_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name: `${firstName} ${lastName}`,
    firstName,
    gender: isMale ? 'M' : 'F',
    realAge,
    shownAge,
    hasFakeId,
    style,
    intox,
    isCelebrity: false,
    celebrity: null,
    ticketRevenue,
    barRevenue,
    skinIdx,
    hairColor,
    hairType,
    outfitColor,
  };
}
