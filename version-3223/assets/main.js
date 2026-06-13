(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initSearchPage();
    });

    function initMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-box]'));
        boxes.forEach(function (box) {
            var input = box.querySelector('.filter-input');
            var grid = box.parentElement ? box.parentElement.querySelector('.movie-grid') : null;
            var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];
            var empty = box.querySelector('[data-empty-state]');
            var active = '';
            var pills = Array.prototype.slice.call(box.querySelectorAll('[data-filter-pill]'));

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                    var region = (card.getAttribute('data-region') || '').toLowerCase();
                    var type = (card.getAttribute('data-type') || '').toLowerCase();
                    var year = (card.getAttribute('data-year') || '').toLowerCase();
                    var pillMatch = !active || active === '全部' || haystack.indexOf(active.toLowerCase()) > -1 || region.indexOf(active.toLowerCase()) > -1 || type.indexOf(active.toLowerCase()) > -1 || year.indexOf(active.toLowerCase()) > -1;
                    var textMatch = !keyword || haystack.indexOf(keyword) > -1 || region.indexOf(keyword) > -1 || type.indexOf(keyword) > -1 || year.indexOf(keyword) > -1;
                    var matched = pillMatch && textMatch;
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }

            pills.forEach(function (pill) {
                pill.addEventListener('click', function () {
                    var value = pill.getAttribute('data-filter-pill') || '';
                    active = active === value ? '' : value;
                    pills.forEach(function (item) {
                        item.classList.toggle('is-active', item === pill && active === value);
                    });
                    apply();
                });
            });
        });
    }

    function initSearchPage() {
        var results = document.getElementById('search-results');
        var empty = document.getElementById('search-empty');
        var input = document.getElementById('search-page-input');
        if (!results || !empty || typeof MOVIES === 'undefined') {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input) {
            input.value = initial;
            input.addEventListener('input', function () {
                render(input.value);
            });
        }
        render(initial);

        function render(query) {
            var q = (query || '').trim().toLowerCase();
            results.innerHTML = '';
            if (!q) {
                empty.textContent = '输入关键词后显示匹配内容';
                empty.classList.add('is-visible');
                return;
            }
            var matched = MOVIES.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.oneLine,
                    movie.summary,
                    movie.year,
                    movie.type,
                    movie.region,
                    movie.genre,
                    (movie.tags || []).join(' ')
                ].join(' ').toLowerCase();
                return haystack.indexOf(q) > -1;
            }).slice(0, 120);
            matched.forEach(function (movie) {
                results.appendChild(createCard(movie));
            });
            empty.textContent = '未找到匹配内容';
            empty.classList.toggle('is-visible', matched.length === 0);
        }

        function createCard(movie) {
            var article = document.createElement('article');
            article.className = 'movie-card';
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            article.innerHTML = '' +
                '<a href="' + movie.url + '" class="movie-cover">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="cover-shade"></span>' +
                    '<span class="play-chip">播放</span>' +
                '</a>' +
                '<div class="movie-info">' +
                    '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
                    '<div class="meta-row"><span>' + escapeHtml(movie.type || '') + '</span><span>' + escapeHtml(movie.year || '') + '</span><span>' + escapeHtml(movie.region || '') + '</span></div>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>';
            return article;
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"]/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[char];
            });
        }
    }
})();
