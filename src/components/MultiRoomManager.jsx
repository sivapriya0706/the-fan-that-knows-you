import React from 'react';
import { Home, Power, Sliders, Moon, CheckCheck, Users } from 'lucide-react';

export default function MultiRoomManager({
  rooms = {},
  activeRoomId = 'living-room',
  onSelectRoom,
  onTurnAllOff,
  onSyncAllEco
}) {
  const roomList = Object.values(rooms);

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 className="card-title" style={{ margin: 0 }}>
            <Home size={20} style={{ color: 'var(--cyan-neon)' }} />
            Multi-Zone Smart Home Ecosystem
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Seamlessly monitor and synchronize multiple intelligent fans across living spaces.
          </p>
        </div>

        {/* Global Controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onSyncAllEco}
            className="btn-cyber"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            title="Set all connected fans to autonomous AI Auto mode"
          >
            <CheckCheck size={14} /> Sync All to Eco AI
          </button>
          
          <button
            onClick={onTurnAllOff}
            className="btn-cyber-hazard"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '10px', cursor: 'pointer' }}
            title="Turn all fans in the home off"
          >
            <Power size={14} /> All Off
          </button>
        </div>
      </div>

      {/* 4 Room Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.85rem'
      }}>
        {roomList.map((room) => {
          const isSelected = room.id === activeRoomId;
          const isOccupied = Boolean(room.sensors?.pir);

          return (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(10, 19, 41, 0.9))'
                  : 'rgba(5, 11, 23, 0.55)',
                border: `1.5px solid ${isSelected ? 'var(--cyan-neon)' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '12px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 0 16px rgba(0, 240, 255, 0.25)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '700', fontSize: '0.95rem', color: isSelected ? 'var(--cyan-neon)' : '#FFFFFF', fontFamily: 'var(--font-display)' }}>
                  {room.name}
                </span>
                <span className={`badge ${room.power ? 'badge-green' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                  {room.power ? `SPEED ${room.fanSpeed}` : 'STANDBY'}
                </span>
              </div>

              {/* Status Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <span>Temp: <strong style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>{room.sensors?.temperature}°C</strong></span>
                <span>Mode: <strong style={{ color: 'var(--cyan-neon)' }}>{room.mode}</strong></span>
              </div>

              {/* Occupancy and Watts */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>{isOccupied ? '🟢 Occupied' : '⚪ Empty'}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{room.energy?.watts || 0}W</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
