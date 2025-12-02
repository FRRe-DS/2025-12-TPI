import { getKeycloak, initializeKeycloak, keycloakInitOptions } from './keycloak.config';
import { envConfig } from '../../config/env.config';

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) AuthService.instance = new AuthService();
    return AuthService.instance;
  }

  async init(): Promise<boolean> {
    try {
      let keycloak = getKeycloak();
      if (!keycloak) {
        keycloak = initializeKeycloak();
      }

      const authenticated = await keycloak.init(keycloakInitOptions);
      if (authenticated && keycloak.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', keycloak.token);
        }
      }
      return authenticated;
    } catch (error) {
      console.error('Auth init error:', error);
      return false;
    }
  }

  async login(redirectUri?: string): Promise<void> {
    let keycloak = getKeycloak();
    if (!keycloak) {
      keycloak = initializeKeycloak();
    }

    // Asegurar que el redirectUri coincida con el configurado en keycloak.config.ts
    const defaultRedirectUri = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : `${envConfig.frontendUrl}/auth/callback`;

    await keycloak.login({ redirectUri: redirectUri || defaultRedirectUri });
  }

  async logout(redirectUri?: string): Promise<void> {
    let keycloak = getKeycloak();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    if (!keycloak) {
      keycloak = initializeKeycloak();
    }
    await keycloak.logout({ redirectUri: redirectUri || envConfig.frontendUrl });
  }

  getToken(): string | undefined {
    const keycloak = getKeycloak();
    return keycloak?.token || undefined;
  }

  async refreshToken(minValidity = 60): Promise<boolean> {
    try {
      let keycloak = getKeycloak();
      if (!keycloak) {
        keycloak = initializeKeycloak();
      }
      const refreshed = await keycloak.updateToken(minValidity);
      if (refreshed && keycloak.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', keycloak.token);
        }
      }
      return refreshed;
    } catch {
      await this.logout();
      return false;
    }
  }
}

export const authService = AuthService.getInstance();
