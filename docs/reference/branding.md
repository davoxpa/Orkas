# Identità Talia

Decisione dell'utente e integrazione: **8 novembre 2026**.

## Nome e fonte canonica

Il nome visibile dell'app è **Talia**, come negli SVG consegnati per
l'integrazione. La precedente esplorazione `Talìa` non è stata applicata alla
grafica finale consegnata, che usa `Talia` senza accento.

I due file originali sono conservati senza modifiche:

- [Logo con scritta](../../src/resources/icons/talia-logo.svg).
- [Tavola di riferimento](../../src/resources/icons/talia-anteprima.svg).

Provenienza: artefatto locale `talia-logo-preview/assets`, revisione 4, indicato
espressamente dall'utente. Il simbolo usa tre agenti esagonali arrotondati,
separati dagli archi, e un centro circolare ambra. La scritta Georgia è ancora
provvisoria dal punto di vista del design; l'integrazione non la ridisegna.

## Palette

| Ruolo | Colore |
| --- | --- |
| Struttura e scritta | Grafite `#282A2D` |
| Centro | Ambra `#F4BC53` |
| Variante chiara su scuro | Avorio `#F6F5F1` |

La palette riguarda il marchio. I colori funzionali dell'interfaccia non sono
stati sostituiti globalmente.

## Integrazione

- Sidebar: [simbolo SVG](../../src/resources/icons/talia-symbol.svg) e nome Talia
  con la stessa famiglia serif della fonte.
- Desktop, Dock e finestre: `icon.png`, `icon.icns`, `icon.ico`.
- Barra menu macOS: `taliaTemplate.png` e `taliaTemplate@2x.png`, monocromatici.
- Titoli, testi di prodotto, notifiche e consensi OS localizzati: nome Talia.
- Pacchetti: `productName: Talia`; launcher macOS da sorgente: `Talia.app`.

Per rigenerare gli asset, dalla root del repository:

```sh
node scripts/generate-brand-icons.cjs
```

Il generatore usa Sharp, già presente, e deriva tutte le risoluzioni dallo stesso
simbolo. L'icona riprende la variante su riquadro grafite dell'anteprima.

## Compatibilità

Restano stabili `com.orkas.desktop`, lo schema `orkas://`, il nome tecnico npm,
le variabili `ORKAS_*`, i contratti IPC e i nomi pubblici dei tool. Il profilo
Chromium rimane nella directory `Orkas` sotto `appData`; il data root conserva
la convenzione `.orkas`. Non è prevista una migrazione distruttiva dei dati.

Orkas API, crediti Orkas e l'edizione commerciale a cui rimandano i link esistenti
sono servizi terzi e mantengono quel nome. Il progetto deriva dal codice MIT
Orkas, con attribuzione e link upstream preservati.

## Verifica

- Typecheck main e core-agent completati.
- 122 test mirati superati; due scenari nativi Windows saltati su macOS.
- Altri 27 test di launcher, bootstrap e confine open-source superati
  (11 già compresi nel conteggio precedente).
- Test Electron del rebranding superato: titolo, nome, immagine, metadati,
  schema callback invariato, profilo E2E isolato e UI italiana a larghezza ridotta.
- Contenitori ICO e ICNS verificati: sette PNG validi per ciascuno.
- Controllo visivo a 16, 18, 24, 30, 32, 48, 64 e 128 px: il segno complessivo
  resta visibile; gli esagoni alle dimensioni minime si percepiscono come punti.
- Bundle locale rinominato e firmato: `codesign --verify --deep --strict` e
  decodifica ICNS tramite `iconutil` completati. Riavvio normale osservato nella
  UI: nome Talia, conversazione precedente e modello configurato conservati.

Le immagini di QA sono sotto `test-results/branding/` e nel risultato del test
`branding_e2e_talia`. Nessun pacchetto di distribuzione è stato prodotto;
installazione Windows e rendering nativo Windows non sono stati verificati.
Non è stata svolta una verifica di anteriorità del marchio.
