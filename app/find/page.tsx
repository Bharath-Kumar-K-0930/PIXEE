'use client'

import { useState, useEffect } from 'react'
import { supabase, Event } from '@/lib/supabase'
import * as faceapi from 'face-api.js'
import {
    loadModels,
    detectFaceDescriptor,
    fileToImage,
    loadImage,
    euclideanDistance,
    MatchResult,
} from '@/lib/faceDetection'
import InfiniteGallery from '@/components/3d-gallery-photography'

export default function FindPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [selectedEventId, setSelectedEventId] = useState('')
    const [selfieFile, setSelfieFile] = useState<File | null>(null)
    const [selfiePreview, setSelfiePreview] = useState('')
    const [loading, setLoading] = useState(false)
    const [modelsLoaded, setModelsLoaded] = useState(false)
    const [progress, setProgress] = useState('')
    const [matches, setMatches] = useState<MatchResult[]>([])
    const [error, setError] = useState('')

    const MATCH_THRESHOLD = 0.65 // Lower distance = better match (was 0.55, now more lenient)

    useEffect(() => {
        loadEvents()
        initializeModels()
    }, [])

    async function loadEvents() {
        const { data } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) {
            setEvents(data)
        }
    }

    async function initializeModels() {
        try {
            setProgress('Loading AI models...')
            await loadModels()
            setModelsLoaded(true)
            setProgress('Models loaded! Ready to find your photos.')
        } catch (err) {
            setError('Failed to load face detection models')
            console.error(err)
        }
    }

    function handleSelfieChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            setSelfieFile(file)
            setSelfiePreview(URL.createObjectURL(file))
            setMatches([])
            setError('')
        }
    }

    async function handleFindPhotos() {
        if (!selectedEventId || !selfieFile) {
            setError('Please select an event and upload a selfie')
            return
        }

        setLoading(true)
        setError('')
        setMatches([])

        try {
            // Step 1: Detect face in selfie
            setProgress('Analyzing your selfie...')
            const selfieImage = await fileToImage(selfieFile)
            const selfieDescriptor = await detectFaceDescriptor(selfieImage)

            if (!selfieDescriptor) {
                setError('No face detected in your selfie. Please try another photo.')
                setLoading(false)
                return
            }

            // Step 2: Fetch event photos
            setProgress('Loading event photos...')
            const { data: photos, error: fetchError } = await supabase
                .from('photos')
                .select('*')
                .eq('event_id', selectedEventId)

            console.log('📷 Fetched photos from database:', photos)
            console.log('Fetch error (if any):', fetchError)

            if (!photos || photos.length === 0) {
                console.warn('⚠️ No photos found for this event')
                setError('No photos found for this event')
                setLoading(false)
                return
            }

            console.log(`✅ Found ${photos.length} photos to process`)

            // Step 3: Process each photo
            const matchedPhotos: MatchResult[] = []
            const totalPhotos = photos.length

            for (let i = 0; i < photos.length; i++) {
                const photo = photos[i]
                setProgress(`Scanning photo ${i + 1} of ${totalPhotos}...`)
                console.log(`🔍 Processing photo ${i + 1}:`, photo.image_url)

                try {
                    const eventImage = await loadImage(photo.image_url)
                    console.log(`✅ Loaded image ${i + 1}`)
                    const detections = await faceapi
                        .detectAllFaces(eventImage, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptors()

                    console.log(`Found ${detections?.length || 0} faces in photo ${i + 1}`)

                    // Check each face in the photo
                    if (detections && detections.length > 0) {
                        for (const detection of detections) {
                            const distance = euclideanDistance(
                                selfieDescriptor,
                                detection.descriptor
                            )

                            console.log(`  Face distance: ${distance.toFixed(3)} (threshold: ${MATCH_THRESHOLD})`)

                            if (distance < MATCH_THRESHOLD) {
                                console.log(`  ✅ MATCH FOUND! Distance: ${distance.toFixed(3)}`)
                                matchedPhotos.push({
                                    imageUrl: photo.image_url,
                                    distance,
                                    confidence: Math.max(0, 100 - distance * 100),
                                })
                                break // Found a match in this photo, move to next
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Error processing photo ${photo.id}:`, err)
                    // Continue with next photo
                }
            }

            // Step 4: Sort by distance (lower is better)
            matchedPhotos.sort((a, b) => a.distance - b.distance)

            setMatches(matchedPhotos)
            setProgress(
                matchedPhotos.length > 0
                    ? `Found ${matchedPhotos.length} photo(s) with your face!`
                    : 'No photos found with your face. Try another selfie.'
            )
        } catch (err) {
            setError('An error occurred while processing photos')
            console.error(err)
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#e0f7fa] to-[#e0f7fa] p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-6xl font-bold text-[#0a4f5c] mb-4">PIXEE</h1>
                    <p className="text-xl text-[#158fa8] mb-2">
                        Upload a selfie → Find your memories instantly
                    </p>
                    <p className="text-sm text-[#158fa8]">
                        {modelsLoaded
                            ? '✓ AI models loaded - Privacy-first on-device processing'
                            : '⏳ Loading AI models...'}
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Left: Upload & Settings */}
                    <div className="space-y-6">
                        {/* Event Selector */}
                        <div className="bg-white/80 shadow-sm backdrop-blur-lg rounded-2xl p-6 border border-[#80deea]">
                            <h2 className="text-xl font-semibold text-[#0a4f5c] mb-4">
                                1. Select Event
                            </h2>
                            <select
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white border border-[#80deea] text-[#0a4f5c] focus:outline-none focus:ring-2 focus:ring-[#158fa8]"
                                disabled={loading}
                                style={{ colorScheme: 'dark' }}
                            >
                                <option value="" className="bg-white text-[#0a4f5c]">-- Choose an event --</option>
                                {events.map((event) => (
                                    <option key={event.id} value={event.id} className="bg-white text-[#0a4f5c]">
                                        {event.name} ({event.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Selfie Upload */}
                        <div className="bg-white/80 shadow-sm backdrop-blur-lg rounded-2xl p-6 border border-[#80deea]">
                            <h2 className="text-xl font-semibold text-[#0a4f5c] mb-4">
                                2. Upload Your Selfie
                            </h2>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleSelfieChange}
                                className="hidden"
                                id="selfie-input"
                                disabled={loading}
                            />
                            <label
                                htmlFor="selfie-input"
                                className="block w-full py-3 px-4 bg-[#158fa8] hover:bg-[#158fa8] disabled:bg-[#80deea] text-[#0a4f5c] font-semibold rounded-lg text-center cursor-pointer transition-colors"
                            >
                                {selfieFile ? 'Change Selfie' : 'Choose Selfie'}
                            </label>

                            {selfiePreview && (
                                <div className="mt-4">
                                    <img
                                        src={selfiePreview}
                                        alt="Selfie preview"
                                        className="w-full h-64 object-cover rounded-lg border-2 border-[#80deea]"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Find Button */}
                        <button
                            onClick={handleFindPhotos}
                            disabled={!selectedEventId || !selfieFile || loading || !modelsLoaded}
                            className="w-full py-4 bg-white hover:bg-gray-100 disabled:bg-[#80deea] text-black disabled:text-[#0a4f5c] font-bold rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-2xl disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Find My Photos'}
                        </button>
                    </div>

                    {/* Right: Instructions & Info */}
                    <div className="bg-white/80 shadow-sm backdrop-blur-lg rounded-2xl p-6 border border-[#80deea]">
                        <h2 className="text-xl font-semibold text-[#0a4f5c] mb-4">
                            How It Works
                        </h2>
                        <div className="space-y-4 text-[#158fa8]">
                            <div className="flex items-start gap-3">
                                <div className="text-2xl">🎯</div>
                                <div>
                                    <h3 className="font-semibold mb-1">Upload Your Selfie</h3>
                                    <p className="text-sm text-[#158fa8]">
                                        Upload a clear photo of your face
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="text-2xl">🤖</div>
                                <div>
                                    <h3 className="font-semibold mb-1">AI Processing</h3>
                                    <p className="text-sm text-[#158fa8]">
                                        Face detection runs on your device (privacy-first)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="text-2xl">📸</div>
                                <div>
                                    <h3 className="font-semibold mb-1">Find Matches</h3>
                                    <p className="text-sm text-[#158fa8]">
                                        We'll scan all event photos and show you the ones with your face
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="text-2xl">🔒</div>
                                <div>
                                    <h3 className="font-semibold mb-1">100% Private</h3>
                                    <p className="text-sm text-[#158fa8]">
                                        No uploads to servers - everything runs in your browser
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress/Error Messages */}
                {progress && (
                    <div className="bg-white/80 shadow-sm border border-[#80deea] rounded-lg p-4 mb-8">
                        <p className="text-[#158fa8] text-center">{progress}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8">
                        <p className="text-red-200 text-center">{error}</p>
                    </div>
                )}

                {/* Results Gallery - 3D View */}
                {matches.length > 0 && (
                    <div className="relative h-screen bg-black">
                        <InfiniteGallery
                            images={matches.map((match, index) => ({
                                src: match.imageUrl,
                                alt: `Match ${index + 1} - ${match.confidence.toFixed(0)}% confidence`
                            }))}
                            speed={1.2}
                            zSpacing={3}
                            visibleCount={12}
                            falloff={{ near: 0.8, far: 14 }}
                            className="h-full w-full rounded-lg overflow-hidden"
                        />
                        <div className="h-screen inset-0 pointer-events-none fixed flex items-center justify-center text-center px-3 mix-blend-exclusion text-[#0a4f5c] z-10">
                            <div>
                                <h1 className="font-serif text-5xl md:text-8xl tracking-tight mb-4">
                                    <span className="italic">Your Photos</span>
                                </h1>
                                <p className="text-2xl md:text-4xl">
                                    Found {matches.length} {matches.length === 1 ? 'photo' : 'photos'}
                                </p>
                            </div>
                        </div>

                        <div className="text-center fixed bottom-10 left-0 right-0 font-mono uppercase text-[11px] font-semibold text-[#0a4f5c] z-10">
                            <p>Use mouse wheel, arrow keys, or touch to navigate</p>
                            <p className="opacity-60">
                                Auto-play resumes after 3 seconds of inactivity
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
