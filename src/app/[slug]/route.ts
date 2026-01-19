import { db } from '@/db';
import { links } from '@/db/schema';
import { trackClick } from '@/lib/tracking';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> } // Params is a Promise in Next.js 15+
) {
    const { slug } = await params;

    // 1. Find the link
    const link = await db.query.links.findFirst({
        where: eq(links.slug, slug),
    });

    if (!link) {
        return new NextResponse('Link not found', { status: 404 });
    }

    // 2. Track the click (Fire and forget, but await ensures it starts)
    // In Vercel Functions, we might need waitUntil()
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || undefined;
    const referer = request.headers.get('referer') || undefined;

    // Geo headers (Vercel specific)
    const country = request.headers.get('x-vercel-ip-country') || undefined;
    const city = request.headers.get('x-vercel-ip-city') || undefined;

    // We don't await this to speed up redirect? 
    // IMPORTANT: On serverless, if we don't await, the function might freeze before DB write.
    // Ideally use `after` from next/server (experimental) or just await for safety in MVP.
    await trackClick({
        linkId: link.id,
        ip,
        userAgent,
        referer,
        country,
        city,
    });

    // 3. Construct Destination URL with UTMs
    const destination = new URL(link.destinationUrl);

    if (link.utmSource) destination.searchParams.set('utm_source', link.utmSource);
    if (link.utmMedium) destination.searchParams.set('utm_medium', link.utmMedium);
    if (link.utmCampaign) destination.searchParams.set('utm_campaign', link.utmCampaign);
    if (link.utmTerm) destination.searchParams.set('utm_term', link.utmTerm);
    if (link.utmContent) destination.searchParams.set('utm_content', link.utmContent);

    return NextResponse.redirect(destination.toString());
}
