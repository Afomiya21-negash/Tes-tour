import { NextResponse } from "next/server"

// POST /api/contact - Handle contact form submissions
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["firstName", "lastName", "email", "subject", "message"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    // Create contact submission object
    const contactSubmission = {
      id: Date.now(), // Simple ID generation
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone || null,
      subject: body.subject,
      message: body.message,
      newsletter: body.newsletter || false,
      submittedAt: new Date().toISOString(),
      status: "new",
    }

    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification to admin
    // 3. Send confirmation email to user
    // 4. Integrate with CRM system

    console.log("New contact submission:", contactSubmission)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: "Thank you for your message! We will get back to you within 24 hours.",
      data: {
        id: contactSubmission.id,
        submittedAt: contactSubmission.submittedAt,
      },
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to submit contact form. Please try again." },
      { status: 500 },
    )
  }
}

// GET /api/contact - Get contact submissions (for admin use)
export async function GET(request: Request) {
  try {
    // In a real app, this would fetch from database with proper authentication
    // This is just a placeholder for admin functionality

    return NextResponse.json({
      success: true,
      message: "Contact submissions endpoint - requires admin authentication",
      data: [],
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch contact submissions" }, { status: 500 })
  }
}
