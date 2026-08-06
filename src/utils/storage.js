export const saveKPIConfig = (config) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kpiConfig', JSON.stringify(config));
  }
};

export const loadKPIConfig = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('kpiConfig');
    return saved ? JSON.parse(saved) : null;
  }
  return null;
};
