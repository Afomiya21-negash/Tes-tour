"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, Phone, Mail, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import BookingPopup from "../../../components/BookingPopup"
export default function TwelveDaysHistoricSimienPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedDays, setExpandedDays] = useState<number[]>([])
  const [expandAll, setExpandAll] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  // Sample images for the scrollable gallery
  const images = [
 "/images/simien1.jpg",
    "/images/simien2.jpg",
    "/images/simien3.jpg",
   
]

 const [selectedImage, setSelectedImage] = useState(images[0])

  const toggleDay = (dayNumber: number) => {
    setExpandedDays((prev) => (prev.includes(dayNumber) ? prev.filter((d) => d !== dayNumber) : [...prev, dayNumber]))
  }

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedDays([])
    } else {
      setExpandedDays([1, 2, 3, 4, 5, 6, 7, 8,9,10,11,12])
    }
    setExpandAll(!expandAll)
  }

  const itineraryData = [
    {
      day: 1,
      title: "Day 1 Welcome To Testour",
      content:
       "Welcome To Testour and car rent in Addis Ababa Ethiopia will meet all clients arriving at the airport regardless of arrival time. For morning flight arrivals you may begin your tour after checking into your hotel. For afternoon or evening arrivals, you may begin your tour the following day. Visit a great introduction to Ethiopian culture and history. Tour the Mercato, one of Africa's largest outdoor markets, and Trinity Cathedral, አንድነት ፓርክ Unity Park, National Museum of Ethiopia (የኢትዮጵያ ብሔራዊ ሙዚየም) resting place of Emperor Haile Selassie..",
      overnight: "",
    },
    {
      day: 2,
      title: "DAY 2: Addis Ababa To Bahar Dar",
      content:
      "Fly to Bahar Dar on Ethiopian Airlines. Visit the marketplace in Bahar Dar. Take a boat tour on Lake Tana, the source of the Blue Nile and tour ancient island monasteries.",
      overnight: "",
    },
    {
      day: 3,
      title: "DAY 3:Bahar Dar To Gondar",
      content:
       "Drive through the countryside to Gondar. Tour the Royal Enclosure, a UNESCO World Heritage site featuring five castles built by a succession of Ethiopian Kings beginning in the early 17th century. Having survived several wars, including air raids during World War 2, the castles are a testament to the resilience of this once mighty African Empire. Visit the church of Debre Birhan Selassie, famous for its religious art and especially its iconic ceiling depicting angels.",
      overnight: "",
    },
    {
      day: 4,
      title: "DAY 4:Gondar To Simien Mountains National Park",
      content:
        "Drive to Sankabar the gateway to the Simien Mountains National Park, a UNESCO World Heritage site. Enjoy some light hiking in the afternoon in the park and spot wildlife such as the endemic Gelada baboon.",
      overnight: "",
    },
    {
      day: 5,
      title: "DAY 5:Simien Mountains To Axum",
      content:
       "Take a scenic drive to Axum, capital of the ancient Axumite Empire and a UNESCO World Heritage Site. Frequent stops at viewpoints along the way. Arrive in Axum late afternoon.",
      overnight: "",
    },
    {
      day: 6,
      title: "DAY 6 : Axum To Hawzen (Ge'ez: ሓውዜን)",
      content:
       "Drive to the Ghiralta Lodge passing the Adwa battlefield, site of Emperor Menelik II's 1895 victory over the invading Italians. Visit the 2,500 year old ruins of Yeha, an ancient moon temple. Continue past Adigrat and visit Aba Gerima and Petros Paulos, two of the Tigray region's oldest and finest rock churches.​",
      overnight: "",
    },
    {
      day: 7,
      title: "DAY 07 :Hawzen (Ge'ez: ሓውዜን) To Mekele",
      content:
        "The church of Abreha and Atsbeha is one of the oldest and best-known rock-hewn churches in Tigray. It lies in a rural community about 18 km west of Wukro. To get there you drive north. Just as you exit Wukro, you take a take a hard left down a long dirt and gravel road which twists and turns up and down the hills and mountains through numerous hairpin turns until you finally reach the church itself. The mosque is under the wing of Wukro Culture and Tourism Bureau. ... Programme Coordinator Mehmet Ali Yetis told The Ethiopian Herald.",
      overnight: "",
    },
    {
      day: 8,
      title: "DAY 8 : Mekele To Lalibela",
      content:
       "There are no direct bus that goes to Lalibela from Mekele but you have to take a bus to Woldiya and find a minibus or a big bus In Woldiya that ...",
      overnight: "",
    },
     {
      day: 9,
      title: "DAY 9 :Lalibela",
      content:
       "Tour the magnificent rock-hewn churches of Lalibela, a UNESCO World Heritage site. This group of eleven monolithic and semi- monolithic structures were carved directly into the stone of the mountainside at least 800 years ago. This complex boasts the largest monolithic church in the world, a maze of passageways and tunnels, intricately carved reliefs, and fabulous examples of icon paintings.",
      overnight: "",
    },
     {
      day: 10,
      title: "DAY 10 : Lalibela",
      content:
      "At our second day in Lalibela we need about half a day to visit the remaining churches in the village. There are quite a few options to spent the rest of our time. For example a visit to the Yemrehane Kristos church or a hike to the Asheton Maryam church. On Saturday there is the weekly market in town. (it is possible to add additional days to explore more of Lalibela and the surrounding area, excellent hiking opportunities are available)",
      overnight: "",
    },
     {
      day: 11,
      title: "DAY 11 :Lalibela",
      content:
       "For the morning we have two choices: Take a morning hike with mules to Mount Asheton, with its 13th century rock-hewn monastery and great views of the town; - OR - Drive to Yemrehanna Kristos, a beautiful church situated in a shallow cave that predates the churches of Lalibela. The drive to Yemrehanna will also give you the opportunity to view the rural countryside and villages of the Ethiopian highlands. Following either option above continue with tour of Lalibela’s churches in the afternoon.",
      overnight: "",
    },
     {
      day: 12,
      title: "DAY 11 :Lalibela to Addis Ababa",
      content:
       "Fly to Addis Ababa on Ethiopian Airlines. Visit either the Ethnographic Museum or the National Museum, home of the 3.18 million year old skeleton of Lucy. Optional souvenir shopping in the afternoon. Farewell dinner at a traditional Ethiopian restaurant featuring dancers and musicians representing some of the country's many ethnic groups. Transfer to airport for late night departure if needed.",
      overnight: "",
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white section-padding">
        <div className="container-max">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">12 Days Historic with Simien</h1>
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
                The Semien Mountains, in northern Ethiopia, north east of Gondar in Amhara region, are part of the Ethiopian Highlands. They are a World Heritage Site and include the Simien Mountains National Park. The mountains consist of plateaus separated by valleys and rising to pinnacles.
                    </p>
                    <p>Famous for its dramatic highland scenery, the Simien Mountain National Park constitutes a world heritage site, and the mountains’ jagged peaks (or ambas) frequently serve as a backdrop to Ethiopian tourist initiatives. These gigantic pieces of rock are, in fact, hard cores of volcanic outlets from which the surrounding material has eroded away over the centuries.</p>
                    <p>Gondar was the imperial capital from the 17th to mid-19th centuries, and today visitors can see the imperial compound, with castles still in good condition (some recently restored by UNESCO after bombings in World War II), and also the bath of King Fasilides, where at Timkat (Ethiopian Epiphany) a nearby river’s course is purposely changed to bring its flow in to fill an area the size of a small swimming pool. This is the sight of a traditional re-enactment of the baptism of Christ, where worshippers plunge into the pool every January 19th.

Although many of Gondar’s churches were destroyed during the Mahdist invasion from Sudan in the 1880s, one very fine example, Debre Berhan Selassie, was saved, according to the legend, by a swarm of bees, which routed the invaders. The walls and ceiling are completely covered with murals. Also worth a visit are the ruined palace of Queen Mentowab, and the church of Qusquam.</p>
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
                  tourName="12 Days Historic with Simien"
                />
    </div>
  )
}
