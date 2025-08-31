"use client"
import { useState } from "react"
import Image from "next/image"
import { Heart, MapPin, Check } from "lucide-react"
import Link from "next/link"

export default function AddisAbabaPage() {
  const [favoritedCards, setFavoritedCards] = useState<{ [key: string]: boolean }>({
    "full": false,
    "short": false,
    "half": false,
    
  });

  const tours = [
    {
      id: "full",
      title: "Full day city tour of Addis",
      image: "/images/addis1.jpg",
      duration: "",
      route: "/tours/full-day-city-tour",
      nextDepartures: [
        "August 31, 2025",
        "September 1, 2025", 
        "September 2, 2025"
      ],
      availableMonths: ["Aug", "Sep", "Oct","Nov","Dec"]
    },
    {
      id: "short", 
      title: "Short trip from Addis",
      image: "/images/addis2.jpg",
      duration: "",
      route: "/tours/short-trip-addis",
      nextDepartures: [
        "August 31, 2025",
        "September 1, 2025",
        "September 2, 2025"
      ],
      availableMonths:  ["Aug", "Sep", "Oct","Nov","Dec"]
    },
     {
      id: "half", 
      title: "Half Day Trip",
      image: "/images/addis4.jpg",
      duration: "9 Days",
      route: "/tours/half-day-trip",
      nextDepartures: [
        "August 31, 2025",
        "September 1, 2025",
        "September 2, 2025"
      ],
      availableMonths:  ["Aug", "Sep", "Oct","Nov","Dec"]
    },
  
  ];

  const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const toggleFavorite = (cardId: string) => {
    setFavoritedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">orthen Tours</h1>
          
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <div key={tour.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Image Section */}
              <div className="relative h-64">
                <Image
                  src={tour.image}
                  alt={tour.title}
                  fill
                  className="object-cover"
                />
                
               

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(tour.id)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      favoritedCards[tour.id] ? 'fill-red-500 text-red-500' : 'text-gray-600'
                    }`}
                  />
                </button>

                {/* Location Pin (only for 12 days tour) */}
                {tour.id === "12-days" && (
                  <div className="absolute bottom-4 right-4 p-2 rounded-full bg-black/80">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{tour.title}</h3>



                {/* Duration */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  {tour.id === "12-days" && (
                    <p className="text-sm font-semibold text-gray-900">{tour.duration}</p>
                  )}
                </div>

                {/* View Details Button */}
                <Link href={tour.route}>
                  <button className="w-full mb-6 bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-lg font-medium transition-colors">
                    View Details
                  </button>
                </Link>
                

                {/* Next Departures */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-3">Next Departures</p>
                  <div className="space-y-2">
                    {tour.nextDepartures.map((departure, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">
                          {departure} <span className="text-gray-500 italic">(Available)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability Calendar */}
                <div>
                  <p className="text-sm text-gray-600 mb-3">Availability:</p>
                  <div className="grid grid-cols-6 gap-2">
                    {allMonths.map((month) => (
                      <span
                        key={month}
                        className={`text-xs text-center py-1 ${
                          tour.availableMonths.includes(month) 
                            ? "text-gray-900 font-medium" 
                            : "text-gray-400"
                        }`}
                      >
                        {month}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}