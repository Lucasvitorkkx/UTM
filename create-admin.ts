import 'dotenv/config';
import { db } from './src/db';
import { users } from './src/db/schema';
import { hashPassword } from './src/lib/hash';

async function createAdmin() {
    try {
        const email = 'lucasvitormkt@gmail.com';
        const password = 'Pw36@32123';

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Insert admin user
        const [user] = await db.insert(users).values({
            email,
            passwordHash: hashedPassword,
            plan: 'ENTERPRISE', // Admin gets enterprise plan
        }).returning();

        console.log('✅ Admin user created successfully!');
        console.log('Email:', email);
        console.log('User ID:', user.id);
        console.log('\nYou can now login at your site with these credentials.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

createAdmin();
