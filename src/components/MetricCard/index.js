import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GaugeChart from './GaugeChart';
import LineChart from './LineChart';

const visualizationTypes = {
  COUNTER: 'counter',
  GAUGE: 'gauge',
  CHART: 'chart',
};

const formatMetricValue = (value, metricId) => {
  if (typeof value !== 'number') return value;

  switch (metricId) {
    case 'apiResponseTime':
    case 'redisLatency':
      return `${value.toFixed(2)} ms`;
    case 'cpuUsage':
    case 'memoryUsage':
    case 'requestSuccessRate':
      return `${value.toFixed(1)}%`;
    case 'bandwidth':
      return `${(value / 1000).toFixed(2)} MB/s`;
    case 'mediaProcessingTime':
      return `${value.toFixed(1)} s`;
    case 'storageUsed':
      return `${value} GB`;
    default:
      return value.toLocaleString();
  }
};

const normalizeValueForGauge = (value, metricId, threshold) => {
  switch (metricId) {
    case 'apiResponseTime':
    case 'redisLatency':
      return (value / threshold) * 100;
    case 'cpuUsage':
    case 'memoryUsage':
    case 'requestSuccessRate':
      return value;
    case 'bandwidth':
      return (value / threshold) * 100;
    case 'mediaProcessingTime':
      return (value / threshold) * 100;
    case 'storageUsed':
      return value;
    default:
      return (value / threshold) * 100;
  }
};

export default function MetricCard({
  metrics,
  isDarkMode,
  category = 'system',
}) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || metrics.length === 0) {
    return null;
  }

  const renderMetricValue = (metric) => {
    const value =
      typeof metric.value === 'string'
        ? parseFloat(metric.value)
        : metric.value;
    const formattedValue = formatMetricValue(value, metric.id);
    const normalizedValue = normalizeValueForGauge(
      value,
      metric.id,
      metric.threshold,
    );

    switch (metric.visualizationType) {
      case visualizationTypes.GAUGE:
        return (
          <div className="flex flex-col items-center">
            <GaugeChart
              value={Math.min(100, Math.max(0, normalizedValue))}
              threshold={100}
              isDarkMode={isDarkMode}
            />
            <span
              className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {formattedValue}
            </span>
          </div>
        );
      case visualizationTypes.CHART:
        return (
          <div className="flex flex-col items-center">
            <LineChart
              data={metric.history}
              threshold={metric.threshold}
              isDarkMode={isDarkMode}
            />
            <span
              className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {formattedValue}
            </span>
          </div>
        );
      case visualizationTypes.COUNTER:
      default:
        return (
          <span
            className={`font-semibold text-lg ${isDarkMode ? 'text-[#a78bfa]' : 'text-[#a78bfa]'}`}
          >
            {formattedValue}
          </span>
        );
    }
  };

  return (
    <div
      className={`${
        isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
      } rounded-xl shadow-xl overflow-hidden transition-all duration-300`}
    >
      <div className="bg-[#a78bfa] px-8 py-6">
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          {t(`metrics.${category}.title`)}
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
                {t(metric.label)}
              </span>
              {renderMetricValue(metric)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
