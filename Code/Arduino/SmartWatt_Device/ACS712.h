#ifndef ACS712_H
#define ACS712_H

// Forward declarations
void ACS712_Setup();
void ACS712_Loop();
float ACS712_GetIrms_A();
float ACS712_GetPower_W();
double ACS712_GetTotalEnergy_kWh();

#endif