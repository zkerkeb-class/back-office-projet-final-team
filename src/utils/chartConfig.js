export const chartConfig = (metricsHistory) => ({
  labels: metricsHistory.labels,
  datasets: [
    {
      label: 'CPU Usage (%)',
      data: metricsHistory.systemData,
      borderColor: '#a78bfa',
      backgroundColor: '#a78bfa',
      pointBackgroundColor: '#a78bfa',
      pointBorderColor: '#a78bfa',
      tension: 0.3,
    },
    {
      label: 'Active Users',
      data: metricsHistory.businessData,
      borderColor: '#c4b5fd',
      backgroundColor: '#c4b5fd',
      pointBackgroundColor: '#c4b5fd',
      pointBorderColor: '#c4b5fd',
      tension: 0.3,
    },
  ],
});

export const getChartOptions = (isDarkMode) => ({
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        font: {
          size: 12,
          family: "'Circular Std', 'Inter', sans-serif",
        },
        color: '#8b5cf6',
      },
    },
    title: {
      display: true,
      text: 'Métriques en temps réel',
      color: isDarkMode ? '#ffffff' : '#000000',
      font: {
        size: 20,
        family: "'Circular Std', 'Inter', sans-serif",
        weight: 'bold',
      },
      padding: 20,
    },
  },
});
