// =====================================================
// Technoportail — script.js (version "Thèmes en Tout" / "Chapitres par classe")
// - Filtre "Tout"  => accordéons groupés par THEME
// - Filtre 5e/4e/3e => accordéons groupés par CHAPITRE (headers chapitre inutiles)
// - Recherche fonctionne dans la vue courante
// =====================================================


// ----------------------------
// Helper pour icône selon type
// ----------------------------
function getFileIcon(type) {
  switch (type) {
    case "cours": return '<i class="fas fa-book-open"></i>';
	case "cours_manu": return '<i class="fas fa-pen-nib"></i>';
    case "synth": return '<i class="fas fa-file-alt"></i>';
    case "acti": return '<i class="fas fa-chalkboard-teacher"></i>';
    case "acti_ecrite": return '<i class="fas fa-pencil-alt"></i>';
    case "acti_indiv": return '<i class="fas fa-user"></i>';
    case "acti_groupe": return '<i class="fas fa-users"></i>';
    case "acti_num": return '<i class="fas fa-desktop"></i>';
    case "devoir": return '<i class="fas fa-house"></i>';
    case "pres": return '<i class="fas fa-chalkboard-teacher"></i>';
    default: return '<i class="fas fa-file-alt"></i>';
  }
}

// ----------------------------
// Helper pour badge de classe
// ----------------------------
function getClasseTag(classe) {
  const palette = {
    "5e": "w3-tag w3-round w3-blue",
    "4e": "w3-tag w3-round w3-indigo",
    "3e": "w3-tag w3-round w3-teal",
    "OST": "w3-tag w3-round w3-amber",
    "SFC": "w3-tag w3-round w3-orange",
    "CCRI": "w3-tag w3-round w3-deep-orange"
  };
  const cls = palette[classe] || "w3-tag w3-round w3-gray";
  return `<span class="${cls}" style="margin-right:8px">${classe}</span>`;
}

// ----------------------------
// Escape HTML (sécurité)
// ----------------------------
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ----------------------------
// Accordéons : ouverture/fermeture
// ----------------------------
function activateAccordions() {
  const accordions = document.querySelectorAll(".accordion");
  accordions.forEach(acc => {
    acc.addEventListener("click", () => {
      const panel = acc.nextElementSibling;
      const isOpening = !panel.style.maxHeight;

      // Fermer les autres
      accordions.forEach(other => {
        const otherPanel = other.nextElementSibling;
        if (other !== acc) {
          other.classList.remove("active");
          const ico = other.querySelector("i");
          if (ico) ico.style.transform = "";
          otherPanel.style.maxHeight = null;
        }
      });

      // Toggle
      const ico = acc.querySelector("i");
      if (isOpening) {
        acc.classList.add("active");
        panel.style.maxHeight = panel.scrollHeight + "px";
        if (ico) ico.style.transform = "rotate(90deg)";
      } else {
        acc.classList.remove("active");
        panel.style.maxHeight = null;
        if (ico) ico.style.transform = "";
      }
    });
  });
}

// ----------------------------
// Couleurs accordéons
// ----------------------------
function colorizeAccordions() {
  const colors = ["color-1", "color-2", "color-3", "color-4"];
  document.querySelectorAll(".accordion").forEach((acc, i) => {
    acc.classList.add(colors[i % colors.length]);
  });
}

// ----------------------------
// Parsing du champ chapitre: "Chapitre 1\nEnvironnement des OST"
// ----------------------------
function parseChapitre(chap) {
  const raw = (chap || "").trim();
  const parts = raw.split("\n");
  const title = (parts[0] || "Autre").trim();
  const subtitle = (parts[1] || "").trim();
  return { title, subtitle, key: `${title}\n${subtitle}` };
}

function chapitreLabel(chapKey) {
  const { title, subtitle } = parseChapitre(chapKey);
  return subtitle ? `${title} — ${subtitle}` : title;
}

// ----------------------------
// UI : helper création d'un doc-item
// ----------------------------
function createDocItem(doc) {
  const link = document.createElement("a");
  link.className = "doc-item";
  link.dataset.classe = (doc.classe || "").toLowerCase();
  link.dataset.theme = (doc.theme || "").toLowerCase();
  link.dataset.chapitre = (doc.chapitre || "").toLowerCase();

  if (doc.fichier && doc.fichier !== "") {
    link.href = doc.fichier;
  } else {
    link.classList.add("w3-disabled");
  }

  link.innerHTML = `${getClasseTag(doc.classe)} ${escapeHtml(doc.titre)} ${getFileIcon(doc.type)}`;
  return link;
}

// ----------------------------
// Génération : vue "TOUT" => accordéons par THEME
// ----------------------------
function renderByTheme(allDocs) {
  const container = document.getElementById("accordionContainer");
  container.innerHTML = "";

  const grouped = {};
  allDocs.forEach(doc => {
    const key = doc.theme || "Autre";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(doc);
  });

  Object.keys(grouped).forEach(theme => {
    const acc = document.createElement("div");
    acc.className = "accordion";
    acc.innerHTML = `${escapeHtml(theme)} <i class="fas fa-chevron-right"></i>`;
    container.appendChild(acc);

    const panel = document.createElement("div");
    panel.className = "panel";

    grouped[theme].forEach(doc => {
      panel.appendChild(createDocItem(doc));
    });

    container.appendChild(panel);
  });

  activateAccordions();
  colorizeAccordions();
}

// ----------------------------
// Génération : vue "CLASSE" => accordéons par CHAPITRE
// (on peut garder le thème en petit sous forme de tag facultatif si tu veux plus tard)
// ----------------------------
function renderByChapter(docsForClasse) {
  const container = document.getElementById("accordionContainer");
  container.innerHTML = "";

  const grouped = {};
  docsForClasse.forEach(doc => {
    const chapKey = (doc.chapitre || "Autre\n").trim() || "Autre\n";
    if (!grouped[chapKey]) grouped[chapKey] = [];
    grouped[chapKey].push(doc);
  });

  Object.keys(grouped).forEach(chapKey => {
    const label = chapitreLabel(chapKey);

    const acc = document.createElement("div");
    acc.className = "accordion";
    acc.innerHTML = `${escapeHtml(label)} <i class="fas fa-chevron-right"></i>`;
    container.appendChild(acc);

    const panel = document.createElement("div");
    panel.className = "panel";

    grouped[chapKey].forEach(doc => {
      panel.appendChild(createDocItem(doc));
    });

    container.appendChild(panel);
  });

  activateAccordions();
  colorizeAccordions();
}

// ----------------------------
// Filtre + Recherche
// ----------------------------
let currentClasseFilter = "tout";

function getSearchValue() {
  return (document.getElementById("searchInput")?.value || "").toLowerCase();
}

function applySearchOnly() {
  const filter = getSearchValue();
  const accordions = document.querySelectorAll(".accordion");

  accordions.forEach(acc => {
    const panel = acc.nextElementSibling;
    const items = panel.querySelectorAll(".doc-item");
    let matchFound = false;

    items.forEach(item => {
      const match = !filter || item.textContent.toLowerCase().includes(filter);
      item.style.display = match ? "flex" : "none";
      if (match) matchFound = true;
    });

    // Masquer accordéon si rien dedans
    acc.style.display = matchFound ? "flex" : "none";
    panel.style.display = matchFound ? "block" : "none";

    // Auto-open si recherche active
    const ico = acc.querySelector("i");
    if (filter && matchFound) {
      panel.style.maxHeight = panel.scrollHeight + "px";
      acc.classList.add("active");
      if (ico) ico.style.transform = "rotate(90deg)";
    } else if (!filter) {
      panel.style.maxHeight = null;
      acc.classList.remove("active");
      if (ico) ico.style.transform = "";
    }
  });
}

function renderCurrentView() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  // Important : on conserve la valeur de recherche quand on change de vue
  const savedSearch = searchInput.value;

  if (currentClasseFilter === "tout") {
    renderByTheme(documents);
  } else {
    const docsForClasse = documents.filter(d => (d.classe || "").toLowerCase() === currentClasseFilter);
    renderByChapter(docsForClasse);
  }

  // restaurer recherche + appliquer
  searchInput.value = savedSearch;
  applySearchOnly();
}

// ----------------------------
// INIT + Events
// ----------------------------
renderCurrentView();

// Recherche
document.getElementById("searchInput")?.addEventListener("input", applySearchOnly);

// Filtres classe
const filterBar = document.getElementById("classFilterBar");
if (filterBar) {
  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentClasseFilter = (btn.dataset.classe || "tout").toLowerCase();
    renderCurrentView();
  });
}
