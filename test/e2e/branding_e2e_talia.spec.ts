import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from './fixtures/orkas';

test('uses the Talia identity without changing persisted integration contracts', async ({ orkas }, testInfo) => {
  const page = orkas.page!;
  await expect(page).toHaveTitle('Talia');
  await expect(page.locator('.sidebar-logo .logo-text')).toHaveText('Talia');
  const image = page.locator('.sidebar-logo .logo-icon');
  await expect(image).toHaveAttribute('src', '../resources/icons/talia-symbol.svg');
  expect(await image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  const iconPath = path.resolve(__dirname, '../../src/resources/icons/icon.png');
  const manifest = JSON.parse(readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8'));
  const identity = await orkas.electronApp!.evaluate(({ app, nativeImage }, iconPath) => {
    return {
      name: app.getName(),
      userData: app.getPath('userData'),
      iconEmpty: nativeImage.createFromPath(iconPath).isEmpty(),
    };
  }, iconPath);
  expect(identity).toMatchObject({ name: 'Talia', iconEmpty: false });
  expect(manifest.build.productName).toBe('Talia');
  expect(manifest.build.protocols[0].schemes).toEqual(['orkas']);
  // Il profilo isolato del test deve prevalere sul nome visibile dell'app.
  expect(identity.userData).not.toMatch(/[/\\]Talia$/);
  await page.screenshot({ path: testInfo.outputPath('talia-desktop.png') });
  await page.evaluate(async () => { await (window as any).setLang('it'); });
  await page.locator('#settings-btn').click();
  await expect(page.locator('#settings-orkas-api-create-key')).toBeAttached();
  await expect(page.locator('[data-i18n="settings.language.sub"]')).toContainText('Talia');
  await page.setViewportSize({ width: 620, height: 900 });
  await page.screenshot({ path: testInfo.outputPath('talia-it-narrow.png') });
  const logo = page.locator('.sidebar-logo');
  expect(await logo.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
});
