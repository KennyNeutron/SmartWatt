float device_CurrentConsumption[3];
float device_PowerConsumption[3];

void display_Main() {
  u8g2.clearBuffer();
  u8g2.setFontPosTop();
  u8g2.setFont(u8g2_font_t0_11_t_all);
  
  // Headers
  u8g2.drawStr(0, 0, "Node");
  u8g2.drawStr(40, 0, "I(mA)");
  u8g2.drawStr(90, 0, "P(W)");
  
  char buffer[20];  // Buffer for string conversion

  if(receivedData.deviceID==0x01){
    device_CurrentConsumption[0] = receivedData.currentConsumption;
    device_PowerConsumption[0] = (receivedData.currentConsumption*220)/1000;
  }
  
  // Device 1 (index 0)
  u8g2.drawStr(0, 12, "1");
  sprintf(buffer, "%.0f", device_CurrentConsumption[0]);
  u8g2.drawStr(40, 12, buffer);
  sprintf(buffer, "%.1f", device_PowerConsumption[0]);
  u8g2.drawStr(90, 12, buffer);
  
  // Device 2 (index 1)
  u8g2.drawStr(0, 24, "2");
  sprintf(buffer, "%.0f", device_CurrentConsumption[1]);
  u8g2.drawStr(40, 24, buffer);
  sprintf(buffer, "%.1f", device_PowerConsumption[1]);
  u8g2.drawStr(90, 24, buffer);
  
  // Device 3 (index 2)
  u8g2.drawStr(0, 36, "3");
  sprintf(buffer, "%.0f", device_CurrentConsumption[2]);
  u8g2.drawStr(40, 36, buffer);
  sprintf(buffer, "%.1f", device_PowerConsumption[2]);
  u8g2.drawStr(90, 36, buffer);
  
  u8g2.sendBuffer();
}