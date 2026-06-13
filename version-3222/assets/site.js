(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      if (!slides.length) {
        return;
      }
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          restart();
        });
      });
      restart();
    });
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function filterCards(input) {
    var targetId = input.getAttribute("data-filter-target");
    var list = targetId ? document.getElementById(targetId) : input.closest("main");
    if (!list) {
      return;
    }
    var query = normalize(input.value);
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-keywords]"));
    var visible = 0;
    cards.forEach(function (card) {
      var keywords = normalize(card.getAttribute("data-keywords"));
      var match = !query || keywords.indexOf(query) !== -1;
      card.classList.toggle("is-hidden", !match);
      if (match) {
        visible += 1;
      }
    });
    var empty = document.querySelector("[data-empty-state]");
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  function setupFilters() {
    var params = new URLSearchParams(window.location.search);
    document.querySelectorAll("[data-card-filter]").forEach(function (input) {
      var key = input.getAttribute("data-url-query");
      if (key && params.get(key)) {
        input.value = params.get(key);
      }
      input.addEventListener("input", function () {
        filterCards(input);
      });
      filterCards(input);
    });
    document.querySelectorAll("[data-filter-chip]").forEach(function (button) {
      button.addEventListener("click", function () {
        var panel = button.closest(".filter-panel");
        var input = panel ? panel.querySelector("[data-card-filter]") : document.querySelector("[data-card-filter]");
        if (input) {
          input.value = button.getAttribute("data-filter-chip") || "";
          filterCards(input);
        }
      });
    });
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player-frame]").forEach(function (frame) {
      var video = frame.querySelector("video[data-stream]");
      var button = frame.querySelector("[data-player-start]");
      if (!video) {
        return;
      }
      var hlsInstance = null;

      function attachStream() {
        var streamUrl = video.getAttribute("data-stream");
        if (!streamUrl || video.getAttribute("data-loaded") === "true") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        video.setAttribute("data-loaded", "true");
      }

      function startPlayback() {
        attachStream();
        frame.classList.add("is-playing");
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {
            frame.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", startPlayback);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener("play", function () {
        frame.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          frame.classList.remove("is-playing");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
