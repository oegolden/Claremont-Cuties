class MatchingAlgorithm {
    constructor() {
    }

    // Main function to generate matches
    // users: array of user objects with profiles and form data (form_data)
    generateMatches(users) {
        let matches = [];
        let unmatched = [...users];

        // randomize unmatched users to vary results avoid deterministic order bias
        unmatched.sort(() => Math.random() - 0.5);

        // Simple greedy matching: find best possible match for current user
        // This is O(N^2) which is fine for expected user base size (<1000)

        while (unmatched.length > 1) {
            const user1 = unmatched.pop();
            let bestMatchIndex = -1;
            let bestScore = -Infinity; // Use -Infinity to handle negative scores (dealbreakers)

            for (let i = 0; i < unmatched.length; i++) {
                const user2 = unmatched[i];

                // 1. HARD CONSTRAINTS
                if (!this._isCompatible(user1, user2)) {
                    continue;
                }

                // 2. SOFT SCORING
                const score = this._calculateScore(user1, user2);

                if (score > bestScore) {
                    bestScore = score;
                    bestMatchIndex = i;
                }
            }

            if (bestMatchIndex !== -1) {
                // Found a match!
                const user2 = unmatched.splice(bestMatchIndex, 1)[0];
                matches.push([user1, user2]);
            } else {
                // No match found for user1, they remain unmatched for this round
                // In a real system you might add them to a 'waitlist' or retry with relaxed constraints
            }
        }

        return matches;
    }

    _isCompatible(user1, user2) {
        const d1 = user1.form_data || {};
        const d2 = user2.form_data || {};

        // 1. Relationship Type Overlap
        // romantic vs friends
        const rel1 = d1.relationship_type || [];
        const rel2 = d2.relationship_type || [];

        // Find intersection
        const commonTypes = rel1.filter(t => rel2.includes(t));
        if (commonTypes.length === 0) return false;

        // We need to check compatibility for AT LEAST ONE of the common types.
        // If they both want "Friends", check friend filters.
        // If they both want "Romantic", check romantic filters.

        let compatible = false;

        if (commonTypes.includes('Romantic relationship')) {
            if (this._checkRomanticCompatibility(user1, user2, d1, d2) &&
                this._checkRomanticCompatibility(user2, user1, d2, d1)) {
                compatible = true;
            }
        }

        if (!compatible && commonTypes.includes('Friends')) {
            if (this._checkFriendCompatibility(user1, user2, d1, d2) &&
                this._checkFriendCompatibility(user2, user1, d2, d1)) {
                compatible = true;
            }
        }

        return compatible;
    }

    _checkRomanticCompatibility(u1, u2, d1, d2) {
        // Gender Preference
        // u1 wants gender X. u2 is gender Y.
        // u1.gender comes from user profile or form? 
        // Based on usersService.js, gender is on user object.
        // d1.romantic_gender_preferences

        const prefs = d1.romantic_gender_preferences || [];
        if (!prefs.includes('Any') && !prefs.includes(u2.gender)) {
            // Check for 'Other' mapping or strict string match? 
            // Assuming strict string match for simplicity as per values in Quiz.jsx
            return false;
        }

        // Age Preference
        // d1.romantic_age_range = [min, max]
        const ageRange = d1.romantic_age_range || [18, 99]; // default wide
        // if ageRange is just numbers like in Question.jsx "range" usually returns array
        const minAge = Array.isArray(ageRange) ? ageRange[0] : 18;
        const maxAge = Array.isArray(ageRange) ? ageRange[1] : 99;

        if (u2.age < minAge || u2.age > maxAge) return false;

        // Campus Preference
        // d1.romantic_home_campus
        const campusPrefs = d1.romantic_home_campus || [];
        if (!campusPrefs.includes('Any') && !campusPrefs.includes(u2.campus)) return false;

        return true;
    }

    _checkFriendCompatibility(u1, u2, d1, d2) {
        // Similar to romantic but using friend keys
        const prefs = d1.friends_gender_preferences || [];
        if (!prefs.includes('Any') && !prefs.includes(u2.gender)) return false;

        const ageRange = d1.friends_age_range || [18, 99];
        const minAge = Array.isArray(ageRange) ? ageRange[0] : 18;
        const maxAge = Array.isArray(ageRange) ? ageRange[1] : 99;
        if (u2.age < minAge || u2.age > maxAge) return false;

        const campusPrefs = d1.friends_home_campus || []; // optional in updated form?
        // Note: Quiz.jsx said friends_home_campus required=false, so empty array means ANY? 
        // Usually empty array for checkboxes means "none selected" -> constraint failure or "doesn't matter"? 
        // Let's assume if length > 0 we check, else ignore.
        if (campusPrefs.length > 0 && !campusPrefs.includes('Any') && !campusPrefs.includes(u2.campus)) return false;

        return true;
    }

    _calculateScore(user1, user2) {
        let score = 0;
        const d1 = user1.form_data || {};
        const d2 = user2.form_data || {};

        // --- DEALBREAKERS ---
        // substance_relationships
        // If d1 has a dealbreaker requirement about smoking/drinking, and d2 does those things
        // Check "Major Dealbreakers" question in Quiz.jsx
        // options: 
        // "I only want to be matched with non-smokers"
        // "I only want to be matched with non-drinkers"
        // "I only want matches with similar political views"
        // "I only want matches with similar religious/spiritual views"

        const dealbreakers1 = d1.major_dealbreakers || [];
        const dealbreakers2 = d2.major_dealbreakers || [];

        // Helper for dealing with dealbreakers
        if (this._checkDealbreaker(dealbreakers1, d2, 'non-smokers', 'substance_relationships', 'Non-smoker') === false) return -1000;
        if (this._checkDealbreaker(dealbreakers2, d1, 'non-smokers', 'substance_relationships', 'Non-smoker') === false) return -1000;

        if (this._checkDealbreaker(dealbreakers1, d2, 'non-drinkers', 'substance_relationships', 'Non-drinker') === false) return -1000;
        if (this._checkDealbreaker(dealbreakers2, d1, 'non-drinkers', 'substance_relationships', 'Non-drinker') === false) return -1000;

        // Political dealbreaker
        if (dealbreakers1.includes("I only want matches with similar political views")) {
            if (Math.abs((d1.political_views || 3) - (d2.political_views || 3)) > 1) return -1000;
        }
        if (dealbreakers2.includes("I only want matches with similar political views")) {
            if (Math.abs((d1.political_views || 3) - (d2.political_views || 3)) > 1) return -1000;
        }

        // Religious dealbreaker
        if (dealbreakers1.includes("I only want matches with similar religious/spiritual views")) {
            if (d1.religious_views !== d2.religious_views) return -1000;
        }
        if (dealbreakers2.includes("I only want matches with similar religious/spiritual views")) {
            if (d1.religious_views !== d2.religious_views) return -1000; // Symmetric check
        }


        // --- SCORING ---

        // 1. Campus (+5 if same)
        // (Maybe handled in filtering, but preference might be loose)
        if (user1.campus === user2.campus) score += 5;

        // 2. Year (+2 if close)
        // Ensure year is parsed (it might be a string like "2024")
        // Sometimes year is "Freshman" etc, need to check DB schema or assumed int. 
        // In usersService it's passed directly. If it's a number:
        const y1 = parseInt(user1.year) || 0;
        const y2 = parseInt(user2.year) || 0;
        if (y1 > 0 && y2 > 0 && Math.abs(y1 - y2) <= 1) score += 2;

        // 3. Political Views Similarity (+0-5 points)
        // Sliders 1-5. 
        const pav = Math.abs((d1.political_views || 3) - (d2.political_views || 3));
        // max diff is 4. score = (4 - diff) 
        score += (4 - pav);

        // 4. Religious Views (+3 if same)
        if (d1.religious_views === d2.religious_views) score += 3;

        // 5. Lifestyle Similarity (Energy, Friday Night, Conflict)
        // Sliders 1-5
        const diffEnergy = Math.abs((d1.energy_level || 3) - (d2.energy_level || 3));
        const diffFriday = Math.abs((d1.friday_night || 3) - (d2.friday_night || 3));
        const diffConflict = Math.abs((d1.handle_conflict || 3) - (d2.handle_conflict || 3));

        score += (4 - diffEnergy); // closer is better
        score += (4 - diffFriday);
        score += (4 - diffConflict);

        // 6. Common Interests (Hobbies, Music)
        const commonHobbies = (d1.hobbies || []).filter(h => (d2.hobbies || []).includes(h));
        score += commonHobbies.length * 2; // +2 per hobby

        const commonMusic = (d1.music_taste || []).filter(m => (d2.music_taste || []).includes(m));
        score += commonMusic.length * 1; // +1 per music genre

        // 7. Love Language (+3 per match)
        // d1.love_language is array of top 2
        const commonLove = (d1.love_language || []).filter(l => (d2.love_language || []).includes(l));
        score += commonLove.length * 3;

        // 8. Cats vs Dogs
        if (d1.cats_or_dogs === d2.cats_or_dogs) score += 2;

        // 9. Dining Hall / Cuisine
        if (d1.favorite_dining_hall === d2.favorite_dining_hall) score += 2;
        const commonCuisine = (d1.favorite_cuisine || []).filter(c => (d2.favorite_cuisine || []).includes(c));
        score += commonCuisine.length * 1;

        return score;
    }

    _checkDealbreaker(breakerList, otherUserData, breakerText, otherKey, otherValue) {
        // breakerText: e.g. "non-smokers" (part of the string in breakerList)
        // otherKey: "substance_relationships"
        // otherValue: "Non-smoker" (value that MUST be present in otherUserData[otherKey])

        // Find the specific dealbreaker string in breakerList
        const hasBreaker = breakerList.some(b => b.includes(breakerText));
        if (hasBreaker) {
            const otherValues = otherUserData[otherKey] || [];
            if (!otherValues.includes(otherValue)) {
                return false; // Dealbreaker violated!
            }
        }
        return true;
    }
}

module.exports = new MatchingAlgorithm();
