"""Subset the site's SIL-OFL Source Serif 4 into outlines for dimensional lettering.

Requires fonttools[woff]. The source font and license remain in assets/fonts.
"""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.basePen import BasePen

root = Path(__file__).resolve().parents[1]
font = TTFont(root / 'assets/fonts/source-serif-4-normal.woff2')
axes = {axis.axisTag: (600 if axis.axisTag == 'wght' else axis.maxValue)
        for axis in font['fvar'].axes}
font = instantiateVariableFont(font, axes, inplace=True)
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()

class OutlinePen(BasePen):
    def __init__(self):
        super().__init__(glyphs)
        self.tokens = []
    def emit(self, op, *points):
        self.tokens.extend([op] + [str(round(c, 2)) for p in points for c in p])
    def _moveTo(self, p): self.emit('m', p)
    def _lineTo(self, p): self.emit('l', p)
    def _curveToOne(self, a, b, end): self.emit('b', end, a, b)
    def _qCurveToOne(self, control, end): self.emit('q', end, control)
    def _closePath(self): pass

out = {}
for char in sorted(set('LibroxOne morepage.Listen.Get lost.Drift away.Stay a while.?')):
    name = cmap[ord(char)]
    pen = OutlinePen()
    glyphs[name].draw(pen)
    out[char] = {'ha': font['hmtx'][name][0], 'o': ' '.join(pen.tokens)}
data = {'glyphs': out, 'familyName': 'Source Serif 4', 'resolution': font['head'].unitsPerEm,
        'boundingBox': {'yMin': font['head'].yMin, 'yMax': font['head'].yMax},
        'underlineThickness': font['post'].underlineThickness}
(root / 'assets/fonts/source-serif-4-scene.json').write_text(json.dumps(data, separators=(',', ':')))
print('Exported Source Serif 4 scene glyphs; SIL Open Font License retained.')
