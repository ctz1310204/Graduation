// ==========================================================================
// CONFIGURATION
// ==========================================================================
// Thay thế URL này bằng URL Triển khai mới (Web App URL) từ Google Apps Script của bạn
const SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE';

// Ngày diễn ra lễ tốt nghiệp (Định dạng: YYYY-MM-DDTHH:mm:ss)
const GRADUATION_DATE = new Date('2026-07-16T08:00:00').getTime();

// ==========================================================================
// DOM ELEMENTS
// ==========================================================================
const rsvpForm = document.getElementById('rsvp-form');
const btnSubmit = document.getElementById('btn-submit');
const btnText = btnSubmit.querySelector('.btn-text');
const spinner = btnSubmit.querySelector('.spinner');
const formFeedback = document.getElementById('form-feedback');
const feedbackMessage = document.getElementById('feedback-message');
const successIcon = formFeedback.querySelector('.success-icon');
const errorIcon = formFeedback.querySelector('.error-icon');
const guestsGroup = document.getElementById('guests-group');
const statusRadios = document.querySelectorAll('input[name="status"]');

// ==========================================================================
// COUNTDOWN TIMER LOGIC
// ==========================================================================
function updateCountdown() {
    const now = new Date().getTime();
    const timeRemaining = GRADUATION_DATE - now;

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (timeRemaining <= 0) {
        clearInterval(countdownInterval);
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        document.querySelector('.countdown-title').textContent = 'Buổi lễ tốt nghiệp đã diễn ra!';
        return;
    }

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
}

// Chạy đếm ngược ngay lập tức và thiết lập chu kỳ 1 giây
updateCountdown();
const countdownInterval = setInterval(updateCountdown, 1000);

// ==========================================================================
// INTERACTIVE FORM BEHAVIORS
// ==========================================================================
// Ẩn/Hiện số lượng người đi cùng dựa trên trạng thái tham gia
statusRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'Rất tiếc, mình không thể đến') {
            guestsGroup.classList.add('hidden');
            // Reset số lượng người đi cùng về 0
            document.getElementById('guest-count').value = '0';
        } else {
            guestsGroup.classList.remove('hidden');
        }
    });
});

// ==========================================================================
// FORM SUBMISSION TO GOOGLE SHEETS
// ==========================================================================
rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Kiểm tra cấu hình URL Apps Script
    if (SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE') {
        showFeedback(
            'Lỗi cấu hình: Vui lòng triển khai Google Apps Script và dán Web App URL của bạn vào đầu file `app.js` trước khi gửi.', 
            'error'
        );
        return;
    }

    // 2. Trạng thái Loading
    setLoadingState(true);
    hideFeedback();

    // 3. Thu thập dữ liệu
    const formData = new FormData(rsvpForm);
    const payload = {
        name: formData.get('name').trim(),
        phone: formData.get('phone').trim(),
        status: formData.get('status'),
        guests: formData.get('status') === 'Rất tiếc, mình không thể đến' ? '0' : formData.get('guests'),
        message: formData.get('message').trim()
    };

    try {
        // Gửi dữ liệu dưới dạng text/plain để tránh CORS Preflight OPTIONS phức tạp của Apps Script
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.result === 'success') {
            showFeedback('Cảm ơn bạn! Thông tin xác nhận của bạn đã được ghi nhận thành công.', 'success');
            rsvpForm.reset();
            // Reset hiển thị số lượng người đi cùng
            guestsGroup.classList.remove('hidden');
        } else {
            throw new Error(result.message || 'Không thể lưu dữ liệu vào Google Sheet.');
        }

    } catch (err) {
        console.error('RSVP Submit Error:', err);
        showFeedback(
            'Không thể gửi thông tin. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau ít phút.', 
            'error'
        );
    } finally {
        setLoadingState(false);
    }
});

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================
function setLoadingState(isLoading) {
    if (isLoading) {
        btnSubmit.disabled = true;
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
    } else {
        btnSubmit.disabled = false;
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

function showFeedback(message, type) {
    feedbackMessage.textContent = message;
    formFeedback.className = `form-feedback ${type}`;
    
    if (type === 'success') {
        successIcon.classList.remove('hidden');
        errorIcon.classList.add('hidden');
    } else {
        successIcon.classList.add('hidden');
        errorIcon.classList.remove('hidden');
    }
    
    formFeedback.classList.remove('hidden');
    
    // Tự động cuộn xuống phần thông báo để khách dễ nhìn
    formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideFeedback() {
    formFeedback.classList.add('hidden');
}
