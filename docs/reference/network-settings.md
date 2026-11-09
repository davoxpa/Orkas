# Impostazioni di rete del computer

Aprire **Impostazioni → Rete**. La configurazione rimane sul computer e non viene sincronizzata con account o altri dispositivi.

## Modalità

- **Automatica:** conserva le variabili proxy ricevute all'avvio e il rilevamento di sistema/PAC già supportato dall'app. Il supporto ai proxy di sistema dei singoli runtime esterni dipende dal runtime stesso.
- **Connessione diretta:** rimuove le variabili proxy ereditate e disabilita il rilevamento automatico negli stack gestiti da Orkas. Non modifica configurazioni globali o policy proprie dei programmi esterni.
- **Proxy manuale:** usa URL HTTP/HTTPS separati. Se HTTPS è vuoto, usa il proxy HTTP anche per HTTPS. Gli URL devono indicare un server HTTP/HTTPS senza credenziali incorporate, percorsi o parametri.

Per il proxy aziendale già usato dall'utente, soltanto sul computer dove quel servizio è attivo:

```text
HTTP proxy:  http://127.0.0.1:9000
HTTPS proxy: http://127.0.0.1:9000
NO_PROXY:    localhost,127.0.0.1,::1
```

Il valore `http://` è valido anche per il campo HTTPS: descrive la connessione al proxy, non il protocollo del sito di destinazione. Questi valori non vengono preconfigurati o salvati automaticamente.

## Esclusioni

Separare gli host con virgole. Orkas aggiunge i bypass locali già previsti dal suo gestore proxy. Un valore `*` esclude esplicitamente tutti gli host: non usarlo se si vuole instradare il traffico verso il proxy.

## Salvataggio e riavvio

Il salvataggio è atomico in `network-settings.json` alla radice dei dati macchina, fuori dalle cartelle `cloud` e dalle preferenze utente sincronizzate. Le nuove impostazioni si applicano dopo aver chiuso completamente e riaperto Orkas. Le attività già in corso mantengono la rete attuale.

Al bootstrap Orkas configura il proprio ambiente prima del dispatcher HTTP. In manuale e diretta configura anche la sessione Electron principale. Le sessioni browser gestite riutilizzano la policy esistente; le CLI, compreso `agy acp`, ricevono l'ambiente di avvio configurato. Orkas non cambia account, licenza o metodo di fatturazione del runtime.

Una configurazione salvata invalida viene segnalata come errore `E_NETWORK_CONFIG` e non viene applicata parzialmente. In caso di file danneggiato che impedisca l'avvio, correggere o rinominare `network-settings.json` nel percorso dei dati macchina prima di riaprire Orkas. Non eliminare le cartelle degli account.

## Test connessione

Il pulsante prova i valori attualmente inseriti, anche prima di salvarli. Usa una sessione temporanea senza cookie, richieste HEAD a endpoint fissi Google/OpenAI e un timeout di dieci secondi. Non salva, non cambia la sessione in uso e non invia credenziali o richieste a modelli.

- Una risposta HTTP dimostra che ha risposto un servizio o intermediario di rete. Non dimostra che il login, la licenza o la fatturazione siano corretti.
- HTTP 401: richiesta di autenticazione del servizio.
- HTTP 403: accesso negato dal servizio o da un filtro/intermediario.
- HTTP 407: autenticazione richiesta dal proxy.
- Connessione rifiutata: controllare che il proxy sia attivo sul computer corretto.
- Errore TLS: verificare i certificati aziendali; la verifica TLS non viene disabilitata.

Il browser di sistema aperto per il login mantiene le sue impostazioni di rete. Il test Enterprise completo richiede il computer, il proxy e l'account aziendale effettivi.
