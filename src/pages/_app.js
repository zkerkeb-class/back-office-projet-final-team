import { useEffect, useState } from 'react';
import initI18next from '../i18n';
import '../pages/globals.css';

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
    return null; // ou un loader si vous préférez
  }

  return <Component {...pageProps} />;
}

export default MyApp;
