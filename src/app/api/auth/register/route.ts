import { registerAction } from '@/actions/auth/register';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = await registerAction(body);

        // Note: registerAction redirects on success, which throws a NEXT_REDIRECT error.
        // In an API context, we catch it or handle it.
        // However, Server Actions intended for Forms might redirect.
        // Ideally, we decouple logic from redirection for API reuse.
        // For now, we'll assume this API is for clients that handle redirects or we check result.

        if (result && 'error' in result) {
            return NextResponse.json(result, { status: 400 });
        }

        // If we are here, it means redirect happened or success (but redirect usually throws).
        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') {
            return NextResponse.json({ success: true }, { status: 201 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
