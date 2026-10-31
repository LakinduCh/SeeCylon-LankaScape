// Rides unlocked by the rupees collected on this walk.
//  speed: multiplier on walking/running speed
//  turn:  multiplier on turning speed (the three-wheeler is a bit less nimble)
//  cam:   multiplier on the chase-camera distance (bigger ride, pull back a little)
export const VEHICLES = [
  { tier: 0, name: 'On foot', emoji: '🚶', min: 0, speed: 1, turn: 1, cam: 1 },
  { tier: 1, name: 'Bicycle', emoji: '🚲', min: 1000, speed: 1.7, turn: 1, cam: 1.15 },
  { tier: 2, name: 'Three-wheeler', emoji: '🛺', min: 2000, speed: 2.4, turn: 0.85, cam: 1.35 },
];

export function vehicleFor(rupees) {
  let best = VEHICLES[0];
  for (const v of VEHICLES) if (rupees >= v.min) best = v;
  return best;
}

// The next ride to work toward, or null once you have the best one
export function nextVehicle(rupees) {
  return VEHICLES.find((v) => v.min > rupees) || null;
}
