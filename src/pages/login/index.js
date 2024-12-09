import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ici, ajoutez votre logique d'authentification
    try {
      // Simulation d'une connexion
      if (credentials.email && credentials.password) {
        await router.push('/');
      }
    } catch (err) {
      setError('Identifiants incorrects');
    }
  };

  return (
    <>
      <Head>
        <title>ZakHarmony - Connexion</title>
        <meta
          name="description"
          content="ZakHarmony - Connexion au backoffice"
        />
      </Head>

      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? 'bg-[#121212]' : 'bg-[#f8f9fa]'
        } transition-colors duration-300`}
      >
        <div
          className={`w-full max-w-md p-8 rounded-xl shadow-xl ${
            isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
          }`}
        >
          {/* En-tête */}
          <div className="text-center mb-8">
            <h1
              className={`text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              ZakHarmony
            </h1>
            <p
              className={`mt-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Connexion au backoffice
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                className={`mt-1 block w-full rounded-lg px-4 py-3 ${
                  isDarkMode
                    ? 'bg-[#2a2a2a] text-white border-[#333333]'
                    : 'bg-gray-50 text-gray-900 border-gray-300'
                } focus:ring-[#a78bfa] focus:border-[#a78bfa]`}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                className={`mt-1 block w-full rounded-lg px-4 py-3 ${
                  isDarkMode
                    ? 'bg-[#2a2a2a] text-white border-[#333333]'
                    : 'bg-gray-50 text-gray-900 border-gray-300'
                } focus:ring-[#a78bfa] focus:border-[#a78bfa]`}
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-[#a78bfa] text-white hover:bg-[#8b5cf6] transition-all duration-200 font-medium"
            >
              Se connecter
            </button>
          </form>

          {/* Bouton thème */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              } hover:text-[#a78bfa] transition-colors duration-200`}
            >
              {isDarkMode ? '☀️ Mode clair' : '🌙 Mode sombre'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
