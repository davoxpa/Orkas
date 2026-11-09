import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { antigravityBackend } from '../../../../src/main/features/local_agents/backends/antigravity';
import { detectOne, invalidateCache } from '../../../../src/main/features/local_agents/registry';
import { getLocalCliRuntimeOptions } from '../../../../src/main/features/local_agents/runtime_options';

const TEST_NODE = process.env.ORKAS_TEST_NODE || process.execPath;
const quote = (value: string) => "'" + value.replace(/'/g, "'\\''") + "'";

afterEach(() => { vi.unstubAllEnvs(); invalidateCache(); });

describe.skipIf(process.platform === 'win32')('Antigravity official ACP adapter (simulated runtime)', () => {
  it.each(['success', 'permission-denied', 'permission-missing', 'auth-required', 'init-error', 'wrong-protocol'])(
    'handles %s without changing authentication or native permission policy', async mode => {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), 'orkas-antigravity-'));
      const script = path.join(root, 'fixture.cjs');
      const binPath = path.join(root, 'agy');
      fs.writeFileSync(binPath, `#!/bin/sh\nexec ${quote(TEST_NODE)} ${quote(script)} "$@"\n`, { mode: 0o755 });
      fs.writeFileSync(script, String.raw`
        const fs = require('node:fs');
        if (process.argv[2] === '--version') { console.log('Antigravity CLI 1.2.3'); process.exit(0); }
        if (JSON.stringify(process.argv.slice(2)) !== '["acp"]') process.exit(7);
        fs.writeFileSync('proxy-observed', process.env.HTTPS_PROXY || '');
        const send = message => process.stdout.write(JSON.stringify(message) + '\n');
        const mode = ${JSON.stringify(mode)};
        let promptId;
        require('node:readline').createInterface({ input: process.stdin }).on('line', line => {
          const m = JSON.parse(line);
          if (m.method === 'initialize') {
            send(mode === 'init-error'
              ? { id: m.id, error: { code: -32601, message: 'ACP unavailable' } }
              : { id: m.id, result: { protocolVersion: mode === 'wrong-protocol' ? 2 : 1 } });
          }
          if (m.method === 'session/new') {
            fs.writeFileSync('session-started', 'yes');
            send(mode === 'auth-required'
              ? { id: m.id, error: { code: -32000, message: 'Authentication required' } }
              : { id: m.id, result: { sessionId: 'antigravity-session' } });
          }
          if (m.method === 'session/prompt') {
            fs.writeFileSync('prompt-sent', 'yes');
            promptId = m.id;
            if (mode.startsWith('permission-')) {
              send({ id: 77, method: 'session/request_permission', params: {
                toolCall: { kind: 'execute', title: 'Write a file' },
                options: [{ optionId: 'once', kind: 'allow_once' }]
              } });
            } else {
              send({ method: 'session/update', params: { update: {
                sessionUpdate: 'agent_message_chunk', content: { text: 'ACP reply' }
              } } });
              send({ id: promptId, result: { stopReason: 'end_turn' } });
            }
          }
          if (m.id === 77 && m.result) {
            fs.writeFileSync('permission-outcome', JSON.stringify(m.result));
            send({ id: promptId, result: { stopReason: 'end_turn' } });
          }
        });
      `);
      const events: any[] = [];
      vi.stubEnv('ORKAS_ANTIGRAVITY_PATH', binPath);
      vi.stubEnv('HTTPS_PROXY', 'http://127.0.0.1:19000');
      const requestPermission = vi.fn(async () => 'deny' as const);
      try {
        const discovered = await detectOne('antigravity');
        expect(discovered).toMatchObject({ available: true, path: binPath, version: '1.2.3' });
        const options = await getLocalCliRuntimeOptions(discovered, root);
        expect(options).toMatchObject({
          can_select_model: false, can_select_thinking: false,
          permission_policies: ['inherit'], can_select_permission: false,
        });
        expect(fs.existsSync(path.join(root, 'proxy-observed'))).toBe(false);
        await antigravityBackend.run({
          binPath, cwd: root, prompt: 'A simulated request',
          signal: new AbortController().signal, timeoutMs: 5000,
          onEvent: event => events.push(event),
          ...(mode === 'permission-missing' ? {} : { requestPermission }),
        });
        expect(fs.readFileSync(path.join(root, 'proxy-observed'), 'utf8')).toBe('http://127.0.0.1:19000');
        const done = events.find(event => event.type === 'done');
        if (mode === 'init-error' || mode === 'wrong-protocol') {
          expect(done).toMatchObject({ status: 'failed' });
          expect(fs.existsSync(path.join(root, 'session-started'))).toBe(false);
        } else if (mode === 'auth-required') {
          expect(done).toMatchObject({ status: 'failed', error: 'Authentication required' });
          expect(fs.existsSync(path.join(root, 'prompt-sent'))).toBe(false);
        } else {
          expect(done).toMatchObject({ status: 'completed' });
          if (mode === 'success') expect(events).toContainEqual({ type: 'text-delta', text: 'ACP reply' });
          else {
            if (mode === 'permission-denied') expect(requestPermission).toHaveBeenCalledOnce();
            else expect(requestPermission).not.toHaveBeenCalled();
            expect(JSON.parse(fs.readFileSync(path.join(root, 'permission-outcome'), 'utf8')))
              .toEqual({ outcome: { outcome: 'cancelled' } });
          }
        }
      } finally { fs.rmSync(root, { recursive: true, force: true }); }
    },
  );
});
