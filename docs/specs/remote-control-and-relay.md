# Controllo remoto sicuro e server relay

Data: 8 novembre 2026
Stato: backlog, requisiti iniziali; implementazione non avviata.

## Obiettivo richiesto

Ogni installazione client Orkas deve poter essere controllata da remoto in sicurezza da un'altra installazione autorizzata. Il caso iniziale è usare Orkas sul Mac per controllare Orkas su un PC Windows, ma il requisito riguarda tutti i client e non una sola coppia di sistemi operativi.

Deve inoltre essere possibile installare e gestire un server con funzione di relay: un punto di connessione e smistamento tra client su rete locale e reti remote. Il riferimento dell'utente al server attuale esprime il modello desiderato; compatibilità e riuso del server esistente devono essere verificati prima del design.

## Ruoli previsti

- **Client controllore:** interfaccia da cui scegliere il dispositivo remoto e interagire con Orkas.
- **Client controllato:** installazione che mantiene i propri dati, credenziali, strumenti e ambiente di esecuzione, ed esegue le richieste autorizzate.
- **Server relay installabile:** registra e mette in collegamento i dispositivi autorizzati e inoltra il traffico quando non è possibile o opportuno una connessione diretta.

I ruoli controllore e controllato non devono essere legati permanentemente al sistema operativo. Il relay non assume automaticamente il ruolo di esecutore dei lavori né l'accesso ai dati applicativi in chiaro.

## Capacità attese

- Associare dispositivi con consenso esplicito e mostrarne identità, disponibilità e connessioni attive.
- Selezionare il client di destinazione e distinguere sempre attività locali e remote.
- Consultare conversazioni e attività autorizzate, inviare messaggi, ricevere eventi e risposte in diretta.
- Gestire richieste di approvazione e interrompere attività sul dispositivo di destinazione, nel rispetto della sua politica di permessi.
- Collegare dispositivi nella stessa LAN e su reti differenti; il relay deve supportare connessioni uscenti dei client per il caso comune di NAT e firewall.
- Gestire disconnessioni e riconnessioni senza duplicare richieste o presentare come riuscite operazioni dall'esito incerto.
- Prevedere trasferimenti espliciti di allegati e risultati, distinguendo percorsi e file locali da quelli remoti.

## Requisiti di sicurezza da progettare e verificare

- Identità verificabili dei dispositivi, autenticazione reciproca, associazione esplicita e revoca degli accessi.
- Autorizzazioni per dispositivo e operazione; il collegamento remoto non deve aggirare le approvazioni dell'host.
- Cifratura del trasporto e protezione del contenuto da parte del relay attraverso cifratura end-to-end tra client; definire protocollo e gestione delle chiavi nel design.
- Nessuna copia automatica delle chiavi API sul controllore o sul relay; segreti esclusi dai log.
- Isolamento tra utenti e dispositivi, con controllo dell'accesso a ogni sessione e destinazione.
- Protezione da replay, tentativi di accesso ripetuti e riutilizzo di credenziali revocate; tracciamento delle operazioni remote senza registrare segreti.
- Nessuna esposizione diretta in rete dell'intera superficie IPC locale: esporre solo operazioni remote autorizzate e validate.

## Percorso proposto, da confermare nel design

1. Controllo di un Orkas desktop in esecuzione da un altro Orkas, con identità dei dispositivi e permessi espliciti.
2. Relay installabile per collegamenti tra reti diverse, con associazione, inoltro, revoca e recupero delle sessioni.
3. Trasferimenti file e gestione di più dispositivi; valutare separatamente esecuzione senza finestra e avvio come servizio.

L'architettura deve prevedere il relay dall'inizio. Una VPN può essere utile per prove iniziali, ma non sostituisce la funzionalità relay richiesta.

## Criteri di accettazione futuri

- Dal Mac si invia un lavoro all'Orkas sul Windows e se ne seguono risposta, approvazioni ed eventuale arresto; l'esecuzione avviene sul Windows.
- Due client su reti diverse comunicano attraverso un relay installato dall'utente, senza richiedere porte in ingresso sui singoli client.
- Un dispositivo non associato o revocato non può leggere conversazioni, inviare comandi o recuperare sessioni.
- Il relay non può leggere i contenuti applicativi cifrati né ottenere le credenziali dei provider.
- Dopo una riconnessione gli eventi sono riconciliati e una richiesta già accettata non viene eseguita una seconda volta.
- Il comportamento locale continua a funzionare quando l'accesso remoto è disattivato o il relay non è disponibile.

## Decisioni ancora aperte

- Quale server esistente sia disponibile e riutilizzabile; questo checkout non è prova della sua compatibilità.
- Protocollo, gestione delle chiavi, distribuzione e aggiornamento del relay.
- Numero di utenti, proprietà dei dispositivi e granularità dei permessi.
- Supporto iniziale solo a Orkas aperto oppure anche a processi senza finestra e servizi di sistema.
- Connessione diretta opzionale, conservazione dei metadati e politica di accodamento quando un dispositivo è offline.

Il controllo generico dell'intero desktop del sistema operativo non è un requisito di questa proposta. Potrà essere valutato separatamente.
