## 1. Implementation

- [x] 1.1 Register Antigravity discovery, shared defaults and dispatch.
- [x] 1.2 Compose the ACP backend and preserve native authentication, proxy and permissions.
- [x] 1.3 Declare conservative runtime options and disable unverified automatic upgrade.
- [x] 1.4 Document setup and account-specific validation.

## 2. Validation

- [x] 2.1 Test discovery and mocked ACP success, auth failure, permission denial and incompatible initialization.
- [x] 2.2 Run relevant regression tests, typechecking and diff checks.
- [ ] 2.3 Perform live test with official Antigravity and the user's Enterprise account (requires their configured computer; not satisfied by simulated tests).

### Evidence (8 novembre 2026)

- Sei test dell'adattatore con subprocess ACP simulati: successo, diniego esplicito, callback di approvazione assente, autenticazione mancante, errore di inizializzazione e versione di protocollo incompatibile. Verificati anche ereditarietà del proxy e assenza di probe del modello.
- Registro: 45 test passati. Le fixture sono state aggiornate per il binario `agy` e isolate dalle installazioni reali dell'host.
- Regressioni passate: ACP (33), runner (112), runtime options (32), versioni (25, uno saltato), upgrade (47, uno saltato), renderer stato agenti (17), renderer risorse (40), IPC runtime options (6), IPC permessi (14), IPC upgrade (12).
- `npm run typecheck`, `git diff --check` e `openspec validate add-antigravity-acp --strict` passati.
- Nessuna chiamata live a modelli, nessun login o installazione Antigravity eseguiti. Prova grafica dell'app e prova Enterprise non eseguite; la change resta aperta.
