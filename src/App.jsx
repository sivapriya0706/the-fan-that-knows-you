import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wind, Radio, Settings, ShieldAlert, Cpu, Sparkles, Activity, Layers } from 'lucide-react';
import mqtt from 'mqtt';

// Shared Constants
import { SPEED_WATTS, SPEED_RPM } from './constants/fanConstants';

// Components
import CeilingFanVisualizer from './components/CeilingFanVisualizer';
import SensorMonitoringCard from './components/SensorMonitoringCard';
import ModeControls from './components/ModeControls';
import DemoScenariosDock from './components/DemoScenariosDock';
import EnergyAnalytics from './components/EnergyAnalytics';
import FanHealthMonitor from './components/FanHealthMonitor';
import MultiRoomManager from './components/MultiRoomManager';
import VoiceCommandSimulator from './components/VoiceCommandSimulator';
import SchedulingTimer from './components/SchedulingTimer';
import HistoricalCharts from './components/HistoricalCharts';
import ActivityLog from './components/ActivityLog';
import WokwiMqttModal from './components/WokwiMqttModal';
import EmergencyAlertBanner from './components/EmergencyAlertBanner';

const INITIAL_ROOMS = {
  'living-room': {
    id: 'living-room',
    name: 'Living Room',
    fanSpeed: 2,
    mode: 'AUTO',
    power: true,
    direction: 'FORWARD',
    oscillation: false,
    sensors: {
      temperature: 26.4,
      humidity: 52,
      pir: 1,
      mq2: 65,
      lastMotionTimestamp: Date.now()
    },
    health: {
      score: 97,
      motorTemp: 38.2,
      vibration: 0.42,
      filterCleanliness: 88,
      hoursUsed: 1420
    },
    energy: {
      watts: 26,
      dailyKWh: 0.62,
      totalCost: 5.27,
      co2SavedKg: 1.84
    }
  },
  'master-bedroom': {
    id: 'master-bedroom',
    name: 'Master Bedroom',
    fanSpeed: 1,
    mode: 'SLEEP',
    power: true,
    direction: 'FORWARD',
    oscillation: true,
    sensors: {
      temperature: 23.8,
      humidity: 48,
      pir: 1,
      mq2: 45,
      lastMotionTimestamp: Date.now()
    },
    health: {
      score: 99,
      motorTemp: 32.1,
      vibration: 0.28,
      filterCleanliness: 94,
      hoursUsed: 980
    },
    energy: {
      watts: 14,
      dailyKWh: 0.38,
      totalCost: 3.23,
      co2SavedKg: 1.12
    }
  },
  'home-office': {
    id: 'home-office',
    name: 'Home Office',
    fanSpeed: 3,
    mode: 'AUTO',
    power: true,
    direction: 'FORWARD',
    oscillation: false,
    sensors: {
      temperature: 28.2,
      humidity: 61,
      pir: 1,
      mq2: 70,
      lastMotionTimestamp: Date.now()
    },
    health: {
      score: 94,
      motorTemp: 41.5,
      vibration: 0.55,
      filterCleanliness: 82,
      hoursUsed: 1850
    },
    energy: {
      watts: 42,
      dailyKWh: 0.89,
      totalCost: 7.56,
      co2SavedKg: 2.65
    }
  },
  'kids-room': {
    id: 'kids-room',
    name: 'Kids Room',
    fanSpeed: 0,
    mode: 'AUTO',
    power: false,
    direction: 'FORWARD',
    oscillation: false,
    sensors: {
      temperature: 24.5,
      humidity: 50,
      pir: 0,
      mq2: 50,
      lastMotionTimestamp: Date.now() - 3600000
    },
    health: {
      score: 98,
      motorTemp: 26.0,
      vibration: 0.15,
      filterCleanliness: 91,
      hoursUsed: 620
    },
    energy: {
      watts: 0,
      dailyKWh: 0.12,
      totalCost: 1.02,
      co2SavedKg: 0.36
    }
  }
};

export default function App() {
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState('living-room');
  const [currentScenario, setCurrentScenario] = useState('comfortable-room');
  const [aiAggressiveness, setAiAggressiveness] = useState(50);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(0);

  // MQTT Connection state: Default to SIMULATION unless live messages are flowing
  const [mqttStatus, setMqttStatus] = useState({
    connected: false,
    broker: 'broker.hivemq.com',
    dataSource: 'SIMULATION', // Strictly 'SIMULATION' until real packets arrive
    lastPacket: null
  });
  const [isWokwiModalOpen, setIsWokwiModalOpen] = useState(false);

  // Event audit logs
  const [logs, setLogs] = useState([
    { id: 1, timestamp: new Date().toLocaleTimeString(), type: 'SYSTEM', message: 'The Fan That Knows You — Neural IoT Engine booted.' },
    { id: 2, timestamp: new Date().toLocaleTimeString(), type: 'AI', message: 'Environmental baseline calibrated. Adaptive comfort curve active.' }
  ]);

  // Telemetry history for charts
  const [historyData, setHistoryData] = useState([
    { time: '08:00', temp: 24.2, humidity: 48, speed: 2, watts: 26 },
    { time: '10:00', temp: 26.5, humidity: 52, speed: 3, watts: 42 },
    { time: '12:00', temp: 29.8, humidity: 62, speed: 4, watts: 60 },
    { time: '14:00', temp: 31.4, humidity: 68, speed: 4, watts: 60 },
    { time: '16:00', temp: 28.6, humidity: 58, speed: 3, watts: 42 },
    { time: '18:00', temp: 26.4, humidity: 52, speed: 2, watts: 26 }
  ]);

  const activeRoom = rooms[activeRoomId] || rooms['living-room'];
  const isEmergencySmoke = activeRoom.sensors.mq2 > 400 || activeRoom.mode === 'EXHAUST';

  const addLog = useCallback((type, message) => {
    setLogs(prev => [
      ...prev,
      { id: Date.now() + Math.random(), timestamp: new Date().toLocaleTimeString(), type, message }
    ]);
  }, []);

  // Browser-native direct MQTT client connection
  const clientRef = useRef(null);

  useEffect(() => {
    const wsBroker = 'wss://broker.hivemq.com:8884/mqtt';
    try {
      const client = mqtt.connect(wsBroker, {
        clientId: `smartfan_browser_${Math.random().toString(16).substring(2, 8)}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 15000
      });

      client.on('connect', () => {
        // Do NOT set WOKWI_LIVE yet; wait until actual sensor packets are received!
        setMqttStatus(prev => ({ ...prev, connected: true, dataSource: 'SIMULATION' }));
        addLog('SYSTEM', 'Connected to MQTT WebSocket broker. Waiting for live telemetry packets...');
        client.subscribe('smartfan/+/sensors');
      });

      client.on('message', (topic, payload) => {
        try {
          const data = JSON.parse(payload.toString());
          const parts = topic.split('/');
          const rKey = parts[1] || 'living-room';

          setRooms(prev => {
            if (!prev[rKey]) return prev;
            const updated = { ...prev };
            const r = { ...updated[rKey], sensors: { ...updated[rKey].sensors } };
            if (data.temperature !== undefined) r.sensors.temperature = Number(data.temperature);
            if (data.humidity !== undefined) r.sensors.humidity = Number(data.humidity);
            if (data.pir !== undefined) r.sensors.pir = Number(data.pir);
            if (data.mq2 !== undefined) r.sensors.mq2 = Number(data.mq2);
            r.sensors.lastMotionTimestamp = Date.now();
            updated[rKey] = r;
            return updated;
          });

          // Only mark as WOKWI_LIVE when real packets are received
          setMqttStatus(prev => ({
            ...prev,
            connected: true,
            dataSource: 'WOKWI_LIVE',
            lastPacket: Date.now()
          }));
        } catch (e) {
          console.warn('MQTT parse notice:', e);
        }
      });

      client.on('error', () => {
        setMqttStatus(prev => ({ ...prev, connected: false, dataSource: 'SIMULATION' }));
      });

      client.on('offline', () => {
        setMqttStatus(prev => ({ ...prev, connected: false, dataSource: 'SIMULATION' }));
      });

      clientRef.current = client;
    } catch (err) {
      console.warn('Direct MQTT client init:', err);
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.end();
      }
    };
  }, [addLog]);

  // Periodic heartbeat: revert to SIMULATION if no packet received in 12 seconds
  useEffect(() => {
    const packetCheckInterval = setInterval(() => {
      setMqttStatus(prev => {
        if (prev.dataSource === 'WOKWI_LIVE') {
          if (!prev.lastPacket || (Date.now() - prev.lastPacket > 12000)) {
            return { ...prev, dataSource: 'SIMULATION' };
          }
        }
        return prev;
      });
    }, 4000);
    return () => clearInterval(packetCheckInterval);
  }, []);

  // Publish controls via MQTT if connected
  const publishMqttControl = (roomId, updates) => {
    if (clientRef.current && clientRef.current.connected) {
      const topic = `smartfan/${roomId}/control`;
      const payload = JSON.stringify({
        ...updates,
        timestamp: Date.now()
      });
      clientRef.current.publish(topic, payload);
    }
  };

  // Autonomous AI Comfort & Safety Logic Loop (Every 2 seconds)
  useEffect(() => {
    const aiInterval = setInterval(() => {
      setRooms(prevRooms => {
        let stateChanged = false;
        const newRooms = { ...prevRooms };

        Object.keys(newRooms).forEach(key => {
          const r = { ...newRooms[key] };
          const s = { ...r.sensors };
          const e = { ...r.energy };
          const h = { ...r.health };

          // 1. Safety Check: MQ2 Smoke Hazard Check -> Transition to Emergency Reverse Mode!
          if (s.mq2 > 400 && r.mode !== 'EXHAUST') {
            r.mode = 'EXHAUST';
            r.fanSpeed = 5;
            r.power = true;
            r.direction = 'REVERSE'; // REVERSE ROTATION!
            stateChanged = true;
            addLog('ALERT', `Critical smoke in ${r.name} (${s.mq2} PPM)! Transitioned to Emergency Reverse Exhaust Mode at Speed 5 (${SPEED_RPM[5]} RPM).`);
          }

          // 2. Autonomous AI Auto Mode Adjustment
          if (r.mode === 'AUTO' && r.power && s.mq2 <= 400) {
            let targetSpeed = 2;

            if (s.pir === 0) {
              // Room is vacant -> Turn off fan after eco timeout
              targetSpeed = 0;
            } else {
              // Room is occupied -> evaluate thermal comfort curve
              const temp = Number(s.temperature);
              const hum = Number(s.humidity);

              // Sensitivity adjusted by aiAggressiveness (30-70)
              const bias = (aiAggressiveness - 50) * 0.1;

              if (temp >= (32 - bias)) {
                targetSpeed = 5; // Extreme heat
              } else if (temp >= (28.5 - bias)) {
                targetSpeed = 4; // High heat
              } else if (temp >= (25.5 - bias)) {
                targetSpeed = 3; // Warm
              } else if (temp >= (22.5 - bias)) {
                targetSpeed = 2; // Optimal
              } else {
                targetSpeed = 1; // Cool breeze
              }

              // Humidity compensation factor (mugginess)
              if (hum > 70 && targetSpeed < 5) {
                targetSpeed += 1;
              }
            }

            if (r.fanSpeed !== targetSpeed) {
              r.fanSpeed = targetSpeed;
              stateChanged = true;
              addLog('AI', `AI re-adjusted ${r.name} velocity to Level ${targetSpeed} (${s.temperature}°C, ${s.humidity}% RH).`);
            }
          }

          // 3. Update Real-time Energy Wattage & Cumulative kWh
          if (r.power) {
            e.watts = SPEED_WATTS[r.fanSpeed] || 0;
            e.dailyKWh = +(e.dailyKWh + (e.watts / (3600 * 1000))).toFixed(3);
            e.totalCost = +(e.dailyKWh * 8.5).toFixed(2);
            e.co2SavedKg = +(e.dailyKWh * 0.82).toFixed(2);
            h.hoursUsed = +(h.hoursUsed + 0.002).toFixed(2);
            h.motorTemp = +(30 + r.fanSpeed * 2.6 + (Math.random() * 0.4 - 0.2)).toFixed(1);
          } else {
            e.watts = 0;
            h.motorTemp = +(Math.max(25, h.motorTemp - 0.2)).toFixed(1);
          }

          r.sensors = s;
          r.energy = e;
          r.health = h;
          newRooms[key] = r;
        });

        return stateChanged ? newRooms : prevRooms;
      });
    }, 2500);

    return () => clearInterval(aiInterval);
  }, [aiAggressiveness, addLog]);

  // Periodic historical point recorder
  useEffect(() => {
    const historyInterval = setInterval(() => {
      setHistoryData(prev => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const newPoint = {
          time: timeStr,
          temp: activeRoom.sensors.temperature,
          humidity: activeRoom.sensors.humidity,
          speed: activeRoom.fanSpeed,
          watts: activeRoom.energy.watts
        };
        const updated = [...prev, newPoint];
        if (updated.length > 12) updated.shift();
        return updated;
      });
    }, 15000);
    return () => clearInterval(historyInterval);
  }, [activeRoom]);

  // Handler: Change fan speed
  const handleSpeedChange = (speed) => {
    setRooms(prev => {
      const room = { ...prev[activeRoomId], fanSpeed: speed, power: speed > 0 };
      if (room.mode === 'AUTO') room.mode = 'MANUAL';
      return { ...prev, [activeRoomId]: room };
    });
    publishMqttControl(activeRoomId, { speed, mode: 'MANUAL', power: speed > 0 });
    addLog('USER', `Set ${activeRoom.name} speed to Level ${speed} (${SPEED_RPM[speed]} RPM).`);
  };

  // Handler: Change mode
  const handleModeChange = (mode) => {
    setRooms(prev => {
      const room = { ...prev[activeRoomId], mode };
      if (mode === 'EXHAUST') {
        room.fanSpeed = 5;
        room.power = true;
        room.direction = 'REVERSE'; // REVERSE ROTATION!
      } else if (mode === 'SLEEP') {
        room.fanSpeed = 1;
        room.power = true;
        room.direction = 'FORWARD';
      } else if (mode === 'AUTO') {
        room.power = true;
        room.direction = 'FORWARD';
      }
      return { ...prev, [activeRoomId]: room };
    });
    publishMqttControl(activeRoomId, { mode });
    addLog('USER', `Switched ${activeRoom.name} to ${mode} mode.`);
  };

  // Handler: Toggle Power
  const handlePowerToggle = (forcedState) => {
    const nextPower = forcedState !== undefined ? Boolean(forcedState) : !activeRoom.power;
    setRooms(prev => {
      const room = { ...prev[activeRoomId], power: nextPower };
      if (!nextPower) {
        room.fanSpeed = 0;
      } else if (room.fanSpeed === 0) {
        room.fanSpeed = 2;
      }
      return { ...prev, [activeRoomId]: room };
    });
    publishMqttControl(activeRoomId, { power: nextPower });
    addLog('USER', `${activeRoom.name} fan powered ${nextPower ? 'ON' : 'OFF'}.`);
  };

  // Handler: Toggle Direction
  const handleDirectionToggle = () => {
    if (isEmergencySmoke) return; // Locked in reverse during emergency
    const nextDir = activeRoom.direction === 'FORWARD' ? 'REVERSE' : 'FORWARD';
    setRooms(prev => ({
      ...prev,
      [activeRoomId]: { ...prev[activeRoomId], direction: nextDir }
    }));
    publishMqttControl(activeRoomId, { direction: nextDir });
    addLog('USER', `Airflow direction set to ${nextDir === 'FORWARD' ? 'Downdraft (Summer)' : 'Updraft (Winter)'}.`);
  };

  // Handler: Toggle Oscillation
  const handleOscillationToggle = () => {
    const nextOsc = !activeRoom.oscillation;
    setRooms(prev => ({
      ...prev,
      [activeRoomId]: { ...prev[activeRoomId], oscillation: nextOsc }
    }));
    publishMqttControl(activeRoomId, { oscillation: nextOsc });
    addLog('USER', `Oscillation ${nextOsc ? 'activated' : 'deactivated'} for ${activeRoom.name}.`);
  };

  // Handler: Reset Emergency Smoke Hazard (Restore normal rotation and baseline)
  const handleDeactivateEmergency = () => {
    setRooms(prev => {
      const room = {
        ...prev[activeRoomId],
        mode: 'AUTO',
        direction: 'FORWARD', // Restore normal forward rotation!
        fanSpeed: 2,
        sensors: { ...prev[activeRoomId].sensors, mq2: 65 }
      };
      return { ...prev, [activeRoomId]: room };
    });
    setCurrentScenario('comfortable-room');
    publishMqttControl(activeRoomId, { exhaust: false, mode: 'AUTO', direction: 'FORWARD' });
    addLog('SYSTEM', `Emergency smoke cleared. Restored ${activeRoom.name} to normal forward rotation & AI Auto.`);
  };

  // Handler: Apply 1-click Preset Scenario
  const handleApplyScenario = (scId) => {
    setCurrentScenario(scId);

    setRooms(prev => {
      const room = { ...prev[activeRoomId], sensors: { ...prev[activeRoomId].sensors } };

      switch (scId) {
        case 'hot-room':
          room.sensors.temperature = 34.5;
          room.sensors.humidity = 76;
          room.sensors.pir = 1;
          room.sensors.mq2 = 75;
          room.mode = 'AUTO';
          room.fanSpeed = 5;
          room.power = true;
          room.direction = 'FORWARD';
          addLog('AI', 'Scenario applied: Hot Room (34.5°C, 76% RH). Autonomous Speed 5 activated.');
          break;

        case 'comfortable-room':
          room.sensors.temperature = 24.2;
          room.sensors.humidity = 48;
          room.sensors.pir = 1;
          room.sensors.mq2 = 65;
          room.mode = 'AUTO';
          room.fanSpeed = 2;
          room.power = true;
          room.direction = 'FORWARD';
          addLog('AI', 'Scenario applied: Comfortable Room (24.2°C). Cruising at Eco Speed 2.');
          break;

        case 'empty-room':
          room.sensors.temperature = 26.0;
          room.sensors.humidity = 50;
          room.sensors.pir = 0;
          room.sensors.mq2 = 55;
          room.mode = 'AUTO';
          room.fanSpeed = 0;
          room.power = false;
          room.direction = 'FORWARD';
          addLog('AI', 'Scenario applied: Vacant Room (PIR 0). Power-saving standby engaged.');
          break;

        case 'sleep-mode':
          room.sensors.temperature = 22.5;
          room.sensors.humidity = 45;
          room.sensors.pir = 1;
          room.sensors.mq2 = 40;
          room.mode = 'SLEEP';
          room.fanSpeed = 1;
          room.power = true;
          room.direction = 'FORWARD';
          addLog('SYSTEM', 'Scenario applied: Night Sleep Profile. Whisper-quiet 115 RPM.');
          break;

        case 'smoke-emergency':
          room.sensors.temperature = 31.0;
          room.sensors.humidity = 60;
          room.sensors.pir = 1;
          room.sensors.mq2 = 680; // High smoke!
          room.mode = 'EXHAUST';
          room.fanSpeed = 5;
          room.power = true;
          room.direction = 'REVERSE'; // VISIBLE REVERSE ROTATION!
          addLog('ALERT', 'Scenario applied: Smoke Hazard (680 PPM)! Blades transitioned to Emergency Reverse Rotation.');
          break;

        default:
          break;
      }

      return { ...prev, [activeRoomId]: room };
    });
  };

  // Handler: Manual sensor override sliders
  const handleManualSensorOverride = (key, val) => {
    setRooms(prev => {
      const room = {
        ...prev[activeRoomId],
        sensors: { ...prev[activeRoomId].sensors, [key]: val }
      };
      return { ...prev, [activeRoomId]: room };
    });
  };

  // Handler: Reset Sensors
  const handleResetSensors = () => {
    handleDeactivateEmergency();
  };

  // Handler: Multi-room actions
  const handleTurnAllOff = () => {
    setRooms(prev => {
      const updated = {};
      Object.keys(prev).forEach(k => {
        updated[k] = { ...prev[k], power: false, fanSpeed: 0 };
      });
      return updated;
    });
    addLog('USER', 'Global command: All fans switched to standby.');
  };

  const handleSyncAllEco = () => {
    setRooms(prev => {
      const updated = {};
      Object.keys(prev).forEach(k => {
        updated[k] = { ...prev[k], power: true, mode: 'AUTO', direction: 'FORWARD' };
      });
      return updated;
    });
    addLog('USER', 'Global command: Synchronized all rooms to autonomous Eco AI mode.');
  };

  // Handler: Real Voice Command Processor
  const handleVoiceCommand = (cmd) => {
    if (!cmd) return '';
    let responseText = '';
    const text = cmd.toLowerCase().trim();

    // 1. Emergency Smoke Reverse Mode
    if (text.includes('emergency') || text.includes('smoke') || text.includes('hazard') || text.includes('reverse exhaust') || text.includes('fire')) {
      handleApplyScenario('smoke-emergency');
      responseText = `Activating Emergency Reverse Mode simulation in ${activeRoom.name}. Blades rotating in reverse at Speed 5.`;
    }
    // 2. Clear / Reset Emergency
    else if (text.includes('reset') || text.includes('clear emergency') || text.includes('normal mode')) {
      handleDeactivateEmergency();
      responseText = `Clearing emergency state. Restored ${activeRoom.name} fan to normal forward rotation and AI Auto mode.`;
    }
    // 3. Power ON
    else if (text.includes('turn on') || text.includes('power on') || text.includes('start fan') || text === 'fan on' || text === 'switch on' || text === 'on') {
      handlePowerToggle(true);
      responseText = `Turned ON the fan in ${activeRoom.name}.`;
    }
    // 4. Power OFF
    else if (text.includes('turn off') || text.includes('power off') || text.includes('stop fan') || text === 'fan off' || text === 'switch off' || text === 'off' || text.includes('shutdown')) {
      handlePowerToggle(false);
      responseText = `Turned OFF the fan in ${activeRoom.name}. System entering standby.`;
    }
    // 5. Operating Modes
    else if (text.includes('sleep') || text.includes('night mode') || text.includes('bedtime')) {
      handleModeChange('SLEEP');
      responseText = `Sleep mode engaged for ${activeRoom.name}. Whisper quiet rotation active at Level 1 (${SPEED_RPM[1]} RPM).`;
    }
    else if (text.includes('auto') || text.includes('automatic') || text.includes('smart mode')) {
      handleModeChange('AUTO');
      responseText = `AI Autonomous comfort curve engaged for ${activeRoom.name}.`;
    }
    else if (text.includes('manual')) {
      handleModeChange('MANUAL');
      responseText = `Manual mode activated for ${activeRoom.name}.`;
    }
    // 6. Speed Levels 0 to 5
    else if (text.includes('speed 0') || text.includes('level 0') || text.includes('speed zero')) {
      handleSpeedChange(0);
      responseText = `Setting ${activeRoom.name} fan to Level 0 (Stopped).`;
    }
    else if (text.includes('speed 1') || text.includes('level 1') || text.includes('speed one') || text.includes('lowest') || text.includes('slowest')) {
      handleSpeedChange(1);
      responseText = `Setting ${activeRoom.name} fan to Speed Level 1 (${SPEED_RPM[1]} RPM).`;
    }
    else if (text.includes('speed 2') || text.includes('level 2') || text.includes('speed two')) {
      handleSpeedChange(2);
      responseText = `Setting ${activeRoom.name} fan to Speed Level 2 (${SPEED_RPM[2]} RPM).`;
    }
    else if (text.includes('speed 3') || text.includes('level 3') || text.includes('speed three') || text.includes('medium')) {
      handleSpeedChange(3);
      responseText = `Setting ${activeRoom.name} fan to Speed Level 3 (${SPEED_RPM[3]} RPM).`;
    }
    else if (text.includes('speed 4') || text.includes('level 4') || text.includes('speed four') || text.includes('cool me down') || text.includes('cool')) {
      handleSpeedChange(4);
      responseText = `Setting ${activeRoom.name} fan to Speed Level 4 (${SPEED_RPM[4]} RPM) for rapid cooling.`;
    }
    else if (text.includes('speed 5') || text.includes('level 5') || text.includes('speed five') || text.includes('max') || text.includes('maximum') || text.includes('turbo')) {
      handleSpeedChange(5);
      responseText = `Ramping ${activeRoom.name} fan to maximum turbo velocity Level 5 (${SPEED_RPM[5]} RPM).`;
    }
    else {
      // General match
      responseText = `Voice command "${cmd}" received and calibrated for ${activeRoom.name}.`;
    }

    addLog('USER', `Voice Command: "${cmd}" -> ${responseText}`);
    return responseText;
  };

  // Handler: Send test MQTT packet
  const handleSendTestPacket = () => {
    if (clientRef.current && clientRef.current.connected) {
      const mockPayload = JSON.stringify({
        temperature: +(25 + Math.random() * 5).toFixed(1),
        humidity: Math.round(45 + Math.random() * 20),
        pir: 1,
        mq2: Math.round(50 + Math.random() * 40)
      });
      clientRef.current.publish(`smartfan/${activeRoomId}/sensors`, mockPayload);
      addLog('USER', `Transmitted live MQTT packet to smartfan/${activeRoomId}/sensors.`);
    } else {
      // Simulate locally without faking live hardware status
      handleManualSensorOverride('temperature', +(26 + Math.random() * 3).toFixed(1));
      addLog('SYSTEM', 'Simulated packet processed via internal neural bus.');
    }
  };

  const isLiveMqttReceiving = mqttStatus.dataSource === 'WOKWI_LIVE';

  return (
    <div className="app-container">
      {/* Top Futuristic Navigation Bar */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        background: 'rgba(10, 19, 41, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-cyan)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-neon-sm)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Project Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00F0FF, #0080FF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.6)'
          }}>
            <Wind size={24} color="#050B17" style={{ animation: activeRoom.power ? (activeRoom.direction === 'REVERSE' ? 'spinReverse 0.6s linear infinite' : 'spinForward 2s linear infinite') : 'none' }} />
          </div>

          <div>
            <h1 style={{
              fontSize: '1.35rem',
              fontWeight: '800',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.04em',
              background: 'linear-gradient(90deg, #FFFFFF, #00F0FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              THE FAN THAT KNOWS YOU
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', margin: 0 }}>
              AI-POWERED PERSONALIZED SMART FAN SYSTEM · IoT WOKWI READY
            </p>
          </div>
        </div>

        {/* Status Indicators & Wokwi Modal Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Active Room Badge */}
          <span className="badge badge-cyan" style={{ fontSize: '0.8rem' }}>
            <Layers size={13} /> {activeRoom.name}
          </span>

          {/* MQTT Connection Badge: STRICTLY distinguishes Live vs Simulation */}
          <button
            onClick={() => setIsWokwiModalOpen(true)}
            className="btn-cyber"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}
            title="Configure or inspect ESP32 Wokwi MQTT integration"
          >
            <Radio size={14} style={{ color: isLiveMqttReceiving ? 'var(--teal-neon)' : 'var(--amber-warning)' }} />
            {isLiveMqttReceiving 
              ? 'ESP32 Wokwi Live' 
              : (mqttStatus.connected ? 'MQTT Connected (Simulation)' : 'MQTT Disconnected (Simulation)')}
          </button>
        </div>
      </header>

      {/* Emergency Hazard Banner (Pulsates if smoke detected or smoke emergency active) */}
      <EmergencyAlertBanner
        mq2Ppm={activeRoom.sensors.mq2}
        isHazard={isEmergencySmoke}
        roomName={activeRoom.name}
        onDeactivateEmergency={handleDeactivateEmergency}
      />

      {/* Competition Demo Scenarios Dock (Primary Showcase) */}
      <DemoScenariosDock
        currentScenario={currentScenario}
        sensors={activeRoom.sensors}
        onApplyScenario={handleApplyScenario}
        onManualSensorOverride={handleManualSensorOverride}
        onResetSensors={handleResetSensors}
      />

      {/* Main Dashboard Layout: 2 Columns */}
      <div className="dashboard-grid">
        {/* Left Column: Visualizer & Environmental Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. Realistic Ceiling Fan Visualizer with Visible Reverse Rotation */}
          <CeilingFanVisualizer
            speed={activeRoom.fanSpeed}
            power={activeRoom.power}
            mode={activeRoom.mode}
            direction={activeRoom.direction}
            isHazard={isEmergencySmoke}
            roomName={activeRoom.name}
            onTogglePower={handlePowerToggle}
            onToggleDirection={handleDirectionToggle}
          />

          {/* 2. Sensor Telemetry Card */}
          <SensorMonitoringCard
            sensors={activeRoom.sensors}
            dataSource={mqttStatus.dataSource}
            onSensorChange={handleManualSensorOverride}
          />

          {/* 3. 24-Hour Historical Telemetry Charts */}
          <HistoricalCharts dataPoints={historyData} />
        </div>

        {/* Right Column: Mode Controls, Multi-room, Energy, Health, Voice, Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. Velocity & Mode Matrix */}
          <ModeControls
            speed={activeRoom.fanSpeed}
            mode={activeRoom.mode}
            power={activeRoom.power}
            direction={activeRoom.direction}
            oscillation={activeRoom.oscillation}
            aiAggressiveness={aiAggressiveness}
            onSpeedChange={handleSpeedChange}
            onModeChange={handleModeChange}
            onPowerToggle={handlePowerToggle}
            onDirectionToggle={handleDirectionToggle}
            onOscillationToggle={handleOscillationToggle}
            onAiAggressivenessChange={setAiAggressiveness}
          />

          {/* 2. Multi-Zone Ecosystem */}
          <MultiRoomManager
            rooms={rooms}
            activeRoomId={activeRoomId}
            onSelectRoom={setActiveRoomId}
            onTurnAllOff={handleTurnAllOff}
            onSyncAllEco={handleSyncAllEco}
          />

          {/* 3. Voice Assistant with Real Web Speech API Microphone */}
          <VoiceCommandSimulator
            activeRoomName={activeRoom.name}
            onVoiceCommand={handleVoiceCommand}
          />

          {/* 4. BLDC Energy Intelligence */}
          <EnergyAnalytics
            watts={activeRoom.energy.watts}
            dailyKWh={activeRoom.energy.dailyKWh}
            totalCost={activeRoom.energy.totalCost}
            co2SavedKg={activeRoom.energy.co2SavedKg}
            speed={activeRoom.fanSpeed}
            power={activeRoom.power}
          />

          {/* 5. Fan Health Diagnostics */}
          <FanHealthMonitor
            health={activeRoom.health}
            onResetFilter={() => {
              setRooms(prev => ({
                ...prev,
                [activeRoomId]: {
                  ...prev[activeRoomId],
                  health: { ...prev[activeRoomId].health, filterCleanliness: 100 }
                }
              }));
              addLog('USER', `Cleaned blades and aerated motor for ${activeRoom.name}. Cleanliness reset to 100%.`);
            }}
          />

          {/* 6. Smart Timer & Automations */}
          <SchedulingTimer
            activeTimerSeconds={activeTimerSeconds}
            onTimerSet={(secs) => {
              setActiveTimerSeconds(secs);
              addLog('USER', `Set sleep auto-off timer for ${Math.round(secs / 60)} minutes.`);
            }}
            onTimerCancel={(expired) => {
              setActiveTimerSeconds(0);
              if (expired) {
                if (activeRoom.power) handlePowerToggle(false);
                addLog('SYSTEM', 'Sleep timer expired. Fan powered down automatically.');
              } else {
                addLog('USER', 'Sleep timer cancelled.');
              }
            }}
          />

          {/* 7. System Audit & Neural Activity Log */}
          <ActivityLog
            logs={logs}
            onClearLogs={() => setLogs([])}
          />
        </div>
      </div>

      {/* Wokwi Hardware Integration Modal */}
      <WokwiMqttModal
        isOpen={isWokwiModalOpen}
        onClose={() => setIsWokwiModalOpen(false)}
        mqttStatus={mqttStatus}
        onSendTestPacket={handleSendTestPacket}
      />
    </div>
  );
}
