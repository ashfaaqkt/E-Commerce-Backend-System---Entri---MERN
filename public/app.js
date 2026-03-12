// Base API URL
const apiUrl = '/api';

// ── Custom Role Dropdown Logic ─────────────
(function () {
    const dropdown = document.getElementById('role-dropdown');
    if (!dropdown) return;
    const selected = document.getElementById('role-selected');
    const list = document.getElementById('role-list');
    const hiddenInput = document.getElementById('signup-role');
    const label = document.getElementById('role-label');

    selected.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    list.querySelectorAll('.custom-dropdown__item').forEach(item => {
        item.addEventListener('click', () => {
            list.querySelectorAll('.custom-dropdown__item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            hiddenInput.value = item.dataset.value;
            label.textContent = item.textContent.trim();
            dropdown.classList.remove('open');
        });
    });

    document.addEventListener('click', () => dropdown.classList.remove('open'));
})();


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
        const role = document.getElementById('signup-role')?.value || 'user';
        const errorMsg = document.getElementById('signup-error');

        try {
            const res = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
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

        // --- Tab Switching Logic ---
        const tabs = document.querySelectorAll('.dashboard-tab');
        const navItems = document.querySelectorAll('.sidebar-nav li');

        navItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                // Remove active class from all
                navItems.forEach(n => n.classList.remove('active'));
                tabs.forEach(t => t.style.display = 'none');

                // Add active class to clicked
                item.classList.add('active');

                // Show corresponding tab
                if (index === 0) document.getElementById('tab-intelligence').style.display = 'block';
                if (index === 1) {
                    document.getElementById('tab-data-matrix').style.display = 'block';
                    loadProductsGrid(headers);
                }
                if (index === 2) {
                    document.getElementById('tab-system-logs').style.display = 'block';
                    loadSystemLogs(headers);
                }
                if (index === 3) document.getElementById('tab-security').style.display = 'block';
            });
        });

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
            document.getElementById('profile-data').innerHTML = '<p class="error-msg">Failed to load profile data.</p>';
        }

        // Fetch Analytics/Recommendations
        try {
            const recRes = await fetch(`${apiUrl}/analytics/recommendations`, { headers });
            const recData = await recRes.json();

            if (recData.success) {
                const recContainer = document.getElementById('recommendations-data');
                if (recData.data.length === 0) {
                    recContainer.innerHTML = '<p>Insufficient heuristic data for prediction matrix. Deploying baseline assets...</p>';
                } else {
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
            }
        } catch (err) {
            document.getElementById('recommendations-data').innerHTML = '<p class="error-msg">Failed to connect to Neural Network.</p>';
        }

        // Fetch Products for Data Matrix Tab
        async function loadProductsGrid(headers) {
            try {
                const prodContainer = document.getElementById('all-products-grid');
                prodContainer.innerHTML = '<p class="loading-text">Fetching Node Data...</p>';

                const prodRes = await fetch(`${apiUrl}/products`, { headers });
                const prodData = await prodRes.json();

                if (prodData.success) {
                    if (prodData.data.length === 0) {
                        prodContainer.innerHTML = '<p>Database Empty. No Nodes Found.</p>';
                        return;
                    }
                    let html = '';
                    prodData.data.forEach(product => {
                        html += `
                            <div class="product-item" style="border-color: rgba(255,255,255,0.1)">
                                <h4 style="color:#e0e6ed">${product.name}</h4>
                                <p class="sub-text">${product.description.substring(0, 50)}...</p>
                                <p style="color:#00d4ff; margin-top: 5px;">$${product.price.toFixed(2)}</p>
                            </div>
                        `;
                    });
                    prodContainer.innerHTML = html;
                }
            } catch (err) {
                document.getElementById('all-products-grid').innerHTML = '<p class="error-msg">Connection Refused: Product Node.</p>';
            }
        }

        // Fetch Orders for System Logs Tab
        async function loadSystemLogs(headers) {
            try {
                const logContainer = document.getElementById('orders-list');
                logContainer.innerHTML = '<p class="loading-text">Retrieving Transaction Blocks...</p>';

                const logRes = await fetch(`${apiUrl}/orders/myorders`, { headers });
                const logData = await logRes.json();

                if (logData.success) {
                    if (logData.data.length === 0) {
                        logContainer.innerHTML = '<p>No historic transaction blocks present.</p>';
                        return;
                    }
                    let html = '';
                    logData.data.forEach(order => {
                        html += `
                            <div class="product-item" style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h4 style="color:#00ffff">Order Hash: ${order._id}</h4>
                                    <p class="sub-text">Items: ${order.orderItems.length} | Status: ${order.isPaid ? 'PAID' : 'PENDING'}</p>
                                </div>
                                <div style="text-align: right;">
                                    <p style="font-size: 1.2rem; font-weight: bold;">$${order.totalPrice.toFixed(2)}</p>
                                </div>
                            </div>
                        `;
                    });
                    logContainer.innerHTML = html;
                }
            } catch (err) {
                document.getElementById('orders-list').innerHTML = '<p class="error-msg">Decryption Failed on Log Retrieval.</p>';
            }
        }
    };

    loadDashboardData();
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const eyeIcon    = btn.querySelector('.eye-icon');
    const eyeOffIcon = btn.querySelector('.eye-off-icon');
    if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.style.display    = 'none';
        eyeOffIcon.style.display = 'block';
        btn.setAttribute('aria-label', 'Hide password');
    } else {
        input.type = 'password';
        eyeIcon.style.display    = 'block';
        eyeOffIcon.style.display = 'none';
        btn.setAttribute('aria-label', 'Show password');
    }
}
