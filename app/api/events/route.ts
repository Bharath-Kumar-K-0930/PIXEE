import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: events, error } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Events Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(events);
    } catch (err: any) {
        console.error('Unexpected API Error:', err);
        return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();
    try {
        // 1. Check Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, code, allowedEmails } = await request.json();

        if (!name || !code) {
            return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
        }

        // 2. Insert with Privacy Fields
        const { data, error } = await supabase
            .from('events')
            .insert([{
                name,
                code,
                created_by: user.id,
                allowed_emails: allowedEmails || []
            }])
            .select() // Returns the inserted row
            .single();

        if (error) {
            if (error.code === '23505') { // Postgres unique_violation code
                return NextResponse.json(
                    { error: 'Event code already exists. Please choose a different unique code.' },
                    { status: 409 }
                );
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
