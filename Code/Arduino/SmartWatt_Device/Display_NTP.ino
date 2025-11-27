bool Display_NTP_Initialized = false;

// ===== Time / NTP config =====
// Philippines is UTC+8, no DST
static const char* NTP_SERVER          = "pool.ntp.org";
static const long  GMT_OFFSET_SEC      = 8 * 3600;
static const int   DAYLIGHT_OFFSET_SEC = 0;

bool timeSynced         = false;
bool lastWifiConnected  = false;


void Display_NTP_Init() {
  Display_NTP_Initialized = true;
}


void Display_NTP() {
  u8g2.clearBuffer();
  u8g2.setFontPosTop();
  u8g2.setFont(u8g2_font_profont12_mr);
  u8g2.drawStr(0, 0, "SMARTWATT DEVICE");

  u8g2.drawStr(0, 16, "NTP Time Sync");

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("syncTime(): WiFi not connected, skipping");
  }

  time_t now = time(nullptr);
  int tries = 0;

  // if time < ~1970-01-02, clock is not set yet
  while (now < 8 * 3600 * 2 && tries < 30) {
    delay(500);
    now = time(nullptr);
    tries++;
    char buffer[32];
    sprintf(buffer, "Syncing...%d", tries);
    u8g2.drawStr(0, 32, buffer);
    u8g2.sendBuffer();
  }


  Serial.println("Syncing time...");
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);

  struct tm timeinfo;
  // wait up to 10 seconds for NTP
  if (!getLocalTime(&timeinfo, 10000)) {
    Serial.println("Failed to obtain time from NTP");
    timeSynced = false;
  }

  Serial.print("Time synced: ");
  Serial.println(&timeinfo, "%Y-%m-%d %H:%M:%S");
  timeSynced = true;

  printCurrentTimeOnce();
}

void printCurrentTimeOnce() {
  if (!timeSynced) return;

  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("getLocalTime() failed after sync");
    return;
  }

  Serial.print("Current local time: ");
  Serial.println(&timeinfo, "%Y-%m-%d %H:%M:%S");
  CurrentScreen = Home_Screen;
}