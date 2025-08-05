import Image from "next/image"
import Link from "next/link"
import { Calendar, User, ArrowRight } from "lucide-react"

// Sample article data
const articles = [
  {
    id: 1,
    title: "10 Hidden Gems in Southeast Asia You Must Visit",
    excerpt:
      "Discover breathtaking destinations off the beaten path that offer authentic cultural experiences and stunning natural beauty.",
    author: "Sarah Johnson",
    date: "March 15, 2024",
    readTime: "8 min read",
    category: "Destinations",
    image: "southeast asia hidden temple",
    featured: true,
  },
  {
    id: 2,
    title: "Essential Packing Guide for Adventure Travel",
    excerpt:
      "Learn what to pack for your next adventure trip with our comprehensive guide covering everything from gear to clothing.",
    author: "Mike Chen",
    date: "March 12, 2024",
    readTime: "6 min read",
    category: "Travel Tips",
    image: "adventure travel backpack gear",
    featured: false,
  },
  {
    id: 3,
    title: "Sustainable Tourism: How to Travel Responsibly",
    excerpt:
      "Explore ways to minimize your environmental impact while traveling and support local communities in your destinations.",
    author: "Emma Rodriguez",
    date: "March 10, 2024",
    readTime: "10 min read",
    category: "Sustainable Travel",
    image: "sustainable eco tourism nature",
    featured: false,
  },
  {
    id: 4,
    title: "Best Photography Spots for Nature Lovers",
    excerpt:
      "Capture stunning landscapes and wildlife with our guide to the world's most photogenic natural locations.",
    author: "David Park",
    date: "March 8, 2024",
    readTime: "7 min read",
    category: "Photography",
    image: "nature photography landscape",
    featured: false,
  },
  {
    id: 5,
    title: "Cultural Etiquette: Respecting Local Customs",
    excerpt:
      "Navigate different cultures with confidence by understanding local customs, traditions, and social norms.",
    author: "Lisa Thompson",
    date: "March 5, 2024",
    readTime: "9 min read",
    category: "Culture",
    image: "cultural customs traditional ceremony",
    featured: false,
  },
  {
    id: 6,
    title: "Budget Travel: Maximum Adventure, Minimum Cost",
    excerpt:
      "Discover how to have incredible travel experiences without breaking the bank with these money-saving strategies.",
    author: "Alex Kumar",
    date: "March 3, 2024",
    readTime: "12 min read",
    category: "Budget Travel",
    image: "budget travel backpacker hostel",
    featured: false,
  },
]

export default function ArticlesPage() {
  const featuredArticle = articles.find((article) => article.featured)
  const regularArticles = articles.filter((article) => !article.featured)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white section-padding">
        <div className="container-max text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Latest Articles</h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            Discover travel tips, destination guides, and inspiring stories from fellow adventurers around the world.
          </p>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="section-padding">
          <div className="container-max">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative h-64 lg:h-auto">
                  <Image
                    src={`/placeholder.svg?height=400&width=600&query=${featuredArticle.image}`}
                    alt={featuredArticle.title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="mb-4">
                    <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">
                      {featuredArticle.category}
                    </span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">{featuredArticle.title}</h2>
                  <p className="text-gray-600 mb-6 text-lg">{featuredArticle.excerpt}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <User className="h-4 w-4 mr-2" />
                    <span className="mr-4">{featuredArticle.author}</span>
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="mr-4">{featuredArticle.date}</span>
                    <span>{featuredArticle.readTime}</span>
                  </div>
                  <Link
                    href={`/articles/${featuredArticle.id}`}
                    className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                  >
                    Read Full Article
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="section-padding">
        <div className="container-max">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Articles</h2>
            <p className="text-gray-600">Stay updated with the latest travel insights and adventure stories</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative">
                  <Image
                    src={`/placeholder.svg?height=250&width=400&query=${article.image}`}
                    alt={article.title}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded text-xs font-semibold">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <User className="h-4 w-4 mr-1" />
                    <span className="mr-3">{article.author}</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{article.date}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{article.readTime}</span>
                    <Link
                      href={`/articles/${article.id}`}
                      className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors text-sm"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="section-padding bg-emerald-600">
        <div className="container-max text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-emerald-100 mb-8 text-lg">
              Subscribe to our newsletter and never miss the latest travel tips, destination guides, and exclusive
              deals.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
              <button type="submit" className="btn-secondary whitespace-nowrap">
                Subscribe
              </button>
            </form>
            <p className="text-emerald-200 text-sm mt-4">No spam, unsubscribe at any time.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
