import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// Google Client ID (same client ID used on web or Android)
export const GOOGLE_CLIENT_ID = '1086456796372-b5dijct15asf51gsb9tf4rhdfnnnj58c.apps.googleusercontent.com';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  userInfoEndpoint: 'https://www.googleapis.com/oauth2/v3/userinfo',
};

/**
 * Initiates Google OAuth authentication flow on mobile (iOS, Android, and Web).
 * Obtains either an ID token or access token from Google, then fetches user profile.
 */
export async function promptGoogleAuth(): Promise<{
  success: boolean;
  credential?: string;
  access_token?: string;
  email?: string;
  name?: string;
  picture?: string;
  message?: string;
}> {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'flyorago',
      path: 'oauth',
    });

    const state = Math.random().toString(36).substring(2, 15);

    // Build authorization request for Google OAuth
    const authUrl =
      `${discovery.authorizationEndpoint}?` +
      `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token%20id_token` +
      `&scope=${encodeURIComponent('openid email profile')}` +
      `&nonce=${Math.random().toString(36).substring(2, 15)}` +
      `&state=${state}` +
      `&prompt=select_account`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { success: false, message: 'Google sign-in was cancelled.' };
    }

    if (result.type === 'success' && result.url) {
      // Parse parameters from redirect URL (hash or query)
      const url = result.url;
      let paramsString = '';

      if (url.includes('#')) {
        paramsString = url.split('#')[1];
      } else if (url.includes('?')) {
        paramsString = url.split('?')[1];
      }

      const params = new URLSearchParams(paramsString);
      const idToken = params.get('id_token');
      const accessToken = params.get('access_token');

      if (idToken) {
        return {
          success: true,
          credential: idToken,
          access_token: accessToken || undefined,
        };
      }

      if (accessToken) {
        // Fetch user info from Google
        try {
          const userinfoResp = await fetch(discovery.userInfoEndpoint, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (userinfoResp.ok) {
            const profile = await userinfoResp.json();
            return {
              success: true,
              access_token: accessToken,
              email: profile.email,
              name: profile.name,
              picture: profile.picture,
            };
          }
        } catch (fetchErr: any) {
          console.warn('Failed fetching Google userinfo:', fetchErr);
        }

        return {
          success: true,
          access_token: accessToken,
        };
      }

      return {
        success: false,
        message: 'No tokens received from Google authentication.',
      };
    }

    return { success: false, message: 'Google sign-in did not complete.' };
  } catch (error: any) {
    console.error('promptGoogleAuth error:', error);
    return {
      success: false,
      message: error?.message || 'Google sign-in encounterd an error.',
    };
  }
}
