import KPIConfig from '@/components/KPIConfig';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';

export default function Navbar({
  isDarkMode,
  toggleTheme,
  kpiConfig,
  onKPIConfigSave,
}) {
  const { t, i18n } = useTranslation();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef(null);

  const languages = [
    { code: 'fr', label: '🇫🇷 FR' },
    { code: 'en', label: '🇬🇧 EN' },
    { code: 'ar', label: '🇸🇦 عربي' },
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

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsLanguageMenuOpen(false);
  };

  return (
    <nav
      className={`${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'} shadow-lg transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <span
              className={`text-[#a78bfa] text-2xl font-bold tracking-tight`}
            >
              {t('common.backoffice')}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-[#2a2a2a] text-white'
                    : 'bg-gray-100 text-gray-800'
                } hover:bg-[#a78bfa] hover:text-white transition-all duration-300`}
                aria-label={t('common.language')}
                aria-expanded={isLanguageMenuOpen}
              >
                {languages.find((lang) => lang.code === i18n.language)?.label ||
                  t('common.language')}
              </button>
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg z-50">
                  <div
                    className={`rounded-lg ${
                      isDarkMode ? 'bg-[#2a2a2a]' : 'bg-white'
                    } overflow-hidden`}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-4 py-2 ${
                          isDarkMode
                            ? 'text-white hover:bg-[#3a3a3a]'
                            : 'text-gray-800 hover:bg-gray-100'
                        } ${
                          i18n.language === lang.code
                            ? 'bg-[#a78bfa] text-white'
                            : ''
                        } transition-colors duration-200`}
                        aria-label={t('common.switchLanguage', {
                          language: lang.code,
                        })}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <KPIConfig
              kpis={kpiConfig}
              onSave={onKPIConfigSave}
              isDarkMode={isDarkMode}
            />

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${
                isDarkMode
                  ? 'bg-[#a78bfa] text-white'
                  : 'bg-[#a78bfa] bg-opacity-10 text-[#a78bfa]'
              } hover:bg-opacity-80 transition-all duration-300`}
              aria-label={t(
                isDarkMode ? 'common.lightMode' : 'common.darkMode',
              )}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
