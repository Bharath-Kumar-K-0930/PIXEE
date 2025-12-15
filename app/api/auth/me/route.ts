import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_user_id')?.value;

        if (!sessionId) {
            return NextResponse.json({ user: null });
        }

        const doc = await db.collection('users').doc(sessionId).get();

        if (!doc.exists) {
            return NextResponse.json({ user: null });
        }

        const user = doc.data();

        return NextResponse.json({
            user: { id: doc.id, email: user?.email, full_name: user?.full_name }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
