import React, { useState } from 'react';
import { BarChart3, TrendingUp, Eye, EyeOff } from 'lucide-react';

export default function HistoricalCharts({
  dataPoints = []
}) {
  const [activeSeries, setActiveSeries] = useState({
    temp: true,
    humidity: true,
    speed: true,
    watts: false
  });
  const [hoverIndex, setHoverIndex] = useState(null);

  // Generate 24 simulated hours if dataPoints is empty
  const defaultHistory = [
    { time: '00:00', temp: 22.1, humidity: 46, speed: 1, watts: 14 },
    { time: '02:00', temp: 21.8, humidity: 48, speed: 1, watts: 14 },
    { time: '04:00', temp: 21.4, humidity: 50, speed: 1, watts: 14 },
    { time: '06:00', temp: 22.0, humidity: 49, speed: 2, watts: 26 },
    { time: '08:00', temp: 24.5, humidity: 54, speed: 2, watts: 26 },
    { time: '10:00', temp: 27.2, humidity: 58, speed: 3, watts: 42 },
    { time: '12:00', temp: 30.5, humidity: 64, speed: 4, watts: 60 },
    { time: '14:00', temp: 33.8, humidity: 72, speed: 5, watts: 78 },
    { time: '16:00', temp: 31.4, humidity: 68, speed: 4, watts: 60 },
    { time: '18:00', temp: 28.2, humidity: 62, speed: 3, watts: 42 },
    { time: '20:00', temp: 25.6, humidity: 55, speed: 2, watts: 26 },
    { time: '22:00', temp: 23.4, humidity: 50, speed: 1, watts: 14 }
  ];

  const data = (dataPoints && dataPoints.length > 0) ? dataPoints : defaultHistory;

  const toggleSeries = (key) => {
    setActiveSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const padding = { top: 20, right: 30, bottom: 30, left: 40 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Scale calculations
  const getX = (index) => padding.left + (index / (data.length - 1)) * graphWidth;
  
  // Normalized Y coordinate (0 at bottom, 1 at top)
  const getY = (val, min, max) => {
    const norm = (val - min) / (max - min || 1);
    return padding.top + (1 - norm) * graphHeight;
  };

  // Generate SVG path for a given metric
  const makePath = (key, min, max) => {
    return data.map((pt, i) => {
      const x = getX(i);
      const y = getY(pt[key], min, max);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const tempPath = makePath('temp', 18, 38);
  const humPath = makePath('humidity', 30, 85);
  const speedPath = makePath('speed', 0, 5);
  const wattsPath = makePath('watts', 0, 80);

  const hoveredData = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      {/* Header with Series Filter Toggles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          <TrendingUp size={20} style={{ color: 'var(--cyan-neon)' }} />
          24-Hour Environmental & Velocity Telemetry
        </h2>

        {/* Series Toggles */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => toggleSeries('temp')}
            className="btn-cyber"
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.72rem',
              color: activeSeries.temp ? 'var(--cyan-neon)' : 'var(--text-muted)',
              borderColor: activeSeries.temp ? 'var(--cyan-neon)' : 'var(--border-subtle)'
            }}
          >
            {activeSeries.temp ? <Eye size={12} /> : <EyeOff size={12} />} Temp (°C)
          </button>

          <button
            onClick={() => toggleSeries('humidity')}
            className="btn-cyber"
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.72rem',
              color: activeSeries.humidity ? 'var(--teal-neon)' : 'var(--text-muted)',
              borderColor: activeSeries.humidity ? 'var(--teal-neon)' : 'var(--border-subtle)'
            }}
          >
            {activeSeries.humidity ? <Eye size={12} /> : <EyeOff size={12} />} Humidity (%)
          </button>

          <button
            onClick={() => toggleSeries('speed')}
            className="btn-cyber"
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.72rem',
              color: activeSeries.speed ? 'var(--amber-warning)' : 'var(--text-muted)',
              borderColor: activeSeries.speed ? 'var(--amber-warning)' : 'var(--border-subtle)'
            }}
          >
            {activeSeries.speed ? <Eye size={12} /> : <EyeOff size={12} />} Fan Speed (0-5)
          </button>

          <button
            onClick={() => toggleSeries('watts')}
            className="btn-cyber"
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.72rem',
              color: activeSeries.watts ? '#E879F9' : 'var(--text-muted)',
              borderColor: activeSeries.watts ? '#E879F9' : 'var(--border-subtle)'
            }}
          >
            {activeSeries.watts ? <Eye size={12} /> : <EyeOff size={12} />} Power (W)
          </button>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Horizontal Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + pct * graphHeight;
            return (
              <line
                key={i}
                x1={padding.left}
                y1={y}
                x2={svgWidth - padding.right}
                y2={y}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Time Labels on X axis */}
          {data.map((pt, i) => {
            const x = getX(i);
            return (
              <text
                key={i}
                x={x}
                y={svgHeight - 10}
                fill="#64748B"
                fontSize="10"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                {pt.time}
              </text>
            );
          })}

          {/* Telemetry Curves */}
          {activeSeries.humidity && (
            <path
              d={humPath}
              fill="none"
              stroke="var(--teal-neon)"
              strokeWidth="2"
              strokeOpacity="0.85"
            />
          )}

          {activeSeries.temp && (
            <path
              d={tempPath}
              fill="none"
              stroke="var(--cyan-neon)"
              strokeWidth="2.5"
              filter="drop-shadow(0 0 6px rgba(0, 240, 255, 0.4))"
            />
          )}

          {activeSeries.speed && (
            <path
              d={speedPath}
              fill="none"
              stroke="var(--amber-warning)"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          )}

          {activeSeries.watts && (
            <path
              d={wattsPath}
              fill="none"
              stroke="#E879F9"
              strokeWidth="2"
            />
          )}

          {/* Interactive Hover Point Columns */}
          {data.map((pt, i) => {
            const x = getX(i);
            return (
              <g
                key={i}
                onMouseEnter={() => setHoverIndex(i)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={x - 15}
                  y={padding.top}
                  width={30}
                  height={graphHeight}
                  fill="transparent"
                />
                {hoverIndex === i && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + graphHeight}
                    stroke="rgba(0, 240, 255, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Inspector Tooltip */}
        {hoveredData && (
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'rgba(5, 11, 23, 0.92)',
            border: '1px solid var(--border-cyan)',
            borderRadius: '8px',
            padding: '0.6rem 0.9rem',
            boxShadow: 'var(--shadow-neon-sm)',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            gap: '1rem',
            pointerEvents: 'none',
            backdropFilter: 'blur(10px)'
          }}>
            <div><strong>Time:</strong> {hoveredData.time}</div>
            <div style={{ color: 'var(--cyan-neon)' }}>Temp: {hoveredData.temp}°C</div>
            <div style={{ color: 'var(--teal-neon)' }}>Hum: {hoveredData.humidity}%</div>
            <div style={{ color: 'var(--amber-warning)' }}>Speed: {hoveredData.speed}</div>
            <div style={{ color: '#E879F9' }}>Power: {hoveredData.watts}W</div>
          </div>
        )}
      </div>
    </div>
  );
}
