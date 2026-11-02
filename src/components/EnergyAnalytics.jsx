import React, { useState } from 'react';
import { Zap, Leaf, DollarSign, TrendingDown, Award } from 'lucide-react';

export default function EnergyAnalytics({
  watts = 26,
  dailyKWh = 0.62,
  totalCost = 5.27,
  co2SavedKg = 1.84,
  speed = 2,
  power = true
}) {
  const [currency, setCurrency] = useState('INR'); // INR (₹) or USD ($)

  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const displayCost = currency === 'INR' 
    ? (totalCost).toFixed(2)
    : (totalCost * 0.012).toFixed(2);

  // Standard induction fan wattage baseline comparison at current speed:
  // Speed 0: 0W vs 0W
  // Speed 1: 14W vs 45W
  // Speed 2: 26W vs 60W
  // Speed 3: 42W vs 75W
  // Speed 4: 60W vs 85W
  // Speed 5: 78W vs 95W
  const standardWatts = power ? [0, 45, 60, 75, 85, 95][speed] || 0 : 0;
  const currentWatts = power ? watts : 0;
  const wattsSaved = Math.max(0, standardWatts - currentWatts);
  const percentageSaved = standardWatts > 0 ? Math.round((wattsSaved / standardWatts) * 100) : 0;

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          <Zap size={20} style={{ color: 'var(--amber-warning)' }} />
          BLDC Inverter Energy Intelligence
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-green">
            <Award size={12} /> A+++ 5-STAR ECO
          </span>
          <button
            onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
            className="btn-cyber"
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
          >
            {currency} ({currencySymbol})
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="telemetry-row" style={{ marginBottom: '1.25rem' }}>
        {/* Metric 1: Real-time Wattage */}
        <div style={{ background: 'rgba(5, 11, 23, 0.6)', border: '1px solid var(--border-cyan)', borderRadius: '12px', padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>
            Instant Power
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '0.25rem' }}>
            <span className="telemetry-metric" style={{ color: 'var(--amber-warning)' }}>{currentWatts}</span>
            <span className="telemetry-unit">Watts</span>
          </div>
          <div className="telemetry-sub">
            <span>Peak Draw: 78W (Turbo)</span>
          </div>
        </div>

        {/* Metric 2: Daily Consumption */}
        <div style={{ background: 'rgba(5, 11, 23, 0.6)', border: '1px solid var(--border-cyan)', borderRadius: '12px', padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>
            Cumulative Energy
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '0.25rem' }}>
            <span className="telemetry-metric">{dailyKWh}</span>
            <span className="telemetry-unit">kWh</span>
          </div>
          <div className="telemetry-sub">
            <span>Billing cycle to date</span>
          </div>
        </div>

        {/* Metric 3: Estimated Cost */}
        <div style={{ background: 'rgba(5, 11, 23, 0.6)', border: '1px solid var(--border-cyan)', borderRadius: '12px', padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>
            Estimated Cost
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '0.25rem' }}>
            <span className="telemetry-metric" style={{ color: 'var(--teal-neon)' }}>{currencySymbol}{displayCost}</span>
          </div>
          <div className="telemetry-sub">
            <span>@ {currencySymbol}{currency === 'INR' ? '8.50' : '0.12'}/kWh</span>
          </div>
        </div>

        {/* Metric 4: Carbon Offset */}
        <div style={{ background: 'rgba(5, 11, 23, 0.6)', border: '1px solid var(--border-cyan)', borderRadius: '12px', padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>
            Carbon Offset
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '0.25rem' }}>
            <span className="telemetry-metric" style={{ color: 'var(--teal-neon)' }}>{co2SavedKg}</span>
            <span className="telemetry-unit">kg CO₂</span>
          </div>
          <div className="telemetry-sub">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--teal-neon)' }}>
              <Leaf size={12} /> Green Impact
            </span>
          </div>
        </div>
      </div>

      {/* Comparison: BLDC vs Standard AC Motor */}
      <div style={{
        background: 'rgba(5, 11, 23, 0.5)',
        border: '1px solid var(--border-cyan)',
        borderRadius: '12px',
        padding: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingDown size={16} style={{ color: 'var(--teal-neon)' }} />
            Inverter BLDC Motor vs Traditional Induction Fan
          </span>
          <span className="badge badge-green">
            {percentageSaved}% LESS POWER
          </span>
        </div>

        {/* Bar comparison */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {/* Smart Fan Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--cyan-neon)', fontWeight: '600' }}>This Smart BLDC Fan</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{currentWatts}W</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
              <div style={{
                width: `${Math.min(100, (currentWatts / 100) * 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00F0FF, #00E5A3)',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          {/* Traditional Fan Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Conventional AC Induction Fan</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{standardWatts}W</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
              <div style={{
                width: `${Math.min(100, (standardWatts / 100) * 100)}%`,
                height: '100%',
                background: '#64748B',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
