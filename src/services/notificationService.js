// Configuration
const COOLDOWN_PERIOD = 300000; // 5 minutes de cooldown
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 secondes entre les tentatives
const NTFY_TOPIC =
  'zakharmony-alerts-' + Math.random().toString(36).substring(7); // Topic unique
let lastNotificationTime = {};
let notificationQueue = [];
let isProcessingQueue = false;

// Fonction pour traiter la file d'attente
const processQueue = async () => {
  if (isProcessingQueue || notificationQueue.length === 0) return;

  isProcessingQueue = true;
  const { message, retries = 0 } = notificationQueue[0];

  try {
    const now = Date.now();
    if (
      lastNotificationTime[message] &&
      now - lastNotificationTime[message] < COOLDOWN_PERIOD
    ) {
      setTimeout(processQueue, COOLDOWN_PERIOD);
      return;
    }

    const response = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      body: message,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (response.ok) {
      lastNotificationTime[message] = now;
      notificationQueue.shift(); // Retirer la notification réussie
    } else if (response.status === 429 && retries < MAX_RETRIES) {
      // Remettre en file d'attente avec un compteur de tentatives
      notificationQueue[0].retries = retries + 1;
      setTimeout(processQueue, RETRY_DELAY);
      return;
    } else {
      notificationQueue.shift(); // Abandonner après MAX_RETRIES
    }
  } catch (error) {
    notificationQueue.shift(); // Retirer en cas d'erreur
  } finally {
    isProcessingQueue = false;
    if (notificationQueue.length > 0) {
      setTimeout(processQueue, RETRY_DELAY);
    }
  }
};

export const sendNotification = async (message, channel = 'ntfy.sh') => {
  if (channel === 'ntfy.sh') {
    // Vérifier si une notification similaire est déjà en attente
    if (!notificationQueue.some((item) => item.message === message)) {
      notificationQueue.push({ message });
      processQueue();
    }
    return true;
  }
  return false;
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
