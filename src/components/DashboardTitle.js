import { memo } from 'react';

const DashboardTitle = memo(
  ({ isDarkMode }) => (
    <div className="mb-12">
      <span
        aria-level="1"
        role="heading"
        className={`
        block
        text-4xl 
        font-bold 
        ${isDarkMode ? 'text-white' : 'text-gray-900'}
      `}
        style={{
          fontFamily: '-apple-system, system-ui, sans-serif',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          wordSpacing: '-0.025em',
          whiteSpace: 'nowrap',
          textRendering: 'geometricPrecision',
        }}
      >
        {'Dashboard'}
      </span>
    </div>
  ),
  (prevProps, nextProps) => prevProps.isDarkMode === nextProps.isDarkMode,
);

DashboardTitle.displayName = 'DashboardTitle';

export default DashboardTitle;
