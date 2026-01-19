'use server';

import { db } from '@/db';
import { clicks, links, projects } from '@/db/schema';
import { getOrCreateDefaultProject } from './projects';
import { verifySession } from '@/lib/auth';
import { eq, sql } from 'drizzle-orm';
import { subDays, format } from 'date-fns';

export async function getDashboardStats() {
    const session = await verifySession();
    const project = await getOrCreateDefaultProject();

    // 1. Total Clicks
    // Note: Drizzle count with filters involves some joins or subqueries logic.
    // For robustness in this MVP, we might just query count directly if we can join links.

    const totalClicksResult = await db.select({ count: sql<number>`count(*)` })
        .from(clicks)
        .innerJoin(links, eq(clicks.linkId, links.id))
        .where(eq(links.projectId, project.id));

    const totalClicks = Number(totalClicksResult[0]?.count || 0);

    // 2. Total Links
    const totalLinksResult = await db.select({ count: sql<number>`count(*)` })
        .from(links)
        .where(eq(links.projectId, project.id));

    const totalLinks = Number(totalLinksResult[0]?.count || 0);

    // 3. Recent Clicks (Last 24h?) - Placeholder logic for "Conversions"
    // For MVP, "Conversions" might just be unique visitors or specific events if we had pixel.
    // Let's just track "Unique Visitors" (approx basic implementation)
    const uniqueVisitorsResult = await db.select({ count: sql<number>`count(distinct ${clicks.ip})` })
        .from(clicks)
        .innerJoin(links, eq(clicks.linkId, links.id))
        .where(eq(links.projectId, project.id));

    const uniqueVisitors = Number(uniqueVisitorsResult[0]?.count || 0);

    return {
        totalClicks,
        totalLinks,
        uniqueVisitors,
    };
}

export async function getClicksOverTime() {
    const session = await verifySession();
    const project = await getOrCreateDefaultProject();

    const sevenDaysAgo = subDays(new Date(), 7);

    // Aggregate clicks by day
    // Note: Date truncation in SQL is dialect specific. Postgres uses date_trunc.
    const result = await db.execute(sql`
    SELECT date_trunc('day', ${clicks.timestamp}) as date, count(*) as count
    FROM ${clicks}
    JOIN ${links} ON ${clicks.linkId} = ${links.id}
    WHERE ${links.projectId} = ${project.id}
    AND ${clicks.timestamp} >= ${sevenDaysAgo}
    GROUP BY date_trunc('day', ${clicks.timestamp})
    ORDER BY date ASC
  `);

    // Transform for Recharts
    // If result.rows is empty, return defaults
    // Drizzle execute returns different structure based on driver.
    // With 'pg', it returns rows.

    // Quick fix: Map rows to sanitized array
    // We need to ensure we fill in missing days for a good chart.

    const data = result.rows.map((row: any) => ({
        name: format(new Date(row.date), 'MMM dd'),
        total: Number(row.count),
    }));

    // If empty (no clicks), return mock/empty array so chart doesn't crash?
    // Or better, let's keep it empty.
    return data;
}

export async function getDeviceStats() {
    const session = await verifySession();
    const project = await getOrCreateDefaultProject();

    // Group by OS
    const result = await db.execute(sql`
        SELECT ${clicks.os} as name, count(*) as value
        FROM ${clicks}
        JOIN ${links} ON ${clicks.linkId} = ${links.id}
        WHERE ${links.projectId} = ${project.id}
        GROUP BY ${clicks.os}
        ORDER BY value DESC
        LIMIT 5
    `);

    // Add fill color for pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return result.rows.map((row: any, index: number) => ({
        name: row.name || 'Unknown',
        value: Number(row.value),
        fill: COLORS[index % COLORS.length]
    }));
}
