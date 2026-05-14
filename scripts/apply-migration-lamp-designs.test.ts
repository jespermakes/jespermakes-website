/**
 * Tests for the lamp-designs migration script logic.
 *
 * Validates that the migration SQL file exists, parses correctly,
 * and contains the expected statements. No database required.
 *
 *   npx tsx scripts/apply-migration-lamp-designs.test.ts
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const migrationPath = resolve(process.cwd(), "drizzle/0013_ambitious_pixie.sql");

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passed += 1;
  } else {
    console.error(`  FAIL: ${message}`);
    failed += 1;
  }
}

console.log("Testing apply-migration-lamp-designs\n");

// Test 1: Migration file exists
assert(existsSync(migrationPath), "Migration file 0013_ambitious_pixie.sql exists");

// Test 2: File is readable and non-empty
const raw = readFileSync(migrationPath, "utf8");
assert(raw.length > 0, "Migration file is non-empty");

// Test 3: Splits into expected number of statements
const statements = raw
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
assert(statements.length === 2, `Contains 2 statements (got ${statements.length})`);

// Test 4: First statement creates the lamp_designs table
assert(
  statements[0].includes('CREATE TABLE "lamp_designs"'),
  "First statement creates lamp_designs table",
);

// Test 5: Table has all expected columns
const createStmt = statements[0];
for (const col of [
  "id",
  "user_id",
  "name",
  "parameters",
  "thumbnail",
  "context",
  "template_id",
  "created_at",
  "updated_at",
]) {
  assert(createStmt.includes(`"${col}"`), `CREATE TABLE includes column "${col}"`);
}

// Test 6: parameters column is jsonb
assert(createStmt.includes("jsonb"), "parameters column uses jsonb type");

// Test 7: Second statement adds foreign key
assert(
  statements[1].includes("lamp_designs_user_id_users_id_fk"),
  "Second statement adds foreign key constraint",
);

// Test 8: Foreign key references users table with cascade delete
assert(
  statements[1].includes("ON DELETE cascade"),
  "Foreign key has ON DELETE cascade",
);

// Test 9: Migration script file exists
const scriptPath = resolve(
  process.cwd(),
  "scripts/apply-migration-lamp-designs.ts",
);
assert(existsSync(scriptPath), "Migration script exists");

// Test 10: Migration script references correct migration file
const scriptContent = readFileSync(scriptPath, "utf8");
assert(
  scriptContent.includes("0013_ambitious_pixie.sql"),
  "Migration script references 0013_ambitious_pixie.sql",
);

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
