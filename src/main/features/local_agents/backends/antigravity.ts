import { makeAcpBackend } from './_acp.js';

// Il runtime ufficiale gestisce account, licenza e proxy ereditato dal processo.
// Nessun flag per saltare i permessi o fallback verso API a pagamento.
export const antigravityBackend = makeAcpBackend({
  logName: 'local-agents:antigravity',
  argv: ['acp'],
  clientName: 'orkas',
  requiredProtocolVersion: 1,
});
