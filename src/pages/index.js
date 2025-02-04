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
import webSocketService from '../services/websocket.service';

// Précharger le composant
const DashboardTitle = dynamic(() => import('@/components/DashboardTitle'), {
  ssr: true,
  loading: () => null, // Suppression du placeholder qui peut causer un layout shift
});

const KPIConfig = dynamic(() => import('@/components/KPIConfig'), {
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
          'storageUsed',
          'storageFree',
          'storageTotal',
        ].includes(kpi.id),
    )
    .map((kpi) => {
      let value = 0;
      switch (kpi.id) {
        case 'cpuUsage':
          value = systemMetrics.cpu?.load || 0;
          break;
        case 'memoryUsage':
          value = systemMetrics.memory?.usedPercent || 0;
          break;
        case 'apiResponseTime':
          value = systemMetrics.responseTime?.average || 0;
          break;
        case 'redisLatency':
          value = systemMetrics.redis?.latency || 0;
          break;
        case 'bandwidth':
          value = systemMetrics.network?.bandwidth || 0;
          break;
        case 'storageUsed':
          value = systemMetrics.storage?.used || 0;
          break;
        case 'storageFree':
          value = systemMetrics.storage?.free || 0;
          break;
        case 'storageTotal':
          value = systemMetrics.storage?.total || 0;
          break;
        default:
          value = 0;
      }
      return {
        label: `metrics.system.${kpi.id}`,
        value,
        id: kpi.id,
        category: 'system',
        threshold: kpi.threshold,
        visualizationType: kpi.visualizationType,
        history: metricsHistory.systemMetrics[kpi.id] || [],
      };
    });

  // Filtrer les métriques métier visibles
  const visibleBusinessMetrics = kpiConfig
    .filter(
      (kpi) =>
        kpi.isVisible &&
        [
          'streamCount',
          'activeUsers',
          'totalUsers',
          'requestSuccessRate',
          'mediaProcessingTime',
          'queueSize',
          'totalRequests',
          'errorCount',
        ].includes(kpi.id),
    )
    .map((kpi) => {
      let value = 0;
      switch (kpi.id) {
        case 'streamCount':
          value = systemMetrics.streams?.active || 0;
          break;
        case 'activeUsers':
          value = systemMetrics.users?.active || 0;
          break;
        case 'totalUsers':
          value = systemMetrics.users?.total || 0;
          break;
        case 'requestSuccessRate':
          value = systemMetrics.logs?.successRate || 0;
          break;
        case 'mediaProcessingTime':
          value = systemMetrics.processing?.averageTime || 0;
          break;
        case 'queueSize':
          value = systemMetrics.processing?.queue || 0;
          break;
        case 'totalRequests':
          value = systemMetrics.logs?.totalRequests || 0;
          break;
        case 'errorCount':
          value = systemMetrics.logs?.errorCount || 0;
          break;
        default:
          value = 0;
      }
      return {
        label: `metrics.business.${kpi.id}`,
        value,
        id: kpi.id,
        category: 'business',
        threshold: kpi.threshold,
        visualizationType: kpi.visualizationType,
        history: metricsHistory.businessMetrics[kpi.id] || [],
      };
    });

  useEffect(() => {
    // En développement, on utilise le token de test
    const socket = webSocketService.connect(
      process.env.NODE_ENV !== 'production' ? 'test-token' : null,
    );

    if (!socket) {
      return;
    }

    socket.on('metrics', (metrics) => {
      // Mise à jour des métriques système
      setSystemMetrics(metrics || {});

      // Mise à jour de l'historique
      setMetricsHistory((prev) => {
        const newLabels = [
          ...prev.labels,
          new Date().toLocaleTimeString(),
        ].slice(-10);

        const newSystemMetrics = {
          cpuUsage: [
            ...(prev.systemMetrics.cpuUsage || []),
            metrics.cpu?.load || 0,
          ].slice(-10),
          memoryUsage: [
            ...(prev.systemMetrics.memoryUsage || []),
            metrics.memory?.usedPercent || 0,
          ].slice(-10),
          apiResponseTime: [
            ...(prev.systemMetrics.apiResponseTime || []),
            metrics.responseTime?.average || 0,
          ].slice(-10),
          redisLatency: [
            ...(prev.systemMetrics.redisLatency || []),
            metrics.redis?.latency || 0,
          ].slice(-10),
          bandwidth: [
            ...(prev.systemMetrics.bandwidth || []),
            metrics.network?.bandwidth || 0,
          ].slice(-10),
        };

        const newBusinessMetrics = {
          streamCount: [
            ...(prev.businessMetrics.streamCount || []),
            metrics.streams?.active || 0,
          ].slice(-10),
          activeUsers: [
            ...(prev.businessMetrics.activeUsers || []),
            metrics.users?.active || 0,
          ].slice(-10),
          storageUsed: [
            ...(prev.businessMetrics.storageUsed || []),
            metrics.storage?.used || 0,
          ].slice(-10),
          requestSuccessRate: [
            ...(prev.businessMetrics.requestSuccessRate || []),
            metrics.logs?.successRate || 0,
          ].slice(-10),
          mediaProcessingTime: [
            ...(prev.businessMetrics.mediaProcessingTime || []),
            metrics.processing?.averageTime || 0,
          ].slice(-10),
        };

        return {
          labels: newLabels,
          systemMetrics: newSystemMetrics,
          businessMetrics: newBusinessMetrics,
        };
      });

      // Vérification des seuils pour les alertes
      checkThresholds(metrics, kpiConfig);
    });

    return () => {
      webSocketService.disconnect();
    };
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
        className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-[#121212]' : 'bg-gray-50'}`}
      >
        <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1
              className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}
            >
              {t('common.welcome')}
            </h1>
          </div>

          <main
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            style={{ contain: 'paint layout' }}
          >
            <DashboardTitle isDarkMode={isDarkMode} />

            <div className="relative mb-8">
              <div className="absolute top-4 right-4 z-10">
                <KPIConfig
                  kpis={kpiConfig}
                  onSave={handleKPIConfigSave}
                  isDarkMode={isDarkMode}
                />
              </div>
              <Chart
                data={{
                  labels: metricsHistory.labels,
                  datasets: [
                    {
                      label: 'CPU Usage (%)',
                      data: metricsHistory.systemMetrics.cpuUsage || [],
                      borderColor: '#9333ea',
                      backgroundColor: '#9333ea',
                      pointBackgroundColor: '#9333ea',
                      pointBorderColor: '#9333ea',
                      tension: 0.3,
                    },
                    {
                      label: 'Active Users',
                      data: metricsHistory.businessMetrics.activeUsers || [],
                      borderColor: '#a855f7',
                      backgroundColor: '#a855f7',
                      pointBackgroundColor: '#a855f7',
                      pointBorderColor: '#a855f7',
                      tension: 0.3,
                    },
                  ],
                }}
                options={getChartOptions(isDarkMode)}
                isDarkMode={isDarkMode}
              />
            </div>

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
      </div>
    </>
  );
}
