(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
        var index = 0;

        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    });

    var filterInput = document.querySelector("[data-filter-input]");
    var categoryFilter = document.querySelector("[data-category-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var grid = document.querySelector("[data-filter-grid]");
    var emptyState = document.querySelector("[data-empty-state]");

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
        if (!grid) {
            return;
        }
        var query = normalize(filterInput && filterInput.value);
        var category = normalize(categoryFilter && categoryFilter.value);
        var year = normalize(yearFilter && yearFilter.value);
        var visible = 0;

        Array.prototype.slice.call(grid.querySelectorAll("[data-card]")).forEach(function (card) {
            var text = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-category"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags")
            ].join(" "));
            var cardCategory = normalize(card.getAttribute("data-category"));
            var cardYear = normalize(card.getAttribute("data-year"));
            var matched = true;

            if (query && text.indexOf(query) === -1) {
                matched = false;
            }
            if (category && cardCategory !== category) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }

            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    [filterInput, categoryFilter, yearFilter].forEach(function (control) {
        if (control) {
            control.addEventListener("input", applyFilters);
            control.addEventListener("change", applyFilters);
        }
    });

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
            filterInput.value = q;
        }
        applyFilters();
    }
})();
