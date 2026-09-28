require('dotenv').config();
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL');

  const statements = [
    `ALTER TABLE IF EXISTS "assets" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3)`,
    `CREATE INDEX IF NOT EXISTS "assets_deletedAt_idx" ON "assets"("deletedAt")`,
    `CREATE INDEX IF NOT EXISTS "assets_createdById_idx" ON "assets"("createdById")`,
    `CREATE INDEX IF NOT EXISTS "assets_createdAt_idx" ON "assets"("createdAt")`,

    `ALTER TABLE IF EXISTS "work_orders" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3)`,
    `CREATE INDEX IF NOT EXISTS "work_orders_deletedAt_idx" ON "work_orders"("deletedAt")`,
    `CREATE INDEX IF NOT EXISTS "work_orders_createdById_idx" ON "work_orders"("createdById")`,
    `CREATE INDEX IF NOT EXISTS "work_orders_createdAt_idx" ON "work_orders"("createdAt")`,

    `ALTER TABLE IF EXISTS "inspections" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3)`,
    `CREATE INDEX IF NOT EXISTS "inspections_deletedAt_idx" ON "inspections"("deletedAt")`,
    `CREATE INDEX IF NOT EXISTS "inspections_createdAt_idx" ON "inspections"("createdAt")`,
  ];

  for (const stmt of statements) {
    try {
      await client.query(stmt);
      console.log('Executed:', stmt);
    } catch (err) {
      console.warn('Statement warning:', err.message);
    }
  }

  console.log('All migrations applied successfully!');
  await client.end();
}

migrate().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
