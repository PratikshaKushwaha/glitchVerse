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

function bake(rows) {
    const c = document.createElement('canvas'); c.width = 12; c.height = rows.length;
    const x = c.getContext('2d');
    rows.forEach((r, y) => [...r].forEach((ch, i) => { if (PAL[ch]) { x.fillStyle = PAL[ch]; x.fillRect(i, y, 1, 1); } }));
    return c;
}
const F = {
    idle: bake([...BODY, ...LEG.idle]),
    run: [LEG.a, LEG.b, flip(LEG.a), LEG.b].map(l => bake([...BODY, ...l])),
    jump: bake([...BODY, ...LEG.a])
};

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
