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

// دالة لحذف الإعلانات
function removeAds() {
    // حذف الإعلانات كل 500 مللي ثانية
    setInterval(() => {
        // البحث عن جميع العناصر التي قد تكون إعلانات
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(element => {
            const tagName = element.tagName.toLowerCase();
            const id = element.id || '';
            const className = element.className || '';
            const style = element.style || '';
            const src = element.src || '';
            
            // قائمة بالأنماط والخصائص التي تشير إلى إعلانات
            const isAd = (
                // العناصر ذات الـ z-index العالي جداً
                style.zIndex === '2147483647' ||
                // العناصر ذات المواقع الثابتة
                style.position === 'fixed' ||
                // العناصر التي تحتوي على كلمات مفتاحية للإعلانات
                id.includes('ad') ||
                id.includes('ads') ||
                id.includes('container-') ||
                className.includes('ad') ||
                className.includes('ads') ||
                className.includes('container-') ||
                src.includes('ads') ||
                src.includes('ad.') ||
                src.includes('doubleclick') ||
                src.includes('googleads') ||
                // العناصر التي تغطي الشاشة
                (style.width === '100%' && style.height === '100%' && style.position === 'fixed') ||
                (style.inset === '0px' && style.position === 'fixed')
            );
            
            if (isAd) {
                console.log('🚫 تم حذف إعلان:', element);
                element.remove();
            }
        });
        
        // حذف الـ iframes الإعلانية بشكل خاص
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            const src = iframe.src || '';
            const id = iframe.id || '';
            const className = iframe.className || '';
            const style = iframe.style || '';
            
            const isAdIframe = (
                src.includes('ads') ||
                src.includes('ad.') ||
                src.includes('doubleclick') ||
                src.includes('googleads') ||
                id.includes('ad') ||
                id.includes('ads') ||
                id.includes('container-') ||
                className.includes('ad') ||
                className.includes('ads') ||
                className.includes('container-') ||
                style.zIndex === '2147483647' ||
                (style.position === 'fixed' && (style.bottom === '0px' || style.top === '0px' || style.inset === '0px'))
            );
            
            if (isAdIframe) {
                console.log('🚫 تم حذف iframe إعلاني:', iframe);
                iframe.remove();
            }
        });
    }, 500);
}

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
    
    // بدء مراقبة وحذف الإعلانات
    removeAds();
    
    // إضافة MutationObserver لاكتشاف العناصر الجديدة
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // عنصر HTML
                    checkAndRemoveAds(node);
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

} else {
    // الحالة 3: لا يوجد رابط
    console.error("No stream_url or iframe_url parameter found.");
    messageDiv.style.display = 'block';
    messageDiv.innerText = "❌ لم يتم العثور على رابط.";
}

// دالة مساعدة للتحقق من العناصر الجديدة وحذف الإعلانات
function checkAndRemoveAds(element) {
    const tagName = element.tagName.toLowerCase();
    const id = element.id || '';
    const className = element.className || '';
    const style = element.style || '';
    const src = element.src || '';
    
    const isAd = (
        style.zIndex === '2147483647' ||
        style.position === 'fixed' ||
        id.includes('ad') ||
        id.includes('ads') ||
        id.includes('container-') ||
        className.includes('ad') ||
        className.includes('ads') ||
        className.includes('container-') ||
        src.includes('ads') ||
        src.includes('ad.') ||
        src.includes('doubleclick') ||
        src.includes('googleads') ||
        (style.width === '100%' && style.height === '100%' && style.position === 'fixed') ||
        (style.inset === '0px' && style.position === 'fixed')
    );
    
    if (isAd) {
        console.log('🚫 تم حذف إعلان جديد:', element);
        element.remove();
        return;
    }
    
    // التحقق من العناصر الفرعية أيضاً
    if (element.querySelectorAll) {
        const childAds = element.querySelectorAll('*');
        childAds.forEach(child => {
            const childId = child.id || '';
            const childClassName = child.className || '';
            const childStyle = child.style || '';
            const childSrc = child.src || '';
            
            const childIsAd = (
                childStyle.zIndex === '2147483647' ||
                childStyle.position === 'fixed' ||
                childId.includes('ad') ||
                childId.includes('ads') ||
                childId.includes('container-') ||
                childClassName.includes('ad') ||
                childClassName.includes('ads') ||
                childClassName.includes('container-') ||
                childSrc.includes('ads') ||
                childSrc.includes('ad.') ||
                childSrc.includes('doubleclick') ||
                childSrc.includes('googleads')
            );
            
            if (childIsAd) {
                console.log('🚫 تم حذف إعلان فرعي:', child);
                child.remove();
            }
        });
    }
}
