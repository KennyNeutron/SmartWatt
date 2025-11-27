void Display_Home(){
    u8g2.clearBuffer();
    u8g2.setFontPosTop();
    u8g2.setFont(u8g2_font_profont12_mr);

    u8g2.drawStr(0, 0, "SMARTWATT DEVICE");
    
}