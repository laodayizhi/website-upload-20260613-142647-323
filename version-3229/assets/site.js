(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.mobile-nav');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            menu.hidden = !open;
        });
    }

    function initHero() {
        var stage = document.querySelector('.hero-stage');
        if (!stage) {
            return;
        }
        var slides = Array.prototype.slice.call(stage.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(stage.querySelectorAll('.hero-dot'));
        var prev = stage.querySelector('.hero-prev');
        var next = stage.querySelector('.hero-next');
        var index = 0;
        var timer = null;
        function show(to) {
            if (!slides.length) {
                return;
            }
            index = (to + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function schedule() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                schedule();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                schedule();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                schedule();
            });
        }
        show(0);
        schedule();
    }

    function resultItem(item) {
        return '<a class="search-item" href="' + item.url + '">' +
            '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">' +
            '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.meta) + '</span></span>' +
            '</a>';
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function (char) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char];
        });
    }

    function initGlobalSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('.global-search'));
        if (!inputs.length || !window.SEARCH_INDEX) {
            return;
        }
        inputs.forEach(function (input) {
            var panel = input.parentElement.querySelector('.search-panel');
            if (!panel) {
                return;
            }
            input.addEventListener('input', function () {
                var q = input.value.trim().toLowerCase();
                if (!q) {
                    panel.hidden = true;
                    panel.innerHTML = '';
                    return;
                }
                var results = window.SEARCH_INDEX.filter(function (item) {
                    return item.title.toLowerCase().indexOf(q) > -1 || item.meta.toLowerCase().indexOf(q) > -1;
                }).slice(0, 12);
                panel.innerHTML = results.length ? results.map(resultItem).join('') : '<div class="search-item"><span><strong>暂无匹配内容</strong><span>换个关键词试试</span></span></div>';
                panel.hidden = false;
            });
            input.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    var first = panel.querySelector('a');
                    if (first) {
                        event.preventDefault();
                        window.location.href = first.href;
                    }
                }
            });
            document.addEventListener('click', function (event) {
                if (!input.parentElement.contains(event.target)) {
                    panel.hidden = true;
                }
            });
        });
    }

    function initCatalogFilter() {
        var toolbar = document.querySelector('.catalog-toolbar');
        if (!toolbar) {
            return;
        }
        var search = toolbar.querySelector('.category-search');
        var year = toolbar.querySelector('.category-year');
        var type = toolbar.querySelector('.category-type');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.catalog-grid .movie-card'));
        function apply() {
            var q = search ? search.value.trim().toLowerCase() : '';
            var y = year ? year.value : '';
            var t = type ? type.value : '';
            cards.forEach(function (card) {
                var title = (card.getAttribute('data-title') || '').toLowerCase();
                var genre = (card.getAttribute('data-genre') || '').toLowerCase();
                var region = (card.getAttribute('data-region') || '').toLowerCase();
                var okQ = !q || title.indexOf(q) > -1 || genre.indexOf(q) > -1 || region.indexOf(q) > -1;
                var okY = !y || card.getAttribute('data-year') === y;
                var okT = !t || card.getAttribute('data-type') === t;
                card.hidden = !(okQ && okY && okT);
            });
        }
        [search, year, type].forEach(function (el) {
            if (el) {
                el.addEventListener('input', apply);
                el.addEventListener('change', apply);
            }
        });
    }

    function attachPlayer(videoId, coverId, buttonId, url) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var button = document.getElementById(buttonId);
        if (!video || !url) {
            return;
        }
        function load() {
            if (video.__loaded) {
                return;
            }
            video.__loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                video.__hls = hls;
            } else {
                video.src = url;
            }
        }
        function start() {
            load();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        }
        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                start();
            });
        }
        if (cover) {
            cover.addEventListener('click', start);
            cover.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    start();
                }
            });
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    }

    window.MovieSite = {
        attachPlayer: attachPlayer
    };

    ready(function () {
        initMenu();
        initHero();
        initGlobalSearch();
        initCatalogFilter();
    });
})();
