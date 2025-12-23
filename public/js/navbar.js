document.addEventListener('DOMContentLoaded', async () => {
    const profileBtn = document.getElementById('profileBtn');
    const profileBtnText = document.getElementById('profileBtnText');
    const navLinks = Array.from(document.querySelectorAll('.nav-links .nav-profile-btn'));
    const logoutBtn = document.getElementById('logoutBtn');

    // show/hide auth-only links (FAQ stays visible)
    const setAuthVisibility = (visible) => {
        navLinks.forEach((el) => {
            if (el.id === 'navFAQ') {
                el.style.display = '';
                return;
            }
            el.style.display = visible ? '' : 'none';
        });
    };

    const user = await Auth.validateAndGetUser();

    const escapeHtml = (str) => String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    if (user) {
        const displayName = user.name || 'Profile';
        const first = (String(displayName).split(/\s+/)[0] || displayName).toUpperCase();
        if (profileBtnText) {
            profileBtnText.innerHTML = `<span class="profile-symbol">☺</span><span class="profile-name">${escapeHtml(displayName)}</span>`;
        }
        setAuthVisibility(true);
    } else {
        if (profileBtnText) profileBtnText.textContent = 'Sign In';
        setAuthVisibility(false);
    }

    navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = href;
        });
    });

    if (profileBtn) {
        profileBtn.addEventListener('click', async () => {
            const currentUser = await Auth.validateAndGetUser();
            window.location.href = currentUser ? '/dashboard.html' : '/login.html';
        });
    }

    logoutBtn && logoutBtn.addEventListener('click', () => {
        Auth.removeToken();
        window.location.href = '/';
    });
});

