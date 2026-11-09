import { describe, expect, it, vi } from 'vitest';
import type { WebContents } from 'electron';
vi.mock('../../../src/main/features/desktop_windows', () => ({ getDesktopWindowController: () => null }));
import { createNetworkSettingsHandlers } from '../../../src/main/ipc/network_settings';

const ctx = { sender: {} as WebContents };
function api() {
  return {
    networkSettingsView: vi.fn(() => ({ settings: { mode: 'automatic', httpProxy: '', httpsProxy: '', noProxy: '' }, restartRequired: false })),
    saveNetworkSettings: vi.fn(async () => ({ settings: { mode: 'direct', httpProxy: '', httpsProxy: '', noProxy: '' }, restartRequired: true })),
    testNetworkConnection: vi.fn(async () => ({ reachable: true, code: 'NETWORK_REACHABLE', durationMs: 2 })),
  };
}

describe('network settings main-window ownership', () => {
  it.each(['network.getSettings', 'network.saveSettings', 'network.testConnection'] as const)(
    'rejects %s before any IO for unowned senders', async channel => {
      const deps = api();
      const handlers = createNetworkSettingsHandlers(() => false, deps);
      expect(await handlers[channel]({ settings: {}, target: 'google' }, ctx)).toEqual({ ok: false, code: 'E_IPC_SENDER' });
      Object.values(deps).forEach(fn => expect(fn).not.toHaveBeenCalled());
    },
  );

  it('allows saving and testing only through the owned window', async () => {
    const deps = api();
    const handlers = createNetworkSettingsHandlers(sender => sender === ctx.sender, deps);
    expect(await handlers['network.getSettings']({}, ctx)).toMatchObject({ ok: true, restartRequired: false });
    expect(await handlers['network.saveSettings']({ settings: { mode: 'direct' } }, ctx)).toMatchObject({ ok: true, restartRequired: true });
    expect(await handlers['network.testConnection']({ settings: {}, target: 'google' }, ctx)).toMatchObject({ ok: true, result: { reachable: true } });
  });

  it('bounds concurrent tests and releases the slot after failure without disclosing errors', async () => {
    let reject!: (error: Error) => void;
    const deps = api();
    deps.testNetworkConnection.mockImplementationOnce(() => new Promise((_resolve, rejectPromise) => { reject = rejectPromise; }));
    const handlers = createNetworkSettingsHandlers(() => true, deps);
    const pending = handlers['network.testConnection']({}, ctx);
    expect(await handlers['network.testConnection']({}, ctx)).toEqual({ ok: false, code: 'E_NETWORK_BUSY' });
    reject(new Error('secret proxy credentials'));
    expect(await pending).toEqual({ ok: false, code: 'E_NETWORK_OPERATION' });
    expect(await handlers['network.testConnection']({}, ctx)).toMatchObject({ ok: true });
  });
});
