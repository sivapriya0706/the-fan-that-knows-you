import React, { useState } from 'react';
import { X, Copy, Check, Radio, Terminal, Cpu, ExternalLink, Zap } from 'lucide-react';

export default function WokwiMqttModal({
  isOpen,
  onClose,
  mqttStatus = { connected: false, broker: 'broker.hivemq.com', dataSource: 'SIMULATION' },
  onConnectCustomBroker,
  onSendTestPacket
}) {
  const [copied, setCopied] = useState(false);
  const [brokerUrl, setBrokerUrl] = useState('wss://broker.hivemq.com:8884/mqtt');
  const [roomTopic, setRoomTopic] = useState('smartfan/living-room');

  if (!isOpen) return null;

  const wokwiArduinoSketch = `/*
 * THE FAN THAT KNOWS YOU — ESP32 WOKWI FIRMWARE
 * Competition IoT Smart Fan with DHT22, PIR, MQ2, & PWM Output
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHTesp.h>
#include <ArduinoJson.h>

// Pin Configuration
const int DHT_PIN = 15;     // DHT22 Data
const int PIR_PIN = 13;     // PIR Motion Sensor
const int MQ2_PIN = 34;     // MQ2 Analog Gas / Smoke
const int FAN_PWM_PIN = 18; // Motor PWM Output (Fan Speed)
const int BUZZER_PIN = 23;  // Emergency Siren
const int LED_PIN = 2;      // Onboard Status LED

// Networking & MQTT
const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* client_id = "ESP32_SmartFan_Wokwi_Client";

// Topics
const char* sensor_topic = "smartfan/living-room/sensors";
const char* control_topic = "smartfan/living-room/control";

WiFiClient espClient;
PubSubClient client(espClient);
DHTesp dhtSensor;

// Motor speed mapping: level 0 to 5 -> PWM 0 to 255
const int speedPWM[6] = {0, 60, 110, 160, 210, 255};
int currentSpeed = 2;
bool powerState = true;
bool emergencyExhaust = false;

unsigned long lastTelemetryTime = 0;

void callback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<256> doc;
  deserializeJson(doc, payload, length);

  if (doc.containsKey("speed")) {
    currentSpeed = doc["speed"];
  }
  if (doc.containsKey("power")) {
    powerState = doc["power"];
  }
  if (doc.containsKey("exhaust")) {
    emergencyExhaust = doc["exhaust"];
    if (emergencyExhaust) currentSpeed = 5;
  }

  // Update PWM output to fan motor
  int pwmVal = powerState ? speedPWM[currentSpeed] : 0;
  ledcWrite(0, pwmVal);
  Serial.printf("[WOKWI CONTROL] Speed: %d | PWM: %d\\n", currentSpeed, pwmVal);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT broker...");
    if (client.connect(client_id)) {
      Serial.println("CONNECTED!");
      client.subscribe(control_topic);
      digitalWrite(LED_PIN, HIGH);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  pinMode(MQ2_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);

  // Configure PWM for Fan (Channel 0, 5kHz, 8-bit)
  ledcSetup(0, 5000, 8);
  ledcAttachPin(FAN_PWM_PIN, 0);

  dhtSensor.setup(DHT_PIN, DHTesp::DHT22);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi connected.");

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  // Transmit telemetry every 2 seconds
  if (millis() - lastTelemetryTime > 2000) {
    lastTelemetryTime = millis();

    TempAndHumidity data = dhtSensor.getTempAndHumidity();
    int pirState = digitalRead(PIR_PIN);
    int rawMQ2 = analogRead(MQ2_PIN);
    // Convert 12-bit ADC (0-4095) to estimated PPM (0-1000)
    int mq2Ppm = map(rawMQ2, 0, 4095, 30, 800);

    StaticJsonDocument<256> doc;
    doc["temperature"] = serialized(String(data.temperature, 1));
    doc["humidity"] = round(data.humidity);
    doc["pir"] = pirState;
    doc["mq2"] = mq2Ppm;

    char buffer[256];
    serializeJson(doc, buffer);
    client.publish(sensor_topic, buffer);

    Serial.printf("[MQTT TELEMETRY] %s\\n", buffer);

    // Local fail-safe buzzer for smoke
    if (mq2Ppm > 400 || emergencyExhaust) {
      digitalWrite(BUZZER_PIN, HIGH);
    } else {
      digitalWrite(BUZZER_PIN, LOW);
    }
  }
}
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(wokwiArduinoSketch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 11, 23, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '850px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid var(--cyan-neon)',
        boxShadow: 'var(--shadow-neon)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Radio size={22} style={{ color: 'var(--cyan-neon)' }} />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-display)', margin: 0 }}>
                ESP32 Wokwi Hardware Integration & MQTT Bridge
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Connect your real Wokwi ESP32 simulation to this dashboard via standard MQTT pub/sub.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-cyber"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Connection Status Box */}
        <div style={{
          background: 'rgba(5, 11, 23, 0.7)',
          border: '1px solid var(--border-cyan)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>MQTT Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <span className={`badge ${mqttStatus.dataSource === 'WOKWI_LIVE' ? 'badge-green' : (mqttStatus.connected ? 'badge-cyan' : 'badge-amber')}`}>
                {mqttStatus.dataSource === 'WOKWI_LIVE' 
                  ? 'LIVE WOKWI CONNECTED' 
                  : (mqttStatus.connected ? 'BROKER CONNECTED (SIMULATION)' : 'DISCONNECTED (SIMULATION)')}
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Public Broker</div>
            <div style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan-neon)', marginTop: '0.2rem' }}>
              broker.hivemq.com:1883
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Topics</div>
            <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {roomTopic}/sensors
            </div>
          </div>
        </div>

        {/* Action button to test packet */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button
            onClick={onSendTestPacket}
            className="btn-cyber-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
          >
            <Zap size={14} /> Send Test Wokwi MQTT Packet
          </button>

          <a
            href="https://wokwi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cyber"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', textDecoration: 'none' }}
          >
            Open Wokwi Simulator <ExternalLink size={14} />
          </a>
        </div>

        {/* Code Snippet Box */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Terminal size={14} style={{ color: 'var(--cyan-neon)' }} />
              Ready-to-Paste ESP32 Arduino C++ Code (Wokwi)
            </span>

            <button
              onClick={copyToClipboard}
              className="btn-cyber"
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
            >
              {copied ? <Check size={14} style={{ color: 'var(--teal-neon)' }} /> : <Copy size={14} />}
              {copied ? 'Copied to Clipboard!' : 'Copy Code'}
            </button>
          </div>

          <pre style={{
            background: '#040711',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: '10px',
            padding: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: '#E2E8F0',
            overflowX: 'auto',
            maxHeight: '280px',
            lineHeight: '1.4'
          }}>
            {wokwiArduinoSketch}
          </pre>
        </div>

        {/* Pinout Schematic Guide */}
        <div style={{ marginTop: '1.25rem', padding: '0.85rem 1rem', background: 'rgba(5, 11, 23, 0.5)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--teal-neon)', marginBottom: '0.3rem' }}>
            Wokwi diagram.json Pin Mapping Reference:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            <div>• DHT22 Data: <strong>ESP32 GPIO 15</strong></div>
            <div>• PIR Motion: <strong>ESP32 GPIO 13</strong></div>
            <div>• MQ2 Gas Sensor: <strong>ESP32 GPIO 34</strong></div>
            <div>• Fan PWM Output: <strong>ESP32 GPIO 18</strong></div>
            <div>• Buzzer Alarm: <strong>ESP32 GPIO 23</strong></div>
            <div>• Status LED: <strong>ESP32 GPIO 2</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
