import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AuthService from '../services/auth.service';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Si on est déjà sur la page de login, on ne fait rien
        if (router.pathname === '/auth/login') {
          setIsLoading(false);
          setIsAuthenticated(true);
          return;
        }

        const token = AuthService.getAccessToken();
        // Si pas de token, redirection immédiate
        if (!token) {
          await router.replace('/auth/login');
          return;
        }

        // Vérification de l'authentification
        if (!AuthService.isAuthenticated()) {
          // Si le token est expiré, essayer de le rafraîchir
          try {
            await AuthService.refreshAccessToken();
            setIsAuthenticated(true);
          } catch {
            // Si le rafraîchissement échoue, rediriger vers la page de login
            await router.replace('/auth/login');
            return;
          }
        } else {
          setIsAuthenticated(true);
        }
      } catch {
        await router.replace('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Afficher le spinner pendant le chargement
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Si authentifié, afficher le contenu
  if (isAuthenticated) {
    return children;
  }

  // Si non authentifié et pas en cours de chargement,s
  // le router.replace aura déjà été appelé
  return <LoadingSpinner />;
}
