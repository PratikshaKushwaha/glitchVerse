import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { generateLevel1Data } from './LevelManager.js'

// Part B of the design: codes must be hidden in interactive containers
// (drawers / cupboards / crates), requiring search effort, with difficulty
// scaling by room number (room 1 = easiest, room 4 = hardest).

describe('generateLevel1Data hiding spots', () => {
  const data = generateLevel1Data()

  test('each searchable room (1-4) has exactly one real spot holding the room code', () => {
    for (let i = 0; i < 4; i++) {
      const room = data.rooms[i]
      const roomSpots = data.hidingSpots[i].spots
      const realSpots = roomSpots.filter((s) => s.isReal)
      assert.equal(realSpots.length, 1, `room ${i + 1} should have exactly 1 real spot`)
      assert.equal(realSpots[0].code, room.code, 'real spot must hold the room door code')
    }
  })

  test('difficulty scales: spot counts increase 1 -> 2 -> 3 -> 3', () => {
    assert.equal(data.hidingSpots[0].spots.length, 1)
    assert.equal(data.hidingSpots[1].spots.length, 2)
    assert.equal(data.hidingSpots[2].spots.length, 3)
    assert.equal(data.hidingSpots[3].spots.length, 3)
  })

  test('difficulty scales: decoy counts never decrease and final room > first room', () => {
    const decoyCounts = data.hidingSpots.map((room) =>
      room.spots.filter((s) => !s.isReal).length
    )
    for (let i = 1; i < decoyCounts.length; i++) {
      assert.ok(decoyCounts[i] >= decoyCounts[i - 1], 'decoy counts must be non-decreasing')
    }
    assert.ok(decoyCounts[3] > decoyCounts[0], 'hardest room must have more decoys than easiest')
  })

  test('decoys are clearly labelled and never leak the real code', () => {
    for (let i = 0; i < 4; i++) {
      const realCode = data.rooms[i].code
      const roomSpots = data.hidingSpots[i].spots
      for (const spot of roomSpots) {
        assert.ok(spot.id && spot.id.startsWith(`spot-${i}-`), 'spot ids must be namespaced per room')
        assert.ok(spot.name, 'every spot needs a display name for the interaction prompt')
        assert.ok(spot.stages >= 1, 'every spot needs at least one open stage')
        if (!spot.isReal) {
          assert.notEqual(spot.code, realCode, 'decoy must NOT show the real room code')
          assert.ok(spot.decoyLabel, 'decoy needs a label hinting it is not the real code')
        }
      }
    }
  })

  test('real container is re-randomized between runs', () => {
    const outcomes = new Set()
    for (let run = 0; run < 200; run++) {
      const d = generateLevel1Data()
      const realIdx = d.hidingSpots[1].spots.findIndex((s) => s.isReal)
      outcomes.add(realIdx)
    }
    assert.ok(outcomes.size >= 2, 'real spot placement should vary across runs in room 2')
  })

  test('harder rooms contain multi-stage containers (extra open presses)', () => {
    for (const roomIdx of [1, 3]) {
      const stageCounts = data.hidingSpots[roomIdx].spots.map((s) => s.stages)
      assert.ok(Math.max(...stageCounts) >= 2, `room ${roomIdx + 1} should need a double-open container`)
    }
  })

  test('every spot has a world position inside the room bounds', () => {
    for (let i = 0; i < 4; i++) {
      const roomSpots = data.hidingSpots[i].spots
      for (const spot of roomSpots) {
        assert.ok(Array.isArray(spot.pos), `spot ${spot.id} must have a pos array`)
        assert.equal(spot.pos.length, 2)
        for (const v of spot.pos) {
          assert.ok(Number.isFinite(v), `spot ${spot.id} pos must be numeric`)
        }
        // Rooms are 7x7 units centred on ROOM_CENTER_Z
        assert.ok(Math.abs(spot.pos[0]) <= 3.2, `spot ${spot.id} x out of room bounds`)
        assert.ok(Math.abs(spot.pos[1]) <= 3.2, `spot ${spot.id} z out of room bounds`)
      }
    }
  })

  test('requested hiding places are used: drawer, cupboard, locker, under a chair, sofa, painting', () => {
    const containerTypes = new Set(
      data.hidingSpots.flatMap((room) => room.spots.map((s) => s.container))
    )
    for (const required of ['drawer', 'cupboard', 'locker', 'underchair', 'sofa', 'painting']) {
      assert.ok(containerTypes.has(required), `container type '${required}' missing from Level 1`)
    }
  })

  test('unchanged behaviour: room 5 vault data still generated', () => {
    assert.ok(data.rooms[4].isRoom5)
    // Secret permutation can coincide with the chronological order, in which
    // case the accepted-code set legitimately collapses to a single code.
    assert.ok(data.acceptedRoom5Codes.length >= 1 && data.acceptedRoom5Codes.length <= 2)
    assert.ok(data.acceptedRoom5Codes.includes(data.chronologicalGoldCode))
    assert.equal(data.allPermutations.length, 6)
  })
})
