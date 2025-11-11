// 1. إخبار تيليجرام أن التطبيق جاهز
try {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand(); 
} catch (e) {
    console.error("Telegram WebApp API not available.", e);
}

// 2. إعداد العناصر
// لم نعد بحاجة لـ videoPlayer
const iframe = document.getElementById('iframePlayer');
const messageDiv = document.getElementById('message');

// 3. جلب الروابط من الـ URL
const params = new URLSearchParams(window.location.search);
// لم نعد بحاجة لـ streamUrl
const iframeUrl = params.get('iframe_url');

// 4. منطق التشغيل (Iframe فقط)
if (iframeUrl) {
    // الحالة 1: وجدنا رابط مشغل (iframe)
    console.log("Iframe URL found:", iframeUrl);
    messageDiv.style.display = 'none'; // إخفاء رسالة التحميل
    iframe.style.display = 'block'; // إظهار المشغل
    iframe.src = decodeURIComponent(iframeUrl);

} else {
    // الحالة 2: لا يوجد رابط
    console.error("No iframe_url parameter found.");
    messageDiv.style.display = 'block';
    messageDiv.innerText = "❌ لم يتم العثور على رابط.";
}

// تم حذف القوس الإضافي الذي كان يسبب الخطأ
