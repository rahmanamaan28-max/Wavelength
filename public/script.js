// Client-side JavaScript
const socket = io();

// DOM Elements
const screens = {
    home: document.getElementById('home-screen'),
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen'),
    results: document.getElementById('results-screen'),
    gameover: document.getElementById('gameover-screen')
};

const playerNameInput = document.getElementById('player-name');
const roomCodeInput = document.getElementById('room-code');
const roomCodeDisplay = document.getElementById('room-code-display');
const playerList = document.getElementById('player-list');
const teamBlueMembers = document.getElementById('team-blue-members');
const teamRedMembers = document.getElementById('team-red-members');
const startGameBtn = document.getElementById('start-game');
const joinTeamBtns = document.querySelectorAll('.join-team');
const gameRoomCode = document.getElementById('game-room-code');
const currentRoundDisplay = document.getElementById('current-round');
const totalRoundsDisplay = document.getElementById('total-rounds');
const psychicView = document.getElementById('psychic-view');
const guesserView = document.getElementById('guesser-view');
const spectrumLeft = document.getElementById('spectrum-left');
const spectrumRight = document.getElementById('spectrum-right');
const spectrumName = document.getElementById('spectrum-name');
const targetZone = document.getElementById('target-zone');
const clueInput = document.getElementById('clue-input');
const submitClueBtn = document.getElementById('submit-clue');
const clueDisplay = document.querySelector('.clue-text');
const guesserLeft = document.getElementById('guesser-left');
const guesserRight = document.getElementById('guesser-right');
const dial = document.getElementById('dial');
const submitGuessBtn = document.getElementById('submit-guess');
const timerDisplay = document.getElementById('timer');
const currentPsychic = document.getElementById('current-psychic');
const guessList = document.getElementById('guess-list');
const targetRangeDisplay = document.getElementById('target-range');
const resultsSpectrum = document.getElementById('results-spectrum');
const resultsList = document.getElementById('results-list');
const nextRoundBtn = document.getElementById('next-round');
const finalScoreBlue = document.getElementById('final-score-blue');
const finalScoreRed = document.getElementById('final-score-red');
const winnerTeam = document.getElementById('winner-team');
const playAgainBtn = document.getElementById('play-again');
const backToLobbyBtn = document.getElementById('back-to-lobby');

// Game state
let playerId = null;
let roomCode = null;
let isHost = false;
let currentGameState = null;
let currentGuess = 0.5;

// Join room
document.getElementById('join-room').addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    const roomCode = roomCodeInput.value.trim().toUpperCase();
    
    if (playerName && roomCode) {
        socket.emit('joinRoom', { playerName, roomCode });
    } else {
        alert('Please enter your name and room code');
    }
});

// Create room
document.getElementById('create-room').addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    
    if (playerName) {
        socket.emit('createRoom', { playerName });
    } else {
        alert('Please enter your name');
    }
});

// Start game
startGameBtn.addEventListener('click', () => {
    if (!isHost) return;
    
    const rounds = document.getElementById('rounds').value;
    const timer = document.getElementById('timer').value;
    const gameMode = document.getElementById('game-mode').value;
    
    socket.emit('startGame', { rounds, timer, gameMode });
});

// Join team
joinTeamBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const team = btn.dataset.team;
        socket.emit('joinTeam', team);
    });
});

// Submit clue
submitClueBtn.addEventListener('click', () => {
    const clue = clueInput.value.trim();
    if (clue) {
        socket.emit('submitClue', clue);
    }
});

// Submit guess
submitGuessBtn.addEventListener('click', () => {
    socket.emit('submitGuess', currentGuess);
});

// Next round
nextRoundBtn.addEventListener('click', () => {
    socket.emit('nextRound');
});

// Play again
playAgainBtn.addEventListener('click', () => {
    socket.emit('playAgain');
});

// Back to lobby
backToLobbyBtn.addEventListener('click', () => {
    socket.emit('backToLobby');
});

// Setup dial interaction
dial.addEventListener('click', (e) => {
    const rect = dial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const degrees = (angle * (180 / Math.PI) + 180) % 360;
    
    // Update guess position (0-1)
    currentGuess = degrees / 360;
    
    // Rotate dial
    dial.style.transform = `rotate(${degrees}deg)`;
});

// Socket event listeners
socket.on('connect', () => {
    playerId = socket.id;
});

socket.on('roomCreated', (data) => {
    roomCode = data.roomCode;
    isHost = true;
    roomCodeDisplay.textContent = roomCode;
    switchScreen('lobby');
    updatePlayerList(data.players);
});

socket.on('roomJoined', (data) => {
    roomCode = data.roomCode;
    isHost = false;
    roomCodeDisplay.textContent = roomCode;
    switchScreen('lobby');
    updatePlayerList(data.players);
    
    // Hide host controls if not host
    if (!isHost) {
        document.getElementById('host-controls').style.display = 'none';
    }
});

socket.on('playerJoined', (players) => {
    updatePlayerList(players);
});

socket.on('playerLeft', (players) => {
    updatePlayerList(players);
});

socket.on('teamUpdated', (teams) => {
    updateTeamDisplay(teams);
});

socket.on('gameStarted', (gameState) => {
    currentGameState = gameState;
    gameRoomCode.textContent = roomCode;
    currentRoundDisplay.textContent = gameState.currentRound;
    totalRoundsDisplay.textContent = gameState.totalRounds;
    switchScreen('game');
    updateGameScreen(gameState);
});

socket.on('updateGameState', (gameState) => {
    currentGameState = gameState;
    updateGameScreen(gameState);
});

socket.on('showResults', (results) => {
    displayResults(results);
    switchScreen('results');
});

socket.on('gameOver', (finalScores) => {
    finalScoreBlue.textContent = finalScores.blue;
    finalScoreRed.textContent = finalScores.red;
    winnerTeam.textContent = finalScores.blue > finalScores.red ? 'Team Blue' : 'Team Red';
    switchScreen('gameover');
});

socket.on('error', (message) => {
    alert(message);
});

// Helper functions
function switchScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    screens[screenName].classList.add('active');
}

function updatePlayerList(players) {
    playerList.innerHTML = '';
    players.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        playerCard.innerHTML = `
            <div class="player-icon">${player.name.charAt(0)}</div>
            <div class="player-name">${player.name}</div>
            ${player.isHost ? '<div class="player-status">Host</div>' : ''}
        `;
        playerList.appendChild(playerCard);
    });
}

function updateTeamDisplay(teams) {
    teamBlueMembers.innerHTML = '';
    teamRedMembers.innerHTML = '';
    
    teams.blue.forEach(player => {
        const playerEl = document.createElement('div');
        playerEl.className = 'player';
        playerEl.innerHTML = `
            <div class="player-icon">${player.name.charAt(0)}</div>
            <div class="player-name">${player.name}</div>
        `;
        teamBlueMembers.appendChild(playerEl);
    });
    
    teams.red.forEach(player => {
        const playerEl = document.createElement('div');
        playerEl.className = 'player';
        playerEl.innerHTML = `
            <div class="player-icon">${player.name.charAt(0)}</div>
            <div class="player-name">${player.name}</div>
        `;
        teamRedMembers.appendChild(playerEl);
    });
}

function updateGameScreen(gameState) {
    // Update scores
    document.querySelectorAll('.team-score').forEach((el, i) => {
        el.textContent = gameState.teams[i].score;
    });
    
    // Update team members in game screen
    const gameTeamBlue = document.getElementById('game-team-blue');
    const gameTeamRed = document.getElementById('game-team-red');
    
    gameTeamBlue.innerHTML = '';
    gameTeamRed.innerHTML = '';
    
    gameState.teams[0].players.forEach(player => {
        const playerEl = document.createElement('div');
        playerEl.className = 'player';
        playerEl.innerHTML = `
            <div class="player-icon">${player.name.charAt(0)}</div>
            <div class="player-name">${player.name}</div>
        `;
        gameTeamBlue.appendChild(playerEl);
    });
    
    gameState.teams[1].players.forEach(player => {
        const playerEl = document.createElement('div');
        playerEl.className = 'player';
        playerEl.innerHTML = `
            <div class="player-icon">${player.name.charAt(0)}</div>
            <div class="player-name">${player.name}</div>
        `;
        gameTeamRed.appendChild(playerEl);
    });
    
    // Update round info
    currentRoundDisplay.textContent = gameState.currentRound;
    
    // Show psychic or guesser view
    const isPsychic = gameState.currentPsychic.id === playerId;
    psychicView.classList.toggle('active', isPsychic);
    guesserView.classList.toggle('active', !isPsychic);
    
    if (isPsychic) {
        // Psychic view
        spectrumLeft.textContent = gameState.currentSpectrum.left;
        spectrumRight.textContent = gameState.currentSpectrum.right;
        spectrumName.textContent = gameState.currentSpectrum.name;
        
        const targetPosition = gameState.targetPosition * 100;
        targetZone.style.left = `${targetPosition - 10}%`;
        targetZone.style.width = '20%';
        
        clueInput.value = '';
    } else {
        // Guesser view
        guesserLeft.textContent = gameState.currentSpectrum.left;
        guesserRight.textContent = gameState.currentSpectrum.right;
        
        if (gameState.clue) {
            clueDisplay.textContent = gameState.clue;
        } else {
            clueDisplay.textContent = 'Waiting for clue...';
        }
    }
    
    // Update timer
    updateTimer(gameState.timer);
    
    // Update current psychic
    currentPsychic.textContent = gameState.currentPsychic.name;
    
    // Update guess list
    guessList.innerHTML = '';
    gameState.guesses.forEach(guess => {
        const guessEl = document.createElement('div');
        guessEl.className = 'guess';
        guessEl.textContent = `${guess.player.name}: ${Math.round(guess.value * 100)}%`;
        guessList.appendChild(guessEl);
    });
}

function updateTimer(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function displayResults(results) {
    // Show target range
    targetRangeDisplay.textContent = `${results.targetPosition * 100}%`;
    
    // Show target zone on spectrum
    const targetPosition = results.targetPosition * 100;
    resultsTargetZone.style.left = `${targetPosition - 10}%`;
    resultsTargetZone.style.width = '20%';
    
    // Clear existing markers
    document.querySelectorAll('.guess-marker').forEach(marker => marker.remove());
    
    // Add guess markers
    results.guesses.forEach(guess => {
        const marker = document.createElement('div');
        marker.className = 'guess-marker';
        marker.style.left = `${guess.value * 100}%`;
        marker.style.backgroundColor = guess.team === 'blue' ? '#2196F3' : '#F44336';
        resultsSpectrum.appendChild(marker);
    });
    
    // Show results list
    resultsList.innerHTML = '';
    results.guesses.forEach(guess => {
        const resultEl = document.createElement('div');
        resultEl.className = 'result';
        resultEl.innerHTML = `
            <div class="player">${guess.player.name}</div>
            <div class="guess-value">${Math.round(guess.value * 100)}%</div>
            <div class="points">+${guess.points} points</div>
        `;
        resultsList.appendChild(resultEl);
    });
        }
