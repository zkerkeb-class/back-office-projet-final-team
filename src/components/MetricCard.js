export default function MetricCard({ title, metrics, isDarkMode }) {
  if (metrics.length === 0) return null;

  return (
    <div
      className={`${
        isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
      } rounded-xl shadow-xl overflow-hidden transition-all duration-300`}
    >
      <div className="bg-[#a78bfa] px-8 py-6">
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          {title}
        </h2>
      </div>
      <div className="p-8">
        <ul className="space-y-6">
          {metrics.map((metric, index) => (
            <li
              key={index}
              className={`flex justify-between items-center p-4 rounded-xl ${
                isDarkMode ? 'hover:bg-[#2a2a2a]' : 'hover:bg-[#f4f4f5]'
              } transition-colors duration-200`}
            >
              <span
                className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
              >
                {metric.label}
              </span>
              <span
                className={`font-semibold text-lg ${isDarkMode ? 'text-[#a78bfa]' : 'text-[#a78bfa]'}`}
              >
                {metric.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
