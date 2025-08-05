import { NextResponse } from "next/server"

// GET /api/stats - Get website statistics
export async function GET() {
  try {
    // In a real application, these would come from your database
    const stats = {
      customers: {
        total: 10247,
        growth: "+12%",
        label: "Happy Customers",
      },
      destinations: {
        total: 523,
        growth: "+8%",
        label: "Destinations",
      },
      experience: {
        total: 15,
        growth: "Since 2009",
        label: "Years Experience",
      },
      satisfaction: {
        total: 98.5,
        growth: "+2.1%",
        label: "Satisfaction Rate",
      },
      bookings: {
        thisMonth: 342,
        lastMonth: 298,
        growth: "+14.8%",
      },
      revenue: {
        thisMonth: 125000,
        lastMonth: 108000,
        growth: "+15.7%",
      },
      popularDestinations: [
        { name: "Nepal", bookings: 89, growth: "+23%" },
        { name: "Maldives", bookings: 76, growth: "+18%" },
        { name: "Kenya", bookings: 64, growth: "+31%" },
        { name: "Peru", bookings: 52, growth: "+12%" },
        { name: "Iceland", bookings: 48, growth: "+8%" },
      ],
      recentActivities: [
        {
          id: 1,
          type: "booking",
          message: "New booking for Himalayan Trek",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        },
        {
          id: 2,
          type: "review",
          message: "5-star review for Maldives package",
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
        },
        {
          id: 3,
          type: "inquiry",
          message: "New inquiry for African Safari",
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        },
      ],
    }

    return NextResponse.json({
      success: true,
      data: stats,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch statistics" }, { status: 500 })
  }
}
