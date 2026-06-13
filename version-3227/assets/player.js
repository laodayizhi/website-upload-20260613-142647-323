function initializeMoviePlayer(source) {
    var video = document.getElementById("movie-player");
    var button = document.getElementById("movie-play-button");
    var frame = document.getElementById("movie-player-frame");
    var loaded = false;

    if (!video || !source) {
        return;
    }

    function bindSource() {
        if (loaded) {
            return;
        }
        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function startPlayback() {
        bindSource();
        if (frame) {
            frame.classList.add("is-playing");
        }
        var action = video.play();
        if (action && typeof action.catch === "function") {
            action.catch(function () {});
        }
    }

    bindSource();

    if (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            startPlayback();
        });
    }

    video.addEventListener("play", function () {
        if (frame) {
            frame.classList.add("is-playing");
        }
    });

    video.addEventListener("pause", function () {
        if (frame && video.currentTime === 0) {
            frame.classList.remove("is-playing");
        }
    });
}
