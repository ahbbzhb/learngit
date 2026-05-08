// ==================== 时钟功能 ====================
const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

function updateClock() {
    const now = new Date();
    
    // 更新时间
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('currentTime').textContent = `${hours}:${minutes}:${seconds}`;
    
    // 更新日期
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekDay = weekDays[now.getDay()];
    document.getElementById('currentDate').textContent = `${year}年${month}月${day}日 ${weekDay}`;
}

// 每秒更新时钟
updateClock();
setInterval(updateClock, 1000);

// ==================== 计时器功能 ====================
class Timer {
    constructor() {
        this.totalSeconds = 0;      // 总计时秒数（倒计时模式的目标时间）
        this.remainingSeconds = 0;  // 剩余秒数
        this.isRunning = false;
        this.isPaused = false;
        this.isCountdown = false;   // 是否为倒计时模式
        this.intervalId = null;
        this.startTimestamp = null; // 开始时间戳（用于正计时）
        this.elapsedBeforePause = 0; // 暂停前已过去的秒数（用于正计时）
        
        // DOM 元素
        this.display = document.getElementById('timerDisplay');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // 绑定事件
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // 预设按钮
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const minutes = parseInt(btn.dataset.minutes);
                this.setCountdown(minutes * 60);
                // 高亮当前选中的预设
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // 自定义设置
        document.getElementById('setCustomBtn').addEventListener('click', () => {
            const input = document.getElementById('customMinutes');
            const minutes = parseInt(input.value);
            if (minutes && minutes > 0) {
                this.setCountdown(minutes * 60);
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                input.value = '';
            } else {
                alert('请输入有效的分钟数（大于0）');
            }
        });
        
        // 回车键触发设置
        document.getElementById('customMinutes').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('setCustomBtn').click();
            }
        });
    }
    
    // 设置倒计时
    setCountdown(seconds) {
        if (this.isRunning) return;
        
        this.isCountdown = true;
        this.totalSeconds = seconds;
        this.remainingSeconds = seconds;
        this.elapsedBeforePause = 0;
        this.updateDisplay(seconds);
        this.startBtn.disabled = false;
        this.startBtn.textContent = '开始';
    }
    
    // 格式化时间显示
    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    
    // 更新显示
    updateDisplay(seconds) {
        this.display.textContent = this.formatTime(seconds);
    }
    
    // 开始计时
    start() {
        if (this.isRunning) return;
        
        // 如果倒计时未设置且没有剩余时间，默认为正计时
        if (!this.isCountdown && this.remainingSeconds === 0 && this.elapsedBeforePause === 0) {
            this.isCountdown = false;
            this.totalSeconds = 0;
            this.remainingSeconds = 0;
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.startBtn.textContent = '运行中';
        
        // 禁用预设和自定义设置
        document.querySelectorAll('.preset-btn').forEach(b => b.style.pointerEvents = 'none');
        document.getElementById('customMinutes').disabled = true;
        document.getElementById('setCustomBtn').disabled = true;
        
        if (this.isCountdown) {
            // 倒计时模式
            this.intervalId = setInterval(() => {
                this.remainingSeconds--;
                this.updateDisplay(this.remainingSeconds);
                
                if (this.remainingSeconds <= 0) {
                    this.remainingSeconds = 0;
                    this.updateDisplay(0);
                    this.stop();
                    this.onTimerComplete();
                }
            }, 1000);
        } else {
            // 正计时模式
            this.startTimestamp = Date.now();
            this.intervalId = setInterval(() => {
                const now = Date.now();
                const elapsed = Math.floor((now - this.startTimestamp) / 1000) + this.elapsedBeforePause;
                this.remainingSeconds = elapsed;
                this.updateDisplay(elapsed);
            }, 1000);
        }
    }
    
    // 暂停计时
    pause() {
        if (!this.isRunning || this.isPaused) return;
        
        this.isPaused = true;
        this.isRunning = false;
        clearInterval(this.intervalId);
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.startBtn.textContent = '继续';
        
        // 记录正计时已过去的时间
        if (!this.isCountdown) {
            this.elapsedBeforePause = this.remainingSeconds;
        }
    }
    
    // 停止计时（倒计时完成时调用）
    stop() {
        clearInterval(this.intervalId);
        this.isRunning = false;
        this.isPaused = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.startBtn.textContent = '开始';
        
        // 恢复预设和自定义设置
        document.querySelectorAll('.preset-btn').forEach(b => b.style.pointerEvents = 'auto');
        document.getElementById('customMinutes').disabled = false;
        document.getElementById('setCustomBtn').disabled = false;
    }
    
    // 重置计时器
    reset() {
        clearInterval(this.intervalId);
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.isCountdown) {
            // 倒计时模式：重置到初始设定值
            this.remainingSeconds = this.totalSeconds;
            this.updateDisplay(this.totalSeconds);
        } else {
            // 正计时模式：重置为0
            this.remainingSeconds = 0;
            this.elapsedBeforePause = 0;
            this.updateDisplay(0);
        }
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.startBtn.textContent = '开始';
        
        // 恢复预设和自定义设置
        document.querySelectorAll('.preset-btn').forEach(b => b.style.pointerEvents = 'auto');
        document.getElementById('customMinutes').disabled = false;
        document.getElementById('setCustomBtn').disabled = false;
    }
    
    // 计时完成回调
    onTimerComplete() {
        // 播放提示音
        this.playAlert();
        
        // 闪烁显示
        let blinkCount = 0;
        const blinkInterval = setInterval(() => {
            this.display.style.color = this.display.style.color === 'red' ? '#333' : 'red';
            blinkCount++;
            if (blinkCount >= 10) { // 闪烁5次
                clearInterval(blinkInterval);
                this.display.style.color = '#333';
            }
        }, 300);
        
        // 恢复预设和自定义设置
        document.querySelectorAll('.preset-btn').forEach(b => b.style.pointerEvents = 'auto');
        document.getElementById('customMinutes').disabled = false;
        document.getElementById('setCustomBtn').disabled = false;
        
        // 重置倒计时标志，下次点击开始将进入正计时模式
        this.isCountdown = false;
        this.totalSeconds = 0;
    }
    
    // 播放提示音
    playAlert() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            // 播放三次蜂鸣音
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    
                    oscillator.frequency.value = 880;
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                    
                    oscillator.start(audioCtx.currentTime);
                    oscillator.stop(audioCtx.currentTime + 0.5);
                }, i * 600);
            }
        } catch (e) {
            console.log('浏览器不支持音频播放');
        }
    }
}

// 初始化计时器
const timer = new Timer();