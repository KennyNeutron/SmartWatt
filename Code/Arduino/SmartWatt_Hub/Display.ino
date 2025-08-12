float device_CurrentConsumption[3];
float device_PowerConsumption[3];
float device_EnergyConsumption[3];  // kWh values

// Variables to track time for energy calculation
unsigned long lastUpdateTime = 0;

void display_Main() {
  u8g2.clearBuffer();
  u8g2.setFontPosTop();
  u8g2.setFont(u8g2_font_profont12_mr);  // ProFont 12 - good monospace font
  
  // Headers - adjusted spacing for ProFont12
  u8g2.drawStr(0, 0, "N");
  u8g2.drawStr(18, 0, "mA");
  u8g2.drawStr(50, 0, "W");
  u8g2.drawStr(88, 0, "kWh");
  
  char buffer[15];

  // Calculate energy consumption
  unsigned long currentTime = millis();
  if (lastUpdateTime > 0) {
    unsigned long timeDiff = currentTime - lastUpdateTime;
    float hours = timeDiff / 3600000.0;  // Convert ms to hours
    
    for (int i = 0; i < 3; i++) {
      device_EnergyConsumption[i] += (device_PowerConsumption[i] * hours) / 1000.0;
    }
  }
  lastUpdateTime = currentTime;

  // Update data from received NRF
  if(smartwattData.deviceID == 0x01){
    device_CurrentConsumption[0] = smartwattData.currentConsumption;
    device_PowerConsumption[0] = (smartwattData.currentConsumption * 220) / 1000;
  }
  
  // Device 1 - ProFont12 is about 12px high, so spacing adjusted
  u8g2.drawStr(0, 14, "1");
  sprintf(buffer, "%.0f", device_CurrentConsumption[0]);
  u8g2.drawStr(18, 14, buffer);
  sprintf(buffer, "%.1f", device_PowerConsumption[0]);
  u8g2.drawStr(50, 14, buffer);
  sprintf(buffer, "%.2f", device_EnergyConsumption[0]);
  u8g2.drawStr(88, 14, buffer);
  
  // Device 2
  u8g2.drawStr(0, 27, "2");
  sprintf(buffer, "%.0f", device_CurrentConsumption[1]);
  u8g2.drawStr(18, 27, buffer);
  sprintf(buffer, "%.1f", device_PowerConsumption[1]);
  u8g2.drawStr(50, 27, buffer);
  sprintf(buffer, "%.2f", device_EnergyConsumption[1]);
  u8g2.drawStr(88, 27, buffer);
  
  // Device 3
  u8g2.drawStr(0, 40, "3");
  sprintf(buffer, "%.0f", device_CurrentConsumption[2]);
  u8g2.drawStr(18, 40, buffer);
  sprintf(buffer, "%.1f", device_PowerConsumption[2]);
  u8g2.drawStr(50, 40, buffer);
  sprintf(buffer, "%.2f", device_EnergyConsumption[2]);
  u8g2.drawStr(88, 40, buffer);
  
  // Calculate and display totals
  float totalCurrent = device_CurrentConsumption[0] + device_CurrentConsumption[1] + device_CurrentConsumption[2];
  float totalPower = device_PowerConsumption[0] + device_PowerConsumption[1] + device_PowerConsumption[2];
  float totalEnergy = device_EnergyConsumption[0] + device_EnergyConsumption[1] + device_EnergyConsumption[2];
  
  // Draw line separator
  u8g2.drawHLine(0, 51, 128);  // Horizontal line across display
  
  // Totals row
  u8g2.drawStr(0, 54, "T");  // Total
  sprintf(buffer, "%.0f", totalCurrent);
  u8g2.drawStr(18, 54, buffer);
  sprintf(buffer, "%.1f", totalPower);
  u8g2.drawStr(50, 54, buffer);
  sprintf(buffer, "%.2f", totalEnergy);
  u8g2.drawStr(88, 54, buffer);
  
  u8g2.sendBuffer();
}

// Reset energy counters (call this daily or when needed)
void resetEnergyCounters() {
  device_EnergyConsumption[0] = 0.0;
  device_EnergyConsumption[1] = 0.0;
  device_EnergyConsumption[2] = 0.0;
  lastUpdateTime = millis();
}