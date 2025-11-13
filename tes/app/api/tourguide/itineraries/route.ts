import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { getPool } from '@/lib/db';

// GET /api/tourguide/itineraries - Get custom itineraries for tour guide's assigned tours
export async function GET(request: NextRequest) {
  console.log('=== ITINERARY API CALLED ===');
  try {
    console.log('Step 1: Getting auth token');
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      console.log('No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Step 2: Verifying JWT');
    const payload = verifyJwt(token);
    console.log('JWT payload:', payload);
    
    if (!payload || !payload.user_id || payload.role !== 'tourguide') {
      console.log('Invalid payload or not a tour guide');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Step 3: Getting database pool');
    const pool = getPool();
    console.log('Pool obtained successfully');
    
    console.log('Step 4: Testing database connection...');
    const [testRows] = await pool.execute('SELECT 1 as test');
    console.log('Database test successful:', testRows);
    
    console.log('Step 5: Fetching tours for tour guide ID:', payload.user_id);
    const [rows] = await pool.execute(
      `SELECT 
        b.booking_id,
        b.tour_id,
        b.start_date,
        b.end_date,
        b.number_of_people,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.email as customer_email,
        u.phone_number as customer_phone,
        t.name as tour_name,
        t.destination,
        t.duration_days,
        t.description as tour_description
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.user_id
      LEFT JOIN tours t ON b.tour_id = t.tour_id
      WHERE b.tour_guide_id = ?
      ORDER BY b.start_date ASC`,
      [payload.user_id]
    );
    console.log('Step 6: SQL query completed. Rows found:', Array.isArray(rows) ? rows.length : 0);
    console.log('Raw rows:', JSON.stringify(rows));

    console.log('Step 7: Processing rows into itineraries');
    const itineraries = [];
    
    if (Array.isArray(rows)) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        console.log(`Processing row ${i}:`, JSON.stringify(row));
        
        try {
          const itinerary = {
            custom_itinerary_id: null,
            booking_id: row.booking_id || null,
            tour_id: row.tour_id || null,
            itinerary_data: {
              days: row.tour_description ? [{
                day: 1,
                title: 'Tour Itinerary',
                description: row.tour_description,
                location: row.destination || ''
              }] : []
            },
            created_at: null,
            updated_at: null,
            start_date: row.start_date || null,
            end_date: row.end_date || null,
            number_of_people: row.number_of_people || 0,
            special_requests: row.special_requests || '',
            customer_first_name: row.customer_first_name || '',
            customer_last_name: row.customer_last_name || '',
            customer_email: row.customer_email || '',
            customer_phone: row.customer_phone || '',
            tour_name: row.tour_name || '',
            destination: row.destination || '',
            duration_days: 1,
            itinerary_type: 'tour_based'
          };
          itineraries.push(itinerary);
          console.log(`Row ${i} processed successfully`);
        } catch (rowError) {
          console.error(`Error processing row ${i}:`, rowError);
        }
      }
    }

    console.log('Step 8: Returning', itineraries.length, 'itineraries');
    console.log('Final itineraries:', JSON.stringify(itineraries));
    return NextResponse.json(itineraries);
  } catch (error: any) {
    console.error('=== ERROR IN ITINERARY API ===');
    console.error('Error message:', error?.message || 'Unknown error');
    console.error('Error name:', error?.name || 'Unknown');
    console.error('Error stack:', error?.stack || 'No stack trace');
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch itineraries', 
        details: error?.message || 'Unknown error',
        errorName: error?.name || 'Unknown'
      },
      { status: 500 }
    );
  }
}
