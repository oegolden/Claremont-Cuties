document.addEventListener('DOMContentLoaded', async () => {
    const hash = window.location.hash.substring(1);
    if (hash.startsWith('token=')) {
        const token = decodeURIComponent(hash.split('=')[1]);
        Auth.setToken(token);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    const user = await Auth.requireAuth();
    if (!user) return;

    displayUserProfile(user);

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn && logoutBtn.addEventListener('click', () => {
        Auth.removeToken();
        window.location.href = '/';
    });

    const profileBtnText = document.getElementById('profileBtnText');
    if (profileBtnText) {
        const name = user.name || user.email || 'Profile';
        const first = (String(name).split(/\s+/)[0] || name).toUpperCase();
        const escapeHtml = (str) => String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        profileBtnText.innerHTML = `<span class="profile-symbol">☺</span><span class="profile-name">${escapeHtml(first)}</span>`;
    }

    showAnalysis(user);
});

function displayUserProfile(user) {
    const profileDiv = document.getElementById('userProfile');
    if (!profileDiv) return;

    // Populate form inputs if present
    const setValue = (id, value) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = value == null ? '' : value;
    };

    setValue('profileName', user.name || '');
    setValue('profileEmail', user.email || '');
    setValue('profileAge', user.age || '');
    setValue('profileHometown', user.home_location || '');
    setValue('profileCampus', user.campus || '');
    setValue('profileCampusOther', '');
    setValue('profileYear', user.year || '');
    setValue('profileInstagram', user.social_media_accounts || '');
    setValue('profileGender', user.gender || '');
    setValue('profileGenderOther', '');
    setValue('profileOrientation', user.sexual_orientation || '');
    setValue('profileOrientationOther', '');

    const guessCampusFromEmail = (email) => {
        if (!email) return '';
        const e = String(email).toLowerCase();
        if (/\b(hmc)\b|hmc\.edu/.test(e)) return 'Harvey Mudd';
        if (/pitzer/.test(e)) return 'Pitzer';
        if (/pomona/.test(e)) return 'Pomona';
        if (/cmc/.test(e)) return 'Claremont McKenna';
        if (/scripps/.test(e)) return 'Scripps';
        return '';
    };

    // Utility to set a select and an "other" text input when value isn't in options
    const setSelectOrOther = (selectId, otherId, value, options) => {
        const sel = document.getElementById(selectId);
        const other = document.getElementById(otherId);
        if (!sel) return;
        const v = value == null ? '' : String(value).trim();
        const found = options.find(o => o.toLowerCase() === v.toLowerCase());
        if (found) {
            sel.value = found;
            if (other) { other.style.display = 'none'; other.value = ''; }
        } else if (v) {
            sel.value = 'Other';
            if (other) { other.style.display = 'block'; other.value = v; }
        } else {
            sel.value = '';
            if (other) { other.style.display = 'none'; other.value = ''; }
        }
    };

    const campusEl = document.getElementById('profileCampus');
    const campusOptions = ['Harvey Mudd','Pitzer','Pomona','Claremont McKenna','Scripps'];
    if (campusEl) {
        const currentCampus = user.campus || '';
        if (!currentCampus) {
            const guessed = guessCampusFromEmail(user.email || '');
            if (guessed) {
                setSelectOrOther('profileCampus','profileCampusOther', guessed, campusOptions);
            }
        } else {
            setSelectOrOther('profileCampus','profileCampusOther', currentCampus, campusOptions);
        }
    }

    const genderOptions = ['Woman','Man','Non-binary','Genderqueer/Genderfluid','Questioning','Prefer not to say'];
    setSelectOrOther('profileGender','profileGenderOther', user.gender || '', genderOptions);
    const genderSel = document.getElementById('profileGender');
    const genderOtherEl = document.getElementById('profileGenderOther');
    genderSel && genderSel.addEventListener('change', () => {
        if (genderSel.value === 'Other') { genderOtherEl && (genderOtherEl.style.display = 'block'); }
        else { genderOtherEl && (genderOtherEl.style.display = 'none'); }
    });

    const orientationOptions = ['Heterosexual','Homosexual','Bisexual','Asexual','Pansexual'];
    setSelectOrOther('profileOrientation','profileOrientationOther', user.sexual_orientation || '', orientationOptions);
    const orientSel = document.getElementById('profileOrientation');
    const orientOtherEl = document.getElementById('profileOrientationOther');
    orientSel && orientSel.addEventListener('change', () => {
        if (orientSel.value === 'Other') { orientOtherEl && (orientOtherEl.style.display = 'block'); }
        else { orientOtherEl && (orientOtherEl.style.display = 'none'); }
    });

    // TODO: writes/updates to DB after button click
    const saveBtn = document.getElementById('profileSaveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
        });
    }
}

function showAnalysis(user) {
    const analysisRoot = document.getElementById('analysisContent');
    if (!analysisRoot) return;

    const profileCTA = document.getElementById('profileTakeQuizBtn');
    if (profileCTA) profileCTA.style.display = 'none';

    // TODO: Replace with real check for quiz taken
    const quizTaken = user && false;

    if (!quizTaken) {
        analysisRoot.innerHTML = `
            <p><strong>You haven't taken the quiz yet!</strong></p>
            <p>Complete the matching quiz so we can analyze your profile and suggest matches.</p>
            <a href="/quiz.html" class="btn-primary" id="takeQuizBtn">Take the quiz!</a>
        `;
        const btn = document.getElementById('takeQuizBtn');
        btn && btn.addEventListener('click', (e) => { e.preventDefault(); window.location.href = '/quiz.html'; });
    } else {
        // TODO: create and display analysis results
        analysisRoot.innerHTML = `
            <p><strong>Profile Analysis</strong></p>
        `;
    }
}