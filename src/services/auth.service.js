const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';

class AuthService {
  static setTokens(accessToken, refreshToken) {
    if (typeof window !== 'undefined') {
      // Stockage sécurisé avec httpOnly si possible
      localStorage.setItem(TOKEN_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    }
  }

  static getAccessToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  static getRefreshToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  }

  static clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  static isAuthenticated() {
    if (typeof window !== 'undefined') {
      const token = this.getAccessToken();
      if (!token) return false;

      // Vérification basique de l'expiration du token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp > Date.now() / 1000;
      } catch {
        return false;
      }
    }
    return false;
  }

  static async refreshAccessToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        },
      );

      if (!response.ok) throw new Error('Failed to refresh token');

      const data = await response.json();
      this.setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }
}

export default AuthService;
