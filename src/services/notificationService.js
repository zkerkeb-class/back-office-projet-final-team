// Configuration
const COOLDOWN_PERIOD = 300000; // 5 minutes de cooldown
const NTFY_TOPIC = 'zakharmony-alerts'; // Topic fixe pour les alertes
let lastNotificationTime = {};

export const sendNotification = async (title, message, priority = 3) => {
  try {
    const now = Date.now();
    const notificationKey = `${title}-${message}`;

    // Vérifier le cooldown
    if (
      lastNotificationTime[notificationKey] &&
      now - lastNotificationTime[notificationKey] < COOLDOWN_PERIOD
    ) {
      return false;
    }

    const response = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: NTFY_TOPIC,
        title,
        message,
        priority,
        tags: ['warning'],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Échec de l'envoi de la notification: ${response.statusText}`,
      );
    }

    lastNotificationTime[notificationKey] = now;
    return true;
  } catch (error) {
    return false;
  }
};

export const checkThresholds = async (metrics, kpiConfig) => {
  for (const kpi of kpiConfig) {
    if (!kpi.threshold || !kpi.isVisible) continue;

    const currentValue = metrics[kpi.id];
    if (currentValue > kpi.threshold) {
      await sendNotification(
        `Alerte KPI: ${kpi.id}`,
        `La métrique ${kpi.id} (${currentValue}) a dépassé le seuil de ${kpi.threshold}`,
        4,
      );
    }
  }
};
