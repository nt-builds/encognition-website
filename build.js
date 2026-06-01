#!/usr/bin/env node
/*
 * Build-Skript für encognition.app
 * -------------------------------------------------------------
 * Quelle der Wahrheit:
 *   content/<seite>.json  → alle Texte einer Seite (hier bearbeiten!)
 *   src/<seite>.html      → Vorlage mit Platzhaltern
 *   src/partials/*.html   → wiederverwendete Bausteine (nav, footer …)
 *
 * Ausgabe:
 *   dist/  → fertige Website (das, was Netlify veröffentlicht)
 *
 * Platzhalter-Syntax in den Vorlagen:
 *   {{name}}              → Text aus der JSON (HTML ist erlaubt)
 *   {{> partialname}}     → fügt src/partials/partialname.html ein
 *   {{#each liste}} … {{/each}}  → wiederholt den Block je Listeneintrag
 *                          (Felder im Block ebenfalls als {{feld}})
 *
 * Aufruf:  node build.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const CONTENT = path.join(ROOT, "content");
const PARTIALS = path.join(SRC, "partials");
const DIST = path.join(ROOT, "dist");

// Dateien/Ordner, die NICHT nach dist kopiert werden (Quell- & Werkzeugdateien)
const COPY_BLOCKLIST = new Set([
  ".git", ".github", "node_modules", "dist", "src", "content",
  "build.js", "package.json", "package-lock.json", "netlify.toml",
  ".gitignore", ".claude", ".DS_Store", "README.md",
]);

// ── Mini-Template-Engine ────────────────────────────────────────────────
function loadPartials() {
  const map = {};
  if (!fs.existsSync(PARTIALS)) return map;
  for (const f of fs.readdirSync(PARTIALS)) {
    if (f.endsWith(".html")) {
      map[path.basename(f, ".html")] = fs.readFileSync(path.join(PARTIALS, f), "utf8");
    }
  }
  return map;
}

function render(tpl, data, partials) {
  // 1) Partials einsetzen (rekursiv, damit Partials selbst Platzhalter nutzen können)
  tpl = tpl.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
    if (!(name in partials)) throw new Error(`Partial nicht gefunden: ${name}`);
    return partials[name];
  });

  // 2) {{#each key}} … {{/each}}
  tpl = tpl.replace(/\{\{#each\s+([\w-]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, key, block) => {
    const list = data[key];
    if (!Array.isArray(list)) throw new Error(`Liste nicht gefunden oder kein Array: ${key}`);
    return list.map((item) => render(block, { ...data, ...item }, partials)).join("");
  });

  // 3) {{name}} Variablen
  tpl = tpl.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_, name) => {
    if (data[name] === undefined) throw new Error(`Platzhalter ohne Wert: {{${name}}}`);
    return data[name];
  });

  return tpl;
}

// ── Statische Dateien rekursiv nach dist kopieren ───────────────────────
function copyStatic(srcDir, dstDir, isRoot = false) {
  fs.mkdirSync(dstDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (isRoot && COPY_BLOCKLIST.has(entry.name)) continue;
    if (entry.name === ".DS_Store") continue;
    const s = path.join(srcDir, entry.name);
    const d = path.join(dstDir, entry.name);
    if (entry.isDirectory()) copyStatic(s, d, false);
    else fs.copyFileSync(s, d);
  }
}

// ── Build ───────────────────────────────────────────────────────────────
function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  copyStatic(ROOT, DIST, true);

  const partials = loadPartials();
  const pages = fs.readdirSync(SRC).filter((f) => f.endsWith(".html"));
  let count = 0;
  for (const page of pages) {
    const name = path.basename(page, ".html");
    const jsonPath = path.join(CONTENT, name + ".json");
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Keine Text-Datei für Seite "${name}" gefunden: content/${name}.json`);
    }
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const tpl = fs.readFileSync(path.join(SRC, page), "utf8");
    const html = render(tpl, data, partials);
    fs.writeFileSync(path.join(DIST, name + ".html"), html);
    count++;
  }
  console.log(`✓ Build fertig: ${count} Seite(n) gerendert nach dist/`);
}

build();
