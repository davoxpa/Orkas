# Design

Gli SVG consegnati vengono conservati nei resources dell'app. Il gruppo del
simbolo viene riutilizzato senza modifiche geometriche per la sidebar, le icone
PNG/ICO/ICNS e il template monocromatico macOS. Il generatore usa Sharp già
installato; non introduce dipendenze.

La sidebar usa il simbolo e una scritta Georgia coerente con il wordmark SVG.
L'icona desktop riprende la variante chiara su riquadro grafite dell'anteprima;
il template della barra menu è monocromatico, con alpha trasparente.

`productName` e il nome Electron diventano Talia. La directory Chromium
`userData` resta quella precedente (`Orkas` sotto `appData`), mentre il data root
applicativo rimane `.orkas`: il rebranding non deve scollegare le sessioni né
creare un profilo vuoto. ID applicazione e URL di callback restano stabili.

Le traduzioni cambiano solo per le frasi relative a questa applicazione. API,
crediti, servizi e versione commerciale Orkas conservano la loro identità.

Il launcher macOS da sorgente deve riconoscere Electron.app e Orkas.app come
origini di migrazione a Talia.app. Il processo di preparazione conserva la
registrazione dello schema `orkas://` e installa l'icona prima della firma.
