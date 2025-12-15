'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Maximize2 } from 'lucide-react';

interface MatchResult {
    imageUrl: string;
    distance: number;
    confidence: number;
}

interface MasonryGalleryProps {
    images: MatchResult[];
}

export default function MasonryGallery({ images }: MasonryGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<MatchResult | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        setIsVisible(true);
    }, []);

    const handleDownload = async (imageUrl: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `photo-${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return (
        <div className="w-full min-h-screen p-8 bg-transparent">
            {/* Removed black background, now transparent */}
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 text-center transform transition-all duration-700 ease-out"
                    style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0)' : 'translateY(-20px)'
                    }}>
                    <h2 className="text-4xl md:text-5xl font-bold text-[#0a4f5c] mb-4 tracking-tight">
                        Your Found Photos
                    </h2>
                    <p className="text-[#158fa8] text-lg">
                        We found {images.length} photos that match your selfie
                    </p>
                </div>

                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="group relative break-inside-avoid rounded-2xl overflow-hidden bg-white cursor-pointer shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-out"
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                                transitionDelay: `${index * 100}ms` // Staggered animation
                            }}
                            onClick={() => setSelectedImage(image)}
                        >
                            <img
                                src={image.imageUrl}
                                alt={`Match ${index + 1}`}
                                className="w-full h-auto object-cover"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-[#0a4f5c]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                <button
                                    onClick={(e) => handleDownload(image.imageUrl, e)}
                                    className="p-3 bg-white text-[#0a4f5c] rounded-full shadow-lg hover:bg-gray-50 transition-all hover:scale-110"
                                    title="Download"
                                >
                                    <Download size={24} />
                                </button>
                                <button
                                    onClick={() => setSelectedImage(image)}
                                    className="p-3 bg-white text-[#0a4f5c] rounded-full shadow-lg hover:bg-gray-50 transition-all hover:scale-110"
                                    title="View Fullscreen"
                                >
                                    <Maximize2 size={24} />
                                </button>
                            </div>

                            {/* Confidence Badge */}
                            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm text-xs font-bold text-[#0a4f5c] opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                {image.confidence.toFixed(0)}% Match
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 bg-[#0a4f5c]/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors hover:rotate-90 duration-300"
                    >
                        <X size={40} />
                    </button>

                    <div className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center animate-in zoom-in-95 duration-300">
                        <img
                            src={selectedImage.imageUrl}
                            alt="Full view"
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl bg-black/20"
                        />

                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={(e) => handleDownload(selectedImage.imageUrl, e)}
                                className="flex items-center gap-2 px-8 py-3 bg-white text-[#0a4f5c] rounded-full font-bold text-lg shadow-xl hover:bg-gray-100 hover:scale-105 transition-all"
                            >
                                <Download size={20} />
                                Download Photo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
