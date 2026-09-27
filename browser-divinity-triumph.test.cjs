const {chromium}=require('/Users/ducbom/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
const assert=require('node:assert/strict');

(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('file://'+path.resolve(__dirname,'Mythborne-Damage-Lab.html'));await page.getByLabel('Veyr 1',{exact:true}).waitFor();
 assert.equal(await page.getByLabel('Khải Hoàn Thần Tính 1',{exact:true}).count(),0);
 await page.getByLabel('Veyr 1',{exact:true}).selectOption({label:'Kael'});
 const toggle=page.getByLabel('Khải Hoàn Thần Tính 1',{exact:true});assert.equal(await toggle.getAttribute('aria-pressed'),'true');await toggle.click();assert.equal(await toggle.getAttribute('aria-pressed'),'false');
 const saved=await page.evaluate(()=>{const detail={};document.dispatchEvent(new CustomEvent('mythborne-build-snapshot',{detail}));return detail.build.states[0].kitDivinityTriumph;});assert.equal(saved,false);
 await page.getByLabel('Veyr 1',{exact:true}).selectOption({label:'Aren'});assert.equal(await page.getByLabel('Khải Hoàn Thần Tính 1',{exact:true}).count(),0);
 assert.deepEqual(errors,[]);console.log('PASS Chrome Khải Hoàn Thần Tính visibility, toggle and build snapshot');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exit(1);});
