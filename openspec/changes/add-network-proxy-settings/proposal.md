# Proposal

## Why

La connessione aziendale Antigravity richiede HTTP_PROXY, HTTPS_PROXY e NO_PROXY. L'utente vuole configurarli da Orkas anche quando l'app viene aperta dal Dock.

## What Changes

- Impostazioni Rete con modalità automatica, diretta e manuale; proxy HTTP/HTTPS separati ed esclusioni.
- Persistenza sul computer, fuori dal cloud e dalle preferenze utente sincronizzate.
- Applicazione al riavvio a rete dell'app, browser gestiti e ambiente degli agenti esterni.
- Test isolato dei valori non salvati su endpoint fissi Google/OpenAI, senza token o richieste a modelli.

## Capabilities

### New Capabilities

- `network-proxy-settings`: configurazione e diagnostica proxy specifiche del computer.

### Modified Capabilities

Nessuna specifica consolidata esistente.

## Impact

Storage locale, bootstrap, configurazione browser esistente, IPC delle impostazioni, UI e traduzioni italiano/inglese. Nessuna nuova dipendenza.
