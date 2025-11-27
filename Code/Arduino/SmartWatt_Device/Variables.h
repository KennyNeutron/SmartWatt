/* ====== WIFI CONFIG ====== */
const char* WIFI_SSID     = "Innocore2.4G";
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
const char* DEVICE_ID = "8f05d9af-71ad-4b4b-a927-9fd9bc6fd337";

/* ====== TIMING ====== */
const unsigned long SEND_INTERVAL_MS = 10UL * 1000UL; // 10 seconds
unsigned long lastSend = 0;

/* ====== DEVICE CONFIG CACHE ====== */
float g_dailyLimitKwh = 0.0f;
bool  g_limitEnabled  = false;
bool  g_hasConfig     = false;

const unsigned long CONFIG_REFRESH_INTERVAL_MS = 5UL * 60UL * 1000UL;
unsigned long lastConfigFetchMs = 0;

#define WiFi_Screen 0x1000
#define NTP_Screen  0x2000
#define Home_Screen 0x0000