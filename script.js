// Optimized Memory Game Script

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let gametimer;
let revealtimer;
let totalTime;
let isRevealing = true;
let lives = 3;
let isGamePaused = false;

const difficultySettings = {
    easy: { pairs: 6, time: 360 },
    medium: { pairs: 8, time: 180 },
    hard: { pairs: 10, time: 120 }
};

function startGame(difficulty) {
    
    const tempState = sessionStorage.getItem('tempGameState');
    const gameBoard = document.getElementById('game-board');

    if (tempState) {
        const gameState = JSON.parse(tempState);
    
        // Validate game state
        if (!gameState.cards || gameState.matchedPairs === undefined || gameState.totalTime === undefined || gameState.lives === undefined) {
            console.error('Invalid game state found. Starting a new game.');
            sessionStorage.removeItem('tempGameState');
            startGame(difficulty); // Restart with a new game
            return;
        }
    
        // Restore game state
        matchedPairs = gameState.matchedPairs;
        totalTime = gameState.totalTime;
        lives = gameState.lives;
        cards = gameState.cards;
    
        updateLivesDisplay();

        if (gameBoard) {
            gameBoard.innerHTML = '';
            cards.forEach(savedCard => {
                const cardElement = createCardElement(savedCard);
                if (savedCard.flipped) {
                    cardElement.classList.add('flipped'); // Restore the flipped state of the card
                }
                gameBoard.appendChild(cardElement);
            });
        }
    
        flippedCards = [];
        isRevealing = false;
        sessionStorage.removeItem('tempGameState'); // Clear temporary state
        starttimer();
    } else {
    // Start a new game (as usual)
    const settings = difficultySettings[difficulty];
    cards = shuffle(createCards(settings.pairs));
    matchedPairs = 0;
    totalTime = settings.time;
    lives = 3;
    isRevealing = true;

    if (gameBoard) {
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns =
        difficulty === 'easy' ? 'repeat(3, 1fr)' :
        difficulty === 'medium' ? 'repeat(4, 1fr)' :
        'repeat(4, 1fr)';

            cards.forEach(card => {
                const cardElement = createCardElement(card);
                gameBoard.appendChild(cardElement);
            });

            flipAllCards(true);
            revealtimer = setTimeout(() => {
                flipAllCards(false);
                isRevealing = false;
            }, 10000);
        }
        starttimer();
    }
}


// Create Cards Function
function createCards(pairs) {
    const cards = [];
    const problemSolutionPairs = [
        { problem: 'images/problem1.png', solution: 'images/solution1.png' },
        { problem: 'images/problem2.png', solution: 'images/solution2.png' },
        { problem: 'images/problem3.png', solution: 'images/solution3.png'},
        { problem: 'images/problem4.png', solution: 'images/solution4.png' } ,
        { problem: 'images/problem5.png', solution: 'images/solution5.png' },
        { problem: 'images/problem6.png', solution: 'images/solution6.png' },
        { problem: 'images/problem7.png', solution: 'images/solution7.png' },
        { problem: 'images/problem8.png', solution: 'images/solution8.png'},
        { problem: 'images/problem9.png', solution: 'images/solution9.png' },
        { problem: 'images/problem10.png', solution: 'images/solution10.png' } 
    ].slice(0, pairs);

    problemSolutionPairs.forEach(pair => {
        cards.push({ type: 'problem', image: pair.problem, id: pair.problem });
        cards.push({ type: 'solution', image: pair.solution, id: pair.problem });
    });

    return cards;
}

// Create Card Element Function
function createCardElement(card) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset.id = card.id;

    const frontImageSrc = card.type === 'problem' ? card.image : card.image; // Front image
    const backImageSrc = 'images/frontcard.png'; // Your custom card-back image

    cardElement.innerHTML = `
        <div class="card-inner">
            <img class="front" src="${frontImageSrc}" alt="Front Image">
            <img class="back" src="${backImageSrc}" alt="Back Image">
        </div>
    `;

    cardElement.addEventListener('click', () => {
        if (!cardElement.classList.contains('flipped') && flippedCards.length < 2) {
            flipCard(cardElement);
        }
    });

    return cardElement;
}



// Flip All Cards Function
function flipAllCards(flip) {
    document.querySelectorAll('.card').forEach(card => {
        if (flip && !card.classList.contains('flipped')) {
            card.classList.add('flipped');
        } else if (!flip && card.classList.contains('flipped')) {
            card.classList.remove('flipped');
        }
    });
}

// Flip Individual Card Function
function flipCard(card) {
    if (isRevealing || card.classList.contains('flipped') || flippedCards.length >= 2) return;

    card.classList.toggle('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        checkForMatch();
    }
}



// Check For Match Function
function checkForMatch() {
    const [card1, card2] = flippedCards;
    const id1 = card1.dataset.id;
    const id2 = card2.dataset.id;

    if (id1 === id2) {
        matchedPairs++;
        flippedCards = [];
        if (matchedPairs === cards.length / 2) {
            clearInterval(gametimer);
            window.location.href = 'wingame.html';
        }
    } else {
        lives--;
        updateLivesDisplay();

        if (lives <= 0) {
            clearInterval(gametimer);
            alert('Game Over!');
            window.location.href = 'lostgame.html';
        }

        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

// timer Logic
function starttimer() {
    if (gametimer) clearInterval(gametimer);
    updatetimerDisplay();
    gametimer = setInterval(() => {
        totalTime = Math.max(0, totalTime - 1);
        updatetimerDisplay();
        if (totalTime <= 0) {
            clearInterval(gametimer);
            window.location.href = 'lostgame.html';
        }
    }, 1000);
}

function updatetimerDisplay() {
    const minutes = Math.floor(totalTime / 60).toString().padStart(2, '0');
    const seconds = (totalTime % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `Masa: ${minutes}:${seconds}`; //Masa Display
}

// Update Lives Displayx
function updateLivesDisplay() {
    const livesElement = document.getElementById('lives');
    const emptyHearts = "🖤 ".repeat(3 - lives);
    const filledHearts = "❤️ ".repeat(lives);
    livesElement.innerHTML = emptyHearts + filledHearts;
}

// Shuffle Array Function
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Preload Images Function
function preloadImages() {
    cards.filter(card => card.type === 'problem').forEach(card => {
        const img = new Image();
        img.src = card.image;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    preloadImages();

    const homeIcon = document.getElementById('home-icon');
    if (homeIcon) {
        homeIcon.addEventListener('click', (event) => {
            event.preventDefault();
            clearInterval(gametimer);
            isGamePaused = true;

            const gameState = {
                cards: cards.map(card => ({
                    id: card.id,
                    type: card.type,
                    image: card.image,
                    flipped: document.querySelector(`[data-id='${card.id}']`).classList.contains('flipped')
                })),
                matchedPairs,
                totalTime,
                lives,
                difficulty: document.body.dataset.difficulty,
            };
            sessionStorage.setItem('gameState', JSON.stringify(gameState));
            
            window.location.href = 'stopgame.html';
        });
    }

    const playAgainBtn = document.getElementById('play-again');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            // Get the difficulty from sessionStorage
            const savedDifficulty = sessionStorage.getItem('difficulty');

            if (savedDifficulty) {
                // Redirect to the same difficulty page
                window.location.href = `${savedDifficulty}.html`;
            } else {
                // Fallback: if difficulty is not saved, go to easy page (can happen on the first page load)
                window.location.href = 'easy.html';
            }
        });
    }

    const continueGameBtn = document.getElementById('continue-game');

    if (continueGameBtn) {
        continueGameBtn.addEventListener('click', () => {
            const savedState = sessionStorage.getItem('gameState');
            if (savedState) {
                const gameState = JSON.parse(savedState);

                // Restore game variables and reset pause state
                isGamePaused = false; // Reset the pause state
                matchedPairs = gameState.matchedPairs;
                totalTime = gameState.totalTime;
                lives = gameState.lives;

                // Save temp state for use in the game
                sessionStorage.setItem('tempGameState', JSON.stringify(gameState));

                // Redirect to the appropriate difficulty page
                window.location.href = `${gameState.difficulty}.html`;
            }
        });
    }

    const currentDifficulty = document.body.dataset.difficulty;
    if (currentDifficulty) {
        sessionStorage.setItem('difficulty', currentDifficulty);
    }

});

