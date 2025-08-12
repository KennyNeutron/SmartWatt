/*
  SmartWatt Receiver v1.0.0
  Environment:           ESP32 Dev Module
  Author:                Kenny Neutron
  Date Started:          2025-08-11
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

#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>
#include <U8g2lib.h>

// NRF24L01 pins for ESP32
RF24 NRF(4, 5);  // CE, CSN
byte address[6] = "SWD25";

U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/U8X8_PIN_NONE);

// Data structure matching SmartWatt Node
struct __attribute__((packed)) SmartWatt_Data {
  uint8_t deviceID;
  uint16_t currentConsumption; // Use unsigned for mA
};


SmartWatt_Data smartwattData;

unsigned long lastDataReceived = 0;
const unsigned long dataTimeout = 5000;  // 5 seconds timeout

void setup() {
  Serial.begin(115200);
  u8g2.begin();
  Serial.println("SmartWatt Receiver Starting...");
  Serial.println("===============================");

  // Initialize NRF24L01
  if (!NRF.begin()) {
    Serial.println("ERROR: NRF24L01 Module not responding!");
    while (1) {
      delay(1000);
      Serial.println("Retrying NRF24L01 initialization...");
      if (NRF.begin()) {
        break;
      }
    }
  }
  Serial.println("NRF24L01 Module initialized successfully.");

  // Configure NRF24L01
  NRF.setPALevel(RF24_PA_MAX);
  NRF.setDataRate(RF24_250KBPS);
  NRF.openReadingPipe(0, address);
  NRF.startListening();

  Serial.println("Receiver ready. Waiting for SmartWatt Node data...");
  Serial.println("Format: [Device ID] | Current: XX.XX A | (Raw mA: XXX) | Status");
  Serial.println("=============================================================");
}

void loop() {


  display_Main();

  // Check if data is available
  if (NRF.available()) {
    // Read the data
    NRF.read(&smartwattData, sizeof(smartwattData));
    lastDataReceived = millis();

    // Display device ID
    Serial.print("[0x0");
    Serial.print(smartwattData.deviceID, HEX);

    // Debug: Show raw milliamp value
    Serial.print("] Raw mA: ");
    Serial.println(smartwattData.currentConsumption);
  }

  // Check for communication timeout
  if (millis() - lastDataReceived > dataTimeout && lastDataReceived > 0) {
    Serial.println("WARNING: No data received for 5 seconds!");
    Serial.println("Check SmartWatt Node connection and power.");
    Serial.println("Waiting for data...");
    lastDataReceived = 0;  // Reset to avoid repeated warnings
  }

  delay(100);  // Small delay to prevent overwhelming serial output
}
