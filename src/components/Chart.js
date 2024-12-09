import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Enregistrer les composants nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export default function Chart({ data, options, isDarkMode }) {
  return (
    <div className="flex flex-col items-center w-full mb-12">
      <div
        className={`${
          isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
        } rounded-xl shadow-xl p-8 w-[1200px] hover:bg-opacity-80 transition-all duration-300`}
      >
        <div className="h-[600px] flex justify-center items-center">
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
