import { useEffect, useState } from 'react';
import initI18next from '../i18n';
import '../pages/globals.css';
import ProtectedRoute from '../components/ProtectedRoute';

function MyApp({ Component, pageProps }) {
  const [i18nInitialized, setI18nInitialized] = useState(false);

  useEffect(() => {
    const initI18n = async () => {
      await initI18next();
      setI18nInitialized(true);
    };
    initI18n();
  }, []);

  if (!i18nInitialized) {
    return null;
  }

  // Liste des routes qui ne nécessitent pas d'authentification
  const publicRoutes = ['/auth/login'];
  const isPublicRoute = publicRoutes.includes(Component.route);

  return isPublicRoute ? (
    <Component {...pageProps} />
  ) : (
    <ProtectedRoute>
      <Component {...pageProps} />
    </ProtectedRoute>
  );
}

export default MyApp;
