(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initNav() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.getElementById("site-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var root = document.querySelector(".hero-carousel");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var index = 0;
        function show(next) {
            index = next;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show((index + 1) % slides.length);
            }, 5000);
        }
    }

    function normalize(text) {
        return String(text || "").toLowerCase().replace(/\s+/g, "");
    }

    function initPageFilter() {
        var input = document.getElementById("page-filter");
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-target .movie-card"));
        input.addEventListener("input", function () {
            var term = normalize(input.value);
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                card.classList.toggle("is-filter-hidden", term && haystack.indexOf(term) === -1);
            });
        });
    }

    function queryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function initSearchPage() {
        var container = document.getElementById("search-results");
        var input = document.getElementById("search-input");
        if (!container || !input || !window.SEARCH_INDEX) {
            return;
        }
        var q = queryValue("q");
        input.value = q;
        var term = normalize(q);
        if (!term) {
            container.innerHTML = "";
            return;
        }
        var results = window.SEARCH_INDEX.filter(function (item) {
            return normalize([
                item.title,
                item.region,
                item.year,
                item.genre,
                item.tags,
                item.category
            ].join(" ")).indexOf(term) !== -1;
        }).slice(0, 80);
        if (!results.length) {
            container.innerHTML = '<div class="search-empty">没有找到匹配影片，换个关键词试试。</div>';
            return;
        }
        container.innerHTML = results.map(function (item) {
            return '<a class="search-result-item" href="' + item.url + '">' +
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span><h2>' + escapeHtml(item.title) + '</h2>' +
                '<p>' + escapeHtml(item.desc) + '</p>' +
                '<em>' + escapeHtml(item.category) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ★ ' + escapeHtml(item.rating) + '</em></span>' +
                '</a>';
        }).join("");
    }

    function escapeHtml(text) {
        return String(text || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    ready(function () {
        initNav();
        initHero();
        initPageFilter();
        initSearchPage();
    });
})();
