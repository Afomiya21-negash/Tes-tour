"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"

export default function SouthOmoPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Sample images for the scrollable gallery
    const images = [
 "/images/dorze.jpg",
    "/images/omo slide 2.jpg",
    "/images/omo slide 3.jpg",
  
]

 const [selectedImage, setSelectedImage] = useState(images[0])
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Scrollable Image Gallery Header */}
     <section className="bg-white">
                <div className="container-max">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Main Image */}
                    <div className="md:col-span-1">
                      <Image
                        src={selectedImage || "/placeholder.svg"}
                        alt="7 Days OMO Valley Gallery"
                        width={500}
                        height={300}
                        className="w-full h-auto object-cover rounded-lg shadow-md"
                      />
                    </div>
        
                    {/* Scrollable Gallery */}
                    <div className="md:col-span-1">
                      <div className="flex overflow-x-auto space-x-4 py-4">
                        {images.map((image, index) => (
                          <div
                            key={index}
                            className={`relative w-24 h-20 rounded-lg overflow-hidden shadow-sm cursor-pointer transition-transform duration-200 transform hover:scale-110 ${
                              selectedImage === image ? "ring-2 ring-emerald-500" : ""
                            }`}
                            onClick={() => setSelectedImage(image)}
                          >
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`7 Days OMO Valley Gallery - Thumbnail ${index + 1}`}
                              layout="fill"
                              objectFit="cover"
                              className="rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
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
