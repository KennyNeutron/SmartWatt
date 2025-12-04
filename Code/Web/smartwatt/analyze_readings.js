const https = require('https');

const SUPABASE_URL = "https://aeayentwrnmatnsdpoas.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlYXllbnR3cm5tYXRuc2Rwb2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMDI4MjAsImV4cCI6MjA3NjY3ODgyMH0.0kIWd35tsnBtt1XYr_3jIGnRE0PmY8k77hu8r09hxMk";

async function fetchReadings() {
  // 1. Get Device ID (hardcoded from Variables.h)
  const deviceId = "8f05d9af-71ad-4b4b-a927-9fd9bc6fd337";
  console.log("Device ID:", deviceId);

  // 2. Fetch Readings
  const readingsUrl = `${SUPABASE_URL}/rest/v1/device_readings?select=grid_kwh,solar_kwh,recorded_at&device_id=eq.${deviceId}&order=recorded_at.asc`;
  const readings = await doFetch(readingsUrl);
  
  console.log(`Fetched ${readings.length} readings.`);
  
  // 3. Simulate Logic
  simulateLogic(readings);
}

function simulateLogic(readings) {
  let prevGrid = 0;
  let prevSolar = 0;
  let prevTime = 0;
  let firstReading = true;
  
  let totalGridDelta = 0;
  let totalSolarDelta = 0;
  
  const MAX_POWER_KW = 50.0;

  console.log("\n--- Simulation Start ---");
  console.log("Idx | Time                 | Grid (Raw) | Solar (Raw) | Delta Grid | Delta Solar | Notes");
  console.log("----|----------------------|------------|-------------|------------|-------------|-------");

  readings.forEach((row, idx) => {
    const currentGrid = Number(row.grid_kwh ?? 0);
    const currentSolar = Number(row.solar_kwh ?? 0);
    const dt = new Date(row.recorded_at);
    const time = dt.getTime();
    
    let deltaGrid = 0;
    let deltaSolar = 0;
    let note = "";

    if (firstReading) {
      deltaGrid = 0;
      deltaSolar = 0;
      firstReading = false;
      note = "First Reading";
    } else {
      // Grid
      let rawDeltaGrid = 0;
      if (currentGrid >= prevGrid) {
        rawDeltaGrid = currentGrid - prevGrid;
      } else {
        rawDeltaGrid = currentGrid; // Reset assumed
        note += "Grid Reset? ";
      }
      
      // Solar
      let rawDeltaSolar = 0;
      if (currentSolar >= prevSolar) {
        rawDeltaSolar = currentSolar - prevSolar;
      } else {
        rawDeltaSolar = currentSolar; // Reset assumed
        note += "Solar Reset? ";
      }
      
      // Sanity Check
      const timeDiffHours = (time - prevTime) / 3600000.0;
      if (timeDiffHours > 0.000001) {
        const impliedGridKw = rawDeltaGrid / timeDiffHours;
        const impliedSolarKw = rawDeltaSolar / timeDiffHours;
        
        if (impliedGridKw < MAX_POWER_KW) {
          deltaGrid = rawDeltaGrid;
        } else {
          deltaGrid = 0;
          note += `[IGNORED GRID GLITCH: ${impliedGridKw.toFixed(1)} kW] `;
        }
        
        if (impliedSolarKw < MAX_POWER_KW) {
          deltaSolar = rawDeltaSolar;
        } else {
          deltaSolar = 0;
          note += `[IGNORED SOLAR GLITCH: ${impliedSolarKw.toFixed(1)} kW] `;
        }
      }
    }

    // Highlight large deltas
    if ((deltaGrid > 10 || deltaSolar > 10) && !note.includes("IGNORED")) {
      note += " LARGE DELTA!";
    }

    console.log(`${String(idx).padEnd(3)} | ${row.recorded_at} | ${String(currentGrid.toFixed(2)).padEnd(10)} | ${String(currentSolar.toFixed(2)).padEnd(11)} | ${String(deltaGrid.toFixed(2)).padEnd(10)} | ${String(deltaSolar.toFixed(2)).padEnd(11)} | ${note}`);

    prevGrid = currentGrid;
    prevSolar = currentSolar;
    prevTime = time;
    
    totalGridDelta += deltaGrid;
    totalSolarDelta += deltaSolar;
  });
  
  console.log("\n--- Totals ---");
  console.log("Total Grid Delta:", totalGridDelta.toFixed(2));
  console.log("Total Solar Delta:", totalSolarDelta.toFixed(2));
}

function doFetch(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => reject(err));
  });
}

fetchReadings().catch(console.error);
