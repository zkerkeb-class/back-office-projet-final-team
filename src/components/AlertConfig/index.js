import { useState } from 'react';

export default function AlertConfig({ kpi, onSave, isDarkMode }) {
  const [threshold, setThreshold] = useState(kpi.threshold || 0);
  const [notifyChannel, setNotifyChannel] = useState(
    kpi.notifyChannel || 'ntfy.sh',
  );

  return (
    <div
      className={`p-4 rounded-lg ${
        isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-800'
      }`}
    >
      <h4 className="text-lg font-semibold mb-4">
        Configuration des alertes - {kpi.label}
      </h4>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Seuil d&apos;alerte
          </label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className={`w-full p-2 rounded-lg border ${
              isDarkMode
                ? 'bg-[#2a2a2a] border-gray-600'
                : 'bg-white border-gray-300'
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Canal de notification
          </label>
          <select
            value={notifyChannel}
            onChange={(e) => setNotifyChannel(e.target.value)}
            className={`w-full p-2 rounded-lg border ${
              isDarkMode
                ? 'bg-[#2a2a2a] border-gray-600'
                : 'bg-white border-gray-300'
            }`}
          >
            <option value="ntfy.sh">ntfy.sh</option>
            <option value="email">Email</option>
            <option value="slack">Slack</option>
          </select>
        </div>

        <button
          onClick={() => onSave({ threshold, notifyChannel })}
          className="w-full px-4 py-2 bg-[#a78bfa] text-white rounded-lg hover:bg-[#8b5cf6]"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
