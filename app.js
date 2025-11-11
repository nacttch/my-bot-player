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

// دالة متقدمة لحذف الإعلانات مع التركيز على frs2c.com
function removeAdsAdvanced() {
    // حذف الإعلانات كل 100 مللي ثانية للاستجابة السريعة
    setInterval(() => {
        // البحث عن جميع العناصر في الصفحة
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(element => {
            const tagName = element.tagName.toLowerCase();
            const id = element.id || '';
            const className = element.className || '';
            const style = element.style || '';
            const src = element.src || element.href || element.data || '';
            const innerHTML = element.innerHTML || '';
            const outerHTML = element.outerHTML || '';
            
            // قائمة موسعة بالأنماط والخصائص التي تشير إلى إعلانات
            const isAd = (
                // النطاق المحدد frs2c.com
                src.includes('frs2c.com') ||
                innerHTML.includes('frs2c.com') ||
                outerHTML.includes('frs2c.com') ||
                // العناصر ذات الـ z-index العالي جداً
                style.zIndex === '2147483647' ||
                // العناصر ذات المواقع الثابتة
                style.position === 'fixed' ||
                // العناصر التي تحتوي على كلمات مفتاحية للإعلانات
                id.includes('ad') ||
                id.includes('ads') ||
                id.includes('container-') ||
                id.includes('frs2c') ||
                className.includes('ad') ||
                className.includes('ads') ||
                className.includes('container-') ||
                className.includes('frs2c') ||
                src.includes('ads') ||
                src.includes('ad.') ||
                src.includes('doubleclick') ||
                src.includes('googleads') ||
                // العناصر التي تغطي الشاشة
                (style.width === '100%' && style.height === '100%' && style.position === 'fixed') ||
                (style.inset === '0px' && style.position === 'fixed') ||
                (style.bottom === '0px' && style.position === 'fixed') ||
                (style.top === '0px' && style.position === 'fixed')
            );
            
            if (isAd) {
                console.log('🚫 تم حذف إعلان:', element);
                element.remove();
                return;
            }
            
            // حذف العناصر التي تحتوي على نصوص إعلانية
            const adTexts = ['Advertisement', 'Ads', 'الإعلانات', 'إعلان', 'advertisement'];
            const elementText = element.textContent || element.innerText || '';
            if (adTexts.some(adText => elementText.includes(adText))) {
                console.log('🚫 تم حذف إعلان نصي:', element);
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
                src.includes('frs2c.com') ||
                src.includes('ads') ||
                src.includes('ad.') ||
                src.includes('doubleclick') ||
                src.includes('googleads') ||
                id.includes('ad') ||
                id.includes('ads') ||
                id.includes('container-') ||
                id.includes('frs2c') ||
                className.includes('ad') ||
                className.includes('ads') ||
                className.includes('container-') ||
                className.includes('frs2c') ||
                style.zIndex === '2147483647' ||
                (style.position === 'fixed' && (style.bottom === '0px' || style.top === '0px' || style.inset === '0px'))
            );
            
            if (isAdIframe) {
                console.log('🚫 تم حذف iframe إعلاني:', iframe);
                iframe.remove();
            }
        });
        
        // حذف scripts التي قد تحمل إعلانات
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            const src = script.src || '';
            const content = script.textContent || script.innerHTML || '';
            
            if (src.includes('frs2c.com') || content.includes('frs2c.com') || 
                src.includes('ads') || content.includes('ad.')) {
                console.log('🚫 تم حذف script إعلاني:', script);
                script.remove();
            }
        });
        
    }, 100); // فحص أسرع كل 100 مللي ثانية
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
    
    // بدء مراقبة وحذف الإعلانات المتقدمة
    removeAdsAdvanced();
    
    // إضافة MutationObserver لاكتشاف العناصر الجديدة بشكل فوري
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // عنصر HTML
                    checkAndRemoveAdsImmediately(node);
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'id', 'src']
    });

} else {
    // الحالة 3: لا يوجد رابط
    console.error("No stream_url or iframe_url parameter found.");
    messageDiv.style.display = 'block';
    messageDiv.innerText = "❌ لم يتم العثور على رابط.";
}

// دالة فورية للتحقق من العناصر الجديدة وحذف الإعلانات
function checkAndRemoveAdsImmediately(element) {
    const tagName = element.tagName.toLowerCase();
    const id = element.id || '';
    const className = element.className || '';
    const style = element.style || '';
    const src = element.src || element.href || element.data || '';
    const innerHTML = element.innerHTML || '';
    const outerHTML = element.outerHTML || '';
    
    const isAd = (
        src.includes('frs2c.com') ||
        innerHTML.includes('frs2c.com') ||
        outerHTML.includes('frs2c.com') ||
        style.zIndex === '2147483647' ||
        style.position === 'fixed' ||
        id.includes('ad') ||
        id.includes('ads') ||
        id.includes('container-') ||
        id.includes('frs2c') ||
        className.includes('ad') ||
        className.includes('ads') ||
        className.includes('container-') ||
        className.includes('frs2c') ||
        src.includes('ads') ||
        src.includes('ad.') ||
        src.includes('doubleclick') ||
        src.includes('googleads') ||
        (style.width === '100%' && style.height === '100%' && style.position === 'fixed') ||
        (style.inset === '0px' && style.position === 'fixed')
    );
    
    if (isAd) {
        console.log('🚫 تم حذف إعلان جديد فورياً:', element);
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
            const childSrc = child.src || child.href || child.data || '';
            const childInnerHTML = child.innerHTML || '';
            
            const childIsAd = (
                childSrc.includes('frs2c.com') ||
                childInnerHTML.includes('frs2c.com') ||
                childStyle.zIndex === '2147483647' ||
                childStyle.position === 'fixed' ||
                childId.includes('ad') ||
                childId.includes('ads') ||
                childId.includes('container-') ||
                childId.includes('frs2c') ||
                childClassName.includes('ad') ||
                childClassName.includes('ads') ||
                childClassName.includes('container-') ||
                childClassName.includes('frs2c') ||
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

// منع تحميل أي مورد من frs2c.com
const originalAppendChild = Element.prototype.appendChild;
Element.prototype.appendChild = function(child) {
    if (child.src && child.src.includes('frs2c.com')) {
        console.log('🚫 تم منع تحميل مورد إعلاني:', child);
        return child;
    }
    return originalAppendChild.apply(this, arguments);
};

// منع أي طلبات شبكية إلى frs2c.com
const originalFetch = window.fetch;
window.fetch = function(...args) {
    if (args[0] && args[0].includes('frs2c.com')) {
        console.log('🚫 تم منع طلب شبكي إلى:', args[0]);
        return Promise.reject(new Error('Blocked ad request'));
    }
    return originalFetch.apply(this, args);
};
