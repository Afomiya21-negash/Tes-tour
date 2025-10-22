import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const pool = getPool()
    
    // Update existing tour guide with a default rating
    await pool.execute(
      'UPDATE tourguides SET rating = 4.8 WHERE tour_guide_id = 14'
    )
    
    // Check if there are other tour guides in the users table that don't have entries in tourguides table
    const [tourGuideUsers] = await pool.execute(
      `SELECT u.user_id, u.first_name, u.last_name 
       FROM users u 
       LEFT JOIN tourguides tg ON u.user_id = tg.tour_guide_id 
       WHERE u.role = 'tourguide' AND tg.tour_guide_id IS NULL`
    )
    
    // Add missing tour guides to tourguides table with default ratings
    if (Array.isArray(tourGuideUsers) && tourGuideUsers.length > 0) {
      for (const tg of tourGuideUsers) {
        const userData = tg as any
        await pool.execute(
          `INSERT INTO tourguides (tour_guide_id, license_number, experience_years, specialization, rating) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            userData.user_id,
            `TG${userData.user_id.toString().padStart(5, '0')}`, // Generate license number
            Math.floor(Math.random() * 8) + 2, // Random experience 2-10 years
            'General Tours', // Default specialization
            (Math.random() * 1.5 + 3.5).toFixed(1) // Random rating between 3.5-5.0
          ]
        )
      }
    }
    
    // Test the updated ratings
    const [updatedTourGuides] = await pool.execute(
      `SELECT 
        tg.tour_guide_id,
        tg.rating,
        tg.license_number,
        tg.specialization,
        CONCAT(u.first_name, ' ', u.last_name) as name
      FROM tourguides tg
      JOIN users u ON tg.tour_guide_id = u.user_id
      WHERE tg.rating > 0
      ORDER BY tg.rating DESC`
    )
    
    return NextResponse.json({
      success: true,
      message: 'Tour guide ratings updated successfully',
      updatedTourGuides: Array.isArray(updatedTourGuides) ? updatedTourGuides : []
    })
  } catch (error) {
    console.error('Error updating tour guide ratings:', error)
    return NextResponse.json(
      { error: 'Failed to update tour guide ratings', details: error.message },
      { status: 500 }
    )
  }
}
