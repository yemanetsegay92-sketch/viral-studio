const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function renderer(project, width=1920,height=1080) {
    const context = {console:{log(){},warn(){},error(){}},document:{readyState:'loading',addEventListener(){}},window:{ViralProject:project,ViralVideo:{video:{videoWidth:width,videoHeight:height}}}};
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(require.resolve('../js/renderer.js'),'utf8'),context);
    const r=context.window.ViralRenderer;r.renderSettings=project;r.videoInputName='input.mp4';return r;
}
test('fast and high output dimensions follow shape and keep source aspect without upscaling', () => {
    const r = renderer({outputAspectRatio:'source',exportQuality:'fast'});
    assert.deepEqual(JSON.parse(JSON.stringify(r.getOutputDimensions())),{width:1280,height:720});
    r.renderSettings.outputAspectRatio='9:16';
    assert.deepEqual(JSON.parse(JSON.stringify(r.getOutputDimensions())),{width:720,height:1280});
    r.renderSettings.exportQuality='high';
    assert.deepEqual(JSON.parse(JSON.stringify(r.getOutputDimensions())),{width:1080,height:1920});
    const small=renderer({outputAspectRatio:'source',exportQuality:'high'},640,360);
    assert.equal(small.getOutputDimensions().width,640);
});
test('subtitles-only optionally maps original audio, with no narration filters or forced missing audio', async () => {
    const r=renderer({editorMode:'subtitles',outputAspectRatio:'source',exportQuality:'fast'});
    const filter=await r.buildFilterGraph([],[],2,null,null,'source');
    const args=r.buildFFmpegArguments({start:1,duration:2},null,[],filter);
    assert.ok(args.includes('0:a?'));assert.ok(!args.includes('[aout]'));
    assert.ok(args.includes('ultrafast'));
    assert.ok(!args[args.indexOf('-filter_complex')+1].includes('[0:a]'));
});
test('vertical export accepts valid smart crop and zero narration/original volume stays zero', async () => {
    const r=renderer({editorMode:'narration',outputAspectRatio:'9:16',exportQuality:'fast',audioMode:'original_narration',originalVolume:0,narrationVolume:0});
    const cues=[{text:'a',start:.5,end:1,voiceProfile:'narrator'}];
    const data=await r.buildFilterGraph(cues,[],2,{x:100,y:0,width:608,height:1080},null,'9:16');
    const args=r.buildFFmpegArguments({start:0,duration:2},'voice.wav',[],data);
    const graph=args[args.indexOf('-filter_complex')+1];
    assert.match(graph,/crop=608:1080:100:0/);assert.match(graph,/\[0:a\]volume=0,/);assert.match(graph,/volume=0\.000,/);
});
test('character voice filters preserve uncaptained gaps on the narration timeline', () => {
    const r=renderer({});
    const graph=r.buildCharacterVoiceFilter([{start:.5,end:1,voiceProfile:'deep'},{start:1.5,end:2,voiceProfile:'child'}],3,1);
    assert.match(graph,/atrim=start=0\.000:end=0\.500/);
    assert.match(graph,/atrim=start=1\.000:end=1\.500/);
    assert.match(graph,/atrim=start=2\.000:end=3\.000/);
    assert.match(graph,/concat=n=5/);
});
