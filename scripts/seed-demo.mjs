#!/usr/bin/env node
/**
 * Seed the local PocketBase instance with coherent demo data.
 *
 * Usage:
 *   PB_SUPERUSER_EMAIL=admin@cleanconnect.local \
 *   PB_SUPERUSER_PASSWORD=CleanConnect123! \
 *   npm run seed:demo
 *
 * The script is idempotent: users, citizens, drivers, zones, bins, rewards,
 * civic scores and the active QR token are upserted. Demo scans and ledger
 * entries are recreated so the dashboards always show fresh activity.
 */

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const SUPERUSER_EMAIL = process.env.PB_SUPERUSER_EMAIL || 'admin@cleanconnect.local';
const SUPERUSER_PASSWORD = process.env.PB_SUPERUSER_PASSWORD || 'CleanConnect123!';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Demo12345!';

const DEMO_USERS = [
  {
    email: 'citizen@demo.local',
    name: 'Demo Citizen',
    role: 'citizen',
    zone_id: 'ZONE-A1',
  },
  {
    email: 'driver@demo.local',
    name: 'Demo Driver',
    role: 'driver',
    zone_id: 'ZONE-A1',
    truck_number: 'TRK-001',
  },
  {
    email: 'admin@demo.local',
    name: 'Demo Admin',
    role: 'admin',
    zone_id: 'ZONE-A1',
  },
];

const BIN_QR_TOKEN = '9f2c4e6a8b0d1f3a5c7e9b2d4f6a8c0e1b3d5f7a9c2e4b6d8f0a1c3e5b7d9f2a';
const GEOFENCE = { lat: 12.9716, lng: 77.5946 };

let authToken = '';

const request = async (path, options = {}) => {
  const response = await fetch(`${PB_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: authToken } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = body?.message || response.statusText;
    const details = body?.data ? ` ${JSON.stringify(body.data)}` : '';
    throw new Error(`${options.method || 'GET'} ${path} failed (${response.status}): ${message}${details}`);
  }

  return body;
};

const loginSuperuser = async () => {
  const result = await request('/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    body: JSON.stringify({ identity: SUPERUSER_EMAIL, password: SUPERUSER_PASSWORD }),
  });
  authToken = result.token;
  console.log(`Signed in as superuser ${SUPERUSER_EMAIL}`);
};

const list = async (collection, filter) => {
  const query = new URLSearchParams({ perPage: '200', skipTotal: '1' });
  if (filter) query.set('filter', filter);
  const result = await request(`/api/collections/${collection}/records?${query}`);
  return result.items;
};

const create = (collection, data) =>
  request(`/api/collections/${collection}/records`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

const update = (collection, id, data) =>
  request(`/api/collections/${collection}/records/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

const remove = (collection, id) =>
  request(`/api/collections/${collection}/records/${id}`, { method: 'DELETE' });

const upsert = async (collection, filter, data) => {
  const existing = await list(collection, filter);
  if (existing.length > 0) {
    return update(collection, existing[0].id, data);
  }
  return create(collection, data);
};

const ensureUsers = async () => {
  const users = {};
  for (const demo of DEMO_USERS) {
    const existing = await list('users', `email = "${demo.email}"`);
    if (existing.length > 0) {
      users[demo.role] = await update('users', existing[0].id, {
        name: demo.name,
        role: demo.role,
        zone_id: demo.zone_id,
        ...(demo.truck_number ? { truck_number: demo.truck_number } : {}),
      });
    } else {
      users[demo.role] = await create('users', {
        ...demo,
        password: DEMO_PASSWORD,
        passwordConfirm: DEMO_PASSWORD,
        emailVisibility: true,
        verified: true,
      });
    }
    console.log(`User ready: ${demo.email} (${demo.role})`);
  }
  return users;
};

const ensureCitizen = async (citizenUser) => {
  const nextPickup = new Date();
  nextPickup.setDate(nextPickup.getDate() + 2);
  const nextPickupDate = nextPickup.toISOString().slice(0, 10);

  return upsert('citizens', `user_id = "${citizenUser.id}"`, {
    user_id: citizenUser.id,
    green_tokens: 640,
    neighborhood: 'Maple Grove',
    zone_id: 'ZONE-A1',
    geolocation: `${GEOFENCE.lat},${GEOFENCE.lng}`,
    next_pickup_date: nextPickupDate,
    next_pickup_time: '07:30',
  });
};

const ensureDriver = async (driverUser) => {
  return upsert('drivers', `user_id = "${driverUser.id}"`, {
    user_id: driverUser.id,
    truck_number: 'TRK-001',
    base_daily_wage: 500,
    current_strikes: 0,
    wallet_balance: 850,
    assigned_zones: 'ZONE-A1',
  });
};

const ensureZones = async () => {
  const zones = [
    {
      zone_name: 'Maple Grove',
      street_names: 'Maple Grove Lane, Cedar Avenue, Elm Street',
      citizen_count: 148,
      collection_status: 'pending',
      geofence_coordinates: '12.9716,77.5946',
    },
    {
      zone_name: 'Riverside',
      street_names: 'Riverside Road, Mill Street, Brook Lane',
      citizen_count: 96,
      collection_status: 'completed',
      geofence_coordinates: '12.9620,77.6010',
    },
    {
      zone_name: 'Old Town',
      street_names: 'Heritage Square, Market Street, Fort Road',
      citizen_count: 121,
      collection_status: 'missed',
      geofence_coordinates: '12.9500,77.5800',
    },
  ];

  for (const zone of zones) {
    await upsert('zones', `zone_name = "${zone.zone_name}"`, zone);
    console.log(`Zone ready: ${zone.zone_name}`);
  }
};

const ensureBins = async () => {
  const bins = [
    { street_location: '12 Maple Grove Lane', fill_level: 24, status: 'STABLE' },
    { street_location: '18 Cedar Avenue', fill_level: 48, status: 'STABLE' },
    { street_location: '27 Elm Street', fill_level: 62, status: 'CRITICAL' },
    { street_location: '34 Maple Grove Lane', fill_level: 78, status: 'CRITICAL' },
    { street_location: '05 Cedar Avenue', fill_level: 91, status: 'OVERFLOWING' },
    { street_location: '42 Elm Street', fill_level: 100, status: 'OVERFLOWING' },
  ];

  for (const bin of bins) {
    await upsert('bins', `street_location = "${bin.street_location}"`, {
      ...bin,
      zone_id: 'ZONE-A1',
      ultrasonic_sensor_data: JSON.stringify({ fill: bin.fill_level, battery: 92 }),
      last_cleared: new Date(Date.now() - (bin.fill_level > 80 ? 72 : 12) * 60 * 60 * 1000).toISOString(),
    });
  }
  console.log(`Bins ready: ${bins.length}`);
};

const ensureRewards = async () => {
  const rewards = [
    {
      reward_name: '₹100 Electricity Credit',
      token_cost: 250,
      description: 'Apply a ₹100 credit to your next municipal electricity bill.',
      category: 'electricity',
      redemption_count: 34,
    },
    {
      reward_name: '₹150 Grocery Voucher',
      token_cost: 350,
      description: 'Redeem at participating neighborhood grocery stores.',
      category: 'grocery',
      redemption_count: 21,
    },
    {
      reward_name: 'Compost Starter Kit',
      token_cost: 450,
      description: 'A home composting kit with bin, manual and two weeks of starter mix.',
      category: 'other',
      redemption_count: 12,
    },
    {
      reward_name: 'Tree Plantation Certificate',
      token_cost: 500,
      description: 'Fund a native tree in your name at a city park.',
      category: 'other',
      redemption_count: 8,
    },
  ];

  for (const reward of rewards) {
    await upsert('rewards', `reward_name = "${reward.reward_name}"`, reward);
  }
  console.log(`Rewards ready: ${rewards.length}`);
};

const ensureActiveQRToken = async (citizenUser) => {
  const tokens = await list('bin_qr_tokens', `citizen_id = "${citizenUser.id}"`);
  for (const token of tokens) {
    if (token.qr_token !== BIN_QR_TOKEN || !token.is_active) {
      await update('bin_qr_tokens', token.id, { is_active: false });
    }
  }

  const data = {
    citizen_id: citizenUser.id,
    qr_token: BIN_QR_TOKEN,
    house_address: '12 Maple Grove Lane, Zone A1',
    geofence_lat: GEOFENCE.lat,
    geofence_lng: GEOFENCE.lng,
    is_active: true,
  };

  const existing = tokens.find((token) => token.qr_token === BIN_QR_TOKEN);
  if (existing) {
    return update('bin_qr_tokens', existing.id, data);
  }
  return create('bin_qr_tokens', data);
};

const ensureCivicScore = async (citizenUser) => {
  const score = await upsert('civic_scores', `citizen_id = "${citizenUser.id}"`, {
    citizen_id: citizenUser.id,
    current_score: 640,
    tier_rank: 'Civic Champion',
  });

  const ledgerEntries = await list('civic_score_ledger', `citizen_id = "${citizenUser.id}"`);
  for (const entry of ledgerEntries) await remove('civic_score_ledger', entry.id);

  const history = [
    { points_changed: 30, new_score: 610, reason: 'Accurate_Segregation', timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
    { points_changed: 15, new_score: 625, reason: 'Daily_Pickup_Verified', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
    { points_changed: 15, new_score: 640, reason: 'Daily_Pickup_Verified', timestamp: new Date(Date.now() - 86400000).toISOString() },
  ];

  for (const entry of history) {
    await create('civic_score_ledger', { citizen_id: citizenUser.id, ...entry });
  }

  console.log('Civic score ready: 640 (Civic Champion) with 3 ledger entries');
  return score;
};

const ensureScanHistory = async (driverUser, citizenUser) => {
  const scans = await list('driver_qr_scans', `driver_id = "${driverUser.id}"`);
  for (const scan of scans) await remove('driver_qr_scans', scan.id);

  const samples = [
    { distance: 8.4, status: 'success', valid: true },
    { distance: 12.1, status: 'success', valid: true },
    { distance: 18.7, status: 'success', valid: true },
    { distance: 74.5, status: 'location_mismatch', valid: false },
  ];

  for (const sample of samples) {
    await create('driver_qr_scans', {
      driver_id: driverUser.id,
      citizen_id: citizenUser.id,
      gps_lat_at_scan: GEOFENCE.lat + 0.0001,
      gps_lng_at_scan: GEOFENCE.lng + 0.0001,
      is_location_valid: sample.valid,
      distance_meters: sample.distance,
      scan_status: sample.status,
    });
  }
  console.log('Scan history ready: 4 scans (3 successful, 1 location mismatch)');
};

const ensureRoute = async (driverUser) => {
  const today = new Date().toISOString().slice(0, 10);
  await upsert('routes', `driver_id = "${driverUser.id}" && zone_id = "ZONE-A1"`, {
    driver_id: driverUser.id,
    zone_id: 'ZONE-A1',
    assigned_date: today,
    status: 'active',
    gps_tracking: `${GEOFENCE.lat},${GEOFENCE.lng}`,
    bypass_detected: false,
    collection_status: 'in_progress',
  });
  console.log('Active route ready for ZONE-A1');
};

const ensurePayroll = async (driverUser) => {
  const adjustments = await list('payroll_adjustments', `driver_id = "${driverUser.id}"`);
  for (const adjustment of adjustments) await remove('payroll_adjustments', adjustment.id);

  await create('payroll_adjustments', {
    driver_id: driverUser.id,
    adjustment_date: new Date().toISOString().slice(0, 10),
    strike_count: 0,
    deduction_percentage: 0,
    deduction_amount: 0,
    final_wage: 500,
    reason: 'All routes verified on time; no deductions',
  });
  console.log('Payroll summary ready');
};

const cleanupLegacySeedData = async () => {
  const removals = [];
  const tokens = await list('bin_qr_tokens', 'citizen_id ~ "demo_" || citizen_id = "unknown"');
  const scans = await list('driver_qr_scans', 'citizen_id ~ "demo_" || citizen_id = "unknown"');

  for (const token of tokens) removals.push(remove('bin_qr_tokens', token.id));
  for (const scan of scans) removals.push(remove('driver_qr_scans', scan.id));

  if (removals.length > 0) {
    await Promise.all(removals);
    console.log(`Removed ${removals.length} legacy placeholder record(s)`);
  }
};

const main = async () => {
  console.log(`Seeding PocketBase at ${PB_URL}`);
  await loginSuperuser();

  await cleanupLegacySeedData();

  const users = await ensureUsers();
  const citizen = await ensureCitizen(users.citizen);
  const driver = await ensureDriver(users.driver);

  await ensureZones();
  await ensureBins();
  await ensureRewards();
  await ensureActiveQRToken(users.citizen);
  console.log(`Active bin QR token ready for ${citizen.user_id}`);
  await ensureCivicScore(users.citizen);
  await ensureRoute(driver);
  await ensureScanHistory(users.driver, users.citizen);
  await ensurePayroll(users.driver);

  console.log('\nDemo data ready.');
  console.log('  citizen@demo.local / Demo12345!');
  console.log('  driver@demo.local  / Demo12345!');
  console.log('  admin@demo.local   / Demo12345!');
};

main().catch((error) => {
  console.error('\nSeed failed:', error.message);
  process.exit(1);
});
