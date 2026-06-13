(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dotsWrap = hero.querySelector('[data-hero-dots]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            Array.prototype.slice.call(dotsWrap.querySelectorAll('button')).forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function run() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (dotsWrap) {
            slides.forEach(function (_, i) {
                var dot = document.createElement('button');
                dot.className = 'hero-dot';
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换到第' + (i + 1) + '屏');
                dot.addEventListener('click', function () {
                    show(i);
                    run();
                });
                dotsWrap.appendChild(dot);
            });
            show(0);
            run();
        }
    }

    var input = document.querySelector('[data-search-input]');
    if (input) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-empty-state]');
        input.addEventListener('input', function () {
            var value = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-keywords') || card.textContent || '').toLowerCase();
                var matched = !value || haystack.indexOf(value) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        });
    }
})();
