// Base API URL
const apiUrl = '/api';

// --- Custom UI Elements Showcase Functionality ---
document.addEventListener('DOMContentLoaded', () => {
    // Theme Selector Logic
    const themeSelector = document.querySelector('.custom-select');
    if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
            const root = document.documentElement;
            const theme = e.target.value;

            if (theme === 'Neon Pink') {
                root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #24001c 0%, #790956 35%, #ff00d4 100%)');
                root.style.setProperty('--text-glow', '#ff00d4');
                root.style.setProperty('--accent-blue', '#ff00d4');
                root.style.setProperty('--accent-pink', '#00d4ff');
            } else if (theme === 'Matrix Green') {
                root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #001202 0%, #033f00 35%, #00ff26 100%)');
                root.style.setProperty('--text-glow', '#00ff26');
                root.style.setProperty('--accent-blue', '#00ff26');
                root.style.setProperty('--accent-pink', '#00ffff');
            } else {
                // Default Cyber Blue
                root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #020024 0%, #090979 35%, #00d4ff 100%)');
                root.style.setProperty('--text-glow', '#00ffff');
                root.style.setProperty('--accent-blue', '#00d4ff');
                root.style.setProperty('--accent-pink', '#d400ff');
            }
        });
    }

    // Predictive Engine Checkbox Logic
    const predictiveCheckbox = document.querySelector('.custom-checkbox input');
    if (predictiveCheckbox) {
        predictiveCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                alert("Predictive Engine Enabled: Analyzing neural pathways...");
                console.log("Predictive Engine Status: ONLINE");
            } else {
                alert("Predictive Engine Disabled: Reverting to standard operations.");
                console.log("Predictive Engine Status: OFFLINE");
            }
        });
    }
});

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
