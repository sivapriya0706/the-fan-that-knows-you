/**
 * THE FAN THAT KNOWS YOU — IoT Bridge & Simulation Server
 * Supports ESP32 Wokwi MQTT integration, real-time telemetry, and REST endpoints.
 */

import express from 'express';
import cors from 'cors';
import mqtt from 'mqtt';

const app = express();
const PORT = process.env.PORT || 3001;
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com:1883';

app.use(cors());
app.use(express.json());

// Multi-room state store
let rooms = {
  'living-room': {
    id: 'living-room',
    name: 'Living Room',
    fanSpeed: 2,
    mode: 'AUTO', // AUTO, MANUAL, SLEEP, EXHAUST
    power: true,
    direction: 'FORWARD', // FORWARD (downdraft), REVERSE (updraft)
    oscillation: false,
    sensors: {
      temperature: 26.4,
      humidity: 52,
      pir: 1, // 1 = motion/present, 0 = vacant
      mq2: 85, // ppm
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
      mq2: 110,
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

let activeRoomId = 'living-room';
let isLiveMqttConnected = false;
let mqttSource = 'SIMULATION'; // 'WOKWI_LIVE' or 'SIMULATION'
let lastMqttPacketTimestamp = null;
let eventLogs = [
  { id: 1, timestamp: new Date().toLocaleTimeString(), type: 'SYSTEM', message: 'Smart Fan Neural Engine initialized.' },
  { id: 2, timestamp: new Date().toLocaleTimeString(), type: 'AI', message: 'Environmental thermal curve calibrated for Living Room.' }
];

// Speed to watts mapping
const SPEED_WATTS = [0, 14, 26, 42, 60, 78];

// Setup MQTT Client for Wokwi / ESP32 Hardware bridge
let mqttClient = null;
try {
  console.log(`Connecting to MQTT Broker: ${MQTT_BROKER}...`);
  mqttClient = mqtt.connect(MQTT_BROKER, {
    clientId: `smartfan_bridge_${Math.random().toString(16).substring(2, 8)}`,
    connectTimeout: 5000,
    reconnectPeriod: 10000
  });

  mqttClient.on('connect', () => {
    isLiveMqttConnected = true;
    console.log('Connected to MQTT Broker.');
    mqttClient.subscribe('smartfan/+/sensors');
    mqttClient.subscribe('smartfan/+/status');
    mqttClient.subscribe('smartfan/wokwi/ping');
  });

  mqttClient.on('message', (topic, payload) => {
    try {
      const data = JSON.parse(payload.toString());
      lastMqttPacketTimestamp = Date.now();
      mqttSource = 'WOKWI_LIVE';

      // Example topic: smartfan/living-room/sensors
      const parts = topic.split('/');
      const roomKey = parts[1] || 'living-room';

      if (rooms[roomKey] && data) {
        if (data.temperature !== undefined) rooms[roomKey].sensors.temperature = Number(data.temperature);
        if (data.humidity !== undefined) rooms[roomKey].sensors.humidity = Number(data.humidity);
        if (data.pir !== undefined) rooms[roomKey].sensors.pir = Number(data.pir);
        if (data.mq2 !== undefined) rooms[roomKey].sensors.mq2 = Number(data.mq2);
        rooms[roomKey].sensors.lastMotionTimestamp = Date.now();
      }
    } catch (err) {
      console.error('Error parsing MQTT packet:', err.message);
    }
  });

  mqttClient.on('error', (err) => {
    console.warn('MQTT Connection notice:', err.message);
    isLiveMqttConnected = false;
  });

  mqttClient.on('offline', () => {
    isLiveMqttConnected = false;
  });
} catch (e) {
  console.warn('MQTT client init skipped or failed:', e.message);
}

// Background simulation ticker (subtle organic fluctuations if no live Wokwi packets received in 10s)
setInterval(() => {
  const isStale = !lastMqttPacketTimestamp || (Date.now() - lastMqttPacketTimestamp > 10000);
  if (isStale) {
    mqttSource = 'SIMULATION';
  }

  // Update dynamic energy and physics for active room
  Object.keys(rooms).forEach(key => {
    const r = rooms[key];
    if (r.power) {
      r.energy.watts = SPEED_WATTS[r.fanSpeed] || 0;
      r.energy.dailyKWh = +(r.energy.dailyKWh + (r.energy.watts / (3600 * 1000))).toFixed(3);
      r.energy.totalCost = +(r.energy.dailyKWh * 8.5).toFixed(2);
      r.energy.co2SavedKg = +(r.energy.dailyKWh * 0.82).toFixed(2);
      r.health.hoursUsed = +(r.health.hoursUsed + 0.001).toFixed(2);
      // Motor temp correlates with speed
      r.health.motorTemp = +(30 + r.fanSpeed * 2.8 + (Math.random() * 0.4 - 0.2)).toFixed(1);
    } else {
      r.energy.watts = 0;
      r.health.motorTemp = +(Math.max(25, r.health.motorTemp - 0.2)).toFixed(1);
    }

    // Gentle micro-noise for simulated sensors
    if (mqttSource === 'SIMULATION' && r.mode !== 'EXHAUST') {
      r.sensors.temperature = +(r.sensors.temperature + (Math.random() * 0.1 - 0.05)).toFixed(1);
      r.sensors.humidity = +(Math.min(95, Math.max(30, r.sensors.humidity + (Math.random() * 0.2 - 0.1)))).toFixed(0);
      r.sensors.mq2 = +(Math.max(35, Math.min(600, r.sensors.mq2 + (Math.random() * 2 - 1)))).toFixed(0);
    }
  });
}, 2000);

// API Endpoints
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    activeRoomId,
    rooms,
    mqtt: {
      connected: isLiveMqttConnected,
      broker: MQTT_BROKER,
      dataSource: mqttSource,
      lastPacket: lastMqttPacketTimestamp
    },
    eventLogs: eventLogs.slice(-20)
  });
});

app.post('/api/control', (req, res) => {
  const { roomId, speed, mode, power, direction, oscillation } = req.body;
  const targetId = roomId || activeRoomId;
  const room = rooms[targetId];

  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }

  if (speed !== undefined) room.fanSpeed = Math.max(0, Math.min(5, Number(speed)));
  if (mode !== undefined) room.mode = mode;
  if (power !== undefined) room.power = Boolean(power);
  if (direction !== undefined) room.direction = direction;
  if (oscillation !== undefined) room.oscillation = Boolean(oscillation);

  // Publish to MQTT if connected so ESP32 Wokwi receives control updates
  if (mqttClient && isLiveMqttConnected) {
    const payload = JSON.stringify({
      speed: room.fanSpeed,
      power: room.power,
      mode: room.mode,
      direction: room.direction,
      exhaust: room.mode === 'EXHAUST',
      timestamp: Date.now()
    });
    mqttClient.publish(`smartfan/${targetId}/control`, payload);
  }

  eventLogs.push({
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    type: 'USER',
    message: `Updated ${room.name}: Speed ${room.fanSpeed}, Mode ${room.mode}, Power ${room.power ? 'ON' : 'OFF'}`
  });

  res.json({ success: true, room });
});

// Demo scenario endpoint
app.post('/api/scenario', (req, res) => {
  const { scenario, roomId = 'living-room' } = req.body;
  const room = rooms[roomId];
  if (!room) return res.status(404).json({ success: false });

  switch (scenario) {
    case 'hot-room':
      room.sensors.temperature = 34.5;
      room.sensors.humidity = 76;
      room.sensors.pir = 1;
      room.sensors.mq2 = 90;
      room.mode = 'AUTO';
      room.fanSpeed = 5;
      room.power = true;
      eventLogs.push({
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'AI',
        message: 'Thermal overload detected (34.5°C). AI ramped fan to Max Boost (Speed 5).'
      });
      break;

    case 'comfortable-room':
      room.sensors.temperature = 24.2;
      room.sensors.humidity = 48;
      room.sensors.pir = 1;
      room.sensors.mq2 = 65;
      room.mode = 'AUTO';
      room.fanSpeed = 2;
      room.power = true;
      eventLogs.push({
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'AI',
        message: 'Optimal thermal comfort reached (24.2°C). AI cruising at Eco Speed 2.'
      });
      break;

    case 'empty-room':
      room.sensors.temperature = 26.0;
      room.sensors.humidity = 50;
      room.sensors.pir = 0;
      room.sensors.mq2 = 55;
      room.mode = 'AUTO';
      room.fanSpeed = 0;
      room.power = false;
      eventLogs.push({
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'AI',
        message: 'Room unoccupied for 5 mins (PIR 0). Auto-shutdown triggered to conserve power.'
      });
      break;

    case 'sleep-mode':
      room.sensors.temperature = 22.5;
      room.sensors.humidity = 45;
      room.sensors.pir = 1;
      room.sensors.mq2 = 40;
      room.mode = 'SLEEP';
      room.fanSpeed = 1;
      room.power = true;
      eventLogs.push({
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'SYSTEM',
        message: 'Circadian Sleep Curve initiated. Whisper-quiet RPM engaged.'
      });
      break;

    case 'smoke-emergency':
      room.sensors.temperature = 31.0;
      room.sensors.humidity = 60;
      room.sensors.pir = 1;
      room.sensors.mq2 = 680; // High smoke PPM!
      room.mode = 'EXHAUST';
      room.fanSpeed = 5;
      room.power = true;
      eventLogs.push({
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'ALERT',
        message: 'CRITICAL HAZARD: MQ2 Smoke spike (680 PPM)! Emergency high-speed exhaust activated!'
      });
      break;

    default:
      break;
  }

  res.json({ success: true, room, scenario });
});

app.listen(PORT, () => {
  console.log(`Smart Fan Bridge Server listening on http://localhost:${PORT}`);
});
