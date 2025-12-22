document.addEventListener('DOMContentLoaded', async () => {
    const errorMessage = document.getElementById('errorMessage');

    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error && errorMessage) {
        errorMessage.style.display = 'block';
        const messages = {
            access_denied: 'Access denied. Please use your school email account.',
            invalid_email: 'Invalid email format. Please try again.'
        };
        errorMessage.textContent = messages[error] || 'An error occurred during authentication. Please try again.';
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }

    // success logging in
    const user = await Auth.validateAndGetUser();
    if (user) {
        window.location.href = '/dashboard.html';
        return;
    }
});