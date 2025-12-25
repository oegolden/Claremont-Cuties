document.addEventListener('DOMContentLoaded', async () => {
    const matchesList = document.getElementById('matchesList');

    const safeText = (s) => (s === null || s === undefined) ? '' : String(s);

    const renderEmpty = (msg) => {
        matchesList.innerHTML = `<div class="empty-state">${msg || 'No matches yet.'}</div>`;
    };

    const createCard = (u) => {
        const card = document.createElement('div');
        card.className = 'match-card';

        const avatarWrap = document.createElement('div');
        avatarWrap.className = 'match-avatar';
        // Try common photo fields, otherwise show initials
        const imgUrl = u.user_photo|| null;
        if (imgUrl) {
            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = safeText(u.name) + ' avatar';
            avatarWrap.appendChild(img);
        } else {
            const initials = (safeText(u.name) || 'U').split(/\s+/).map(s => s[0]).slice(0,2).join('').toUpperCase();
            avatarWrap.textContent = initials;
        }

        const info = document.createElement('div');
        info.className = 'match-info';

        const name = document.createElement('h3');
        name.textContent = safeText(u.name) || 'Unnamed';

        const meta = document.createElement('div');
        meta.className = 'match-meta';
        const parts = [];
        if (u.age) parts.push(`${u.age} yrs`);
        if (u.campus) parts.push(safeText(u.campus));
        meta.textContent = parts.join(' • ');

        const email = document.createElement('div');
        email.className = 'match-email';
        email.textContent = safeText(u.email);

        const socials = document.createElement('div');
        socials.className = 'match-socials';
        socials.textContent = safeText(u.social_media_accounts);

        const actions = document.createElement('div');
        actions.className = 'match-actions';

        const msgBtn = document.createElement('button');
        msgBtn.className = 'btn-primary';
        msgBtn.textContent = 'Message';
        msgBtn.addEventListener('click', () => {
            window.location.href = `/messages.html?to=${encodeURIComponent(u.id)}`;
        });

        actions.appendChild(msgBtn);

        info.appendChild(name);
        info.appendChild(meta);
        if (u.email) info.appendChild(email);
        if (u.social_media_accounts) info.appendChild(socials);
        info.appendChild(actions);

        card.appendChild(avatarWrap);
        card.appendChild(info);

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
