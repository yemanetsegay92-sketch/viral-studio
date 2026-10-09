const {test} = require('node:test');
const assert = require('node:assert/strict');
const captions = require('../js/captions.js');
test('estimated captions give longer lines more time and preserve Ethiopic text', () => {
    const cues = captions.fromText('ሰላም\nThis caption has several more words', 7);
    assert.equal(cues[0].text, 'ሰላም');
    assert.equal(cues[0].start, 0);
    assert.ok(cues[1].end - cues[1].start > cues[0].end - cues[0].start);
    assert.equal(cues[1].end, 7);
    assert.equal(captions.validate(cues, 7), '');
});
test('rejects invalid timing, overlaps, empty text and captions beyond the scene', () => {
    for (const cue of [{text:'a',start:NaN,end:1},{text:'a',start:1,end:1},{text:'a',start:-1,end:1},{text:'',start:0,end:1},{text:'a',start:0,end:8}]) {
        assert.notEqual(captions.validate([cue],7),'');
    }
    assert.match(captions.validate([{text:'a',start:0,end:3},{text:'b',start:2,end:4}],7),/overlaps/);
    assert.equal(captions.validate([{text:'a',start:0.125,end:1.875},{text:'b',start:2.1,end:4}],7),'');
});
test('SRT round trip preserves multiline captions and millisecond timing', () => {
    const cues = [{text:'ሰላም\nHello',start:0.125,end:1.875},{text:'Next',start:2.1,end:4}];
    assert.deepEqual(captions.parseSrt(captions.toSrt(cues)).map(({voiceProfile,...c}) => c),cues);
    assert.throws(() => captions.parseSrt('1\n00:70:00,000 --> 00:00:05,000\nBad'));
});
