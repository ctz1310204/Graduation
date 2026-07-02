/* ============================================
   GRADUATION — Chu Tâm Vũ
   Minimalist · Gold Accent · Grain
   ============================================ */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

// 🔧 Thay URL này bằng URL Google Apps Script Web App của bạn
const SCRIPT_URL = '';
const EVENT = new Date('2026-07-05T10:00:00+07:00');

/* ---- Toast ---- */
function toast(msg) {
    const t = $('.toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ---- Progress Bar ---- */
(function initProgress() {
    const bar = $('.progress span');
    if (!bar) return;
    const up = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.width = max > 0 ? Math.min(scrollY / max * 100, 100) + '%' : '0%';
    };
    addEventListener('scroll', up, { passive: true });
    up();
})();

/* ---- Reveal ---- */
(function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('visible')); return; }
    const ob = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); ob.unobserve(e.target); } });
    }, { threshold: .1 });
    items.forEach(i => ob.observe(i));
})();

/* ---- Countdown ---- */
function tick() {
    const d = Math.max(EVENT - Date.now(), 0);
    const days = Math.floor(d / 864e5);
    const hrs  = Math.floor(d % 864e5 / 36e5);
    const mins = Math.floor(d % 36e5 / 6e4);
    const secs = Math.floor(d % 6e4 / 1e3);

    const set = (sel, v) => { const el = $(sel); if (el) el.textContent = String(v).padStart(2, '0'); };
    set('[data-days]', days);
    set('[data-hours]', hrs);
    set('[data-minutes]', mins);
    set('[data-seconds]', secs);

    if (d <= 0) {
        const cd = $('.countdown');
        if (cd) cd.innerHTML = '<p style="font-family:var(--display);font-size:1rem;font-weight:700;color:var(--gold);letter-spacing:.1em;text-transform:uppercase">🎓 Buổi lễ đã diễn ra!</p>';
    }
}
tick();
setInterval(tick, 1000);

/* ---- RSVP ---- */
(function initRSVP() {
    const form = $('#rsvp-form');
    const btn = $('#submit-btn');
    if (!form) return;

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const name = $('#guest-name').value.trim();
        const att = form.querySelector('input[name="attendance"]:checked');

        if (!name) { toast('Nhập tên của bạn'); return; }
        if (!att) { toast('Chọn xác nhận tham dự'); return; }

        btn.classList.add('loading');
        btn.disabled = true;

        try {
            const data = {
                name,
                attendance: att.value,
                timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
            };

            if (SCRIPT_URL) {
                await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                await new Promise(r => setTimeout(r, 900));
                console.log('📋 RSVP (demo):', data);
            }

            btn.classList.remove('loading');
            btn.classList.add('done');

            setTimeout(() => {
                form.style.display = 'none';
                const msg = $('#res-msg');
                if (msg) msg.textContent = att.value === 'Có'
                    ? 'Hẹn gặp bạn tại buổi lễ! 🎉'
                    : 'Cảm ơn bạn đã phản hồi.';
                $('#res-ok').style.display = 'block';
                toast('Đã gửi xác nhận!');
            }, 400);
        } catch (err) {
            console.error(err);
            btn.classList.remove('loading');
            btn.disabled = false;
            form.style.display = 'none';
            $('#res-err').style.display = 'block';
        }
    });
})();

/* ---- Share Invitation ---- */
(function initShare() {
    const shareBtn = $('#share-btn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', async () => {
        const shareData = {
            title: 'Graduation | Chu Tâm Vũ',
            text: 'Trân trọng mời bạn đến chung vui trong ngày tốt nghiệp của Chu Tâm Vũ.',
            url: window.location.origin + window.location.pathname
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                toast('Đã sao chép link liên kết!');
            }
        } catch (err) {
            console.log('Chia sẻ thất bại hoặc bị hủy:', err);
        }
    });
})();

window.resetForm = () => {
    const f = $('#rsvp-form'), b = $('#submit-btn');
    if (!f) return;
    f.reset(); f.style.display = 'block';
    b.classList.remove('loading', 'done'); b.disabled = false;
    $('#res-ok').style.display = 'none';
    $('#res-err').style.display = 'none';
};

/* ---- Smooth Scroll ---- */
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const t = $(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth' });
}));
