import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { defaultHttpConfig, HttpClientConfig } from './config';
import { transformAxiosError } from '../errors/error-handler';
import { authStore } from '../stores/auth.store';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class HttpClient {
  private client: AxiosInstance;
  private config: HttpClientConfig;

  constructor(custom?: Partial<HttpClientConfig>) {
    this.config = { ...defaultHttpConfig, ...(custom || {}) } as HttpClientConfig;

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeoutMs,
      headers: this.config.defaultHeaders,
    });

    this.setupInterceptors();
  }

  setBaseUrl(url: string) {
    this.config.baseURL = url;
    this.client.defaults.baseURL = url;
  }

  setTimeout(ms: number) {
    this.config.timeoutMs = ms;
    this.client.defaults.timeout = ms;
  }

  setHeader(name: string, value: string) {
    this.client.defaults.headers.common[name] = value;
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config) => {
        // Rutas públicas que no requieren autenticación
        const publicRoutes = ['/stock/productos', '/stock/reservas', '/health', '/gateway/status'];
        const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
        
        let token = authStore.getToken();
        if (!token && typeof window !== 'undefined') {
          token = localStorage.getItem('auth_token') || null;
        }
        
        // Si no hay token, intentar obtenerlo de Keycloak
        if (!token && typeof window !== 'undefined') {
          try {
            const { getKeycloak } = await import('../auth/keycloak.config');
            const keycloak = getKeycloak();
            
            if (keycloak && keycloak.authenticated && keycloak.token) {
              token = keycloak.token;
              authStore.setToken(token);
              console.log('✅ Token obtenido de Keycloak para request:', config.url);
            }
          } catch (error) {
            // Keycloak no disponible o no inicializado aún
            console.debug('Keycloak no disponible aún para request:', config.url);
          }
        }
        
        // Si no hay token y no es una ruta pública, redirigir al login
        if (!token && !isPublicRoute && typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          // No redirigir si ya estamos en la página de login o callback
          if (!currentPath.startsWith('/auth') && currentPath !== '/') {
            console.warn('⚠️ No token found for protected route, redirecting to login...');
            window.location.href = '/';
            // Rechazar el request para evitar que se ejecute
            return Promise.reject(new Error('No token available, redirecting to login'));
          }
        }
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (!isPublicRoute) {
          // Log para debug - remover en producción
          console.warn('⚠️ No token found for request:', config.url);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Manejar errores 401 (Unauthorized) - intentar obtener token o redirigir al login
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          const path = window.location.pathname;
          
          // No redirigir si ya estamos en la página de login o callback
          if (path.startsWith('/auth') || path === '/') {
            throw transformAxiosError(error);
          }

          // Intentar obtener token de Keycloak si está disponible
          try {
            const { getKeycloak } = await import('../auth/keycloak.config');
            const keycloak = getKeycloak();
            
            if (keycloak) {
              // Intentar actualizar el token (puede que haya expirado)
              const refreshed = await keycloak.updateToken(30);
              if (refreshed && keycloak.token) {
                console.log('✅ Token refrescado automáticamente, reintentando request...');
                authStore.setToken(keycloak.token);
                
                // Reintentar el request original con el nuevo token
                const originalRequest = error.config;
                if (originalRequest) {
                  originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
                  return this.client.request(originalRequest);
                }
              } else if (!keycloak.authenticated) {
                // No hay sesión activa, redirigir al login
                console.warn('⚠️ No hay sesión activa, redirigiendo al login...');
                localStorage.removeItem('auth_token');
                authStore.setToken(null);
                window.location.href = '/';
                throw transformAxiosError(error);
              }
            }
          } catch (keycloakError) {
            console.warn('⚠️ Error al intentar refrescar token:', keycloakError);
          }

          // Si llegamos aquí, no pudimos obtener un token válido
          console.warn('⚠️ Token inválido o expirado, redirigiendo al login...');
          localStorage.removeItem('auth_token');
          authStore.setToken(null);
          window.location.href = '/';
        }
        throw transformAxiosError(error);
      }
    );
  }

  private async withRetry<T>(fn: () => Promise<T>, method: string): Promise<T> {
    // Sólo retry para GET
    const isGet = method.toUpperCase() === 'GET';
    if (!isGet) return fn();

    const { maxRetries, initialDelayMs, backoffMultiplier, maxDelayMs } = this.config.retry;

    let attempt = 0;
    let delay = initialDelayMs;

    while (true) {
      try {
        return await fn();
      } catch (e: unknown) {
        const error = e as { code?: string; statusCode?: number };
        const code = error.code;
        const status = error.statusCode;

        const retryable =
          code === 'NETWORK_ERROR' ||
          code === 'TIMEOUT' ||
          (status !== undefined && this.config.retry.retryableStatusCodes.includes(status));

        if (!retryable || attempt >= maxRetries) throw e;

        await sleep(Math.min(delay, maxDelayMs));
        delay = Math.min(delay * backoffMultiplier, maxDelayMs);
        attempt += 1;
      }
    }
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const exec = async () => {
      const res: AxiosResponse<T> = await this.client.get(url, config);
      return res.data;
    };
    return this.withRetry(exec, 'GET');
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.client.post(url, data, config);
    return res.data;
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.client.patch(url, data, config);
    return res.data;
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.client.delete(url, config);
    return res.data;
  }
}

export const httpClient = new HttpClient();
