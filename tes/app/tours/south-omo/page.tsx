"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"

export default function SouthOmoPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Sample images for the scrollable gallery
  const galleryImages = [
    "/images/dorze.jpg?height=00&width=800",
    "/images/omo slide 2.jpg?height=400&width=800",
    "/images/omo slide 3.jpg?height=400&width=800",
    
  ]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Scrollable Image Gallery Header */}
      <section className="relative h-100 overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src={galleryImages[currentImageIndex] || "/placeholder.svg"}
            alt="South Omo Gallery"
            width={1200}
            height={800}
            className="w-full h-full object-cover"
          />

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>

          {/* Gallery Button */}
          <button className="absolute bottom-4 right-4 bg-white/90 hover:bg-white px-4 py-2 rounded-lg font-medium text-gray-800 transition-all duration-200 shadow-lg">
            Gallery
          </button>

          {/* Image Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Southern Tour Content */}
      <section className="section-padding">
        <div className="container-max">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Southern Tour</h1>
            <div className="w-16 h-1 bg-emerald-600 mb-12"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 11 Days Omo Valley */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-64">
                <Image
                  src="/images/11days omo.jpg?height=256&width=400"
                  alt="11 Days Omo valley"
                  width={400}
                  height={256}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">11 Days Omo valley</h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">Southern Tour, Tribes of Omo Valley</span>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  When visiting the Omo Valley, planning the dates of the tour with the market days of the different
                  villages, most particularly... with those at Dimeka...
                </p>
                <Link href="/tours/south-omo/11-days">
                  <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition-colors duration-200">
                    View Details
                  </button>
                </Link>
              </div>
            </div>

            {/* 8 Days Omo Valley */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-64">
                <Image
                  src="/images/dorze.jpg?height=256&width=400"
                  alt="8 days Omo Valley: Dorze and Arba Minch"
                  width={400}
                  height={256}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">8 days Omo Valley : Dorze and Arba Minch</h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">Southern Tour, Tribes of Omo Valley</span>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Omo Valley is undoubtedly one of the most unique places on earth and the discovery of human remains
                  dating back...
                </p>
                <Link href="/tours/south-omo/8-days">
                  <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition-colors duration-200">
                    View Details
                  </button>
                </Link>
              </div>
            </div>

            {/* OMO Valley - 7 Days */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-64">
                <Image
                  src="/images/7days omo.jpg?height=256&width=400"
                  alt="OMO Valley - 7 days"
                  width={400}
                  height={256}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">OMO Valley - 7 days</h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">Tribes of Omo Valley</span>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Isolated for millennia from the rest of the world, the beautiful Omo Valley is home to an exciting mix
                  of many small and... distinctive tribal...
                </p>
                <Link href="/tours/south-omo/7-days">
                  <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition-colors duration-200">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
