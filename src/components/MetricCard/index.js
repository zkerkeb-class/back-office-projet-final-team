import { useTranslation } from 'react-i18next';
import GaugeChart from './GaugeChart';
import LineChart from './LineChart';

const visualizationTypes = {
  COUNTER: 'counter',
  GAUGE: 'gauge',
  CHART: 'chart',
};

export default function MetricCard({ title, metrics, isDarkMode }) {
  const { t } = useTranslation();

  const renderMetricValue = (metric) => {
    switch (metric.visualizationType) {
      case visualizationTypes.GAUGE:
        return (
          <GaugeChart
            value={parseFloat(metric.value)}
            threshold={metric.threshold}
            isDarkMode={isDarkMode}
          />
        );
      case visualizationTypes.CHART:
        return (
          <LineChart
            data={metric.history || []}
            threshold={metric.threshold}
            isDarkMode={isDarkMode}
          />
        );
      case visualizationTypes.COUNTER:
      default:
        return (
          <div
            className={`text-2xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            } ${
              metric.threshold && metric.value > metric.threshold
                ? 'text-red-500'
                : ''
            }`}
          >
            {typeof metric.value === 'number'
              ? metric.value.toLocaleString()
              : metric.value}
          </div>
        );
    }
  };

  return (
    <div
      className={`p-6 rounded-xl ${
        isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
      } shadow-lg`}
    >
      <h3
        className={`text-lg font-medium mb-4 ${
          isDarkMode ? 'text-gray-200' : 'text-gray-900'
        }`}
      >
        {t(title)}
      </h3>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex justify-between items-center">
            <span
              className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {t(metric.label)}
            </span>
            {renderMetricValue({
              ...metric,
              value:
                typeof metric.value === 'string'
                  ? parseFloat(metric.value)
                  : metric.value,
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
