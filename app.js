// 1. إخبار تيليجرام أن التطبيق جاهز
try {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand(); // محاولة تكبير النافذة
} catch (e) {
    console.error("Telegram WebApp API not available.", e);
}

// 2. إعداد العناصر
const video = document.getElementById('videoPlayer');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// 3. جلب رابط البث من الـ URL
const params = new URLSearchParams(window.location.search);
const streamUrl = params.get('stream_url');

// 4. منطق التشغيل
if (streamUrl) {
    loadingDiv.style.display = 'block';
    
    if (Hls.isSupported()) {
        // إذا كان المتصفح يدعم HLS
        console.log("HLS.js is supported. Loading stream:", streamUrl);
        const hls = new Hls();
        hls.loadSource(decodeURIComponent(streamUrl));
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            loadingDiv.style.display = 'none';
            video.play();
        });

        hls.on(Hls.Events.ERROR, function(event, data) {
            console.error('HLS Error:', data);
            loadingDiv.style.display = 'none';
            errorDiv.style.display = 'block';
        });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // إذا كان المتصفح يدعم HLS أصلاً (مثل Safari على آيفون)
        console.log("Native HLS supported. Loading stream:", streamUrl);
        video.src = decodeURIComponent(streamUrl);
        
        video.addEventListener('loadedmetadata', function() {
            loadingDiv.style.display = 'none';
            video.play();
        });

        video.addEventListener('error', function() {
            loadingDiv.style.display = 'none';
            errorDiv.style.display = 'block';
        });

    } else {
        // إذا لم يكن HLS مدعوماً
        console.error("HLS not supported.");
        loadingDiv.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.innerText = "❌ HLS not supported on this device.";
    }
} else {
    // إذا لم يتم تمرير رابط
    console.error("No stream_url parameter found.");
    errorDiv.style.display = 'block';
    errorDiv.innerText = "❌ لم يتم العثور على رابط البث.";
}
