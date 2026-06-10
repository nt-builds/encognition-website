// ── Blog: Markdown laden & rendern ──────────────────────────────────────

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${MONTHS[m - 1]} ${y}`;
}

function slugifyHeading(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Frontmatter im Format:
// ---
// key: value
// ---
// ...Markdown-Body
function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: match[2] };
}

// ── Übersichtsseite ──────────────────────────────────────────────────────
async function renderBlogList() {
  const list = document.getElementById("blog-list");
  if (!list) return;

  const res = await fetch("/blog-posts/index.json");
  const posts = await res.json();
  posts.sort((a, b) => b.date.localeCompare(a.date));

  list.innerHTML = posts.map((post) => `
    <a class="blog-card" href="/blog-post?p=${post.slug}">
      <p class="blog-card-date">${formatDate(post.date)}</p>
      <h2 class="blog-card-title">${post.title}</h2>
      <p class="blog-card-excerpt">${post.excerpt}</p>
      <span class="blog-card-link">Weiterlesen →</span>
    </a>
  `).join("");
}

// ── Einzelner Beitrag ────────────────────────────────────────────────────
async function renderBlogPost() {
  const content = document.getElementById("post-content");
  if (!content) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("p");
  if (!slug) {
    content.innerHTML = "<p>Dieser Beitrag konnte nicht gefunden werden.</p>";
    return;
  }

  const res = await fetch(`/blog-posts/${slug}/post.md`);
  if (!res.ok) {
    content.innerHTML = "<p>Dieser Beitrag konnte nicht gefunden werden.</p>";
    return;
  }
  const raw = await res.text();
  const { meta, body } = parseFrontmatter(raw);

  document.title = meta.title ? `${meta.title} – Encognition Blog` : document.title;

  const titleEl = document.getElementById("post-title");
  const metaEl = document.getElementById("post-meta");
  if (titleEl) titleEl.textContent = meta.title || "";
  if (metaEl) metaEl.textContent = meta.date ? formatDate(meta.date) : "";

  // Relative Bildpfade auf den Beitragsordner umbiegen
  const renderer = new marked.Renderer();
  renderer.image = ({ href, title, text }) => {
    let src = href;
    if (!/^(https?:)?\/\//.test(src) && !src.startsWith("/") && !src.startsWith("data:")) {
      src = `/blog-posts/${slug}/${src}`;
    }
    const titleAttr = title ? ` title="${title}"` : "";
    return `<img src="${src}" alt="${text}"${titleAttr} loading="lazy">`;
  };

  content.innerHTML = marked.parse(body, { renderer });

  // Inhaltsverzeichnis aus Überschriften (h2/h3) generieren
  const toc = document.getElementById("toc");
  const headings = content.querySelectorAll("h2, h3");
  if (toc && headings.length) {
    const items = [];
    headings.forEach((h) => {
      const id = slugifyHeading(h.textContent);
      h.id = id;
      const indent = h.tagName === "H3" ? " toc-sub" : "";
      items.push(`<a class="toc-link${indent}" href="#${id}">${h.textContent}</a>`);
    });
    toc.innerHTML = `<p class="toc-label">Inhalt</p>${items.join("")}`;
  } else if (toc) {
    toc.remove();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderBlogList();
  renderBlogPost();
});
