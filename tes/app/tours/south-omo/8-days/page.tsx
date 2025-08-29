"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Phone, Mail, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import BookingPopup from "../../../../components/BookingPopup"
export default function EightDaysOmoPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedDays, setExpandedDays] = useState<number[]>([])
  const [expandAll, setExpandAll] = useState(false)
 const [isBookingOpen, setIsBookingOpen] = useState(false)
  // Add this state inside the component
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Sample images for the scrollable gallery
  const images = [
  "/images/dorze1.jpg",
  "/images/dorze3.jpg",
  "/images/11days omo.jpg",

  
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
      title: "Day 1: Arrive Addis AbabaArrive at Bole (ADD)",
      content:
        "Upon arrival at Addis Ababa Bole International Airport, Transfer to Jupiter Hotel (4 Star).A half day city tour is included in the rate. You visit the National Museum (Lucy), one of the churches in Addis, the Merkato and enjoy the view from the Entoto Mountain.",
      overnight: "",
    },
    {
      day: 2,
      title: "Day 2: Addis Ababa-Arbaminch-Tia Stele (UNESCO World Heritage Site)",
      content:
        "In the morning, start driving south to Tiya, where you will see the southern-most example of a peculiar type of engraved, standing stele which stretch across parts of southern Ethiopia. These steles are believed to have been erected between the 12th and 14th centuries and are almost certainly grave markers.After lunch, we will continue driving to Arbaminch on the way visiting the different small villages Welyita at Sodo and Alaba at Tembaro.",
      overnight: "Paradise Lodge",
    },
    {
      day: 3,
      title: "Day 3: Arbaminch-Jinka",
      content:
        "After an early breakfast, we will drive to Jinka en-route visiting different cultural people and their villages which include the Konso, Tsemai, and Ari. The Konso are famous for their old and unique terracing and unusual engraved wooden statues of Konso grave markers.",
      overnight: "Omo Eco-Jinka",
    },
    {
      day: 4,
      title: "Day 4: Arba Minch to Konso to Turmi",
      content:
        "Drive to Konso, a UNESCO world heritage site. Your village walking tour will include Konso's renowned stone walled terraces and fortified settlements, wooden statues (Waga), and stone steles (a complex system of marking the passing of leaders). Drive to Turmi, a market town and home to the Hamer tribe. Stay overnight at Turmi lodge.",
      overnight: "",
    },
    {
      day: 5,
      title: "Day 5: Karo tribe - Hamer market - Hamer village",
      content:
        "Spend the morning visiting the Karo tribe, famed for their body painting and elaborate headdresses - decorating with nature. Drive back to Turmi in time for the colourful afternoon Hamer market. If there is a coming of age ceremony, attend a bull jumping ceremony. Camp overnight with a BBQ in a Hamer village, where you will welcomed as a member of the family.",
      overnight: "",
    },
    {
      day: 6,
      title: "Day 6: Turmi - Omorate - Dassanech tribe - Jinka",
      content:
        "Drive to Omorate, on the Omo River, which is as deep as one can get into the Omo valley, without entering Kenya. Cross the river to visit Ethiopia's most southern tribe, Dassanech. Afterwards, drive to Jinka which is set in the hills above Mago National Park and capital of the Omo Valley. You will visit the South-Omo Museum & Research Centre which hosts interesting exhibitions. Stay overnight in an Eco lodge.",
      overnight: "",
    },
    {
      day: 7,
      title: "Day 7: Mursi and Ari tribes",
      content:
        "Drive through Mago National Park to visit the Mursi tribe, famed for their unique lip plates. After lunch, visit the Ari Tribe, renowned for their pottery, agriculture and beautiful wall paintings. Stay overnight in an Eco lodge.",
      overnight: "",
    },
    {
      day: 8,
      title: "Day 8: Jinka to Arba Minch",
      content:
        "Drive through the Rift Valley which covered in acacia woodland and studded with lakes, it feels unequivocally African and there many opportunities to take stunning photographs. You will arrive back in Arba Minch in time for the afternoon flight to Addis Ababa.",
      overnight: "",
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white section-padding">
        <div className="container-max">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">8 days Omo Valley : Dorze and Arba Minch</h1>
          <div className="w-4 h-1 bg-amber-400"></div>
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
                    <p>
                      Omo Valley is undoubtedly one of the most unique places on earth and the discovery of human
                      remains dating back nearly 2.5 million years prompted UNESCO to dub the Lower Valley a World
                      Heritage site in 1980.The villages are home to some of Africa's most fascinating ethnic groups and
                      a trip here represents a unique chance for travellers to encounter a culture markedly different
                      from their own. Whether it's wandering through traditional Dassanech villages, watching Hamer
                      people performing a Jumping of the Bulls ceremony or seeing the Mursi's mind-blowing lip plates,
                      your visit here will stay with you for a lifetime.The landscape is diverse, ranging from dry, open
                      savannah plains to forests in the high hills and along the Omo and Mago Rivers. The former
                      meanders for nearly 800km, from southwest of Addis Ababa all the way to Lake Turkana on the Kenyan
                      border.
                    </p>
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
                           tourName="5 Days Denakil Depression"
                         />
    </div>
  )
}
