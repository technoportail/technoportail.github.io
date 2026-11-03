
document.addEventListener("DOMContentLoaded", () => {

    const filters = document.getElementById("projetsFilters");
    const grid = document.getElementById("projetsGrid");
    const categoryTitle = document.getElementById("projetsCategoryTitle");
    const count = document.getElementById("projetsCount");
    const empty = document.getElementById("projetsEmpty");

    const modal = document.getElementById("projetsModal");
    const modalImage = document.getElementById("modalImage");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");
    const modalCategory = document.getElementById("modalCategory");
    const modalAuthor = document.getElementById("modalAuthor");
    const modalClose = document.getElementById("modalClose");

    const categories = [...new Set(projets.map(p => p.categorie))];
    let selectedCategory = "Toutes";
    let previousFocus = null;

    const categoryIcons = {
        "Modélisation 3D": "fa-cube",
        "Ponts spaghetti": "fa-bridge"
    };

    function createElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function createCard(projet) {
        const card = createElement("button", "projet-card");
        card.type = "button";
        card.setAttribute("aria-label", `Voir la réalisation : ${projet.titre}`);

        const imageWrap = createElement("span", "projet-card-image");
        const image = document.createElement("img");
        image.src = projet.image;
        image.alt = projet.titre;
        image.loading = "lazy";

        // Placeholder if the image is missing
        image.addEventListener("error", () => {
            image.style.display = "none";
            imageWrap.classList.add("projet-image-missing");

            if (!imageWrap.querySelector(".projet-image-placeholder")) {
                const placeholder = createElement(
                    "span",
                    "projet-image-placeholder",
                    "Image à venir"
                );
                imageWrap.appendChild(placeholder);
            }
        });

        imageWrap.appendChild(image);

        const category = createElement(
            "span",
            "projet-category",
            projet.categorie
        );
        imageWrap.appendChild(category);

        const body = createElement("span", "projet-card-body");

        const title = createElement(
            "span",
            "projet-card-title",
            projet.titre
        );

        const description = createElement(
            "span",
            "projet-card-description",
            projet.description
        );

        const footer = createElement("span", "projet-card-footer");

        const authorIcon = createElement("i", "fas fa-user");
        const author = createElement("span", "", projet.auteur);
        const classe = createElement("span", "projet-classe", projet.classe);

        footer.append(authorIcon, author, classe);
        body.append(title, description, footer);
        card.append(imageWrap, body);

        card.addEventListener("click", () => openModal(projet));

        return card;
    }

    function renderFilters() {
        filters.replaceChildren();

        ["Toutes", ...categories].forEach(categorie => {
            const button = createElement("button", "projets-filter-btn");
            button.type = "button";

            const icon = createElement(
                "i",
                `fas ${categorie === "Toutes"
                    ? "fa-border-all"
                    : categoryIcons[categorie] || "fa-shapes"}`
            );

            const label = createElement("span", "", categorie);
            button.append(icon, label);

            const active = selectedCategory === categorie;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));

            button.addEventListener("click", () => {
                selectedCategory = categorie;
                render();
            });

            filters.appendChild(button);
        });
    }

    function renderGallery() {
        const visible = selectedCategory === "Toutes"
            ? projets
            : projets.filter(p => p.categorie === selectedCategory);

        categoryTitle.textContent = selectedCategory === "Toutes"
            ? "Toutes les réalisations"
            : selectedCategory;

        count.textContent =
            `${visible.length} réalisation${visible.length > 1 ? "s" : ""}`;

        grid.replaceChildren(...visible.map(createCard));
        empty.hidden = visible.length > 0;
    }

    function openModal(projet) {
        previousFocus = document.activeElement;

        modalImage.src = projet.image;
        modalImage.alt = projet.titre;
        modalTitle.textContent = projet.titre;
        modalDescription.textContent = projet.description;
        modalCategory.textContent = projet.categorie;
        modalAuthor.textContent = `${projet.auteur} · ${projet.classe}`;

        modal.hidden = false;
        document.body.classList.add("projets-modal-open");
        modalClose.focus();
    }

    function closeModal() {
        modal.hidden = true;
        document.body.classList.remove("projets-modal-open");
        modalImage.removeAttribute("src");

        if (previousFocus && previousFocus.isConnected) {
            previousFocus.focus();
        }
    }

    modalClose.addEventListener("click", closeModal);

    modal.addEventListener("click", event => {
        if (event.target.closest("[data-close]")) closeModal();
    });

    document.addEventListener("keydown", event => {
        if (modal.hidden) return;

        if (event.key === "Escape") {
            closeModal();
        }

        // Keep keyboard focus inside the modal
        if (event.key === "Tab") {
            const focusable = [...modal.querySelectorAll(
                "button:not([disabled]), a[href], input, [tabindex]:not([tabindex='-1'])"
            )].filter(el => el.getClientRects().length);

            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    function render() {
        renderFilters();
        renderGallery();
    }

    render();
});
