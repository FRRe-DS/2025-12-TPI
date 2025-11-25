"use client";
import React, { useEffect, useState, useRef } from 'react';
import { initializeKeycloak, keycloakInitOptions } from './keycloak.config';
import { authStore } from '../stores/auth.store';

export const KeycloakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const initializationRef = useRef(false);

  useEffect(() => {
    // Prevenir inicializaciones múltiples usando ref + estado
    // El ref evita inicializaciones durante hidratación, el estado previene nuevos efectos
    if (initializationRef.current || initialized) {
      return;
    }

    // Asegurar que solo se ejecuta en el cliente
    if (typeof window === 'undefined') {
      initializationRef.current = true;
      setInitialized(true);
      return;
    }

    initializationRef.current = true;

    (async () => {
      try {
        const currentPath = window.location.pathname;

        console.log('🔐 Inicializando Keycloak Provider en el cliente...');
        console.log('📍 Path actual:', currentPath);

        // Si estamos en /auth/callback, no hacer nada aquí
        // La página de callback maneja la autenticación
        if (currentPath === '/auth/callback') {
          console.log('📍 En página de callback, saltando inicialización');
          setInitialized(true);
          return;
        }

        // Limpiar tokens viejos de Keycloak (opcional, pero seguro)
        // NOTA: NO borrar keys que empiecen con 'kc-callback-' porque son necesarias para el redirect
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('KEYCLOAK_')) {
            localStorage.removeItem(key);
          }
        });

        // Inicializar Keycloak (solo en cliente)
        const keycloak = initializeKeycloak();

        // Configurar listeners antes de inicializar
        keycloak.onTokenExpired = () => {
          console.log('🔄 Token expirado, refrescando...');
          keycloak.updateToken(30).then((refreshed) => {
            if (refreshed && keycloak.token) {
              console.log('✅ Token refrescado exitosamente');
              authStore.setToken(keycloak.token);
            }
          }).catch((error) => {
            console.warn('❌ Error refrescando token:', error);
            // No forzar login automáticamente
            console.log('ℹ️ Token expiró, usuario puede hacer login nuevamente si es necesario');
          });
        };

        keycloak.onAuthSuccess = () => {
          console.log('✅ Autenticación exitosa');
          if (keycloak.token) {
            console.log('💾 Guardando token en localStorage');
            authStore.setToken(keycloak.token);
          }
        };

        keycloak.onAuthError = (error) => {
          console.error('❌ Error de autenticación:', error);
          authStore.setToken(null);
        };

        // Intentar recuperar token almacenado para evitar falsos negativos en check-sso
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : undefined;
        const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('auth_refresh_token') : undefined;

        console.log('🔐 Inicializando Keycloak con opciones:', keycloakInitOptions);

        // Si tenemos token guardado, lo pasamos al init
        const initOptions = {
          ...keycloakInitOptions,
          ...(storedToken ? { token: storedToken } : {}),
          ...(storedRefreshToken ? { refreshToken: storedRefreshToken } : {})
        };

        const authenticated = await keycloak.init(initOptions);
        console.log('🔐 Keycloak init resultado - authenticated:', authenticated, 'token:', keycloak.token ? 'presente' : 'ausente');

        // Guardar token si existe
        if (keycloak.token) {
          console.log('💾 Token obtenido, guardando en store y localStorage');
          authStore.setToken(keycloak.token);
        } else if (authenticated === false) {
          console.log('ℹ️ Usuario no autenticado por Keycloak.');

          // Verificar si tenemos un token guardado manualmente antes de redirigir
          // Esto evita el loop si check-sso falla pero tenemos el token del callback
          if (storedToken) {
            console.log('⚠️ check-sso falló pero hay token guardado. Asumiendo autenticado y validando...');
            // Podríamos intentar validar el token aquí, pero por ahora confiamos en él para no bloquear
            // Si es inválido, las llamadas a la API fallarán y se hará logout
            authStore.setToken(storedToken);
          } else {
            // Si estamos en una ruta protegida (no pública), redirigir al login
            const protectedPaths = ['/dashboard', '/config', '/shipping', '/operaciones', '/analiticas'];
            const isProtectedPath = protectedPaths.some(path => currentPath.startsWith(path));

            // Rutas públicas que no requieren autenticación
            const publicPaths = ['/', '/auth', '/productos', '/reservas'];
            const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path));

            if (isProtectedPath && !isPublicPath) {
              console.log('🔒 Ruta protegida sin autenticación, redirigiendo al login...');
              // Pequeño delay para evitar loops
              setTimeout(() => {
                window.location.href = '/';
              }, 100);
            }
          }
        }
      } catch (error) {
        console.error('❌ Keycloak initialization error:', error);
        // Continuar sin fallar - las rutas pueden manejar autenticación faltante
      } finally {
        setInitialized(true);
      }
    })();
  }, []); // Solo ejecutar una vez al montar

  // No bloquear render - Keycloak se inicializa en background
  return <>{children}</>;
};
