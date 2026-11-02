import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Check, X, Bell } from 'lucide-react';

export default function SchedulingTimer({
  onTimerSet,
  onTimerCancel,
  activeTimerSeconds = 0
}) {
  const [remaining, setRemaining] = useState(activeTimerSeconds);
  const [schedules, setSchedules] = useState([
    { id: 1, name: 'Morning Fresh Wake', time: '07:00 AM', speed: 2, mode: 'AUTO', enabled: true },
    { id: 2, name: 'Afternoon Heat Shield', time: '02:30 PM', speed: 4, mode: 'AUTO', enabled: true },
    { id: 3, name: 'Night Circadian Sleep', time: '10:45 PM', speed: 1, mode: 'SLEEP', enabled: true }
  ]);

  useEffect(() => {
    setRemaining(activeTimerSeconds);
  }, [activeTimerSeconds]);

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimerCancel) onTimerCancel(true); // timer expired
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining, onTimerCancel]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleSchedule = (id) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          <Clock size={20} style={{ color: 'var(--cyan-neon)' }} />
          Smart Timers & Automation Schedules
        </h2>

        {remaining > 0 && (
          <span className="badge badge-amber" style={{ animation: 'pulseGlow 1.5s infinite' }}>
            COUNTDOWN: {formatTime(remaining)}
          </span>
        )}
      </div>

      {/* Sleep Timer Presets */}
      <div style={{ marginBottom: '1.25rem', background: 'rgba(5, 11, 23, 0.5)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Quick Sleep / Auto-Off Countdown Timer
          </span>
          {remaining > 0 && (
            <button
              onClick={() => { setRemaining(0); onTimerCancel && onTimerCancel(false); }}
              className="btn-cyber-hazard"
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', borderRadius: '6px' }}
            >
              Cancel Timer
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.5rem' }}>
          {[
            { label: '15 Mins', secs: 15 * 60 },
            { label: '30 Mins', secs: 30 * 60 },
            { label: '1 Hour', secs: 60 * 60 },
            { label: '2 Hours', secs: 120 * 60 }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setRemaining(item.secs);
                onTimerSet && onTimerSet(item.secs);
              }}
              className="btn-cyber"
              style={{
                padding: '0.5rem 0',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Automation Schedules List */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={15} style={{ color: 'var(--teal-neon)' }} />
          Circadian Daily Automations
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {schedules.map((sc) => (
            <div
              key={sc.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.65rem 0.9rem',
                background: sc.enabled ? 'rgba(5, 11, 23, 0.6)' : 'rgba(5, 11, 23, 0.3)',
                border: `1px solid ${sc.enabled ? 'var(--border-subtle)' : 'transparent'}`,
                borderRadius: '8px',
                opacity: sc.enabled ? 1 : 0.5
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#FFFFFF' }}>{sc.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--cyan-neon)', fontFamily: 'var(--font-mono)' }}>
                  {sc.time} · Target Speed {sc.speed} ({sc.mode})
                </div>
              </div>

              <button
                onClick={() => toggleSchedule(sc.id)}
                className="btn-cyber"
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.72rem',
                  color: sc.enabled ? 'var(--teal-neon)' : 'var(--text-muted)',
                  borderColor: sc.enabled ? 'var(--teal-neon)' : 'var(--border-subtle)'
                }}
              >
                {sc.enabled ? 'Active' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
