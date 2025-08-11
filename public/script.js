// Game state
const gameState = {
    teams: [
        {
            name: "Team Blue",
            score: 12,
            players: ["Alex", "Jamie", "Taylor"],
            activePlayer: 0
        },
        {
            name: "Team Red",
            score: 8,
            players: ["Morgan", "Casey", "Riley"],
            activePlayer: 0
        }
    ],
    currentTeam: 0,
    currentSpectrum: {
        left: "HOT",
        right: "COLD",
        name: "Temperature Spectrum"
    },
    clue: "Coffee",
    targetPosition: 0.4, // 0-1 range
    currentGuess: 0.5,
    timer: 90, // seconds
    gameStarted: false
};

// DOM Elements
const dial = document.getElementById('dial');
const clueText = document.querySelector('.clue-text');
const spectrumRange = document.querySelector('.spectrum-range');
const spectrumName = document.querySelector('.spectrum-name');
const targetZone = document.querySelector('.target-zone');
const timerDisplay = document.querySelector('.timer');
const teamScores = document.querySelectorAll('.team-score');
const gameStatus = document.querySelector('.game-status');

// Initialize game
function initGame() {
    updateSpectrumDisplay();
    updateClueDisplay();
    updateTargetZone();
    updateScores();
    updateGameStatus();
    setupEventListeners();
}

// Update spectrum display
function updateSpectrumDisplay() {
    spectrumRange.innerHTML = `<span>${gameState.currentSpectrum.left}</span><span>${gameState.currentSpectrum.right}</span>`;
    spectrumName.textContent = gameState.currentSpectrum.name;
}

// Update clue display
function updateClueDisplay() {
    clueText.textContent = gameState.clue;
}

// Update target zone position
function updateTargetZone() {
    // Target zone is 20% wide and positioned based on gameState.targetPosition
    const position = gameState.targetPosition * 100;
    targetZone.style.left = `${position - 10}%`;
}

// Update scores
function updateScores() {
    teamScores[0].textContent = gameState.teams[0].score;
    teamScores[1].textContent = gameState.teams[1].score;
}

// Update game status
function updateGameStatus() {
    const teamName = gameState.teams[gameState.currentTeam].name;
    gameStatus.textContent = `${teamName}'s turn to give a clue`;
}

// Handle dial interaction
function setupDialInteraction() {
    dial.addEventListener('click', (e) => {
        const rect = dial.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const degrees = (angle * (180 / Math.PI) + 180) % 360;
        
        // Update guess position (0-1)
        gameState.currentGuess = degrees / 360;
        
        // Rotate dial
        dial.style.transform = `rotate(${degrees}deg)`;
    });
}

// Setup event listeners
function setupEventListeners() {
    setupDialInteraction();
    
    // Start game button
    document.querySelector('.btn-start').addEventListener('click', () => {
        gameState.gameStarted = true;
        alert('Game started! Team Blue begins.');
    });
    
    // New Round button
    document.querySelectorAll('.btn')[1].addEventListener('click', () => {
        alert('Starting new round!');
    });
    
    // Submit Blue Guess
    document.querySelector('.btn-blue').addEventListener('click', () => {
        alert(`Team Blue guessed: ${Math.round(gameState.currentGuess * 100)}%`);
    });
    
    // Submit Red Guess
    document.querySelector('.btn-red').addEventListener('click', () => {
        alert(`Team Red guessed: ${Math.round(gameState.currentGuess * 100)}%`);
    });
    
    // Start Timer
    document.querySelectorAll('.btn')[4].addEventListener('click', () => {
        alert('Timer started!');
    });
}

// Format time for display
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', initGame);
