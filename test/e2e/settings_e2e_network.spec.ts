import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from './fixtures/orkas';

async function openNetwork(page: import('@playwright/test').Page) {
  await page.locator('#settings-btn').click();
  await page.locator('[data-settings-tab="network"]').click();
  await expect(page.locator('#settings-network')).toBeVisible();
  await expect(page.locator('#settings-network-mode')).toHaveValue('automatic');
}

test('saves device-local proxy settings and applies them only after relaunch', async ({ orkas }, testInfo) => {
  const page = orkas.page!;
  await openNetwork(page);
  await page.evaluate(async () => { await (window as any).setLang('it'); });
  await page.locator('#settings-network-mode').selectOption('manual');
  await page.locator('#settings-network-http').fill('http://127.0.0.1:19000');
  await page.locator('#settings-network-https').fill('http://127.0.0.1:19001');
  await page.locator('#settings-network-bypass').fill('.example.com');
  const original = await orkas.electronApp!.evaluate(() => process.env.HTTP_PROXY || null);
  await page.locator('#settings-network-save').click();
  await expect(page.locator('#settings-network-restart')).toBeVisible();
  await expect(page.locator('#settings-network-result')).toContainText('salvate');
  expect(await orkas.electronApp!.evaluate(() => process.env.HTTP_PROXY || null)).toBe(original);
  const file = path.join(orkas.workspaceRoot, 'network-settings.json');
  expect(JSON.parse(readFileSync(file, 'utf8'))).toEqual({
    mode: 'manual', httpProxy: 'http://127.0.0.1:19000', httpsProxy: 'http://127.0.0.1:19001', noProxy: '.example.com',
  });
  await page.screenshot({ path: testInfo.outputPath('network-it-desktop.png') });
  await page.setViewportSize({ width: 620, height: 900 });
  await page.screenshot({ path: testInfo.outputPath('network-it-narrow.png') });
  expect(await page.locator('#settings-network').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  const reopened = await orkas.relaunch();
  const applied = await orkas.electronApp!.evaluate(() => ({
    http: process.env.HTTP_PROXY, https: process.env.HTTPS_PROXY, lower: process.env.https_proxy, bypass: process.env.NO_PROXY,
  }));
  expect(applied).toMatchObject({ http: 'http://127.0.0.1:19000', https: 'http://127.0.0.1:19001', lower: 'http://127.0.0.1:19001' });
  expect(applied.bypass).toContain('127.0.0.1');
  await reopened.locator('#settings-btn').click();
  await reopened.locator('[data-settings-tab="network"]').click();
  await expect(reopened.locator('#settings-network-mode')).toHaveValue('manual');
  await expect(reopened.locator('#settings-network-http')).toHaveValue('http://127.0.0.1:19000');
  await expect(reopened.locator('#settings-network-restart')).toBeHidden();
  expect(orkas.modelRequests).toHaveLength(0);
});

test('tests an unsaved proxy in an isolated session and distinguishes access denial', async ({ orkas }) => {
  const page = orkas.page!;
  await openNetwork(page);
  await page.locator('#settings-network-mode').selectOption('manual');
  await page.locator('#settings-network-http').fill('http://127.0.0.1:19000');
  const app = orkas.electronApp!;
  await app.evaluate(({ session }) => {
    const original = session.fromPartition;
    const observed: any = { closed: false };
    (globalThis as any).__networkDiagnostic = observed;
    (session as any).fromPartition = (partition: string, options: unknown) => {
      if (!partition.startsWith('network-test-')) return original.call(session, partition, options as any);
      observed.partition = partition;
      return {
        setProxy: async (config: unknown) => { observed.config = config; },
        fetch: async (url: string, init: any) => { observed.url = url; observed.method = init.method; observed.credentials = init.credentials; return new Response(null, { status: 403 }); },
        closeAllConnections: async () => { observed.closed = true; },
      };
    };
    (globalThis as any).__restoreNetworkDiagnostic = () => { session.fromPartition = original; };
  });
  try {
    await page.locator('#settings-network-test').click();
    await expect(page.locator('#settings-network-result')).toContainText('403');
    await expect(page.locator('#settings-network-result')).toContainText('not validated');
    expect(await app.evaluate(() => (globalThis as any).__networkDiagnostic)).toMatchObject({
      url: 'https://oauth2.googleapis.com/token', method: 'HEAD', credentials: 'omit', closed: true,
      config: { mode: 'fixed_servers', proxyRules: 'http=http://127.0.0.1:19000;https=http://127.0.0.1:19000' },
    });
    expect(existsSync(path.join(orkas.workspaceRoot, 'network-settings.json'))).toBe(false);
    expect(orkas.modelRequests).toHaveLength(0);
  } finally {
    await app.evaluate(() => { (globalThis as any).__restoreNetworkDiagnostic(); delete (globalThis as any).__restoreNetworkDiagnostic; delete (globalThis as any).__networkDiagnostic; });
  }
});
