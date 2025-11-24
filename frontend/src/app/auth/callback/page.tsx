'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { initializeKeycloak } from '@/app/lib/middleware/auth/keycloak.config';
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

  useEffect(() => {
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
        
        // Si hay un código de autorización en la URL, Keycloak debe procesarlo automáticamente
        // NO usar 'check-sso' porque no procesa el código, usar undefined o no especificar onLoad
        const initOptions: any = {
          pkceMethod: false,
          checkLoginIframe: false,
          enableLogging: true,
          redirectUri: `${window.location.origin}/auth/callback`,
        };
        
        // Si hay código, dejar que Keycloak lo procese automáticamente (sin onLoad)
        // Si no hay código, usar check-sso para verificar sesión existente
        if (code) {
          console.log('🔐 Código de autorización detectado, procesando...');
          // No especificar onLoad para que Keycloak procese el código automáticamente
          initOptions.onLoad = undefined;
        } else {
          console.log('🔐 Sin código, verificando sesión existente...');
          initOptions.onLoad = 'check-sso';
        }
        
        const authenticated = await keycloak.init(initOptions);
        
        console.log('🔐 Después de init - authenticated:', authenticated, 'token:', keycloak.token ? 'presente' : 'ausente', 'code:', code ? 'presente' : 'ausente');

        // Si hay código pero no hay token, esperar con polling (Keycloak puede estar procesando)
        let finalAuthenticated = authenticated;
        let finalToken = keycloak.token;
        
        // Si hay código de autorización, Keycloak debería procesarlo automáticamente
        // Pero puede tomar un momento, así que hacemos polling
        if (code && !finalToken) {
          console.log('⏳ Código de autorización encontrado, esperando procesamiento...');
          // Polling cada 300ms hasta obtener token o timeout (5 segundos)
          for (let i = 0; i < 17; i++) {
            await new Promise(resolve => setTimeout(resolve, 300));
            if (keycloak.token && keycloak.authenticated) {
              console.log(`✅ Token obtenido después de ${(i + 1) * 300}ms`);
              finalToken = keycloak.token;
              finalAuthenticated = true;
              break;
            }
          }
          
          if (!finalToken) {
            console.warn('⚠️ Token no disponible después de esperar 5 segundos');
            // Intentar forzar el procesamiento del código
            try {
              await keycloak.login({
                redirectUri: `${window.location.origin}/auth/callback`,
              });
              return; // keycloak.login() redirigirá, así que salimos
            } catch (err) {
              console.error('❌ Error al intentar login:', err);
            }
          }
        }

        // Verificar nuevamente antes de decidir (por si acaso)
        if (!finalToken && keycloak.token) {
          finalToken = keycloak.token;
          finalAuthenticated = keycloak.authenticated;
          console.log('✅ Token detectado en verificación final');
        }

        console.log('🔐 Estado final - authenticated:', finalAuthenticated, 'token:', finalToken ? 'presente' : 'ausente');

        if (finalAuthenticated && finalToken) {
          console.log('✅ Token obtenido en callback, guardando...');
          
          // Guardar token múltiples veces para asegurar que se persista
          authStore.setToken(finalToken);
          localStorage.setItem('auth_token', finalToken);
          
          // Verificar que el token se guardó correctamente
          const savedToken = authStore.getToken() || localStorage.getItem('auth_token');
          if (!savedToken || savedToken !== finalToken) {
            console.warn('⚠️ Token no se guardó correctamente, intentando nuevamente...');
            authStore.setToken(finalToken);
            localStorage.setItem('auth_token', finalToken);
          }
          
          console.log('✅ Token guardado:', {
            enStore: !!authStore.getToken(),
            enLocalStorage: !!localStorage.getItem('auth_token'),
            tokenLength: finalToken.length
          });
          
          // Esperar un poco más para asegurar que todo se guardó
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Limpiar parámetros de la URL para evitar problemas
          if (code || state) {
            window.history.replaceState({}, document.title, '/auth/callback');
          }
          
          console.log('✅ Redirigiendo al dashboard');
          setIsProcessing(false);
          // Usar window.location en lugar de router.push para forzar recarga completa
          window.location.href = '/dashboard';
        } else {
          console.warn('⚠️ No se pudo obtener token en callback');
          console.warn('⚠️ Estado:', { 
            authenticated, 
            finalAuthenticated, 
            hasToken: !!keycloak.token, 
            hasCode: !!code,
            hasState: !!state,
            keycloakAuthenticated: keycloak.authenticated
          });
          setIsProcessing(false);
          // Redirigir al login para intentar nuevamente
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
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
          {isProcessing ? 'Procesando autenticación...' : 'Redirigiendo...'}
        </h1>
        <p className="text-gray-600">Por favor espera mientras completamos tu login.</p>
      </div>
    </div>
  );
}
