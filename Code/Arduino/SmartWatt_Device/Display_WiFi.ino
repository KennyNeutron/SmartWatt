
bool Display_WiFi_Initialized = false;
bool Reconnecting_WiFi = false;
bool WiFi_Connected_FirstTime = false;

uint32_t LastWifi_CheckMS = 0;
uint16_t WiFi_Check_IntervalMS = 9000;
uint16_t WiFi_Connected_CountDown = 10000;



void Display_WiFi_Init() {
  Display_WiFi_Initialized = true;
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  LastWifi_CheckMS = millis();
}

void Display_WiFi() {
  if (!Display_WiFi_Initialized) {
    Display_WiFi_Init();
  }
  u8g2.clearBuffer();
  u8g2.setFontPosTop();
  u8g2.setFont(u8g2_font_profont12_mr);

  u8g2.drawStr(0, 0, "SMARTWATT DEVICE");
  if (WiFi.status() != WL_CONNECTED) {
    u8g2.drawStr(0, 16, "WiFi: Disconnected");
    u8g2.drawStr(0, 32, "Connecting...");
    char buffer[9];
    sprintf(buffer, "%lums", (millis() - LastWifi_CheckMS));
    u8g2.drawStr(0, 48, buffer);

    if (millis() - LastWifi_CheckMS > WiFi_Check_IntervalMS) {
      LastWifi_CheckMS = millis();
      WiFi.reconnect();
    }

  } else {
    u8g2.drawStr(0, 16, "WiFi: Connected");
    if (!WiFi_Connected_FirstTime) {
      LastWifi_CheckMS = millis();
      WiFi_Connected_FirstTime = true;
    }
    char buffer[32];
    sprintf(buffer, "IP: %s", WiFi.localIP().toString().c_str());
    u8g2.drawStr(0, 32, buffer);

    sprintf(buffer, "Exiting in"
                    " %lums",
            WiFi_Connected_CountDown - (millis() - LastWifi_CheckMS));
    u8g2.drawStr(0, 48, buffer);

    if(WiFi_Connected_CountDown - (millis() - LastWifi_CheckMS)==0 || (millis() - LastWifi_CheckMS) > WiFi_Connected_CountDown) {
      Display_WiFi_Exit();
      CurrentScreen = NTP_Screen;
    }
  }
}

void Display_WiFi_Exit() {
  Display_WiFi_Initialized = false;
  Reconnecting_WiFi = false;
  WiFi_Connected_FirstTime = false;

  LastWifi_CheckMS = 0;
  WiFi_Connected_CountDown = 10000;
}