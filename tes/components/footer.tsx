import Link from "next/link"
import { Home, Smartphone, Phone, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container-max">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Tour Packages */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4 relative pb-2">
              Tour Packages
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-emerald-600"></span>
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link href="/tours/south-omo/7-days" className="hover:text-white transition-colors">
                  OMO Valley - 7 days
                </Link>
              </li>
              <li>
                <Link href="/tours/south-omo/8-days" className="hover:text-white transition-colors">
                  8 days Omo Valley : Dorze and Arba Minch
                </Link>
              </li>
              <li>
                <Link href="/tours/timiket-epiphany" className="hover:text-white transition-colors">
                  Timiket / Epiphany
                </Link>
              </li>
              <li>
                <Link href="/tours/gena-christmas" className="hover:text-white transition-colors">
                  Gena (Christmas)
                </Link>
              </li>
              <li>
                <Link href="/tours/danakil-depression-5-days" className="hover:text-white transition-colors">
                  5 Days Denakil Depression
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Best Trips */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4 relative pb-2">
              Our Best Trips
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-emerald-600"></span>
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link href="/destination/cultural" className="hover:text-white transition-colors">
                  Cultural
                </Link>
              </li>
              <li>
                <Link href="/itinerary/festival" className="hover:text-white transition-colors">
                  Festival
                </Link>
              </li>
              <li>
                <Link href="/itinerary/omo-valley" className="hover:text-white transition-colors">
                  Tribes of Omo Valley
                </Link>
              </li>
              <li>
                <Link href="/destination/northern-tour" className="hover:text-white transition-colors">
                  Northern Tour
                </Link>
              </li>
              <li>
                <Link href="/destination/southern-tour" className="hover:text-white transition-colors">
                  Southern Tour
                </Link>
              </li>
              <li>
                <Link href="/itinerary/addis-ababa" className="hover:text-white transition-colors">
                  Addis Ababa and Surrounding
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4 relative pb-2">
              Contact Details
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-emerald-600"></span>
            </h3>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start space-x-3">
                <Home className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Address</p>
                  <p>Bole Gulf Aziz Building Building</p>
                  <p># 113</p>
                  <p>Addis Ababa, Ethiopia</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <p>Mobile : +251 91 123 5681</p>
              </div>
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <p>Mobile : +251 93 010 8686</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <p>Phone : +251 11 691 0239</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <p>Mail : info@testourandcarrent.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
