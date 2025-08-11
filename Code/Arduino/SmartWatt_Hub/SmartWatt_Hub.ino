/*
  SmartWatt Receiver v1.0.0
  Environment:           ESP32 Dev Module
  Author:                
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
    - Real-time current monitoring display
    - Device ID identification
    - Connection status monitoring
*/

#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>

// NRF24L01 pins for ESP32
RF24 NRF(4, 5);  // CE, CSN
byte address[6] = "SWD25";

// Data structure matching SmartWatt Node
struct SmartWatt_Data {
  uint8_t deviceID[6];  // 6 bytes
  float currentConsumption;
};

SmartWatt_Data receivedData;
unsigned long lastDataReceived = 0;
const unsigned long dataTimeout = 5000;  // 5 seconds timeout

void setup() {
  Serial.begin(115200);
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
  Serial.println("Format: [Device ID] | Current: XXX A | Status");
  Serial.println("================================================");
}

void loop() {
  // Check if data is available
  if (NRF.available()) {
    // Read the data
    NRF.read(&receivedData, sizeof(receivedData));
    lastDataReceived = millis();

    // Display device ID
    Serial.print("[");
    for (int i = 0; i < 6; i++) {
      if (receivedData.deviceID[i] != 0) {
        Serial.print((char)receivedData.deviceID[i]);
      }
    }
    Serial.print("] | Current: ");
    
    // Display current consumption (rounded to whole number)
    Serial.print((int)round(receivedData.currentConsumption));
    Serial.print(" A | ");
    
    // Status indicator
    if (receivedData.currentConsumption == 0) {
      Serial.println("Status: No Load");
    } else if (receivedData.currentConsumption < 1) {
      Serial.println("Status: Low Load");
    } else if (receivedData.currentConsumption < 5) {
      Serial.println("Status: Normal Load");
    } else {
      Serial.println("Status: High Load");
    }
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

// Function to display detailed device information (optional)
void displayDeviceInfo() {
  Serial.println("\n=== SmartWatt Device Information ===");
  Serial.print("Device ID: ");
  for (int i = 0; i < 6; i++) {
    if (receivedData.deviceID[i] != 0) {
      Serial.print((char)receivedData.deviceID[i]);
    }
  }
  Serial.println();
  Serial.print("Current Consumption: ");
  Serial.print(receivedData.currentConsumption, 1);
  Serial.println(" A");
  Serial.print("Power Estimate: ");
  Serial.print(receivedData.currentConsumption * 220, 0);  // Assuming 220V
  Serial.println(" W");
  Serial.println("=====================================\n");
}