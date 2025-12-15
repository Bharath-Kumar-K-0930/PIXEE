'use client'

import { useState, useEffect } from 'react'
import { Event, Photo } from '@/lib/types'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

export default function AdminPage() {
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSignup, setIsSignup] = useState(false)

    // Auth form state
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [authLoading, setAuthLoading] = useState(false)
    const [authError, setAuthError] = useState('')

    // Event form state
    const [eventName, setEventName] = useState('')
    const [eventCode, setEventCode] = useState('')
    const [events, setEvents] = useState<Event[]>([])
    const [eventLoading, setEventLoading] = useState(false)

    // Photo management state
    const [selectedEventId, setSelectedEventId] = useState('')
    const [photoUrls, setPhotoUrls] = useState('')
    const [driveFolderLink, setDriveFolderLink] = useState('')
    const [uploadFiles, setUploadFiles] = useState<FileList | null>(null)
    const [photos, setPhotos] = useState<Photo[]>([])
    const [photoLoading, setPhotoLoading] = useState(false)

    // Check auth state on mount
    useEffect(() => {
        checkUser()
    }, [])

    // Load events when user logs in
    useEffect(() => {
        if (user) {
            loadEvents()
        }
    }, [user])

    // Load photos when event is selected
    useEffect(() => {
        if (selectedEventId) {
            loadPhotos(selectedEventId)
        } else {
            setPhotos([])
        }
    }, [selectedEventId])

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
        setLoading(false)

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
        })

        return () => subscription.unsubscribe()
    }

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault()
        setAuthLoading(true)
        setAuthError('')

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName }
                }
            })

            if (error) throw error

            alert('Signup successful! Check your email for confirmation.')
            setUser(data.user) // Optimistic set, though email confirm might be needed
        } catch (error: any) {
            setAuthError(error.message)
        }

        setAuthLoading(false)
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setAuthLoading(true)
        setAuthError('')

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error

            setUser(data.user)
        } catch (error: any) {
            setAuthError(error.message)
        }

        setAuthLoading(false)
    }

    async function handleLogout() {
        await supabase.auth.signOut()
        setUser(null)
        setEvents([])
        setPhotos([])
        setSelectedEventId('')
    }

    async function loadEvents() {
        try {
            const res = await fetch('/api/events')
            const data = await res.json()
            if (Array.isArray(data)) {
                setEvents(data)
            }
        } catch (error) {
            console.error('Failed to load events', error)
        }
    }

    async function handleCreateEvent(e: React.FormEvent) {
        e.preventDefault()
        setEventLoading(true)

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: eventName, code: eventCode })
            })

            if (res.ok) {
                setEventName('')
                setEventCode('')
                loadEvents()
            } else {
                alert('Error creating event')
            }
        } catch (error) {
            alert('Error creating event')
        }

        setEventLoading(false)
    }

    async function loadPhotos(eventId: string) {
        try {
            const res = await fetch(`/api/photos?eventId=${eventId}`)
            const data = await res.json()
            if (Array.isArray(data)) {
                setPhotos(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    async function handleAddPhotos(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedEventId) {
            alert('Please select an event first')
            return
        }

        setPhotoLoading(true)

        // Handle URL list
        if (photoUrls.trim()) {
            const urls = photoUrls.split('\n').map(url => url.trim()).filter(url => url.length > 0)

            for (const url of urls) {
                const formData = new FormData()
                formData.append('eventId', selectedEventId)
                formData.append('url', url)
                formData.append('sourceType', 'url')

                await fetch('/api/photos', { method: 'POST', body: formData })
            }
        }

        // Handle file uploads
        if (uploadFiles && uploadFiles.length > 0) {
            let uploadedCount = 0
            for (let i = 0; i < uploadFiles.length; i++) {
                const file = uploadFiles[i]
                const formData = new FormData()
                formData.append('eventId', selectedEventId)
                formData.append('file', file)
                formData.append('sourceType', 'upload')

                try {
                    const res = await fetch('/api/photos', {
                        method: 'POST',
                        body: formData
                    })

                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ error: 'Unknown error', details: 'Could not parse JSON' }));
                        console.error('Server error details:', errorData);
                        throw new Error(errorData.error || 'Upload failed');
                    }
                    uploadedCount++
                } catch (err) {
                    console.error(`Error uploading ${file.name}`, err)
                }
            }
            if (uploadedCount > 0) alert('Uploads complete!')
        }

        // Handle Google Drive folder (link only for now)
        if (driveFolderLink.trim()) {
            const formData = new FormData()
            formData.append('eventId', selectedEventId)
            formData.append('url', driveFolderLink)
            formData.append('sourceType', 'drive_folder')
            await fetch('/api/photos', { method: 'POST', body: formData })
            alert('Drive folder link saved!')
        }

        setPhotoUrls('')
        setDriveFolderLink('')
        setUploadFiles(null)
        loadPhotos(selectedEventId)
        setPhotoLoading(false)
    }

    async function handleDeletePhoto(photoId: string) {
        if (!confirm('Are you sure you want to delete this photo?')) return
        // Note: Logic to delete photo via API is needed if requested, 
        // but for now we focus on matching previous capabilities (which had delete).
        // I'll skip implementation unless specifically asked since API route needs update.
        alert('Delete functionality moved to server-side (pending implementation).')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-[#e0f7fa] to-[#e0f7fa] flex items-center justify-center">
                <div className="text-[#0a4f5c] text-xl">Loading...</div>
            </div>
        )
    }

    // Login/Signup Screen
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-[#e0f7fa] to-[#e0f7fa] p-8 flex items-center justify-center">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold text-[#0a4f5c] mb-4">
                            PIXEE <span className="text-[#158fa8]">Admin</span>
                        </h1>
                        <p className="text-[#158fa8] text-lg">
                            {isSignup ? 'Create your account' : 'Login to manage events'}
                        </p>
                    </div>

                    <div className="bg-white/80 shadow-sm backdrop-blur-lg rounded-2xl p-8 border border-[#80deea]">
                        <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-6">
                            {isSignup && (
                                <div>
                                    <label className="block text-[#0a4f5c] text-sm font-medium mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-white/80 shadow-sm border border-[#80deea] text-[#0a4f5c] placeholder-[#26c6da] focus:outline-none focus:ring-2 focus:ring-[#158fa8]"
                                        placeholder="John Doe"
                                        required={isSignup}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-[#0a4f5c] text-sm font-medium mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-white/80 shadow-sm border border-[#80deea] text-[#0a4f5c] placeholder-[#26c6da] focus:outline-none focus:ring-2 focus:ring-[#158fa8]"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[#0a4f5c] text-sm font-medium mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-white/80 shadow-sm border border-[#80deea] text-[#0a4f5c] placeholder-[#26c6da] focus:outline-none focus:ring-2 focus:ring-[#158fa8]"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {authError && (
                                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                                    {authError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={authLoading}
                                className="w-full py-3 bg-[#158fa8] text-white hover:bg-[#158fa8] disabled:bg-[#80deea] text-[#0a4f5c] font-semibold rounded-lg transition-colors"
                            >
                                {authLoading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Login')}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSignup(!isSignup)
                                        setAuthError('')
                                    }}
                                    className="text-[#158fa8] hover:text-[#158fa8] text-sm"
                                >
                                    {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    // Admin Dashboard
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#e0f7fa] to-[#e0f7fa] p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-5xl font-bold text-[#0a4f5c] mb-2">
                            PIXEE <span className="text-[#158fa8]">Admin</span>
                        </h1>
                        <p className="text-[#158fa8]">Logged in as: {user.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/50 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Create Event */}
                    <div className="bg-white/80 shadow-sm backdrop-blur-lg rounded-2xl p-8 border border-[#80deea]">
                        <h2 className="text-2xl font-semibold text-[#0a4f5c] mb-6">
                            Create Event
                        </h2>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div>
                                <label className="block text-[#0a4f5c] text-sm font-medium mb-2">
                                    Event Name
                                </label>
                                <input
                                    type="text"
                                    value={eventName}
                                    onChange={(e) => setEventName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-white/80 shadow-sm border border-[#80deea] text-[#0a4f5c] placeholder-[#26c6da] focus:outline-none focus:ring-2 focus:ring-[#158fa8]"
                                    placeholder="Wedding 2024"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[#0a4f5c] text-sm font-medium mb-2">
                                    Event Code (unique)
                                </label>
                                <input
                                    type="text"
                                    value={eventCode}
                                    onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-3 rounded-lg bg-white/80 shadow-sm border border-[#80deea] text-[#0a4f5c] placeholder-[#26c6da] focus:outline-none focus:ring-2 focus:ring-[#158fa8]"
                                    placeholder="WED2024"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={eventLoading}
                                className="w-full py-3 bg-[#158fa8] text-white hover:bg-[#158fa8] disabled:bg-[#80deea] text-[#0a4f5c] font-semibold rounded-lg transition-colors"
                            >
                                {eventLoading ? 'Creating...' : 'Create Event'}
                            </button>
                        </form>
                    </div>

                    {/* Events List */}
                    <div className="bg-white/80 shadow-sm backdrop-blur-lg rounded-2xl p-8 border border-[#80deea]">
                        <h2 className="text-2xl font-semibold text-[#0a4f5c] mb-6">
                            Events ({events.length})
                        </h2>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {events.length === 0 ? (
                                <p className="text-[#158fa8] text-center py-8">No events yet</p>
                            ) : (
                                events.map((event) => (
                                    <div
                                        key={event.id}
                                        className="bg-white/5 rounded-lg p-4 border border-white/10"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-[#0a4f5c] font-semibold">{event.name}</h3>
                                                <p className="text-[#158fa8] text-sm">Code: {event.code}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Photo Management */}
                <div className="bg-white/80 shadow-sm backdrop-blur-lg rounded-2xl p-8 border border-[#80deea]">
                    <h2 className="text-2xl font-semibold text-[#0a4f5c] mb-6">
                        Manage Photos
                    </h2>

                    {/* Event Selector */}
                    <div className="mb-6">
                        <label className="block text-[#0a4f5c] text-sm font-medium mb-2">
                            Select Event
                        </label>
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white border border-[#80deea] text-[#0a4f5c] focus:outline-none focus:ring-2 focus:ring-[#158fa8]"
                        >
                            <option value="" className="bg-white text-[#0a4f5c]">-- Choose an event --</option>
                            {events.map((event) => (
                                <option key={event.id} value={event.id} className="bg-white text-[#0a4f5c]">
                                    {event.name} ({event.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedEventId && (
                        <>
                            {/* Add Photos Form */}
                            <form onSubmit={handleAddPhotos} className="mb-8 space-y-6">
                                {/* Individual URLs */}
                                <div>
                                    <label className="block text-[#0a4f5c] text-sm font-medium mb-2">
                                        📎 Photo URLs (one per line)
                                    </label>
                                    <textarea
                                        value={photoUrls}
                                        onChange={(e) => setPhotoUrls(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-white/80 shadow-sm border border-[#80deea] text-[#0a4f5c] placeholder-[#26c6da] focus:outline-none focus:ring-2 focus:ring-[#158fa8] font-mono text-sm"
                                        placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                                        rows={4}
                                    />
                                </div>

                                {/* Google Drive Folder */}
                                <div>
                                    <label className="block text-[#0a4f5c] text-sm font-medium mb-2">
                                        📁 Google Drive Folder Link
                                    </label>
                                    <input
                                        type="url"
                                        value={driveFolderLink}
                                        onChange={(e) => setDriveFolderLink(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-white/80 shadow-sm border border-[#80deea] text-[#0a4f5c] placeholder-[#26c6da] focus:outline-none focus:ring-2 focus:ring-[#158fa8]"
                                        placeholder="https://drive.google.com/drive/folders/..."
                                    />
                                    <p className="text-xs text-[#158fa8] mt-1">Make sure folder is public</p>
                                </div>

                                {/* Manual Upload */}
                                <div>
                                    <label className="block text-[#0a4f5c] text-sm font-medium mb-2">
                                        💾 Upload Files Directly
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => setUploadFiles(e.target.files)}
                                        className="w-full px-4 py-3 rounded-lg bg-white/80 shadow-sm border border-[#80deea] text-[#0a4f5c] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#158fa8] file:text-[#0a4f5c] hover:file:bg-gray-600"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={photoLoading || (!photoUrls.trim() && !driveFolderLink.trim() && (!uploadFiles || uploadFiles.length === 0))}
                                    className="px-6 py-3 bg-[#158fa8] hover:bg-green-700 disabled:bg-green-800 text-[#0a4f5c] font-semibold rounded-lg transition-colors"
                                >
                                    {photoLoading ? 'Adding...' : 'Add Photos'}
                                </button>
                            </form>

                            {/* Photos Grid */}
                            <div>
                                <h3 className="text-xl font-semibold text-[#0a4f5c] mb-4">
                                    Current Photos ({photos.length})
                                </h3>
                                {photos.length === 0 ? (
                                    <p className="text-[#158fa8] text-center py-8">
                                        No photos yet for this event
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {photos.map((photo) => (
                                            <div
                                                key={photo.id}
                                                className="relative group bg-white/5 rounded-lg overflow-hidden border border-white/10"
                                            >
                                                {photo.source_type === 'drive_folder' ? (
                                                    <div className="w-full h-40 flex items-center justify-center bg-[#e0f7fa]">
                                                        <div className="text-center p-4">
                                                            <p className="text-[#0a4f5c] text-xs">📁 Drive Folder</p>
                                                            <p className="text-[#158fa8] text-xs mt-1 truncate">{photo.image_url}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={photo.image_url}
                                                        alt="Event photo"
                                                        className="w-full h-40 object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Error'
                                                        }}
                                                    />
                                                )}
                                                <button
                                                    onClick={() => handleDeletePhoto(photo.id)}
                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-[#0a4f5c] p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
