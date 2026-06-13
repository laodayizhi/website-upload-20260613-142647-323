(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    ready(function () {
        var navToggle = document.querySelector(".nav-toggle");
        var nav = document.getElementById("site-nav");
        if (navToggle && nav) {
            navToggle.addEventListener("click", function () {
                var opened = nav.classList.toggle("is-open");
                navToggle.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var current = 0;
        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var searchInput = document.querySelector("[data-movie-search]");
        if (searchInput) {
            searchInput.addEventListener("input", function () {
                var keyword = searchInput.value.trim().toLowerCase();
                document.querySelectorAll("[data-search]").forEach(function (card) {
                    var source = card.getAttribute("data-search") || "";
                    card.classList.toggle("is-filter-hidden", keyword && source.toLowerCase().indexOf(keyword) === -1);
                });
            });
        }
    });
})();

function initMoviePlayer(source) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("player-overlay");
    var message = document.getElementById("player-message");
    var hls = null;
    var bound = false;

    if (!video || !overlay || !source) {
        return;
    }

    function setMessage(text) {
        if (message) {
            message.textContent = text || "";
        }
    }

    function bindSource() {
        if (bound) {
            return;
        }
        bound = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setMessage("视频加载失败，请稍后重试");
                }
            });
        } else {
            setMessage("当前浏览器暂不支持播放");
        }
    }

    function startPlayback() {
        bindSource();
        overlay.classList.add("is-hidden");
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {
                overlay.classList.remove("is-hidden");
            });
        }
    }

    overlay.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        }
    });
    video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
        if (!video.ended) {
            overlay.classList.remove("is-hidden");
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
