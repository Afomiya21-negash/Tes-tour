"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ChevronDown, Phone } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Itinerary dropdown items
  const itineraryItems = [
    {
      href: "/itinerary/addis-ababa",
      label: "Addis Ababa and Surrounding",
      subItems: [
        { href: "/tours/half-day-trip", label: "Half Day Trip" },
        { href: "/tours/full-day-city-tour", label: "Full day city tour of Addis" },
        { href: "/tours/short-trip-addis", label: "Short trip from Addis" },
      ]
    },
    {
      href: "/itinerary/historical-cultural",
      label: "Historical and cultural",
      subItems: [
        { href: "/tours/12-days-historic-simien", label: "12 Days Historic with Simien" },
        { href: "/tours/9-days-historic-route", label: "9 Days Historic Route" },
        { href: "/tours/7-days-historic-route", label: "7 Days Historic Route" },
      ]
    },
    {
      href: "/itinerary/omo-valley",
      label: "Tribes of Omo Valley",
      subItems: [
        { href: "/tours/south-omo/7-days", label: "OMO Valley – 7 days" },
        { href: "/tours/south-omo/8-days", label: "8 days Omo Valley : Dorze and Arba Minch" },
        { href: "/tours/south-omo/11-days", label: "11 Days Omo valley" },
      ]
    },
    {
      href: "/itinerary/trekking",
      label: "Trekking",
      subItems: [
        { href: "/tours/7-days-simien-mountains", label: "7 Days Simien Mountains" },
        { href: "/tours/12-days-historic-simien", label: "12 Days Historic with Simien" },
        { href: "/tours/3-days-simien-mountains", label: "3 Days Simien Mountains" },
      ]
    },
    {
      href: "/itinerary/adventure",
      label: "Adventure",
      subItems: [
        { href: "/tours/9-days-danakil-tigray", label: "9 Days Danakil with Tigray" },
        { href: "/tours/7-days-danakil-semera", label: "7 Days Danakil with Semera" },
        { href: "/tours/5-days-danakil-depression", label: "5 Days Denakil Depression" },
      ]
    },
    {
      href: "/itinerary/festival",
      label: "Festival",
      subItems: [
        { href: "/tours/meskel-festival", label: "Meskel Festival" },
        { href: "/tours/gena-christmas", label: "Gena (Christmas)" },
        { href: "/tours/timiket-epiphany", label: "Timiket (Epiphany)" },
      ]
    },
  ]

  // Destination dropdown items
  type DropdownItem = {
    href: string;
    label: string;
    subItems?: { href: string; label: string }[];
  };

  const destinationItems: DropdownItem[] = [
    { href: "/destination/historic", label: "Historic" },
    { href: "/destination/cultural", label: "Cultural" },
    { href: "/destination/northern-tour", label: "Northern Tour" },
    { href: "/destination/southern-tour", label: "Southern Tour" },
    { href: "/destination/adventure", label: "Adventure" },
  ]

  // Main navigation items
  const menuItems = [
    { href: "/", label: "HOME" },
    {
      href: "/itinerary",
      label: "ITINERARY",
      hasDropdown: true,
      dropdownItems: itineraryItems,
    },
    { href: "/attractions", label: "ATTRACTIONS" },
    {
      href: "/destination",
      label: "DESTINATION",
      hasDropdown: true,
      dropdownItems: destinationItems,
    },
    { href: "/about", label: "ABOUT US" },
    { href: "/contact", label: "CONTACT" },
  ]

  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label)
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container-max">
        {/* Top section with logo and contact */}
        <div className="flex justify-between items-center py-4 border-b border-gray-100">
          {/* Logo and brand */}
          <Link href="/" className="flex items-center space-x-3">
            {/* Logo placeholder - you can replace this with your actual logo */}
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">LOGO</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tes Tour</h1>
              <p className="text-sm text-gray-600">Tour Ethiopia with Tes</p>
            </div>
          </Link>

          {/* Contact info */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Call us, we are open 24/7</p>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-emerald-600" />
                <span className="text-lg font-semibold text-gray-900">+251 91 123 5681</span>
              </div>
            </div>
          </div>

          {/* Login/Signup Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/login">
              <button className="btn-secondary px-4 py-2">Login</button>
            </Link>
            <Link href="/signup">
              <button className="btn-primary px-4 py-2">Sign Up</button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
          </button>
        </div>

        {/* Navigation menu */}
        <div className="hidden lg:flex items-center justify-center py-4">
          <div className="flex items-center space-x-8">
            {menuItems.map((item) => (
              <div key={item.href} className="relative group">
                {item.hasDropdown ? (
                  <div>
                    <button
                      className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 py-2"
                      onClick={() => handleDropdownToggle(item.label)}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          activeDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown menu */}
                    {activeDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="py-2">
                          {item.dropdownItems?.map((dropdownItem) => (
                            <div key={dropdownItem.href} className="relative group/sub">
                              {dropdownItem.subItems ? (
                                <div className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors duration-200 cursor-pointer">
                                  <span>{dropdownItem.label}</span>
                                  <ChevronDown className="h-4 w-4 rotate-[-90deg] text-gray-400" />
                                  
                                  {/* Sub-dropdown */}
                                  <div className="absolute left-full top-0 ml-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-50">
                                    <div className="py-2">
                                      {dropdownItem.subItems.map((subItem) => (
                                        <Link
                                          key={subItem.href}
                                          href={subItem.href}
                                          className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors duration-200"
                                          onClick={() => setActiveDropdown(null)}
                                        >
                                          {subItem.label}
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <Link
                                  href={dropdownItem.href}
                                  className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors duration-200"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <span>{dropdownItem.label}</span>
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 py-2"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile navigation menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {/* Mobile contact info */}
              <div className="px-4 py-2 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Call us, we are open 24/7</p>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-gray-900">+251 91 123 5681</span>
                </div>
              </div>

              {/* Mobile Login/Signup Buttons */}
              <div className="flex flex-col space-y-2 px-4">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full btn-secondary px-4 py-2">Login</button>
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full btn-primary px-4 py-2">Sign Up</button>
                </Link>
              </div>

              {/* Mobile menu items */}
              {menuItems.map((item) => (
                <div key={item.href}>
                  {item.hasDropdown ? (
                    <div>
                      <button
                        className="flex items-center justify-between w-full text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 py-2"
                        onClick={() => handleDropdownToggle(item.label)}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            activeDropdown === item.label ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Mobile dropdown items */}
                      {activeDropdown === item.label && (
                        <div className="ml-4 mt-2 space-y-2">
                          {item.dropdownItems?.map((dropdownItem) => (
                            <div key={dropdownItem.href}>
                              {dropdownItem.subItems ? (
                                <div>
                                  <div className="text-gray-700 font-medium py-1">
                                    {dropdownItem.label}
                                  </div>
                                  <div className="ml-4 space-y-1">
                                    {dropdownItem.subItems.map((subItem) => (
                                      <Link
                                        key={subItem.href}
                                        href={subItem.href}
                                        className="block text-gray-600 hover:text-emerald-600 transition-colors duration-200 py-1"
                                        onClick={() => {
                                          setActiveDropdown(null)
                                          setIsMenuOpen(false)
                                        }}
                                      >
                                        {subItem.label}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <Link
                                  href={dropdownItem.href}
                                  className="block text-gray-600 hover:text-emerald-600 transition-colors duration-200 py-1"
                                  onClick={() => {
                                    setActiveDropdown(null)
                                    setIsMenuOpen(false)
                                  }}
                                >
                                  {dropdownItem.label}
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="block text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
