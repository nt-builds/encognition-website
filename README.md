# encognition.app — Website

Statische Website, deployt über Netlify. **Alle Texte liegen getrennt vom HTML**
in `content/*.json` und werden beim Build in die HTML-Vorlagen eingesetzt.

## Ordnerstruktur

```
content/            ← TEXTE (hier bearbeiten!) – pro Seite eine JSON
  index.json
  lehrende.json
  studierende.json
  support.json
  wissenschaft.json

src/                ← HTML-Vorlagen mit Platzhaltern
  index.html  …
  partials/         ← wiederverwendete Bausteine
    nav-badge.html  ← Navigation mit „Beta · iOS"-Badge (Startseite, Landingpages)
    nav-back.html   ← Navigation mit „Zurück"-Link (Unterseiten)
    footer.html     ← Footer (Links + Meta)
    science-data.html ← Wissenschafts-Modal + Quellen-Datenbank (window.scienceRefs)

build.js            ← Build-Skript (Node, ohne Abhängigkeiten)
dist/               ← ERZEUGTE Website (nicht bearbeiten, nicht committen)

# Direkt im Wurzelordner (statisch, kein Build): style.css, function.js,
# Bilder, _redirects sowie die rechtlichen Seiten (agb/datenschutz/impressum/
# disclaimer.html) und betatest/.
```

## Texte bearbeiten

1. Die passende Datei in `content/` öffnen (z. B. `content/lehrende.json`).
2. Text ändern. In den Werten ist **HTML erlaubt** (z. B. `<br>`, `<em>…</em>`).
   Achtung bei Sonderzeichen in JSON: `"` im Text als `\"` schreiben.
3. Speichern, committen, pushen → Netlify baut automatisch neu.

## Lokal bauen / ansehen (optional, benötigt Node.js)

```
node build.js      # erzeugt dist/
# dann dist/ mit einem lokalen Server oder direkt im Browser öffnen
```

## Platzhalter-Syntax in den Vorlagen (`src/`)

| Syntax | Bedeutung |
|---|---|
| `{{name}}` | Text aus der JSON einsetzen (HTML erlaubt) |
| `{{> partial}}` | Baustein aus `src/partials/` einfügen |
| `{{#each liste}} … {{/each}}` | Block je Listeneintrag wiederholen (Felder als `{{feld}}`) |

## KONVENTION für neue Unterseiten

Jede neue Unterseite bekommt **immer beides**:
1. eine Vorlage `src/<name>.html` (Texte als `{{platzhalter}}`),
2. eine Text-Datei `content/<name>.json` mit denselben Schlüsseln.

Der Build verlangt zu jeder `src/<name>.html` eine `content/<name>.json` und
bricht sonst mit Fehler ab. So bleibt „Text bearbeiten" immer an einer Stelle.
