import KPIConfig from '@/components/KPIConfig';

export default function Navbar({
  isDarkMode,
  toggleTheme,
  kpiConfig,
  onKPIConfigSave,
}) {
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
              ZakHarmony
            </span>
          </div>

          <div className="flex items-center space-x-4">
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
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
