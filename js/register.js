document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
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

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const fullName = document.getElementById('fullName').value;
        const password = passwordInput.value;

        try {
            const response = await fetch('http://localhost:5000/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, fullName, password })
            });

            const data = await response.json();

            if (data.status === 'success') {
                showNotification('Registration successful! Redirecting to login page...', false);
                setTimeout(() => {
                    window.location.href = '../pages/login.html';
                }, 1000);
            } else {
                showNotification(data.message, true);
            }
        } catch (error) {
            showNotification('Terjadi kesalahan pada server', true);
            console.error('Error:', error);
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
});
