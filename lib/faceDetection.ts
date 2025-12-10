import * as faceapi from 'face-api.js'

let modelsLoaded = false

export async function loadModels() {
    if (modelsLoaded) return

    // Try local models first, then fallback to CDN
    const MODEL_URLS = [
        '/models',
        'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'
    ]

    for (const MODEL_URL of MODEL_URLS) {
        try {
            console.log(`Trying to load models from: ${MODEL_URL}`)

            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            ])

            modelsLoaded = true
            console.log(`✅ Face detection models loaded successfully from: ${MODEL_URL}`)
            return
        } catch (error) {
            console.warn(`Failed to load from ${MODEL_URL}:`, error)
            // Continue to next URL
        }
    }

    // If all attempts failed
    throw new Error('Failed to load face detection models from all sources')
}

export function fileToImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)

        img.onload = () => {
            URL.revokeObjectURL(url)
            resolve(img)
        }

        img.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('Failed to load image from file'))
        }

        img.src = url
    })
}

export function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'

        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error(`Failed to load image from ${url}`))

        img.src = url
    })
}

export function euclideanDistance(a: Float32Array, b: Float32Array): number {
    let sum = 0
    for (let i = 0; i < a.length; i++) {
        const diff = a[i] - b[i]
        sum += diff * diff
    }
    return Math.sqrt(sum)
}

export interface MatchResult {
    imageUrl: string
    distance: number
    confidence: number
}

export async function detectFaceDescriptor(image: HTMLImageElement) {
    const detection = await faceapi
        .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

    return detection?.descriptor
}
