// Base API URL
const apiUrl = '/api';

// Modal Handlers
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modals when clicking outside
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Authentication Handlers (index.html)
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorMsg = document.getElementById('login-error');

        try {
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                window.location.href = 'dashboard.html';
            } else {
                errorMsg.textContent = data.error || 'Authentication Failed';
            }
        } catch (err) {
            errorMsg.textContent = 'Network Error. Could not connect to Core.';
        }
    });

    document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const errorMsg = document.getElementById('signup-error');

        try {
            const res = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                window.location.href = 'dashboard.html';
            } else {
                errorMsg.textContent = data.error || 'Registration Failed';
            }
        } catch (err) {
            errorMsg.textContent = 'Network Error. Could not connect to Core.';
        }
    });

    document.getElementById('forgot-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        const errorMsg = document.getElementById('forgot-error');

        try {
            const res = await fetch(`${apiUrl}/auth/forgotpassword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (data.success) {
                document.getElementById('forgot-form').style.display = 'none';
                document.getElementById('reset-form').style.display = 'block';
                // Attach the email for the next request
                localStorage.setItem('temp_reset_email', email);
            } else {
                errorMsg.textContent = data.error;
            }
        } catch (err) {
            errorMsg.textContent = 'Network Error.';
        }
    });

    document.getElementById('reset-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = localStorage.getItem('temp_reset_email');
        const otp = document.getElementById('reset-otp').value;
        const newPassword = document.getElementById('reset-password').value;
        const errorMsg = document.getElementById('reset-error');

        try {
            const res = await fetch(`${apiUrl}/auth/resetpassword`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.removeItem('temp_reset_email');
                localStorage.setItem('token', data.token);
                window.location.href = 'dashboard.html';
            } else {
                errorMsg.textContent = data.error;
            }
        } catch (err) {
            errorMsg.textContent = 'Network Error.';
        }
    });
}

// Dashboard Handlers (dashboard.html)
if (window.location.pathname.includes('dashboard.html')) {
    const loadDashboardData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const headers = {
            'Authorization': `Bearer ${token}`
        };

        // Fetch User Profile
        try {
            const userRes = await fetch(`${apiUrl}/auth/me`, { headers });
            const userData = await userRes.json();

            if (userData.success) {
                document.getElementById('user-name-display').textContent = `Operator: ${userData.data.name}`;
                document.getElementById('profile-data').innerHTML = `
                    <p><strong>Alias:</strong> ${userData.data.name}</p>
                    <p><strong>Transmission Node:</strong> ${userData.data.email}</p>
                    <p><strong>Role Level:</strong> ${userData.data.role.toUpperCase()}</p>
                    <p><strong>ID Stamp:</strong> ${userData.data._id}</p>
                `;
            }
        } catch (err) {
            console.error('Failed to load profile');
        }

        // Fetch Analytics/Recommendations
        try {
            const recRes = await fetch(`${apiUrl}/analytics/recommendations`, { headers });
            const recData = await recRes.json();

            if (recData.success) {
                const recContainer = document.getElementById('recommendations-data');
                if (recData.data.length === 0) {
                    recContainer.innerHTML = '<p>Insufficient heuristic data for prediction matrix.</p>';
                    return;
                }

                let html = '';
                recData.data.forEach(product => {
                    html += `
                        <div class="product-item">
                            <h4 style="color:#00d4ff">${product.name}</h4>
                            <p class="sub-text">Category: ${product.category}</p>
                            <p><strong>$${product.price.toFixed(2)}</strong></p>
                            <p>Rating: ${product.averageRating || 'N/A'}/5</p>
                            <button class="btn-glow-alt mt-2" style="padding: 0.5rem 1rem; width:100%">Add Link</button>
                        </div>
                    `;
                });
                recContainer.innerHTML = html;
            }
        } catch (err) {
            document.getElementById('recommendations-data').innerHTML = '<p class="error-msg">Failed to connect to Neural Network.</p>';
        }
    };

    loadDashboardData();
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}
