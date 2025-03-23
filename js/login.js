document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const notificationArea = document.getElementById('notificationArea');

    function showNotification(message, isError = false) {
        notificationArea.style.display = 'block';
        notificationArea.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
        notificationArea.textContent = message;

        setTimeout(() => {
            notificationArea.style.display = 'none';
        }, 3000);
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = passwordInput.value;

        try {
            const response = await fetch('http://localhost:5000/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('userData', JSON.stringify(data.user));
                sessionStorage.setItem('loginMessage', data.message);

                showNotification('Login successful! Redirecting...', false);
                setTimeout(() => {
                    window.location.href = '../pages/dashboard.html';
                }, 1000);
            } else {
                showNotification(data.message, true);
            }
        } catch (error) {
            console.error('Error during login:', error);
            showNotification('Login failed! Please try again.', true);
        }
    });

    togglePassword.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePassword.textContent = 'Hide';
        } else {
            passwordInput.type = 'password';
            togglePassword.textContent = 'Show';
        }
    });

    if (sessionStorage.getItem('userLogged') === 'true') {
        window.location.href = '../pages/dashboard.html';
    }
});

function handleLogout() {
    sessionStorage.clear();
    window.location.href = '../pages/login.html';
}
