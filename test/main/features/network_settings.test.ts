import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  initializeNetworkSettings, networkEnvironment, networkSettingsView, readNetworkSettings,
  saveNetworkSettings, testNetworkConnection, validateNetworkSettings,
  type NetworkSettings, type NetworkTestSession,
} from '../../../src/main/features/network_settings';
import { buildCliSpawnEnv } from '../../../src/main/features/local_agents/spawn-command';
import { browserProxyConfig } from '../../../src/main/util/browser-proxy';

const defaults: NetworkSettings = { mode: 'automatic', httpProxy: '', httpsProxy: '', noProxy: '' };
const manual: NetworkSettings = { mode: 'manual', httpProxy: 'http://127.0.0.1:9000', httpsProxy: 'http://proxy.test:8080', noProxy: '.example.com' };
const roots: string[] = [];
function filePath() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'orkas-network-settings-'));
  roots.push(root);
  return path.join(root, 'network-settings.json');
}
afterEach(() => { vi.useRealTimers(); for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true }); });

describe('machine-local network settings', () => {
  it('persists atomically outside cloud preferences and applies only at startup', async () => {
    const file = filePath();
    const env = { HTTP_PROXY: 'http://inherited.test:80', KEEP: 'unchanged' };
    initializeNetworkSettings(env, file);
    const beforeSave = { ...env };
    expect(readNetworkSettings(file)).toEqual(defaults);
    expect(await saveNetworkSettings(manual, file)).toMatchObject({ restartRequired: true, settings: manual });
    expect(env).toEqual(beforeSave);
    expect(JSON.parse(fs.readFileSync(file, 'utf8'))).toEqual(manual);
    initializeNetworkSettings(env, file);
    expect(networkSettingsView(file).restartRequired).toBe(false);
    expect(env).toMatchObject({ HTTP_PROXY: manual.httpProxy, HTTPS_PROXY: manual.httpsProxy, KEEP: 'unchanged' });
    if (process.platform !== 'win32') expect(fs.statSync(file).mode & 0o777).toBe(0o600);
  });

  it.each([
    { ...manual, httpProxy: 'http://secret:password@proxy.test' },
    { ...manual, httpProxy: 'http://proxy.test/path?token=private' },
    { ...manual, httpProxy: 'socks5://proxy.test' },
    { ...manual, httpProxy: 'http://proxy.test;https=direct' },
    { ...manual, httpProxy: '', httpsProxy: '' },
    { ...manual, noProxy: 'example.com;*' },
    { ...manual, noProxy: 'host\nother' },
  ])('rejects invalid inputs without overwriting saved settings', async invalid => {
    const file = filePath();
    await saveNetworkSettings(manual, file);
    await expect(saveNetworkSettings(invalid, file)).rejects.toThrow(/^E_NETWORK_/);
    expect(readNetworkSettings(file)).toEqual(manual);
  });

  it('reports corrupted authoritative settings instead of silently applying a partial proxy', () => {
    const file = filePath();
    fs.writeFileSync(file, '{invalid');
    expect(() => initializeNetworkSettings({}, file)).toThrow('E_NETWORK_CONFIG');
  });

  it('replaces inherited upper/lowercase and ALL_PROXY consistently for browser and CLI', () => {
    const inherited = { ALL_PROXY: 'http://old.test', https_proxy: 'http://old.test', NO_PROXY: '*', KEEP: 'yes' };
    const env = networkEnvironment(manual, inherited);
    expect(inherited.NO_PROXY).toBe('*');
    expect(env.ALL_PROXY).toBeUndefined();
    expect(env.https_proxy).toBe(manual.httpsProxy);
    expect(env.NO_PROXY).toContain('localhost');
    expect(env.NO_PROXY).toContain('::1');
    expect(env.NO_PROXY).not.toContain('*,' );
    expect(browserProxyConfig(env).config?.proxyRules).toContain('https=http://proxy.test:8080');
    expect(buildCliSpawnEnv('/tmp/agy', env)).toMatchObject({ HTTP_PROXY: manual.httpProxy, HTTPS_PROXY: manual.httpsProxy, KEEP: 'yes' });
  });

  it('uses HTTP as HTTPS fallback and allows an explicitly configured all-host bypass', () => {
    const env = networkEnvironment(validateNetworkSettings({ ...manual, httpsProxy: '', noProxy: '*' }), {});
    expect(env.HTTPS_PROXY).toBe(manual.httpProxy);
    expect(env.NO_PROXY).toBe('*');
  });

  it('direct mode removes inherited proxy values and disables OS proxy routing', () => {
    const env = networkEnvironment({ ...defaults, mode: 'direct' }, { HTTP_PROXY: 'http://old', all_proxy: 'http://old' });
    expect(env.HTTP_PROXY).toBeUndefined();
    expect(env.all_proxy).toBeUndefined();
    expect(env.ORKAS_NO_AUTO_PROXY).toBe('1');
    expect(browserProxyConfig(env).config).toEqual({ mode: 'direct' });
  });

  it('automatic mode preserves launch proxy policy', () => {
    const inherited = { HTTP_PROXY: 'http://launch.test:80', NO_PROXY: 'example.com' };
    const env = networkEnvironment(defaults, inherited);
    expect(env.HTTP_PROXY).toBe(inherited.HTTP_PROXY);
    expect(env.NO_PROXY).toContain(inherited.NO_PROXY);
    expect(env.NO_PROXY).toContain('127.0.0.1');
  });
});

describe('isolated connection diagnostics', () => {
  function session(status = 204): NetworkTestSession {
    return { setProxy: vi.fn(async () => {}), fetch: vi.fn(async () => new Response(null, { status })), closeAllConnections: vi.fn(async () => {}) };
  }

  it.each([
    [204, 'NETWORK_REACHABLE'], [404, 'NETWORK_REACHABLE'], [401, 'E_NETWORK_AUTH_REQUIRED'],
    [403, 'E_NETWORK_ACCESS_DENIED'], [407, 'E_NETWORK_PROXY_AUTH'], [503, 'E_NETWORK_HTTP'],
  ])('classifies HTTP %s without treating it as account validation', async (status, code) => {
    const ses = session(status as number);
    const before = { ...process.env };
    const result = await testNetworkConnection(manual, 'google', () => ses);
    expect(result).toMatchObject({ code, status, reachable: status !== 407 });
    expect(ses.setProxy).toHaveBeenCalledWith(expect.objectContaining({ proxyRules: expect.stringContaining('http=http://127.0.0.1:9000') }));
    expect(ses.fetch).toHaveBeenCalledWith('https://oauth2.googleapis.com/token', expect.objectContaining({ method: 'HEAD', credentials: 'omit', redirect: 'manual' }));
    expect(ses.closeAllConnections).toHaveBeenCalledOnce();
    expect(process.env).toEqual(before);
  });

  it.each([
    ['net::ERR_PROXY_CONNECTION_FAILED private-url', 'E_NETWORK_REFUSED'],
    ['net::ERR_PROXY_AUTH_REQUESTED secret', 'E_NETWORK_PROXY_AUTH'],
    ['net::ERR_CERT_AUTHORITY_INVALID', 'E_NETWORK_TLS'],
    ['net::ERR_NAME_NOT_RESOLVED', 'E_NETWORK_DNS'],
    ['unexpected secret', 'E_NETWORK_CONNECTION'],
  ])('sanitizes transport failures', async (message, code) => {
    const ses = session();
    ses.fetch = vi.fn(async () => { throw new Error(message); });
    const result = await testNetworkConnection(manual, 'openai', () => ses);
    expect(result).toMatchObject({ reachable: false, code });
    expect(JSON.stringify(result)).not.toContain(message);
  });

  it('bounds a stalled proxy setup and closes its isolated connections', async () => {
    vi.useFakeTimers();
    const ses = session();
    ses.setProxy = vi.fn(() => new Promise(() => {}));
    const pending = testNetworkConnection(manual, 'google', () => ses, 100);
    await vi.advanceTimersByTimeAsync(101);
    expect(await pending).toMatchObject({ code: 'E_NETWORK_TIMEOUT', reachable: false });
    expect(ses.closeAllConnections).toHaveBeenCalledOnce();
    expect(ses.fetch).not.toHaveBeenCalled();
  });

  it('rejects arbitrary diagnostic destinations before creating any session', async () => {
    const create = vi.fn();
    await expect(testNetworkConnection(manual, 'http://127.0.0.1/private', create)).rejects.toThrow('E_NETWORK_TARGET');
    expect(create).not.toHaveBeenCalled();
  });
});
