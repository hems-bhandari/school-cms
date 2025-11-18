'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react'

interface ImageLightboxProps {
  images: Array<{ url: string; name: string }>
  initialIndex?: number
  onClose: () => void
}

export default function ImageLightbox({ images, initialIndex = 0, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const currentImage = images[currentIndex]
  const minSwipeDistance = 50

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setZoom(1)
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setZoom(1)
  }, [images.length])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 1))
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = currentImage.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === '+' || e.key === '=') handleZoomIn()
      if (e.key === '-') handleZoomOut()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, goToPrevious, goToNext])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Touch handlers for swipe navigation
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors p-2 bg-black bg-opacity-50 rounded-full"
        aria-label="Close lightbox"
      >
        <X size={32} />
      </button>

      {/* Image Counter */}
      <div className="absolute top-4 left-4 z-50 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-20 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleZoomIn()
          }}
          className="text-white hover:text-gray-300 transition-colors p-2 bg-black bg-opacity-50 rounded-full"
          aria-label="Zoom in"
          disabled={zoom >= 3}
        >
          <ZoomIn size={24} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleZoomOut()
          }}
          className="text-white hover:text-gray-300 transition-colors p-2 bg-black bg-opacity-50 rounded-full"
          aria-label="Zoom out"
          disabled={zoom <= 1}
        >
          <ZoomOut size={24} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDownload()
          }}
          className="text-white hover:text-gray-300 transition-colors p-2 bg-black bg-opacity-50 rounded-full"
          aria-label="Download image"
        >
          <Download size={24} />
        </button>
      </div>

      {/* Previous Button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToPrevious()
          }}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-3 bg-black bg-opacity-50 rounded-full z-50"
          aria-label="Previous image"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {/* Next Button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToNext()
          }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-3 bg-black bg-opacity-50 rounded-full z-50"
          aria-label="Next image"
        >
          <ChevronRight size={32} />
        </button>
      )}

      {/* Image Container */}
      <div 
        className="relative max-w-7xl max-h-screen p-8 overflow-auto"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="relative transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <Image
            src={currentImage.url}
            alt={currentImage.name}
            width={1200}
            height={800}
            className="w-auto h-auto max-w-full max-h-[80vh] object-contain"
            priority
          />
        </div>
        
        {/* Image Name */}
        <div className="text-center mt-4">
          <p className="text-white text-sm bg-black bg-opacity-50 inline-block px-4 py-2 rounded-full">
            {currentImage.name}
          </p>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-black bg-opacity-50 p-3 rounded-full max-w-[90vw] overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
                setZoom(1)
              }}
              className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                index === currentIndex 
                  ? 'ring-2 ring-white scale-110' 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

