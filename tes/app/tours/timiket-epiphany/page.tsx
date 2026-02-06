"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, Phone, Mail, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import BookingPopup from "../../../components/BookingPopup"
export default function TimiketEpiphanyPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

 const [isBookingOpen, setIsBookingOpen] = useState(false)
  // Sample images for the scrollable gallery
  const images = [
 "/images/timket1.jpg",
    "/images/timket2.jpg",
    "/images/timket3.jpg",
   
]

 const [selectedImage, setSelectedImage] = useState(images[0])


  

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white section-padding">
        <div className="container-max">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Timiket-Epiphany</h1>
          <div className="w-16 h-1 bg-amber-400"></div>
        </div>
      </section>
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
     
     

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="mb-8">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-6 py-3 font-semibold transition-colors duration-200 ${
                      activeTab === "overview" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Overview
                  </button>
                 
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Gena</h3>
                  <div className="w-8 h-1 bg-emerald-600 mb-6"></div>

                  <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Celebrated once a year in January 17-20, this religious holiday commemorates the baptism of Christ. It is the main holiday of the year. It is the most colorful of the Orthodox religion. The whole night is spent in prayers, in the morning, all the Tabots (the replicas of the Arch of Moses) wooden or stone panels consecrated by the bishop, leave the churches, carried in procession to the sound of drums by monks displaying tiaras, multicolored umbrellas and ornate crosses, embroidered copes. The most intense serenity and fervor, the beauty of the liturgical ornaments make this feast, which takes place over two days, an exceptional event. Still according to tradition, Menelik, son of King Solomon and the Queen of Sheba, would have brought back to Ethiopia, the tablets of the law of Moses. So that no one can steal the real tables, every church has a copy. So no one can know where the true tables of the law of Moses are.</p>
                   
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* TES Logo */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8 text-center">
                <div className="w-32 h-32 mx-auto mb-4">
                  <Image
                    src="/images/tes.jpg"
                    alt="Tes Tour Logo"
                    width={128}
                    height={128}
                    className="rounded-lg object-cover w-full h-full"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">CONTACT INFO</h3>
                <div className="w-8 h-1 bg-emerald-600 mb-6"></div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <Phone className="h-5 w-5 text-emerald-600 mr-2" />
                      <span className="font-semibold text-gray-900">Phone:</span>
                    </div>
                    <p className="text-gray-700">+251 93 010 8686</p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <Mail className="h-5 w-5 text-emerald-600 mr-2" />
                      <span className="font-semibold text-gray-900">Email:</span>
                    </div>
                    <p className="text-gray-700">tesfaye.cartour@gmail.com</p>
                    <p className="text-blue-600 underline">info@testourandcarrent.com</p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <MapPin className="h-5 w-5 text-emerald-600 mr-2" />
                      <span className="font-semibold text-gray-900">Address:</span>
                    </div>
                    <div className="text-gray-700">
                      <p>Bole Gulf Aziz Building</p>
                      <p>Building # 113</p>
                      <p>Addis Ababa, Ethiopia</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        <div className="mt-12 text-center">
                    <button 
                      onClick={() => setIsBookingOpen(true)}
                      className="btn-primary text-lg px-12 py-4"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </section>
        
              {/* Booking Popup */}
              <BookingPopup
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                tourName="Timiket (Epiphany)"
              />
    </div>
  )
}
