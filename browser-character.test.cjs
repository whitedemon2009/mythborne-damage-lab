const {chromium}=require('/Users/ducbom/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(process.env.MYTHBORNE_TEST_URL||'file://'+path.resolve(__dirname,'Mythborne-Damage-Lab.html'));await page.getByLabel('Mảnh Ký Ức 1',{exact:true}).waitFor();
 await page.locator('.battle-settings>summary').click();await page.locator('.advanced-sequence>summary').click();
 await page.locator('#enemyCount').fill('5');await page.locator('#enemyHP').fill('1000000');await page.locator('#enemyAttack').fill('0');await page.locator('#cycles').fill('5');await page.locator('#critMode').selectOption('sampled');
 await page.locator('#generateKit').click();await page.locator('#simulate').click();
 assert.equal(await page.locator('.action-row').count(),11);
 assert.notEqual(await page.locator('#totalDamage').innerText(),'—');assert.match(await page.locator('#gearCoverage').innerText(),/5\/5/);
 const log=await page.locator('#combatLog').innerText();for(const name of ['Call Down the Meridian','When Heaven Runs Out of Thunder','Iron Appeal','Tiger’s Talon'])assert.ok(log.includes(name),name+' absent from log');
 assert.match(log,/Sevenfold Pyre|Sunwheel Incarnate/);
 const row=page.locator('.action-row').first();assert.equal(await row.locator('.multiplier').isDisabled(),true);assert.equal(await row.locator('.kitAction').inputValue(),'Skill');
 await page.getByLabel('Vận Mệnh 2',{exact:true}).selectOption('6');await page.locator('#simulate').click();assert.match(await page.locator('#combatLog').innerText(),/Sunwheel Incarnate/);
 // A supported row cannot silently use another Veyr's kit after changing the roster.
 await page.getByLabel('Veyr 1',{exact:true}).selectOption({label:'Artemis'});assert.notEqual(await page.locator('#totalDamage').innerText(),'—');assert.match(await page.locator('#combatLog').innerText(),/Gilded Draw/);
 await page.getByLabel('Cơ chế Veyr 1',{exact:true}).selectOption('false');assert.equal(await page.locator('#totalDamage').innerText(),'—');assert.match(await page.locator('#combatLog').innerText(),/bật kit tự động/);
 await page.getByLabel('Veyr 1',{exact:true}).selectOption({label:'Máni'});await page.locator('#generateKit').click();
 await page.getByLabel('Đồng minh nhận Tuyệt Kĩ tự động 1',{exact:true}).selectOption('2');await page.locator('#simulate').click();assert.notEqual(await page.locator('#totalDamage').innerText(),'—');
 await page.getByLabel('Veyr 1',{exact:true}).selectOption({label:'Ares'});await page.locator('#generateKit').click();
 await page.locator('.action-row').first().locator('.kitVariant').selectOption('3');await page.locator('#enemyTargets').fill('5');await page.locator('#simulate').click();
 assert.match(await page.locator('#combatLog').innerText(),/Spearhead: Break the Line · 3/);assert.notEqual(await page.locator('#totalDamage').innerText(),'—');
 await page.getByLabel('Veyr 1',{exact:true}).selectOption({label:'Janus'});await page.locator('#generateKit').click();await page.locator('#simulate').click();assert.match(await page.locator('#combatLog').innerText(),/Open the Red Gate/);assert.notEqual(await page.locator('#totalDamage').innerText(),'—');
 assert.deepEqual(errors,[]);console.log('PASS Chrome standalone canonical rotation, auto Ult II, automatic FUA, fate selection, roster-change guard, automatic Ult recipient, Ares Tier III and multi-target Myrk');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
