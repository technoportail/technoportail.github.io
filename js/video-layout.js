
document.addEventListener("DOMContentLoaded", () => {
    const filters = document.getElementById("videoFilters");
    const grid = document.getElementById("videoGrid");
    const categoryTitle = document.getElementById("videoCategoryTitle");
    const count = document.getElementById("videoCount");
    const empty = document.getElementById("videoEmpty");

    const modal = document.getElementById("videoModal");
    const player = document.getElementById("videoPlayer");
    const modalTitle = document.getElementById("videoModalTitle");
    const modalDescription = document.getElementById("videoModalDescription");
    const modalCategory = document.getElementById("videoModalCategory");
    const youtubeLink = document.getElementById("videoYoutubeLink");
    const closeButton = document.getElementById("videoModalClose");

    let selectedCategory = "Toutes";
    let previousFocus = null;

    function getVideoId(url) {
        try {
            const parsed = new URL(url);
            const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

            let id = null;

            if (host === "youtu.be") {
                id = parsed.pathname.split("/")[1];
            } else if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
                const parts = parsed.pathname.split("/").filter(Boolean);

                if (parts[0] === "watch") id = parsed.searchParams.get("v");
                if (["shorts", "embed", "live"].includes(parts[0])) id = parts[1];
            }

            return /^[a-zA-Z0-9_-]{11}$/.test(id || "") ? id : null;
        } catch {
            return null;
        }
    }

    const validVideos = videos
        .map(video => ({ ...video, id: getVideoId(video.youtube) }))
        .filter(video => video.id);

    const categories = [...new Set(validVideos.map(v => v.categorie).filter(Boolean))];

    function el(tag, className, content) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content !== undefined) element.textContent = content;
        return element;
    }

    function createCard(video) {
        const card = el("button", "video-card");
        card.type = "button";
        card.setAttribute("aria-label", `Regarder : ${video.titre}`);

        const thumbnail = el("span", "video-thumbnail");
        const image = document.createElement("img");
        image.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
        image.alt = "";
        image.loading = "lazy";

        const play = el("span", "video-play");
        play.appendChild(el("i", "fas fa-play"));

        thumbnail.append(image, play);

        const body = el("span", "video-card-body");
        const title = el("span", "video-card-title", video.titre);
        const description = el("span", "video-card-description", video.description || "");

        const footer = el("span", "video-card-footer");
        footer.append(
            el("i", "fab fa-youtube"),
            el("span", "", video.categorie || "Vidéo")
        );

        body.append(title, description, footer);
        card.append(thumbnail, body);
        card.addEventListener("click", () => openModal(video));

        return card;
    }

    function renderFilters() {
        filters.replaceChildren();

        ["Toutes", ...categories].forEach(category => {
            const button = el("button", "video-filter-btn");
            button.type = "button";

            button.append(
                el("i", category === "Toutes" ? "fas fa-border-all" : "fas fa-play-circle"),
                el("span", "", category === "Toutes" ? "Toutes les vidéos" : category)
            );

            const active = selectedCategory === category;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));

            button.addEventListener("click", () => {
                selectedCategory = category;
                render();
            });

            filters.appendChild(button);
        });
    }

    function renderGallery() {
        const visible = selectedCategory === "Toutes"
            ? validVideos
            : validVideos.filter(v => v.categorie === selectedCategory);

        categoryTitle.textContent = selectedCategory === "Toutes"
            ? "Toutes les vidéos"
            : selectedCategory;

        count.textContent = `${visible.length} vidéo${visible.length > 1 ? "s" : ""}`;
        grid.replaceChildren(...visible.map(createCard));
        empty.hidden = visible.length > 0;
    }

    function openModal(video) {
        previousFocus = document.activeElement;

        modalTitle.textContent = video.titre;
        modalDescription.textContent = video.description || "";
        modalCategory.textContent = video.categorie || "Vidéo";
        youtubeLink.href = `https://www.youtube.com/watch?v=${video.id}`;

        modal.hidden = false;
        document.body.classList.add("video-modal-open");

        player.src = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`;
        closeButton.focus();
    }

    function closeModal() {
        player.removeAttribute("src");
        modal.hidden = true;
        document.body.classList.remove("video-modal-open");

        if (previousFocus?.isConnected) previousFocus.focus();
    }

    closeButton.addEventListener("click", closeModal);

    modal.addEventListener("click", event => {
        if (event.target.closest("[data-close]")) closeModal();
    });

    document.addEventListener("keydown", event => {
        if (modal.hidden) return;

        if (event.key === "Escape") {
            closeModal();
            return;
        }

        if (event.key === "Tab") {
            const focusable = [...modal.querySelectorAll(
                "button:not([disabled]), a[href]"
            )].filter(element => element.getClientRects().length);

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
