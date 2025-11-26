#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>

/* ====== WIFI CONFIG ====== */
const char* WIFI_SSID     = "Innocore2.4G";
const char* WIFI_PASSWORD = "one2nine";

/* ====== SUPABASE CONFIG (SMARTWATT) ====== */
// REST endpoint for device_readings
const char* ENDPOINT =
  "https://aeayentwrnmatnsdpoas.supabase.co/rest/v1/device_readings";
const char* ENDPOINT_HOST = "aeayentwrnmatnsdpoas.supabase.co"; // for DNS test

// anon key (same as NEXT_PUBLIC_SUPABASE_ANON_KEY)
const char* SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlYXllbnR3cm5tYXRuc2Rwb2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMDI4MjAsImV4cCI6MjA3NjY3ODgyMH0.0kIWd35tsnBtt1XYr_3jIGnRE0PmY8k77hu8r09hxMk";

// SmartWatt device_id (from public.devices)
const char* DEVICE_ID = "8f05d9af-71ad-4b4b-a927-9fd9bc6fd337";

/* ====== TIMING ====== */
const unsigned long SEND_INTERVAL_MS = 10UL * 1000UL; // 10 seconds
unsigned long lastSend = 0;

/* ====== RANDOM HELPERS FOR DUMMY DATA ====== */
float randFloat(float minVal, float maxVal) {
  return minVal + (float)random(0, 10001) / 10000.0f * (maxVal - minVal);
}

/* ====== TIME / NTP ====== */
void syncTime() {
  // Use multiple NTP servers, UTC
  configTime(0, 0, "pool.ntp.org", "time.nist.gov", "time.google.com");
  Serial.print("Syncing time");
  time_t now = time(nullptr);
  int tries = 0;

  // if time < ~1970-01-02, clock is not set yet
  while (now < 8 * 3600 * 2 && tries < 30) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
    tries++;
  }

  if (now >= 8 * 3600 * 2) {
    Serial.println(" done!");
    struct tm timeinfo;
    gmtime_r(&now, &timeinfo);
    Serial.printf("UTC time: %s", asctime(&timeinfo));
  } else {
    Serial.println(" failed (will still try HTTPS)");
  }
}

// Build ISO8601 UTC timestamp, e.g. "2025-11-26T12:34:56Z"
String buildIsoUtcTimestamp() {
  time_t now = time(nullptr);
  struct tm tm_utc;
  gmtime_r(&now, &tm_utc);
  char buf[32];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &tm_utc);
  return String(buf);
}

/* ====== TLS DEBUG (optional) ====== */
void printTlsLastError(WiFiClientSecure& client) {
  char buf[128];
  int err = client.lastError(buf, sizeof(buf));
  if (err) {
    Serial.printf("TLS lastError(%d): %s\n", err, buf);
  } else {
    Serial.println("TLS lastError: (none reported)");
  }
}

/* ====== POST TO SUPABASE device_readings ====== */
bool postReading() {
  // Generate dummy SmartWatt data
  float grid_kwh   = randFloat(1.0, 6.0);
  float solar_kwh  = randFloat(0.0, 3.0);
  float voltage_v  = randFloat(220.0, 240.0);
  float current_a  = randFloat(0.0, 12.0);
  float power_w    = voltage_v * current_a;      // simplistic
  const char* current_source = (solar_kwh > grid_kwh) ? "solar" : "grid";
  String recorded_at = buildIsoUtcTimestamp();

  WiFiClientSecure client;
  client.setInsecure();              // dev only – replace with proper CA in production
  client.setHandshakeTimeout(15000);
  client.setTimeout(15000);

  HTTPClient http;
  http.setConnectTimeout(15000);

  if (!http.begin(client, ENDPOINT)) {
    Serial.println("HTTP begin() failed");
    printTlsLastError(client);
    return false;
  }

  // Supabase headers for REST
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);
  http.addHeader("Prefer", "return=representation");

  StaticJsonDocument<256> doc;
  doc["device_id"]       = DEVICE_ID;
  doc["grid_kwh"]        = grid_kwh;
  doc["solar_kwh"]       = solar_kwh;
  doc["voltage_v"]       = voltage_v;
  doc["current_a"]       = current_a;
  doc["power_w"]         = power_w;
  doc["current_source"]  = current_source;
  doc["recorded_at"]     = recorded_at;  // timestamptz column in Supabase

  String payload;
  serializeJson(doc, payload);

  Serial.printf("POST %s\nPayload: %s\n", ENDPOINT, payload.c_str());

  int code = http.POST(payload);
  String resp = http.getString();

  Serial.printf("HTTP %d: %s\n", code, resp.c_str());
  if (code <= 0) {
    Serial.printf("HTTP error: %s\n", http.errorToString(code).c_str());
    printTlsLastError(client);
  }

  http.end();
  client.stop();
  return (code >= 200 && code < 300);
}

/* ====== SETUP ====== */
void setup() {
  Serial.begin(115200);
  delay(200);

  randomSeed(esp_random());

  Serial.printf("Connecting to WiFi \"%s\"", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println(" connected!");
  Serial.print("IP: "); Serial.println(WiFi.localIP());

  // Quick DNS resolution check
  IPAddress ip;
  if (WiFi.hostByName(ENDPOINT_HOST, ip)) {
    Serial.print("Resolved host to: "); Serial.println(ip);
  } else {
    Serial.println("DNS resolution FAILED");
  }

  // Get time for TLS and for recorded_at
  syncTime();
}

/* ====== LOOP ====== */
void loop() {
  // Basic WiFi auto-reconnect
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi dropped, reconnecting...");
    WiFi.reconnect();
    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
      delay(300);
      Serial.print(".");
    }
    Serial.println(WiFi.status() == WL_CONNECTED ? "reconnected!" : "reconnect failed.");
  }

  unsigned long now = millis();
  if (now - lastSend >= SEND_INTERVAL_MS) {
    lastSend = now;
    postReading();
  }

  delay(50);
}
