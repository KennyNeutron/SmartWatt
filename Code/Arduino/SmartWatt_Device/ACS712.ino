// ----------------- Helper functions -----------------

// Reads and averages the ACS712 output voltage (in volts) over N samples.
// This function compensates for the resistive divider (470Ω/1kΩ), returning
// the actual ACS712 output voltage rather than the ADC pin voltage.
float readAveragedVoltage(int samples) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(ACS_PIN);
    delayMicroseconds(200);
  }

  float avgADC = (float)sum / samples;

  // Voltage seen at the ESP32 ADC pin (0–3.3 V)
  float adcVoltage = (avgADC / ADC_MAX) * VREF;

  // Reconstruct the actual ACS712 OUT voltage using the divider ratio
  float sensorVoltage = adcVoltage / DIVIDER_RATIO;   // 0–5 V nominal

  return sensorVoltage;
}

void calibrateZeroOffset() {
  Serial.println("Calibrating zero offset (no load). Do NOT draw current through the sensor.");
  delay(2000);

  // Many samples at no-load to get a stable baseline.
  // This baseline is the ACS712 output voltage at 0A (typically ~Vcc/2 ≈ 2.5 V).
  zeroOffsetVoltage = readAveragedVoltage(2000);
  Serial.print("Zero offset (ACS712 OUT) voltage: ");
  Serial.print(zeroOffsetVoltage, 4);
  Serial.println(" V");
}

// Measures Irms over NUM_SAMPLES_RMS and stores the time window in lastMeasurementDuration_s
float readACIrms(int samples) {
  uint32_t startMicros = micros();
  double sumSquares = 0.0;

  float sensitivity_V_PER_A = SENSITIVITY_mV_PER_A / 1000.0;  // ACS712 datasheet sensitivity (V/A)

  for (int i = 0; i < samples; i++) {
    int adc = analogRead(ACS_PIN);

    // Convert ADC reading -> voltage at ADC pin -> ACS712 output voltage
    float adcVoltage    = (adc / ADC_MAX) * VREF;        // voltage at ESP32 ADC
    float sensorVoltage = adcVoltage / DIVIDER_RATIO;    // reconstructed ACS712 OUT voltage

    float deltaV = sensorVoltage - zeroOffsetVoltage;    // deviation from zero-current voltage
    float currentInstant_A = deltaV / sensitivity_V_PER_A;

    sumSquares += (double)currentInstant_A * (double)currentInstant_A;
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

void ACS712_Setup(){
    // Configure ADC for 12-bit and 0–3.3V range
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);    // ~3.3V range

  calibrateZeroOffset();
}

void ACS712_Loop() {
  // Measure AC current (RMS) and its sampling window
  float Irms_A_raw = readACIrms(NUM_SAMPLES_RMS);

  // Quantize to 1 decimal place using truncation:
  // 0.09 -> 0.0, 0.19 -> 0.1, etc.
  float Irms_A = floor(Irms_A_raw * 10.0f) / 10.0f;

  // Ignore anything below 0.1 A – treat it as 0.0 A
  if (Irms_A < 0.1f) {
    Irms_A = 0.0f;
  }

  lastIrms_A = Irms_A;

  // Apparent power (VA) based on quantized Irms
  float apparentPower_W = Irms_A * MAINS_VOLTAGE;

  // Real power with power factor
  float realPower_W = apparentPower_W * POWER_FACTOR;

  // If current is effectively zero, also zero the power to avoid noise
  if (Irms_A == 0.0f) {
    realPower_W = 0.0f;
  }

  lastPower_W = realPower_W;

  // Integrate power over time to get energy (kWh).
  // lastMeasurementDuration_s is the time spent in readACIrms().
  // Only integrate if power is non-zero.
  if (realPower_W > 0.0f) {
    double dt_hours = lastMeasurementDuration_s / 1800.0;
    totalEnergy_kWh += (realPower_W * dt_hours);
  }

  // Print results (Irms shown with 1 decimal place)
  // Serial.print("Irms: ");
  // Serial.print(Irms_A, 1);
  // Serial.print(" A   |  P: ");
  // Serial.print(realPower_W, 1);
  // Serial.print(" W   |  E: ");
  // Serial.print(totalEnergy_kWh, 6);
  // Serial.println(" kWh");

}


double ACS712_GetTotalEnergy_kWh() {
  return totalEnergy_kWh;
}

float ACS712_GetIrms_A() {
  return lastIrms_A;
}

float ACS712_GetPower_W() {
  return lastPower_W;
}

void ACS712_ResetEnergy() {
  totalEnergy_kWh = 0.0;
}