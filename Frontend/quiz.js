// ==========================================
// QUIZ SYSTEM JAVASCRIPT
// ==========================================

const API_URL = 'http://localhost:5000/api';

let currentQuiz = null;
let currentAttempt = null;
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let quizTimer = null;
let timeRemaining = 0;

// ==========================================
// LOAD QUIZZES
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadQuizzes();

    // Filters
    document.getElementById('categoryFilter').addEventListener('change', loadQuizzes);
    document.getElementById('difficultyFilter').addEventListener('change', loadQuizzes);
});

async function loadQuizzes() {
    const loading = document.getElementById('quizListLoading');
    const container = document.getElementById('quizListContainer');
    const empty = document.getElementById('quizListEmpty');

    loading.style.display = 'block';
    container.style.display = 'none';
    empty.style.display = 'none';

    try {
        const category = document.getElementById('categoryFilter').value;
        const difficulty = document.getElementById('difficultyFilter').value;

        let url = `${API_URL}/quiz?`;
        if (category) url += `category=${category}&`;
        if (difficulty) url += `difficulty=${difficulty}`;

        const response = await fetch(url);
        const data = await response.json();

        loading.style.display = 'none';

        if (data.success && data.data.quizzes.length > 0) {
            container.style.display = 'grid';
            container.innerHTML = '';

            data.data.quizzes.forEach(quiz => {
                container.appendChild(createQuizCard(quiz));
            });
        } else {
            empty.style.display = 'block';
        }

    } catch (error) {
        console.error('Error loading quizzes:', error);
        loading.style.display = 'none';
        empty.style.display = 'block';
    }
}

function createQuizCard(quiz) {
    const card = document.createElement('div');
    card.className = 'quiz-card';

    const difficultyColor = {
        'beginner': '#10b981',
        'intermediate': '#f59e0b',
        'advanced': '#ef4444'
    };

    card.innerHTML = `
        <div class="quiz-card-header">
            <span class="quiz-difficulty" style="background: ${difficultyColor[quiz.difficulty]}">
                ${quiz.difficulty}
            </span>
            <span class="quiz-category">${quiz.category}</span>
        </div>
        <h3 class="quiz-card-title">${quiz.title}</h3>
        <p class="quiz-card-description">${quiz.description || 'Test your knowledge!'}</p>
        <div class="quiz-card-info">
            <span>📝 ${quiz.totalQuestions} Questions</span>
            <span>⏱️ ${quiz.timeLimit} mins</span>
        </div>
        <button onclick="startQuizAttempt(${quiz.id})" class="btn-start-quiz">
            Start Quiz
        </button>
    `;

    return card;
}

// ==========================================
// START QUIZ
// ==========================================

async function startQuizAttempt(quizId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to take the quiz');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/quiz/${quizId}/start`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            currentQuiz = data.data.quiz;
            currentAttempt = data.data.attempt;
            questions = currentQuiz.questions;
            currentQuestionIndex = 0;
            userAnswers = {};
            timeRemaining = currentQuiz.timeLimit * 60; // Convert to seconds

            // Show quiz taking section
            document.getElementById('quizListSection').style.display = 'none';
            document.getElementById('quizTakingSection').style.display = 'block';

            // Load first question
            loadQuestion();

            // Start timer
            startTimer();

        } else {
            alert(data.message || 'Failed to start quiz');
        }

    } catch (error) {
        console.error('Error starting quiz:', error);
        alert('Failed to start quiz');
    }
}

// ==========================================
// LOAD QUESTION
// ==========================================

function loadQuestion() {
    const question = questions[currentQuestionIndex];

    document.getElementById('quizTitle').textContent = currentQuiz.title;
    document.getElementById('questionProgress').textContent = 
        `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    
    document.getElementById('questionNumber').textContent = 
        `Question ${currentQuestionIndex + 1}`;
    document.getElementById('questionText').textContent = question.questionText;

    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';

    // Load options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    //  Parse options if it's a string
    let options = question.options;
    if (typeof options === 'string') {
        try {
            options = JSON.parse(options);
        } catch (e) {
            console.error('Error parsing options:', e);
            options = [];
        }
    }

    const labels = ['A', 'B', 'C', 'D'];
    options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item';
        
        const isSelected = userAnswers[question.id] === labels[index];
        if (isSelected) {
            optionDiv.classList.add('selected');
        }

        optionDiv.innerHTML = `
            <input type="radio" 
                   name="answer" 
                   id="option${index}" 
                   value="${labels[index]}"
                   ${isSelected ? 'checked' : ''}>
            <label for="option${index}">
                <span class="option-label">${labels[index]}</span>
                <span class="option-text">${option}</span>
            </label>
        `;

        optionDiv.addEventListener('click', function() {
            selectOption(question.id, labels[index]);
        });

        optionsContainer.appendChild(optionDiv);
    });

    // Update navigation buttons
    document.getElementById('btnPrevious').disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === questions.length - 1) {
        document.getElementById('btnNext').style.display = 'none';
        document.getElementById('btnSubmit').style.display = 'block';
    } else {
        document.getElementById('btnNext').style.display = 'block';
        document.getElementById('btnSubmit').style.display = 'none';
    }
}

function selectOption(questionId, answer) {
    userAnswers[questionId] = answer;
    
    // Update UI
    document.querySelectorAll('.option-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
}

// ==========================================
// NAVIGATION
// ==========================================

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
}

function exitQuiz() {
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
        stopTimer();
        backToQuizList();
    }
}

// ==========================================
// TIMER
// ==========================================

function startTimer() {
    quizTimer = setInterval(() => {
        timeRemaining--;

        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        document.getElementById('quizTimer').textContent = 
            `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (timeRemaining <= 0) {
            stopTimer();
            alert('Time is up! Submitting your quiz...');
            submitQuiz();
        }
    }, 1000);
}

function stopTimer() {
    if (quizTimer) {
        clearInterval(quizTimer);
        quizTimer = null;
    }
}

// ==========================================
// SUBMIT QUIZ
// ==========================================

async function submitQuiz() {
    if (!confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
        return;
    }

    stopTimer();

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/quiz/attempt/${currentAttempt.id}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ answers: userAnswers })
        });

        const data = await response.json();

        if (data.success) {
            showResults(data.data);
        } else {
            alert(data.message || 'Failed to submit quiz');
        }

    } catch (error) {
        console.error('Error submitting quiz:', error);
        alert('Failed to submit quiz');
    }
}

// ==========================================
// SHOW RESULTS
// ==========================================

function showResults(results) {
    document.getElementById('quizTakingSection').style.display = 'none';
    document.getElementById('quizResultSection').style.display = 'block';

    // Update result data
    document.getElementById('scorePercentage').textContent = results.score;
    document.getElementById('scoreText').textContent = 
        `You scored ${results.correctAnswers} out of ${results.totalQuestions}`;
    document.getElementById('correctAnswers').textContent = results.correctAnswers;
    document.getElementById('incorrectAnswers').textContent = 
        results.totalQuestions - results.correctAnswers;

    const mins = Math.floor(results.timeTaken / 60);
    const secs = results.timeTaken % 60;
    document.getElementById('timeTaken').textContent = 
        `${mins}:${secs.toString().padStart(2, '0')}`;

    // Result icon and title
    if (results.passed) {
        document.getElementById('resultIcon').textContent = '🎉';
        document.getElementById('resultTitle').textContent = 'Congratulations!';
    } else {
        document.getElementById('resultIcon').textContent = '📚';
        document.getElementById('resultTitle').textContent = 'Keep Learning!';
    }

    // Load review
    const reviewContainer = document.getElementById('reviewContainer');
    reviewContainer.innerHTML = '';

    results.results.forEach((result, index) => {
        const reviewItem = document.createElement('div');
        reviewItem.className = `review-item ${result.isCorrect ? 'correct' : 'incorrect'}`;

        reviewItem.innerHTML = `
            <div class="review-header">
                <span class="review-number">Q${index + 1}</span>
                <span class="review-status">${result.isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
            </div>
            <p class="review-question">${result.questionText}</p>
            <div class="review-answers">
                <p><strong>Your answer:</strong> ${result.userAnswer || 'Not answered'}</p>
                ${!result.isCorrect ? `<p><strong>Correct answer:</strong> ${result.correctAnswer}</p>` : ''}
            </div>
            ${result.explanation ? `<p class="review-explanation">💡 ${result.explanation}</p>` : ''}
        `;

        reviewContainer.appendChild(reviewItem);
    });
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function backToQuizList() {
    document.getElementById('quizResultSection').style.display = 'none';
    document.getElementById('quizTakingSection').style.display = 'none';
    document.getElementById('quizListSection').style.display = 'block';
    
    currentQuiz = null;
    currentAttempt = null;
    questions = [];
    currentQuestionIndex = 0;
    userAnswers = {};
    
    loadQuizzes();
}

function retakeQuiz() {
    if (currentQuiz) {
        startQuizAttempt(currentQuiz.id);
    }
}

// Auth check (same as other pages)
async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const authButtons = document.getElementById('authButtons');

    if (token) {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const user = data.data.user;
                authButtons.innerHTML = `
                    <span style="color: white; margin-right: 15px; font-size: 15px;">
                        👋 ${user.name}
                    </span>
                    <a href="#" onclick="logout()" class="login-btn">Logout</a>
                `;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        location.reload();
    }
}