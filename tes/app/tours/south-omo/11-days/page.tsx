"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Phone, Mail, MapPin } from "lucide-react"

export default function ElevenDaysOmoPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedDays, setExpandedDays] = useState<number[]>([])
  const [expandAll, setExpandAll] = useState(false)

  const toggleDay = (dayNumber: number) => {
    setExpandedDays((prev) => (prev.includes(dayNumber) ? prev.filter((d) => d !== dayNumber) : [...prev, dayNumber]))
  }

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedDays([])
    } else {
      setExpandedDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    }
    setExpandAll(!expandAll)
  }

  const itineraryData = [
    {
      day: 1,
      title: "Day 1:",
      content: "Arrival in Addis Abeba, rest up and city tour in Addis",
      overnight: "Addis",
    },
    {
      day: 2,
      title: "Day 2:",
      content:
        "Drive to Arba Minch via Butajira, Hosanna and Sodo and visit one of the Archeological sites of Tiyas tele's or Addadi Mariyam",
      overnight: "Arbaminch",
    },
    {
      day: 3,
      title: "Day 3:",
      content: "Drive from Arba Minch to Jinka via Konso and en route visit Ari people",
      overnight: "Jinka",
    },
    {
      day: 4,
      title: "Day 4:",
      content: "Excursion to Mago National park and visit Mursi village",
      overnight: "Jinka",
    },
    {
      day: 5,
      title: "Day 5:",
      content:
        "Drive from Jinka to Turmi via Key Afar and Dimeke. if the day Tuesday or Saturday you will have a chance to visit Dimeka Market. If the day is Thursday you will have a chance to visit Key Afer Market.",
      overnight: "Turmi",
    },
    {
      day: 6,
      title: "Day 6:",
      content: "Excursion to Murulle and visit Karo ethnic people",
      overnight: "Turmi",
    },
    {
      day: 7,
      title: "Day 7:",
      content: "Excursion to Omorate , Cross the Omo River and visit Nyangatom and Dasenech villages",
      overnight: "Turmi",
    },
    {
      day: 8,
      title: "Day 8:",
      content:
        "Visit Hamer villages around Turmi and if the day is the lucky one you will encounter the Bull Jumping Ceremony",
      overnight: "Turmi",
    },
    {
      day: 9,
      title: "Day 9:",
      content: "Drive back from Turmi to Arba Minch and en route visit Konso Village",
      overnight: "Arbaminch",
    },
    {
      day: 10,
      title: "Day 10:",
      content: "Drive from Arbaminch to Hawassa and en route visit Dorze Village in Chencha",
      overnight: "Hawassa",
    },
    {
      day: 11,
      title: "Day 11:",
      content:
        "Drive back to Addis Abgba via Abijhathashalla, Langano and Ziway, shopping, day room, Farewell dinner and departure",
      overnight: "",
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white section-padding">
        <div className="container-max">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">11 Days Omo valley</h1>
          <div className="w-16 h-1 bg-amber-400"></div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Tour Description */}
              <div className="mb-8">
                <p className="text-gray-700 leading-relaxed mb-6">
                  When visiting the Omo Valley, planning the dates of the tour with the market days of the different
                  villages, most particularly with those at Dimeka and Key Afer are important and make your tour more
                  interesting. We will help you in designing the programs to fit with market days of each tribal village
                  taking place at different days of the week. Please contact us for discussion and detail tour program.
                </p>
              </div>

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
                      When visiting the Omo Valley, planning the dates of the tour with the market days of the different
                      villages, most particularly with those at Dimeka and Key Afer are important and make your tour
                      more interesting. We will help you in designing the programs to fit with market days of each
                      tribal village taking place at different days of the week. Please contact us for discussion and
                      detail tour program.
                    </p>

                    <p className="font-semibold">
                      Visitors who want to take photos of the ethnic groups in the Omo are expected to pay for each
                      photograph.
                    </p>

                    <p className="font-semibold">
                      The Itinerary can easily be adjusted to fit our clients' schedules and special interests.
                      Furthermore, it could easily be extended to take in some other famous parks such as the Bale
                      Mountain national park or to combine with other routes.
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
                                item.day === 1 || item.day === 11 ? "bg-gray-900" : "bg-gray-600"
                              }`}
                            >
                              {item.day === 1 || item.day === 11 ? (
                                <MapPin className="h-4 w-4 text-white" />
                              ) : (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="font-semibold text-gray-900">
                              Day {item.day} : Day {item.day}:
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
            <button className="btn-primary text-lg px-12 py-4">Book Now</button>
          </div>
        </div>
      </section>
    </div>
  )
}
