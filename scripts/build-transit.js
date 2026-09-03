#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const GTFS_URL = 'https://www.vgn.de/opendata/GTFS.zip';
const GTFS_DIR = path.join(__dirname, '..', '..', 'tmp', 'vgn-gtfs');
const GTFS_ZIP = path.join(__dirname, '..', '..', 'tmp', 'vgn-gtfs.zip');
const OUT = path.join(__dirname, '..', 'data', 'transit.json');

const DESTINATIONS = [
  {
    slug: 'bambados',
    stop_id: 'de:09461:20040:0:2',
    stop_name: 'Bamberg Bambados',
    poi_slug: 'bambados',
    lines: ['920', '935', '936'],
    journey_min: 11,
    walk_from_zob: false
  },
  {
    slug: 'seehof',
    stop_id: 'de:09471:20856:0:1',
    stop_name: 'Seehof (b. Memmelsdorf) Schloß',
    poi_slug: 'schloss-seehof',
    lines: ['907', '917', '927'],
    journey_min: 19,
    walk_from_zob: false
  },
  {
    slug: 'erba',
    stop_id: 'de:09461:20442:0:1',
    stop_name: 'Bamberg Wildensorger Str.',
    poi_slug: 'erba-park',
    lines: ['910'],
    journey_min: 15,
    walk_from_zob: true,
    walk_m: 320
  },
  {
    slug: 'bruderwald',
    stop_id: 'de:09461:20027:0:1',
    stop_name: 'Bamberg Am Bruderwald',
    poi_slug: 'bruderwald',
    lines: ['937', '918'],
    journey_min: 15,
    walk_from_zob: false
  },
  {
    slug: 'altenburg',
    stop_id: 'de:09461:20131:0:1',
    stop_name: 'Gaustadt H.-Semlinger-Str.',
    poi_slug: 'altenburg',
    lines: ['906', '938'],
    journey_min: 9,
    walk_from_zob: true,
    walk_m: 270
  }
];

function parseCSV(text) {
  const lines = text.replace(/^\uFEFF/, '').split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += c;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function downloadGTFS() {
  if (fs.existsSync(GTFS_DIR) && fs.existsSync(path.join(GTFS_DIR, 'stops.txt'))) {
    console.log('GTFS already extracted at', GTFS_DIR);
    return;
  }
  console.log('Downloading GTFS...');
  fs.mkdirSync(path.dirname(GTFS_ZIP), { recursive: true });
  execSync(`curl -L -o "${GTFS_ZIP}" "${GTFS_URL}"`, { stdio: 'inherit' });
  console.log('Extracting...');
  fs.mkdirSync(GTFS_DIR, { recursive: true });
  execSync(`unzip -o "${GTFS_ZIP}" -d "${GTFS_DIR}"`, { stdio: 'inherit' });
}

function timeToMinutes(t) {
  if (!t) return null;
  const parts = t.split(':').map(Number);
  let h = parts[0], m = parts[1] || 0;
  if (h >= 24) h -= 24;
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function classifyDayType(service, calDates, date) {
  const d = new Date(date);
  const dow = d.getDay();
  const dayStr = date.replace(/-/g, '');

  // Check calendar_dates for exceptions first
  const exceptions = calDates.filter(cd => cd.date === dayStr);
  const removedServices = new Set();
  const addedServices = new Set();
  for (const ex of exceptions) {
    if (ex.exception_type === '2') removedServices.add(ex.service_id);
    if (ex.exception_type === '1') addedServices.add(ex.service_id);
  }

  // Check if any service is active today (including added exceptions)
  for (const sid of Object.keys(service)) {
    if (removedServices.has(sid)) continue;
    const s = service[sid];
    if (!isActiveOnDate(s, dow, dayStr) && !addedServices.has(sid)) continue;
    const dt = getDayType(s, dow);
    if (dt) return dt;
  }

  // Fallback: determine from date
  if (dow === 0) return 'sun';
  if (dow === 6) return 'sat';
  return 'weekday';
}

function getDayType(s, dow) {
  if (s.monday && dow >= 1 && dow <= 5) return 'weekday';
  if (s.saturday && dow === 6) return 'sat';
  if (s.sunday && dow === 0) return 'sun';
  return null;
}

function isActiveOnDate(s, dow, dayStr) {
  if (dayStr < s.start_date || dayStr > s.end_date) return false;
  if (dow >= 1 && dow <= 5 && s.monday) return true;
  if (dow === 6 && s.saturday) return true;
  if (dow === 0 && s.sunday) return true;
  return false;
}

function main() {
  downloadGTFS();

  console.log('Parsing GTFS files...');
  const stops = parseCSV(fs.readFileSync(path.join(GTFS_DIR, 'stops.txt'), 'utf-8'));
  const routes = parseCSV(fs.readFileSync(path.join(GTFS_DIR, 'routes.txt'), 'utf-8'));
  const trips = parseCSV(fs.readFileSync(path.join(GTFS_DIR, 'trips.txt'), 'utf-8'));
  const stopTimes = parseCSV(fs.readFileSync(path.join(GTFS_DIR, 'stop_times.txt'), 'utf-8'));
  const calendar = parseCSV(fs.readFileSync(path.join(GTFS_DIR, 'calendar.txt'), 'utf-8'));
  const calDates = parseCSV(fs.readFileSync(path.join(GTFS_DIR, 'calendar_dates.txt'), 'utf-8'));

  const stopsById = {};
  stops.forEach(s => { stopsById[s.stop_id] = s; });

  const routesById = {};
  routes.forEach(r => { routesById[r.route_id] = r; });

  const tripsById = {};
  trips.forEach(t => { tripsById[t.trip_id] = t; });

  const service = {};
  calendar.forEach(c => {
    service[c.service_id] = {
      monday: c.monday === '1',
      tuesday: c.tuesday === '1',
      wednesday: c.wednesday === '1',
      thursday: c.thursday === '1',
      friday: c.friday === '1',
      saturday: c.saturday === '1',
      sunday: c.sunday === '1',
      start_date: c.start_date,
      end_date: c.end_date
    };
  });

  // ZOB stop_id prefix
  const ZOB_PREFIX = 'de:09461:20200:0:';

  // Group stop_times by trip_id for fast lookup
  console.log('Indexing stop_times...');
  const tripStops = {};
  stopTimes.forEach(st => {
    if (!tripStops[st.trip_id]) tripStops[st.trip_id] = [];
    tripStops[st.trip_id].push(st);
  });

  // Sort each trip's stops by stop_sequence
  for (const tid of Object.keys(tripStops)) {
    tripStops[tid].sort((a, b) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence));
  }

  const result = {
    generated: new Date().toISOString().split('T')[0],
    source: 'VGN GTFS (CC BY 3.0)',
    source_url: 'https://www.vgn.de/opendata/GTFS.zip',
    attribution: 'Datenbasis: VGN / VAG. Lizenziert unter CC BY 3.0.',
    boarding_stop: {
      id: 'de:09461:20200:0:A',
      name: 'Bamberg ZOB',
      note: 'Starte hier. Einstieg an allen Bahnsteigen des ZOB.'
    },
    today_types: {},
    destinations: []
  };

  for (const dest of DESTINATIONS) {
    console.log(`Processing ${dest.slug}...`);

    // Find all trips that stop at both ZOB and destination
    const routeSchedules = {};
    for (const line of dest.lines) {
      routeSchedules[line] = { weekday: [], sat: [], sun: [] };
    }

    // Find trips going to the destination stop
    for (const tid of Object.keys(tripStops)) {
      const stopsList = tripStops[tid];
      const trip = tripsById[tid];
      if (!trip) continue;

      const route = routesById[trip.route_id];
      if (!route) continue;
      const lineNum = route.route_short_name;
      if (!dest.lines.includes(lineNum)) continue;

      // Find if this trip stops at destination
      const destStop = stopsList.find(s => s.stop_id === dest.stop_id);
      if (!destStop) continue;

      // Find if this trip stops at ZOB
      const zobStop = stopsList.find(s => s.stop_id && s.stop_id.startsWith(ZOB_PREFIX));
      if (!zobStop) continue;

      // Calculate journey time
      const depMin = timeToMinutes(zobStop.departure_time);
      const arrMin = timeToMinutes(destStop.arrival_time || destStop.departure_time);
      if (depMin === null || arrMin === null) continue;

      let journeyMin = arrMin - depMin;
      if (journeyMin < 0) journeyMin += 24 * 60;
      if (journeyMin < 3 || journeyMin > 45) continue;

      const depTime = zobStop.departure_time;
      const dayType = getDayType(service[trip.service_id] || {}, new Date().getDay());

      // Classify by all possible day types
      const svc = service[trip.service_id];
      if (!svc) continue;

      if (svc.monday || svc.tuesday || svc.wednesday || svc.thursday || svc.friday) {
        routeSchedules[lineNum].weekday.push({ dep: depTime, arr: destStop.arrival_time || destStop.departure_time, journey: journeyMin });
      }
      if (svc.saturday) {
        routeSchedules[lineNum].sat.push({ dep: depTime, arr: destStop.arrival_time || destStop.departure_time, journey: journeyMin });
      }
      if (svc.sunday) {
        routeSchedules[lineNum].sun.push({ dep: depTime, arr: destStop.arrival_time || destStop.departure_time, journey: journeyMin });
      }
    }

    // Build schedule summary per line
    const lineSummaries = [];
    for (const line of dest.lines) {
      const scheds = routeSchedules[line];
      const summary = { line };

      for (const [dayType, trips] of Object.entries(scheds)) {
        if (trips.length === 0) continue;
        trips.sort((a, b) => timeToMinutes(a.dep) - timeToMinutes(b.dep));

        const first = trips[0];
        const last = trips[trips.length - 1];

        // Calculate headway (average gap between departures)
        let avgHeadway = 0;
        if (trips.length > 1) {
          const gaps = [];
          for (let i = 1; i < trips.length; i++) {
            const g = timeToMinutes(trips[i].dep) - timeToMinutes(trips[i - 1].dep);
            if (g > 0 && g < 120) gaps.push(g);
          }
          if (gaps.length > 0) {
            avgHeadway = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
          }
        }

        summary[dayType] = {
          first_dep: first.dep,
          last_dep: last.dep,
          trip_count: trips.length,
          avg_headway_min: avgHeadway,
          journey_min: Math.round(trips.reduce((a, t) => a + t.journey, 0) / trips.length)
        };
      }

      if (Object.keys(summary).length > 1) {
        lineSummaries.push(summary);
      }
    }

    // Compute today's type
    const today = new Date().toISOString().split('T')[0];
    const todayType = classifyDayType(service, calDates, today);

    const destData = {
      slug: dest.slug,
      poi_slug: dest.poi_slug,
      stop: {
        id: dest.stop_id,
        name: dest.stop_name
      },
      walk_from_zob: dest.walk_from_zob || false,
      walk_m: dest.walk_m || 0,
      lines: lineSummaries,
      today_type: todayType
    };

    result.destinations.push(destData);
    result.today_types[dest.slug] = todayType;
  }

  // Sort by fastest journey time
  result.destinations.sort((a, b) => {
    const aMin = Math.min(...a.lines.map(l => l.weekday?.journey_min || 99));
    const bMin = Math.min(...b.lines.map(l => l.weekday?.journey_min || 99));
    return aMin - bMin;
  });

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(`Wrote ${OUT}`);
  console.log(`Processed ${result.destinations.length} destinations`);
}

main();
