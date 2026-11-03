
document.addEventListener("DOMContentLoaded", () => {

    const chapterNav = document.getElementById("chapterNav");
    const grid = document.getElementById("activitiesGrid");
    const accordionContainer = document.getElementById("accordionContainer");
    const classFilters = document.getElementById("classFilters");
    const searchInput = document.getElementById("searchInput");
    const resultsTitle = document.getElementById("resultsTitle");
    const resultsCount = document.getElementById("resultsCount");
    const desktopEmpty = document.getElementById("desktopEmpty");
    const mobileEmpty = document.getElementById("mobileEmpty");

    const chapters = [...new Set(documents.map(doc => doc.theme))];
    const classes = ["Tout", "5e", "4e", "3e"];

    let selectedChapter = "Tout";
    let selectedClass = "Tout";
    const openedChapters = new Set();

    /* CRÉATION D'UNE CARTE */
    function createCard(doc) {
        const card = document.createElement("article");
        card.className = "activity-card";

        const link = document.createElement("a");
        link.className = "card-link";
        link.href = doc.fichier;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const image = document.createElement("div");
        image.className = "card-image";
        image.style.backgroundImage = `url("${doc.im}")`;
        image.setAttribute("role", "img");
        image.setAttribute("aria-label", doc.titre);

        const overlay = document.createElement("div");
        overlay.className = "card-overlay";

        const text = document.createElement("div");
        text.className = "card-text";

        const title = document.createElement("span");
        title.className = "card-title";
        title.textContent = doc.titre;

        const icon = document.createElement("i");
        icon.className = "fas fa-arrow-up-right-from-square";
        icon.setAttribute("aria-hidden", "true");

        const meta = document.createElement("span");
        meta.className = "activity-meta";
        meta.textContent = `${doc.classe} · ${doc.theme}`;

        text.append(title, icon);
        overlay.append(text, meta);
        image.appendChild(overlay);
		link.appendChild(image);
        card.appendChild(link);

        return card;
    }

    /* FILTRES PAR CLASSE */
    classes.forEach(classe => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "activities-class-btn";
        btn.textContent = classe;
        btn.classList.toggle("active", classe === "Tout");

        btn.addEventListener("click", () => {
            selectedClass = classe;

            classFilters.querySelectorAll("button").forEach(b => {
                b.classList.toggle("active", b === btn);
            });

            render();
        });

        classFilters.appendChild(btn);
    });

    /* SIDEBAR DESKTOP */
    ["Tout", ...chapters].forEach(chapter => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "activities-chapter-btn";
        btn.dataset.chapter = chapter;
        btn.textContent = chapter === "Tout"
            ? "Tous les thèmes" : chapter;

        btn.addEventListener("click", () => {
            selectedChapter = chapter;
            render();
        });

        chapterNav.appendChild(btn);
    });

    /* RECHERCHE */
    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    function getFilteredDocuments() {
        const query = normalize(searchInput.value.trim());

        return documents.filter(doc => {
            const classOK = selectedClass === "Tout"
                || doc.classe === selectedClass;

            const searchOK = !query || [
                doc.titre, doc.theme, doc.classe
            ].some(value => normalize(value).includes(query));

            return classOK && searchOK;
        });
    }

    /* DESKTOP */
    function renderDesktop(filtered) {
        chapterNav.querySelectorAll("button").forEach(btn => {
            btn.classList.toggle(
                "active",
                btn.dataset.chapter === selectedChapter
            );
        });

        const visible = selectedChapter === "Tout"
            ? filtered
            : filtered.filter(doc => doc.theme === selectedChapter);

        resultsTitle.textContent = selectedChapter === "Tout"
            ? "Toutes les activités" : selectedChapter;

        resultsCount.textContent =
            `${visible.length} activité${visible.length > 1 ? "s" : ""}`;

        grid.replaceChildren(...visible.map(createCard));
        desktopEmpty.hidden = visible.length !== 0;
    }

    /* MOBILE : ACCORDÉONS */
    function renderMobile(filtered) {
        accordionContainer.replaceChildren();

        const queryActive = searchInput.value.trim() !== "";
        let visibleGroups = 0;

        chapters.forEach((chapter, index) => {
            const chapterDocs = filtered.filter(doc => doc.theme === chapter);
            if (chapterDocs.length === 0) return;

            visibleGroups++;

            const group = document.createElement("div");
            group.className = "activities-chapter-group";

            const button = document.createElement("button");
            button.type = "button";
            button.className = "accordion";
            button.setAttribute("aria-expanded", "false");

            const panel = document.createElement("div");
            panel.className = "panel";
            panel.id = `activities-panel-${index}`;
            panel.hidden = true;
            button.setAttribute("aria-controls", panel.id);

            const label = document.createElement("span");
            label.textContent = `${chapter} (${chapterDocs.length})`;

            const arrow = document.createElement("i");
            arrow.className = "fas fa-chevron-right";
            arrow.setAttribute("aria-hidden", "true");

            button.append(label, arrow);

            const cards = document.createElement("div");
            cards.className = "activities-mobile-cards";
            cards.replaceChildren(...chapterDocs.map(createCard));
            panel.appendChild(cards);

            function setOpen(open) {
                button.classList.toggle("active", open);
                button.setAttribute("aria-expanded", String(open));
                panel.hidden = !open;
            }

            setOpen(queryActive || openedChapters.has(chapter));

            button.addEventListener("click", () => {
                const nextOpen = button.getAttribute("aria-expanded") !== "true";

                if (nextOpen) openedChapters.add(chapter);
                else openedChapters.delete(chapter);

                setOpen(nextOpen);
            });

            group.append(button, panel);
            accordionContainer.appendChild(group);
        });

        mobileEmpty.hidden = visibleGroups !== 0;
    }

    /* RENDU GLOBAL */
    function render() {
        const filtered = getFilteredDocuments();
        renderDesktop(filtered);
        renderMobile(filtered);
    }

    searchInput.addEventListener("input", render);

    render();
});
