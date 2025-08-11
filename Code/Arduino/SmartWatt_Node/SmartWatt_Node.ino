/*
  SmartWatt Node v1.0.0
  Environment:           Arduino Nano/Uno
  Author:               
  Date Started:          2025-08-11
  Pin Usage:
    Current Sensor (ACS712):
      OUT   - A0 (Analog Pin 0)
      VCC   - 5V
      GND   - GND
    NRF24L01:
      CE    - GPIO9
      CSN   - GPIO10
      SCK   - GPIO13
      MOSI  - GPIO11
      MISO  - GPIO12
      VCC   - 3.3V
      GND   - GND
  Board Settings:
    Board:                     Arduino Nano
    Port:                      COM3
    Processor:                 ATmega328P (Old Bootloader)
    Programmer:                AVRISP mkII
  Features:
    - Current measurement with ACS712 sensor
    - Automatic offset calibration
    - Threshold filtering (ignores values < 0.1A)
    - Whole number current display (0 decimal places)
    - Wireless data transmission via NRF24L01
    - Real-time serial monitoring
*/

#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>

// CE and CSN pins
RF24 NRF(9, 10);  // CE, CSN
byte address[6] = "SWD25";

struct SmartWatt_Data {
  uint8_t deviceID[6];  // 6 bytes
  float currentConsumption;
};

SmartWatt_Data smartwattData;

const int sensorPin = A0;
const float sensitivity = 0.066;  // V/A (0.100 for 20A module, 0.066 for 30A, 0.185 for 5A)
const float Vref = 5.0;
const float minCurrentThreshold = 0.1;  // Minimum current threshold to consider valid

float offsetVoltage = 2.5;  // Typical midpoint (sensor output with no current)

void setup() {
  Serial.begin(9600);

  // Initialize device ID
  const uint8_t tempID[6] = { 'S', 'W', 'D', '0', '1', 0 };
  memcpy(smartwattData.deviceID, tempID, 6);

  smartwattData.currentConsumption = 0.0;

  // Debug print
  Serial.print("Device ID: ");
  for (int i = 0; i < 6; i++) {
    Serial.print((char)smartwattData.deviceID[i]);
  }
  Serial.println();

  Serial.print("Current Consumption: ");
  Serial.println(smartwattData.currentConsumption, 0);  // Changed to 0 decimal places

  // Take an initial reading to determine offset voltage (zero current)
  long sum = 0;
  for (int i = 0; i < 100; i++) {
    sum += analogRead(sensorPin);
    delay(5);
  }
  offsetVoltage = (sum / 100.0) * (Vref / 1023.0);

  Serial.print(F("Calibrated Offset Voltage: "));
  Serial.println(offsetVoltage, 3);

  //Try to initialize NRF module for 5 seconds
  while (!NRF.begin()) {
    Serial.println(F("NRF24L01 Module not responding! Retrying..."));
    delay(1000);
  }
  Serial.println(F("NRF24L01 Module initialized successfully."));

  NRF.setPALevel(RF24_PA_MAX);
  NRF.setDataRate(RF24_250KBPS);
  NRF.openWritingPipe(address);
}

void loop() {
  int rawValue = analogRead(sensorPin);
  float voltage = (rawValue * Vref) / 1023.0;
  float current = (voltage - offsetVoltage) / sensitivity;
  
  // Apply threshold filter and round to nearest integer
  float processedCurrent = 0.0;
  if (abs(current) >= minCurrentThreshold) {
    processedCurrent = round(current);  // Round to nearest whole number
  }

  Serial.print(F("Raw ADC: "));
  Serial.print(rawValue);
  Serial.print(F(" | Voltage: "));
  Serial.print(voltage, 3);
  Serial.print(F(" V | Current: "));
  Serial.print(processedCurrent, 0);  // Display with 0 decimal places
  Serial.println(F(" A"));

  // Send processed data via NRF
  smartwattData.currentConsumption = processedCurrent;
  NRF.write(&smartwattData, sizeof(smartwattData));
  Serial.println("Data sent successfully.");
  delay(1000);
}