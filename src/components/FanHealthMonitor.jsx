import React from 'react';
import { HeartPulse, CheckCircle2, AlertTriangle, Clock, Wrench, ShieldCheck, Thermometer } from 'lucide-react';

export default function FanHealthMonitor({
  health = {
    score: 97,
    motorTemp: 38.2,
    vibration: 0.42,
    filterCleanliness: 88,
    hoursUsed: 1420
  },
  onResetFilter
}) {
  const score = health.score || 95;
  const motorTemp = Number(health.motorTemp) || 35;
  const vibration = Number(health.vibration) || 0.35;
  const cleanliness = Number(health.filterCleanliness) || 85;
  const hours = Math.round(Number(health.hoursUsed) || 1200);

  // Status determinations
  let tempStatus = { label: 'Optimal', color: 'var(--teal-neon)' };
  if (motorTemp > 60) {
    tempStatus = { label: 'Thermal Warning', color: 'var(--red-hazard)' };
  } else if (motorTemp > 48) {
    tempStatus = { label: 'Warm', color: 'var(--amber-warning)' };
  }

  let vibStatus = { label: 'Balanced', color: 'var(--teal-neon)' };
  if (vibration > 0.8) {
    vibStatus = { label: 'Wobble Detected', color: 'var(--red-hazard)' };
  } else if (vibration > 0.6) {
    vibStatus = { label: 'Minor Imbalance', color: 'var(--amber-warning)' };
  }

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          <HeartPulse size={20} style={{ color: 'var(--teal-neon)' }} />
          Predictive Maintenance & Motor Diagnostics
        </h2>

        <span className="badge badge-green">
          <ShieldCheck size={12} /> SYSTEM HEALTHY
        </span>
      </div>

      {/* Radial Health Gauge + 4 Diagnostic Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1.25rem', alignItems: 'center', marginBottom: '1rem' }}>
        {/* Circular Health Score */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          border: '4px solid var(--border-cyan)',
          borderTopColor: 'var(--teal-neon)',
          borderRightColor: 'var(--cyan-neon)',
          background: 'rgba(5, 11, 23, 0.6)',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)',
          margin: '0 auto'
        }}>
          <span style={{ fontSize: '2.1rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>
            {score}%
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Health Index
          </span>
        </div>

        {/* 4 Diagnostic Parameters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {/* Motor Temp */}
          <div style={{ background: 'rgba(5, 11, 23, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <span>Motor Stator Temp</span>
              <span style={{ color: tempStatus.color, fontWeight: '600' }}>{tempStatus.label}</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '700', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              {motorTemp}°C
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Max limit: 70°C</div>
          </div>

          {/* Bearing Vibration */}
          <div style={{ background: 'rgba(5, 11, 23, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <span>Bearing Vibration</span>
              <span style={{ color: vibStatus.color, fontWeight: '600' }}>{vibStatus.label}</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '700', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              {vibration} <span style={{ fontSize: '0.75rem' }}>mm/s</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>FFT Harmonics normal</div>
          </div>

          {/* Blade Cleanliness */}
          <div style={{ background: 'rgba(5, 11, 23, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <span>Blade Aerodynamics</span>
              <span style={{ color: cleanliness > 70 ? 'var(--teal-neon)' : 'var(--amber-warning)' }}>
                {cleanliness}% Clean
              </span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '700', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              {cleanliness}%
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Low dust drag</div>
          </div>

          {/* Operating Hours */}
          <div style={{ background: 'rgba(5, 11, 23, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <span>Operating Run Time</span>
              <Clock size={12} style={{ color: 'var(--cyan-neon)' }} />
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '700', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              {hours.toLocaleString()} <span style={{ fontSize: '0.75rem' }}>hrs</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>MTBF: 45,000 hrs</div>
          </div>
        </div>
      </div>

      {/* Preventive Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        background: 'rgba(5, 11, 23, 0.6)',
        borderRadius: '10px',
        border: '1px solid var(--border-cyan)',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--teal-neon)' }} />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
            AI Predictive Engine: Next scheduled bearing lubrication in <strong>1,840 hours</strong>.
          </span>
        </div>

        <button
          onClick={onResetFilter}
          className="btn-cyber"
          style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
        >
          <Wrench size={13} /> Log Maintenance & Clean Blades
        </button>
      </div>
    </div>
  );
}
