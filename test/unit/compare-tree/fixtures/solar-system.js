export default {
  planets: [
    { id: 'mercury', name: 'Mercury', color: 'gray', orbit: 88 },
    { id: 'venus', name: 'Venus', color: 'yellow', orbit: 225 },
    { id: 'earth', name: 'Earth', color: 'blue', orbit: 365 },
    { id: 'mars', name: 'Mars', color: 'red', orbit: 687 },
    { id: 'jupiter', name: 'Jupiter', color: 'brown', orbit: 12 * 365 },
    { id: 'saturn', name: 'Saturn', color: 'yellow', orbit: 29 * 365 },
    { id: 'uranus', name: 'Uranus', color: 'blue', orbit: 84 * 365 },
    { id: 'neptune', name: 'Neptune', color: 'blue', orbit: 165 * 365 },
    { id: 'pluto', name: 'Pluto', color: 'brown', orbit: 248 * 365 },
  ],
  physics: {
    gravity: 1,
    energy:  500,
  },
  meta: {
    selected: 'venus',
  },
}
