// ESP32 + ACS712 AC current, power (W), and energy (kWh) test
// Sensor on GPIO34, assumes ACS712 is powered from 5V and measuring AC current.
//
// - Computes Irms from samples (AC).
// - Computes instantaneous real power: P = Irms * V * PF
// - Integrates P over time to get energy in kWh since boot.
//
// NOTE: This is an approximation: assumes constant mains voltage and fixed power factor.

#include <math.h>

const int ACS_PIN = 34;              // ADC1 channel, input only

// Number of samples for RMS calculation (higher = slower but smoother)
const int NUM_SAMPLES_RMS = 1000;

// ==== CONFIGURE THIS FOR YOUR SENSOR VERSION ====
// 5A  module: 185.0
// 20A module: 100.0
// 30A module: 66.0
const float SENSITIVITY_mV_PER_A = 100.0;  // mV per Amp (20A version by default)

// ==== ADC CONFIG ====
// ESP32: 12-bit ADC (0–4095)
const float ADC_MAX = 4095.0;
const float VREF = 3.3;              // Adjust if you know your board's actual reference

// ==== MAINS & POWER FACTOR ====
// Adjust these for your location and load.
const float MAINS_VOLTAGE = 230.0;   // e.g. 220–230 V AC
const float POWER_FACTOR  = 1.0;     // 1.0 for purely resistive, <1.0 for inductive loads

// ==== STATE ====
float zeroOffsetVoltage = 0.0;       // V at 0A (measured at startup)
float lastMeasurementDuration_s = 0.0;

float lastIrms_A = 0.0;
float lastPower_W = 0.0;
double totalEnergy_kWh = 0.0;        // accumulated energy since boot

// ----------------- Helper functions -----------------

float readAveragedVoltage(int samples) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(ACS_PIN);
    delayMicroseconds(200);
  }

  float avgADC = (float)sum / samples;
  float voltage = (avgADC / ADC_MAX) * VREF;
  return voltage;
}

void calibrateZeroOffset() {
  Serial.println("Calibrating zero offset (no load). Do NOT draw current through the sensor.");
  delay(2000);

  zeroOffsetVoltage = readAveragedVoltage(2000);  // many samples for better baseline
  Serial.print("Zero offset voltage: ");
  Serial.print(zeroOffsetVoltage, 4);
  Serial.println(" V");
}

// Measures Irms over NUM_SAMPLES_RMS and stores the time window in lastMeasurementDuration_s
float readACIrms(int samples) {
  uint32_t startMicros = micros();
  double sumSquares = 0.0;

  float sensitivity_V_PER_A = SENSITIVITY_mV_PER_A / 1000.0;

  for (int i = 0; i < samples; i++) {
    int adc = analogRead(ACS_PIN);
    float voltage = (adc / ADC_MAX) * VREF;
    float deltaV = voltage - zeroOffsetVoltage;
    float currentInstant_A = deltaV / sensitivity_V_PER_A;

    sumSquares += (double)currentInstant_A * (double)currentInstant_A;

    // Optional small delay to avoid hammering ADC too fast
    // delayMicroseconds(50);
  }

  uint32_t endMicros = micros();

  lastMeasurementDuration_s = (endMicros - startMicros) / 1000000.0;
  if (lastMeasurementDuration_s <= 0.0) {
    lastMeasurementDuration_s = 1e-3;  // guard
  }

  double meanSquare = sumSquares / (double)samples;
  float Irms = sqrt(meanSquare);

  return Irms;
}

// ----------------- Arduino setup/loop -----------------

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("ESP32 + ACS712 AC Power/Energy Test");
  Serial.println("===================================");
  Serial.println("Assumptions:");
  Serial.print("  Mains Voltage: "); Serial.print(MAINS_VOLTAGE); Serial.println(" V");
  Serial.print("  Power Factor : "); Serial.println(POWER_FACTOR, 2);

  analogReadResolution(12);          // 0–4095
  analogSetAttenuation(ADC_11db);    // ~3.3V range

  calibrateZeroOffset();
}

void loop() {
  // Measure AC current (RMS) and its sampling window
  float Irms_A = readACIrms(NUM_SAMPLES_RMS);
  lastIrms_A = Irms_A;

  // Apparent power (VA)
  float apparentPower_W = Irms_A * MAINS_VOLTAGE;

  // Real power with power factor
  float realPower_W = apparentPower_W * POWER_FACTOR;
  lastPower_W = realPower_W;

  // Integrate energy: E(kWh) += P(W) * dt(h)
  double dt_hours = lastMeasurementDuration_s / 3600.0;
  totalEnergy_kWh += (realPower_W * dt_hours);

  // Print results
  Serial.print("Irms: ");
  Serial.print(Irms_A, 3);
  Serial.print(" A   |  P: ");
  Serial.print(realPower_W, 1);
  Serial.print(" W   |  E: ");
  Serial.print(totalEnergy_kWh, 6);
  Serial.println(" kWh");

  // Small pause so we don't spam Serial too hard
  delay(500);
}
