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
    console.log('PASS public browser roster, VM6 team, infinite HP, per-Veyr gear and mobile layout');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
