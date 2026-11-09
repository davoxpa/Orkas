## Implementation

- [x] 1. Implement validated local persistence, startup environment and existing browser-policy reuse.
- [x] 2. Add owned-main-window IPC and isolated connection diagnostics.
- [x] 3. Add accessible Network settings with Italian/English copy and restart feedback.
- [x] 4. Add meaningful regression tests and documentation.

## Validation

- [x] 5. Run relevant tests, typechecks, specification validation and diff checks.
- [x] 6. Verify rendered settings in an isolated app session.
- [ ] 7. Live Enterprise proxy/account test (requires user's configured computer).

## Evidence — 8 novembre 2026

- 151 test passati: 26 configurazione/diagnostica, 5 IPC/ownership, 62 dispatcher, 26 browser proxy, 6 Antigravity simulato e 26 regressioni renderer impostazioni.
- Due prove Electron passate: salvataggio locale, rete invariata fino al riavvio, riapertura e applicazione dei proxy; test isolato dei valori non salvati con risposta HTTP 403 simulata e nessuna scrittura. Nessuna richiesta a modelli.
- Ispezionate le schermate italiane desktop e a larghezza 620 px. Migliorata la spaziatura del modulo e verificata l'assenza di overflow orizzontale.
- `npm run typecheck`, `npm run test:e2e:typecheck`, `git diff --check` e `openspec validate add-network-proxy-settings --strict` passati.
- Documentazione: `docs/reference/network-settings.md`. La configurazione personale in uso non è stata modificata e non è stata riavviata l'app dell'utente.
- La prova reale del proxy aziendale e della licenza è ancora da eseguire sul computer appropriato. Change non archiviata.
