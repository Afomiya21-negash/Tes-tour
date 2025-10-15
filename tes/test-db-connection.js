// Simple test to check database connection and populate sample data
const { getPool } = require('./lib/db.js');

async function testConnection() {
  let pool;
  
  try {
    console.log('Testing database connection...');
    pool = getPool();
    
    // Test basic connection
    const [result] = await pool.execute('SELECT 1 as test');
    console.log('✅ Database connection successful!');
    
    // Check if bookings table exists and count
    const [bookingCount] = await pool.execute('SELECT COUNT(*) as count FROM bookings');
    console.log(`📊 Current bookings in database: ${bookingCount[0].count}`);
    
    // If no bookings, populate sample data
    if (bookingCount[0].count === 0) {
      console.log('🔄 No bookings found. Populating sample data...');
      
      // Insert sample customers
      await pool.execute(`
        INSERT IGNORE INTO users (user_id, username, email, password_hash, first_name, last_name, phone_number, role) VALUES
        (300, 'customer1', 'john.doe@email.com', '$2b$10$example_hash_6', 'John', 'Doe', '+251911789012', 'customer'),
        (301, 'customer2', 'jane.smith@email.com', '$2b$10$example_hash_7', 'Jane', 'Smith', '+251911890123', 'customer'),
        (302, 'customer3', 'mike.wilson@email.com', '$2b$10$example_hash_8', 'Mike', 'Wilson', '+251911901234', 'customer')
      `);
      
      // Insert sample bookings
      await pool.execute(`
        INSERT IGNORE INTO bookings (booking_id, customer_id, tour_id, vehicle_id, driver_id, tour_guide_id, start_date, end_date, total_price, booking_date, status, special_requests, number_of_people) VALUES
        (1, 300, 1, 1, 100, 200, '2024-02-15', '2024-02-17', 450.00, '2024-01-15 09:30:00', 'confirmed', 'Vegetarian meals preferred', 2),
        (2, 301, 2, 2, 101, 201, '2024-02-20', '2024-02-26', 850.00, '2024-01-20 14:15:00', 'confirmed', 'Need hiking boots size 42', 1),
        (3, 302, 3, 3, 102, 200, '2024-03-01', '2024-03-04', 650.00, '2024-02-01 11:45:00', 'pending', 'First time visitor to Ethiopia', 3)
      `);
      
      // Insert sample payments
      await pool.execute(`
        INSERT IGNORE INTO payments (payment_id, booking_id, amount, payment_method, status, payment_date) VALUES
        (1, 1, 450.00, 'bank_transfer', 'completed', '2024-01-15 10:00:00'),
        (2, 2, 850.00, 'credit_card', 'completed', '2024-01-20 14:30:00'),
        (3, 3, 650.00, 'cash', 'pending', NULL)
      `);
      
      console.log('✅ Sample data populated successfully!');
      
      // Check final count
      const [finalCount] = await pool.execute('SELECT COUNT(*) as count FROM bookings');
      console.log(`📊 Final bookings count: ${finalCount[0].count}`);
    }
    
    // Test the employee bookings query
    console.log('🔍 Testing employee bookings query...');
    const [bookings] = await pool.execute(`
      SELECT 
        b.booking_id,
        b.start_date,
        b.end_date,
        b.total_price,
        b.status,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        t.name as tour_name
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.user_id
      LEFT JOIN tours t ON b.tour_id = t.tour_id
      LIMIT 3
    `);
    
    console.log('📋 Sample bookings data:');
    bookings.forEach((booking, index) => {
      console.log(`  ${index + 1}. ${booking.customer_first_name} ${booking.customer_last_name} - ${booking.tour_name} (${booking.status})`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

testConnection();
