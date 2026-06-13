function initMoviePlayer(source) {
    var video = document.getElementById("movie-video");
    var button = document.getElementById("movie-play-button");
    var attached = false;
    var hlsInstance = null;

    function attach() {
        if (attached || !video || !source) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function begin() {
        attach();
        if (button) {
            button.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
            playPromise.catch(function () {});
        }
    }

    if (!video) {
        return;
    }

    if (button) {
        button.addEventListener("click", begin);
    }

    video.addEventListener("click", function () {
        if (!attached || video.paused) {
            begin();
        }
    });

    video.addEventListener("play", function () {
        if (button) {
            button.classList.add("is-hidden");
        }
    });

    video.addEventListener("emptied", function () {
        if (hlsInstance && hlsInstance.destroy) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
        attached = false;
    });
}
