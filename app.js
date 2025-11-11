// 1. إخبار تيليجرام أن التطبيق جاهز
try {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand(); 
} catch (e) {
    console.error("Telegram WebApp API not available.", e);
}

// 2. إعداد العناصر
const video = document.getElementById('videoPlayer');
const iframe = document.getElementById('iframePlayer');
const messageDiv = document.getElementById('message');

// 3. جلب الروابط من الـ URL
const params = new URLSearchParams(window.location.search);
const streamUrl = params.get('stream_url');
const iframeUrl = params.get('iframe_url');

// 4. منطق التشغيل الهجين
if (streamUrl) {
    // الحالة 1: وجدنا رابط نظيف (m3u8)
    console.log("HLS stream found:", streamUrl);
    video.style.display = 'block';
    messageDiv.innerText = '... جاري تحميل البث النظيف ...';
    messageDiv.style.display = 'block';

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(decodeURIComponent(streamUrl));
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            messageDiv.style.display = 'none';
            video.play();
        });
        hls.on(Hls.Events.ERROR, function(event, data) {
            messageDiv.innerText = "❌ فشل تحميل البث (m3u8).";
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = decodeURIComponent(streamUrl);
        video.addEventListener('loadedmetadata', function() {
            messageDiv.style.display = 'none';
            video.play();
        });
        video.addEventListener('error', function() {
            messageDiv.innerText = "❌ فشل تحميل البث (native).";
        });
    } else {
        messageDiv.innerText = "❌ HLS not supported.";
    }

} else if (iframeUrl) {
    // الحالة 2: وجدنا رابط مشغل (iframe)
    console.log("Iframe URL found:", iframeUrl);
    iframe.style.display = 'block';
    iframe.src = decodeURIComponent(iframeUrl);

} else {
    // الحالة 3: لا يوجد رابط
    console.error("No stream_url or iframe_url parameter found.");
    messageDiv.style.display = 'block';
    messageDiv.innerText = "❌ لم يتم العثور على رابط.";
}
