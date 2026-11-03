
document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById("searchInput");
    const classFilters = document.getElementById("classFilters");
    const chapterNav = document.getElementById("chapterNav");
    const documentsGrid = document.getElementById("documentsGrid");
    const accordionContainer = document.getElementById("accordionContainer");
    const resultsTitle = document.getElementById("resultsTitle");
    const resultsCount = document.getElementById("resultsCount");
    const desktopEmpty = document.getElementById("desktopEmpty");
    const mobileEmpty = document.getElementById("mobileEmpty");

    const classes = ["Tout", "5e", "4e", "3e"];
    const openedChapters = new Set();

    let selectedClass = "Tout";
    let selectedChapter = null;

    const typeInfo = {
        cours:       { label: "Cours", icon: "fa-book-open" },
        cours_manu:  { label: "Manuel", icon: "fa-book" },
        acti_groupe: { label: "Activité de groupe", icon: "fa-users" },
        acti_ecrite: { label: "Activité écrite", icon: "fa-pen" },
        acti_indiv:  { label: "Activité individuelle", icon: "fa-user" },
        acti_num:    { label: "Activité numérique", icon: "fa-laptop" },
        synth:       { label: "Synthèse", icon: "fa-file-lines" },
        pres:        { label: "Présentation", icon: "fa-chalkboard" }
    };

    const normalize = value => String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    // Tout = themes / Selected class = chapters
    const groupKey = doc =>
        selectedClass === "Tout" ? doc.theme : doc.chapitre;

    const getGroups = docs =>
        [...new Set(docs.map(groupKey))];

    const getFilteredDocuments = () => {
        const query = normalize(searchInput.value.trim());

        return documents.filter(doc => {

            // Syntheses remain accessible for every class
            const classMatches =
                selectedClass === "Tout" ||
                doc.classe === selectedClass ||
                doc.chapitre === "Synthèses";

            const searchMatches = !query || normalize([
                doc.titre,
                doc.theme,
                doc.chapitre,
                doc.classe,
                typeInfo[doc.type]?.label || doc.type
            ].join(" ")).includes(query);

            return classMatches && searchMatches;
        });
    };

    function createDocumentCard(doc) {
        const info = typeInfo[doc.type] || {
            label: "Document",
            icon: "fa-file"
        };

        const available = Boolean(doc.fichier?.trim());
        const card = document.createElement(available ? "a" : "div");

        card.className = "document-card";

        if (available) {
            card.href = doc.fichier;
            card.target = "_blank";
            card.rel = "noopener noreferrer";
        } else {
            card.classList.add("is-unavailable");
            card.title = "Document non disponible";
        }

        const icon = document.createElement("span");
        icon.className = "document-icon";

        const iconElement = document.createElement("i");
        iconElement.className = `fas ${info.icon}`;
        icon.appendChild(iconElement);

        const content = document.createElement("span");
        content.className = "document-content";

        const title = document.createElement("span");
        title.className = "document-title";
        title.textContent = doc.titre;

        const meta = document.createElement("span");
        meta.className = "document-meta";
        meta.textContent = available
            ? `${info.label} · ${doc.classe}`
            : `${info.label} · Bientôt disponible`;

        content.append(title, meta);
        card.append(icon, content);

        if (available) {
            const arrow = document.createElement("i");
            arrow.className = "fas fa-arrow-up-right-from-square document-arrow";
            card.appendChild(arrow);
        }

        return card;
    }

    function renderFilters() {
        classFilters.replaceChildren();

        classes.forEach(classe => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "classeurs-class-btn";
            button.textContent = classe;

            const active = selectedClass === classe;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));

            button.addEventListener("click", () => {
                selectedClass = classe;
                selectedChapter = null;
                openedChapters.clear();
                render();
            });

            classFilters.appendChild(button);
        });
    }


	function renderSidebar(filtered) {
		const groups = getGroups(filtered);

		// Update sidebar heading
		document.getElementById("sidebarTitle").textContent =
			selectedClass === "Tout" ? "Thèmes" : "Chapitres";

		// Automatically select the first available group
		if (!groups.includes(selectedChapter)) {
			selectedChapter = groups[0] || null;
		}

		chapterNav.replaceChildren();

		groups.forEach(key => {
			const count = filtered.filter(doc => groupKey(doc) === key).length;

			const button = document.createElement("button");
			button.type = "button";
			button.className = "classeurs-chapter-btn";
			button.textContent = `${key} (${count})`;

			const active = selectedChapter === key;
			button.classList.toggle("active", active);
			button.setAttribute("aria-pressed", String(active));

			button.addEventListener("click", () => {
				selectedChapter = key;
				render();
			});

			chapterNav.appendChild(button);
		});
	}



	function renderDesktop(filtered) {
		const visible = selectedChapter
			? filtered.filter(doc => groupKey(doc) === selectedChapter)
			: [];

		resultsTitle.textContent = selectedChapter || "Aucun résultat";

		resultsCount.textContent =
			`${visible.length} document${visible.length > 1 ? "s" : ""}`;

		documentsGrid.replaceChildren(
			...visible.map(createDocumentCard)
		);

		desktopEmpty.hidden = visible.length > 0;
	}


    function renderMobile(filtered) {
        const groups = getGroups(filtered);
        const queryActive = searchInput.value.trim().length > 0;

        accordionContainer.replaceChildren();

        groups.forEach((key, index) => {
            const groupDocs = filtered.filter(doc => groupKey(doc) === key);

            const group = document.createElement("div");
            group.className = "classeurs-chapter-group";

            const button = document.createElement("button");
            button.type = "button";
            button.className = "accordion";

            const label = document.createElement("span");
            label.className = "accordion-label";
            label.textContent = key;

            const chevron = document.createElement("i");
            chevron.className = "fas fa-chevron-right";
            chevron.setAttribute("aria-hidden", "true");

            const panel = document.createElement("div");
            panel.className = "panel";
            panel.id = `classeur-panel-${index}`;

            const cards = document.createElement("div");
            cards.className = "classeurs-mobile-documents";
            cards.replaceChildren(
                ...groupDocs.map(createDocumentCard)
            );

            panel.appendChild(cards);

            const open = queryActive || openedChapters.has(key);
            panel.hidden = !open;
            button.classList.toggle("active", open);
            button.setAttribute("aria-expanded", String(open));
            button.setAttribute("aria-controls", panel.id);

            button.append(label, chevron);

            button.addEventListener("click", () => {
                const nextOpen = panel.hidden;

                panel.hidden = !nextOpen;
                button.classList.toggle("active", nextOpen);
                button.setAttribute("aria-expanded", String(nextOpen));

                if (nextOpen) openedChapters.add(key);
                else openedChapters.delete(key);
            });

            group.append(button, panel);
            accordionContainer.appendChild(group);
        });

        mobileEmpty.hidden = filtered.length > 0;
    }

    function render() {
        const filtered = getFilteredDocuments();

        renderFilters();
        renderSidebar(filtered);
        renderDesktop(filtered);
        renderMobile(filtered);
    }

    searchInput.addEventListener("input", () => {
        selectedChapter = null;
        render();
    });

    render();
});
