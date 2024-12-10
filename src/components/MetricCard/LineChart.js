import { useEffect, useRef } from 'react';

export default function LineChart({ data, threshold, isDarkMode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 20;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (data.length < 2) return;

    // Calculate scales
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const valueRange = maxValue - minValue;

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = isDarkMode ? '#333333' : '#e5e7eb';
    ctx.lineWidth = 1;

    // Y axis
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);

    // X axis
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw threshold line if provided
    if (threshold) {
      const thresholdY =
        height - padding - ((threshold - minValue) / valueRange) * chartHeight;
      ctx.beginPath();
      ctx.strokeStyle = '#ef4444';
      ctx.setLineDash([5, 5]);
      ctx.moveTo(padding, thresholdY);
      ctx.lineTo(width - padding, thresholdY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw data line
    ctx.beginPath();
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;

    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y =
        height - padding - ((value - minValue) / valueRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y =
        height - padding - ((value - minValue) / valueRange) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#a78bfa';
      ctx.fill();
    });

    // Draw latest value
    const latestValue = data[data.length - 1];
    ctx.font = '12px Inter';
    ctx.fillStyle = isDarkMode ? '#ffffff' : '#1f2937';
    ctx.textAlign = 'right';
    ctx.fillText(
      `${Math.round(latestValue * 10) / 10}`,
      width - padding,
      padding - 5,
    );
  }, [data, threshold, isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      width="200"
      height="100"
      className="w-[200px] h-[100px]"
    />
  );
}
