import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
        return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: photos, error } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(photos);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    try {
        const formData = await request.formData();
        const eventId = formData.get('eventId') as string;
        const file = formData.get('file') as File;
        const url = formData.get('url') as string;
        const sourceType = formData.get('sourceType') as string;

        if (!eventId) {
            return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
        }

        let imageUrl = url;

        // Handle File Upload
        if (file && sourceType === 'upload') {
            const fileName = `${eventId}/${Date.now()}_${file.name}`;
            const { data, error: uploadError } = await supabase.storage
                .from('photos')
                .upload(fileName, file);

            if (uploadError) {
                console.error('Storage Upload Error:', uploadError);
                throw new Error(uploadError.message);
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('photos')
                .getPublicUrl(fileName);

            imageUrl = publicUrl;
        }

        if (!imageUrl) {
            return NextResponse.json({ error: 'Image URL or File is required' }, { status: 400 });
        }

        // Save to Supabase DB
        const { data, error: dbError } = await supabase
            .from('photos')
            .insert([{
                event_id: eventId,
                image_url: imageUrl,
                source_type: sourceType || 'url'
            }])
            .select()
            .single();

        if (dbError) {
            console.error('DB Insert Error:', dbError);
            throw new Error(dbError.message);
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Upload error full:', error);
        return NextResponse.json({
            error: error.message,
            stack: error.stack,
            details: 'Check server logs for more info'
        }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
        }

        // 1. Get photo details to find storage path
        const { data: photo, error: fetchError } = await supabase
            .from('photos')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !photo) {
            return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
        }

        // 2. Delete from Storage if it's an uploaded file
        if (photo.source_type === 'upload' && photo.image_url) {
            try {
                // Extract path from URL (e.g., .../photos/eventId/filename.jpg -> eventId/filename.jpg)
                const urlObj = new URL(photo.image_url);
                const pathParts = urlObj.pathname.split('/photos/');
                if (pathParts.length > 1) {
                    const storagePath = pathParts[1]; // Correct path relative to bucket
                    const { error: storageError } = await supabase.storage
                        .from('photos')
                        .remove([storagePath]);

                    if (storageError) console.warn('Storage deletion warning:', storageError);
                }
            } catch (e) {
                console.warn('Failed to parse image URL for deletion:', e);
            }
        }

        // 3. Delete from Database
        const { error: deleteError } = await supabase
            .from('photos')
            .delete()
            .eq('id', id);

        if (deleteError) {
            throw deleteError;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
