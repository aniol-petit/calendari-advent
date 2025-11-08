// ============================================
// Mes objectiu per al calendari (10 = novembre per proves, 11 = desembre en producció)
// ============================================
const TARGET_MONTH = 10;
const PASSWORD_HASH = '65039b24cf42f74dafefd55b5a71737d4d1b964907341e1bd1b45061ec3f3a9d';
const PASSWORD_STORAGE_KEY = 'advent_password_verified';
let easterEggsInitialized = false;

// ============================================
// QUESTIONS DATABASE - Daily questions for the game
// ============================================
const DAILY_QUESTIONS = {
    1: { question: "Quin és el teu color preferit?", correctAnswer: "rosa" },
    2: { question: "Quin és el teu menjar preferit?", correctAnswer: "sushi" },
    3: { question: "Quin és el teu lloc preferit per relaxar-te?", correctAnswer: "" },
    4: { question: "Quin és el teu animal preferit?", correctAnswer: "" },
    5: { question: "Quin és el teu llibre preferit?", correctAnswer: "" },
    6: { question: "Quin és el teu moment preferit del dia?", correctAnswer: "" },
    7: { question: "Quin és el teu record preferit amb mi?", correctAnswer: "" },
    8: { question: "Quin és el teu somni més gran?", correctAnswer: "" },
    9: { question: "Quin és el teu lloc de vacances preferit?", correctAnswer: "" },
    10: { question: "Quin és el teu tipus de música preferit?", correctAnswer: "" },
    11: { question: "Quin és el teu hobby preferit?", correctAnswer: "" },
    12: { question: "Quin és el teu record de la infància preferit?", correctAnswer: "" },
    13: { question: "Quin és el teu tipus de pel·lícula preferit?", correctAnswer: "" },
    14: { question: "Quin és el teu tipus de cuina preferit?", correctAnswer: "" },
    15: { question: "Quin és el teu tipus de clima preferit?", correctAnswer: "" },
    16: { question: "Quin és el teu tipus de decoració preferit?", correctAnswer: "" },
    17: { question: "Quin és el teu tipus de passeig preferit?", correctAnswer: "" },
    18: { question: "Quin és el teu tipus de conversa preferit?", correctAnswer: "" },
    19: { question: "Quin és el teu tipus de sorpresa preferit?", correctAnswer: "" },
    20: { question: "Quin és el teu tipus de gest preferit?", correctAnswer: "" },
    21: { question: "Quin és el teu tipus de moment romàntic preferit?", correctAnswer: "" },
    22: { question: "Quin és el teu tipus de celebració preferit?", correctAnswer: "" },
    23: { question: "Quin és el teu tipus de tradició preferit?", correctAnswer: "" },
    24: { question: "Quin és el teu desig més gran per al proper any?", correctAnswer: "" }
};

// Initialize the calendar & gate the experience behind the password
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    initializePasswordProtection();
    checkForReturnFromLetter();
});

// Calendar Initialization
function initializeCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11, where 11 is December
    const currentDate = today.getDate();
    const currentYear = today.getFullYear();

    // Only allow access in the target month (current value utilises novembre per proves)
    const isTargetMonth = currentMonth === TARGET_MONTH;
    // If it's past the target month, unlock all doors
    const isPastTargetMonth = currentMonth > TARGET_MONTH;

    // Create 24 doors
    for (let day = 1; day <= 24; day++) {
        const door = createDoor(day, isTargetMonth, currentDate, isPastTargetMonth);
        calendarGrid.appendChild(door);
    }
}

function initializePasswordProtection() {
    const passwordScreen = document.getElementById('password-screen');
    const calendarContainer = document.getElementById('calendar-container');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const passwordError = document.getElementById('password-error');

    if (!passwordScreen || !calendarContainer || !passwordInput || !passwordSubmit || !passwordError) {
        initializeEasterEggsOnce();
        return;
    }

    function grantAccess() {
        passwordScreen.classList.add('hidden');
        calendarContainer.classList.remove('hidden');
        passwordError.textContent = '';
        passwordInput.value = '';
        initializeEasterEggsOnce();
    }

    if (localStorage.getItem(PASSWORD_STORAGE_KEY) === 'true') {
        grantAccess();
        return;
    }

    passwordScreen.classList.remove('hidden');
    calendarContainer.classList.add('hidden');

    async function checkPassword() {
        const enteredPassword = passwordInput.value.trim();
        if (!enteredPassword) {
            passwordError.textContent = 'Introdueix la contrasenya.';
            passwordInput.focus();
            return;
        }

        try {
            const hashedInput = await hashString(enteredPassword);
            if (hashedInput === PASSWORD_HASH) {
                localStorage.setItem(PASSWORD_STORAGE_KEY, 'true');
                grantAccess();
            } else {
                passwordError.textContent = 'Contrasenya incorrecta. Torna-ho a provar.';
                passwordInput.value = '';
                passwordInput.focus();
            }
        } catch (error) {
            console.warn('No s\'ha pogut validar la contrasenya:', error);
            passwordError.textContent = 'Actualitza el navegador per accedir a aquesta pàgina.';
        }
    }

    passwordSubmit.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            checkPassword();
        }
    });

    passwordInput.focus();
}

async function hashString(value) {
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
        const encoder = new TextEncoder();
        const data = encoder.encode(value);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    throw new Error('SubtleCrypto no està disponible.');
}

function initializeEasterEggsOnce() {
    if (easterEggsInitialized) {
        return;
    }
    sessionStorage.removeItem('titleSecretUnlocked');
    sessionStorage.removeItem('heartSecretUnlocked');
    initializeEasterEggs();
    easterEggsInitialized = true;
}

// Create a single door element
function createDoor(dayNumber, isTargetMonth, currentDate, isPastTargetMonth) {
    const door = document.createElement('div');
    door.className = 'door';
    
    // ============================================
    // DOOR LOCKING LOGIC - For development, set isUnlocked = true to unlock all doors
    // ============================================
    let isUnlocked = false;
    if (isPastTargetMonth) {
        isUnlocked = true; // All doors unlocked if past the target month
    } else if (isTargetMonth) {
        isUnlocked = currentDate >= dayNumber;
    }
    // To unlock all doors during development, uncomment the line below:
    // isUnlocked = true;

    if (isUnlocked) {
        door.classList.add('unlocked');
    } else {
        door.classList.add('locked');
    }

    const doorFront = document.createElement('div');
    doorFront.className = 'door-front';

    const doorNumber = document.createElement('div');
    doorNumber.className = 'door-number';
    doorNumber.textContent = dayNumber;

    const doorIcon = document.createElement('div');
    doorIcon.className = 'door-icon';
    doorIcon.textContent = isUnlocked ? '✉️' : '🔒';

    doorFront.appendChild(doorNumber);
    doorFront.appendChild(doorIcon);
    door.appendChild(doorFront);

    // Add click handler
    if (isUnlocked) {
        door.addEventListener('click', function() {
            openLetter(dayNumber);
        });
    } else {
        door.addEventListener('click', function() {
            showLockedMessage(dayNumber);
        });
    }

    return door;
}

// Open letter page
function openLetter(dayNumber) {
    // Set a flag in sessionStorage to indicate we're going to a letter page
    sessionStorage.setItem('fromCalendar', 'true');
    sessionStorage.setItem('currentDay', dayNumber.toString());
    window.location.href = `letters/day${dayNumber}.html`;
}

// Show message for locked doors
function showLockedMessage(dayNumber) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();
    const isTargetMonth = currentMonth === TARGET_MONTH;
    
    let title, message;
    
    if (isTargetMonth && dayNumber > currentDate) {
        const daysUntil = dayNumber - currentDate;
        title = "Carta bloquejada";
        message = daysUntil === 1 
            ? `Aquesta carta estarà disponible demà! 💕`
            : `Aquesta carta estarà disponible en ${daysUntil} dies. 💕`;
    } else {
        title = "Carta bloquejada";
        message = "Aquesta carta estarà disponible al desembre! 💕";
    }
    
    showModal(title, message);
}

// Show beautiful modal
function showModal(title, message) {
    const modal = document.getElementById('locked-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = modal.querySelector('.modal-overlay');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    modal.classList.add('active');
    
    // Close modal function
    function closeModal() {
        modal.classList.remove('active');
    }
    
    // Remove old listeners and add new ones
    const newCloseBtn = modalClose.cloneNode(true);
    modalClose.parentNode.replaceChild(newCloseBtn, modalClose);
    newCloseBtn.addEventListener('click', closeModal);
    
    modalOverlay.onclick = closeModal;
    
    // Close on Escape key
    const escapeHandler = function(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Initialize all easter eggs
function initializeEasterEggs() {
    setupTitleSecret();
    setupHeartSecret();
    handleSecretDay25();
    triggerConfettiIfNeeded();
}

// Easter egg #3 – secret message after clicking the title
function setupTitleSecret() {
    const title = document.querySelector('.main-title');
    if (!title) return;

    title.addEventListener('click', function() {
        const secretMessage = 'Has trobat la nota secreta: cada carta és un trosset del meu cor.';
        showModal('Nota Secreta 💕', secretMessage);
    });
}

// Easter egg #5 – secret heart message after multiple clicks on the heart icon
function setupHeartSecret() {
    const heart = document.getElementById('header-heart');
    const message = document.getElementById('heart-secret');
    if (!heart || !message) return;

    let clickCount = 0;

    heart.addEventListener('click', function() {
        clickCount += 1;
        heart.classList.add('pulse');
        setTimeout(() => heart.classList.remove('pulse'), 400);

        if (clickCount >= 5) {
            message.textContent = 'Quan prems aquest cor, el meu batega una mica més fort per tu.';
            message.classList.add('visible');
            clickCount = 0;
        }
    });
}

// Easter egg #2 – hidden day 25 surprise button
function handleSecretDay25() {
    const secretButton = document.getElementById('secret-day25');
    if (!secretButton) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();

    const isAfterTarget = currentMonth > TARGET_MONTH;
    const isOnTargetDay = currentMonth === TARGET_MONTH && currentDate >= 25;
    const day24Opened = sessionStorage.getItem('day24Opened') === 'true';

    if (day24Opened && (isAfterTarget || isOnTargetDay)) {
        secretButton.classList.remove('hidden');
        secretButton.classList.add('visible');
        secretButton.addEventListener('click', function() {
            window.location.href = 'letters/day25.html';
        }, { once: true });
    }
}

// Easter egg #9 – confetti celebration after opening day 24 and returning
function triggerConfettiIfNeeded() {
    const day24Opened = sessionStorage.getItem('day24Opened') === 'true';
    const confettiAlreadyShown = sessionStorage.getItem('confettiShown') === 'true';
    if (!day24Opened || confettiAlreadyShown) {
        return;
    }

    launchConfetti();
    sessionStorage.setItem('confettiShown', 'true');
}

function launchConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;

    container.classList.add('active');
    const colors = ['#C97D7D', '#E8C99B', '#F5E6E6', '#8B9DC3', '#A68B7A'];

    for (let i = 0; i < 120; i++) {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.animationDelay = `${Math.random() * 2}s`;
        piece.style.animationDuration = `${3 + Math.random() * 2}s`;
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        container.appendChild(piece);
    }

    setTimeout(() => {
        container.classList.remove('active');
        container.innerHTML = '';
    }, 6000);
}

// ============================================
// QUESTION GAME FUNCTIONS
// ============================================

// Check if user is returning from a letter page and show question
function checkForReturnFromLetter() {
    // Check if user clicked the question tab from a letter page
    const showQuestionForDay = sessionStorage.getItem('showQuestionForDay');
    if (showQuestionForDay) {
        const day = parseInt(showQuestionForDay);
        showQuestionModal(day);
        sessionStorage.removeItem('showQuestionForDay');
        return;
    }
    
    // Check if we have a flag indicating return from letter
    const returnedFromLetter = sessionStorage.getItem('returnedFromLetter');
    const dayNumber = sessionStorage.getItem('returnedFromDay');
    
    if (returnedFromLetter === 'true' && dayNumber) {
        const day = parseInt(dayNumber);
        const questionShownKey = `questionShown_day${day}`;
        const questionShown = localStorage.getItem(questionShownKey);
        
        // Only show question if it hasn't been shown before for this day
        if (!questionShown) {
            showQuestionModal(day);
            localStorage.setItem(questionShownKey, 'true');
        }
        
        // Clear the return flag
        sessionStorage.removeItem('returnedFromLetter');
        sessionStorage.removeItem('returnedFromDay');
    }
}

// Show question modal for a specific day
function showQuestionModal(dayNumber) {
    const questionData = DAILY_QUESTIONS[dayNumber];
    if (!questionData) return;
    
    const modal = document.getElementById('question-modal');
    const questionText = document.getElementById('question-text');
    const questionInput = document.getElementById('question-answer-input');
    const questionFeedback = document.getElementById('question-feedback');
    const questionSubmit = document.getElementById('question-submit');
    const questionSkip = document.getElementById('question-skip');
    const modalOverlay = modal.querySelector('.modal-overlay');
    
    questionText.textContent = questionData.question;
    questionInput.value = '';
    questionFeedback.textContent = '';
    questionInput.disabled = false;
    questionSubmit.disabled = false;
    
    modal.classList.add('active');
    questionInput.focus();
    
    // Check if answer was already correct
    const answerCorrectKey = `questionAnswerCorrect_day${dayNumber}`;
    const wasCorrect = localStorage.getItem(answerCorrectKey) === 'true';
    const savedAnswerKey = `questionAnswer_day${dayNumber}`;
    const savedAnswer = localStorage.getItem(savedAnswerKey);
    
    if (wasCorrect && savedAnswer) {
        // Show correct answer (disabled)
        questionInput.value = savedAnswer;
        questionInput.disabled = true;
        questionSubmit.disabled = true;
        questionFeedback.textContent = '✓ Resposta correcta!';
        questionFeedback.classList.add('correct');
        questionFeedback.classList.remove('incorrect');
    } else {
        // If answer was incorrect or not answered, start with empty input
        questionInput.value = '';
    }
    
    // Close modal function
    function closeModal() {
        modal.classList.remove('active');
        questionInput.value = '';
        questionFeedback.textContent = '';
        questionFeedback.classList.remove('correct', 'incorrect');
    }
    
    // Submit answer
    function submitAnswer() {
        const answer = questionInput.value.trim();
        if (!answer) {
            questionFeedback.textContent = 'Introdueix una resposta.';
            questionFeedback.classList.add('incorrect');
            questionFeedback.classList.remove('correct');
            return;
        }
        
        // Validate answer (case insensitive)
        const correctAnswer = questionData.correctAnswer.toLowerCase().trim();
        const userAnswer = answer.toLowerCase().trim();
        
        if (correctAnswer && correctAnswer !== '') {
            // Check if answer is correct (case insensitive)
            if (userAnswer === correctAnswer) {
                // Correct answer
                localStorage.setItem(savedAnswerKey, answer);
                localStorage.setItem(answerCorrectKey, 'true');
                
                questionFeedback.textContent = '✓ Resposta correcta!';
                questionFeedback.classList.add('correct');
                questionFeedback.classList.remove('incorrect');
                questionInput.disabled = true;
                questionSubmit.disabled = true;
                
                setTimeout(() => {
                    closeModal();
                }, 1500);
            } else {
                // Incorrect answer - allow retry
                questionFeedback.textContent = 'Resposta incorrecta. Torna-ho a provar!';
                questionFeedback.classList.add('incorrect');
                questionFeedback.classList.remove('correct');
                questionInput.focus();
                questionInput.select();
            }
        } else {
            // No correct answer defined - accept any answer
            localStorage.setItem(savedAnswerKey, answer);
            localStorage.setItem(answerCorrectKey, 'true');
            
            questionFeedback.textContent = '✓ Resposta guardada!';
            questionFeedback.classList.add('correct');
            questionFeedback.classList.remove('incorrect');
            questionInput.disabled = true;
            questionSubmit.disabled = true;
            
            setTimeout(() => {
                closeModal();
            }, 1500);
        }
    }
    
    // Remove old listeners and add new ones
    const newSubmitBtn = questionSubmit.cloneNode(true);
    questionSubmit.parentNode.replaceChild(newSubmitBtn, questionSubmit);
    newSubmitBtn.addEventListener('click', submitAnswer);
    
    const newSkipBtn = questionSkip.cloneNode(true);
    questionSkip.parentNode.replaceChild(newSkipBtn, questionSkip);
    newSkipBtn.addEventListener('click', closeModal);
    
    questionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !questionInput.disabled) {
            submitAnswer();
        }
    });
    
    modalOverlay.onclick = closeModal;
    
    // Close on Escape key
    const escapeHandler = function(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

