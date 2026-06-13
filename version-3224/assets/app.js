document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  var players = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

  players.forEach(function (shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".player-start");
    var loaded = false;
    var hls = null;

    function attachStream() {
      if (!video || loaded) {
        return;
      }

      var stream = video.getAttribute("data-stream");

      if (!stream) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      loaded = true;
    }

    function play() {
      attachStream();

      if (!video) {
        return;
      }

      var action = video.paused ? video.play() : Promise.resolve();

      if (action && typeof action.then === "function") {
        action.then(function () {
          shell.classList.add("is-playing");
        }).catch(function () {
          shell.classList.remove("is-playing");
        });
      } else {
        shell.classList.add("is-playing");
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });

  var searchMount = document.querySelector("[data-search-results]");

  if (searchMount && typeof catalogItems !== "undefined") {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector(".search-hero input[name='q']");
    var status = document.querySelector("[data-search-status]");

    if (input) {
      input.value = query;
    }

    var normalized = query.toLowerCase();
    var results = normalized ? catalogItems.filter(function (item) {
      return item.text.toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 120) : catalogItems.slice(0, 40);

    if (status) {
      status.textContent = query ? "关键词：" + query : "输入片名、类型、年份或地区，快速查找内容";
    }

    searchMount.innerHTML = "";

    if (!results.length) {
      var empty = document.createElement("p");
      empty.className = "search-status";
      empty.textContent = "未找到相关内容，可更换关键词继续搜索。";
      searchMount.appendChild(empty);
      return;
    }

    var grid = document.createElement("div");
    grid.className = "movie-list-grid";

    results.forEach(function (item) {
      var article = document.createElement("article");
      article.className = "movie-card";

      var coverLink = document.createElement("a");
      coverLink.className = "poster-wrap";
      coverLink.href = item.file;

      var image = document.createElement("img");
      image.src = item.cover;
      image.alt = item.title;
      image.loading = "lazy";

      var play = document.createElement("span");
      play.className = "poster-play";
      play.textContent = "▶";

      coverLink.appendChild(image);
      coverLink.appendChild(play);

      var body = document.createElement("div");
      body.className = "card-body";

      var title = document.createElement("h3");
      var titleLink = document.createElement("a");
      titleLink.href = item.file;
      titleLink.textContent = item.title;
      title.appendChild(titleLink);

      var intro = document.createElement("p");
      intro.textContent = item.oneLine;

      var meta = document.createElement("div");
      meta.className = "card-meta";

      var year = document.createElement("span");
      year.textContent = item.year;

      var category = document.createElement("a");
      category.href = item.categoryFile;
      category.textContent = item.categoryName;

      meta.appendChild(year);
      meta.appendChild(category);
      body.appendChild(title);
      body.appendChild(intro);
      body.appendChild(meta);
      article.appendChild(coverLink);
      article.appendChild(body);
      grid.appendChild(article);
    });

    searchMount.appendChild(grid);
  }
});
