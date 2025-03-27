import fs from 'fs'
import path from 'path'
import knex from 'knex'

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  },
});

const schemaPath = path.join(__dirname, 'schema.sql');

async function migrateDatabase() {
  try {
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    await db.raw(schemaSQL);
    console.log('Database migration completed successfully.');
    console.log(`Schema applied from: ${schemaPath}`);
    console.log(`\nAdmin Credentials\nemail: admin@gmail.com\npassword: 1234567a
        \nYou can now run the server using 'npm run dev'.`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    db.destroy();
  }
}

migrateDatabase();