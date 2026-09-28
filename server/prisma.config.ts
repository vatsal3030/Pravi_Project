// ============================================
// Prisma Config — Prisma v7+
// Connection URLs for Supabase PostgreSQL
// ============================================

import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),

  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },

  migrate: {
    async url() {
      return process.env.DIRECT_URL;
    },
  },

  studio: {
    async url() {
      return process.env.DIRECT_URL;
    },
  },
});
