/*
  SmartWatt Device v1.0.0
  Environment:           ESP32 Dev Module
  Author:                
  Date Started:          2025-11-27
  Pin Usage:
    NRF24L01:
      CE    - GPIO4
      CSN   - GPIO5
      SCK   - GPIO18
      MOSI  - GPIO23
      MISO  - GPIO19
      VCC   - 3.3V
      GND   - GND
  Board Settings:
    Board:                     ESP32 Dev Module
    Port:                      COM3
    CPU Frequency:             240 MHz (WiFi/BT)
    Core Debug Level:          None
    Erase Flash Before Upload: Disabled
    Events Run On:             Core 1
    Flash Frequency:           80 MHz
    Flash Mode:                QIO
    Flash Size:                4 MB (32 Mb)
    JTAG Adapter:              Disabled
    Arduino Runs On:           Core 1
    Partition Scheme:          Default 4 MB w/ SPIFFS (1.2 MB APP / 1.5 MB SPIFFS)
    PSRAM:                     Disabled
    Upload Speed:              921600
    Zigbee Mode:               Disabled
  Features:
    - Wireless data reception via NRF24L01
    - SmartWatt Node data parsing
    - Real-time current monitoring display (2 decimal places)
    - Device ID identification
    - Connection status monitoring
*/
#include "Variables.h"
#include <SPI.h>
#include <U8g2lib.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>

U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/U8X8_PIN_NONE);

uint32_t CurrentScreen = 0x0000;

void setup() {
  Serial.begin(115200);
  Serial.println("SmartWatt Device Starting...");

  u8g2.begin();
  CurrentScreen = WiFi_Screen;
}

void loop() {
  Display_Main();
  u8g2.sendBuffer();
}