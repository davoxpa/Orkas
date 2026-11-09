# Proposal

## Why

Orkas non può ancora avviare il runtime ufficiale Antigravity. L'utente vuole riutilizzare l'accesso aziendale Gemini Enterprise e il proxy già funzionanti, senza trasformare tale accesso in una chiave API.

## What Changes

- Aggiungere Antigravity all'inventario degli agenti esterni, con eseguibile `agy` e override `ORKAS_ANTIGRAVITY_PATH`.
- Riutilizzare il trasporto ACP esistente, credenziali native e variabili proxy del processo.
- Documentare autenticazione preliminare e verifica separata del percorso Enterprise e della fatturazione.
- Non installare runtime, acquistare piani o cambiare credenziali automaticamente.

## Capabilities

### New Capabilities

- `antigravity-agent`: avvio del runtime ufficiale Antigravity come agente esterno.

### Modified Capabilities

Nessuna specifica preesistente.

## Impact

Registro CLI, dispatch, impostazioni runtime, default condivisi e manutenzione CLI. Nessuna nuova dipendenza. Test ACP simulati; test reale Enterprise dipendente da runtime e account dell'utente.
