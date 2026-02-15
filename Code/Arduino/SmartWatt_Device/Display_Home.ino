bool Display_Home_Initialized = false;

void Display_Home_Init() {
  Display_Home_Initialized = true;
}



void Display_Home() {
  if (!Display_Home_Initialized) {
    Display_Home_Init();
  }

  // Read Sensor
  CurrentUsageW = ACS712_GetTotalEnergy_kWh();
  CurrentUsageA = ACS712_GetIrms_A(); 

  u8g2.clearBuffer();
  u8g2.setFontPosTop();
  u8g2.setFont(u8g2_font_profont12_mr);

  char buffer[32];

  sprintf(buffer, "Daily Limit: %.2f kWh", g_dailyLimitKwh);
  u8g2.drawStr(0, 0, buffer);

  sprintf(buffer, "Source: %s", CurrentSource ? "Solar" : "Grid");
  u8g2.drawStr(0, 16, buffer);

  sprintf(buffer, "Usage: %.2f kWh", CurrentUsageW);
  u8g2.drawStr(0, 32, buffer);

  sprintf(buffer, "Power: %.2f W", CurrentUsageA *230);
  u8g2.drawStr(0, 48, buffer);

  sprintf(buffer, "WiFi: %s", (WiFi.status() == WL_CONNECTED) ? "Connected" : "Disconnected");
  u8g2.drawStr(0, 64, buffer);

  // Periodically refresh device configuration
  if (!g_hasConfig || millis() - lastConfigFetchMs > CONFIG_REFRESH_INTERVAL_MS) {
    if (fetchDeviceConfig()) {
      lastConfigFetchMs = millis();
    } else {
      Serial.println("Warning: could not refresh device_config; keeping old values.");
    }
  }

  if(totalGridKwh > g_dailyLimitKwh){
CurrentSource = 1; //Switch to Solar
  }else{
CurrentSource = 0; //Switch to Grid
  }

  if(!CurrentSource){
    totalGridKwh = CurrentUsageW;
    digitalWrite( SSR_Pin, HIGH);
  }else{
    totalSolarKwh = CurrentUsageW;
    digitalWrite(SSR_Pin, LOW);
  }

  Supabase_Update();
}


/* ====== DEVICE CONFIG FETCH ====== */

bool fetchDeviceConfig() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("fetchDeviceConfig: WiFi not connected");
    return false;
  }

  WiFiClientSecure client;
  client.setInsecure();  // development only; use CA in production
  client.setHandshakeTimeout(15000);
  client.setTimeout(15000);

  HTTPClient http;
  http.setConnectTimeout(15000);

  // Build URL:
  // /rest/v1/device_config
  //   ?select=daily_limit_kwh,limit_enabled
  //   &device_id=eq.<DEVICE_ID>
  //   &order=updated_at.desc
  //   &limit=1
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

  if (code <= 0) {
    Serial.printf("HTTP error (device_config): %s\n",
                  http.errorToString(code).c_str());
    printTlsLastError(client);
    http.end();
    client.stop();
    return false;
  }

  if (code < 200 || code >= 300) {
    Serial.println("Non-2xx response when fetching device_config");
    http.end();
    client.stop();
    return false;
  }

  // Supabase returns an array: [ { ... } ]
  StaticJsonDocument<512> doc;
  DeserializationError err = deserializeJson(doc, resp);
  if (err) {
    Serial.print("JSON parse error (device_config): ");
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

  if (cfg.containsKey("daily_limit_kwh")) {
    g_dailyLimitKwh = cfg["daily_limit_kwh"].as<float>();
  }
  if (cfg.containsKey("limit_enabled")) {
    g_limitEnabled = cfg["limit_enabled"].as<bool>();
  }

  g_hasConfig = true;

  Serial.printf(
    "Config loaded: limit_enabled=%s, daily_limit_kwh=%.2f kWh\n",
    g_limitEnabled ? "true" : "false",
    g_dailyLimitKwh);

  http.end();
  client.stop();
  return true;
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
