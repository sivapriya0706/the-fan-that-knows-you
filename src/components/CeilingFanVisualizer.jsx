import React, { useEffect, useRef, useState } from 'react';
import { Wind, RotateCw, Volume2, VolumeX, Sparkles, AlertTriangle, ShieldAlert } from 'lucide-react';
import { SPEED_RPM, SPEED_CFM, SPEED_NOISE_DB } from '../constants/fanConstants';

export default function CeilingFanVisualizer({
  speed = 2,
  power = true,
  mode = 'AUTO',
  direction = 'FORWARD',
  isHazard = false,
  roomName = 'Living Room',
  onTogglePower,
  onToggleDirection
}) {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Check if fan is in Emergency Smoke Reverse state
  const isEmergencyReverse = Boolean(isHazard || mode === 'EXHAUST');

  // When emergency reverse is active, fan operates at high speed (Level 5) in reverse
  const effectiveSpeed = power ? (isEmergencyReverse ? (speed || 5) : speed) : 0;
  const currentRPM = SPEED_RPM[effectiveSpeed] || 0;
  const currentCFM = SPEED_CFM[effectiveSpeed] || 0;
  const currentDB = SPEED_NOISE_DB[effectiveSpeed] || 0;

  // Rotation class selection:
  // When emergency reverse is active, visibly rotate counter-clockwise via dedicated emergency reverse animation!
  let rotationClass = '';
  if (effectiveSpeed > 0) {
    if (isEmergencyReverse) {
      rotationClass = 'fan-rotate-emergency-rev';
    } else {
      const isReverse = direction === 'REVERSE';
      rotationClass = isReverse 
        ? `fan-rotate-rev-${effectiveSpeed}` 
        : `fan-rotate-${effectiveSpeed}`;
    }
  }

  // Audio hum generator using Web Audio API
  useEffect(() => {
    if (!audioEnabled || effectiveSpeed === 0) {
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current?.currentTime || 0, 0.1);
      }
      return;
    }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!oscillatorRef.current) {
        // Low motor purr
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(45 + effectiveSpeed * 8, ctx.currentTime);
        gain.gain.setValueAtTime(0.02 * effectiveSpeed, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
      } else {
        oscillatorRef.current.frequency.setTargetAtTime(45 + effectiveSpeed * 9, ctx.currentTime, 0.2);
        gainNodeRef.current.gain.setTargetAtTime(0.015 * effectiveSpeed, ctx.currentTime, 0.2);
      }
    } catch (e) {
      console.warn('Web Audio synthesis notice:', e);
    }
  }, [audioEnabled, effectiveSpeed]);

  const toggleSound = () => {
    setAudioEnabled(!audioEnabled);
  };

  // Center hub glow color depending on mode/status
  let hubGlowColor = '#00F0FF';
  let statusBadgeText = `${mode} MODE`;
  if (isEmergencyReverse) {
    hubGlowColor = '#FF3366';
    statusBadgeText = 'EMERGENCY REVERSE MODE';
  } else if (mode === 'SLEEP') {
    hubGlowColor = '#A78BFA';
    statusBadgeText = 'CIRCADIAN SLEEP';
  } else if (mode === 'AUTO') {
    hubGlowColor = '#00F0FF';
    statusBadgeText = 'AI ADAPTIVE';
  } else {
    hubGlowColor = '#00E5A3';
    statusBadgeText = 'MANUAL CONTROL';
  }

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      {/* Top Header Controls inside Visualizer */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className={`badge ${isEmergencyReverse ? 'badge-red' : (mode === 'SLEEP' ? 'badge-amber' : 'badge-cyan')}`}>
            {isEmergencyReverse ? <AlertTriangle size={12} /> : null}
            {statusBadgeText}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {roomName}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Sound Synthesizer Toggle */}
          <button
            onClick={toggleSound}
            className="btn-cyber"
            style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}
            title={audioEnabled ? "Mute Fan Audio Simulation" : "Enable Realistic Fan Motor Audio"}
          >
            {audioEnabled ? <Volume2 size={14} style={{ color: 'var(--cyan-neon)' }} /> : <VolumeX size={14} />}
            {audioEnabled ? `${currentDB} dB` : 'Muted'}
          </button>

          {/* Direction Toggle */}
          <button
            onClick={onToggleDirection}
            disabled={isEmergencyReverse}
            className="btn-cyber"
            style={{
              padding: '0.35rem 0.7rem',
              fontSize: '0.75rem',
              opacity: isEmergencyReverse ? 0.5 : 1,
              cursor: isEmergencyReverse ? 'not-allowed' : 'pointer'
            }}
            title={isEmergencyReverse ? "Direction locked to Reverse during Emergency Exhaust Simulation" : "Toggle Downdraft (Summer Cool) / Updraft (Winter Circulation)"}
          >
            <RotateCw size={14} style={{ transform: (isEmergencyReverse || direction === 'REVERSE') ? 'scaleX(-1)' : 'none' }} />
            {isEmergencyReverse ? 'Reverse (Locked)' : (direction === 'REVERSE' ? 'Updraft (Winter)' : 'Downdraft (Summer)')}
          </button>
        </div>
      </div>

      {/* Prominent Emergency Reverse Alert Banner (Visually clear red alert) */}
      {isEmergencyReverse && (
        <div style={{
          width: '100%',
          background: 'rgba(255, 51, 102, 0.15)',
          border: '1.5px solid var(--red-hazard)',
          borderRadius: '10px',
          padding: '0.5rem 0.9rem',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'pulseHazard 1.8s infinite',
          boxShadow: '0 0 15px rgba(255, 51, 102, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} style={{ color: 'var(--red-hazard)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#FFFFFF', fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>
              EMERGENCY REVERSE MODE ACTIVE
            </span>
          </div>
          <span style={{
            fontSize: '0.68rem',
            color: '#FFCCD5',
            fontFamily: 'var(--font-mono)',
            background: 'rgba(255, 51, 102, 0.3)',
            padding: '0.15rem 0.5rem',
            borderRadius: '4px',
            border: '1px solid rgba(255, 51, 102, 0.5)'
          }}>
            SIMULATION DEMO BEHAVIOR
          </span>
        </div>
      )}

      {/* Main Fan Housing & Aerodynamic Blades */}
      <div style={{
        position: 'relative',
        width: '320px',
        height: '320px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0.75rem 0'
      }}>
        {/* Dynamic Airflow Vortex Ring Effects (Active when spinning) */}
        {effectiveSpeed > 0 && (
          <div style={{
            position: 'absolute',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            border: `2px dashed ${isEmergencyReverse ? 'rgba(255, 51, 102, 0.5)' : 'rgba(0, 240, 255, 0.3)'}`,
            animation: `vortexRings ${2.5 / effectiveSpeed}s cubic-bezier(0.1, 0.8, 0.3, 1) infinite`,
            pointerEvents: 'none'
          }} />
        )}
        {effectiveSpeed >= 3 && (
          <div style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            border: `1.5px solid ${isEmergencyReverse ? 'rgba(255, 51, 102, 0.3)' : 'rgba(0, 229, 163, 0.2)'}`,
            animation: `vortexRings ${2.0 / effectiveSpeed}s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 0.5s`,
            pointerEvents: 'none'
          }} />
        )}

        {/* Ambient Halo Glow */}
        <div style={{
          position: 'absolute',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${isEmergencyReverse ? 'rgba(255, 51, 102, 0.2)' : 'rgba(0, 240, 255, 0.12)'} 0%, transparent 70%)`,
          filter: 'blur(10px)',
          pointerEvents: 'none'
        }} />

        {/* SVG Ceiling Fan Assembly with 3 Aerodynamic Blades */}
        <svg
          viewBox="-160 -160 320 320"
          className={rotationClass}
          style={{
            width: '100%',
            height: '100%',
            transition: 'transform 0.6s cubic-bezier(0.2, 0.9, 0.4, 1)',
            filter: effectiveSpeed > 0 
              ? (isEmergencyReverse ? 'drop-shadow(0 0 20px rgba(255, 51, 102, 0.6))' : 'drop-shadow(0 10px 20px rgba(0,0,0,0.6))')
              : 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))'
          }}
        >
          <defs>
            {/* Blade Metallic Aerodynamic Gradient */}
            <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="35%" stopColor="#334155" />
              <stop offset="70%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* Cyan / Emergency Red Edge Accent Gradient */}
            <linearGradient id="bladeEdgeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="80%" stopColor={hubGlowColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={hubGlowColor} stopOpacity="0.9" />
            </linearGradient>

            {/* Motor Hub Radial Brushed Metallic */}
            <radialGradient id="motorHubGrad" cx="45%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="40%" stopColor="#1E293B" />
              <stop offset="85%" stopColor="#0B132B" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Neon Glow Filter */}
            <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 3 Balanced Aerodynamic Blades spaced at 120 degrees */}
          {[0, 120, 240].map((angle, index) => (
            <g key={index} transform={`rotate(${angle})`}>
              {/* Blade Body */}
              <path
                d="M -14 26 
                   C -20 65, -34 110, -22 138 
                   C -14 150, 14 150, 22 138 
                   C 34 110, 20 65, 14 26 
                   Z"
                fill="url(#bladeGrad)"
                stroke={isEmergencyReverse ? "rgba(255, 51, 102, 0.4)" : "rgba(255, 255, 255, 0.12)"}
                strokeWidth="1.2"
              />
              {/* Blade Aerodynamic Camber Spine */}
              <line
                x1="0"
                y1="32"
                x2="0"
                y2="135"
                stroke={isEmergencyReverse ? "rgba(255, 100, 130, 0.4)" : "rgba(255, 255, 255, 0.18)"}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Tip Neon Glow Strip */}
              <path
                d="M -16 130 C -8 144, 8 144, 16 130"
                fill="none"
                stroke={hubGlowColor}
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#neonGlow)"
                opacity={effectiveSpeed > 0 ? 0.95 : 0.25}
              />
              {/* Blade Root Bracket Rivets */}
              <circle cx="-6" cy="32" r="1.5" fill="#94A3B8" />
              <circle cx="6" cy="32" r="1.5" fill="#94A3B8" />
            </g>
          ))}

          {/* Motor Housing Ring (Base) */}
          <circle cx="0" cy="0" r="42" fill="url(#motorHubGrad)" stroke="#334155" strokeWidth="2.5" />
          
          {/* Motor Perimeter Air Cooling Vents */}
          {[...Array(12)].map((_, i) => (
            <line
              key={i}
              x1="0"
              y1="32"
              x2="0"
              y2="37"
              stroke={isEmergencyReverse ? "rgba(255, 51, 102, 0.4)" : "rgba(0, 240, 255, 0.25)"}
              strokeWidth="2"
              transform={`rotate(${i * 30})`}
            />
          ))}

          {/* Center LED Status Indicator Ring */}
          <circle
            cx="0"
            cy="0"
            r="20"
            fill="#060D1E"
            stroke={hubGlowColor}
            strokeWidth="3"
            filter="url(#neonGlow)"
            opacity={effectiveSpeed > 0 ? 0.95 : 0.35}
          />

          {/* Center Cap with Direction Indicator */}
          <circle cx="0" cy="0" r="10" fill={hubGlowColor} opacity={effectiveSpeed > 0 ? 0.9 : 0.3} />
          <circle cx="0" cy="0" r="4" fill="#050B17" />
        </svg>

        {/* Stopped Indicator Tag if 0 RPM */}
        {effectiveSpeed === 0 && (
          <div style={{
            position: 'absolute',
            background: 'rgba(5, 11, 23, 0.85)',
            border: '1px solid var(--border-cyan)',
            padding: '0.35rem 0.8rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            backdropFilter: 'blur(8px)'
          }}>
            FAN IDLE / STOPPED
          </div>
        )}
      </div>

      {/* Speed & Airflow Telemetry Bar */}
      <div style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
        marginTop: '0.5rem',
        padding: '0.75rem 1rem',
        background: 'rgba(5, 11, 23, 0.6)',
        borderRadius: '12px',
        border: `1px solid ${isEmergencyReverse ? 'var(--red-hazard)' : 'var(--border-cyan)'}`
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Rotational Speed
          </div>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            fontFamily: 'var(--font-mono)',
            color: isEmergencyReverse ? 'var(--red-hazard)' : 'var(--cyan-neon)'
          }}>
            {currentRPM} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>RPM</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Level {effectiveSpeed} of 5
          </div>
        </div>

        <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255, 255, 255, 0.08)', borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Displaced Airflow
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: isEmergencyReverse ? 'var(--red-hazard)' : 'var(--teal-neon)' }}>
            {currentCFM.toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CFM</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: isEmergencyReverse ? 'var(--red-hazard)' : 'var(--text-muted)', fontWeight: isEmergencyReverse ? '600' : 'normal' }}>
            {isEmergencyReverse ? 'Reverse Updraft (Demo)' : (direction === 'FORWARD' ? 'Cooling Downdraft' : 'Updraft Circulation')}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Acoustic Profile
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>
            {currentDB} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>dBA</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {isEmergencyReverse ? 'Max Exhaust Whine' : (currentDB <= 25 ? 'Whisper Quiet' : (currentDB <= 35 ? 'Soft Breeze' : 'High Velocity'))}
          </div>
        </div>
      </div>
    </div>
  );
}
