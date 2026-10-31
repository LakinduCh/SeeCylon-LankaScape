// Animals that attack in "defend" challenges. size is the body length in map units;
// the traveler is 0.2 tall, so a leopard comes up to about his knee.
export const ENEMIES = {
  leopard: { shape: 'quad', size: 0.17, speed: 1.15, hp: 2, dmg: 12, cooldown: 1.0, color: '#d99a2b', spots: '#3a2410', ears: true },
  boar: { shape: 'quad', size: 0.15, speed: 0.85, hp: 3, dmg: 10, cooldown: 1.1, color: '#5a4535', tusks: true, ears: true },
  elephant: { shape: 'quad', size: 0.34, speed: 0.55, hp: 6, dmg: 25, cooldown: 1.5, color: '#7d8794', trunk: true, tusks: true, ears: true },
};

// Challenges, keyed by location id. Only Yala and Minneriya have one; every other
// destination opens its card as soon as the traveler walks up to it.
//  defend: animals charge the traveler; fight them off with Space.
//  dodge:  hazards mark a red circle on the ground, then strike; step out before they land.
// reward is the rupee bonus for clearing it.
export const CHALLENGES = {
  yala: { kind: 'defend', title: 'Leopard Ambush', blurb: 'Leopards and boars burst from the scrub.', enemies: [['leopard', 4], ['boar', 2]], interval: 2.2, maxAlive: 3, reward: 150 },
  minneriya: { kind: 'defend', title: 'Elephant Charge', blurb: 'The great gathering turns on you.', enemies: [['elephant', 3]], interval: 4.0, maxAlive: 2, reward: 200 },
};

export const ZONE_RADIUS = 0.5; // stepping inside starts the challenge
export const ZONE_ABANDON = 1.1; // running this far from the pin gives up on it
export const ZONE_ARM = 0.8; // must get this far away once before a zone can trigger (stops the start point re-firing)
