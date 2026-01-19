import { pgTable, text, timestamp, uuid, varchar, integer, pgEnum } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['FREE', 'PRO', 'ENTERPRISE']);

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    plan: planEnum('plan').default('FREE').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    pixelId: varchar('pixel_id', { length: 255 }),
    verifyToken: varchar('verify_token', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const links = pgTable('links', {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(), // Unique constraint needed per project or globally? Plan says "Unique via Project/Domain"
    destinationUrl: text('destination_url').notNull(),
    utmSource: varchar('utm_source', { length: 255 }),
    utmMedium: varchar('utm_medium', { length: 255 }),
    utmCampaign: varchar('utm_campaign', { length: 255 }),
    utmContent: varchar('utm_content', { length: 255 }),
    utmTerm: varchar('utm_term', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const clicks = pgTable('clicks', {
    id: uuid('id').defaultRandom().primaryKey(),
    linkId: uuid('link_id').references(() => links.id).notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    ip: varchar('ip', { length: 45 }),
    country: varchar('country', { length: 255 }),
    city: varchar('city', { length: 255 }),
    deviceType: varchar('device_type', { length: 50 }),
    os: varchar('os', { length: 50 }),
    browser: varchar('browser', { length: 50 }),
    referer: text('referer'),
    userAgent: text('user_agent'),
});
