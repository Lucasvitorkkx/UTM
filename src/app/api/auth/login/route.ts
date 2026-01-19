import { loginAction } from '@/actions/auth/login';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = await loginAction(body);

        if (result && 'error' in result) {
            return NextResponse.json(result, { status: 401 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') {
            return NextResponse.json({ success: true }, { status: 200 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
