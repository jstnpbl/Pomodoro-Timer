// script.js

let timer;
let isRunning = false;
let timeLeft = 25 * 60; // 25 minutes in seconds
let completedPomodoros = 0;

const timerDisplay = document.getElementById('timer');
const timerStatus = document.getElementById('timer-status');
const progressBar = document.getElementById('progress');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        timerStatus.textContent = "Work Time";
        timer = setInterval(updateTimer, 1000);
    }
}

function pauseTimer() {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    timeLeft = 25 * 60;
    timerDisplay.textContent = formatTime(timeLeft);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    progressBar.style.width = '0%';
    timerStatus.textContent = "Work Time";
}

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);
        const progressPercentage = ((25 * 60 - timeLeft) / (25 * 60)) * 100;
        progressBar.style.width = progressPercentage + '%';
    } else {
        clearInterval(timer);
        completedPomodoros++;
        timerStatus.textContent = "Take a Break!";
        alert("Time's up! Take a break.");
        document.getElementById('alert-sound').play();
        resetTimer();
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}