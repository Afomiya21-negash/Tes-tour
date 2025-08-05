import { Phone, Mail, MapPin } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white section-padding">
        <div className="container-max text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">About Us</h1>
          <div className="w-16 h-1 bg-amber-400 mx-auto"></div>
        </div>
      </section>

      {/* Main About Content */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Company Overview */}
              <div className="bg-gray-100 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tes Tour & Car Rent</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    TES tour & car rent is a full-service tour and travel provider that serves business and leisure
                    clients who require professional, friendly and efficient organization of their outbound and inbound
                    travel &tourism needs. It was founded as a private company in 2012 with business license number "
                    AA/BO/03/10006019/2005 " and TIN number 0038126739 which has quickly grown to become a leading
                    company in the region and a major player in the international tourism sector.
                  </p>

                  <p>
                    Our company is manned with experienced, knowledgeable, multilingual and highly qualified team based
                    on considerable experience combined with youthful enthusiasm and creative spirit, in-depth knowledge
                    of the services we offer and commitment to all aspects of Travel and Tourism Management.
                  </p>

                  <p>
                    To continue offering its customers with a variety of and best possible quality services, our company
                    has and will strive to have excellent cooperation & relationship with several local and
                    international organizations and suppliers worldwide to meet client needs and expectations.
                  </p>

                  <p>
                    TES's sustainability and practices are directly linked to its employees' believe in fundamental
                    corporate values to satisfy customers with innovative technology, superior quality, value and
                    friendly services. We have highly skilled professionals for the convenience and quick services for
                    our valuable clients.
                  </p>

                  <p>
                    We offer a vast range of travel, hotel accommodation, sightseeing, budget packages, excursions and
                    related products throughout Ethiopia. Our aim is to operate a sustainable business practice that is
                    considerate of the environment and energy resource use.
                  </p>

                  <p>
                    Tes is offering a wide range of distribution of high quality, competitively priced and value added
                    products and services to the travel- market in Ethiopia. We have professional- and specialized
                    business units that best represent our customers' demands. We provide a complete range of ready-made
                    and tailor-made solutions to all travel market segments including individual travel, business
                    travel, and family holidays.
                  </p>
                </div>
              </div>

              {/* Services Section */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="mb-6">
                  <blockquote className="text-lg italic text-gray-600 border-l-4 border-emerald-600 pl-4 mb-6">
                    "TES has the knowledge, expertise and experience to arrange and deliver all travel & tourism"
                    related requests received from a company, family or individual no matter how big, small or unusual"
                  </blockquote>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">Services to make your travels easier</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Tes has the knowledge, expertise and experience to arrange and deliver all travel & tourism related
                  requests received from a company, family or individual no matter how big, small or unusual are the
                  needs. Our staff, your travel consultants loves solving puzzles, no matter how many pieces, in order
                  to clearly see the big picture. Our passion comes from managing and analyzing all of the tiny details
                  that embody leisure and corporate travel—from the simplest to the most challenging needs. Among
                  others, we provide our customers with the following services:
                </p>

                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full mr-3"></div>
                    <span>Air tickets to Ethiopia any destination locally</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full mr-3"></div>
                    <span>Hotel or accommodation types booking</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full mr-3"></div>
                    <span>Transfers, Airport meet/greet and farewell, and car rental</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full mr-3"></div>
                    <span>Visas to Ethiopia</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full mr-3"></div>
                    <span>Travel insurance</span>
                  </div>
                </div>
              </div>

              {/* Mission & Vision */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-emerald-50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Missions</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Our mission is to persuade every customers to come back Ethiopia and introduce more friends about
                    Ethiopia. To create and provide a total Travel Management Package in terms of providing
                    comprehensive and professionally effective service at minimum cost to the customer, using and
                    utilizing the best available resources and technology. Also to nature a work culture and environment
                    internally and externally that promotes total commitment and growth, thus becoming the largest and
                    the most reliable Travel Organization in the region setting standards in the industry for
                    professionalism and reliability to the customer.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Our Vision</h3>
                  <p className="text-gray-700 leading-relaxed">
                    To be the First Choice for Clients and Companies. Our personnel are dedicated to learning as much
                    about a destination as possible. We are the type of travelers that come back from a city with an
                    abundance of suggestions for things to do. We can recommend beaches for snorkeling or diving, road
                    trips which will reveal hidden oasis from the norm, restaurants, shopping, stays at choice,
                    sightseeing and anything our clientele are curious about.
                  </p>
                </div>
              </div>

              {/* Travel Management & Car Rent */}
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Travel-Management</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We are a full service travel management company. It is ranked among the top corporate travel
                    providers, serving all the leading companies. Quality services are delivered with the financial
                    strength, experienced teammates, advanced systems and innovations you would expect from a leader.
                    Tes Tour & Car Rent focuses on your requirements and co-ordinates with your staff to provide you
                    total satisfaction. We offer you every service from consolidated travel purchases to regional,
                    national or global support. We understand the business from the ground up and that enables us to
                    serve you better.
                  </p>
                </div>

                <div className="bg-amber-50 rounded-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Car Rent</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    TES, based in Addis Ababa, provides car rental and tour services in Ethiopia. Ethiopia has
                    established itself as a tourist destination and enjoys great demand for leisure activities. In this
                    regard, the company has a reception counter at Bole International Airport, in response to the
                    increasing number of visitors to Ethiopia each year. Since Addis is the political and economic
                    center of Ethiopia, demand is also high for business car rental services in a wide range of sectors,
                    such as government offices, private businesses and commercial establishments. Car lease services
                    have also developed significantly in response to today's needs. Against this backdrop, TES Car
                    Rent's yearly performance has improved significantly. The company has maintained its firm position
                    as one of the industry's top providers of vehicle rental and lease services in Addis Ababa.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    We own four Coaster 23 seats, two Mini Buses and two Vitz. TES CAR RENTAL gained a well-established
                    reputation for its commitment to offer quality, timely and unparalleled customer service. The
                    company has grown and been enriched with a high qualified staff and crew, always aiming at customer
                    satisfaction and the fulfillment of their needs. Since our clientele is diversified, we offer a wide
                    selection of new models starting from small city cars, medium sized, automatic and luxury cars able
                    to satisfy or give mobile solution at any of your professional or private needs. All car models we
                    provide are new and in excellent condition. Due to high quality services we have built a solid
                    foundation of regular customers and continue to grow, adapt and change as necessary to meet your
                    requirements. The head office of our car rental company is situated at Bole, Gulf Aziz building
                    B113.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">CONTACT INFO</h3>
                <div className="w-8 h-1 bg-emerald-600 mb-6"></div>

                <div className="space-y-6">
                  {/* Phone Numbers */}
                  <div>
                    <div className="flex items-center mb-2">
                      <Phone className="h-5 w-5 text-emerald-600 mr-2" />
                      <span className="font-semibold text-gray-900">Phone:</span>
                    </div>
                    <div className="space-y-1 text-gray-700">
                      <p>+251 93 010 8686</p>
                      <p>+251 91 123 5681</p>
                      <p>+251 11 691 0239</p>
                    </div>
                  </div>

                  {/* Email Addresses */}
                  <div>
                    <div className="flex items-center mb-2">
                      <Mail className="h-5 w-5 text-emerald-600 mr-2" />
                      <span className="font-semibold text-gray-900">Email:</span>
                    </div>
                    <div className="space-y-1 text-gray-700">
                      <p>tesfaye.cartour@gmail.com</p>
                      <p className="underline text-blue-600">info@testourandcarrent.com</p>
                      <p>tes5664@yahoo.com</p>
                    </div>
                  </div>

                  {/* Address */}
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

                {/* Contact Details Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Details of Contacts</h4>
                  <p className="text-sm text-gray-600 mb-2">Tes Tour & Car Rent (Tesfaye Tsige Zemedkun)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
