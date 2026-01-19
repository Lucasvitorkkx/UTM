
import dotenv from 'dotenv';
dotenv.config();

console.log('Checking environment...');
if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is not set in environment variables.');
    process.exit(1);
} else {
    console.log('DATABASE_URL is set.');
}

import { db } from './src/db';
import { users } from './src/db/schema';
import { sql } from 'drizzle-orm';

async function main() {
    try {
        console.log('Attempting to connect to database...');
        // Try a simple query
        const result = await db.execute(sql`SELECT NOW()`);
        console.log('Database connection successful:', result.rows[0]);

        console.log('Checking if users table exists...');
        const userCount = await db.select({ count: sql`count(*)` }).from(users);
        console.log('Users table accessed successfully. Count:', userCount[0].count);

    } catch (error) {
        console.error('Database connection failed:', error);
    } finally {
        process.exit(0);
    }
}

main();
