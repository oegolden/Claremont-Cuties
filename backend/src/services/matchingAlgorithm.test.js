/* eslint-disable no-undef */
const matchingAlgorithm = require('./matchingAlgorithm');

describe('Matching Algorithm', () => {

    // Helper to create a user with default valid data to avoid clutter
    const createUser = (id, gender, genderPref, overrides = {}) => {
        return {
            id,
            name: `User${id}`,
            gender: gender,
            age: 20,
            campus: 'Pomona',
            year: 2025,
            form_data: {
                relationship_type: ['Romantic relationship'],
                romantic_gender_preferences: [genderPref],
                romantic_age_range: [18, 25],
                romantic_home_campus: ['Any'],
                major_dealbreakers: [],
                political_views: 3,
                religious_views: 'Agnostic',
                substance_relationships: ['Non-smoker', 'Non-drinker'],
                hobbies: ['Reading'],
                ...overrides
            }
        };
    };

    test('should match compatible users (Heterosexual)', () => {
        const u1 = createUser(1, 'Man', 'Woman'); // Man seeking Woman
        const u2 = createUser(2, 'Woman', 'Man'); // Woman seeking Man

        const matches = matchingAlgorithm.generateMatches([u1, u2]);
        expect(matches.length).toBe(1);
        expect(matches[0][0].id).toBe(2); // Since pop() is used, order might reverse but pair exists
        expect(matches[0][1].id).toBe(1);
    });

    test('should NOT match incompatible genders', () => {
        const u1 = createUser(1, 'Man', 'Woman');
        const u3 = createUser(3, 'Man', 'Woman'); // Man seeking Woman

        const matches = matchingAlgorithm.generateMatches([u1, u3]);
        expect(matches.length).toBe(0);
    });

    test('should respect dealbreakers (Smoking)', () => {
        const u1 = createUser(1, 'Man', 'Woman', {
            major_dealbreakers: ['I only want to be matched with non-smokers']
        });
        const u2 = createUser(2, 'Woman', 'Man', {
            substance_relationships: [] // Smoker (implied by absence of 'Non-smoker')
        });

        const matches = matchingAlgorithm.generateMatches([u1, u2]);
        expect(matches.length).toBe(0);
    });

    test('should prioritize higher score matches', () => {
        const u1 = createUser(1, 'Man', 'Woman', { hobbies: ['Reading', 'Gaming'], political_views: 5 });

        // u2: Compatible but different politics (score penalty) and no hobby match
        const u2 = createUser(2, 'Woman', 'Man', { hobbies: ['Hiking'], political_views: 1 });

        // u3: Compatible, same hobbies, same politics (high score)
        const u3 = createUser(3, 'Woman', 'Man', { hobbies: ['Reading', 'Gaming'], political_views: 5 });

        // We expect u1 to match with u3 because of higher score
        const matches = matchingAlgorithm.generateMatches([u1, u2, u3]);

        expect(matches.length).toBe(1);
        const pair = matches[0];
        const ids = [pair[0].id, pair[1].id].sort();
        expect(ids).toEqual([1, 3]);
    });

    test('should handle friends matching', () => {
        const u1 = {
            id: 1, gender: 'Man', age: 20, campus: 'Pomona',
            form_data: {
                relationship_type: ['Friends'],
                friends_gender_preferences: ['Any'],
                friends_age_range: [18, 22],
                friends_home_campus: ['Any']
            }
        };
        const u2 = {
            id: 2, gender: 'Man', age: 20, campus: 'Pitzer',
            form_data: {
                relationship_type: ['Friends'],
                friends_gender_preferences: ['Any'],
                friends_age_range: [18, 22],
                friends_home_campus: ['Any']
            }
        };

        const matches = matchingAlgorithm.generateMatches([u1, u2]);
        expect(matches.length).toBe(1);
    });
});
