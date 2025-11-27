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
        viewAllBtn.textContent = 'Show less ↑';
        additionalTopics.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        additionalTopics.classList.add('hidden');
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
            messageEl.textContent = '✅ Account created successfully!';
            
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
        messageEl.textContent = '❌ Cannot connect to server. Please ensure backend is running.';
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
// COMMENTS FUNCTIONALITY
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    const commentForm = document.getElementById('commentForm');
    const commentText = document.getElementById('commentText');
    const charCount = document.getElementById('charCount');
    const commentsList = document.getElementById('commentsList');
    const commentsLoading = document.getElementById('commentsLoading');
    const commentsEmpty = document.getElementById('commentsEmpty');
    const commentCount = document.getElementById('commentCount');

    // Get current page ID from URL
    const pageId = window.location.pathname.split('/').pop().replace('.html', '') || 'basics';

    // Character counter
    if (commentText) {
        commentText.addEventListener('input', function() {
            charCount.textContent = this.value.length;
        });
    }

    // Load comments on page load
    loadComments();

    // Submit comment
    if (commentForm) {
        commentForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to post a comment');
                if (typeof openLoginModal === 'function') {
                    openLoginModal();
                }
                return;
            }

            const content = commentText.value.trim();
            if (!content) return;

            const submitBtn = this.querySelector('.btn-submit-comment');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');

            try {
                submitBtn.disabled = true;
                btnText.style.display = 'none';
                btnLoader.style.display = 'inline';

                const response = await fetch(`${API_URL}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        articleId: pageId,
                        content: content
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    commentText.value = '';
                    charCount.textContent = '0';
                    loadComments();
                    showNotification('✅ Comment posted successfully!', 'success');
                } else {
                    throw new Error(data.message || 'Failed to post comment');
                }

            } catch (error) {
                console.error('Error posting comment:', error);
                showNotification('❌ Failed to post comment. Please try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';
            }
        });
    }

    // Load comments from API
    async function loadComments() {
        try {
            commentsLoading.style.display = 'block';
            commentsEmpty.style.display = 'none';
            
            const existingComments = commentsList.querySelectorAll('.comment-card');
            existingComments.forEach(card => card.remove());

            const response = await fetch(`${API_URL}/comments/${pageId}`);
            const data = await response.json();

            commentsLoading.style.display = 'none';

            if (response.ok && data.data.comments.length > 0) {
                const comments = data.data.comments;
                commentCount.textContent = comments.length;

                comments.forEach(comment => {
                    const commentCard = createCommentCard(comment);
                    commentsList.appendChild(commentCard);
                });
            } else {
                commentsEmpty.style.display = 'block';
                commentCount.textContent = '0';
            }

        } catch (error) {
            console.error('Error loading comments:', error);
            commentsLoading.style.display = 'none';
            commentsEmpty.style.display = 'block';
        }
    }

    // Create comment card HTML
    function createCommentCard(comment) {
        const card = document.createElement('div');
        card.className = 'comment-card';
        
        const timeAgo = getTimeAgo(new Date(comment.createdAt));
        const avatarEmoji = getRandomAvatar();

        card.innerHTML = `
            <div class="comment-header">
                <div class="comment-avatar">${avatarEmoji}</div>
                <div class="comment-author-info">
                    <div class="comment-author">${escapeHtml(comment.user?.name || 'Anonymous')}</div>
                    <div class="comment-time">${timeAgo}</div>
                </div>
            </div>
            <div class="comment-content">${escapeHtml(comment.content)}</div>
            <div class="comment-actions">
                <button class="comment-action-btn" onclick="likeComment(${comment.id})">
                    👍 Like <span class="like-count">${comment.likes || 0}</span>
                </button>
            </div>
        `;

        return card;
    }

    // Helper functions
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
    }

    function getRandomAvatar() {
        const avatars = ['👨', '👩', '🧑', '👤', '😊', '🎓', '👨‍⚕️', '👩‍⚕️'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showNotification(message, type) {
        alert(message);
    }
});

// Like comment function
function likeComment(commentId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to like comments');
        return;
    }

    fetch(`${API_URL}/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Update like count in UI
            const likeBtn = event.target.closest('.comment-action-btn');
            const likeCount = likeBtn.querySelector('.like-count');
            if (likeCount) {
                likeCount.textContent = data.data.likes;
            }
        }
    })
    .catch(err => console.error('Like error:', err));
}

// Read More/Less functionality
document.addEventListener('DOMContentLoaded', function() {
    const overviewSection = document.querySelector('.overview-section');
    
    if (overviewSection) {
        const container = overviewSection.querySelector('.container');
        const allElements = Array.from(container.children);
        
        const firstH2 = container.querySelector('h2');
        const firstP = container.querySelector('p');
        
        const expandableDiv = document.createElement('div');
        expandableDiv.className = 'expandable-text';
        expandableDiv.style.display = 'none';
        
        let foundFirst = false;
        allElements.forEach(element => {
            if (element === firstP) {
                foundFirst = true;
                return;
            }
            if (foundFirst) {
                expandableDiv.appendChild(element.cloneNode(true));
                element.remove();
            }
        });
        
        const readMoreLink = document.createElement('p');
        readMoreLink.className = 'read-more-link';
        readMoreLink.innerHTML = '<a href="javascript:void(0)">+ Read more</a>';
        
        const readLessLink = document.createElement('p');
        readLessLink.className = 'read-less-link';
        readLessLink.innerHTML = '<a href="javascript:void(0)">- Read less</a>';
        
        firstP.after(readMoreLink);
        readMoreLink.after(expandableDiv);
        expandableDiv.appendChild(readLessLink);
        
        readMoreLink.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault();
            expandableDiv.style.display = 'block';
            readMoreLink.style.display = 'none';
            expandableDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        
        readLessLink.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault();
            expandableDiv.style.display = 'none';
            readMoreLink.style.display = 'block';
            firstH2.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
});