# Design

## Decisions

- Salvare `network-settings.json` alla radice dei dati macchina usando la scrittura atomica esistente. Non usare `preferences.json` sincronizzato.
- Caricare prima di installEnvProxyDispatcher. In automatico mantenere ambiente di avvio e PAC; manuale sostituisce le variabili proxy, diretta le rimuove e disabilita il rilevamento automatico. Non modificare la rete in uso al salvataggio: mostrare necessità di riavvio.
- Riutilizzare envProxyConfig/buildNoProxy e browserProxyConfig. Preservare bypass loopback. Limitare la prima versione manuale a URL HTTP/HTTPS senza credenziali incorporate; validare anche NO_PROXY con la traduzione Chromium esistente.
- Le CLI ereditano process.env già configurato. Non iniettare librerie nel runtime ufficiale, non modificare credenziali, non promettere che runtime terzi ignorino proprie impostazioni prioritarie.
- IPC get/save/test ammessi soltanto alla finestra principale posseduta, non alle pagine web o agli strumenti degli agenti.
- Il test usa una sessione Electron temporanea senza cookie e senza persistenza, con proxy esplicito o di sistema. HEAD a endpoint fissi Google/OpenAI, nessuna chiave, timeout, redirect disabilitati e codici d'errore sanitizzati. Non salva e non tocca defaultSession/process.env. Un HTTP 401/403 non dimostra autenticazione valida.
- Impostare anche la defaultSession al bootstrap per le chiamate net.fetch. Le sessioni browser gestite già riutilizzano prepareBrowserProxy.
- Una configurazione salvata illeggibile o invalida produce un errore esplicito anziché essere applicata parzialmente.

## Sources and limits

API Electron setProxy/session.fetch: documentazione ufficiale consultata tramite Grounded Docs, verificata contro i tipi Electron installati (42.11.18). La pagina latest contiene anche API di release successive: qui si usano solo API presenti nei tipi installati.

Il test dimostra raggiungibilità e risposta HTTP, non accesso all'account, licenza Enterprise o fatturazione. La verifica aziendale richiede il proxy e l'account dell'utente.
