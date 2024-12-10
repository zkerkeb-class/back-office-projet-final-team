import { useEffect, useState } from 'react';
import Head from 'next/head';
import MetricCard from '@/components/MetricCard/index';
import { useTranslation } from 'react-i18next';
import { defaultKPIConfig } from '@/utils/constants';
import { loadKPIConfig, saveKPIConfig } from '@/utils/storage';
import { checkThresholds } from '@/services/notificationService';
import { getChartOptions } from '@/utils/chartConfig';
import Chart from '@/components/Chart';
import Navbar from '@/components/Navbar';
import dynamic from 'next/dynamic';

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
    systemMetrics: {
      cpuUsage: [],
      memoryUsage: [],
      apiResponseTime: [],
      redisLatency: [],
      bandwidth: [],
    },
    businessMetrics: {
      streamCount: [],
      activeUsers: [],
      storageUsed: [],
      requestSuccessRate: [],
      mediaProcessingTime: [],
    },
  });

  const [kpiConfig, setKPIConfig] = useState(
    () => loadKPIConfig() || defaultKPIConfig,
  );

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
      history: metricsHistory.systemMetrics[kpi.id] || [],
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
      history: metricsHistory.businessMetrics[kpi.id] || [],
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

      setMetricsHistory((prev) => {
        const newLabels = [
          ...prev.labels,
          new Date().toLocaleTimeString(),
        ].slice(-10);
        const newSystemMetrics = {};
        const newBusinessMetrics = {};

        // Mise à jour des métriques système
        Object.keys(prev.systemMetrics).forEach((key) => {
          newSystemMetrics[key] = [
            ...(prev.systemMetrics[key] || []),
            mockSystemData[key],
          ].slice(-10);
        });

        // Mise à jour des métriques business
        Object.keys(prev.businessMetrics).forEach((key) => {
          newBusinessMetrics[key] = [
            ...(prev.businessMetrics[key] || []),
            mockBusinessData[key],
          ].slice(-10);
        });

        return {
          labels: newLabels,
          systemMetrics: newSystemMetrics,
          businessMetrics: newBusinessMetrics,
        };
      });

      setSystemMetrics(mockSystemData);
      setBusinessMetrics(mockBusinessData);

      const currentMetrics = {
        ...mockSystemData,
        ...mockBusinessData,
      };

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
            data={{
              labels: metricsHistory.labels,
              datasets: [
                {
                  label: 'CPU Usage (%)',
                  data: metricsHistory.systemMetrics.cpuUsage || [],
                  borderColor: '#a78bfa',
                  backgroundColor: '#a78bfa',
                  pointBackgroundColor: '#a78bfa',
                  pointBorderColor: '#a78bfa',
                  tension: 0.3,
                },
                {
                  label: 'Active Users',
                  data: metricsHistory.businessMetrics.activeUsers || [],
                  borderColor: '#c4b5fd',
                  backgroundColor: '#c4b5fd',
                  pointBackgroundColor: '#c4b5fd',
                  pointBorderColor: '#c4b5fd',
                  tension: 0.3,
                },
              ],
            }}
            options={getChartOptions(isDarkMode)}
            isDarkMode={isDarkMode}
          />

          <div className="grid grid-cols-1 gap-8 mb-8">
            {visibleSystemMetrics.length > 0 && (
              <MetricCard
                metrics={visibleSystemMetrics}
                isDarkMode={isDarkMode}
                category="system"
              />
            )}
            {visibleBusinessMetrics.length > 0 && (
              <MetricCard
                metrics={visibleBusinessMetrics}
                isDarkMode={isDarkMode}
                category="business"
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
