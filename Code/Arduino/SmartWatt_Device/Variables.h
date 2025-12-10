#ifndef VARIABLES_H
#define VARIABLES_H

#include <Arduino.h>

/* ====== WIFI CONFIG ====== */
const char* WIFI_SSID     = "KennyNeutron's IPhone";
const char* WIFI_PASSWORD = "one2nine";

/* ====== SUPABASE CONFIG (SMARTWATT) ====== */
// REST endpoint for device_readings
const char* ENDPOINT =
  "https://aeayentwrnmatnsdpoas.supabase.co/rest/v1/device_readings";
const char* ENDPOINT_HOST = "aeayentwrnmatnsdpoas.supabase.co"; // for DNS test

// REST endpoint for device_config
const char* CONFIG_ENDPOINT_BASE =
  "https://aeayentwrnmatnsdpoas.supabase.co/rest/v1/device_config";

// anon key (same as NEXT_PUBLIC_SUPABASE_ANON_KEY)
const char* SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlYXllbnR3cm5tYXRuc2Rwb2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMDI4MjAsImV4cCI6MjA3NjY3ODgyMH0.0kIWd35tsnBtt1XYr_3jIGnRE0PmY8k77hu8r09hxMk";

// SmartWatt device_id (from public.devices)
const char* DEVICE_ID = "4f66ac59-eb16-48aa-84a2-c2fad166ef4e";

/* ====== TIMING ====== */
const unsigned long SEND_INTERVAL_MS = 60UL * 1000UL; // 60 seconds
unsigned long lastSend = 0;

/* ====== DEVICE CONFIG CACHE ====== */
float g_dailyLimitKwh = 0.0f;
bool  g_limitEnabled  = false;
bool  g_hasConfig     = false;

uint32_t CONFIG_REFRESH_INTERVAL_MS = 60000;
unsigned long lastConfigFetchMs = 0;

/* ====== SCREEN DEFINITIONS ====== */
#define WiFi_Screen 0x1000
#define NTP_Screen  0x2000
#define Home_Screen 0x0000

#define SSR_Pin 33

/* ====== ACS712 CONFIG ====== */
const int ACS_PIN = 34;              // ADC1 channel, input only

// Number of samples for RMS calculation (higher = slower but smoother)
const int NUM_SAMPLES_RMS = 1000;

// ==== CONFIGURE THIS FOR YOUR SENSOR VERSION ====
// 5A  module: 185.0
// 20A module: 100.0
// 30A module: 66.0
const float SENSITIVITY_mV_PER_A = 100.0;  // mV per Amp (20A version by default)

// ==== ADC CONFIG ====
// ESP32: 12-bit ADC (0–4095)
const float ADC_MAX = 4095.0;
const float VREF    = 3.3;              // Adjust if you know your board's actual reference

// ==== Voltage Divider (ACS712 OUT -> 470Ω -> ADC, ADC -> 1kΩ -> GND) ====
// V_adc = V_sensor * DIVIDER_RATIO  where:
// - R_TOP_OHMS is between ACS712 OUT and the ESP32 ADC pin
// - R_BOTTOM_OHMS is between the ADC pin and GND
const float R_TOP_OHMS    = 470.0f;      // between ACS712 OUT and ADC pin
const float R_BOTTOM_OHMS = 1000.0f;     // between ADC pin and GND
const float DIVIDER_RATIO = R_BOTTOM_OHMS / (R_TOP_OHMS + R_BOTTOM_OHMS);  // ~0.68

// ==== MAINS & POWER FACTOR ====
// Adjust these for your location and load.
const float MAINS_VOLTAGE = 230.0;   // e.g. 220–230 V AC
const float POWER_FACTOR  = 1.0;     // 1.0 for purely resistive, <1.0 for inductive loads

// ==== STATE ====
// Stored as "sensor voltage", not ADC pin voltage, because we reconstruct it.
float zeroOffsetVoltage         = 0.0;   // V at 0A (measured at startup, ACS712 output)
float lastMeasurementDuration_s = 0.0;

float lastIrms_A   = 0.0;
float lastPower_W  = 0.0;
double totalEnergy_kWh = 0.0;        // accumulated energy since boot

//HomePage
bool CurrentSource = 0; // 0 = Grid, 1 = Solar
float CurrentUsageW = 0.0;
float CurrentUsageA = 0.0;

float totalGridKwh = 0.0;
float totalSolarKwh = 0.0;


#endif