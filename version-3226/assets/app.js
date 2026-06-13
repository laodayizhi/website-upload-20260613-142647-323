document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-dot]'));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    show(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
  });

  document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var empty = scope.querySelector('[data-empty-state]');
    var container = scope.parentElement || document;
    var items = Array.prototype.slice.call(container.querySelectorAll('[data-search-item]'));

    if (!input || !items.length) {
      return;
    }

    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      var visible = 0;

      items.forEach(function (item) {
        var haystack = [
          item.getAttribute('data-title') || '',
          item.getAttribute('data-genre') || '',
          item.getAttribute('data-tags') || '',
          item.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var matched = haystack.indexOf(value) !== -1;
        item.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    });
  });

  var attached = new WeakMap();

  function playWithStream(button) {
    var shell = button.closest('[data-player-shell]');
    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var stream = button.getAttribute('data-stream');

    if (!video || !stream) {
      return;
    }

    button.classList.add('is-hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== stream) {
        video.src = stream;
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = attached.get(video);
      if (!hls) {
        hls = new window.Hls();
        attached.set(video, hls);
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.play().catch(function () {});
      }
      return;
    }

    if (video.src !== stream) {
      video.src = stream;
    }
    video.play().catch(function () {});
  }

  document.querySelectorAll('[data-player-button]').forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      playWithStream(button);
    });
  });

  document.querySelectorAll('[data-player-shell]').forEach(function (shell) {
    shell.addEventListener('click', function (event) {
      if (event.target.closest('[data-player-button]')) {
        return;
      }
      var button = shell.querySelector('[data-player-button]');
      if (button && !button.classList.contains('is-hidden')) {
        playWithStream(button);
      }
    });
  });
});
