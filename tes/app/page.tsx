import Image from "next/image"
import { MapPin, Star, Plane, Users, Globe, Bus } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Introduction */}
      <section className="relative bg-gradient-to-r from-emerald-600 to-emerald-800 text-white">
        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Discover Your Next
                <span className="text-amber-400"> Adventure with Tes tour</span>
              </h1>
              <p className="text-xl text-emerald-100">
                Experience authentic travel with local expertise, customizable packages, and transparent pricing. Your
                journey starts here.
              </p>
            </div>
            <div className="relative">
              <Image
                src="/images/beauty1.jpg?height=500&width=600"
                alt="Adventure landscape"
                width={600}
                height={500}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Company Location/Map Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Company Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Tes Tour</h2>
                <div className="w-16 h-1 bg-emerald-600 mb-6"></div>
              </div>

              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  TES tour is a full-service tour and travel provider that serves business and leisure clients who
                  require professional, friendly and efficient organization of their outbound and inbound travel
                  &tourism needs. It was founded as a private company in 2012 with business license number "
                  AA/BO/03/10006019/2005 " and TIN number 0038126739 which has quickly grown to become a leading company
                  in the region and a major player in the international tourism sector.
                </p>

                <p>
                  Our company is manned with experienced, knowledgeable, multilingual and highly qualified team based on
                  considerable experience combined with youthful enthusiasm and creative spirit, in-depth knowledge of
                  the services we offer and commitment to all aspects of Travel and Tourism Management.
                </p>

                <p>
                  To continue offering its customers with a variety of and best possible quality services, our company
                  has and will strive to have excellent cooperation & relationship with several local and international
                  organizations and suppliers worldwide to meet client needs and expectations.
                </p>
              </div>

              <Link href="/about" className="inline-block">
                <button className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200">
                  VIEW MORE
                </button>
              </Link>
            </div>

            {/* Google Maps Embed */}
            <div className="relative">
              <div className="bg-gray-200 rounded-lg h-96 overflow-hidden border-2 border-gray-300">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.6177618935!2d38.7577605!3d9.0054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x8467b6b037a24d49!2sAddis%20Ababa%2C%20Ethiopia!5e0!3m2!1sen!2set!4v1697000000000!5m2!1sen!2set"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Tes Tour Company Location - Addis Ababa, Ethiopia"
                ></iframe>
              </div>

              {/* Map overlay info (similar to Google Maps info box) */}
              <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg shadow-lg p-4 max-w-xs">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Tes Tour Company</h3>
                </div>
                <p className="text-sm text-gray-600">Addis Ababa, Ethiopia</p>
                <div className="flex items-center mt-2">
                  <div className="flex text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-gray-600 ml-2">4.0 • 1 review</span>
                </div>
                <a
                  href="https://maps.app.goo.gl/YMHpoxhmGaiB6RSV8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm mt-2 hover:underline inline-block"
                >
                  View in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Adventure Activities Section */}
      <section
        className="section-padding relative"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("/images/volcano.jpg?height=600&width=1200")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Adventure Activities</h2>
            <div className="w-16 h-1 bg-emerald-400 mx-auto mb-8"></div>
            <p className="text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              Danakil depression one of the most spectacular regions, full of eye-catching colors as in the sulfur
              springs. The desert has several points lying more than 100 meters (328 ft) below sea level, many volcanoes
              in the region, including Erta Ale, a fantastic experience for the adventurous traveller.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* South Omo Card */}
            <Link
              href="/tours/south-omo"
              className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-80">
                <Image
                  src="/images/south omo.jpg?height=320&width=300"
                  alt="South Omo"
                  width={300}
                  height={320}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold text-white mb-2">South Omo</h3>
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
              href="/tours/erta-le"
              className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-80">
                <Image
                  src="/images/erta le.jpg?height=320&width=300"
                  alt="Erta le"
                  width={300}
                  height={320}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Erta le</h3>
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
              href="/tours/trekking"
              className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-80">
                <Image
                  src="/images/trekking.jpg?height=320&width=300"
                  alt="Trekking"
                  width={300}
                  height={320}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Trekking</h3>
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
              href="/tours/dalol-depression"
              className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-80">
                <Image
                  src="/images/dalol.jpg?height=320&width=300"
                  alt="Dalol Depression"
                  width={300}
                  height={320}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Dalol Depression</h3>
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
        </div>
      </section>

      {/* Booking Reasons Section */}
      <section className="section-padding bg-neutral-50">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg overflow-hidden">
            <div
              className="relative h-96 lg:h-auto bg-cover bg-center flex items-center justify-center p-8"
              style={{
                backgroundImage: `url('/images/why.jpg?height=320&width=300')`,
              }}
            >
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="relative z-10 text-white text-center">
                <h2 className="text-4xl lg:text-5xl font-bold mb-4">Why Book with Us</h2>
                <div className="w-16 h-1 bg-emerald-400 mx-auto"></div>
              </div>
            </div>
            <div className="p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Plane className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Air tickets</h3>
                  <p className="text-gray-600">Air tickets to Ethiopia any destination locally</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-emerald-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">100% Customizable</h3>
                  <p className="text-gray-600">
                    Tell us about your trip requirement. We'll work together to customize your trip to meet your exact
                    requirement so that you have a memorable trip.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-emerald-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Local Experts. Middleman Free Pricing</h3>
                  <p className="text-gray-600">
                    We're a local travel agency. When you book with us, you get best possible price, which is middleman
                    free.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-emerald-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Hidden Charges</h3>
                  <p className="text-gray-600">
                    We don't add hidden extras cost. All trips include travel permit, lodging and fooding. There are no
                    surprises with hidden costs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="section-padding bg-gray-900 text-white">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { icon: "Users", number: "150", label: "Number of Customers" },
              { icon: "Globe", number: "680", label: "Number of Trips" },
              { icon: "Plane", number: "225", label: "Trips Types" },
              { icon: "Bus", number: "1,020", label: "Travel with Bus" },
            ].map((stat, index) => (
              <div key={index} className="flex flex-col items-center justify-center">
                <div className="w-40 h-40 rounded-full border-2 border-white flex flex-col items-center justify-center mb-4">
                  {stat.icon === "Users" && <Users className="h-12 w-12 text-white mb-2" />}
                  {stat.icon === "Globe" && <Globe className="h-12 w-12 text-white mb-2" />}
                  {stat.icon === "Plane" && <Plane className="h-12 w-12 text-white mb-2" />}
                  {stat.icon === "Bus" && <Bus className="h-12 w-12 text-white mb-2" />}
                  <div className="text-4xl font-bold text-white">{stat.number}</div>
                  <div className="w-12 h-0.5 bg-emerald-400 mt-2 mb-1"></div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Trips Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Featured Trips</h2>
            <p className="text-xl text-gray-600">Explore our most popular and exciting tour packages</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 5 Days Denakil Depression */}
            <Link
              href="/tours/danakil-depression-5-days"
              className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-80">
                <Image
                  src="/images/danki2.jpg?height=320&width=300"
                  alt="5 Days Denakil Depression"
                  width={300}
                  height={320}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold text-white mb-2">5 Days Denakil Depression</h3>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* 7 Days Danakil Depression Tour */}
            <Link
              href="/tours/danakil-depression-7-days"
              className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-80">
                <Image
                  src="/images/danki1.jpg?height=320&width=300"
                  alt="7 Days Danakil Depression Tour"
                  width={300}
                  height={320}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold text-white mb-2">7 Days Danakil Depression Tour</h3>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* 8 Days Danakil Via Awash */}
            <Link
              href="/tours/danakil-depression-8-days-via-awash"
              className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-80">
                <Image
                  src="/images/danki3.jpg?height=320&width=300"
                  alt="8 Days Danakil Via Awash"
                  width={300}
                  height={320}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold text-white mb-2">8 Days Danakil Via Awash</h3>
                </div>
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
        </div>
      </section>

      {/* Deals & Discounts Section */}
      <section className="section-padding bg-amber-50">
        <div className="container-max">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 lg:p-12 text-white text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Special Deals & Discounts</h2>
            <p className="text-xl mb-8 text-amber-100">
              The Itinerary can easily be amended to include/exclude more days to fit our clients’ schedules and special
              interests with discounts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-amber-600 hover:bg-amber-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
          <Link href="tours/deals">View All Deals</Link>      
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
