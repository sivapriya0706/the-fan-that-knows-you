import React from 'react';
import { Sliders, Power, Moon, Cpu, Flame, Wind, RotateCw, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { SPEED_RPM } from '../constants/fanConstants';

export default function ModeControls({
  speed = 2,
  mode = 'AUTO',
  power = true,
  direction = 'FORWARD',
  oscillation = false,
  aiAggressiveness = 50,
  onSpeedChange,
  onModeChange,
  onPowerToggle,
  onDirectionToggle,
  onOscillationToggle,
  onAiAggressivenessChange
}) {
  const modes = [
    { id: 'AUTO', label: 'AI Auto', icon: Cpu, desc: 'Neural comfort curve' },
    { id: 'MANUAL', label: 'Manual', icon: Sliders, desc: 'Direct speed setting' },
    { id: 'SLEEP', label: 'Sleep', icon: Moon, desc: 'Circadian whisper curve' },
    { id: 'EXHAUST', label: 'Emergency Vent', icon: Flame, desc: 'High smoke evacuation' }
  ];

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      {/* Header and Power Master Switch */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          <Sliders size={20} style={{ color: 'var(--cyan-neon)' }} />
          Smart Velocity & Mode Matrix
        </h2>

        {/* Master Power Toggle Button */}
        <button
          onClick={onPowerToggle}
          className="btn-cyber"
          style={{
            background: power 
              ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(0, 229, 163, 0.25))' 
              : 'rgba(255, 51, 102, 0.15)',
            borderColor: power ? 'var(--cyan-neon)' : 'var(--red-hazard)',
            color: power ? 'var(--cyan-neon)' : 'var(--red-hazard)',
            boxShadow: power ? 'var(--shadow-neon-sm)' : 'none',
            padding: '0.45rem 1rem'
          }}
        >
          <Power size={16} />
          {power ? 'SYSTEM ACTIVE' : 'SYSTEM STANDBY'}
        </button>
      </div>

      {/* Mode Selectors */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          const isExhaust = m.id === 'EXHAUST';

          return (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              disabled={!power}
              style={{
                background: isActive 
                  ? (isExhaust ? 'linear-gradient(135deg, #FF3366, #990022)' : 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 140, 255, 0.25))')
                  : 'rgba(5, 11, 23, 0.5)',
                border: `1.5px solid ${isActive ? (isExhaust ? 'var(--red-hazard)' : 'var(--cyan-neon)') : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '12px',
                padding: '0.9rem 0.6rem',
                cursor: power ? 'pointer' : 'not-allowed',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                opacity: power ? 1 : 0.5,
                transition: 'all 0.2s ease',
                boxShadow: isActive ? (isExhaust ? '0 0 20px rgba(255, 51, 102, 0.4)' : '0 0 15px rgba(0, 240, 255, 0.25)') : 'none'
              }}
            >
              <Icon size={20} style={{ color: isActive ? '#FFFFFF' : (isExhaust ? 'var(--red-hazard)' : 'var(--cyan-neon)') }} />
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: isActive ? '#FFFFFF' : 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {m.label}
              </span>
              <span style={{ fontSize: '0.68rem', color: isActive ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-muted)', textAlign: 'center' }}>
                {m.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stepped Velocity Selector (0 to 5) */}
      <div style={{ marginBottom: '1.5rem', background: 'rgba(5, 11, 23, 0.5)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Fan Blade Velocity (Levels 0 - 5)
          </span>
          <span className={`badge ${mode === 'EXHAUST' ? 'badge-red' : 'badge-cyan'}`} style={{ fontSize: '0.8rem' }}>
            {speed === 0 ? 'Off (0 RPM)' : `Speed ${speed} · ${SPEED_RPM[speed] || 0} RPM`}
          </span>
        </div>

        {/* 6 Stepped Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {[0, 1, 2, 3, 4, 5].map((lvl) => {
            const isSelected = speed === lvl;
            return (
              <button
                key={lvl}
                onClick={() => onSpeedChange(lvl)}
                disabled={!power || mode === 'EXHAUST'}
                style={{
                  background: isSelected 
                    ? 'linear-gradient(135deg, #00F0FF, #0088FF)' 
                    : 'rgba(10, 19, 41, 0.8)',
                  color: isSelected ? '#050B17' : 'var(--text-primary)',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-mono)',
                  border: isSelected ? 'none' : '1px solid var(--border-cyan)',
                  borderRadius: '8px',
                  padding: '0.6rem 0',
                  cursor: (power && mode !== 'EXHAUST') ? 'pointer' : 'not-allowed',
                  boxShadow: isSelected ? '0 0 15px rgba(0, 240, 255, 0.5)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {lvl === 0 ? 'OFF' : lvl}
              </button>
            );
          })}
        </div>

        {/* Continuous Slider for smooth precision */}
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={speed}
          disabled={!power || mode === 'EXHAUST'}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          style={{ width: '100%', margin: '0.5rem 0' }}
        />
      </div>

      {/* Auxiliary Settings: Direction, Oscillation, AI Comfort Bias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Airflow Direction */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          background: 'rgba(5, 11, 23, 0.4)',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Airflow Vector</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {direction === 'FORWARD' ? 'Downdraft (Summer)' : 'Updraft (Winter)'}
            </div>
          </div>
          <button
            onClick={onDirectionToggle}
            className="btn-cyber"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            <RotateCw size={13} /> Reverse
          </button>
        </div>

        {/* Oscillation Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          background: 'rgba(5, 11, 23, 0.4)',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Vane Oscillation</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {oscillation ? 'Wide 90° Swing' : 'Stationary Flow'}
            </div>
          </div>
          <button
            onClick={onOscillationToggle}
            className="btn-cyber"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              color: oscillation ? 'var(--teal-neon)' : 'var(--text-muted)',
              borderColor: oscillation ? 'var(--teal-neon)' : 'var(--border-subtle)'
            }}
          >
            {oscillation ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            {oscillation ? 'Active' : 'Off'}
          </button>
        </div>
      </div>

      {/* AI Personalization Bias Bar (if in AUTO mode) */}
      {mode === 'AUTO' && (
        <div style={{
          marginTop: '1rem',
          padding: '0.85rem 1rem',
          background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.08), rgba(147, 51, 234, 0.08))',
          borderRadius: '10px',
          border: '1px solid rgba(0, 240, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--cyan-neon)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={14} /> AI Thermal Comfort Preference Curve
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              {aiAggressiveness < 40 ? 'Gentle Eco' : (aiAggressiveness > 60 ? 'Crisp Turbo' : 'Balanced Comfort')}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            value={aiAggressiveness}
            onChange={(e) => onAiAggressivenessChange && onAiAggressivenessChange(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      )}
    </div>
  );
}
