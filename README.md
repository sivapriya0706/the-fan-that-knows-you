# THE FAN THAT KNOWS YOU — AI-Powered Personalized Smart Fan System 🌀⚡

> **Competition-Ready IoT Smart Fan with ESP32 Wokwi Integration, Real-Time Sensor Telemetry, Autonomous Thermal Comfort, and Emergency Reverse Hazard Protection.**

---

## 🌟 Key Innovations & Competition Highlights

1. **Smoke Emergency Reverse Rotation (Simulation Demo)**:
   - When MQ2 smoke exceeds 400 PPM or the **Smoke Hazard** preset is selected, the fan immediately transitions to **EMERGENCY REVERSE MODE**.
   - Visibly reverses the 3-blade animation into counter-clockwise rotation (`spinReverse`) at Speed Level 5 (375 RPM) with dedicated neon red strobe HUD indicator.
   - Restoring baseline or clicking **"Restore Normal Mode & Rotation"** cleanly reverts the fan to forward clockwise rotation and normal operating mode.
   - *Note: Clearly labeled as a competition simulation behavior.*

2. **Real Voice Input with Web Speech API**:
   - Integrated real microphone input using the browser's `SpeechRecognition` / `webkitSpeechRecognition` API.
   - Requests microphone permission, displays real-time **Listening status** with animated acoustic waves, captures spoken English commands, and executes them instantly.
   - Provides natural spoken audio feedback via `window.speechSynthesis`.
   - Supports natural voice commands:
     - **Power**: *"Turn fan on"*, *"Turn fan off"*, *"Power off"*, *"Stop fan"*
     - **Speeds (0–5)**: *"Speed 1"*, *"Speed 2"*, *"Speed 3"*, *"Speed 4"*, *"Speed 5"*, *"Maximum speed"*, *"Cool me down"*
     - **Modes**: *"Engage AI auto mode"*, *"Manual mode"*, *"Activate sleep mode"*, *"Emergency smoke reverse mode"*
   - Typed commands and quick simulation chips remain available as fallbacks.
   - Graceful fallback with user guidance if microphone permissions are denied or unsupported.

3. **100% Consistent Speed & RPM Telemetry**:
   - Unified telemetry constants across all visualizer badges, velocity buttons, and sensors:
     - Level 0: `0 RPM` · `0 W`
     - Level 1: `115 RPM` · `14 W`
     - Level 2: `175 RPM` · `26 W`
     - Level 3: `235 RPM` · `42 W`
     - Level 4: `295 RPM` · `60 W`
     - Level 5: `375 RPM` · `78 W`

4. **Strict MQTT Data Authenticity**:
   - Only displays `[LIVE ESP32 WOKWI]` when genuine MQTT packets are received.
   - Transparently designates standalone simulation as `[SIMULATION (DEMO)]` with zero fabricated hardware claims.

---

## 🚀 Quick Start & Run Commands

### 1. Start the React + Vite Frontend
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 2. (Optional) Start the Node.js Express & MQTT Bridge Server
```bash
npm run server
```
Server runs on **[http://localhost:3001](http://localhost:3001)** with live MQTT bridge.

---

## 🧪 How to Test the Two New Features

### Feature 1: Testing Smoke Emergency Reverse Rotation
1. Look at the 3-blade ceiling fan visualizer spinning clockwise (forward).
2. Click the **"Smoke Hazard"** button in the **Competition Demo & Testing Scenarios** dock (or drag the **MQ2 Gas/Smoke slider** above 400 PPM).
3. Observe:
   - The fan blades **visibly reverse direction** to counter-clockwise rotation (`spinReverse`).
   - The red alert banner displays: **"EMERGENCY REVERSE MODE ACTIVE [Simulation Demo Mode]"**.
   - The rotational speed updates to **Level 5 · 375 RPM** everywhere (visualizer, badge, and telemetry).
4. Click **"Restore Normal Mode & Rotation"** (or click the **"Comfortable"** scenario).
5. Observe:
   - The fan smoothly transitions back to normal clockwise rotation.
   - Normal AI Auto mode and sensor baseline are restored.

### Feature 2: Testing Real Voice Input
1. Scroll to the **Voice Assistant & Speech Recognition Interface** section.
2. Click the large purple/cyan button: **"Start Voice Input (Click & Speak)"**.
3. Allow microphone permission in your browser if prompted.
4. The button will pulse red with **"Listening... speak command now"**.
5. Speak any of the following commands clearly in English:
   - *"Set speed 4"* ➔ Fan ramps to Speed 4 (295 RPM) with spoken confirmation.
   - *"Turn fan off"* ➔ Fan powers down to 0 RPM with spoken confirmation.
   - *"Turn fan on"* ➔ Fan turns on with spoken confirmation.
   - *"Activate sleep mode"* ➔ Fan engages Sleep Mode at Level 1 (115 RPM).
   - *"Emergency smoke reverse mode"* ➔ Fan immediately triggers reverse rotation at Level 5 (375 RPM).
6. Verify that typed text input and preset prompt chips still work as a fallback.
