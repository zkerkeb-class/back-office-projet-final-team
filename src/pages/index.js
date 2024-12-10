import { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import MetricCard from '@/components/MetricCard';
import Chart from '@/components/Chart';
import { chartConfig, getChartOptions } from '@/utils/chartConfig';
import { checkThresholds } from '@/services/notificationService';
import { saveKPIConfig, loadKPIConfig } from '@/utils/storage';
import { defaultKPIConfig } from '@/utils/constants';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

// Précharger le composant
const DashboardTitle = dynamic(() => import('@/components/DashboardTitle'), {
  ssr: true,
  loading: () => null, // Suppression du placeholder qui peut causer un layout shift
});

export default function Home() {
  const { t } = useTranslation();
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
    cpu: 'metrics.system.title',
    business: 'metrics.business.title',
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
      label: `metrics.system.${kpi.id}`,
      value: systemMetrics[kpi.id],
      id: kpi.id,
      category: 'system',
      threshold: kpi.threshold,
      visualizationType: kpi.visualizationType,
      history: metricsHistory.systemData,
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
      label: `metrics.business.${kpi.id}`,
      value: businessMetrics[kpi.id],
      id: kpi.id,
      category: 'business',
      threshold: kpi.threshold,
      visualizationType: kpi.visualizationType,
      history: metricsHistory.businessData,
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

      const currentMetrics = {
        ...mockSystemData,
        ...mockBusinessData,
      };

      // Vérifier les seuils et envoyer les notifications
      checkThresholds(currentMetrics, kpiConfig);
    };

    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [kpiConfig]);

  const handleKPIConfigSave = (newConfig) => {
    setKPIConfig(newConfig);
    saveKPIConfig(newConfig);
  };

  return (
    <>
      <Head>
        <title>{t('common.welcome')} - ZakHarmony</title>
        <meta name="description" content={t('common.description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Optimisation critique du rendu des polices */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: system-ui;
                font-style: normal;
                font-weight: 700;
                font-display: optional;
                src: local("-apple-system"), local("BlinkMacSystemFont"), local("Segoe UI"), local("Roboto"), local("Oxygen"), local("Ubuntu"), local("Cantarell"), local("Helvetica Neue");
                size-adjust: 100%;
                ascent-override: 90%;
                descent-override: 10%;
              }
            `,
          }}
        />
      </Head>

      <div
        className={`min-h-screen ${isDarkMode ? 'bg-[#121212]' : 'bg-[#f8f9fa]'}`}
        style={{ contain: 'paint layout' }}
      >
        <Navbar
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          kpiConfig={kpiConfig}
          onKPIConfigSave={handleKPIConfigSave}
        />

        <main
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
          style={{ contain: 'paint layout' }}
        >
          <DashboardTitle isDarkMode={isDarkMode} />

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
                title={metrics.business}
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
