import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { STORY_PAGES, pageText } from './narrationScript.js'

// Part A: the ancient script must contain the new developer radio narration
// AND keep the original Level 1 briefing pages.

describe('narration script data', () => {
  test('has the 3 new narration pages followed by the 2 original briefing pages', () => {
    assert.equal(STORY_PAGES.length, 5)
    assert.match(STORY_PAGES[3].status, /SIGNAL ESTABLISHED/, 'original page 1 must remain')
    assert.match(STORY_PAGES[4].status, /SECTOR INTEL/, 'original page 2 (Level 1 intel) must remain')
    assert.match(STORY_PAGES[4].status, /LEVEL 1/)
  })

  test('narration page 1 — awakening through the static', () => {
    const text = pageText(STORY_PAGES[0])
    assert.match(text, /Can anyone hear me\?/)
    assert.match(text, /Not again/)
    assert.match(text, /reach someone outside/)
  })

  test('narration page 2 — the developer reveals himself', () => {
    const text = pageText(STORY_PAGES[1])
    assert.match(text, /Developer/)
    assert.match(text, /created this world/)
    assert.match(text, /my own creation/)
    assert.match(text, /Until you/)
    assert.match(text, /Yes\.\.\. YOU/)
  })

  test('narration page 3 — the chosen one & transmission cut-off', () => {
    const text = pageText(STORY_PAGES[2])
    assert.match(text, /chosen one/)
    assert.match(text, /save me/)
    assert.match(text, /TRANSMISSION DISCONNECT/)
  })

  test('SFX / voice cues are captured as stage-cue blocks', () => {
    const cueBlocks = STORY_PAGES.flatMap((p) => p.blocks.filter((b) => b.type === 'cue'))
    assert.ok(cueBlocks.some((b) => /static/i.test(b.text)))
    assert.ok(cueBlocks.some((b) => /urgent|emotional/i.test(b.text)))
  })

  test('original briefing content preserved verbatim', () => {
    const intelText = pageText(STORY_PAGES[4])
    assert.match(intelText, /GLITCH VISION \(Hold Q\)/)
    const introText = pageText(STORY_PAGES[3])
    assert.match(introText, /you are the chosen one/)
    assert.match(introText, /recursive glitch/)
  })

  test('every page has a speaker and blocks with dialogue text', () => {
    for (const page of STORY_PAGES) {
      assert.ok(page.speaker)
      assert.ok(page.status)
      assert.ok(Array.isArray(page.blocks) && page.blocks.length > 0)
      for (const block of page.blocks) {
        assert.ok(block.text && block.text.trim().length > 0, 'no empty blocks')
      }
    }
  })
})
