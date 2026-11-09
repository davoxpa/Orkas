# Antigravity come agente esterno

L'adattatore usa il runtime ufficiale `agy acp`, con le credenziali e le impostazioni native di Antigravity. Non è una voce di configurazione API e non richiede una chiave Gemini.

## Preparazione sul computer che esegue Orkas

1. Installare Antigravity CLI seguendo https://antigravity.google/docs/install?tab=cli.
2. Verificare `agy --version` e `agy acp --help`.
3. Avviare `agy` interattivamente ed effettuare il login con l'account desiderato. Per il caso aziendale scegliere Business account e verificare nel selettore la licenza e il progetto corretti.
4. Riavviare Talia, aprire la creazione di un agente esterno e selezionare Antigravity. Se necessario impostare `ORKAS_ANTIGRAVITY_PATH` al percorso assoluto dell'eseguibile prima di avviare Talia.

Il runtime deve essere installato sul computer che esegue i lavori. L'alias di una shell non sostituisce un eseguibile rilevabile da Talia.

## Proxy aziendale

È disponibile **Impostazioni → Rete**: salvare i proxy di questo computer e riavviare Orkas. Vedere [configurazione e test](network-settings.md). Le variabili del launcher restano un'alternativa in modalità automatica.

L'adattatore eredita l'ambiente con cui è stato avviato Orkas. Se il runtime richiede un proxy, fornire `HTTP_PROXY`, `HTTPS_PROXY` e `NO_PROXY` come nella configurazione aziendale già funzionante. L'avvio dal Dock potrebbe non ereditare queste variabili dalla shell.

Il proxy `127.0.0.1:9000` usato nel precedente test dell'utente è specifico del suo computer aziendale e non viene imposto dall'adattatore. Nessuna impostazione di rete o autenticazione globale viene modificata.

## Account e prova reale

- **Account personale abilitato ad Antigravity:** permette di provare collegamento ACP, risposte e permessi. Non dimostra la compatibilità con il percorso Enterprise.
- **Account con licenza Gemini Enterprise Standard o Plus assegnata:** usare sul computer aziendale configurato per verificare login, licenza, policy, proxy e disponibilità dei modelli.
- **Agent Platform / Vertex AI o API key:** costituiscono percorsi distinti; non provano l'uso delle quote della licenza. Controllare fatturazione e licenza nel sistema Google prima di una prova live.

Non serve acquistare un nuovo piano per i test simulati. L'adattatore non acquista crediti, non copia token, non avvia login automaticamente e non ripiega su una chiave API.

## Limiti della prima versione

- Modello, thinking e regole di autorizzazione rimangono quelli nativi. Nessun catalogo modelli fittizio o flag di bypass.
- L'approvazione delle richieste ACP passa dal flusso esistente di Orkas.
- Ogni turno apre una sessione ACP; l'host gestisce la cronologia. Resume nativo e steering non sono dichiarati supportati.
- Aggiornamento automatico della CLI e login incorporato non sono implementati.
- Errori di autenticazione o inizializzazione vengono mostrati come fallimenti.
- Il controllo remoto tra dispositivi è una specifica separata.

## Fonti

- https://antigravity.google/docs/ide/extensions/acp/
- https://antigravity.google/docs/enterprise/

Consultate l'8 novembre 2026. Il supporto dichiarato da Google non equivale a una validazione live di Orkas con la licenza dell'utente.
