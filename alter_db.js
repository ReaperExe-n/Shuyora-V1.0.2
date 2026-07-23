import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/shuyora'
});

async function patch() {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_id VARCHAR(255)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`);
    console.log("Successfully altered users table!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    pool.end();
  }
}

patch();
