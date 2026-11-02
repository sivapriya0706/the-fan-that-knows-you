import React from 'react';
import { AlertOctagon, Flame, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import { SPEED_RPM } from '../constants/fanConstants';

export default function EmergencyAlertBanner({
  mq2Ppm = 650,
  isHazard = true,
  onDeactivateEmergency,
  roomName = 'Living Room'
}) {
  if (!isHazard) return null;

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.25), rgba(150, 0, 30, 0.45))',
      border: '2px solid var(--red-hazard)',
      borderRadius: '16px',
      padding: '1.1rem 1.5rem',
      boxShadow: 'var(--shadow-red)',
      animation: 'pulseHazard 2s infinite',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'var(--red-hazard)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 25px var(--red-hazard)',
          flexShrink: 0
        }}>
          <Flame size={28} color="#FFFFFF" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF', fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
              CRITICAL SMOKE HAZARD · EMERGENCY REVERSE ROTATION ACTIVE
            </span>
            <span className="badge badge-red" style={{ fontSize: '0.75rem' }}>
              EMERGENCY REVERSE MODE
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#FFE4E9', marginTop: '0.25rem' }}>
            MQ2 registered <strong style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>{mq2Ppm} PPM</strong> in {roomName}. 
            Fan blades visibly transitioned to <strong>Counter-Clockwise Reverse Rotation at Speed 5 ({SPEED_RPM[5]} RPM)</strong>.
          </div>

          <div style={{ fontSize: '0.74rem', color: '#FECDD3', marginTop: '0.2rem', fontStyle: 'italic' }}>
            Note: This is a simulation/demonstration behavior for competition evaluation. Not an industrial life-safety evacuation system.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onDeactivateEmergency}
          className="btn-cyber"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1))',
            borderColor: '#FFFFFF',
            color: '#FFFFFF',
            padding: '0.6rem 1.2rem',
            fontSize: '0.85rem',
            fontWeight: '700'
          }}
          title="Restore normal forward rotation and reset sensor baseline"
        >
          <RotateCcw size={16} /> Restore Normal Mode & Rotation
        </button>
      </div>
    </div>
  );
}
