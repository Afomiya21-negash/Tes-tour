"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, Phone, Mail, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import BookingPopup from "../../../components/BookingPopup"
export default function EightDaysDanakilViaAwashPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedDays, setExpandedDays] = useState<number[]>([])
  const [expandAll, setExpandAll] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
 const [isBookingOpen, setIsBookingOpen] = useState(false)
  // Sample images for the scrollable gallery
  const images = [
 "/images/danki1.jpg",
    "/images/danki2.jpg",
    "/images/danki3.jpg",
]

 const [selectedImage, setSelectedImage] = useState(images[0])

  const toggleDay = (dayNumber: number) => {
    setExpandedDays((prev) => (prev.includes(dayNumber) ? prev.filter((d) => d !== dayNumber) : [...prev, dayNumber]))
  }

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedDays([])
    } else {
      setExpandedDays([1, 2, 3, 4, 5, 6, 7, 8])
    }
    setExpandAll(!expandAll)
  }

  const itineraryData = [
    {
      day: 1,
      title: "DAY 1: ARRIVAL OF ADDIS ABABA AND SIGHTSEEING",
      content:
        "Up on arrival at Bole International airport you will be meet TES Tours representatives and be taken to your reserved hotel. Depending up on time make sightseeing in Addis Ababa. The sightseeing includes the national museum (where you can see the Lucy fossil skeleton found), Trinity cathedral church and Entoto hills.",
      overnight: "",
    },
    {
      day: 2,
      title: "DAY 2: DRIVE TO AWASH NATIONAL PARK",
      content:
        "Start driving to Awash National Park with its volcano landscapes and savannah grassland habitat for a variety of bird species. we explore the Awash National park where you can spot different kinds of wild animals like, Oryx, gazelle, warthog, Kudu, Baboons and Monkeys and different kinds of birds. The beautiful rift valley land formation over Awash river water falls and different views are also the beautiful part of the game drive in the national park.",
      overnight: "",
    },
    {
      day: 3,
      title: "DAY 3: DRIVE TO AFDERA",
      content:
        "Morning after breakfast start drive after passing the town and cross the Awash River bridge outside the town we get to the junction where the road forks, straight ahead for Dire Dawa and Harar, and left for Djibouti and the Red Sea. This day we wonder the Rift valley scenery and Afar people and their village. Have lunch at Samara, process our entrance permission and also from here we will have two Police men and one road guide accompany us for the Afar depression continue to Afdera.",
      overnight: "",
    },
    {
      day: 4,
      title: "DAY 4: DRIVE TO KUSREWAD AND ERTA ALE",
      content:
        "Heading to kusrewad here where we arrange the camel to ascend our logistics and for those who wish to ride, Local militia and rock guide apart from those who already with us. Late afternoon start walking to Erta eale. Around 5 pm 3 hours trek climb to Erta Ale volcano and overnight on the top of the mountain. Erta Ale is 613 meters tall, with a lava lake, one of only five in the world, at the summit. It is notable for being the longest existing lava lake, present since the early years of the twentieth century.",
      overnight: "",
    },
    {
      day: 5,
      title: "DAY 5: DRIVE TO HAMMED ELA",
      content:
        "Around 9 AM we will be at foot base of the volcanic mountain where our cook and cars camp have our breakfast and drive to Hammed Ela via Kusrewad. This day drive will be the most challenging drive of all day which may be happen to stuck in the Sand and inhospitable weather, we should keep rehydrate to you manage the driving. Arrive Hammed Ela.",
      overnight: "",
    },
    {
      day: 6,
      title: "DAY 6 : DALLOL SULPHUR SPRING, LAKE ASSALE SALT BAR AND CAMEL CARAVANS",
      content:
        "Excursion to Dallol (116 meter below sea level, one of the lowest places in the world) colorful salts mining, visit Lake Assale, follow up camel of caravans and walk with the Afar and people from highland. The traditional way of extracting Salt bar, which once used as local currency, packing on the Camel.You see how they prepare their traditional bread, how they travel, communicate & more. It is another unique experience. Back to Hamed Ela.",
      overnight: "",
    },
    {
      day: 7,
      title: "DAY 07 : HAMMED ELA – MEKELLE",
      content:
        "Drive to Mekele via the town of Berhale in the River bed Ascend all way to the Tigrian highland with the camel caravans and stop for photo over the depression.",
      overnight: "",
    },
    {
      day: 8,
      title: "DAY 8 : FLY TO ADDIS ABABA",
      content:
        "Catch morning flight to fly back Addis. final Shopping at souvenir shop and evening farewell dinner at traditional restaurant with folkloric dance. and transfer to airport for your departure.",
      overnight: "",
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white section-padding">
        <div className="container-max">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">8 Days Danakil Via Awash</h1>
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
                    <p className="font-medium">8 Days Danakil with Tigray</p>
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
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 rounded-full flex items-center justify-center">
                  <div className="text-white font-bold text-2xl">TES</div>
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

          {/* Book Now Section */}
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
                  tourName="Dalol Depression Tour"
                />
    </div>
  )
}
