#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>

// CE and CSN pins
RF24 radio(9, 10); // CE, CSN

void setup() {
  Serial.begin(9600);
  Serial.println(F("NRF24L01 Test"));

  if (!radio.begin()) {
    Serial.println(F("Radio hardware is NOT responding!!"));
    while (1) {
      delay(1000);
    }
  }

  Serial.println(F("Radio initialized successfully."));

  // Basic config
  radio.setPALevel(RF24_PA_LOW);
  radio.setDataRate(RF24_250KBPS);

  // Check RF channel
  Serial.print(F("RF Channel: "));
  Serial.println(radio.getChannel());

  // Check Data Rate
  Serial.print(F("Data Rate: "));
  switch (radio.getDataRate()) {
    case RF24_250KBPS: Serial.println(F("250 KBPS")); break;
    case RF24_1MBPS:   Serial.println(F("1 MBPS")); break;
    case RF24_2MBPS:   Serial.println(F("2 MBPS")); break;
  }

  // Check PA Level
  Serial.print(F("PA Level: "));
  switch (radio.getPALevel()) {
    case RF24_PA_MIN:  Serial.println(F("MIN")); break;
    case RF24_PA_LOW:  Serial.println(F("LOW")); break;
    case RF24_PA_HIGH: Serial.println(F("HIGH")); break;
    case RF24_PA_MAX:  Serial.println(F("MAX")); break;
  }

  Serial.println(F("NRF24L01 Detected!"));
}

void loop() {
  // Nothing here, just report once
}
