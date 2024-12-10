import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { defaultKPIConfig } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import KPISettings from './KPISettings';

export default function KPIConfig({ kpis, onSave, isDarkMode }) {
  const { t } = useTranslation();
  const [selectedKPIs, setSelectedKPIs] = useState(() => {
    return kpis.map((kpi) => {
      const defaultKPI = defaultKPIConfig.find((k) => k.id === kpi.id);
      return {
        ...defaultKPI,
        ...kpi,
      };
    });
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedKPIForSettings, setSelectedKPIForSettings] = useState(null);

  const systemKPIs = selectedKPIs.filter((kpi) =>
    [
      'apiResponseTime',
      'cpuUsage',
      'memoryUsage',
      'redisLatency',
      'bandwidth',
    ].includes(kpi.id),
  );

  const businessKPIs = selectedKPIs.filter((kpi) =>
    [
      'streamCount',
      'activeUsers',
      'storageUsed',
      'requestSuccessRate',
      'mediaProcessingTime',
    ].includes(kpi.id),
  );

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    ) {
      return;
    }

    if (source.droppableId !== destination.droppableId) {
      return;
    }

    const isSystemList = source.droppableId === 'system';
    const currentList = isSystemList ? systemKPIs : businessKPIs;
    const otherKPIs = isSystemList ? businessKPIs : systemKPIs;

    const items = Array.from(currentList);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    setSelectedKPIs([
      ...(isSystemList ? items : otherKPIs),
      ...(isSystemList ? otherKPIs : items),
    ]);
  };

  const handleKPISettingsSave = (updatedKPI) => {
    const updatedKPIs = selectedKPIs.map((kpi) =>
      kpi.id === updatedKPI.id ? updatedKPI : kpi,
    );
    setSelectedKPIs(updatedKPIs);
    setSelectedKPIForSettings(null);
  };

  const KPIList = ({ items, droppableId }) => (
    <div className="mb-6">
      <h4
        className={`text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {t(`metrics.${droppableId}.title`)}
      </h4>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <ul
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {items.map((kpi, index) => (
              <Draggable key={kpi.id} draggableId={kpi.id} index={index}>
                {(provided) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-[#2a2a2a] hover:bg-[#333333] shadow-[0_0_10px_rgba(167,139,250,0.05)]'
                        : 'bg-gray-50 hover:bg-gray-100'
                    } flex items-center justify-between`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={kpi.isVisible}
                        onChange={() => {
                          const updatedKPIs = selectedKPIs.map((k) =>
                            k.id === kpi.id
                              ? { ...k, isVisible: !k.isVisible }
                              : k,
                          );
                          setSelectedKPIs(updatedKPIs);
                        }}
                        className={`rounded ${
                          isDarkMode
                            ? 'bg-[#333333] border-[#444444]'
                            : 'bg-white border-gray-300'
                        } text-[#a78bfa] focus:ring-[#a78bfa]`}
                      />
                      <span>{t(`metrics.${droppableId}.${kpi.id}`)}</span>
                    </div>
                    <button
                      onClick={() => setSelectedKPIForSettings(kpi)}
                      className="text-[#a78bfa] hover:text-[#8b5cf6] transition-colors duration-200"
                    >
                      ⚙️
                    </button>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </div>
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          px-4 py-2 rounded-lg
          transition-all duration-300
          ${
            isDarkMode
              ? 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] shadow-[0_2px_10px_rgba(167,139,250,0.15)] hover:shadow-[0_4px_20px_rgba(167,139,250,0.2)] hover:translate-y-[-1px]'
              : 'bg-white text-gray-800 hover:bg-gray-50 shadow-md hover:shadow-lg hover:translate-y-[-1px]'
          }
        `}
      >
        ⚙️ {t('kpiConfig.configure')}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-96 p-4 rounded-lg z-50 transition-all duration-300 ${
            isDarkMode
              ? 'bg-[#1a1a1a] text-white shadow-[0_0_15px_rgba(167,139,250,0.1)] border border-[#2a2a2a]'
              : 'bg-white text-gray-800 shadow-xl'
          }`}
        >
          <h3 className="text-lg font-semibold mb-4">{t('kpiConfig.title')}</h3>

          <DragDropContext onDragEnd={onDragEnd}>
            <KPIList items={systemKPIs} droppableId="system" />
            <KPIList items={businessKPIs} droppableId="business" />
          </DragDropContext>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setIsOpen(false)}
              className={`px-3 py-1 rounded-lg transition-all duration-200 ${
                isDarkMode
                  ? 'bg-[#2a2a2a] text-gray-300 hover:bg-[#333333]'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {t('kpiConfig.cancel')}
            </button>
            <button
              onClick={() => {
                onSave(selectedKPIs);
                setIsOpen(false);
              }}
              className="px-3 py-1 bg-[#a78bfa] text-white rounded-lg hover:bg-[#8b5cf6] transition-all duration-200"
            >
              {t('kpiConfig.save')}
            </button>
          </div>
        </div>
      )}

      {selectedKPIForSettings && (
        <KPISettings
          kpi={selectedKPIForSettings}
          onSave={handleKPISettingsSave}
          onClose={() => setSelectedKPIForSettings(null)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
