import React, { useState } from 'react';
import { PlayCircle, Flame, Moon, UserX, Sun, Coffee, Sparkles, SlidersHorizontal, RefreshCw } from 'lucide-react';

export default function DemoScenariosDock({
  currentScenario,
  sensors,
  onApplyScenario,
  onManualSensorOverride,
  onResetSensors
}) {
  const [showSliders, setShowSliders] = useState(false);

  const scenarios = [
    {
      id: 'hot-room',
      title: 'Hot Room',
      icon: Sun,
      color: '#FFB800',
      badge: '34.5°C · High Heat',
      desc: 'Simulates heatwave. AI accelerates to Max Speed 5 to restore thermal equilibrium.'
    },
    {
      id: 'comfortable-room',
      title: 'Comfortable',
      icon: Coffee,
      color: '#00E5A3',
      badge: '24.2°C · Eco Balanced',
      desc: 'Optimal room climate. AI cruises at Eco Speed 2, saving 68% energy.'
    },
    {
      id: 'empty-room',
      title: 'Empty Room',
      icon: UserX,
      color: '#94A3B8',
      badge: 'Vacant · PIR 0',
      desc: 'Human vacates room. AI automatically spins down fan to 0 RPM to stop energy waste.'
    },
    {
      id: 'sleep-mode',
      title: 'Sleep Mode',
      icon: Moon,
      color: '#A78BFA',
      badge: '22°C · Circadian',
      desc: 'Engages sleep profile: whisper-quiet 115 RPM, zero disturbance, gentle breeze.'
    },
    {
      id: 'smoke-emergency',
      title: 'Smoke Hazard',
      icon: Flame,
      color: '#FF3366',
      badge: '680 PPM · Emergency',
      desc: 'Smoke detected! Fires red strobe HUD alarm and forces Emergency High Exhaust mode.'
    }
  ];

  return (
    <div className="glass-panel" style={{ width: '100%', borderColor: 'rgba(0, 240, 255, 0.35)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: 'var(--cyan-neon)' }} />
            <h2 className="card-title" style={{ margin: 0 }}>
              Competition Demo & Testing Scenarios
            </h2>
            <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>JUDGE READY</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Instant 1-click presets to demonstrate autonomous AI responsiveness & emergency fail-safes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowSliders(!showSliders)}
            className="btn-cyber"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            <SlidersHorizontal size={14} />
            {showSliders ? 'Hide Sensor Sliders' : 'Manual Sensor Sliders'}
          </button>
          
          <button
            onClick={onResetSensors}
            className="btn-cyber"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            title="Reset to default sensor baseline"
          >
            <RefreshCw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* 5 Quick Scenario Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.75rem',
        marginBottom: showSliders ? '1.25rem' : '0'
      }}>
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isSelected = currentScenario === sc.id;
          const isEmergency = sc.id === 'smoke-emergency';

          return (
            <button
              key={sc.id}
              onClick={() => onApplyScenario(sc.id)}
              style={{
                background: isSelected
                  ? (isEmergency ? 'linear-gradient(135deg, rgba(255, 51, 102, 0.35), rgba(200, 0, 50, 0.4))' : 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(0, 140, 255, 0.25))')
                  : 'rgba(5, 11, 23, 0.6)',
                border: `1.5px solid ${isSelected ? (isEmergency ? 'var(--red-hazard)' : 'var(--cyan-neon)') : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '12px',
                padding: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 0 16px ${isSelected && isEmergency ? 'rgba(255, 51, 102, 0.4)' : 'rgba(0, 240, 255, 0.25)'}` : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', fontSize: '0.9rem', color: '#FFFFFF', fontFamily: 'var(--font-display)' }}>
                  <Icon size={16} style={{ color: sc.color }} />
                  {sc.title}
                </span>
                {isSelected && (
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sc.color, boxShadow: `0 0 8px ${sc.color}` }} />
                )}
              </div>

              <span style={{
                fontSize: '0.7rem',
                fontWeight: '600',
                color: sc.color,
                fontFamily: 'var(--font-mono)'
              }}>
                {sc.badge}
              </span>

              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                {sc.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Manual Sensor Sliders (Toggled) */}
      {showSliders && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(5, 11, 23, 0.7)',
          borderRadius: '12px',
          border: '1px solid var(--border-cyan)'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--cyan-neon)', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>
            Live Environmental Parameter Injector
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* Temp Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span>Temperature (°C)</span>
                <span style={{ color: 'var(--cyan-neon)', fontFamily: 'var(--font-mono)' }}>{sensors.temperature}°C</span>
              </div>
              <input
                type="range"
                min="16"
                max="42"
                step="0.5"
                value={sensors.temperature}
                onChange={(e) => onManualSensorOverride('temperature', Number(e.target.value))}
              />
            </div>

            {/* Humidity Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span>Relative Humidity (%)</span>
                <span style={{ color: 'var(--teal-neon)', fontFamily: 'var(--font-mono)' }}>{sensors.humidity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                step="1"
                value={sensors.humidity}
                onChange={(e) => onManualSensorOverride('humidity', Number(e.target.value))}
              />
            </div>

            {/* PIR Motion Switch */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                <span>PIR Human Presence</span>
                <span style={{ color: sensors.pir ? 'var(--teal-neon)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {sensors.pir ? 'OCCUPIED' : 'VACANT'}
                </span>
              </div>
              <button
                onClick={() => onManualSensorOverride('pir', sensors.pir ? 0 : 1)}
                className="btn-cyber"
                style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem' }}
              >
                {sensors.pir ? 'Simulate Human Leaving (PIR 0)' : 'Simulate Human Entering (PIR 1)'}
              </button>
            </div>

            {/* MQ2 Smoke Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span>MQ2 Gas / Smoke (PPM)</span>
                <span style={{ color: sensors.mq2 > 400 ? 'var(--red-hazard)' : 'var(--cyan-neon)', fontFamily: 'var(--font-mono)' }}>
                  {sensors.mq2} PPM
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="800"
                step="10"
                value={sensors.mq2}
                onChange={(e) => onManualSensorOverride('mq2', Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
