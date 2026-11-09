# Identità dell'applicazione

## Requisiti

### Nome e grafica

L'app DEVE mostrare il nome Talia e il simbolo SVG consegnato dall'utente nella
sidebar, nelle icone desktop e nel menu di sistema. I pacchetti DEVONO avere
nome visibile Talia. La geometria originale e la palette DEVONO essere preservate.

### Compatibilità

Al riavvio dopo il rebranding l'app DEVE riutilizzare dati e profilo Chromium
preesistenti. ID, schema OAuth, chiavi di configurazione e nomi di tool pubblici
NON DEVONO essere rinominati come effetto del cambiamento grafico.

### Servizi terzi

Le etichette relative a Orkas API, crediti Orkas e download dell'edizione
commerciale DEVONO continuare a identificare il servizio effettivo.

### Verifica

Verificare rendering dell'app, icone piccole, metadati e contratto delle risorse.
La presenza di file ICO e ICNS non equivale a test nativo su tutti i sistemi.
