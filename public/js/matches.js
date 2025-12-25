document.addEventListener('DOMContentLoaded', async () => {
    const matchesList = document.getElementById('matchesList');

    const safeText = (s) => (s === null || s === undefined) ? '' : String(s);

    const renderEmpty = (msg) => {
        matchesList.innerHTML = `<div class="empty-state">${msg || 'No matches yet.'}</div>`;
    };

    const createCard = (u) => {
        const card = document.createElement('div');
        card.className = 'match-card';

        // Avatar
        const avatar = document.createElement('div');
        avatar.className = 'match-avatar';
        const imgUrl = u.avatar_url || u.photo || u.profile_image || null;
        if (imgUrl) {
            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = safeText(u.name) + ' avatar';
            avatar.appendChild(img);
        } else {
            const initials = (safeText(u.name) || 'U').split(/\s+/).map(s => s[0]).slice(0,2).join('').toUpperCase();
            avatar.textContent = initials;
        }

        // Info column (name + email)
        const info = document.createElement('div');
        info.className = 'match-info';
        const nameEl = document.createElement('div');
        nameEl.className = 'match-name-under';
        nameEl.textContent = safeText(u.name) || 'Unnamed';
        const emailEl = document.createElement('div');
        emailEl.className = 'match-email';
        emailEl.textContent = safeText(u.email) || '';
        info.appendChild(nameEl);
        info.appendChild(emailEl);

        // Message button
        const msgBtn = document.createElement('button');
        msgBtn.className = 'btn-primary';
        msgBtn.type = 'button';
        msgBtn.textContent = 'Message';
        msgBtn.addEventListener('click', () => {
            window.location.href = `/messages.html?to=${encodeURIComponent(u.id)}`;
        });

        card.appendChild(avatar);
        card.appendChild(info);
        card.appendChild(msgBtn);

        return card;
    };

    // require auth and get current user
    const user = await Auth.requireAuth();
    if (!user) return; // redirected by Auth.requireAuth

    const token = Auth.getToken();

    try {
        

        const resp = await fetch(`/api/matches/${user.id}`, {
            cache: 'no-store'
        });
        if (!resp.ok) {
            renderEmpty('Unable to load matches.');
            return;
        }

        const matches = await resp.json();
        console.log(matches);
        if (!Array.isArray(matches) || matches.length === 0) {
            renderEmpty('You have no matches yet.');
            return;
        }

        matchesList.innerHTML = '';
        matches.forEach(m => {
            const card = createCard(m);
            matchesList.appendChild(card);
        });

    } catch (err) {
        console.error('Error loading matches', err);
        renderEmpty('Error loading matches.');
    }
});
