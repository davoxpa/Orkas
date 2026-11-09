import * as fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { NETWORK_SETTINGS_FILE } from '../paths';
import { writeJson } from '../storage';
import { buildNoProxy } from '../util/proxy-dispatcher';
import { browserProxyConfig } from '../util/browser-proxy';

export interface NetworkSettings {
  mode: 'automatic' | 'direct' | 'manual';
  httpProxy: string;
  httpsProxy: string;
  noProxy: string;
}

const DEFAULTS: NetworkSettings = { mode: 'automatic', httpProxy: '', httpsProxy: '', noProxy: '' };
const PROXY_KEYS = ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY',
  'http_proxy', 'https_proxy', 'all_proxy', 'no_proxy', 'ORKAS_NO_AUTO_PROXY', 'NODE_USE_ENV_PROXY'] as const;
const launchEnvironment: NodeJS.ProcessEnv = Object.fromEntries(
  PROXY_KEYS.filter(key => process.env[key] !== undefined).map(key => [key, process.env[key]]),
);
let bootSettings = { ...DEFAULTS };

export class NetworkSettingsError extends Error {
  constructor(readonly code: string) { super(code); }
}

function proxyUrl(value: unknown): string {
  if (typeof value !== 'string' || value.length > 2048 || /[\x00-\x20\x7f]/.test(value.trim())) {
    throw new NetworkSettingsError('E_NETWORK_PROXY_URL');
  }
  const raw = value.trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname
      || url.username || url.password || (url.pathname !== '' && url.pathname !== '/')
      || url.search || url.hash) throw new Error();
    return url.origin;
  } catch { throw new NetworkSettingsError('E_NETWORK_PROXY_URL'); }
}

export function validateNetworkSettings(input: unknown): NetworkSettings {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new NetworkSettingsError('E_NETWORK_INPUT');
  const raw = input as Record<string, unknown>;
  if (typeof raw.mode !== 'string' || !['automatic', 'direct', 'manual'].includes(raw.mode)) throw new NetworkSettingsError('E_NETWORK_INPUT');
  const httpProxy = proxyUrl(raw.httpProxy);
  const httpsProxy = proxyUrl(raw.httpsProxy);
  if (typeof raw.noProxy !== 'string' || raw.noProxy.length > 4096 || /[\x00-\x1f\x7f]/.test(raw.noProxy)) {
    throw new NetworkSettingsError('E_NETWORK_BYPASS');
  }
  const noProxy = raw.noProxy.split(',').map(value => value.trim()).filter(Boolean).join(',');
  if (raw.mode === 'manual' && !httpProxy && !httpsProxy) throw new NetworkSettingsError('E_NETWORK_PROXY_REQUIRED');
  // La traduzione Chromium esistente valida anche host, porte, IPv6 e CIDR.
  try { browserProxyConfig({ HTTP_PROXY: httpProxy || 'http://validation.invalid', HTTPS_PROXY: httpsProxy, NO_PROXY: noProxy }); }
  catch { throw new NetworkSettingsError('E_NETWORK_BYPASS'); }
  return { mode: raw.mode as NetworkSettings['mode'], httpProxy, httpsProxy, noProxy };
}

export function networkEnvironment(settings: NetworkSettings, inherited: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const out = { ...inherited };
  if (settings.mode !== 'automatic') {
    for (const key of Object.keys(out)) {
      if (PROXY_KEYS.some(known => known.toUpperCase() === key.toUpperCase())) delete out[key];
    }
    out.ORKAS_NO_AUTO_PROXY = '1';
    if (settings.mode === 'manual') {
      if (settings.httpProxy) out.HTTP_PROXY = out.http_proxy = settings.httpProxy;
      if (settings.httpsProxy || settings.httpProxy) out.HTTPS_PROXY = out.https_proxy = settings.httpsProxy || settings.httpProxy;
      out.NODE_USE_ENV_PROXY = '1';
    }
  }
  out.NO_PROXY = out.no_proxy = buildNoProxy(settings.mode === 'manual' ? { NO_PROXY: settings.noProxy } : out);
  return out;
}

export function readNetworkSettings(file = NETWORK_SETTINGS_FILE): NetworkSettings {
  try {
    if (fs.statSync(file).size > 16_384) throw new NetworkSettingsError('E_NETWORK_CONFIG');
    return validateNetworkSettings(JSON.parse(fs.readFileSync(file, 'utf8')));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { ...DEFAULTS };
    throw new NetworkSettingsError('E_NETWORK_CONFIG');
  }
}

export function initializeNetworkSettings(env = process.env, file = NETWORK_SETTINGS_FILE): NetworkSettings {
  bootSettings = readNetworkSettings(file);
  const applied = networkEnvironment(bootSettings, env);
  for (const key of PROXY_KEYS) {
    if (applied[key] === undefined) delete env[key];
    else env[key] = applied[key];
  }
  return { ...bootSettings };
}

export function networkSettingsView(file = NETWORK_SETTINGS_FILE) {
  const settings = readNetworkSettings(file);
  return { settings, restartRequired: JSON.stringify(settings) !== JSON.stringify(bootSettings) };
}

export async function saveNetworkSettings(input: unknown, file = NETWORK_SETTINGS_FILE) {
  const settings = validateNetworkSettings(input);
  await writeJson(file, settings);
  return networkSettingsView(file);
}

export interface NetworkTestSession {
  setProxy(config: Electron.ProxyConfig): Promise<void>;
  fetch(input: string, options: RequestInit): Promise<Response>;
  closeAllConnections(): Promise<void>;
}

const TEST_ENDPOINTS = {
  google: 'https://oauth2.googleapis.com/token',
  openai: 'https://auth.openai.com/',
} as const;

export function networkErrorCode(error: unknown): string {
  const detail = `${String((error as Error)?.name || '')} ${String((error as Error)?.message || '')}`;
  if (/PROXY_AUTH|407|INVALID_AUTH_CREDENTIALS/i.test(detail)) return 'E_NETWORK_PROXY_AUTH';
  if (/TIMEOUT|TIMED_OUT|AbortError/i.test(detail)) return 'E_NETWORK_TIMEOUT';
  if (/CERT_|SSL_|TLS_/i.test(detail)) return 'E_NETWORK_TLS';
  if (/NAME_NOT_RESOLVED|ENOTFOUND|EAI_AGAIN/i.test(detail)) return 'E_NETWORK_DNS';
  if (/CONNECTION_REFUSED|ECONNREFUSED|PROXY_CONNECTION_FAILED/i.test(detail)) return 'E_NETWORK_REFUSED';
  return 'E_NETWORK_CONNECTION';
}

export async function testNetworkConnection(input: unknown, target: unknown,
  createSession?: () => NetworkTestSession, timeoutMs = 10_000) {
  const settings = validateNetworkSettings(input);
  if (target !== 'google' && target !== 'openai') throw new NetworkSettingsError('E_NETWORK_TARGET');
  const env = networkEnvironment(settings, launchEnvironment);
  const config = browserProxyConfig(env).config || { mode: 'system' as const };
  const ses = createSession ? createSession() : (await import('electron')).session.fromPartition(
    `network-test-${randomUUID()}`, { cache: false },
  );
  const started = Date.now();
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const perform = async () => {
      await ses.setProxy(config);
      if (controller.signal.aborted) throw new Error('TIMEOUT');
      const response = await ses.fetch(TEST_ENDPOINTS[target], {
        method: 'HEAD', credentials: 'omit', cache: 'no-store', redirect: 'manual', signal: controller.signal,
      });
      await response.body?.cancel();
      const code = response.status === 407 ? 'E_NETWORK_PROXY_AUTH'
        : response.status === 401 ? 'E_NETWORK_AUTH_REQUIRED'
        : response.status === 403 ? 'E_NETWORK_ACCESS_DENIED'
        : response.status >= 500 ? 'E_NETWORK_HTTP' : 'NETWORK_REACHABLE';
      return { reachable: response.status !== 407, code, status: response.status };
    };
    const result = await Promise.race([perform(), new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(new Error('TIMEOUT')); }, timeoutMs);
    })]);
    return { ...result, durationMs: Date.now() - started };
  } catch (error) {
    return { reachable: false, code: networkErrorCode(error), durationMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
    controller.abort();
    void ses.closeAllConnections().catch(() => {});
  }
}
