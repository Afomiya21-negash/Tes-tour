import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const pool = getPool()
    
    // First, let's check if the itinerary table exists and has the right structure
    const [tables] = await pool.execute("SHOW TABLES LIKE 'itinerary'")
    if (tables.length === 0) {
      console.log('Creating itinerary table...')
      await pool.execute(`
        CREATE TABLE \`itinerary\` (
          \`itinerary_id\` int(11) NOT NULL AUTO_INCREMENT,
          \`tour_id\` int(11) NOT NULL,
          \`day_number\` int(11) NOT NULL,
          \`title\` varchar(200) NOT NULL,
          \`description\` text NOT NULL,
          \`location\` varchar(100) DEFAULT NULL,
          \`overnight_location\` varchar(100) DEFAULT NULL,
          \`activities\` text DEFAULT NULL,
          \`meals_included\` varchar(100) DEFAULT NULL,
          \`created_at\` datetime DEFAULT current_timestamp(),
          \`updated_at\` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
          PRIMARY KEY (\`itinerary_id\`),
          KEY \`tour_id\` (\`tour_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `)
    }

    // Clear existing data
    await pool.execute('DELETE FROM itinerary')

    // Insert sample itineraries for key tours
    const itineraries = [
      // 7 Days Simien Mountains (tour_id = 4)
      { tour_id: 4, day: 1, title: 'Arrival in Addis Ababa', description: 'Arrive in Addis Ababa and city tour including National Museum and Mount Entoto.', location: 'Addis Ababa', overnight: 'Addis Ababa', activities: 'City tour, National Museum, Mount Entoto', meals: 'Dinner' },
      { tour_id: 4, day: 2, title: 'Addis to Bahir Dar', description: 'Drive to Bahir Dar via Debre Libanos and Blue Nile Gorge. Lake Tana boat trip.', location: 'Bahir Dar', overnight: 'Bahir Dar', activities: 'Scenic drive, Lake Tana boat trip', meals: 'Breakfast, Lunch, Dinner' },
      { tour_id: 4, day: 3, title: 'Blue Nile Falls', description: 'Visit Blue Nile Falls and transfer to Gondar. City tour of Gondar.', location: 'Gondar', overnight: 'Gondar', activities: 'Blue Nile Falls, Gondar city tour', meals: 'Breakfast, Lunch, Dinner' },
      { tour_id: 4, day: 4, title: 'Simien Mountains Day Trip', description: 'Full day excursion to Simien Mountains National Park from Gondar.', location: 'Simien Mountains', overnight: 'Gondar', activities: 'National Park visit, wildlife viewing', meals: 'Breakfast, Lunch, Dinner' },
      { tour_id: 4, day: 5, title: 'Gondar to Lalibela', description: 'Drive to Lalibela with visit to Awramba community if time permits.', location: 'Lalibela', overnight: 'Lalibela', activities: 'Scenic drive, community visit', meals: 'Breakfast, Lunch, Dinner' },
      { tour_id: 4, day: 6, title: 'Lalibela Rock Churches', description: 'Full day exploring the famous rock-hewn churches of Lalibela.', location: 'Lalibela', overnight: 'Lalibela', activities: 'Church visits, guided tour', meals: 'Breakfast, Lunch, Dinner' },
      { tour_id: 4, day: 7, title: 'Return to Addis', description: 'Return to Addis Ababa for shopping and departure.', location: 'Addis Ababa', overnight: '', activities: 'Shopping, departure', meals: 'Breakfast, Lunch' },

      // 3 Days Simien Mountains (tour_id = 6)
      { tour_id: 6, day: 1, title: 'Gondar to Sankaber', description: 'Drive from Gondar to Debark, enter Simien NP and hike to Sankaber area.', location: 'Simien Mountains', overnight: 'Sankaber Camp', activities: 'Trekking, wildlife viewing', meals: 'Breakfast, Lunch, Dinner' },
      { tour_id: 6, day: 2, title: 'Sankaber to Geech', description: 'Trek from Sankaber to Geech with panoramic views and Gelada baboons.', location: 'Simien Mountains', overnight: 'Geech Camp', activities: 'Trekking, wildlife viewing', meals: 'Breakfast, Lunch, Dinner' },
      { tour_id: 6, day: 3, title: 'Return to Gondar', description: 'Morning hike and return to Gondar.', location: 'Gondar', overnight: '', activities: 'Morning hike, return journey', meals: 'Breakfast, Lunch' },

      // Dalol Depression Tour (tour_id = 7)
      { tour_id: 7, day: 1, title: 'Arrival in Semera', description: 'Fly/Drive to Semera, obtain permits and briefing. Continue to Hamed Ela via Lake Afdera.', location: 'Hamed Ela', overnight: 'Hamed Ela', activities: 'Permits, Lake Afdera visit', meals: 'Dinner' },
      { tour_id: 7, day: 2, title: 'Dallol Exploration', description: 'Visit Dallol hydrothermal fields, salt flats at Lake Asale, and camel caravans.', location: 'Dallol', overnight: 'Hamed Ela', activities: 'Geological exploration, photography', meals: 'Breakfast, Lunch, Dinner' },
      { tour_id: 7, day: 3, title: 'Return to Addis', description: 'Return via Semera to Addis Ababa.', location: 'Addis Ababa', overnight: '', activities: 'Return journey', meals: 'Breakfast, Lunch' },

      // Full Day Addis Ababa City Tour (tour_id = 12)
      { tour_id: 12, day: 1, title: 'Addis Ababa City Tour', description: 'Full day city tour including National Museum, Holy Trinity Cathedral, Mount Entoto, and Merkato.', location: 'Addis Ababa', overnight: '', activities: 'Museum visit, cathedral tour, market visit', meals: 'Breakfast, Lunch' },

      // Half Day Addis Ababa Tour (tour_id = 13)
      { tour_id: 13, day: 1, title: 'Half Day Addis Tour', description: 'Half day tour of Addis Ababa highlights including National Museum and Entoto or Merkato and coffee ceremony.', location: 'Addis Ababa', overnight: '', activities: 'Museum visit, coffee ceremony', meals: 'Breakfast' }
    ]

    for (const itinerary of itineraries) {
      await pool.execute(
        `INSERT INTO itinerary (tour_id, day_number, title, description, location, overnight_location, activities, meals_included) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [itinerary.tour_id, itinerary.day, itinerary.title, itinerary.description, 
         itinerary.location, itinerary.overnight, itinerary.activities, itinerary.meals]
      )
    }

    // Verify the data
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM itinerary')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Itinerary data populated successfully!',
      count: rows[0].count 
    })
  } catch (error) {
    console.error('Error populating itinerary:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
