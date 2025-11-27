// ==========================================
// Configuration
// ==========================================
const API_URL = 'http://localhost:5000/api';

// ==========================================
// Check Authentication Status on Page Load
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

// ==========================================
// Check if User is Logged In
// ==========================================
async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const authButtons = document.getElementById('authButtons');

    if (token) {
        try {
            // Verify token by calling /api/auth/me
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const user = data.data.user;

                // Show logged in user info
                authButtons.innerHTML = `
                    <span style="color: white; margin-right: 15px;">
                        Welcome, ${user.name}!
                    </span>
                    <a href="#" onclick="logout()" class="login-btn">Logout</a>
                `;
            } else {
                // Token invalid, show login button
                showLoginButton();
            }
        } catch (error) {
            console.error('Auth check error:', error);
            showLoginButton();
        }
    } else {
        showLoginButton();
    }
}

function showLoginButton() {
    const authButtons = document.getElementById('authButtons');
    authButtons.innerHTML = `
        <a href="#" onclick="openLoginModal()" class="login-btn">Log In</a>
    `;
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

// Close modal when clicking outside
window.onclick = (event) => {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (event.target == loginModal) {
        closeLoginModal();
    }
    if (event.target == registerModal) {
        closeRegisterModal();
    }
};

// ==========================================
// Login Function
// ==========================================
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const messageEl = document.getElementById('loginMessage');
    const submitBtn = e.target.querySelector('button');

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    messageEl.textContent = '';

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Success
            messageEl.style.color = 'green';
            messageEl.textContent = '✅ Login successful! Redirecting...';

            // Save token
            localStorage.setItem('token', data.data.token);

            // Save user info
            localStorage.setItem('user', JSON.stringify(data.data.user));

            // Redirect after 1 second
            setTimeout(() => {
                closeLoginModal();
                checkAuthStatus();
                location.reload();
            }, 1000);

        } else {
            // Error
            messageEl.style.color = 'red';
            messageEl.textContent = '❌ ' + (data.message || 'Login failed');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }

    } catch (error) {
        console.error('Login error:', error);
        messageEl.style.color = 'red';
        messageEl.textContent = '❌ Network error. Please check if backend is running.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
});

// ==========================================
// Register Function
// ==========================================
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const messageEl = document.getElementById('registerMessage');
    const submitBtn = e.target.querySelector('button');

    // Validation
    if (password.length < 6) {
        messageEl.style.color = 'red';
        messageEl.textContent = '❌ Password must be at least 6 characters';
        return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
    messageEl.textContent = '';

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Success
            messageEl.style.color = 'green';
            messageEl.textContent = '✅ Account created! Logging you in...';

            // Save token
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            // Redirect after 1 second
            setTimeout(() => {
                closeRegisterModal();
                checkAuthStatus();
                location.reload();
            }, 1000);

        } else {
            // Error
            messageEl.style.color = 'red';
            messageEl.textContent = '❌ ' + (data.message || 'Registration failed');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        }

    } catch (error) {
        console.error('Register error:', error);
        messageEl.style.color = 'red';
        messageEl.textContent = '❌ Network error. Please check if backend is running.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
    }
});

// ==========================================
// Logout Function
// ==========================================
async function logout() {
    const token = localStorage.getItem('token');

    try {
        // Call logout API (optional)
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }

    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirect to home
    alert('✅ Logged out successfully!');
    location.reload();
}

// ==========================================
// Toggle Topics Function
// ==========================================
function toggleTopics() {
    const additionalTopics = document.getElementById('additionalTopics');
    const viewAllBtn = document.getElementById('viewAllBtn');
    
    if (additionalTopics.classList.contains('hidden')) {
        additionalTopics.classList.remove('hidden');
        viewAllBtn.textContent = 'Show less ↑';
        additionalTopics.scrollIntoView({ behavior: 'smooth' });
    } else {
        additionalTopics.classList.add('hidden');
        viewAllBtn.textContent = 'View all →';
        document.getElementById('initialTopics').scrollIntoView({ behavior: 'smooth' });
    }
}