#ifndef SUPABASE_FUNCTIONS_H
#define SUPABASE_FUNCTIONS_H

#include <WiFiClientSecure.h>

// Forward declarations for cross-file functions
bool fetchDeviceConfig();
void Supabase_Update();
void printTlsLastError(WiFiClientSecure& client);

#endif