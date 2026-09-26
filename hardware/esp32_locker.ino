/*
  Firmware ESP32 - Loker Pintar Penitipan Ojek Online (v3, 3-PIN)
  ------------------------------------------------------------
  PIN yang berlaku per siklus peminjaman:
  - pinGojek1  : PIN utama untuk driver drop-off
  - pinGojek2  : PIN cadangan untuk driver (opsional, misal ada barang ketinggalan)
  - pinMahasiswa : PIN yang DIBUAT SENDIRI oleh mahasiswa saat pinjam loker via app,
                   aktif otomatis begitu drop-off pertama terjadi, dipakai untuk ambil barang.

  Komponen: ESP32, Keypad Matrix 4x4, Relay Module -> Solenoid Door Lock 12V,
            Magnetic Door Sensor / Limit Switch di engsel pintu.

  Alur (samakan dengan backend v3 - routes/lockers.js):
  1. Siapa pun (driver/mahasiswa) ketik PIN di keypad, tekan '#' -> publish ke loker/{ID}/pin_masuk
  2. Backend cocokkan ke salah satu dari 3 PIN yang aktif -> balas "BUKA" ke loker/{ID}/perintah
  3. ESP32 aktifkan relay -> solenoid terbuka.
  4. Sensor pintu LOW->HIGH -> publish "TERTUTUP" ke loker/{ID}/pintu_status
     -> backend hanguskan PIN yang barusan dipakai:
        - kalau PIN gojek yang dipakai -> PIN mahasiswa otomatis aktif (kalau belum)
        - kalau PIN mahasiswa yang dipakai -> loker AUTO ngunci & reset total ke KOSONG

  Ganti WIFI_SSID, WIFI_PASS, MQTT_BROKER, dan LOKER_ID sebelum upload.
*/

#include <WiFi.h>
#include <PubSubClient.h>
#include <Keypad.h>

const char* WIFI_SSID   = "NAMA_WIFI_KAMPUS";
const char* WIFI_PASS   = "PASSWORD_WIFI";
const char* MQTT_BROKER = "broker.hivemq.com";
const int   MQTT_PORT   = 1883;
const int   LOKER_ID    = 1; // samakan dengan id di database

const int PIN_RELAY       = 26;
const int PIN_DOOR_SENSOR = 27;

const byte ROWS = 4, COLS = 4;
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};
byte rowPins[ROWS] = {13, 12, 14, 4};
byte colPins[COLS] = {16, 17, 18, 19};
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

WiFiClient espClient;
PubSubClient mqtt(espClient);

String inputPin = "";
bool pintuTerakhirTertutup = true;

String topicPinMasuk()    { return "loker/" + String(LOKER_ID) + "/pin_masuk"; }
String topicPintuStatus() { return "loker/" + String(LOKER_ID) + "/pintu_status"; }
String topicPerintah()    { return "loker/" + String(LOKER_ID) + "/perintah"; }

void bukaSolenoid() {
  digitalWrite(PIN_RELAY, HIGH);
  delay(4000);
  digitalWrite(PIN_RELAY, LOW);
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String pesan;
  for (unsigned int i = 0; i < length; i++) pesan += (char)payload[i];
  if (String(topic) == topicPerintah() && pesan == "BUKA") {
    bukaSolenoid();
  }
}

void hubungkanWifiDanMqtt() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  while (!mqtt.connected()) {
    mqtt.connect(("loker-" + String(LOKER_ID)).c_str());
    delay(500);
  }
  mqtt.subscribe(topicPerintah().c_str());
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_RELAY, OUTPUT);
  pinMode(PIN_DOOR_SENSOR, INPUT_PULLUP);
  digitalWrite(PIN_RELAY, LOW);
  hubungkanWifiDanMqtt();
}

void loop() {
  if (!mqtt.connected()) hubungkanWifiDanMqtt();
  mqtt.loop();

  char key = keypad.getKey();
  if (key) {
    if (key == '#') {
      mqtt.publish(topicPinMasuk().c_str(), inputPin.c_str());
      inputPin = "";
    } else if (key == '*') {
      inputPin = "";
    } else {
      inputPin += key;
    }
  }

  bool pintuTertutupSekarang = (digitalRead(PIN_DOOR_SENSOR) == LOW);
  if (pintuTertutupSekarang && !pintuTerakhirTertutup) {
    mqtt.publish(topicPintuStatus().c_str(), "TERTUTUP");
  }
  pintuTerakhirTertutup = pintuTertutupSekarang;

  delay(50);
}
