const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const launchOptions = { headless: true };
  if (process.env.MYTHBORNE_CHROME_PATH) {
    launchOptions.executablePath = process.env.MYTHBORNE_CHROME_PATH;
  }

  const browser = await chromium.launch(launchOptions);
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    const target = process.env.MYTHBORNE_TEST_URL
      || `file://${path.resolve(__dirname, 'public/index.html')}`;
    await page.goto(target);
    await page.getByLabel('Veyr 1', { exact: true }).waitFor();

    const firstRoster = page.getByLabel('Veyr 1', { exact: true });
    assert.equal(await firstRoster.locator('option').count(), 74);
    assert.equal(await firstRoster.locator('option', { hasText: 'Nyx' }).count(), 1);
    assert.equal(await page.getByLabel('Vật Lý', { exact: true }).count(), 1);

    for (const [index, name] of ['Hades', 'Prometheus', 'Anubis', 'Nyx', 'Nephele'].entries()) {
      await page.getByLabel(`Veyr ${index + 1}`, { exact: true }).selectOption({ label: name });
      await page.getByLabel(`Vận Mệnh ${index + 1}`, { exact: true }).selectOption('6');
    }
    await page.locator('#enemyHPMode').selectOption('infinite');
    await page.locator('#cycles').fill('3');
    await page.locator('#simulate').click();
    assert.equal(await page.locator('#cycleResults tbody tr').count(), 3);
    assert.doesNotMatch(await page.locator('#totalDamage').innerText(), /^(0|—)$|NaN|Infinity/);
    assert.match(await page.locator('#combatLog').innerText(), /HP ∞/);
    await page.locator('#draftStatus').filter({ hasText: 'Đã tự lưu bản nháp' }).waitFor();
    await page.reload();
    await page.getByLabel('Veyr 1', { exact: true }).waitFor();
    assert.equal(await page.getByLabel('Veyr 1', { exact: true }).inputValue(), 'Hades');
    assert.equal(await page.getByLabel('Vận Mệnh 1', { exact: true }).inputValue(), '6');
    assert.equal(await page.locator('#enemyHPMode').inputValue(), 'infinite');
    assert.equal(await page.locator('#cycles').inputValue(), '3');
    assert.match(await page.locator('#draftStatus').innerText(), /Đã khôi phục bản nháp/);
    assert.doesNotMatch(await page.locator('#totalDamage').innerText(), /^(0|—)$|NaN|Infinity/);
    assert.equal(await page.locator('#optimizerLocked option').count(), 75);
    await page.locator('#optimizerBudget').selectOption('80');
    await page.locator('#optimizeRotation').click();
    await page.locator('#optimizerMessage').filter({ hasText: /^Hoàn tất/ }).waitFor({ timeout: 120000 });
    assert.ok(await page.locator('#optimizerResults tbody tr').count() >= 1);
    await page.getByRole('button', { name: 'Nạp phương án', exact: true }).first().click();
    assert.match(await page.locator('#optimizerMessage').innerText(), /Đã nạp phương án/);
    assert.doesNotMatch(await page.locator('#totalDamage').innerText(), /^(0|—)$|NaN|Infinity/);
    await page.locator('#optimizerLocked').selectOption('Skadi');
    await page.locator('#optimizerSustain').selectOption('exactlyOne');
    await page.locator('#optimizerBudget').selectOption('12');
    await page.locator('#optimizerFate').selectOption('0');
    await page.locator('#optimizerRefine').selectOption('1');
    await page.locator('#cycles').fill('1');
    await page.evaluate(() => document.querySelector('#optimizer').scrollIntoView({ behavior: 'instant' }));
    await page.evaluate(() => document.querySelector('#optimizeTeam').click());
    await page.waitForFunction(() => !document.querySelector('#optimizeTeam').disabled,{},{timeout:180000});
    assert.match(await page.locator('#optimizerMessage').innerText(),/^Hoàn tất/);
    assert.ok(await page.locator('#optimizerResults tbody tr').count() >= 1);
    assert.match(await page.locator('#optimizerResults tbody tr').first().innerText(), /Skadi/);
    await page.getByRole('button', { name: 'Nạp phương án', exact: true }).first().click();
    assert.ok(await Promise.all(Array.from({ length: 5 },(_,i)=>page.getByLabel(`Veyr ${i+1}`,{exact:true}).inputValue())).then(values=>values.includes('Skadi')));

    await page.locator('#teamSnapshotName').fill('Đội kiểm tra');
    await page.locator('#saveReportTeam').click();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#exportReportTeams').click();
    const download = await downloadPromise;
    const archivePath = await download.path();
    assert.ok(archivePath);
    await page.getByRole('button', { name: 'Xóa đội Đội kiểm tra', exact: true }).click();
    await page.locator('#importTeamFile').setInputFiles(archivePath);
    await page.getByRole('button', { name: 'Nạp đội Đội kiểm tra', exact: true }).waitFor();
    assert.match(await page.locator('#teamReportMessage').innerText(), /Đã nhập 1 đội hình/);

    await firstRoster.selectOption({ label: 'Skadi' });
    const firstMemory = page.getByLabel('Mảnh Ký Ức 1', { exact: true });
    await firstMemory.selectOption({ label: 'Mười Hai Vỏ Đạn Dưới Cực Quang' });
    await firstRoster.selectOption({ label: 'Freyja' });
    assert.equal(await firstMemory.inputValue(), '');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    assert.deepEqual(errors, []);
    console.log('PASS public browser roster, VM6 team, infinite HP, optimizer, draft recovery, per-Veyr gear and mobile layout');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
