// Simple test script to verify booking API endpoints
// Run with: node scripts/test-booking-api.js

const BASE_URL = 'http://localhost:3000'

async function testAPI() {
  console.log('🧪 Testing Booking System API Endpoints...\n')
  
  try {
    // Test 1: Fetch Tours
    console.log('1. Testing GET /api/tours')
    const toursResponse = await fetch(`${BASE_URL}/api/tours`)
    if (toursResponse.ok) {
      const tours = await toursResponse.json()
      console.log(`✅ Tours API working - Found ${tours.length} tours`)
      if (tours.length > 0) {
        console.log(`   Sample tour: ${tours[0].name} - $${tours[0].price}`)
      }
    } else {
      console.log(`❌ Tours API failed - Status: ${toursResponse.status}`)
    }
    
    // Test 2: Fetch Vehicles
    console.log('\n2. Testing GET /api/vehicles')
    const vehiclesResponse = await fetch(`${BASE_URL}/api/vehicles`)
    if (vehiclesResponse.ok) {
      const vehicles = await vehiclesResponse.json()
      console.log(`✅ Vehicles API working - Found ${vehicles.length} vehicles`)
      if (vehicles.length > 0) {
        console.log(`   Sample vehicle: ${vehicles[0].make} ${vehicles[0].model} - $${vehicles[0].dailyRate}/day`)
      }
    } else {
      console.log(`❌ Vehicles API failed - Status: ${vehiclesResponse.status}`)
    }
    
    // Test 3: Test specific tour
    console.log('\n3. Testing GET /api/tours/1')
    const tourResponse = await fetch(`${BASE_URL}/api/tours/1`)
    if (tourResponse.ok) {
      const tour = await tourResponse.json()
      console.log(`✅ Single tour API working - ${tour.name}`)
    } else {
      console.log(`❌ Single tour API failed - Status: ${tourResponse.status}`)
    }
    
    // Test 4: Test specific vehicle
    console.log('\n4. Testing GET /api/vehicles/1')
    const vehicleResponse = await fetch(`${BASE_URL}/api/vehicles/1`)
    if (vehicleResponse.ok) {
      const vehicle = await vehicleResponse.json()
      console.log(`✅ Single vehicle API working - ${vehicle.make} ${vehicle.model}`)
    } else {
      console.log(`❌ Single vehicle API failed - Status: ${vehicleResponse.status}`)
    }
    
    // Test 5: Test bookings endpoint (should require auth)
    console.log('\n5. Testing GET /api/bookings (should require auth)')
    const bookingsResponse = await fetch(`${BASE_URL}/api/bookings`)
    if (bookingsResponse.status === 401) {
      console.log('✅ Bookings API correctly requires authentication')
    } else {
      console.log(`❌ Bookings API should require auth - Status: ${bookingsResponse.status}`)
    }
    
    console.log('\n🎉 API Testing Complete!')
    console.log('\nNext steps:')
    console.log('1. Start your development server: npm run dev')
    console.log('2. Populate sample data: Run the SQL script in scripts/populate-sample-data.sql')
    console.log('3. Create a customer account and test the booking flow')
    console.log('4. Visit /dashboard to see your bookings')
    
  } catch (error) {
    console.error('❌ Error testing APIs:', error.message)
    console.log('\nMake sure your development server is running on http://localhost:3000')
  }
}

// Run the test
testAPI()
