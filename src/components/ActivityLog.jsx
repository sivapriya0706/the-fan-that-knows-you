import React, { useState } from 'react';
import { ListFilter, Download, Trash2, Cpu, AlertTriangle, User, Info } from 'lucide-react';

export default function ActivityLog({
  logs = [],
  onClearLogs
}) {
  const [filter, setFilter] = useState('ALL'); // ALL, AI, ALERT, USER, SYSTEM

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    return log.type === filter;
  });

  const exportLogs = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_fan_telemetry_logs_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogBadge = (type) => {
    switch (type) {
      case 'ALERT':
        return { label: 'HAZARD ALERT', className: 'badge-red', icon: AlertTriangle };
      case 'AI':
        return { label: 'NEURAL AI', className: 'badge-cyan', icon: Cpu };
      case 'USER':
        return { label: 'USER ACTION', className: 'badge-green', icon: User };
      default:
        return { label: 'SYSTEM', className: 'badge-cyan', icon: Info };
    }
  };

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 className="card-title" style={{ margin: 0 }}>
            <ListFilter size={20} style={{ color: 'var(--cyan-neon)' }} />
            System Audit & Neural Activity Log
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Chronological audit trail of autonomous thermal decisions, sensor triggers, and manual interactions.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={exportLogs}
            className="btn-cyber"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            title="Download audit logs as JSON file"
          >
            <Download size={14} /> Export JSON
          </button>

          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="btn-cyber"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}
              title="Clear event history"
            >
              <Trash2 size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['ALL', 'AI', 'ALERT', 'USER', 'SYSTEM'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? 'rgba(0, 240, 255, 0.2)' : 'rgba(5, 11, 23, 0.4)',
              border: `1px solid ${filter === f ? 'var(--cyan-neon)' : 'rgba(255, 255, 255, 0.08)'}`,
              color: filter === f ? '#FFFFFF' : 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '0.25rem 0.65rem',
              fontSize: '0.72rem',
              fontWeight: '600',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Log Feed List */}
      <div style={{
        maxHeight: '260px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        paddingRight: '0.25rem'
      }}>
        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No log events recorded in this category.
          </div>
        ) : (
          filteredLogs.slice().reverse().map((log) => {
            const badgeInfo = getLogBadge(log.type);
            const Icon = badgeInfo.icon;

            return (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  background: log.type === 'ALERT' ? 'rgba(255, 51, 102, 0.12)' : 'rgba(5, 11, 23, 0.5)',
                  border: `1px solid ${log.type === 'ALERT' ? 'rgba(255, 51, 102, 0.4)' : 'rgba(255, 255, 255, 0.05)'}`,
                  borderRadius: '8px',
                  fontSize: '0.82rem'
                }}
              >
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: '70px', paddingTop: '2px' }}>
                  {log.timestamp}
                </span>

                <span className={`badge ${badgeInfo.className}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                  <Icon size={10} /> {badgeInfo.label}
                </span>

                <span style={{ color: log.type === 'ALERT' ? '#FF8BA7' : 'var(--text-primary)', flex: 1 }}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
