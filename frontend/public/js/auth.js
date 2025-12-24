const API_BASE_URL = '/api';

class Auth {
    static getToken() {
        return localStorage.getItem('accessToken');
    }

    static setToken(token) {
        localStorage.setItem('accessToken', token);
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static removeToken() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    }

    static setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static async validateAndGetUser() {
        const token = this.getToken();
        if (!token) {
            return null;
        }

        try {
            const response = await fetch('/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.setUser(data.user);
                return data.user;
            } else {
                // Token invalid or expired
                this.removeToken();
                return null;
            }
        } catch (error) {
            console.error('Auth validation error:', error);
            this.removeToken();
            return null;
        }
    }

    // redirect to login if not authenticated
    static async requireAuth() {
        const user = await this.validateAndGetUser();
        if (!user) {
            window.location.href = '/login.html';
            return null;
        }
        return user;
    }
}