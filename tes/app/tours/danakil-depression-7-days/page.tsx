"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, Phone, Mail, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import BookingPopup from "../../../components/BookingPopup"
export default function SevenDaysDanakilDepressionPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedDays, setExpandedDays] = useState<number[]>([])
  const [expandAll, setExpandAll] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
const [isBookingOpen, setIsBookingOpen] = useState(false)
  // Sample images for the scrollable gallery
    const images = [
 "/images/5days danki.jpg?height=400&width=800",
    "/images/dalol3.jpg??height=400&width=800",
    "/images/dalol2.jpg??height=400&width=800",
]

 const [selectedImage, setSelectedImage] = useState(images[0])

  const toggleDay = (dayNumber: number) => {
    setExpandedDays((prev) => (prev.includes(dayNumber) ? prev.filter((d) => d !== dayNumber) : [...prev, dayNumber]))
  }

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedDays([])
    } else {
      setExpandedDays([1, 2, 3, 4, 5, 6, 7])
    }
    setExpandAll(!expandAll)
  }

  const itineraryData = [
    {
      day: 1,
      title: "Arrive to Addis",
      content:
        "In the evening attend a folkloric dinner where you will have a chance to taste several national dishes and watch dances of the various ethnic groups of Ethiopia. The traditional coffee ceremony will also be served. Later you will be transferred to the airport for your departure.",
      overnight: "",
    },
    {
      day: 2,
      title: "Fly to Mekelle-Drive to Dodom-Volcano",
      content:
        "We drive from Mekele to - Dodom. We start early drive to Dodom (at the base of Erta Ale). Leave after an early breakfast, possible at 07:30. This is may be one of the worst roads in the world. The 70 km distance may take about 5 hrs passing through changing landscape of solidified lava, rock, sand and occasional palm lined oasis. After you pass several small hamlets scattered here and there in this desert land, Dodom is about 9.5km from Erta Ale and it takes about 3 hrs trekking. Early dinner around 17:00 and trek up to Ertale at 20:00 hours. Camels transport all the camping materials and some food (sleeping materials like light mattresses and mat and water) to the rim of the volcano, where we spend the night watching the dramatic action of the boiling lava. Erta Ale ranks one of the most alluring and physically challenging natural attractions anywhere in Ethiopia. It is a shield volcano with a base diameter of 30 km and 1km square caldera at its summit. Erta Ale contains the world’s only permanent lava lake. Overnight on the top of the mountain. Erta Ale is 613 meters, with a lava lake, one of only five in the world, at the summit. It is notable for being the longest existing lava lake, present since the early years of the twentieth century. O/n camping on the mountain",
      overnight: "camping on the mountain",
    },
    {
      day: 3,
      title: "Dodem –Hammedele",
      content:
        "Descend from Erta Ale around 9 am Dodom - Hamd Ela. Leave back to Dodom after an early breakfast, if possible at 07:00. You will reach latest at 10:30 am at the camp, time to relax. After drive to reach Hamad Ela, better village with a total population about 500 people. O/n Hamedela",
      overnight: "Hamedela (camping)",
    },
    {
      day: 4,
      title: "Hamedela-Mekele",
      content:
        "Morning tour Drive to Ragad (Asebo), the place where the localities are mining salt. Look the activity of breaking the salt from the ground, cutting in to rectangular pieces and loading on camels. You drive ahead to Dallol and visit the difference landscape formed by volcanic activity, Dallol + Lake Assal + camel caravans. Excursion to Dallol (116 meter below sea level, one of the lowest places in the world) colorful salts mining, visit Lake Assal, follow up camel caravans and walk with the Afar people.Drive back to Hamedela and proceed to Mekele.",
      overnight: "",
    },
    {
      day: 5,
      title: "Fly Back To Addis",
      content: "Departure",
      overnight: "",
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white section-padding">
        <div className="container-max">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">7 Days Danakil Depression Tour</h1>
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Overview</h3>
                  <div className="w-8 h-1 bg-emerald-600 mb-6"></div>

                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>7 Days Danakil with Semera</p>
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
                                item.day === 1 || item.day === 5 ? "bg-gray-900" : "bg-gray-600"
                              }`}
                            >
                              {item.day === 1 || item.day === 5 ? (
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
                tourName="7 Days Danakil Depression"
              />
    </div>
  )
}
