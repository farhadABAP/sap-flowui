// Check Session on Load
window.addEventListener('DOMContentLoaded', () => {
    const user = sessionStorage.getItem('sapUser');
    if (user) {
        showApp(user);
    }
});

// Handle Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const client = document.getElementById('client').value;
    const btn = document.getElementById('loginBtn');
    const error = document.getElementById('loginError');
    
    // UI Loading
    btn.disabled = true;
    btn.textContent = 'Checking...';
    error.textContent = '';
    
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, client })
        });
        
        const data = await res.json();
        
        if (data.success) {
            // Save Session
            sessionStorage.setItem('sapUser', data.username);
            sessionStorage.setItem('sapClient', data.client);
            showApp(data.username);
        } else {
            error.textContent = '❌ ' + data.error;
            btn.disabled = false;
            btn.textContent = 'Log On';
        }
    } catch (err) {
        error.textContent = '❌ Server Error!';
        btn.disabled = false;
        btn.textContent = 'Log On';
    }
});

// Show App after Login
function showApp(username) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('userInfo').textContent = '👤 ' + username;
}

// Logout
function logout() {
    sessionStorage.clear();
    location.reload();
}
