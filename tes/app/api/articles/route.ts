import { NextResponse } from "next/server"

// Sample articles data - in a real app, this would come from a database
const articles = [
  {
    id: 1,
    title: "10 Hidden Gems in Southeast Asia You Must Visit",
    excerpt:
      "Discover breathtaking destinations off the beaten path that offer authentic cultural experiences and stunning natural beauty.",
    content: "Full article content would go here...",
    author: "Sarah Johnson",
    date: "2024-03-15",
    readTime: "8 min read",
    category: "Destinations",
    image: "southeast-asia-temple.jpg",
    featured: true,
    tags: ["Southeast Asia", "Hidden Gems", "Culture", "Adventure"],
  },
  {
    id: 2,
    title: "Essential Packing Guide for Adventure Travel",
    excerpt:
      "Learn what to pack for your next adventure trip with our comprehensive guide covering everything from gear to clothing.",
    content: "Full article content would go here...",
    author: "Mike Chen",
    date: "2024-03-12",
    readTime: "6 min read",
    category: "Travel Tips",
    image: "adventure-gear.jpg",
    featured: false,
    tags: ["Packing", "Adventure", "Travel Tips", "Gear"],
  },
  {
    id: 3,
    title: "Sustainable Tourism: How to Travel Responsibly",
    excerpt:
      "Explore ways to minimize your environmental impact while traveling and support local communities in your destinations.",
    content: "Full article content would go here...",
    author: "Emma Rodriguez",
    date: "2024-03-10",
    readTime: "10 min read",
    category: "Sustainable Travel",
    image: "eco-tourism.jpg",
    featured: false,
    tags: ["Sustainability", "Eco-Tourism", "Responsible Travel", "Environment"],
  },
]

// GET /api/articles - Fetch all articles
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")

    let filteredArticles = articles

    // Filter by category if provided
    if (category) {
      filteredArticles = filteredArticles.filter((article) => article.category.toLowerCase() === category.toLowerCase())
    }

    // Filter by featured status if provided
    if (featured === "true") {
      filteredArticles = filteredArticles.filter((article) => article.featured)
    }

    return NextResponse.json({
      success: true,
      data: filteredArticles,
      total: filteredArticles.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch articles" }, { status: 500 })
  }
}

// POST /api/articles - Create a new article (for admin use)
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["title", "excerpt", "content", "author", "category"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create new article object
    const newArticle = {
      id: articles.length + 1,
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      author: body.author,
      date: new Date().toISOString().split("T")[0],
      readTime: body.readTime || "5 min read",
      category: body.category,
      image: body.image || "default-article.jpg",
      featured: body.featured || false,
      tags: body.tags || [],
    }

    // In a real app, you would save this to a database
    articles.push(newArticle)

    return NextResponse.json(
      {
        success: true,
        data: newArticle,
        message: "Article created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create article" }, { status: 500 })
  }
}
