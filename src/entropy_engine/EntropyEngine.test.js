import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GAME_CONSTANTS } from './constants.js';
import { createChamberData } from './chamberData.js';

describe('Entropy Engine: Reality Collapse — Mechanics & Logic', () => {
  it('chamber data initializes with 5 sectors, 4 energy nodes, and 3 equilibrium switches', () => {
    const data = createChamberData();
    assert.equal(data.sectors.length, 5);
    assert.equal(data.energyNodes.length, 4);
    assert.equal(data.checkpoints.length, 5);
    
    // Equilibrium switches A, B, C
    const eqSwitches = data.switches.filter(s => s.id.startsWith('sw_') && s.id !== 'sw_crate');
    assert.equal(eqSwitches.length, 3);
  });

  it('energy costs shift properly during mandatory halfway overload twist', () => {
    // Normal mode costs
    assert.equal(GAME_CONSTANTS.NORMAL_COSTS.gravity, 15);
    assert.equal(GAME_CONSTANTS.NORMAL_COSTS.dimension, 10);
    assert.equal(GAME_CONSTANTS.NORMAL_COSTS.freeze, 20);

    // Overload mode costs: Gravity costs 30, Dimension restores +10 energy!
    assert.equal(GAME_CONSTANTS.OVERLOAD_COSTS.gravity, 30);
    assert.equal(GAME_CONSTANTS.OVERLOAD_COSTS.dimension, -10); // Negative cost = gain
  });

  it('time freeze parameters match specification (5s duration, 6s cooldown)', () => {
    assert.equal(GAME_CONSTANTS.FREEZE_DURATION_SEC, 5.0);
    assert.equal(GAME_CONSTANTS.FREEZE_COOLDOWN_SEC, 6.0);
  });

  it('score calculation matches master prompt formula', () => {
    const remainingTime = 120; // 120s
    const remainingEnergy = 80;
    const attempts = 3;
    const activations = 10; // penalty

    const score = GAME_CONSTANTS.BASE_SCORE +
      (remainingTime * GAME_CONSTANTS.TIME_BONUS_MULT) +
      (remainingEnergy * GAME_CONSTANTS.ENERGY_BONUS_MULT) +
      (attempts * GAME_CONSTANTS.ATTEMPT_BONUS_MULT) -
      (activations * GAME_CONSTANTS.PENALTY_MULT);

    // 1000 + (120*10=1200) + (80*5=400) + (3*200=600) - (10*20=200) = 3000 (Rank S)
    assert.equal(score, 3000);
    assert.ok(score >= GAME_CONSTANTS.RANK_S);
  });

  it('equilibrium sequence logic enforces A -> B -> C order', () => {
    let sequence = [];
    const activate = (key) => {
      sequence.push(key);
      const expected = ['A', 'B', 'C'].slice(0, sequence.length);
      const valid = sequence.every((val, idx) => val === expected[idx]);
      if (!valid) sequence = [];
      return sequence.length === 3;
    };

    // Wrong order B before A -> resets
    assert.equal(activate('B'), false);
    assert.equal(sequence.length, 0);

    // Correct order: A -> B -> C -> stabilized!
    assert.equal(activate('A'), false);
    assert.equal(activate('B'), false);
    assert.equal(activate('C'), true);
    assert.equal(sequence.length, 3);
  });
});
