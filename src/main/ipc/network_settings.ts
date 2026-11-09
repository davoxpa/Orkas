import type { WebContents } from 'electron';
import * as network from '../features/network_settings';
import { getDesktopWindowController } from '../features/desktop_windows';

type Context = { sender: WebContents };
type Dependencies = Pick<typeof network, 'networkSettingsView' | 'saveNetworkSettings' | 'testNetworkConnection'>;

export function createNetworkSettingsHandlers(
  owns: (sender: WebContents) => boolean,
  api: Dependencies = network,
) {
  let testing = false;
  const guarded = (run: (payload: any) => Promise<unknown> | unknown) => async (payload: any, ctx: Context) => {
    if (!owns(ctx.sender)) return { ok: false, code: 'E_IPC_SENDER' };
    try { return { ok: true, ...await run(payload) as object }; }
    catch (error) {
      return { ok: false, code: error instanceof network.NetworkSettingsError ? error.code : 'E_NETWORK_OPERATION' };
    }
  };
  return {
    'network.getSettings': guarded(() => api.networkSettingsView()),
    'network.saveSettings': guarded(payload => api.saveNetworkSettings(payload?.settings)),
    'network.testConnection': guarded(async payload => {
      if (testing) throw new network.NetworkSettingsError('E_NETWORK_BUSY');
      testing = true;
      try { return { result: await api.testNetworkConnection(payload?.settings, payload?.target) }; }
      finally { testing = false; }
    }),
  };
}

export const invokeHandlers = createNetworkSettingsHandlers(sender => !!getDesktopWindowController()?.owns(sender));
