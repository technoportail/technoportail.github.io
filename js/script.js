


    // ----------------------------
    // Helper pour icône selon type
    // ----------------------------
    function getFileIcon(type) {
        switch(type) {
            case "cours": return '<i class="fas fa-book-open"></i>';
            case "synth": return '<i class="fas fa-file-alt"></i>';
            case "acti": return '<i class="fas fa-chalkboard-teacher"></i>';
			case "acti_ecrite": return '<i class="fas fa-pencil-alt"></i>';
			case "acti_indiv": return '<i class="fas fa-user"></i>';
			case "acti_groupe": return '<i class="fas fa-users"></i>';
			case "acti_num": return '<i class="fas fa-desktop"></i>';
			case "devoir": return '<i class="fas fa-house"></i>';
			case "pres": return '<i class="fas fa-chalkboard-teacher"></i>';
			case "docu": return '<i class="fas fa-video"></i>';
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
    // Génération des accordéons par thème
    // ----------------------------
    function generateAccordionsByTheme(documents) {
        const container = document.getElementById("accordionContainer");
        container.innerHTML = ""; // reset

        // Regrouper les docs par thème
        const grouped = {};
        documents.forEach(doc => {
            if (!grouped[doc.theme]) grouped[doc.theme] = [];
            grouped[doc.theme].push(doc);
        });

        // Créer les accordéons
        for (const theme in grouped) {
            // Accordion button
            const acc = document.createElement("div");
            acc.className = "accordion";
            acc.innerHTML = `${escapeHtml(theme)} <i class="fas fa-chevron-right"></i>`;
            container.appendChild(acc);

            // Panel
            const panel = document.createElement("div");
            panel.className = "panel";

            grouped[theme].forEach(doc => {
                const link = document.createElement("a");
                if (doc.fichier!=""){
					link.href = doc.fichier;
					link.className = "doc-item";
				}
				else{
					link.className = "doc-item w3-disabled";
				}
                link.innerHTML = `${getClasseTag(doc.classe)} ${escapeHtml(doc.titre)} ${getFileIcon(doc.type)}`;
                panel.appendChild(link);
            });

            container.appendChild(panel);
        }

        // Activer la logique accordéon
        activateAccordions();
    }

    // ----------------------------
    // Activer les accordéons
    // ----------------------------
    function activateAccordions() {
        const accordions = document.querySelectorAll('.accordion');
        accordions.forEach(acc => {
            acc.addEventListener('click', () => {
                acc.classList.toggle('active');
                const panel = acc.nextElementSibling;
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                    acc.querySelector('i').style.transform = '';
                } else {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                    acc.querySelector('i').style.transform = 'rotate(90deg)';
                }
            });
        });
    }

    // ----------------------------
    // Initialiser l’affichage
    // ----------------------------
    generateAccordionsByTheme(documents);

    // ----------------------------
    // Recherche dans les documents
    // ----------------------------
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function () {
        const filter = this.value.toLowerCase();
        const panels = document.querySelectorAll('.panel');

        panels.forEach(panel => {
            const items = panel.querySelectorAll('.doc-item');
            let matchFound = false;

            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                const match = text.includes(filter);
                item.style.display = match ? "flex" : "none";
                if (match) matchFound = true;
            });

            const acc = panel.previousElementSibling;
            if (filter && matchFound) {
                panel.style.maxHeight = panel.scrollHeight + "px";
                acc.classList.add('active');
                acc.querySelector('i').style.transform = 'rotate(90deg)';
            } else if (!filter) {
                panel.style.maxHeight = null;
                acc.classList.remove('active');
                acc.querySelector('i').style.transform = '';
            }
        });

    });


