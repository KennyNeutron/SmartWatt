/*
  ACS712 Current Sensor Test
  Board: Arduino Nano
  Sensor: ACS712 (A0)
  Author: 
*/

const int sensorPin = A0;

// Change this based on your ACS712 model
// Options: 5.0 for ACS712-5A, 13.3 for ACS712-20A, 26.4 for ACS712-30A
const float sensitivity = 0.100; // V/A (0.100 for 20A module, 0.066 for 30A, 0.185 for 5A)

// For Arduino Nano (10-bit ADC) and 5V reference
const float Vref = 5.0;

float offsetVoltage = 2.5; // Typical midpoint (sensor output with no current)

void setup() {
  Serial.begin(9600);
  Serial.println(F("ACS712 Current Sensor Test"));

  // Take an initial reading to determine offset voltage (zero current)
  long sum = 0;
  for (int i = 0; i < 100; i++) {
    sum += analogRead(sensorPin);
    delay(5);
  }
  offsetVoltage = (sum / 100.0) * (Vref / 1023.0);

  Serial.print(F("Calibrated Offset Voltage: "));
  Serial.println(offsetVoltage, 3);
}

void loop() {
  int rawValue = analogRead(sensorPin);
  float voltage = (rawValue * Vref) / 1023.0;
  float current = (voltage - offsetVoltage) / sensitivity;

  Serial.print(F("Raw ADC: "));
  Serial.print(rawValue);
  Serial.print(F(" | Voltage: "));
  Serial.print(voltage, 3);
  Serial.print(F(" V | Current: "));
  Serial.print(current, 3);
  Serial.println(F(" A"));

  delay(500);
}
