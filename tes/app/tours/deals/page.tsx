"use client"
import Image from "next/image"
import { MapPin, Star, Plane, Users, Globe, Bus } from "lucide-react"
import Link from "next/link"

export default function AttractionsPage() {
    return(
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* South Omo Card */}
         
            <Link
              href="/tours/adventure"
              className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-80">
                <Image
                  src="/images/danki1.jpg?height=520&width=500"
                  alt="South Omo"
                  width={300}
                  height={320}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Adventure</h3>
                </div>
                {/* Green Arrow on Hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Erta le Card */}
            <Link
              href="/tours/cultural"
              className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-80">
                <Image
                  src="/images/11days omo.jpg?height=320&width=300"
                  alt="Erta le"
                  width={300}
                  height={320}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Cultural (3trips)</h3>
                </div>
                {/* Green Arrow on Hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Trekking Card */}
            <Link
              href="/tours/historic"
              className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-80">
                <Image
                  src="/images/fasil.jpg?height=320&width=300"
                  alt="Trekking"
                  width={300}
                  height={320}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Historic</h3>
                </div>
                {/* Green Arrow on Hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Dalol Depression Card */}
            <Link
              href="/tours/northern-tour"
              className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-80">
                <Image
                  src="/images/simien1.jpg?height=320&width=300"
                  alt="Dalol Depression"
                  width={300}
                  height={320}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold text-white mb-2">North (2trips)</h3>
                </div>
                {/* Green Arrow on Hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
              <Link
              href="/tours/southern-tour"
              className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-80">
                <Image
                  src="/images/7days omo4.jpg?height=320&width=300"
                  alt="Dalol Depression"
                  width={300}
                  height={320}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold text-white mb-2">South (2trips)</h3>
                </div>
                {/* Green Arrow on Hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>


          </div>
    )
}