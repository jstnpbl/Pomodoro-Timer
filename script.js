// DOM Elements
const timerDisplay = document.getElementById('timer');
const timerStatus = document.getElementById('timer-status');
const progressBar = document.getElementById('progress');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const saveSettingsBtn = document.getElementById('save-settings');

// Settings Elements
const workDurationInput = document.getElementById('work-duration');
const shortBreakDurationInput = document.getElementById('short-break-duration');
const longBreakDurationInput = document.getElementById('long-break-duration');
const pomodoroCountInput = document.getElementById('pomodoro-count');
const autoStartBreaksCheckbox = document.getElementById('auto-start-breaks');
const autoStartWorkCheckbox = document.getElementById('auto-start-work');
const notificationsCheckbox = document.getElementById('notifications');

// Stats Elements
const completedPomodorosEl = document.getElementById('completed-pomodoros');
const timeWorkedEl = document.getElementById('time-worked');

// Notification Elements
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const closeNotification = document.getElementById('close-notification');
const alertSound = document.getElementById('alert-sound');

// Timer Variables
let timerInterval;
let timeLeft = 1500; // 25 minutes in seconds
let totalTime = 1500;
let isRunning = false;
let currentMode = 'work'; // 'work', 'shortBreak', 'longBreak'
let pomodorosCompleted = 0;
let totalTimeWorked = 0;
let lastTimeCheck = 0;

// Settings Variables (default values)
let settings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    pomodoroCount: 4,
    autoStartBreaks: true,
    autoStartWork: false,
    notifications: true
};

// Load settings from localStorage if available
function loadSettings() {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        
        // Update input values
        workDurationInput.value = settings.workDuration;
        shortBreakDurationInput.value = settings.shortBreakDuration;
        longBreakDurationInput.value = settings.longBreakDuration;
        pomodoroCountInput.value = settings.pomodoroCount;
        autoStartBreaksCheckbox.checked = settings.autoStartBreaks;
        autoStartWorkCheckbox.checked = settings.autoStartWork;
        notificationsCheckbox.checked = settings.notifications;
    }
    
    // Set initial timer values
    timeLeft = settings.workDuration * 60;
    totalTime = timeLeft;
    updateTimerDisplay();
}

// Save settings to localStorage
function saveSettings() {
    settings = {
        workDuration: parseInt(workDurationInput.value),
        shortBreakDuration: parseInt(shortBreakDurationInput.value),
        longBreakDuration: parseInt(longBreakDurationInput.value),
        pomodoroCount: parseInt(pomodoroCountInput.value),
        autoStartBreaks: autoStartBreaksCheckbox.checked,
        autoStartWork: autoStartWorkCheckbox.checked,
        notifications: notificationsCheckbox.checked
    };
    
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    
    // Reset timer with new settings
    resetTimer();
    showNotification('Settings saved');
}

// Format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update timer display
function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    progressBar.style.width = `${progress}%`;
}

// Update timer status display
function updateTimerStatus() {
    switch (currentMode) {
        case 'work':
            timerStatus.textContent = 'Work Time';
            document.body.style.setProperty('--main-color', '#e74c3c');
            break;
        case 'shortBreak':
            timerStatus.textContent = 'Short Break';
            document.body.style.setProperty('--main-color', '#3498db');
            break;
        case 'longBreak':
            timerStatus.textContent = 'Long Break';
            document.body.style.setProperty('--main-color', '#2ecc71');
            break;
    }
}

// Update stats display
function updateStats() {
    completedPomodorosEl.textContent = pomodorosCompleted;
    const minutes = Math.floor(totalTimeWorked / 60);
    timeWorkedEl.textContent = `${minutes}m`;
}

// Start Timer
function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    lastTimeCheck = Date.now();
    
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    timerInterval = setInterval(() => {
        // Calculate elapsed time (to handle background tabs accurately)
        const now = Date.now();
        const elapsed = Math.floor((now - lastTimeCheck) / 1000);
        lastTimeCheck = now;
        
        // Only decrement if there's time left
        if (timeLeft > 0) {
            timeLeft = Math.max(0, timeLeft - elapsed);
            
            // Track time worked if in work mode
            if (currentMode === 'work') {
                totalTimeWorked += elapsed;
                updateStats();
            }
            
            updateTimerDisplay();
        } else {
            // Timer has reached zero
            clearInterval(timerInterval);
            isRunning = false;
            
            handleTimerComplete();
        }
    }, 1000);
}

// Pause Timer
function pauseTimer() {
    if (!isRunning) return;
    
    clearInterval(timerInterval);
    isRunning = false;
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Reset Timer
function resetTimer() {
    pauseTimer();
    
    // Reset to current mode's default time
    switch (currentMode) {
        case 'work':
            timeLeft = settings.workDuration * 60;
            break;
        case 'shortBreak':
            timeLeft = settings.shortBreakDuration * 60;
            break;
        case 'longBreak':
            timeLeft = settings.longBreakDuration * 60;
            break;
    }
    
    totalTime = timeLeft;
    updateTimerDisplay();
    updateTimerStatus();
}

// Switch Timer Mode
function switchMode(mode) {
    currentMode = mode;
    
    switch (mode) {
        case 'work':
            timeLeft = settings.workDuration * 60;
            break;
        case 'shortBreak':
            timeLeft = settings.shortBreakDuration * 60;
            break;
        case 'longBreak':
            timeLeft = settings.longBreakDuration * 60;
            break;
    }
    
    totalTime = timeLeft;
    updateTimerDisplay();
    updateTimerStatus();
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Handle Timer Completion
function handleTimerComplete() {
    // Play sound
    alertSound.play();
    
    // Update mode
    if (currentMode === 'work') {
        // Increment pomodoros completed
        pomodorosCompleted++;
        updateStats();
        
        // Check if it's time for a long break
        if (pomodorosCompleted % settings.pomodoroCount === 0) {
            switchMode('longBreak');
            showNotification('Time for a long break!');
            
            // Auto-start break if enabled
            if (settings.autoStartBreaks) {
                startTimer();
            }
        } else {
            switchMode('shortBreak');
            showNotification('Time for a short break!');
            
            // Auto-start break if enabled
            if (settings.autoStartBreaks) {
                startTimer();
            }
        }
    } else {
        // Coming from a break, switch to work mode
        switchMode('work');
        showNotification('Break finished. Time to work!');
        
        // Auto-start work if enabled
        if (settings.autoStartWork) {
            startTimer();
        }
    }
}

// Show Notification
function showNotification(message) {
    if (settings.notifications) {
        // Browser notification
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Pomodoro Timer", {
                body: message,
                icon: "https://cdn-icons-png.flaticon.com/512/850/850960.png"
            });
        } 
        // Request permission if not granted
        else if ("Notification" in window && Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("Pomodoro Timer", {
                        body: message,
                        icon: "https://cdn-icons-png.flaticon.com/512/850/850960.png"
                    });
                }
            });
        }
        
        // In-app notification
        notificationMessage.textContent = message;
        notification.classList.add('show');
        
        // Hide notification after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }
}

// Close notification
closeNotification.addEventListener('click', () => {
    notification.classList.remove('show');
});

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
saveSettingsBtn.addEventListener('click', saveSettings);

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    updateTimerStatus();
    
    // Request notification permission
    if ("Notification" in window && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
    
    // Show welcome message
    showNotification('Pomodoro Timer ready. Click Start to begin!');
});