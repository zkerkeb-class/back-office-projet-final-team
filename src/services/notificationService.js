export const sendNotification = async (message, channel = 'ntfy.sh') => {
  if (channel === 'ntfy.sh') {
    try {
      await fetch('https://ntfy.sh/your-topic', {
        method: 'POST',
        body: message,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    } catch (error) {
      return false;
    }
  }
};

export const checkThresholds = (metrics, kpis) => {
  kpis.forEach((kpi) => {
    if (!kpi.threshold || !kpi.isVisible) return;

    const value = metrics[kpi.id];
    if (value > kpi.threshold) {
      sendNotification(
        `Alerte: ${kpi.label} (${value}) a dépassé le seuil de ${kpi.threshold}`,
      );
    }
  });
};
