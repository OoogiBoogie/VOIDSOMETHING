/*
 * Validation script for worldToParcel / coordsToParcelId / parcelIdToCoords consistency.
 * Run with: npx ts-node scripts/validate/worldToParcel-validate.ts
 * (Added npm script: validate:coords)
 */
import { worldToParcel, coordsToParcelId, parcelIdToCoords, getDistrict, GRID_SIZE, PARCEL_SIZE } from '../../world/WorldCoords'

interface Assertion { name: string; pass: boolean; message?: string }
const assertions: Assertion[] = []

function assert(name: string, condition: boolean, message?: string) {
  assertions.push({ name, pass: condition, message })
}

// Edge coordinates (corners)
const corners = [
  { x: 0, z: 0 },
  { x: GRID_SIZE * PARCEL_SIZE - 1, z: 0 },
  { x: 0, z: GRID_SIZE * PARCEL_SIZE - 1 },
  { x: GRID_SIZE * PARCEL_SIZE - 1, z: GRID_SIZE * PARCEL_SIZE - 1 },
]

for (const c of corners) {
  const grid = worldToParcel(c)
  assert(`corner within bounds (${c.x},${c.z})`, grid.x >= 0 && grid.x < GRID_SIZE && grid.z >= 0 && grid.z < GRID_SIZE)
}

// Round-trip for random sample
for (let i = 0; i < 50; i++) {
  const world = { x: Math.random() * GRID_SIZE * PARCEL_SIZE, z: Math.random() * GRID_SIZE * PARCEL_SIZE }
  const grid = worldToParcel(world)
  const id = coordsToParcelId(grid)
  const back = parcelIdToCoords(id)
  assert('round-trip parcelId->coords', back.x === grid.x && back.z === grid.z)
}

// District boundaries: ensure midpoint separation logic holds
const mid = GRID_SIZE / 2
assert('district defi check', getDistrict({ x: 0, z: GRID_SIZE - 1 }) === 'defi')
assert('district creator check', getDistrict({ x: GRID_SIZE - 1, z: GRID_SIZE - 1 }) === 'creator')
assert('district dao check', getDistrict({ x: 0, z: 0 }) === 'dao')
assert('district ai check', getDistrict({ x: GRID_SIZE - 1, z: 0 }) === 'ai')

// Parcel transitions: moving across a boundary changes either x or z by +1 only.
for (let x = 0; x < GRID_SIZE - 1; x++) {
  const p1 = { x: x * PARCEL_SIZE + PARCEL_SIZE * 0.1, z: PARCEL_SIZE * 5 }
  const p2 = { x: (x + 1) * PARCEL_SIZE + PARCEL_SIZE * 0.1, z: PARCEL_SIZE * 5 }
  const g1 = worldToParcel(p1)
  const g2 = worldToParcel(p2)
  assert('adjacent horizontal transition', g2.x - g1.x === 1 && g2.z === g1.z)
}
for (let z = 0; z < GRID_SIZE - 1; z++) {
  const p1 = { x: PARCEL_SIZE * 5, z: z * PARCEL_SIZE + PARCEL_SIZE * 0.1 }
  const p2 = { x: PARCEL_SIZE * 5, z: (z + 1) * PARCEL_SIZE + PARCEL_SIZE * 0.1 }
  const g1 = worldToParcel(p1)
  const g2 = worldToParcel(p2)
  assert('adjacent vertical transition', g2.z - g1.z === 1 && g2.x === g1.x)
}

// Report
const failed = assertions.filter(a => !a.pass)
for (const a of assertions) {
  if (a.pass) {
    console.log(`✅ ${a.name}`)
  } else {
    console.error(`❌ ${a.name} :: ${a.message || 'failed'}`)
  }
}
console.log(`\nSummary: ${assertions.length - failed.length}/${assertions.length} passed.`)
if (failed.length) {
  process.exitCode = 1
}
