import { Line } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export default function Chart({ data, options, isDarkMode }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const containerStyle = {
    width: '100%',
    height: '600px',
    position: 'relative',
  };

  const translatedOptions = {
    ...options,
    plugins: {
      ...options.plugins,
      title: {
        ...options.plugins?.title,
        text: t('metrics.realtime'),
      },
      legend: {
        ...options.plugins?.legend,
        labels: {
          ...options.plugins?.legend?.labels,
          generateLabels: (chart) => {
            const originalLabels =
              ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
            return originalLabels.map((label) => ({
              ...label,
              text: t(label.text.replace('metrics.system.', '')),
            }));
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-col items-center w-full mb-12">
      <div
        className={`
          ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'}
          rounded-xl 
          shadow-xl 
          p-8 
          w-[1200px]
        `}
      >
        <div style={containerStyle}>
          {isLoading ? (
            <div
              className={`
                w-full 
                h-full 
                ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-100'} 
                rounded-lg 
                animate-pulse
              `}
              aria-label={t('common.loading')}
            />
          ) : (
            <Line
              data={{
                ...data,
                datasets: data.datasets.map((dataset) => ({
                  ...dataset,
                  label: t(dataset.label.replace('metrics.system.', '')),
                })),
              }}
              options={{
                ...translatedOptions,
                maintainAspectRatio: false,
                responsive: true,
                animation: {
                  duration: 0,
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
