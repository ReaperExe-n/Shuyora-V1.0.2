import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/shuyora'
});

async function patch() {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS anilist_id VARCHAR(255)`);
    console.log("Successfully added anilist_id column!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    pool.end();
  }
}

patch();
