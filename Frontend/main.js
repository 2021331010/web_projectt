// ==========================================
// API Configuration
// ==========================================
const API_URL = 'http://localhost:5000/api';

// ==========================================
// Toggle Topics Function
// ==========================================
function toggleTopics() {
    const additionalTopics = document.getElementById('additionalTopics');
    const viewAllBtn = document.getElementById('viewAllBtn');

    if (additionalTopics.classList.contains('hidden')) {
        additionalTopics.classList.remove('hidden');
        additionalTopics.style.display = 'grid';
        viewAllBtn.textContent = 'Show less ↑';
        additionalTopics.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        additionalTopics.classList.add('hidden');
        additionalTopics.style.display = 'none';
        viewAllBtn.textContent = 'View all →';
        document.getElementById('initialTopics').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// ==========================================
// Check Authentication Status on Load
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

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
                        👋 Welcome, ${user.name}
                    </span>
                    <a href="#" onclick="logout()" class="login-btn">Logout</a>
                `;
            } else {
                showLoginButton();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            showLoginButton();
        }
    } else {
        showLoginButton();
    }
}

function showLoginButton() {
    const authButtons = document.getElementById('authButtons');
    authButtons.innerHTML = '<a href="#" onclick="openLoginModal()" class="login-btn">Log In</a>';
}

// ==========================================
// Modal Functions
// ==========================================
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('loginMessage').textContent = '';
}

function openRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('registerForm').reset();
    document.getElementById('registerMessage').textContent = '';
}

function switchToRegister() {
    closeLoginModal();
    openRegisterModal();
}

function switchToLogin() {
    closeRegisterModal();
    openLoginModal();
}

// Close modal on outside click
window.onclick = (event) => {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    if (event.target == loginModal) closeLoginModal();
    if (event.target == registerModal) closeRegisterModal();
};

// ==========================================
// Login Functionality
// ==========================================
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const messageEl = document.getElementById('loginMessage');
    const submitBtn = e.target.querySelector('button');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    messageEl.textContent = '';

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
            messageEl.style.color = '#10b981';
            messageEl.textContent = '✅ Login successful! Redirecting...';

            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            setTimeout(() => {
                closeLoginModal();
                location.reload();
            }, 1000);
        } else {
            messageEl.style.color = '#ef4444';
            messageEl.textContent = '❌ ' + (data.message || 'Login failed');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    } catch (error) {
        console.error('Login error:', error);
        messageEl.style.color = '#ef4444';
        messageEl.textContent = '❌ Cannot connect to server. Please ensure backend is running.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
});

// ==========================================
// Register Functionality
// ==========================================
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const messageEl = document.getElementById('registerMessage');
    const submitBtn = e.target.querySelector('button');

    if (password.length < 6) {
        messageEl.style.color = '#ef4444';
        messageEl.textContent = '❌ Password must be at least 6 characters';
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
    messageEl.textContent = '';

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();

        if (response.ok) {
            messageEl.style.color = '#10b981';
            messageEl.textContent = 'Account created successfully!';

            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            setTimeout(() => {
                closeRegisterModal();
                location.reload();
            }, 1000);
        } else {
            messageEl.style.color = '#ef4444';
            messageEl.textContent = '❌ ' + (data.message || 'Registration failed');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        }
    } catch (error) {
        console.error('Register error:', error);
        messageEl.style.color = '#ef4444';
        messageEl.textContent = 'Cannot connect to server. Please ensure backend is running.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
    }
});

// ==========================================
// Logout Functionality
// ==========================================
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('✅ Logged out successfully!');
        location.reload();
    }
}

// ==========================================
// COMMENTS FUNCTIONALITY with View All
// ==========================================


document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('commentForm');
    const commentText = document.getElementById('commentText');
    const charCount = document.getElementById('charCount');
    const commentsList = document.getElementById('commentsList');
    const commentsLoading = document.getElementById('commentsLoading');
    const commentsEmpty = document.getElementById('commentsEmpty');
    const commentCount = document.getElementById('commentCount');

    // **View All button create dynamically**
    let viewAllBtn = document.getElementById('viewAllCommentsBtn');
    if (!viewAllBtn) {
        viewAllBtn = document.createElement('button');
        viewAllBtn.id = 'viewAllCommentsBtn';
        viewAllBtn.style.display = 'none';
        viewAllBtn.style.marginTop = '10px';
        viewAllBtn.textContent = 'View All Comments';
        commentsList.parentNode.appendChild(viewAllBtn);
    }

    const pageId = window.location.pathname.split('/').pop().replace('.html', '') || 'basics';
    let allComments = [];
    let showingAll = false;

    commentText?.addEventListener('input', () => charCount.textContent = commentText.value.length);

    loadComments();

    commentForm?.addEventListener('submit', async e => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return alert('Please login to post a comment');

        const content = commentText.value.trim();
        if (!content) return;

        const submitBtn = commentForm.querySelector('.btn-submit-comment');
        toggleButton(submitBtn, true);

        try {
            const res = await fetch(`${API_URL}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ articleId: pageId, content })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to post comment');

            commentText.value = '';
            charCount.textContent = '0';
            loadComments();
            alert('✅ Comment posted successfully!');
        } catch (err) {
            console.error(err);
            alert('❌ Failed to post comment. Please try again.');
        } finally {
            toggleButton(submitBtn, false);
        }
    });

    async function loadComments() {
        commentsLoading.style.display = 'block';
        commentsEmpty.style.display = 'none';
        commentsList.innerHTML = '';

        try {
            const res = await fetch(`${API_URL}/comments/${pageId}`);
            const data = await res.json();
            commentsLoading.style.display = 'none';

            if (res.ok && data.data.comments.length > 0) {
                allComments = data.data.comments;
                commentCount.textContent = allComments.length;
                displayComments();
            } else {
                commentsEmpty.style.display = 'block';
                commentCount.textContent = '0';
                viewAllBtn.style.display = 'none';
            }
        } catch (err) {
            console.error(err);
            commentsLoading.style.display = 'none';
            commentsEmpty.style.display = 'block';
        }
    }

    function displayComments() {
        commentsList.innerHTML = '';
        const commentsToShow = showingAll ? allComments : allComments.slice(0, 3);
        commentsToShow.forEach(comment => commentsList.appendChild(createCommentCard(comment)));

        if (allComments.length > 3) {
            viewAllBtn.style.display = 'inline-block';
            viewAllBtn.textContent = showingAll ? 'Show Less' : 'View All Comments';
        } else {
            viewAllBtn.style.display = 'none';
        }
    }

    viewAllBtn.addEventListener('click', () => {
        showingAll = !showingAll;
        displayComments();
    });

    function createCommentCard(comment) {
        const card = document.createElement('div');
        card.className = 'comment-card';
        card.innerHTML = `
            <div class="comment-header">
                <div class="comment-avatar">${randomAvatar()}</div>
                <div class="comment-author-info">
                    <div class="comment-author">${escapeHtml(comment.user?.name || 'Anonymous')}</div>
                    <div class="comment-time">${timeAgo(new Date(comment.createdAt))}</div>
                </div>
            </div>
            <div class="comment-content">${escapeHtml(comment.content)}</div>
            <div class="comment-actions">
                <button class="comment-action-btn" onclick="likeComment(${comment.id}, event)">
                    👍 <span class="like-count">${comment.likes || 0}</span>
                </button>
            </div>
        `;
        return card;
    }

    function toggleButton(btn, loading) {
        if (!btn) return;
        btn.disabled = loading;
        btn.querySelector('.btn-text').style.display = loading ? 'none' : 'inline';
        btn.querySelector('.btn-loader').style.display = loading ? 'inline' : 'none';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function randomAvatar() {
        const avatars = ['👨','👩','🧑','👤','😊','🎓','👨‍⚕️','👩‍⚕️'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }

    function timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
        for (let [unit, sec] of Object.entries(intervals)) {
            const val = Math.floor(seconds / sec);
            if (val >= 1) return `${val} ${unit}${val > 1 ? 's' : ''} ago`;
        }
        return 'Just now';
    }
});

// Like comment
function likeComment(commentId, event) {
    const token = localStorage.getItem('token');
    if (!token) return alert('Please login to like comments');

    fetch(`${API_URL}/comments/${commentId}/like`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const likeCount = event.target.closest('.comment-action-btn').querySelector('.like-count');
                if (likeCount) likeCount.textContent = data.data.likes;
            }
        })
        .catch(err => console.error(err));
}


// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================
const searchInput = document.querySelector('.search-bar input');
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    const initialTopics = document.getElementById('initialTopics');
    const additionalTopics = document.getElementById('additionalTopics');
    const allTopics = [...initialTopics.querySelectorAll('.topic-card'), 
                       ...additionalTopics.querySelectorAll('.topic-card')];

    let anyVisible = false;

    allTopics.forEach(topic => {
        const text = topic.querySelector('h3').textContent.toLowerCase();
        if (text.includes(query)) {
            topic.style.display = 'block';
            anyVisible = true;
        } else {
            topic.style.display = 'none';
        }
    });

    const viewAllBtn = document.getElementById('viewAllBtn');
    if (query.length > 0) {
        viewAllBtn.style.display = 'none';
        initialTopics.style.display = 'grid';
        additionalTopics.style.display = 'grid';
    } else {
        viewAllBtn.style.display = 'block';
        if (additionalTopics.classList.contains('hidden')) {
            additionalTopics.style.display = 'none';
        } else {
            additionalTopics.style.display = 'grid';
        }
        initialTopics.style.display = 'grid';
    }
});
