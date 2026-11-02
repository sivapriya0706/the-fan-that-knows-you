import React, { useState } from 'react';
import { Thermometer, Droplets, UserCheck, UserX, AlertOctagon, Activity, Radio, Cpu } from 'lucide-react';

export default function SensorMonitoringCard({
  sensors = {
    temperature: 26.4,
    humidity: 52,
    pir: 1,
    mq2: 85,
    lastMotionTimestamp: Date.now()
  },
  dataSource = 'SIMULATION', // 'WOKWI_LIVE' or 'SIMULATION'
  onSensorChange
}) {
  const [useFahrenheit, setUseFahrenheit] = useState(false);

  const tempC = Number(sensors.temperature) || 24;
  const tempDisplay = useFahrenheit 
    ? ((tempC * 9/5) + 32).toFixed(1)
    : tempC.toFixed(1);
  const tempUnit = useFahrenheit ? '°F' : '°C';

  // Compute Heat Index ("Feels Like")
  const humidity = Number(sensors.humidity) || 50;
  const feelsLikeC = +(tempC + 0.33 * ((humidity / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC))) - 4.0).toFixed(1);
  const feelsLikeDisplay = useFahrenheit 
    ? ((feelsLikeC * 9/5) + 32).toFixed(1)
    : feelsLikeC.toFixed(1);

  // Compute Dew Point
  const dewPoint = +(tempC - ((100 - humidity) / 5)).toFixed(1);

  // PIR status
  const isPresent = Boolean(sensors.pir);

  // MQ2 Status
  const mq2Ppm = Number(sensors.mq2) || 80;
  let mq2Status = { label: 'CLEAN AIR', color: 'var(--cyan-neon)', badgeClass: 'badge-cyan' };
  if (mq2Ppm > 400) {
    mq2Status = { label: 'CRITICAL SMOKE HAZARD', color: 'var(--red-hazard)', badgeClass: 'badge-red' };
  } else if (mq2Ppm > 180) {
    mq2Status = { label: 'MODERATE PARTICULATES', color: 'var(--amber-warning)', badgeClass: 'badge-amber' };
  }

  // Thermal Comfort Status
  let thermalComfort = 'Comfortable';
  let thermalColor = 'var(--teal-neon)';
  if (tempC >= 32) {
    thermalComfort = 'Extreme Heat Alert';
    thermalColor = 'var(--red-hazard)';
  } else if (tempC >= 28) {
    thermalComfort = 'Warm Airflow Needed';
    thermalColor = 'var(--amber-warning)';
  } else if (tempC < 20) {
    thermalComfort = 'Cool Climate';
    thermalColor = 'var(--cyan-neon)';
  }

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      {/* Header with Source Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          <Activity size={20} style={{ color: 'var(--cyan-neon)' }} />
          Multi-Sensor Environmental Telemetry
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Temperature Scale Switcher */}
          <button
            onClick={() => setUseFahrenheit(!useFahrenheit)}
            className="btn-cyber"
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
          >
            Switch to {useFahrenheit ? '°C' : '°F'}
          </button>

          {/* Live vs Simulated Stream Badge */}
          {dataSource === 'WOKWI_LIVE' ? (
            <span className="badge badge-green" title="Direct MQTT packets receiving from ESP32 Wokwi hardware">
              <Radio size={12} style={{ animation: 'pulseHazard 2s infinite' }} />
              LIVE ESP32 WOKWI
            </span>
          ) : (
            <span className="badge badge-cyan" title="Simulation engine active (standalone fallback)">
              <Cpu size={12} />
              SIMULATION (DEMO)
            </span>
          )}
        </div>
      </div>

      {/* 4 Sensor Cards Grid */}
      <div className="telemetry-row">
        {/* Sensor 1: Temperature */}
        <div style={{
          background: 'rgba(5, 11, 23, 0.6)',
          border: '1px solid var(--border-cyan)',
          borderRadius: '12px',
          padding: '1.1rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Temperature
            </span>
            <Thermometer size={18} style={{ color: 'var(--cyan-neon)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '0.5rem' }}>
            <span className="telemetry-metric">{tempDisplay}</span>
            <span className="telemetry-unit">{tempUnit}</span>
          </div>

          <div className="telemetry-sub" style={{ justifyContent: 'space-between' }}>
            <span>Feels like: <strong>{feelsLikeDisplay}{tempUnit}</strong></span>
            <span style={{ color: thermalColor, fontWeight: '600' }}>{thermalComfort}</span>
          </div>
        </div>

        {/* Sensor 2: Humidity */}
        <div style={{
          background: 'rgba(5, 11, 23, 0.6)',
          border: '1px solid var(--border-cyan)',
          borderRadius: '12px',
          padding: '1.1rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Relative Humidity
            </span>
            <Droplets size={18} style={{ color: 'var(--teal-neon)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '0.5rem' }}>
            <span className="telemetry-metric">{humidity}</span>
            <span className="telemetry-unit">% RH</span>
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', margin: '0.5rem 0' }}>
            <div style={{
              width: `${Math.min(100, humidity)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00F0FF, #00E5A3)',
              borderRadius: '2px'
            }} />
          </div>

          <div className="telemetry-sub" style={{ justifyContent: 'space-between' }}>
            <span>Dew Point: <strong>{dewPoint}°C</strong></span>
            <span>{humidity >= 40 && humidity <= 60 ? 'Optimal Range' : 'High Humidity'}</span>
          </div>
        </div>

        {/* Sensor 3: PIR Motion Sensor */}
        <div style={{
          background: 'rgba(5, 11, 23, 0.6)',
          border: `1px solid ${isPresent ? 'rgba(0, 229, 163, 0.4)' : 'var(--border-cyan)'}`,
          borderRadius: '12px',
          padding: '1.1rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              PIR Motion / Presence
            </span>
            {isPresent ? (
              <UserCheck size={18} style={{ color: 'var(--teal-neon)' }} />
            ) : (
              <UserX size={18} style={{ color: 'var(--text-muted)' }} />
            )}
          </div>

          <div style={{ marginTop: '0.6rem' }}>
            <span className={`badge ${isPresent ? 'badge-green' : 'badge-cyan'}`} style={{ fontSize: '0.85rem' }}>
              {isPresent ? 'ROOM OCCUPIED' : 'ROOM VACANT'}
            </span>
          </div>

          <div className="telemetry-sub" style={{ marginTop: '0.8rem' }}>
            {isPresent ? (
              <span>Human presence detected & active</span>
            ) : (
              <span>Standby: Auto-shutoff in 5m</span>
            )}
          </div>
        </div>

        {/* Sensor 4: MQ2 Smoke & Air Quality */}
        <div style={{
          background: mq2Ppm > 400 ? 'rgba(255, 51, 102, 0.12)' : 'rgba(5, 11, 23, 0.6)',
          border: `1px solid ${mq2Ppm > 400 ? 'var(--red-hazard)' : 'var(--border-cyan)'}`,
          borderRadius: '12px',
          padding: '1.1rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              MQ2 Gas / Smoke
            </span>
            <AlertOctagon size={18} style={{ color: mq2Ppm > 400 ? 'var(--red-hazard)' : 'var(--cyan-neon)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '0.5rem' }}>
            <span className="telemetry-metric" style={{ color: mq2Ppm > 400 ? 'var(--red-hazard)' : '#FFFFFF' }}>
              {mq2Ppm}
            </span>
            <span className="telemetry-unit">PPM</span>
          </div>

          <div style={{ marginTop: '0.4rem' }}>
            <span className={`badge ${mq2Status.badgeClass}`}>
              {mq2Status.label}
            </span>
          </div>

          <div className="telemetry-sub" style={{ marginTop: '0.5rem' }}>
            <span>Threshold: &gt;400 PPM Exhaust</span>
          </div>
        </div>
      </div>
    </div>
  );
}
