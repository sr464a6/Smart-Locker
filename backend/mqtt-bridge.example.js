/**
 * Jembatan MQTT <-> HTTP API untuk hardware ESP32 (v3, 3-PIN: mahasiswa + 2 gojek).
 * Topic:
 *  - loker/{id}/pin_masuk    (ESP32 publish PIN yang diketik)
 *  - loker/{id}/pintu_status (ESP32 publish "TERTUTUP" dari sensor)
 *  - loker/{id}/perintah     (Backend publish "BUKA"/"TOLAK" ke solenoid)
 * Jalankan: npm install mqtt   lalu   node mqtt-bridge.example.js
 */
import mqtt from 'mqtt';

const BROKER_URL = 'mqtt://broker.hivemq.com';
const API_BASE = 'http://localhost:4000/api/lockers';
const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
  console.log('Terhubung ke broker MQTT');
  client.subscribe('loker/+/pin_masuk');
  client.subscribe('loker/+/pintu_status');
});

client.on('message', async (topic, message) => {
  const [, id, jenis] = topic.split('/');
  const payload = message.toString();

  if (jenis === 'pin_masuk') {
    const res = await fetch(`${API_BASE}/${id}/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: payload })
    });
    const data = await res.json();
    client.publish(`loker/${id}/perintah`, data.ok ? 'BUKA' : 'TOLAK');
  }

  if (jenis === 'pintu_status' && payload === 'TERTUTUP') {
    await fetch(`${API_BASE}/${id}/door-closed`, { method: 'POST' });
  }
});
