// ===================================
// PWA Service Worker 註冊 (離線功能核心)
// ===================================
// 註冊 Service Worker 實現離線功能
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // 註冊 Service Worker。注意路徑必須是根目錄。
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker 註冊成功 with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker 註冊失敗: ', err);
            });
    });
}

// ===================================
// 網站邏輯：按鈕與 Tab 切換
// ===================================
// 確保 DOM (HTML) 完全載入後再執行邏輯
document.addEventListener('DOMContentLoaded', function() {

    // 1. 頁籤切換邏輯 (底部的 Tab 按鈕)
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        // 綁定點擊事件
        button.addEventListener('click', function() {
            // 移除所有按鈕和內容的 active 狀態
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // 為點擊的按鈕和對應的內容加上 active 狀態
            const targetId = this.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);

            this.classList.add('active');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // 2. 「急救」按鈕邏輯 (回穩練習)
    const rescueButton = document.getElementById('rescue-button');
    const statusElement = document.getElementById('rescue-status');
    let timerInterval;
    let isRunning = false;
    const TOTAL_TIME = 30; // 30 秒倒數計時

    if (rescueButton) {
        rescueButton.addEventListener('click', function() {
            if (isRunning) {
                // 停止功能
                clearInterval(timerInterval);
                isRunning = false;
                rescueButton.textContent = '重新開始';
                statusElement.textContent = '暫停回穩。休息一下，再重新開始。';
                rescueButton.classList.remove('running');
            } else {
                // 開始功能
                let timeLeft = TOTAL_TIME;
                isRunning = true;
                rescueButton.textContent = '停止 (30s)';
                rescueButton.classList.add('running');
                statusElement.textContent = '開始回穩練習...';
                
                // 開始倒數計時與呼吸引導
                timerInterval = setInterval(() => {
                    timeLeft--;
                    rescueButton.textContent = `停止 (${timeLeft}s)`;

                    // 呼吸引導文字 (4秒吸氣, 6秒吐氣)
                    if (timeLeft % 10 < 4) {
                        statusElement.textContent = '深吸氣 (1, 2, 3, 4)';
                    } else if (timeLeft % 10 < 10) {
                        statusElement.textContent = '緩慢吐氣 (1, 2, 3, 4, 5, 6)';
                    }

                    if (timeLeft <= 0) {
                        clearInterval(timerInterval);
                        isRunning = false;
                        rescueButton.textContent = '急救 (已完成)';
                        rescueButton.classList.remove('running');
                        statusElement.textContent = '回穩完成！現在請深呼吸，準備好就去行動！';
                    }
                }, 1000); // 每秒更新
            }
        });
    }


    // 3. 年齡切換邏輯 (溝通語句庫)
    const ageSelect = document.getElementById('age-select');
    const phraseDisplay = document.getElementById('phrase-display');
    
    const phrases = {
        '2-5': '「我知道你現在很生氣，但東西不能亂丟。我們一起把積木放回籃子裡，好嗎？」',
        '6-12': '「我看到你對作業很沮喪，深呼吸。我們一起討論怎麼開始。你需要幫助嗎？」',
        '13-18': '「我知道你覺得不公平，但我需要知道發生了什麼。我們先冷靜下來，等一下再理性地談談。」',
        'default': '請先選擇孩子年齡，取得一句適合當前情境的溫和溝通語句。'
    };

    if (phraseDisplay) {
        phraseDisplay.textContent = phrases['default'];
    }

    if (ageSelect) {
        ageSelect.addEventListener('change', function() {
            const selectedAge = this.value;
            if (phraseDisplay) {
                 phraseDisplay.textContent = phrases[selectedAge] || phrases['default'];
            }
        });
    }

});
