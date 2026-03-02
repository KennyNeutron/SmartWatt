#include "Variables.h"
#include <WiFi.h>
#include <U8g2lib.h>
#include <time.h>
#include "ACS712.h"
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// ---------- OLED setup ----------
extern U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2;

// ---------- Test Reset Configuration ----------
const int RESET_HOUR = 0;  // Normal midnight reset
const int RESET_MINUTE = 0;

const int TEST_RESET_HOUR = 11;   // Test hour (9 PM)
const int TEST_RESET_MINUTE = 0;  // Test minute (9:20 PM)
bool useTestReset = false;        // now uses normal midnight reset

// ---------- Initialization ----------
bool Display_Home_Initialized = false;
int g_lastResetDay = -1;
static float lastTotalEnergy_kWh = 0.0;  // track delta energy

unsigned long lastSerialMs = 0;  // for 1-second interval

// ---------- Display Init ----------
void Display_Home_Init() {
  Display_Home_Initialized = true;
}

void Display_Home() {
  if (!Display_Home_Initialized) Display_Home_Init();

  // ----------- Read ACS712 sensor -----------
  float energyNow_kWh = ACS712_GetTotalEnergy_kWh();
  float currentA = ACS712_GetIrms_A();
  CurrentUsageW = energyNow_kWh;
  CurrentUsageA = currentA;

  // ----------- Delta-based per-source accumulation -----------
  float deltaEnergy = energyNow_kWh - lastTotalEnergy_kWh;

  // Prevent negative delta (caused by resets or sensor calibration)
  if (deltaEnergy < 0) deltaEnergy = 0;

  if (!CurrentSource) {
    totalGridKwh += deltaEnergy;
  } else {
    totalSolarKwh += deltaEnergy;
  }
  lastTotalEnergy_kWh = energyNow_kWh;

  // ----------- Get current time -----------
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) return;  // skip if time not ready

  int targetHour = useTestReset ? TEST_RESET_HOUR : RESET_HOUR;
  int targetMinute = useTestReset ? TEST_RESET_MINUTE : RESET_MINUTE;

  // ----------- 1-second Serial Monitor update -----------
  if (millis() - lastSerialMs >= 1000) {  // every 1 second
    lastSerialMs = millis();
    Serial.printf("Current Time: %02d:%02d:%02d | Total Grid: %.3f kWh | Total Solar: %.3f kWh\n",
                  timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec,
                  totalGridKwh, totalSolarKwh, deltaEnergy);
  }

  // ----------- Midnight/Test reset -----------
  if (g_lastResetDay != timeinfo.tm_mday && timeinfo.tm_hour == targetHour && timeinfo.tm_min >= targetMinute) {

    Serial.println("Midnight/Test Reset Triggered!");

    totalEnergy_kWh = 0.0;
    totalGridKwh = 0.0;
    totalSolarKwh = 0.0;

    g_lastResetDay = timeinfo.tm_mday;

    // Optional: recalibrate ACS712 zero offset
    ACS712_Setup();

    // Fix delta tracking after reset
    lastTotalEnergy_kWh = ACS712_GetTotalEnergy_kWh();
  }

  // ----------- Daily limit enforcement -----------
  if (g_limitEnabled && totalGridKwh >= g_dailyLimitKwh) {
    CurrentSource = 1;  // Switch to Solar
  } else {
    CurrentSource = 0;  // Use Grid
  }



  // ----------- SSR control -----------
  digitalWrite(SSR_Pin, CurrentSource ? LOW : HIGH);

  //Grid Brownout
  bool CurrentSource_toShow = false;
  if (getStatus_ReedSwitch_Reserve() && !getStatus_ReedSwitch_Normal() && !CurrentSource) {
    CurrentSource_toShow = true;
  }

  // ----------- Update OLED display -----------
  u8g2.clearBuffer();
  u8g2.setFontPosTop();
  u8g2.setFont(u8g2_font_profont12_mr);
  char buffer[32];

  sprintf(buffer, "Daily Limit: %.2f kWh", g_dailyLimitKwh);
  u8g2.drawStr(0, 0, buffer);

  sprintf(buffer, "Source: %s", CurrentSource_toShow ? "Solar" : "Grid");
  u8g2.drawStr(0, 16, buffer);

  sprintf(buffer, "Consumption: %.3f kWh", CurrentUsageW);
  u8g2.drawStr(0, 32, buffer);

  sprintf(buffer, "Usage: %.2f W", CurrentUsageA * 230);
  u8g2.drawStr(0, 48, buffer);

  sprintf(buffer, "WiFi: %s", (WiFi.status() == WL_CONNECTED) ? "Connected" : "Disconnected");
  u8g2.drawStr(0, 64, buffer);

  u8g2.sendBuffer();
}