(function () {
    function bind(shell) {
        var video = shell.querySelector('video');
        var layer = shell.querySelector('.play-layer');
        if (!video || !layer) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var ready = false;
        var hls = null;

        function load() {
            if (ready || !stream) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
            ready = true;
        }

        function start() {
            load();
            layer.classList.add('is-hidden');
            video.controls = true;
            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {
                    layer.classList.remove('is-hidden');
                });
            }
        }

        layer.addEventListener('click', start);
        video.addEventListener('click', load);
        video.addEventListener('play', function () {
            layer.classList.add('is-hidden');
        });
        video.addEventListener('ended', function () {
            layer.classList.remove('is-hidden');
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(bind);
})();
