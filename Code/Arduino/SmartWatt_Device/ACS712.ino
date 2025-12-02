#include "Variables.h"

// We need to average samples to get a stable reading
const int NUM_SAMPLES = 100;

void ACS712_Init() {
  pinMode(ACS712_PIN, INPUT);
  // Optional: Set ADC attenuation if needed. Default is 11db (0-3.3V) usually on Arduino ESP32 core.
  // analogSetAttenuation(ADC_11db);
}

float ACS712_ReadCurrent() {
  long sum = 0;
  for (int i = 0; i < NUM_SAMPLES; i++) {
    sum += analogRead(ACS712_PIN);
    delayMicroseconds(100); // Small delay between samples
  }
  float averageRaw = (float)sum / NUM_SAMPLES;

  // Convert raw ADC to Voltage
  // ESP32 ADC is 12-bit (0-4095) mapped to 0-3.3V (approx)
  // NOTE: ESP32 ADC is non-linear. For better precision, calibration is needed.
  // For now, we use simple linear mapping.
  float voltage = (averageRaw / 4095.0f) * 3.3f;

  // Convert Voltage to Current
  // Vout = Vcc/2 + Sensitivity * Current
  // Current = (Vout - Vcc/2) / Sensitivity
  // We defined ZERO_CURRENT_OFFSET as Vcc/2 (2.5V for 5V sensor)
  // BUT we are reading it with a 3.3V ADC.
  // IF the sensor is 5V, 0A = 2.5V. 2.5V > 0A.
  // IF the sensor is 5V, we MUST have a voltage divider to bring 5V down to 3.3V.
  // Let's assume the user has a voltage divider that scales 5V -> 3.3V.
  // So 2.5V (0A) becomes 2.5 * (3.3/5.0) = 1.65V.
  // Let's assume the input voltage we read IS the scaled voltage representing the sensor output.
  
  // If we assume the sensor is 5V and we are reading it directly (DANGEROUS for ESP32 if > 3.3V),
  // 0A is 2.5V.
  
  // Let's use the ZERO_CURRENT_OFFSET as the voltage we expect at 0A.
  // If we assume a voltage divider 5V->3.3V, then 0A is 1.65V.
  // If we assume the user set ZERO_CURRENT_OFFSET to 2.5V, they might expect us to handle the scaling?
  // Let's assume the voltage we read is the TRUE voltage at the pin.
  // And we compare it to the ZERO_CURRENT_OFFSET (which should be the voltage at the pin at 0A).
  
  // RE-EVALUATING:
  // Most users just hook it up. If it's a 5V sensor, they might damage the ESP32.
  // If it's a 3.3V sensor (rare), 0A = 1.65V.
  // Let's assume 0A = 1.65V (VCC/2 for 3.3V) or scaled 2.5V->1.65V.
  // Let's update ZERO_CURRENT_OFFSET to be 1.65V in the calculation or allow it to be calibrated.
  // For now, let's calculate current based on difference from "Zero".
  
  // To make this robust, let's just subtract the "Quiescent Voltage" which we can assume is around 1.65V for ESP32 range.
  // Or we can dynamically find zero at startup? No, load might be on.
  
  // Let's stick to the plan:
  // Current = (Voltage - ZeroOffset) / Sensitivity
  // If we used 2.5V in Variables.h, and we read 1.65V, we get negative current.
  // Let's assume the user has a proper level shifter or 3.3V sensor.
  // If 3.3V sensor: Zero = 1.65V. Sensitivity = 100mV/A (might be different for 3.3V versions).
  // If 5V sensor + Divider (2/3): Zero = 2.5 * 0.66 = 1.65V. Sensitivity = 100mV * 0.66 = 66mV/A.
  
  // I will implement a simple DC offset removal if we want AC current?
  // Wait, ACS712 measures AC or DC.
  // If measuring AC (Mains), the output oscillates around the Zero point.
  // We need to calculate RMS for AC.
  // The user asked for "SmartWatt" which implies AC Mains power monitoring usually.
  // The variables say "CurrentUsageW" and "Daily Limit kWh", implying AC energy monitoring.
  // So we need AC RMS calculation, not DC.
  
  // AC RMS Calculation:
  // 1. Read samples over a few cycles (e.g. 20ms for 50Hz, 16.6ms for 60Hz).
  // 2. Calculate RMS Voltage (of the sensor output).
  // 3. Convert RMS Voltage ripple to RMS Current.
  
  return ACS712_ReadCurrentRMS();
}

float ACS712_ReadCurrentRMS() {
  int sampleCount = 0;
  float sumSquared = 0;
  uint32_t startMs = millis();
  
  // Read for 100ms (covering both 50Hz and 60Hz multiple cycles)
  while (millis() - startMs < 100) {
    int raw = analogRead(ACS712_PIN);
    // Center around VCC/2 (approx 1800-2000 for 12-bit ADC on 3.3V)
    // Better: Remove DC component (average) or assume fixed zero.
    // Let's assume fixed zero for now to keep it simple, or use a high-pass filter.
    // Simple approach: Zero is approx 1.65V -> ~2048 raw.
    // Let's use a moving average for zero if possible, but for short burst, fixed is safer.
    // 2048 is theoretical center.
    
    long val = raw - 2048; // Center it
    sumSquared += val * val;
    sampleCount++;
    delayMicroseconds(100);
  }
  
  if (sampleCount == 0) return 0.0f;
  
  float rmsRaw = sqrt(sumSquared / sampleCount);
  
  // Convert RMS Raw to RMS Voltage
  // 3.3V / 4095 = Volts per bit
  float rmsVoltage = (rmsRaw / 4095.0f) * 3.3f;
  
  // Convert RMS Voltage to RMS Current
  // Sensitivity is in V/A.
  // If we have a voltage divider, sensitivity is also scaled.
  // Let's assume standard 100mV/A (0.1 V/A) and NO divider for now (or user adjusts).
  // If there is a divider, the user needs to adjust SENSITIVITY in Variables.h.
  float currentAmps = rmsVoltage / SENSITIVITY;
  
  // Noise floor suppression
  if (currentAmps < 0.05f) currentAmps = 0.0f;
  
  return currentAmps;
}

float ACS712_ReadPowerW() {
  float amps = ACS712_ReadCurrent();
  return amps * SYSTEM_VOLTAGE;
}
