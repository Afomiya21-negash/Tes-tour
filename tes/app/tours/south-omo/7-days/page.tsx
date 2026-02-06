"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Phone, Mail, MapPin } from "lucide-react"
import Image from "next/image"
import BookingPopup from "../../../../components/BookingPopup"
const images = [
  "/images/7days omo1.jpg",
  "/images/7days omo2.jpg",
  "/images/7days omo3.jpg",
  "/images/7days omo4.jpg",
  "/images/7days omo5.jpg",
  "/images/7days omo6.jpg",
  "/images/7days omo7.jpg",
  
]

export default function SevenDaysOmoPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedDays, setExpandedDays] = useState<number[]>([])
  const [expandAll, setExpandAll] = useState(false)
  const [selectedImage, setSelectedImage] = useState(images[0])
const [isBookingOpen, setIsBookingOpen] = useState(false)
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
      title: "Day 1: Arrive to Addis",
      content: "Arrival in Addis Abeba, rest up and city tour in Addis",
      overnight: "Addis",
    },
    {
      day: 2,
      title: "Day 2: Arba Minch to Dorze",
      content:
        "You will be met at Arba Minch airport and will take a beautiful drive up the mountains to Dorze village - home of Ethiopia's weavers. You will enjoy a walking tour - visit the traditional bamboo houses, learn how to make the local bread from false banana tree, enjoy the market, watch women spinners and see the famous Dorze weavers. Stay overnight at Dorze Lodge, renowned for the spectacular views of the two Rift Valley lakes. After dinner, sit by the camp fire and enjoy the local singing and dancing.",
      overnight: "",
    },
    {
      day: 3,
      title: "Day 3: Dorze to Arba Minch (Lake Chamo and Nechisar National Park)",
      content:
        "After seeing sunrise, drive to Arba Minch and take a motor boat across Lake Chamo to visit Nechisar National Park. Take a gentle hike across the savannah and see zebras, gazelles and different types of animals. On the return boat ride, you will see giant crocodiles, hippos, local fishermen, pelicans and different types of birds. Spend the evening in Arba Minch. Stay overnight at Haile Resort.",
      overnight: "",
    },
    {
      day: 4,
      title: "Day 4: Jinka-Mago-Mursi-Jinka",
      content:
        "After breakfast, we will drive from Jinka to Mursi Village. The Mursi, undoubtedly the most celebrated residents of South Omo are distinctive group of pastoralists. The Mursi are best known for their unique item of decoration, After our visit to the Mursi Village, we will have our picnic lunch in the Mago National Park and drive to Turmi.",
      overnight: "Buska Lodge",
    },
    {
      day: 5,
      title: "Day 5: Turmi-Omorate",
      content:
        "In the cool morning, we will drive to Omorate to visit the Desanech (Geleb) tribal village after crossing the Omo River by boat. In the afternoon, we will drive to Hamer Village. The Hamer, display an elaborate and diverse selection of body decorations. At the same village we might enjoy the seasonal cultural activities including the famous Evangadi.",
      overnight: "Buska Lodge Day",
    },
    {
      day: 6,
      title: "Day 6: Turmi-Arbaminch",
      content:
        "In the morning, we will start driving back to Arbaminch with brief stops to visit different villages including Erbore and Tsemay. In the afternoon, we will have a boat cruise over Lake Chamo to see some of the biggest African crocodiles. Hippopotamus and many beautiful aquatic birds.",
      overnight: "Paradise Lodge Hotel-Arbaminch",
    },
    {
      day: 7,
      title: "Day 7: Arbaminch –Addis Ababa-Departure",
      content:
        "In the morning, drive back to Addis Ababa en-route visiting the different small towns like Shashemene where Rastafarian lives, Ziway and one of the Great Rift Valley Lakes Ziway. At the end of the farewell dinner, transfer to Addis Ababa airport.B - breakfast, L - lunch, D - dinner",
      overnight: "",
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white section-padding">
        <div className="container-max">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">OMO Valley - 7 days</h1>
          <div className="w-16 h-1 bg-amber-400"></div>
        </div>
      </section>

      {/* Image Gallery */}
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
                      Isolated for millennia from the rest of the world, the beautiful Omo Valley is home to an exciting
                      mix of many small and distinctive tribal groups. Amongst others, we find the Karo, the Mursi and
                      the Hamer-all of whom have retained their own unique customs and traditions. Lifestyles are as
                      varied as the tribes themselves. Lacking any material, culture and artifacts common to other
                      cultures, these tribes find unique ways in which to express their artistic impulses. Both the
                      Surma and the Karo, for example, are experts at body painting, using clays and locally available
                      vegetable pigments to trace fantastic patterns on each other's faces, chests, arms, and legs.
                      These designs are created purely for fun and aesthetic effect, each artist vying to outdo his
                      fellows.In this captivating region, you are privileged to witness age-old customs and rituals,
                      learning of the symbolisms that remain an integral part of everyday life, it's absolutely a unique
                      wilderness.
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
                                item.day === 1 || item.day === 7 ? "bg-gray-900" : "bg-gray-600"
                              }`}
                            >
                              {item.day === 1 || item.day === 7 ? (
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
