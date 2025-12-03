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
  if (WiFi.status() == WL_CONNECTED &&
      (lastConfigFetchMs == 0 || now - lastConfigFetchMs >= CONFIG_REFRESH_INTERVAL_MS)) {
    if (fetchDeviceConfig()) {
      lastConfigFetchMs = now;
    }
  }

  if (now - lastSend >= SEND_INTERVAL_MS) {
    lastSend = now;
    postReading();
  }
}

String buildIsoUtcTimestamp() {
  time_t now = time(nullptr);
  struct tm tm_utc;
  gmtime_r(&now, &tm_utc);
  char buf[32];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &tm_utc);
  return String(buf);
}


bool postReading() {
  float grid_kwh   = totalGridKwh;
  float solar_kwh  = totalSolarKwh;
  float voltage_v  = 230.0;
  float current_a  = ACS712_GetIrms_A();
  float power_w    = ACS712_GetPower_W();
  const char* current_source = (CurrentSource) ? "solar" : "grid";   
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