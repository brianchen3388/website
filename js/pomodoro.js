// ========================================
// POMODORO TIMER
// ========================================

let pomodoroInterval = null;
let pomodoroEndTime = null;
let pomodoroPausedRemaining = null;
let pomodoroMode = 'work';
let pomodoroSessions = 0;
let pomodoroSettings = { work: 25, break: 5 };

function initPomodoro() {
    attachPomodoroListeners();

    if (pomodoroEndTime && pomodoroEndTime <= Date.now()) {
        pomodoroEndTime = null;
        pomodoroInterval = null;
        if (pomodoroMode === 'work') {
            pomodoroSessions++;
            pomodoroMode = 'break';
        } else {
            pomodoroMode = 'work';
        }
        playPomodoroSound();
    } else if (pomodoroEndTime && pomodoroEndTime > Date.now()) {
        startPomodoroTick();
        updatePomodoroButtons(true);
    }

    renderPomodoro();
}

function attachPomodoroListeners() {
    const startBtn = document.getElementById('pomodoro-start');
    const pauseBtn = document.getElementById('pomodoro-pause');
    const resetBtn = document.getElementById('pomodoro-reset');
    const workInput = document.getElementById('pomodoro-work');
    const breakInput = document.getElementById('pomodoro-break');

    if (startBtn) startBtn.addEventListener('click', startPomodoro);
    if (pauseBtn) pauseBtn.addEventListener('click', pausePomodoro);
    if (resetBtn) resetBtn.addEventListener('click', resetPomodoro);

    if (workInput) {
        workInput.addEventListener('change', (e) => {
            pomodoroSettings.work = parseInt(e.target.value) || 25;
            if (!pomodoroEndTime && pomodoroPausedRemaining === null && pomodoroMode === 'work') {
                renderPomodoro();
            }
        });
    }

    if (breakInput) {
        breakInput.addEventListener('change', (e) => {
            pomodoroSettings.break = parseInt(e.target.value) || 5;
            if (!pomodoroEndTime && pomodoroPausedRemaining === null && pomodoroMode === 'break') {
                renderPomodoro();
            }
        });
    }
}

function startPomodoro() {
    let seconds;
    if (pomodoroPausedRemaining !== null) {
        seconds = pomodoroPausedRemaining;
        pomodoroPausedRemaining = null;
    } else {
        const minutes = pomodoroMode === 'work' ? pomodoroSettings.work : pomodoroSettings.break;
        seconds = minutes * 60;
    }
    pomodoroEndTime = Date.now() + seconds * 1000;
    startPomodoroTick();
    updatePomodoroButtons(true);
}

function startPomodoroTick() {
    if (pomodoroInterval) clearInterval(pomodoroInterval);
    pomodoroInterval = setInterval(() => {
        const remaining = Math.ceil((pomodoroEndTime - Date.now()) / 1000);
        renderPomodoro(remaining);
        if (remaining <= 0) {
            completePomodoro();
        }
    }, 1000);
}

function pausePomodoro() {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
    pomodoroPausedRemaining = Math.max(0, Math.ceil((pomodoroEndTime - Date.now()) / 1000));
    pomodoroEndTime = null;
    updatePomodoroButtons(false);
    renderPomodoro();
}

function resetPomodoro() {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
    pomodoroEndTime = null;
    pomodoroPausedRemaining = null;
    updatePomodoroButtons(false);
    renderPomodoro();
}

function completePomodoro() {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
    pomodoroEndTime = null;
    playPomodoroSound();

    if (pomodoroMode === 'work') {
        pomodoroSessions++;
        pomodoroMode = 'break';
    } else {
        pomodoroMode = 'work';
    }

    updatePomodoroButtons(false);
    renderPomodoro();
}

function renderPomodoro(remainingSeconds) {
    let seconds;
    if (remainingSeconds !== undefined) {
        seconds = remainingSeconds;
    } else if (pomodoroEndTime) {
        seconds = Math.max(0, Math.ceil((pomodoroEndTime - Date.now()) / 1000));
    } else if (pomodoroPausedRemaining !== null) {
        seconds = pomodoroPausedRemaining;
    } else {
        const minutes = pomodoroMode === 'work' ? pomodoroSettings.work : pomodoroSettings.break;
        seconds = minutes * 60;
    }

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const timeEl = document.getElementById('pomodoro-time');
    if (timeEl) timeEl.textContent = timeStr;

    const modeEl = document.getElementById('pomodoro-mode');
    if (modeEl) {
        modeEl.textContent = pomodoroMode === 'work' ? 'Focus' : 'Break';
        modeEl.style.color = pomodoroMode === 'work' ? 'var(--primary)' : 'var(--success)';
    }

    const statusEl = document.getElementById('pomodoro-status');
    if (statusEl) {
        if (pomodoroInterval) {
            statusEl.textContent = pomodoroMode === 'work' ? 'Focusing...' : 'Taking a break...';
        } else if (pomodoroPausedRemaining !== null) {
            statusEl.textContent = 'Paused';
        } else {
            statusEl.textContent = pomodoroMode === 'work' ? 'Ready to focus' : 'Ready for a break';
        }
    }

    const sessionsEl = document.getElementById('pomodoro-sessions');
    if (sessionsEl) sessionsEl.textContent = pomodoroSessions;

    updatePomodoroRing(seconds);
}

function updatePomodoroRing(remainingSeconds) {
    const ring = document.getElementById('pomodoro-ring');
    if (!ring) return;

    const minutes = pomodoroMode === 'work' ? pomodoroSettings.work : pomodoroSettings.break;
    const totalSeconds = minutes * 60;
    const progress = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));
    const circumference = 603.2;
    const offset = circumference * (1 - progress);
    ring.style.strokeDashoffset = offset;

    if (pomodoroMode === 'break') {
        ring.setAttribute('stroke', 'var(--success)');
    } else {
        ring.setAttribute('stroke', 'url(#pomodoro-gradient)');
    }
}

function updatePomodoroButtons(isRunning) {
    const startBtn = document.getElementById('pomodoro-start');
    const pauseBtn = document.getElementById('pomodoro-pause');
    if (startBtn) startBtn.style.display = isRunning ? 'none' : 'inline-flex';
    if (pauseBtn) pauseBtn.style.display = isRunning ? 'inline-flex' : 'none';
}

function playPomodoroSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = 880;
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
        // Audio not available
    }
}

function cleanupPomodoro() {
    if (pomodoroInterval) {
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
    }
}

window.initPomodoro = initPomodoro;
window.cleanupPomodoro = cleanupPomodoro;
