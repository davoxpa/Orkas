# Identità del prodotto e funzionalità attuali

Data della ricognizione: **8 novembre 2026**.

## Ambito e attendibilità

Questo documento descrive il checkout locale, comprese le modifiche non ancora
committate. Il prodotto si chiama **Talia**, con nome e logo integrati dopo la
scelta dell'utente. La directory conserva il nome OpenPilot; identificatori e
percorsi tecnici Orkas rimangono per compatibilità. Vedere
[identità Talia](reference/branding.md).

La ricognizione deriva dal codice, dai profili inclusi e dalla documentazione.
Non equivale a una prova end-to-end di tutte le funzionalità, alla verifica delle
connessioni dell'utente o alla validazione di un pacchetto distribuito. I risultati
di test delle modifiche recenti sono quelli registrati nei rispettivi task
OpenSpec; non sono stati rieseguiti per compilare questa analisi.

## Definizione del prodotto

**Un ambiente desktop locale che organizza e svolge lavoro attraverso agenti AI,
con progetti persistenti, strumenti operativi e automazioni.**

Il ciclo di lavoro previsto è:

1. L'utente esprime un obiettivo e i vincoli.
2. Il Commander lavora direttamente o coordina gli specialisti.
3. Gli agenti usano file, browser, strumenti e servizi autorizzati.
4. Il risultato viene restituito nella conversazione e negli artefatti prodotti.
5. Progetto, memoria e attività consentono di riprendere e proseguire il lavoro.

Coordinamento, continuità e realizzazione sono una lettura del posizionamento,
non un risultato misurato di mercato. Non è stata dimostrata una superiorità
rispetto ad altri prodotti tramite benchmark comparativi.

## Inventario delle capacità

| Area | Capacità presenti nell'implementazione | Dipendenze e limiti |
| --- | --- | --- |
| Orchestrazione | Commander, delega ad agenti nominati, passaggio di consegne, worker isolati, lavoro asincrono, cancellazione e limiti di concorrenza. | Le capacità dei singoli agenti e i permessi effettivi restano determinanti. |
| Agenti | Sedici profili specialistici inclusi, agenti personalizzabili, skill e marketplace. | Un profilo è un insieme di istruzioni, strumenti e risorse; non un modello proprietario distinto. |
| Agenti esterni | Adattatori per Claude Code, Codex, OpenCode, OpenClaw e Hermes. | Richiedono runtime installato e autenticato. Ripresa, memoria e permessi variano tra backend. |
| Progetti | Obiettivi e regole, memoria, documenti, agenti, conversazioni e attività collegate. | Scrivere un obiettivo non misura automaticamente il raggiungimento del risultato aziendale. |
| To-do | Stati, scadenze, dipendenze, allegati e collegamento con le conversazioni di esecuzione. | Una scadenza non è un avvio programmato. |
| Auto-advance | Avanzamento opzionale del backlog, selezione per dipendenze e scadenze, limiti giornalieri e controllo delle esecuzioni attive. | Deve essere abilitato; richiede computer disponibile e app in esecuzione. |
| Automazioni | Esecuzioni una tantum, a intervalli, giornaliere, settimanali e mensili; cronologia e controlli di attivazione. | L'esecuzione è locale e dipende da modelli, risorse e autorizzazioni disponibili. |
| Memoria | Note persistenti con ambiti separati per utente, conoscenza condivisa, progetto e agente. | Memoria, indice documentale e cronologia sono meccanismi distinti. |
| Library | Importazione ed estrazione di documenti, ricerca di passaggi, indice vettoriale ed embedding locali. | Un embedding locale non rende locali anche le chiamate al modello scelto. |
| Contesto | Recupero della cronologia, gestione dei budget, checkpoint e compattazione dei task lunghi. | Il contesto è limitato; la persistenza non equivale a richiamo perfetto di ogni dettaglio. |
| Apprendimento documentale | Revisioni dell'attività che possono aggiornare conoscenze, metodi e skill degli agenti. | Non è addestramento dei pesi del modello né garanzia di miglioramento delle prestazioni. |
| File e processi | Lettura, ricerca, creazione e modifica di file; comandi, script e processi locali. | Operazioni soggette a permessi e disponibilità degli strumenti. |
| Office | Strumenti per Word, Excel, PowerPoint e PDF, con lavorazioni e anteprime. | Servono i componenti previsti dai rispettivi flussi; qualità e compatibilità richiedono verifica degli output. |
| Web | Ricerca e recupero di fonti; browser integrato associato alla conversazione, con interazione utente e agente. | Login, verifiche dei siti e permessi possono richiedere intervento umano. |
| Media | Generazione o elaborazione di immagini, video, voce e audio tramite strumenti e Studio dedicati. | Generazione, trascrizione e montaggio hanno dipendenze differenti; i servizi remoti possono richiedere credenziali e costi. |
| App locali | Creazione di artefatti interattivi e applicazioni locali, salvataggio, riapertura e modifica. | Pubblicazione web ospitata non disponibile in questo checkout. |
| Connettori | Catalogo di servizi esterni, autorizzazioni, connessioni e server MCP personalizzati. | Presenza nel catalogo non significa connessione attiva o disponibilità gratuita. |
| Modelli | Configurazione di provider e endpoint compatibili, anche locali. | Gli agenti esterni mantengono le impostazioni proprie; privacy e costi dipendono dal percorso scelto. |
| Controlli | Approvazioni, politiche di esecuzione, limiti, cancellazione e isolamento di alcune risorse. | Non costituiscono una garanzia assoluta di sicurezza; i backend hanno contratti differenti. |

## Specialisti inclusi

| Ambito | Profili |
| --- | --- |
| Ricerca e analisi | DeepResearcher, SeoGeoAgent, StockAnalyser |
| Scrittura | ContentWriter |
| Documenti | OfficeWorker, PptMaker |
| Immagini, video e audio | ImageStudio, VideoStudio, VoiceStudio |
| Sviluppo e interfacce | ProductDeveloper, UIDesigner |
| E-commerce | ECommerceResearcher, ECommerceWriter, ECommerceReviewer, ECommerceAnalyzer, ECommerceOperator |

Inventario ricavato dai sedici `agent.json` in
[`resources/builtin/marketplace/agents`](../resources/builtin/marketplace/agents/).
Non dimostra che tutti i profili siano già installati o configurati nel profilo
utente in esecuzione.

## Modifiche recenti e funzionalità future

| Funzionalità | Stato al momento della ricognizione |
| --- | --- |
| Antigravity via ACP | Implementato nel lavoro locale; test simulati e regressioni registrati. Prova live con runtime ufficiale e account Enterprise ancora aperta. |
| Impostazioni di rete | Implementate nel lavoro locale: automatico, diretto e proxy manuale, persistenza macchina, diagnostica isolata e applicazione al riavvio. La checklist riporta test, typecheck e prove Electron completati. Prova aziendale reale ancora aperta. |
| Controllo remoto tra installazioni | Backlog: requisiti iniziali, implementazione non avviata. |
| Server relay installabile | Parte dei requisiti futuri del controllo remoto; architettura e protocollo ancora da progettare. |
| Nuova identità del prodotto | Talia scelto dall'utente; integrati logo grafite–ambra con agenti esagonali, nome visibile, icone e metadati. Contratti tecnici preservati. |

Per lo stato aggiornato consultare le [task Antigravity](../openspec/changes/add-antigravity-acp/tasks.md),
le [task rete](../openspec/changes/add-network-proxy-settings/tasks.md) e la
[specifica del controllo remoto](specs/remote-control-and-relay.md).

## Confini dell'edizione open source

Questo checkout si identifica come canale `open`. Sono disponibili le capacità
locali, mentre non vanno attribuite a questa versione le funzioni commerciali di:

- sincronizzazione cloud e collaborazione umana tramite progetti condivisi;
- pubblicazione ospitata delle app e link pubblici di condivisione;
- account, abbonamenti e crediti dell'app commerciale;
- controllo remoto iOS dell'edizione commerciale.

L'accesso tramite una chiave API Orkas, dove supportato, è distinto dal login
all'edizione commerciale e non sblocca automaticamente queste funzioni.

Local-first descrive l'organizzazione e l'esecuzione locale dell'applicazione.
Usare un provider remoto comporta l'invio dei dati necessari a quel provider.
L'operatività offline richiede modelli e strumenti locali compatibili con il task.

## Fonti principali nel repository

- [README](../README.md): presentazione e comportamento dichiarato.
- [Bus di orchestrazione](../src/main/features/group_chat/bus.ts): delega e passaggio di consegne.
- [Registro agenti esterni](../src/main/features/local_agents/registry.ts): backend e contratti.
- [Driver di progetto](../src/main/features/project_driver.ts) e [runner](../src/main/features/project_driver_runner.ts): auto-advance.
- [Scheduler](../src/main/features/auto_tasks.ts): automazioni.
- [Memoria](../src/main/features/memory.ts) e [revisione dell'attività](../src/main/features/reflection-orchestrator.ts).
- [Catalogo strumenti](../src/main/model/core-agent/tool-catalog.ts): aree operative.
- [App salvate](../src/main/features/saved_apps.ts) e [blocco pubblicazione](../src/main/features/web_apps/commercial-entry.ts).
- [Canale open](../src/main/features/client_channel.ts) e [confini delle edizioni](../resources/builtin/system/skills/orkas-guide/references/editions.md).

## Implicazioni per identità e nome

Il nome deve poter rappresentare sviluppo, ricerca, documenti, creatività e lavoro
ricorrente. I temi più coerenti sono squadra coordinata, continuità del contesto
e avanzamento verso un risultato. Evitare promesse di autonomia illimitata,
disponibilità cloud continua o funzionalità remote ancora da realizzare.

La decisione e la storia del naming sono in [naming.md](naming.md). L'adozione
del nome non costituisce disponibilità del marchio.
