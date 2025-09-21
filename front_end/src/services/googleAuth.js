// Google OAuth Service
class GoogleAuthService {
  constructor() {
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id';
    this.isLoaded = false;
  }

  // Load Google API
  loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (this.isLoaded) {
        resolve();
        return;
      }

      if (window.gapi) {
        this.isLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: this.clientId,
          }).then(() => {
            this.isLoaded = true;
            resolve();
          }).catch(reject);
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Google Sign In
  async signIn() {
    try {
      await this.loadGoogleAPI();
      
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      const profile = user.getBasicProfile();
      const authResponse = user.getAuthResponse();
      
      return {
        success: true,
        user: {
          id: profile.getId(),
          name: profile.getName(),
          email: profile.getEmail(),
          image: profile.getImageUrl(),
          accessToken: authResponse.access_token,
          idToken: authResponse.id_token
        }
      };
    } catch (error) {
      console.error('Google Sign In Error:', error);
      return {
        success: false,
        error: error.message || 'Đăng nhập Google thất bại'
      };
    }
  }

  // Google Sign Out
  async signOut() {
    try {
      if (this.isLoaded && window.gapi) {
        const authInstance = window.gapi.auth2.getAuthInstance();
        await authInstance.signOut();
      }
      return { success: true };
    } catch (error) {
      console.error('Google Sign Out Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user is signed in
  isSignedIn() {
    if (!this.isLoaded || !window.gapi) return false;
    
    const authInstance = window.gapi.auth2.getAuthInstance();
    return authInstance.isSignedIn.get();
  }

  // Get current user
  getCurrentUser() {
    if (!this.isSignedIn()) return null;
    
    const authInstance = window.gapi.auth2.getAuthInstance();
    const user = authInstance.currentUser.get();
    const profile = user.getBasicProfile();
    
    return {
      id: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
      image: profile.getImageUrl()
    };
  }
}

// Create singleton instance
const googleAuthService = new GoogleAuthService();

export default googleAuthService;
