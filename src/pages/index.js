import { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import MetricCard from '@/components/MetricCard';
import Chart from '@/components/Chart';
import { chartConfig, getChartOptions } from '@/utils/chartConfig';
// import { checkThresholds } from '@/services/notificationService';
import { saveKPIConfig, loadKPIConfig } from '@/utils/storage';
import { defaultKPIConfig } from '@/utils/constants';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState({
    apiResponseTime: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    redisLatency: 0,
    bandwidth: 0,
  });

  const [businessMetrics, setBusinessMetrics] = useState({
    streamCount: 0,
    activeUsers: 0,
    storageUsed: 0,
    requestSuccessRate: 0,
    mediaProcessingTime: 0,
  });

  const [metricsHistory, setMetricsHistory] = useState({
    labels: [],
    systemData: [],
    businessData: [],
  });

  const [kpiConfig, setKPIConfig] = useState(
    () => loadKPIConfig() || defaultKPIConfig,
  );

  const metrics = {
    cpu: 'CPU',
    responseTime: 'Temps de réponse API',
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Filtrer les métriques système visibles
  const visibleSystemMetrics = kpiConfig
    .filter(
      (kpi) =>
        kpi.isVisible &&
        [
          'apiResponseTime',
          'cpuUsage',
          'memoryUsage',
          'redisLatency',
          'bandwidth',
        ].includes(kpi.id),
    )
    .map((kpi) => ({
      label: kpi.label,
      value: systemMetrics[kpi.id],
      id: kpi.id,
    }));

  // Filtrer les métriques métier visibles
  const visibleBusinessMetrics = kpiConfig
    .filter(
      (kpi) =>
        kpi.isVisible &&
        [
          'streamCount',
          'activeUsers',
          'storageUsed',
          'requestSuccessRate',
          'mediaProcessingTime',
        ].includes(kpi.id),
    )
    .map((kpi) => ({
      label: kpi.label,
      value: businessMetrics[kpi.id],
      id: kpi.id,
    }));

  useEffect(() => {
    const fetchMetrics = async () => {
      const mockSystemData = {
        apiResponseTime: Math.random() * 100,
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        redisLatency: Math.random() * 50,
        bandwidth: Math.random() * 1000,
      };
      const mockBusinessData = {
        streamCount: Math.floor(Math.random() * 1000),
        activeUsers: Math.floor(Math.random() * 500),
        storageUsed: Math.floor(Math.random() * 1000),
        requestSuccessRate: 95 + Math.random() * 5,
        mediaProcessingTime: Math.random() * 60,
      };

      setMetricsHistory((prev) => ({
        labels: [...prev.labels, new Date().toLocaleTimeString()].slice(-10),
        systemData: [...prev.systemData, mockSystemData.cpuUsage].slice(-10),
        businessData: [
          ...prev.businessData,
          mockBusinessData.activeUsers,
        ].slice(-10),
      }));

      setSystemMetrics(mockSystemData);
      setBusinessMetrics(mockBusinessData);

      // Commenté pour désactiver les notifications
      // const currentMetrics = {
      //   ...systemMetrics,
      //   ...businessMetrics,
      // };
      // checkThresholds(currentMetrics, kpiConfig);
    };

    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [kpiConfig, systemMetrics, businessMetrics]);

  const handleKPIConfigSave = (newConfig) => {
    setKPIConfig(newConfig);
    saveKPIConfig(newConfig);
  };

  return (
    <>
      <Head>
        <title>ZakHarmony - BackOffice</title>
        <meta
          name="description"
          content="ZakHarmony - Votre plateforme musicale"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className={`min-h-screen ${isDarkMode ? 'bg-[#121212]' : 'bg-[#f8f9fa]'} transition-colors duration-300`}
      >
        <Navbar
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          kpiConfig={kpiConfig}
          onKPIConfigSave={handleKPIConfigSave}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1
              className={`text-4xl font-bold tracking-tight ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Dashboard
            </h1>
            <p
              className={`mt-3 text-lg ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Surveillance en temps réel de la plateforme
            </p>
          </div>

          <Chart
            data={chartConfig(metricsHistory)}
            options={getChartOptions(isDarkMode)}
            isDarkMode={isDarkMode}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {visibleSystemMetrics.length > 0 && (
              <MetricCard
                title={metrics.cpu}
                metrics={visibleSystemMetrics.map((metric) => ({
                  label: metric.label,
                  value: formatMetricValue(metric.value, metric.id),
                }))}
                isDarkMode={isDarkMode}
              />
            )}

            {visibleBusinessMetrics.length > 0 && (
              <MetricCard
                title="Métriques Métier"
                metrics={visibleBusinessMetrics.map((metric) => ({
                  label: metric.label,
                  value: formatMetricValue(metric.value, metric.id),
                }))}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}

// Fonction utilitaire pour formater les valeurs selon le type de métrique
function formatMetricValue(value, metricId) {
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
      return value.toString();
  }
}
