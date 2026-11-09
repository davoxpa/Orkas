# Design

## Context

Google documenta `agy acp`, protocollo ACP 1 su stdio, e il riuso delle credenziali create con `agy` interattivo. Riferimento: https://antigravity.google/docs/ide/extensions/acp/ (consultato 8 novembre 2026). Questo host non dispone di `agy`.

## Decisions

- Comporre `makeAcpBackend`, già usato da Hermes, con `argv: ['acp']`. Non duplicare il protocollo e non registrare un provider OAuth alternativo.
- Prima versione con sessione nuova e replay della cronologia gestito dall'host: nessuna promessa di resume nativo, steering, selezione del modello o thinking. Usare il modello e le regole del runtime ufficiale.
- Credenziali gestite da Antigravity, con login interattivo preliminare. Orkas non legge o copia token. Mancanza di autenticazione deve produrre un errore visibile.
- Ereditare proxy e ambiente esistenti; non imporre `127.0.0.1:9000`, specifico del computer aziendale. Nessun acquisto o passaggio automatico a API key/Vertex.
- Offrire solo permessi ereditati: non abilitare flag che saltano le approvazioni. Riutilizzare il flusso ACP delle richieste di permesso.
- Non dichiarare una versione minima Google non verificata: registrare l'assenza di un floor semantico con `0.0.0` e validare il protocollo all'handshake, con errore esplicito per inizializzazione non supportata. La sola scoperta del binario non dimostra autenticazione o compatibilità live.
- Aggiornamento automatico non supportato fino a verifica del metodo ufficiale e della proprietà dell'installazione.

## Risks and validation

La compatibilità Enterprise non è provata da test con account personali o subprocess simulati. Provare separatamente il runtime ufficiale sul computer aziendale, verificando licenza selezionata e fatturazione. La prima versione non comprende login incorporato, catalogo modelli dinamico o controllo remoto.
