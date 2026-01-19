import { db } from '@/db';
import { clicks } from '@/db/schema';
import { UAParser } from 'ua-parser-js';

type TrackClickParams = {
    linkId: string;
    ip?: string;
    userAgent?: string;
    referer?: string;
    country?: string; // Would need GeoIP lookup (e.g. Vercel Headers or MaxMind)
    city?: string;
};

export async function trackClick({ linkId, ip, userAgent, referer, country, city }: TrackClickParams) {
    try {
        const parser = new UAParser(userAgent || '');
        const browser = parser.getBrowser();
        const os = parser.getOS();
        const device = parser.getDevice();

        await db.insert(clicks).values({
            linkId,
            ip: ip || 'unknown',
            userAgent: userAgent || null,
            referer: referer || null,
            country: country || null,
            city: city || null,
            browser: browser.name || 'unknown',
            os: os.name || 'unknown',
            deviceType: device.type || 'desktop', // Default to desktop if undefined
        });
    } catch (error) {
        console.error('Error tracking click:', error);
        // Fail silently so we don't block the redirect
    }
}
