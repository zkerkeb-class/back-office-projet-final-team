import { useEffect, useRef } from 'react';

export default function GaugeChart({ value, threshold, isDarkMode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const radius = (Math.min(width, height) / 2) * 0.8;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = isDarkMode ? '#333333' : '#f3f4f6';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Draw value arc
    const percentage = Math.min(Math.max(value, 0), 100) / 100;
    const startAngle = Math.PI;
    const endAngle = startAngle + percentage * Math.PI;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = value > threshold ? '#ef4444' : '#a78bfa';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Draw value text
    ctx.font = 'bold 16px Inter';
    ctx.fillStyle = isDarkMode ? '#ffffff' : '#1f2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(value)}%`, centerX, centerY);
  }, [value, threshold, isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      width="100"
      height="60"
      className="w-[100px] h-[60px]"
    />
  );
}
