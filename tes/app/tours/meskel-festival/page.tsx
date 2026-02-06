"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, Phone, Mail, MapPin, ChevronLeft, ChevronRight, Bold } from "lucide-react"
import BookingPopup from "../../../components/BookingPopup"
export default function MeskelFestivalPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedDays, setExpandedDays] = useState<number[]>([])
  const [expandAll, setExpandAll] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
 const [isBookingOpen, setIsBookingOpen] = useState(false)
  // Sample images for the scrollable gallery
  const images = [
 "/images/meskel1.jpg",
    "/images/meskel2.jpg",
    "/images/meskel3.jpg",
   
]

 const [selectedImage, setSelectedImage] = useState(images[0])

  const toggleDay = (dayNumber: number) => {
    setExpandedDays((prev) => (prev.includes(dayNumber) ? prev.filter((d) => d !== dayNumber) : [...prev, dayNumber]))
  }

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedDays([])
    } else {
      setExpandedDays([1])
    }
    setExpandAll(!expandAll)
  }

  const itineraryData = [
    {
      day: 1,
      title: "Day 1  : Sep 27/2018: Demera – Eve ceremony of Meskel festival",
      content:
        "You will be met upon arrival and transferred to your hotel. Refresh and begin your sightseeing of Addis with a drive up to mount Entoto for a panoramic view of Addis. Descend down and drive to National museum where you will have a chance to spot the oldest hominids of ‘Lucy’ fossil. Visit and proceed to the Holy Trinity built during the WWII. Then proceed to Meskel Square to attain the most colorful celebration Meskel. The Ge’ez word Meskel literally means Cross in which the celebration day named after. Meskel is the finding of the True Cross. It is celebrated among Christians in Ethiopia. It is marked by burning bone fire and also by religious hymn and different shows organized by youngsters from church school. Later you will be transferred to your hotel.",
      overnight: "",
    },
  
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white section-padding">
        <div className="container-max">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Meskel Festival</h1>
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
                  <button
                    onClick={() => setActiveTab("itinerary")}
                    className={`px-6 py-3 font-semibold transition-colors duration-200 ${
                      activeTab === "itinerary" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Itinerary
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">7 Days Simien Mountains</h3>
                  <div className="w-8 h-1 bg-emerald-600 mb-6"></div>

                  <div className="space-y-4 text-gray-700 leading-relaxed">
           <p>Meskel(The Finding Of The True Cross) Festival  (27 September)Now registered with UNESCO as an element of the Intangible Cultural Heritage of Humanity, Meskel (27 September) commemorates the alleged 4th century discovery of the True Cross on which Jesus was crucified. The centerpiece of this uniquely Ethiopian festival is the burning of a massive conical pyre called a Damera. The largest ceremony takes place in Addis Ababa’s Meskel Square, where hundreds of thousands of people gather to watch the colorfully dressed priests chant, pray and dance. The most historically poignant site to witness Meskel is Aksum’s Cathedral of Maryam Tsion.</p>
           <p><b>Once in a Year Time</b></p>
                   
                  </div>
                </div>
              )}

              {activeTab === "itinerary" && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Itinerary</h3>
                      <div className="w-8 h-1 bg-emerald-600 mt-2"></div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">Expand all</span>
                      <button
                        onClick={toggleExpandAll}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          expandAll ? "bg-emerald-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            expandAll ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="text-sm font-medium text-gray-900">ON</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {itineraryData.map((item) => (
                      <div key={item.day} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleDay(item.day)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                item.day === 1 || item.day === 8 ? "bg-gray-900" : "bg-gray-600"
                              }`}
                            >
                              {item.day === 1 || item.day === 8 ? (
                                <MapPin className="h-4 w-4 text-white" />
                              ) : (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="font-semibold text-gray-900">
                              Day {item.day} : {item.title}
                            </span>
                          </div>
                          {expandedDays.includes(item.day) ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </button>

                        {expandedDays.includes(item.day) && (
                          <div className="px-4 pb-4 border-t border-gray-100">
                            <div className="ml-11 pt-4">
                              <p className="text-gray-700 mb-2">{item.content}</p>
                              {item.overnight && (
                                <p className="text-gray-600 text-sm">
                                  <span className="font-medium">Overnight:</span> {item.overnight}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
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
                tourName="Meskel Festival"
              />
    </div>
  )
}
