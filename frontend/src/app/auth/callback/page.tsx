'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { initializeKeycloak, keycloakInitOptions } from '@/app/lib/middleware/auth/keycloak.config';
import { authStore } from '@/app/lib/middleware/stores/auth.store';

/**
 * Página de callback de Keycloak
 * Keycloak redirige aquí después de autenticación exitosa
 * Esta página procesa el código de autorización y obtiene el token
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    // Prevenir doble ejecución en React StrictMode
    if (processingRef.current) {
      return;
    }
    processingRef.current = true;

    const handleCallback = async () => {
      try {
        console.log('📍 En página de callback de Keycloak - procesando autenticación...');

        // Inicializar Keycloak para procesar el código de autorización
        const keycloak = initializeKeycloak();

        // Configurar listeners antes de inicializar
        keycloak.onAuthSuccess = () => {
          console.log('✅ Autenticación exitosa en callback');
          if (keycloak.token) {
            console.log('💾 Guardando token en store y localStorage');
            authStore.setToken(keycloak.token);
          }
        };

        keycloak.onAuthError = (error) => {
          console.error('❌ Error de autenticación en callback:', error);
          setError('Error al procesar la autenticación');
        };

        // Verificar parámetros de callback en la URL ANTES de inicializar Keycloak
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        console.log('🔐 Verificando callback:', {
          hasCode: !!code,
          hasState: !!state,
          url: window.location.href.substring(0, 100) // Primeros 100 caracteres para no exponer token
        });

        // Usar las mismas opciones que en el resto de la app, pero forzando check-sso
        // Keycloak detectará automáticamente el código en la URL
        const authenticated = await keycloak.init({
          ...keycloakInitOptions,
          onLoad: 'check-sso',
          redirectUri: `${window.location.origin}/auth/callback`,
        });

        console.log('🔐 Después de init - authenticated:', authenticated, 'token:', keycloak.token ? 'presente' : 'ausente');

        if (authenticated && keycloak.token) {
          console.log('✅ Token obtenido en callback, guardando...');
          authStore.setToken(keycloak.token);

          // Verificar que el token se guardó correctamente
          const savedToken = authStore.getToken() || localStorage.getItem('auth_token');
          if (!savedToken) {
            console.warn('⚠️ Token no se guardó correctamente, intentando nuevamente...');
            authStore.setToken(keycloak.token);
            localStorage.setItem('auth_token', keycloak.token);
          }

          // Limpiar parámetros de la URL para evitar problemas
          if (code || state) {
            window.history.replaceState({}, document.title, '/auth/callback');
          }

          console.log('✅ Token guardado correctamente, redirigiendo al dashboard');
          setIsProcessing(false);
          // Usar window.location en lugar de router.push para forzar recarga completa y asegurar estado limpio
          window.location.href = '/dashboard';
        } else {
          console.warn('⚠️ No se pudo obtener token en callback');
          setIsProcessing(false);
          // Redirigir al login para intentar nuevamente
          router.push('/');
        }
      } catch (error) {
        console.error('❌ Error en callback:', error);
        setError('Error al procesar la autenticación');
        setIsProcessing(false);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    };

    // Ejecutar inmediatamente
    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          {error ? 'Error de Autenticación' : (isProcessing ? 'Procesando autenticación...' : 'Redirigiendo...')}
        </h1>
        <p className="text-gray-600">
          {error ? error : 'Por favor espera mientras completamos tu login.'}
        </p>
      </div>
    </div>
  );
}
