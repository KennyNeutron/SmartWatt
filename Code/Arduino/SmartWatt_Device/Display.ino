void Display_Main() {
    switch(CurrentScreen) {
        case WiFi_Screen:
            Display_WiFi();
            break;
        case Home_Screen:
            Display_Home();
            break;
        default:
            Display_WiFi();
            break;
    }
}