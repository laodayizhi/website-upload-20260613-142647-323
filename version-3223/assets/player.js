(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var blocks = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        blocks.forEach(function (block) {
            var video = block.querySelector('video');
            var trigger = block.querySelector('[data-play-trigger]');
            if (!video) {
                return;
            }
            var stream = video.getAttribute('data-stream');
            var loaded = false;
            var hls = null;

            function load() {
                if (loaded || !stream) {
                    return;
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
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
            }

            function play() {
                load();
                if (trigger) {
                    trigger.classList.add('is-hidden');
                }
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
            }

            if (trigger) {
                trigger.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (trigger) {
                    trigger.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (trigger && video.currentTime === 0) {
                    trigger.classList.remove('is-hidden');
                }
            });
            video.addEventListener('ended', function () {
                if (trigger) {
                    trigger.classList.remove('is-hidden');
                }
            });
            window.addEventListener('pagehide', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    });
})();
