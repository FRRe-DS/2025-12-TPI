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
        
        // En el callback, Keycloak procesará automáticamente el código de autorización
        // cuando se inicializa, independientemente del onLoad
        // Usamos 'check-sso' pero Keycloak detectará el código y lo procesará
        const authenticated = await keycloak.init({
          onLoad: 'check-sso', // Keycloak procesará automáticamente el código si está en la URL
          pkceMethod: false,
          checkLoginIframe: false,
          enableLogging: true,
          redirectUri: `${window.location.origin}/auth/callback`,
        });
        
        console.log('🔐 Después de init - authenticated:', authenticated, 'token:', keycloak.token ? 'presente' : 'ausente', 'code:', code ? 'presente' : 'ausente');

        // Si hay código pero no hay token, esperar un poco más (Keycloak puede estar procesando)
        let finalAuthenticated = authenticated;
        if (code && !keycloak.token && !authenticated) {
          console.log('⏳ Código de autorización encontrado, esperando procesamiento...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Verificar nuevamente después de esperar
          if (keycloak.token) {
            console.log('✅ Token obtenido después de esperar');
            finalAuthenticated = true;
          } else {
            console.warn('⚠️ Token no disponible después de esperar');
          }
        }

        console.log('🔐 Estado final - authenticated:', finalAuthenticated, 'token:', keycloak.token ? 'presente' : 'ausente');

        if (finalAuthenticated && keycloak.token) {
          console.log('✅ Token obtenido en callback, guardando...');
          authStore.setToken(keycloak.token);
          
          // Pequeño delay para asegurar que el token se guardó
          await new Promise(resolve => setTimeout(resolve, 500));
          
          console.log('✅ Redirigiendo al dashboard');
          setIsProcessing(false);
          router.push('/dashboard');
        } else {
          console.warn('⚠️ No se pudo obtener token en callback, redirigiendo al login');
          setIsProcessing(false);
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
          {isProcessing ? 'Procesando autenticación...' : 'Redirigiendo...'}
        </h1>
        <p className="text-gray-600">Por favor espera mientras completamos tu login.</p>
      </div>
    </div>
  );
}
