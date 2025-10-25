// Elemanlar
const timeline = document.querySelector('.timeline');
const lineLayer = document.querySelector('.line-layer');
const events = Array.from(document.querySelectorAll('.event'));
const star = document.getElementById('progress-star');

const popup = document.getElementById('popup');
const popupTitle = document.getElementById('popup-title');
const popupDesc = document.getElementById('popup-desc');
const closeBtn = document.getElementById('close');

// === Yardımcılar ===
// Daire merkezlerini timeline'a göre ölç (scroll'dan bağımsız, layout güvenli)
function getCenters() {
    return events.map(ev => {
        const circle = ev.querySelector('.circle');
        return ev.offsetLeft + circle.offsetLeft + (circle.offsetWidth / 2);
    });
}

// Segmentleri çiz (gri+ kırmızı dolgu)
function drawSegments() {
    const centers = getCenters();
    lineLayer.innerHTML = '';
    for (let i = 0; i < centers.length - 1; i++) {
        const left = centers[i];
        const width = Math.max(0, centers[i + 1] - centers[i]);

        const seg = document.createElement('div');
        seg.className = 'seg';
        seg.style.left = `${left}px`;
        seg.style.width = `${width}px`;

        const fill = document.createElement('div');
        fill.className = 'fill';
        seg.appendChild(fill);

        lineLayer.appendChild(seg);
    }
}

// Belirli index'e kadar segmentleri doldur
function fillToIndex(index) {
    const segs = Array.from(lineLayer.querySelectorAll('.seg'));
    segs.forEach((seg, i) => {
        if (i < index - 1) seg.classList.add('active');
        else seg.classList.remove('active');
    });
}

// Yıldızı x konumuna taşı (çizgi üstünde, absolute)
function moveStarToX(x) {
    // yıldız çizgiden asla taşmasın
    const minX = getCenters()[0];
    const maxX = getCenters().slice(-1)[0];
    const clamped = Math.max(minX, Math.min(maxX, x));
    star.style.transform = `translateX(${clamped}px)`;

    // hafif glow trail
    star.animate(
        [{ filter: 'drop-shadow(0 0 14px #ff0000)' }, { filter: 'drop-shadow(0 0 4px #ff4444)' }],
        { duration: 350, easing: 'ease-out' }
    );
}

// Index'e taşı ve doldur
function goToIndex(index) {
    const centers = getCenters();
    const x = centers[index - 1];
    moveStarToX(x);
    fillToIndex(index);
}

// === Etkileşimler ===
// Olay tıklama → popup + yıldız taşı + çizgileri doldur
events.forEach(ev => {
    ev.addEventListener('click', () => {
        events.forEach(e => e.classList.remove('active'));
        ev.classList.add('active');
        popupTitle.textContent = ev.dataset.title;
        popupDesc.textContent = ev.dataset.desc;
        popup.classList.remove('hidden');
        popup.classList.remove('fadeOut');

        const i = parseInt(ev.dataset.index, 10);
        goToIndex(i);
    });
});

// Popup kapama
closeBtn.addEventListener('click', () => {
    popup.classList.add('fadeOut');
    setTimeout(() => popup.classList.add('hidden'), 300);
});
popup.addEventListener('click', e => { if (e.target === popup) closeBtn.click(); });

// PC: mouse ile çizgi üzerinde yıldızı gezdir (sadece yıldız, dolgu sabit)
const prefersFinePointer = window.matchMedia('(pointer: fine)').matches;
if (prefersFinePointer) {
    timeline.addEventListener('mousemove', e => {
        const rect = timeline.getBoundingClientRect();
        const x = e.clientX - rect.left + timeline.scrollLeft; // içerik koordinatı
        moveStarToX(x);
    });
}

// Görünümde fade-in
const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('visible'); });
}, { threshold: 0.2 });
events.forEach(ev => io.observe(ev));

// Layout değiştiğinde segmentleri yeniden hesapla
function relayout() {
    drawSegments();
    // başlangıçta ilk olaya hizala
    moveStarToX(getCenters()[0]);
}
window.addEventListener('resize', relayout, { passive: true });
window.addEventListener('load', relayout);
setTimeout(relayout, 0); // font/ölçüm stabilizasyonu
