import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const visualizationTypes = {
  COUNTER: 'counter',
  GAUGE: 'gauge',
  CHART: 'chart',
};

export default function KPISettings({ kpi, onSave, isDarkMode, onClose }) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    threshold: kpi.threshold || 0,
    notifyChannel: kpi.notifyChannel || 'ntfy.sh',
    visualizationType: kpi.visualizationType || visualizationTypes.COUNTER,
  });

  const handleSave = () => {
    onSave({
      ...kpi,
      ...settings,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`w-full max-w-md p-6 rounded-lg ${
          isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-800'
        }`}
      >
        <h3 className="text-lg font-semibold mb-4">
          {t('kpiConfig.alert.title')} - {t(kpi.label)}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('kpiConfig.threshold')}
            </label>
            <input
              type="number"
              value={settings.threshold}
              onChange={(e) =>
                setSettings({ ...settings, threshold: Number(e.target.value) })
              }
              className={`w-full p-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-[#2a2a2a] border-gray-600'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('kpiConfig.visualizationType')}
            </label>
            <select
              value={settings.visualizationType}
              onChange={(e) =>
                setSettings({ ...settings, visualizationType: e.target.value })
              }
              className={`w-full p-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-[#2a2a2a] border-gray-600'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value={visualizationTypes.COUNTER}>
                {t('kpiConfig.visualization.counter')}
              </option>
              <option value={visualizationTypes.GAUGE}>
                {t('kpiConfig.visualization.gauge')}
              </option>
              <option value={visualizationTypes.CHART}>
                {t('kpiConfig.visualization.chart')}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('kpiConfig.notifyChannel')}
            </label>
            <select
              value={settings.notifyChannel}
              onChange={(e) =>
                setSettings({ ...settings, notifyChannel: e.target.value })
              }
              className={`w-full p-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-[#2a2a2a] border-gray-600'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="ntfy.sh">{t('kpiConfig.providers.ntfy')}</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode
                ? 'bg-[#2a2a2a] text-gray-300 hover:bg-[#333333]'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {t('kpiConfig.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#a78bfa] text-white rounded-lg hover:bg-[#8b5cf6]"
          >
            {t('kpiConfig.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
