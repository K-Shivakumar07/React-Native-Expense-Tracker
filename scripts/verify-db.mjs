import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(dbUrl);

async function check() {
  const users = await sql`
    SELECT id, name, email, email_verified, created_at
    FROM neon_auth.user
    ORDER BY created_at DESC
    LIMIT 5
  `;
  console.log("Recent registered users in neon_auth schema:");
  for (const u of users) {
    console.log(`- ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Verified: ${u.email_verified}`);
  }
}

check().catch((e) => {
  console.error("DB error:", e);
  process.exit(1);
});

