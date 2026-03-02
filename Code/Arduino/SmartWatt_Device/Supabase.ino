#include "Variables.h"
#include "Supabase_Functions.h"
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>

bool Supabase_Initialized = false;

void Supabase_Init() {
  if (fetchDeviceConfig()) {
    lastConfigFetchMs = millis();
  } else {
    Serial.println("Warning: could not load device_config; using defaults.");
  }
  Supabase_Initialized = true;
}

void Supabase_Update() {
  if (!Supabase_Initialized) {
    Supabase_Init();
  }

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

  // Periodically refresh device configuration
  if (WiFi.status() == WL_CONNECTED && (lastConfigFetchMs == 0 || now - lastConfigFetchMs >= CONFIG_REFRESH_INTERVAL_MS)) {
    if (fetchDeviceConfig()) {
      lastConfigFetchMs = now;
    }
  }

  if (now - lastSend >= SEND_INTERVAL_MS) {
    lastSend = now;
    postReading();
  }
}

String buildIsoLocalTimestamp() {
  time_t now = time(nullptr);
  struct tm tm_local;
  localtime_r(&now, &tm_local);
  char buf[32];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S+08:00", &tm_local);
  return String(buf);
}

bool postReading() {
  float grid_kwh = totalGridKwh;
  float solar_kwh = totalSolarKwh;
  float voltage_v = 230.0;
  float current_a = ACS712_GetIrms_A();
  float power_w = ACS712_GetPower_W();
  String recorded_at = buildIsoLocalTimestamp();


  //Grid Brownout
  bool CurrentSource_toRecord = false;
  if (getStatus_ReedSwitch_Reserve() && !getStatus_ReedSwitch_Normal() && !CurrentSource) {
    CurrentSource_toRecord = true;
  }
  
  const char* current_source = (CurrentSource_toRecord) ? "solar" : "grid";

  WiFiClientSecure client;
  client.setInsecure();
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
  doc["device_id"] = DEVICE_ID;
  doc["grid_kwh"] = grid_kwh;
  doc["solar_kwh"] = solar_kwh;
  doc["voltage_v"] = voltage_v;
  doc["current_a"] = current_a;
  doc["power_w"] = power_w;
  doc["current_source"] = current_source;
  doc["recorded_at"] = recorded_at;

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

// ----- Device config fetch -----
bool fetchDeviceConfig() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("fetchDeviceConfig: WiFi not connected");
    return false;
  }

  WiFiClientSecure client;
  client.setInsecure();
  client.setHandshakeTimeout(15000);
  client.setTimeout(15000);

  HTTPClient http;
  http.setConnectTimeout(15000);

  String url = String(CONFIG_ENDPOINT_BASE);
  url += "?select=daily_limit_kwh,limit_enabled";
  url += "&device_id=eq.";
  url += DEVICE_ID;
  url += "&order=updated_at.desc&limit=1";

  Serial.printf("GET %s\n", url.c_str());

  if (!http.begin(client, url)) {
    Serial.println("HTTP begin() failed (device_config)");
    printTlsLastError(client);
    return false;
  }

  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);

  int code = http.GET();
  String resp = http.getString();

  Serial.printf("HTTP %d (device_config): %s\n", code, resp.c_str());

  if (code <= 0 || code < 200 || code >= 300) {
    Serial.println("Error fetching device_config");
    http.end();
    client.stop();
    return false;
  }

  StaticJsonDocument<512> doc;
  DeserializationError err = deserializeJson(doc, resp);
  if (err) {
    Serial.print("JSON parse error: ");
    Serial.println(err.c_str());
    http.end();
    client.stop();
    return false;
  }

  if (!doc.is<JsonArray>() || doc.size() == 0) {
    Serial.println("No device_config row found for this device_id.");
    http.end();
    client.stop();
    return false;
  }

  JsonObject cfg = doc[0];

  if (cfg.containsKey("daily_limit_kwh")) g_dailyLimitKwh = cfg["daily_limit_kwh"].as<float>();
  if (cfg.containsKey("limit_enabled")) g_limitEnabled = cfg["limit_enabled"].as<bool>();

  g_hasConfig = true;

  Serial.printf("Config loaded: limit_enabled=%s, daily_limit_kwh=%.2f kWh\n",
                g_limitEnabled ? "true" : "false", g_dailyLimitKwh);

  http.end();
  client.stop();
  return true;
}

// ----- TLS helper -----
void printTlsLastError(WiFiClientSecure& client) {
  char buf[128];
  int err = client.lastError(buf, sizeof(buf));
  if (err) Serial.printf("TLS lastError(%d): %s\n", err, buf);
  else Serial.println("TLS lastError: none reported");
}