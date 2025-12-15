export interface Event {
    id: string
    name: string
    code: string
    created_at: string
}

export interface Photo {
    id: string
    event_id: string
    image_url: string
    source_type: 'url' | 'drive_folder' | 'upload'
    created_at: string
}

export interface UserProfile {
    id: string
    full_name: string | null
    created_at: string
    updated_at: string
}
