# Task

- [x] Importare gli SVG e aggiungere generatore riproducibile delle icone.
- [x] Integrare simbolo e nome nella UI e nelle traduzioni pertinenti.
- [x] Aggiornare metadati, launcher da sorgente e compatibilità dei dati.
- [x] Aggiornare documentazione e decisione di naming.
- [x] Eseguire controlli statici, test pertinenti e verifica Electron con screenshot.
- [x] Registrare risultati e limiti senza dichiarare test Windows o distribuzione non eseguiti.

## Risultati

- Typecheck main, core-agent ed E2E superati.
- Prima batteria: 122 test superati, due scenari Windows saltati su macOS.
- Seconda batteria su launcher, bootstrap e confine open-source: 27 test superati
  (11 già compresi nella prima batteria).
- Un test E2E Electron superato, con screenshot desktop e italiano a 620 px.
- ICNS decodificato anche con `iconutil`; ICO/ICNS contengono sette PNG validi.
- SVG originali verificati identici byte per byte; diff e collegamenti locali validi.
- Chiusura normale dell'app inattiva e riapertura da `Talia.app`: osservati nome
  Talia nella UI e nella barra menu, conversazione precedente e modello configurato
  ancora disponibili. Il profilo non è stato cancellato né spostato.
- Bundle locale verificato con `codesign --verify --deep --strict`; schema
  `orkas://` e bundle ID `com.orkas.desktop` confermati nei metadati macOS.
- Nessun installer o pacchetto di distribuzione generato; runtime Windows non provato.
