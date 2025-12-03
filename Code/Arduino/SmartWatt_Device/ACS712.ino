#include "Variables.h"

// We need to average samples to get a stable reading
const int NUM_SAMPLES = 100;
int zeroPoint = 2048; // Default center, will be calibrated

void ACS712_Init() {
  pinMode(ACS712_PIN, INPUT);
  
  // Calibrate Zero Point at startup
  // ASSUMPTION: No current is flowing during startup!
  long sum = 0;
  for(int i=0; i<1000; i++) {
    sum += analogRead(ACS712_PIN);
    delayMicroseconds(100);
  }
  zeroPoint = sum / 1000;
  Serial.printf("ACS712 Calibrated Zero Point: %d\n", zeroPoint);
}

float ACS712_ReadCurrent() {
  // We use the RMS function for AC current
  return ACS712_ReadCurrentRMS();
}

float ACS712_ReadCurrentRMS() {
  int sampleCount = 0;
  float sumSquared = 0;
  uint32_t startMs = millis();
  
  // Read for 100ms (covering both 50Hz and 60Hz multiple cycles)
  while (millis() - startMs < 100) {
    int raw = analogRead(ACS712_PIN);
    
    // Use calibrated zero point
    long val = raw - zeroPoint; 
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
  float currentAmps = rmsVoltage / SENSITIVITY;
  
  // Noise floor suppression
  // Increased to 0.10A (approx 23W @ 230V) to filter out ghost readings
  // ACS712 is noisy, especially with ESP32 ADC.
  if (currentAmps < 0.10f) currentAmps = 0.0f;
  
  return currentAmps;
}

float ACS712_ReadPowerW() {
  float amps = ACS712_ReadCurrent();
  return amps * SYSTEM_VOLTAGE;
}
