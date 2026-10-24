const PAL = {
    o: '#120d22', h: '#5b3a9e', s: '#f2c9a0', e: '#1a1030',
    j: '#18b7ff', J: '#9af0ff', p: '#2b3a8c', b: '#e8e8f5'
};

const BODY = [
    '...oooooo...',
    '..ohhhhhho..',
    '.ohhhhhhhho.',
    '.ohssssssho.',
    '.osesssesso.',
    '..osssssso..',
    '...ojjjjo...',
    '..ojjJJjjo..',
    '.osjjJJjjso.',
    '.osjjjjjjso.',
    '..oppppppo..'
];
const LEG = {
    idle: ['..oppoppo...', '..oppoppo...', '..oppoppo...', '..obboobbo..', '..oooooooo..'],
    a: ['.oppo..oppo.', 'oppo....oppo', 'obbo....oppo', 'oooo....obbo', '........oooo'],
    b: ['..oppppppo..', '..oppoppo...', '..oppoppo...', '..obboobbo..', '..oooooooo..']
};
const flip = rows => rows.map(r => [...r].reverse().join(''));

function bakeGeneric(rows, pal, width) {
    const w = width || rows[0].length;
    const c = document.createElement('canvas'); c.width = w; c.height = rows.length;
    const x = c.getContext('2d');
    rows.forEach((r, y) => [...r].forEach((ch, i) => {
        if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i, y, 1, 1); }
    }));
    return c;
}

function bake(rows) {
    return bakeGeneric(rows, PAL, 12);
}

const F = {
    idle: bake([...BODY, ...LEG.idle]),
    run: [LEG.a, LEG.b, flip(LEG.a), LEG.b].map(l => bake([...BODY, ...l])),
    jump: bake([...BODY, ...LEG.a])
};

// --- GUN SPRITE ---
const GUN_PAL = {
    o: '#120d22', g: '#5a54a0', c: '#18b7ff', w: '#ffffff', y: '#ffd23a'
};
const GUN_ROWS = [
    '..oooo..',
    '.oggggo.',
    'ogccwwyo',
    '.ogoo...',
    '..o.....'
];
export const GUN_IMG = bakeGeneric(GUN_ROWS, GUN_PAL, 8);

// --- PAWN ENEMY SPRITES ---
const PAWN_PAL = {
    o: '#0c0818', d: '#2b1b42', m: '#613e8b', r: '#ff2d55', R: '#ff859d', y: '#ffd23a', w: '#ffffff', e: '#120d22'
};
const PAWN_BODY = [
    '...oooooo...',
    '..ommmmmmo..',
    '.omdrrrdmmo.',
    '.omdRRRdmmo.',
    '.omdddddmmo.',
    '..oddddddo..',
    '..odrrrrdo..',
    '...oooooo...'
];
const PAWN_LEG_A = [
    '..odd..ddo..',
    '.ommo..ommo.',
    '.oooo..oooo.'
];
const PAWN_LEG_B = [
    '...oddddo...',
    '..omm..mmo..',
    '..ooo..ooo..'
];

const PAWN_WHITE_PAL = Object.fromEntries(Object.keys(PAWN_PAL).map(k => [k, '#ffffff']));

const F_PAWN = {
    idle: bakeGeneric([...PAWN_BODY, ...PAWN_LEG_A], PAWN_PAL, 12),
    walk1: bakeGeneric([...PAWN_BODY, ...PAWN_LEG_A], PAWN_PAL, 12),
    walk2: bakeGeneric([...PAWN_BODY, ...PAWN_LEG_B], PAWN_PAL, 12),
    hit: bakeGeneric([...PAWN_BODY, ...PAWN_LEG_A], PAWN_WHITE_PAL, 12)
};

export function pawnFrame(pawn, t) {
    if (pawn.flashT > 0) return F_PAWN.hit;
    const moving = Math.abs(pawn.vx) > 3;
    if (moving) return (t * 8 | 0) % 2 === 0 ? F_PAWN.walk1 : F_PAWN.walk2;
    return F_PAWN.idle;
}

// --- BOSS SPRITE WITH GUN ---
const BOSS_PAL = {
    o: '#080512', k: '#1d1430', d: '#382054', m: '#6b3c99', h: '#a85ce6',
    r: '#ff1744', R: '#ff6b8b', y: '#ffd23a', w: '#ffffff', c: '#00e5ff', C: '#9af0ff', g: '#4a4766'
};

const BOSS_ROWS = [
    '....oo........oo....',
    '...ommo......ommo...',
    '..ohhhmo....ohhhmo..',
    '..ohhhhhdo..ohhhhhdo',
    '.ohhdddhhdoohdddhhdo',
    '.ohdrrrddhhohddrrrdo',
    '.ohdRRRddhhohdRRRRdo',
    '..odddddddooddddddo.',
    '..odddddddooddddddo.',
    '..oddccccddddcccddo.',
    '..oddCCCCddddCCCddo.',
    '..odddddddddddddddo.',
    '..ommmddddddddmmmo..',
    '.ommmmmddddddmmmmmo.',
    '..ooooommmmmmmoooo..',
    '.....oddddddddo.....',
    '....ommmmmmmmmmo....',
    '....ohhhhhhhhhho....',
    '...ohhhhhhhhhhhho...',
    '...oddrrrdddrrrdo...',
    '..oddrrrrddrrrrddo..',
    '..oddrrrrddrrrrddo..',
    '..oooo...oo...oooo..'
];

const BOSS_WHITE_PAL = Object.fromEntries(Object.keys(BOSS_PAL).map(k => [k, '#ffffff']));

// Boss Heavy Arm Cannon
const BOSS_GUN_ROWS = [
    '..oooooo......',
    '.oggmmggo.....',
    'ogccCCwwyo....',
    'ogccCCwwyooooo',
    '.oggmmggo.....',
    '..oooooo......'
];

const F_BOSS = {
    idle: bakeGeneric(BOSS_ROWS, BOSS_PAL, 20),
    flash: bakeGeneric(BOSS_ROWS, BOSS_WHITE_PAL, 20),
    gun: bakeGeneric(BOSS_GUN_ROWS, BOSS_PAL, 14)
};

export function bossFrame(boss) {
    if (boss.flashT > 0) return F_BOSS.flash;
    return F_BOSS.idle;
}

export function bossGunImg() {
    return F_BOSS.gun;
}

export function heroFrame(p, t) {
    if (!p.on) return F.jump;
    if (Math.abs(p.vx) > 8) return F.run[(t * 10 | 0) % 4];
    return F.idle;
}

// draws a baked sprite; flipX = facing left, flipY = gravity reversed, sx/sy = squash/stretch
export function drawSprite(g, img, x, y, flipX = false, flipY = false, sx = 1, sy = 1) {
    g.save();
    const cx = x + img.width / 2, cy = y + img.height / 2;
    g.translate(Math.round(cx), Math.round(cy));
    g.scale((flipX ? -1 : 1) * sx, (flipY ? -1 : 1) * sy);
    g.drawImage(img, -img.width / 2, -img.height / 2);
    g.restore();
}