// ============================================
// Database Seed Script — Gujarat & Ahmedabad Infrastructure
// Roads & Buildings (RnB) Department Infrastructure
// ============================================

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Gujarat & Ahmedabad RnB infrastructure database...\n');

  // ── Users ─────────────────────────────────
  const hashedAdmin = await bcrypt.hash('admin123', 12);
  const hashedInspector = await bcrypt.hash('inspector123', 12);
  const hashedViewer = await bcrypt.hash('viewer123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@infravault.io' },
    update: {
      name: 'Arjun Mehta',
      role: 'ADMIN',
      department: 'R&B Department, Gujarat State',
    },
    create: {
      email: 'admin@infravault.io',
      password: hashedAdmin,
      name: 'Arjun Mehta',
      role: 'ADMIN',
      department: 'R&B Department, Gujarat State',
      totalPoints: 2840,
      currentLevel: 4,
      currentStreak: 14,
      longestStreak: 32,
    },
  });

  const inspector = await prisma.user.upsert({
    where: { email: 'inspector@infravault.io' },
    update: {
      name: 'Priya Sharma',
      role: 'INSPECTOR',
      department: 'Ahmedabad Circle Field Operations',
    },
    create: {
      email: 'inspector@infravault.io',
      password: hashedInspector,
      name: 'Priya Sharma',
      role: 'INSPECTOR',
      department: 'Ahmedabad Circle Field Operations',
      totalPoints: 1950,
      currentLevel: 3,
      currentStreak: 7,
      longestStreak: 18,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@infravault.io' },
    update: {
      name: 'Rahul Patel',
      role: 'VIEWER',
      department: 'Gandhinagar Planning & GIS Cell',
    },
    create: {
      email: 'viewer@infravault.io',
      password: hashedViewer,
      name: 'Rahul Patel',
      role: 'VIEWER',
      department: 'Gandhinagar Planning & GIS Cell',
      totalPoints: 520,
      currentLevel: 1,
    },
  });

  console.log('✅ Users created / updated (Arjun Mehta, Priya Sharma, Rahul Patel)');

  // ── Badges ────────────────────────────────
  const badges = [
    { code: 'FIRST_LIGHT', name: 'First Light', description: 'Complete your first inspection', icon: '🔍', requirement: '1 inspection', threshold: 1, category: 'inspection' },
    { code: 'ROAD_WARRIOR', name: 'Road Warrior', description: 'Inspect 50 road assets', icon: '🛣️', requirement: '50 road inspections', threshold: 50, category: 'inspection' },
    { code: 'BRIDGE_BUILDER', name: 'Bridge Builder', description: 'Inspect 25 bridges', icon: '🌉', requirement: '25 bridge inspections', threshold: 25, category: 'inspection' },
    { code: 'BUILDING_SURVEYOR', name: 'Building Surveyor', description: 'Inspect 30 buildings', icon: '🏛️', requirement: '30 building inspections', threshold: 30, category: 'inspection' },
    { code: 'FIX_MASTER', name: 'Fix Master', description: 'Close 25 work orders', icon: '🔧', requirement: '25 closed work orders', threshold: 25, category: 'work_order' },
    { code: 'ON_FIRE', name: 'On Fire', description: '7-day inspection streak', icon: '🔥', requirement: '7 consecutive days', threshold: 7, category: 'streak' },
    { code: 'ALL_STAR', name: 'All-Star', description: 'Earn 5000 total points', icon: '⭐', requirement: '5000 points', threshold: 5000, category: 'points' },
    { code: 'LEGEND', name: 'Legend', description: 'Top the leaderboard for a month', icon: '🏆', requirement: '#1 for 30 days', threshold: 30, category: 'leaderboard' },
    { code: 'PIPELINE_PRO', name: 'Pipeline Pro', description: 'Inspect 75 water pipelines', icon: '🔵', requirement: '75 pipeline inspections', threshold: 75, category: 'inspection' },
    { code: 'DRAIN_MASTER', name: 'Drain Master', description: 'Inspect 40 drains', icon: '🌊', requirement: '40 drain inspections', threshold: 40, category: 'inspection' },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: {},
      create: badge,
    });
  }

  console.log('✅ Badges created');

  // ── Authentic Gujarat / Ahmedabad Assets ──
  const sampleAssets = [
    // Bridges
    {
      assetCode: 'BR-2024-0001',
      name: 'Atal Pedestrian Bridge',
      description: 'Iconic foot overbridge on Sabarmati Riverfront connecting Flower Park to Event Ground',
      category: 'BRIDGE',
      status: 'ACTIVE',
      conditionRating: 'EXCELLENT',
      conditionScore: 94,
      latitude: 23.0245,
      longitude: 72.5735,
      address: 'Sabarmati Riverfront, Between Ellis Bridge and Sardar Bridge',
      ward: 'Ward 12 (Navrangpura)',
      zone: 'West Zone, Ahmedabad',
      purchaseCost: 74000000,
      installCost: 15000000,
      currentValue: 68000000,
      criticality: 5,
      installDate: new Date('2022-08-27'),
      expectedEOL: new Date('2072-08-27'),
      riskScore: 6,
      metadata: { structureType: 'Steel Truss Eye-Shaped', spanCount: 3, totalLengthM: 300, widthM: 14, footTrafficDaily: 25000 },
      createdById: admin.id,
    },
    {
      assetCode: 'BR-2024-0002',
      name: 'Nehru Bridge Sabarmati Crossing',
      description: 'Major arterial bridge connecting Ashram Road to Old City Lal Darwaja',
      category: 'BRIDGE',
      status: 'ACTIVE',
      conditionRating: 'GOOD',
      conditionScore: 78,
      latitude: 23.0268,
      longitude: 72.5724,
      address: 'Nehru Bridge, Ashram Road to Lal Darwaja',
      ward: 'Ward 7 (Jamalpur)',
      zone: 'Central Zone, Ahmedabad',
      purchaseCost: 85000000,
      installCost: 20000000,
      currentValue: 52000000,
      criticality: 5,
      installDate: new Date('1962-05-10'),
      expectedEOL: new Date('2045-05-10'),
      riskScore: 24,
      metadata: { structureType: 'Continuous RCC Girder', spanCount: 8, totalLengthM: 420, widthM: 18, loadCapacityT: 70 },
      createdById: admin.id,
    },
    {
      assetCode: 'BR-2024-0003',
      name: 'Ellis Bridge Heritage Structure',
      description: 'Historic century-old bowstring arch truss bridge across Sabarmati',
      category: 'BRIDGE',
      status: 'UNDER_MAINTENANCE',
      conditionRating: 'FAIR',
      conditionScore: 56,
      latitude: 23.0210,
      longitude: 72.5710,
      address: 'Ellisbridge Junction, Paldi to Town Hall',
      ward: 'Ward 10 (Paldi)',
      zone: 'West Zone, Ahmedabad',
      purchaseCost: 35000000,
      installCost: 8000000,
      currentValue: 18000000,
      criticality: 4,
      installDate: new Date('1892-02-01'),
      expectedEOL: new Date('2035-01-01'),
      riskScore: 52,
      metadata: { structureType: 'Wrought Iron Bowstring Arch', spanCount: 4, totalLengthM: 330, widthM: 10, loadCapacityT: 20 },
      createdById: inspector.id,
    },

    // Roads
    {
      assetCode: 'RD-2024-0001',
      name: 'SG Highway 6-Lane Flyover Corridor',
      description: 'High-density arterial NH-147 passing through Thaltej, Pakwan, and ISKCON cross-roads',
      category: 'ROAD',
      status: 'ACTIVE',
      conditionRating: 'EXCELLENT',
      conditionScore: 90,
      latitude: 23.0478,
      longitude: 72.5050,
      address: 'Sarkhej - Gandhinagar Highway, Thaltej',
      ward: 'Ward 24 (Thaltej)',
      zone: 'North West Zone, Ahmedabad',
      purchaseCost: 860000000,
      installCost: 140000000,
      currentValue: 790000000,
      criticality: 5,
      installDate: new Date('2021-12-01'),
      expectedEOL: new Date('2046-12-01'),
      riskScore: 12,
      metadata: { surfaceType: 'Bituminous Concrete', lanes: 6, lengthKm: 14.2, widthM: 28, pcuPerDay: 110000 },
      createdById: admin.id,
    },
    {
      assetCode: 'RD-2024-0002',
      name: 'Sabarmati Riverfront West Promenade Road',
      description: 'Scenic dual carriageway alongside the lower Sabarmati river walkway',
      category: 'ROAD',
      status: 'ACTIVE',
      conditionRating: 'GOOD',
      conditionScore: 84,
      latitude: 23.0410,
      longitude: 72.5768,
      address: 'West Riverfront Road, Usmanpura to Subhash Bridge',
      ward: 'Ward 15 (Usmanpura)',
      zone: 'West Zone, Ahmedabad',
      purchaseCost: 120000000,
      installCost: 25000000,
      currentValue: 98000000,
      criticality: 4,
      installDate: new Date('2017-06-15'),
      expectedEOL: new Date('2042-06-15'),
      riskScore: 18,
      metadata: { surfaceType: 'Dense Bituminous Macadam', lanes: 4, lengthKm: 5.8, widthM: 16 },
      createdById: admin.id,
    },
    {
      assetCode: 'RD-2024-0003',
      name: 'Sardar Patel Ring Road (Bopal Junction)',
      description: 'Major circumferential expressway around Ahmedabad metropolitan area',
      category: 'ROAD',
      status: 'ACTIVE',
      conditionRating: 'FAIR',
      conditionScore: 62,
      latitude: 22.9985,
      longitude: 72.4820,
      address: 'SP Ring Road, South Bopal Flyover Underpass',
      ward: 'Ward 31 (Bopal-Ghuma)',
      zone: 'South West Zone, Ahmedabad',
      purchaseCost: 350000000,
      installCost: 65000000,
      currentValue: 240000000,
      criticality: 5,
      installDate: new Date('2015-04-10'),
      expectedEOL: new Date('2038-04-10'),
      riskScore: 38,
      metadata: { surfaceType: 'Mastic Asphalt', lanes: 6, lengthKm: 8.5, widthM: 24 },
      createdById: inspector.id,
    },
    {
      assetCode: 'RD-2024-0004',
      name: 'Sindhu Bhavan Commercial Boulevard',
      description: 'Prime urban corridor connecting SG Highway to Sardar Patel Ring Road',
      category: 'ROAD',
      status: 'ACTIVE',
      conditionRating: 'EXCELLENT',
      conditionScore: 92,
      latitude: 23.0420,
      longitude: 72.5075,
      address: 'Sindhu Bhavan Road, Bodakdev',
      ward: 'Ward 22 (Bodakdev)',
      zone: 'North West Zone, Ahmedabad',
      purchaseCost: 95000000,
      installCost: 18000000,
      currentValue: 88000000,
      criticality: 4,
      installDate: new Date('2022-03-20'),
      expectedEOL: new Date('2047-03-20'),
      riskScore: 8,
      metadata: { surfaceType: 'Micro-surfaced Asphalt', lanes: 4, lengthKm: 3.4, widthM: 18 },
      createdById: admin.id,
    },

    // Buildings
    {
      assetCode: 'BL-2024-0001',
      name: 'Gujarat R&B Department Secretariat Block',
      description: 'State government engineering headquarters and infrastructure control center',
      category: 'BUILDING',
      status: 'ACTIVE',
      conditionRating: 'EXCELLENT',
      conditionScore: 95,
      latitude: 23.2156,
      longitude: 72.6369,
      address: 'Block 14, Sardar Bhavan, New Sachivalaya, Gandhinagar',
      ward: 'Sector 10',
      zone: 'Gandhinagar Capital Zone',
      purchaseCost: 450000000,
      installCost: 60000000,
      currentValue: 390000000,
      criticality: 5,
      installDate: new Date('2018-09-01'),
      expectedEOL: new Date('2078-09-01'),
      riskScore: 5,
      metadata: { floors: 8, totalAreaSqM: 18500, constructionType: 'RCC Earthquake Resistant Frame', occupancy: 'Government R&B Directorate' },
      createdById: admin.id,
    },
    {
      assetCode: 'BL-2024-0002',
      name: 'Ahmedabad RnB Circle Executive Headquarters',
      description: 'Regional executive engineering division and jurisdictional lab',
      category: 'BUILDING',
      status: 'ACTIVE',
      conditionRating: 'GOOD',
      conditionScore: 76,
      latitude: 23.0180,
      longitude: 72.5620,
      address: 'Near Mahalaxmi Cross Roads, Paldi, Ahmedabad',
      ward: 'Ward 10 (Paldi)',
      zone: 'West Zone, Ahmedabad',
      purchaseCost: 120000000,
      installCost: 15000000,
      currentValue: 92000000,
      criticality: 4,
      installDate: new Date('2011-02-14'),
      expectedEOL: new Date('2061-02-14'),
      riskScore: 22,
      metadata: { floors: 4, totalAreaSqM: 4200, constructionType: 'RCC Frame', occupancy: 'Division Office & Testing Lab' },
      createdById: admin.id,
    },

    // Streetlights
    {
      assetCode: 'SL-2024-0001',
      name: 'Riverfront Smart LED High-Mast Tower #R1',
      description: 'Connected telemetry high-mast lighting illuminating the riverfront amphitheater',
      category: 'STREETLIGHT',
      status: 'ACTIVE',
      conditionRating: 'EXCELLENT',
      conditionScore: 96,
      latitude: 23.0295,
      longitude: 72.5790,
      address: 'East Riverfront Promenade, Near Subhash Bridge',
      ward: 'Ward 6 (Dudheshwar)',
      zone: 'Central Zone, Ahmedabad',
      purchaseCost: 350000,
      installCost: 50000,
      currentValue: 320000,
      criticality: 3,
      installDate: new Date('2023-01-10'),
      expectedEOL: new Date('2038-01-10'),
      riskScore: 4,
      metadata: { wattage: 400, poleHeight: 25, type: 'LED Smart Mast', solarPowered: false, automatedDimming: true },
      createdById: admin.id,
    },
    {
      assetCode: 'SL-2024-0002',
      name: 'Koba Circle Solar High-Mast #KB4',
      description: 'Solar hybrid high-mast lighting system on Gandhinagar-Ahmedabad Highway intersection',
      category: 'STREETLIGHT',
      status: 'ACTIVE',
      conditionRating: 'GOOD',
      conditionScore: 82,
      latitude: 23.1534,
      longitude: 72.6278,
      address: 'Koba Circle, Gandhinagar Highway',
      ward: 'Koba Ward',
      zone: 'Gandhinagar South',
      purchaseCost: 280000,
      installCost: 45000,
      currentValue: 240000,
      criticality: 3,
      installDate: new Date('2022-05-18'),
      expectedEOL: new Date('2037-05-18'),
      riskScore: 14,
      metadata: { wattage: 250, poleHeight: 18, type: 'Solar Hybrid LED', solarPowered: true },
      createdById: inspector.id,
    },

    // Water Pipelines
    {
      assetCode: 'WP-2024-0001',
      name: 'Kotarpur Water Works Transmission Main',
      description: 'Primary raw and treated water feeder conduit from Kotarpur Treatment Plant to North Ahmedabad',
      category: 'WATER_PIPELINE',
      status: 'ACTIVE',
      conditionRating: 'GOOD',
      conditionScore: 75,
      latitude: 23.0850,
      longitude: 72.6210,
      address: 'Kotarpur Water Works Trunk Route, Naroda',
      ward: 'Ward 18 (Naroda)',
      zone: 'North Zone, Ahmedabad',
      purchaseCost: 180000000,
      installCost: 40000000,
      currentValue: 145000000,
      criticality: 5,
      installDate: new Date('2016-10-05'),
      expectedEOL: new Date('2056-10-05'),
      riskScore: 20,
      metadata: { material: 'Mild Steel Mortar Lined', diameterMm: 1200, lengthKm: 11.5, pressureBar: 10, depthM: 2.5 },
      createdById: admin.id,
    },
    {
      assetCode: 'WP-2024-0002',
      name: 'Raska-Maninagar Southern Pipeline Grid',
      description: 'High-pressure distribution main supplying South Ahmedabad and Vatva industrial zone',
      category: 'WATER_PIPELINE',
      status: 'UNDER_MAINTENANCE',
      conditionRating: 'POOR',
      conditionScore: 36,
      latitude: 22.9980,
      longitude: 72.6050,
      address: 'Maninagar East to Vatva GIDC Junction',
      ward: 'Ward 28 (Maninagar)',
      zone: 'South Zone, Ahmedabad',
      purchaseCost: 95000000,
      installCost: 22000000,
      currentValue: 42000000,
      criticality: 4,
      installDate: new Date('2009-07-15'),
      expectedEOL: new Date('2034-07-15'),
      riskScore: 68,
      metadata: { material: 'Ductile Iron (DI)', diameterMm: 600, lengthKm: 7.2, pressureBar: 7, depthM: 1.8 },
      createdById: inspector.id,
    },

    // Drains
    {
      assetCode: 'DR-2024-0001',
      name: 'Vadaj Stormwater Trunk Drain Outfall',
      description: 'Reinforced concrete box culvert discharging north-west catchment runoff into Sabarmati',
      category: 'DRAIN',
      status: 'ACTIVE',
      conditionRating: 'FAIR',
      conditionScore: 54,
      latitude: 23.0580,
      longitude: 72.5710,
      address: 'Old Vadaj Circle to Riverfront West Outfall',
      ward: 'Ward 14 (Vadaj)',
      zone: 'West Zone, Ahmedabad',
      purchaseCost: 65000000,
      installCost: 15000000,
      currentValue: 40000000,
      criticality: 4,
      installDate: new Date('2014-08-20'),
      expectedEOL: new Date('2044-08-20'),
      riskScore: 45,
      metadata: { drainType: 'Covered RCC Box Culvert', widthM: 4.0, depthM: 2.5, lengthKm: 3.8, catchmentAreaSqKm: 6.5 },
      createdById: inspector.id,
    },

    // Footpaths
    {
      assetCode: 'FP-2024-0001',
      name: 'CG Road Pedestrian Urban Corridor',
      description: 'Wide paved pedestrian path with tactile pavers, street furniture, and disability ramps',
      category: 'FOOTPATH',
      status: 'ACTIVE',
      conditionRating: 'EXCELLENT',
      conditionScore: 88,
      latitude: 23.0330,
      longitude: 72.5590,
      address: 'Chimanlal Girdharlal (CG) Road, Navrangpura',
      ward: 'Ward 12 (Navrangpura)',
      zone: 'West Zone, Ahmedabad',
      purchaseCost: 14000000,
      installCost: 3500000,
      currentValue: 11500000,
      criticality: 3,
      installDate: new Date('2021-09-10'),
      expectedEOL: new Date('2036-09-10'),
      riskScore: 10,
      metadata: { surfaceType: 'Granite & Tactile Cobblestone', widthM: 3.5, lengthKm: 2.8, hasRamp: true, hasRailing: true },
      createdById: admin.id,
    },
    // Additional 10 Gujarat & Ahmedabad Infrastructure Assets
    {
      assetCode: 'BR-2024-0004',
      name: 'Subhash Bridge Riverfront Viaduct',
      description: 'Major transit connector linking Usmanpura and Shahibaug across northern Sabarmati Riverfront',
      category: 'BRIDGE',
      status: 'ACTIVE',
      conditionRating: 'GOOD',
      conditionScore: 82,
      latitude: 23.0642,
      longitude: 72.5802,
      address: 'Subhash Bridge Circle, Shahibaug to Keshavnagar',
      ward: 'Ward 15 (Shahibaug)',
      zone: 'North Zone, Ahmedabad',
      purchaseCost: 145000000,
      installCost: 28000000,
      currentValue: 110000000,
      criticality: 5,
      installDate: new Date('1973-11-14'),
      expectedEOL: new Date('2050-11-14'),
      riskScore: 22,
      metadata: { structureType: 'RCC Box Girder', spanCount: 9, totalLengthM: 480, widthM: 22, loadCapacityT: 80 },
      createdById: admin.id,
    },
    {
      assetCode: 'BR-2024-0005',
      name: 'Sardar Bridge Sabarmati Lifeline',
      description: 'Heavily trafficked southern riverfront crossing connecting Paldi and Jamalpur market nodes',
      category: 'BRIDGE',
      status: 'ACTIVE',
      conditionRating: 'FAIR',
      conditionScore: 68,
      latitude: 23.0135,
      longitude: 72.5684,
      address: 'Sardar Bridge, Paldi to Calico Mills',
      ward: 'Ward 10 (Paldi)',
      zone: 'Central Zone, Ahmedabad',
      purchaseCost: 98000000,
      installCost: 19000000,
      currentValue: 62000000,
      criticality: 5,
      installDate: new Date('1939-01-20'),
      expectedEOL: new Date('2040-01-20'),
      riskScore: 38,
      metadata: { structureType: 'Arch Cantilever Concrete', spanCount: 6, totalLengthM: 380, widthM: 18, loadCapacityT: 60 },
      createdById: inspector.id,
    },
    {
      assetCode: 'BR-2024-0006',
      name: 'Shastri Bridge Industrial Heavy Bypass',
      description: 'Critical freight corridor bridge over Sabarmati connecting Narol and Sarkhej industrial highways',
      category: 'BRIDGE',
      status: 'UNDER_MAINTENANCE',
      conditionRating: 'CRITICAL',
      conditionScore: 42,
      latitude: 22.9860,
      longitude: 72.5620,
      address: 'National Highway 8A, Narol to Vishala',
      ward: 'Ward 30 (Narol)',
      zone: 'South Zone, Ahmedabad',
      purchaseCost: 160000000,
      installCost: 35000000,
      currentValue: 78000000,
      criticality: 5,
      installDate: new Date('1981-04-12'),
      expectedEOL: new Date('2038-04-12'),
      riskScore: 78,
      metadata: { structureType: 'Prestressed Concrete Girder', spanCount: 11, totalLengthM: 520, widthM: 24, loadCapacityT: 90 },
      createdById: inspector.id,
    },
    {
      assetCode: 'RD-2024-0004',
      name: 'Sanand GIDC Heavy Industrial Expressway',
      description: 'Dedicated multi-axle freight highway linking Ahmedabad western periphery to Sanand Automobile Hub',
      category: 'ROAD',
      status: 'ACTIVE',
      conditionRating: 'GOOD',
      conditionScore: 79,
      latitude: 22.9850,
      longitude: 72.3800,
      address: 'Sanand Industrial Estate Main Arterial, Sanand GIDC',
      ward: 'Sanand Taluka Industrial Corridor',
      zone: 'West Rural Circle, Ahmedabad',
      purchaseCost: 320000000,
      installCost: 55000000,
      currentValue: 285000000,
      criticality: 4,
      installDate: new Date('2018-03-25'),
      expectedEOL: new Date('2048-03-25'),
      riskScore: 26,
      metadata: { surfaceType: 'Rigid Concrete Pavement', lanes: 4, lengthKm: 18.5, widthM: 20, pcuPerDay: 45000 },
      createdById: admin.id,
    },
    {
      assetCode: 'RD-2024-0005',
      name: 'Sardar Patel Ring Road South Elevated Corridor',
      description: 'Grade-separated orbital highway managing bypass transit around southern municipal limits',
      category: 'ROAD',
      status: 'ACTIVE',
      conditionRating: 'EXCELLENT',
      conditionScore: 92,
      latitude: 22.9710,
      longitude: 72.5180,
      address: 'SP Ring Road, Bopal - Sanathal - Sarkhej Junction',
      ward: 'Ward 25 (Bopal)',
      zone: 'South West Zone, Ahmedabad',
      purchaseCost: 650000000,
      installCost: 110000000,
      currentValue: 610000000,
      criticality: 5,
      installDate: new Date('2022-11-15'),
      expectedEOL: new Date('2052-11-15'),
      riskScore: 8,
      metadata: { surfaceType: 'Superpave Bituminous Concrete', lanes: 6, lengthKm: 22.0, widthM: 30, pcuPerDay: 95000 },
      createdById: admin.id,
    },
    {
      assetCode: 'RD-2024-0006',
      name: 'Gandhinagar CH-0 Capital Circle Underpass',
      description: 'Modern subterranean underpass streamlining VIP state government and diplomatic traffic',
      category: 'ROAD',
      status: 'ACTIVE',
      conditionRating: 'EXCELLENT',
      conditionScore: 95,
      latitude: 23.2156,
      longitude: 72.6369,
      address: 'CH Road at Sector 1 - Sector 10 Circle, Gandhinagar',
      ward: 'Sector 10 Administrative Ward',
      zone: 'Gandhinagar Capital Circle',
      purchaseCost: 180000000,
      installCost: 32000000,
      currentValue: 172000000,
      criticality: 4,
      installDate: new Date('2023-01-10'),
      expectedEOL: new Date('2058-01-10'),
      riskScore: 5,
      metadata: { surfaceType: 'Reinforced Concrete with Epoxy Coating', lanes: 4, lengthKm: 1.2, widthM: 18, pcuPerDay: 35000 },
      createdById: admin.id,
    },
    {
      assetCode: 'BL-2024-0003',
      name: 'Swarnim Sankul Gujarat State Secretariat',
      description: 'Flagship executive secretariat complex housing the Cabinet and R&B administrative headquarters',
      category: 'BUILDING',
      status: 'ACTIVE',
      conditionRating: 'EXCELLENT',
      conditionScore: 96,
      latitude: 23.2240,
      longitude: 72.6575,
      address: 'Swarnim Sankul-1, Sector 10, Gandhinagar',
      ward: 'Sector 10 Capital Complex',
      zone: 'Gandhinagar Capital Circle',
      purchaseCost: 1250000000,
      installCost: 180000000,
      currentValue: 1200000000,
      criticality: 5,
      installDate: new Date('2014-04-14'),
      expectedEOL: new Date('2074-04-14'),
      riskScore: 4,
      metadata: { buildingType: 'State Executive Secretariat', floors: 4, totalAreaSqM: 45000, fireSafetyCertified: true, seismicZone: 'Zone III' },
      createdById: admin.id,
    },
    {
      assetCode: 'WP-2024-0003',
      name: 'Kotarpur 600 MLD Transmission Trunk Grid',
      description: 'High-pressure treated potable water transmission feeder pipeline supplying north-eastern Ahmedabad',
      category: 'WATER_PIPELINE',
      status: 'ACTIVE',
      conditionRating: 'GOOD',
      conditionScore: 81,
      latitude: 23.0850,
      longitude: 72.6320,
      address: 'Kotarpur Water Works to Naroda Reservoir',
      ward: 'Ward 20 (Naroda)',
      zone: 'North Zone, Ahmedabad',
      purchaseCost: 210000000,
      installCost: 42000000,
      currentValue: 175000000,
      criticality: 5,
      installDate: new Date('2016-10-05'),
      expectedEOL: new Date('2046-10-05'),
      riskScore: 20,
      metadata: { material: 'Mild Steel Spiral Welded (MS)', diameterMm: 1200, lengthKm: 12.4, pressureBar: 10, depthM: 2.5 },
      createdById: inspector.id,
    },
    {
      assetCode: 'DR-2024-0002',
      name: 'C.G. Road Smart Stormwater Drainage Network',
      description: 'Sub-surface high-velocity drainage channels with automated telemetry water-level sensors',
      category: 'DRAIN',
      status: 'ACTIVE',
      conditionRating: 'EXCELLENT',
      conditionScore: 89,
      latitude: 23.0315,
      longitude: 72.5580,
      address: 'CG Road, Stadium Circle to Panchvati',
      ward: 'Ward 12 (Navrangpura)',
      zone: 'West Zone, Ahmedabad',
      purchaseCost: 85000000,
      installCost: 18000000,
      currentValue: 79000000,
      criticality: 4,
      installDate: new Date('2021-08-15'),
      expectedEOL: new Date('2051-08-15'),
      riskScore: 11,
      metadata: { drainType: 'Precast Modular RCC Trench', widthM: 2.2, depthM: 1.8, lengthKm: 3.2, catchmentAreaSqKm: 4.8 },
      createdById: inspector.id,
    },
    {
      assetCode: 'FP-2024-0002',
      name: 'Sabarmati Riverfront Promenade Walkway (East Bank)',
      description: 'Continuous waterfront pedestrian boulevard with stone paving, benches, and urban forestry',
      category: 'FOOTPATH',
      status: 'ACTIVE',
      conditionRating: 'EXCELLENT',
      conditionScore: 91,
      latitude: 23.0310,
      longitude: 72.5795,
      address: 'East Riverfront Promenade, Subhash Bridge to Ellis Bridge',
      ward: 'Ward 8 (Shahpur)',
      zone: 'Central Zone, Ahmedabad',
      purchaseCost: 35000000,
      installCost: 7500000,
      currentValue: 31000000,
      criticality: 3,
      installDate: new Date('2019-12-20'),
      expectedEOL: new Date('2044-12-20'),
      riskScore: 8,
      metadata: { surfaceType: 'Dholpur Sandstone & Terrazzo', widthM: 6.0, lengthKm: 5.5, hasRamp: true, hasRailing: true },
      createdById: admin.id,
    },
  ];

  const createdAssetsMap = {};

  for (const assetData of sampleAssets) {
    const asset = await prisma.asset.upsert({
      where: { assetCode: assetData.assetCode },
      update: assetData,
      create: assetData,
    });
    createdAssetsMap[asset.assetCode] = asset;

    await prisma.assetLifecycleEvent.create({
      data: {
        assetId: asset.id,
        toStatus: asset.status,
        notes: `Asset initialized in Gujarat RnB Directory: ${asset.name}`,
        changedBy: admin.id,
      },
    });
  }

  console.log(`✅ ${sampleAssets.length} Gujarat & Ahmedabad assets created / updated with accurate GPS coords`);

  // Ensure ALL legacy unassigned work orders are assigned to authorized engineer
  await prisma.workOrder.updateMany({
    where: { assigneeId: null },
    data: { assigneeId: inspector.id },
  });

  // ── Work Orders ───────────────────────────
  const atalBridge = createdAssetsMap['BR-2024-0001'];
  const ellisBridge = createdAssetsMap['BR-2024-0003'];
  const sgHighway = createdAssetsMap['RD-2024-0001'];
  const raskaPipe = createdAssetsMap['WP-2024-0002'];
  const shastriBridge = createdAssetsMap['BR-2024-0006'];
  const subhashBridge = createdAssetsMap['BR-2024-0004'];
  const sardarBridge = createdAssetsMap['BR-2024-0005'];
  const sanandExp = createdAssetsMap['RD-2024-0004'];
  const spRing = createdAssetsMap['RD-2024-0005'];
  const kotarpurPipe = createdAssetsMap['WP-2024-0003'];
  const cgDrain = createdAssetsMap['DR-2024-0002'];

  if (atalBridge) {
    await prisma.workOrder.upsert({
      where: { orderCode: 'WO-2024-0010' },
      update: { assigneeId: inspector.id },
      create: {
        orderCode: 'WO-2024-0010',
        title: 'Quarterly Tensile Cable & Bearing Inspection',
        description: 'Comprehensive non-destructive testing of stay cable tension and elastomer bearings on Atal Bridge',
        type: 'PREVENTIVE',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        assetId: atalBridge.id,
        assigneeId: inspector.id,
        createdById: admin.id,
        dueDate: new Date(Date.now() + 7 * 86400000),
        estimatedCost: 180000,
        startedAt: new Date(),
        notes: 'Ultrasonic inspection equipment scheduled for Thursday morning.',
      },
    });
  }

  if (ellisBridge) {
    await prisma.workOrder.upsert({
      where: { orderCode: 'WO-2024-0011' },
      update: { assigneeId: inspector.id },
      create: {
        orderCode: 'WO-2024-0011',
        title: 'Heritage Truss Structural Reinforcement',
        description: 'Corrosion sandblasting, zinc chromate priming, and structural member replacement on historical arch',
        type: 'CORRECTIVE',
        priority: 'HIGH',
        status: 'OPEN',
        assetId: ellisBridge.id,
        assigneeId: inspector.id,
        createdById: admin.id,
        dueDate: new Date(Date.now() + 14 * 86400000),
        estimatedCost: 450000,
        notes: 'Requires traffic diversion approval from Ahmedabad City Police.',
      },
    });
  }

  if (raskaPipe) {
    await prisma.workOrder.upsert({
      where: { orderCode: 'WO-2024-0012' },
      update: { assigneeId: inspector.id },
      create: {
        orderCode: 'WO-2024-0012',
        title: 'Vatva Section Pressure Valve Overhaul',
        description: 'Urgent leak mitigation and valve replacement on 600mm DI line',
        type: 'EMERGENCY',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        assetId: raskaPipe.id,
        assigneeId: inspector.id,
        createdById: admin.id,
        dueDate: new Date(Date.now() + 2 * 86400000),
        estimatedCost: 120000,
        startedAt: new Date(),
        notes: 'Excavation team on-site at Vatva cross-junction.',
      },
    });
  }

  if (sgHighway) {
    await prisma.workOrder.upsert({
      where: { orderCode: 'WO-2024-0013' },
      update: { assigneeId: inspector.id },
      create: {
        orderCode: 'WO-2024-0013',
        title: 'Expansion Joint Resealing at Thaltej Flyover',
        description: 'Periodic elastomer seal replacement to prevent monsoon seepage',
        type: 'PREVENTIVE',
        priority: 'LOW',
        status: 'COMPLETED',
        assetId: sgHighway.id,
        assigneeId: inspector.id,
        createdById: admin.id,
        completedAt: new Date(Date.now() - 3 * 86400000),
        actualCost: 85000,
        estimatedCost: 90000,
        notes: 'Completed ahead of schedule with zero daytime lane closures.',
      },
    });
  }

  // New Work Orders for newly seeded Gujarat assets
  if (shastriBridge) {
    await prisma.workOrder.upsert({
      where: { orderCode: 'WO-2024-0014' },
      update: { assigneeId: inspector.id },
      create: {
        orderCode: 'WO-2024-0014',
        title: 'Shastri Bridge Pier Girder Epoxy Grouting',
        description: 'Emergency structural crack injection and seismic bearing jacketing on Pier P-4',
        type: 'EMERGENCY',
        priority: 'CRITICAL',
        status: 'OPEN',
        assetId: shastriBridge.id,
        assigneeId: inspector.id,
        createdById: admin.id,
        dueDate: new Date(Date.now() + 4 * 86400000),
        estimatedCost: 620000,
        notes: 'Heavy commercial vehicles restricted to 30 km/h during repair cycle.',
      },
    });
  }

  if (subhashBridge) {
    await prisma.workOrder.upsert({
      where: { orderCode: 'WO-2024-0015' },
      update: { assigneeId: inspector.id },
      create: {
        orderCode: 'WO-2024-0015',
        title: 'Subhash Bridge River Pier Scour Protection',
        description: 'Underwater sonar profiling and riprap boulder deployment around northern river abutments',
        type: 'PREVENTIVE',
        priority: 'HIGH',
        status: 'OPEN',
        assetId: subhashBridge.id,
        assigneeId: inspector.id,
        createdById: admin.id,
        dueDate: new Date(Date.now() + 10 * 86400000),
        estimatedCost: 380000,
        notes: 'Contractor mobilized with barge and hydrographic sonar equipment.',
      },
    });
  }

  if (sardarBridge) {
    await prisma.workOrder.upsert({
      where: { orderCode: 'WO-2024-0016' },
      update: { assigneeId: inspector.id },
      create: {
        orderCode: 'WO-2024-0016',
        title: 'Sardar Bridge Wearing Course Bituminous Overlay',
        description: 'Milling 40mm damaged asphalt and laying high-strength stone mastic asphalt',
        type: 'CORRECTIVE',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        assetId: sardarBridge.id,
        assigneeId: inspector.id,
        createdById: admin.id,
        dueDate: new Date(Date.now() + 6 * 86400000),
        estimatedCost: 290000,
        startedAt: new Date(),
        notes: 'Night work scheduled between 11:00 PM and 5:00 AM.',
      },
    });
  }

  if (sanandExp) {
    await prisma.workOrder.upsert({
      where: { orderCode: 'WO-2024-0017' },
      update: { assigneeId: inspector.id },
      create: {
        orderCode: 'WO-2024-0017',
        title: 'Sanand Freight Expressway Heavy Shoulder Stabilization',
        description: 'Grading and compaction of unpaved shoulder to prevent edge drop-offs for container trucks',
        type: 'PREVENTIVE',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        assetId: sanandExp.id,
        assigneeId: inspector.id,
        createdById: admin.id,
        dueDate: new Date(Date.now() + 8 * 86400000),
        estimatedCost: 175000,
        startedAt: new Date(),
        notes: 'Motor graders dispatched to km 8 through 14.',
      },
    });
  }

  if (spRing) {
    await prisma.workOrder.upsert({
      where: { orderCode: 'WO-2024-0018' },
      update: { assigneeId: admin.id },
      create: {
        orderCode: 'WO-2024-0018',
        title: 'SP Ring Road Smart Solar Signage & Retroreflective Glare Screens',
        description: 'Installation of high-intensity micro-prismatic caution boards and median anti-glare louvers',
        type: 'PREVENTIVE',
        priority: 'LOW',
        status: 'COMPLETED',
        assetId: spRing.id,
        assigneeId: admin.id,
        createdById: admin.id,
        completedAt: new Date(Date.now() - 2 * 86400000),
        actualCost: 140000,
        estimatedCost: 150000,
        notes: 'Verified compliance with Indian Roads Congress (IRC) safety norms.',
      },
    });
  }

  if (kotarpurPipe) {
    await prisma.workOrder.upsert({
      where: { orderCode: 'WO-2024-0019' },
      update: { assigneeId: inspector.id },
      create: {
        orderCode: 'WO-2024-0019',
        title: 'Kotarpur 1200mm Transmission Sluice Actuator Service',
        description: 'Lubrication, motor calibration, and remote SCADA telemetry sync on master valve',
        type: 'PREVENTIVE',
        priority: 'MEDIUM',
        status: 'COMPLETED',
        assetId: kotarpurPipe.id,
        assigneeId: inspector.id,
        createdById: admin.id,
        completedAt: new Date(Date.now() - 4 * 86400000),
        actualCost: 65000,
        estimatedCost: 70000,
        notes: 'SCADA telemetry feed back to 100% signal strength.',
      },
    });
  }

  if (cgDrain) {
    await prisma.workOrder.upsert({
      where: { orderCode: 'WO-2024-0020' },
      update: { assigneeId: inspector.id },
      create: {
        orderCode: 'WO-2024-0020',
        title: 'Pre-Monsoon High Velocity Jetting of CG Road Sump Network',
        description: 'Desilting and suction extraction of storm sumps from Stadium Circle to Panchvati',
        type: 'PREVENTIVE',
        priority: 'HIGH',
        status: 'OPEN',
        assetId: cgDrain.id,
        assigneeId: inspector.id,
        createdById: admin.id,
        dueDate: new Date(Date.now() + 12 * 86400000),
        estimatedCost: 210000,
        notes: 'Coordination underway with AMC Drainage Engineering Department.',
      },
    });
  }

  console.log('✅ Realistic Work Orders created');

  // ── Inspections ───────────────────────────
  if (atalBridge) {
    await prisma.inspection.upsert({
      where: { inspectionCode: 'INS-2024-0010' },
      update: {},
      create: {
        inspectionCode: 'INS-2024-0010',
        assetId: atalBridge.id,
        inspectorId: inspector.id,
        conditionScore: 94,
        conditionRating: 'EXCELLENT',
        findings: { cableDeflectionMm: 2.1, surfaceWearPercent: 3, vibrationHz: 1.2 },
        notes: 'Atal Bridge structure is in pristine condition. No microfractures detected.',
        recommendations: 'Continue quarterly baseline telemetry checks.',
        inspectedAt: new Date(Date.now() - 5 * 86400000),
      },
    });
  }

  if (ellisBridge) {
    await prisma.inspection.upsert({
      where: { inspectionCode: 'INS-2024-0011' },
      update: {},
      create: {
        inspectionCode: 'INS-2024-0011',
        assetId: ellisBridge.id,
        inspectorId: inspector.id,
        conditionScore: 56,
        conditionRating: 'FAIR',
        findings: { rustGrade: 'Moderate', rivetLoosenessCount: 14, deckSaggingMm: 12 },
        notes: 'Corrosion observed on secondary diagonal bracings near pier 2.',
        recommendations: 'Execute anti-rust sandblasting and reinforce lower flange.',
        inspectedAt: new Date(Date.now() - 10 * 86400000),
      },
    });
  }

  console.log('✅ Inspections created');

  // ── In-App Notifications ──────────────────
  const initialNotifications = [
    {
      userId: admin.id,
      type: 'ASSET_CRITICAL',
      title: 'Critical Infrastructure Alert',
      message: 'Raska-Maninagar Southern Pipeline Grid reported high risk score (68/100). Emergency work order dispatched.',
      link: '/work-orders',
      isRead: false,
    },
    {
      userId: admin.id,
      type: 'WORK_ORDER_COMPLETED',
      title: 'Work Order Completed',
      message: 'Expansion Joint Resealing at Thaltej Flyover (WO-2024-0013) has been closed by Priya Sharma.',
      link: '/work-orders',
      isRead: false,
    },
    {
      userId: admin.id,
      type: 'SYSTEM',
      title: 'Gujarat R&B GIS Sync Complete',
      message: 'All 15 Ahmedabad metropolitan municipal assets mapped with live GPS coordinates.',
      link: '/map',
      isRead: true,
    },
    {
      userId: inspector.id,
      type: 'WORK_ORDER_ASSIGNED',
      title: 'Assigned: Pressure Valve Overhaul',
      message: 'You have been assigned emergency order WO-2024-0012 for Raska-Maninagar Southern Pipeline.',
      link: '/work-orders',
      isRead: false,
    },
    {
      userId: inspector.id,
      type: 'INSPECTION_DUE',
      title: 'Scheduled Inspection Due',
      message: 'Quarterly Tensile Cable & Bearing Inspection due on Atal Pedestrian Bridge.',
      link: '/inspections',
      isRead: false,
    },
  ];

  for (const n of initialNotifications) {
    await prisma.notification.create({
      data: n,
    });
  }

  console.log(`✅ ${initialNotifications.length} in-app notifications created`);

  console.log('\n🎉 Gujarat & Ahmedabad RnB Database seeded successfully!');
  console.log('\n📧 Demo Credentials:');
  console.log('   Executive Engineer (Admin):  admin@infravault.io / admin123');
  console.log('   Site Inspector:              inspector@infravault.io / inspector123');
  console.log('   Planning Officer (Viewer):   viewer@infravault.io / viewer123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
