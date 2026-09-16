const {chromium}=require('/Users/ducbom/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.MYTHBORNE_TEST_URL||'file://'+path.resolve(__dirname,'Mythborne-Damage-Lab.html'));await page.locator('#cycleRunner').waitFor();
 await page.locator('#enemyHP').fill('10000000');await page.locator('#simulate').click();assert.notEqual(await page.locator('#totalDamage').innerText(),'—');assert.ok(await page.locator('#enemyHP').evaluate(e=>e.checkValidity()));assert.equal(await page.locator('#cycleResults tbody tr').count(),2);
 await page.locator('#enemyHPMode').selectOption('infinite');await page.locator('#enemyHP').fill('1');await page.locator('#simulate').click();assert.match(await page.locator('#combatLog').innerText(),/HP ∞/);assert.notEqual(await page.locator('#singleDamage').innerText(),'0');assert.doesNotMatch(await page.locator('#totalDamage').innerText(),/NaN|Infinity|—/);assert.equal(await page.locator('#cycleResults tbody tr').last().locator('td').last().innerText(),await page.locator('#totalDamage').innerText());
 await page.locator('#enemyHPMode').selectOption('finite');await page.locator('#simulate').click();assert.doesNotMatch(await page.locator('#combatLog').innerText(),/HP ∞/);assert.equal(await page.locator('#totalDamage').innerText(),await page.locator('#enemyCount').inputValue());
 await page.locator('#enemyHP').fill('0');assert.match(await page.locator('#combatLog').innerText(),/HP mỗi Myrk/);
 assert.deepEqual(errors,[]);console.log('PASS Chrome 10M HP input, infinite mode, per-target/cycle totals, finite toggle and specific validation error');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
