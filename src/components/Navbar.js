import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar({ isDarkMode, toggleTheme }) {
  const { t, i18n } = useTranslation();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef(null);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const languages = [
    { code: 'fr', label: '🇫🇷 FR' },
    { code: 'en', label: '🇬🇧 EN' },
    { code: 'ar', label: '🇸🇦 عربي' },
  ];

  const navItems = [
    { path: '/', label: 'navigation.metrics' },
    { path: '/media', label: 'navigation.media' },
    { path: '/artists', label: 'navigation.artists' },
    { path: '/albums', label: 'navigation.albums' },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target)
      ) {
        setIsLanguageMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsLanguageMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/auth/login');
  };

  return (
    <nav
      className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} shadow-lg transition-colors duration-300 relative z-50`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <span
              className={`text-purple-600 text-2xl font-bold tracking-tight`}
            >
              {t('common.backoffice')}
            </span>
            <div className="ml-10 flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    router.pathname === item.path
                      ? 'bg-purple-600 text-white'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-[#2a2a2a]'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t(item.label)}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className={`p-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-[#2a2a2a] text-white hover:bg-[#333333]'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } transition-colors duration-200`}
              >
                {languages.find((lang) => lang.code === i18n.language)?.label ||
                  '🌐'}
              </button>

              {isLanguageMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 py-2 w-32 rounded-lg shadow-lg z-[60] ${
                    isDarkMode
                      ? 'bg-[#2a2a2a] text-white'
                      : 'bg-white text-gray-800'
                  }`}
                >
                  {languages.map((lang) => (
                    <button
                      type="button"
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode ? 'hover:bg-[#333333]' : 'hover:bg-gray-100'
                      } transition-colors duration-200`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${
                isDarkMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-600 bg-opacity-10 text-purple-600'
              } hover:bg-opacity-80 transition-all duration-300`}
              aria-label={t(
                isDarkMode ? 'common.lightMode' : 'common.darkMode',
              )}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                {t('auth.logout')}
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                {t('auth.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
