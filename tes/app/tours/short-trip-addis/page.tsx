"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, Phone, Mail, MapPin, ChevronLeft, ChevronRight } from "lucide-react"

export default function ShortTripPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedDays, setExpandedDays] = useState<number[]>([])
  const [expandAll, setExpandAll] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Sample images for the scrollable gallery
  const images = [
 "/images/addis4.jpg",
    "/images/addis7.jpg",
    "/images/addis1.jpg",
   
]

 const [selectedImage, setSelectedImage] = useState(images[0])

  const toggleDay = (dayNumber: number) => {
    setExpandedDays((prev) => (prev.includes(dayNumber) ? prev.filter((d) => d !== dayNumber) : [...prev, dayNumber]))
  }

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedDays([])
    } else {
      setExpandedDays([1, 2, 3, 4, 5, 6, 7, 8,9,10,11])
    }
    setExpandAll(!expandAll)
  }

  const itineraryData = [
    {
      day: 1,
      title: "Day 1 :Option 1: United park",
      content:
       "Andenet Park(United park) Unity Park located within the National Palace of Ethiopia Addis Ababa , embodies generational legacy of Ethiopia And Ethiopians.",
      overnight: "",
    },
    {
      day: 2,
      title: "DAY 2: Option 2: National museum",
      content:
      "National museum The museum houses Ethiopia's artistic treasures. It contains many precious local archaeological finds such as the fossilized remains of early hominids, the most famous of which is lucy, the partial skeleton of a specimen of Australopithecus afarensis. Recently added to the basement gallery is a display on Selam, found between 2000 and 2004.",
      overnight: "",
    },
    {
      day: 3,
      title: "DAY 3: Option 3: Mount Entoto",
      content:
       "Mount Entoto (Amharic: እንጦጦ) is the highest peak on the Entoto Mountains, which overlooks the city of Addis Ababa, the capital of Ethiopia. It reaches 3,200 meters above sea level.",
      overnight: "",
    },
    {
      day: 4,
      title: "DAY 4:Option 4: Merkato",
      content:
        "Merkato is the largest open air market in Africa, covering several square miles and employing an estimated 13,000 people in 7,100 business entities. The primary merchandise passing through the Merkato is locally-grown agricultural products — most notably coffee.Prior to the current Merkato, there was an open market place in Addis Ababa near St. George Church at the site where the City Hall stands now, but it ended with the Italian occupation of the 1930s.",
      overnight: "",
    },
    {
      day: 5,
      title: "DAY 5: Option 5: Lake Ziway",
      content:
       "Early morning, depart south from Addis Ababa to Lake Ziway, one of the chain of lakes found in the Great Rift Valley. Here you will take a boat trip on Lake Ziway to the island of Tullo Gudo. The island hosts the church of Maryam Tsion which, according to tradition, once housed the Ark of the Covenant to hide it from invaders. After the visit, return to shore, enjoying the bountiful birdlife on this lake and possibly some hippos. Return to Addis Ababa late afternoon.",
      overnight: "",
    },
    {
      day: 6,
      title: "DAY 6 : Option 6 : Menagesha National Forest",
      content:
       "Menagesha National Forest Departing west from Addis Ababa, drive to the Menagesha National Forest for some hiking. Here you will enjoy the wildlife, such as the colobus monkeys and endemic Menelik’s bushbuck, as well as birds, including the endemic Ethiopian oriole and Abyssinian woodpecker. You can also stop at the Gefersa Reservoir, which supplies water to Addis Ababa, and is a nice bird watching and wildlife spot. Return to Addis Ababa in the afternoon.",
      overnight: "",
    },
    {
      day: 7,
      title: "DAY 07 :Option 7: Debre Libanos Monastery",
      content:
        "Debre Libanos Monastery Drive north from Addis Ababa (about 100km) to the Debre Libanos Monastery. This monastery was founded in the 13th century by St. Tekle Haimanot, who, according to legend, prayed for 7 years straight standing on one leg until the other leg fell off. Nearby the monastery is the Portuguese bridge, which was the first bridge in Ethiopia. Around this area, you will hopefully see some endemic gelada baboons. Short hikes are available in the area, with stunning views of the Jemma Valley. Return to Addis Ababa, late afternoon.",
      overnight: "",
    },
    {
      day: 8,
      title: "DAY 8 : Option 8 : Archeological sites",
      content:
       "Archeological sites of Tiya, Adadi Maryam and Melka Kunture After breakfast, depart south from Addis Ababa to visit these archeological sites of interest. Tiya is an ancient stellae field, with anthropomorphic statues marking burial grounds. Tiya is a UNESCO World Heritage Site. Adadi Maryam is a rock-hewn church, similar to those in Lalibela. Melka Kunture is a pre-historic tool-making site. Return to Addis Ababa late afternoon.",
      overnight: "",
    },
     {
      day: 9,
      title: "DAY 9 :Option 9: Lake Wenchi",
      content:
       "Lake Wenchi Early morning departure west from Addis Ababa to Lake Wenchi, a crater lake in a stunning location. There are many options for activities in the area including hiking, horseback riding or a boat trip to the island monastery of Kirkos and the hot spring valley. After the visit, return to Addis Ababa.",
      overnight: "",
    },
     {
      day: 10,
      title: "DAY 10 : Option 10 : Debre Zeit",
      content:
      "Debre Zeit Depart from Addis for a short drive to Debre Zeit, home to several crater lakes and a popular weekend getaway spot for Addis Ababa residents. You can spend the day visiting the lakes or doing some light hiking (circling Lake Hora takes 1 ½ hours). The area is very popular for birdwatching. There are several lake-side establishments for lunch and even a spa. Return to Addis Ababa, late afternoon.",
      overnight: "",
    },
     {
      day: 11,
      title: "DAY 11 : Option 11 : Mt. Zuqualla",
      content:
       "Mt. Zuqualla Very near to Debre Zeit is Mt. Zuqualla, an extinct volcano that offers beautiful views of the surrounding areas. Here you can visit the monastery of Mt. Zuqualla Maryam, which may date back as far as the 4th century. The nearby crater-lake is considered holy by the monks of the monastery. Time permitting, you may stop for a rest in Debre Zeit before returning to Addis Ababa in the afternoon.",
      overnight: "",
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white section-padding">
        <div className="container-max">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Short trip from addis</h1>
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Adventure</h3>
                  <div className="w-8 h-1 bg-emerald-600 mb-6"></div>

                  <div className="space-y-4 text-gray-700 leading-relaxed">
                   
                    <p>
                    Ethiopia offers a wealth of attractions for culture buffs, from centuries old rock-hewn churches to atmospheric, historical towns and grand castles.

There are hundreds of rock- hewn churches found in Tigray Region built in the 12th to the 15th century, most of them perched in inaccessible mountain tops. The majority of them are concentrated around Hawzien, Adigrat and wiqro.

Lalibella could be considered as the 8th wonder of the world. A cluster of eleven churches divided in to two groups are all hewn out of solid rocks. These amazing fits of architecher were able to be achieved in the 12th century.
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
            <button className="btn-primary text-lg px-12 py-4">Book Now</button>
          </div>
        </div>
      </section>
    </div>
  )
}
