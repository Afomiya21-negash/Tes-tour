import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const pool = getPool()
    
    console.log('Starting database fixes...')

    // 0. Ensure address column exists in users table (needed for all user types)
    try {
      await pool.execute(`ALTER TABLE users ADD COLUMN address VARCHAR(255) DEFAULT NULL`)
      console.log('✓ Added address column to users table')
    } catch (e: any) {
      if (e.message.includes('Duplicate column name')) {
        console.log('ℹ️  address column already exists')
      } else {
        console.log('address column issue:', e.message)
      }
    }

    // 1. Create customers table if it doesn't exist
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS customers (
          customer_id int(11) NOT NULL,
          address varchar(255) DEFAULT NULL,
          date_of_birth date DEFAULT NULL,
          PRIMARY KEY (customer_id),
          FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `)
      console.log('✓ Customers table created/verified')
    } catch (e) {
      console.log('Customers table issue:', e.message)
    }

    // 2. Fix drivers table - change picture column to TEXT
    try {
      await pool.execute(`ALTER TABLE drivers MODIFY COLUMN picture TEXT DEFAULT NULL`)
      console.log('✓ Drivers picture column updated to TEXT')
    } catch (e) {
      console.log('Drivers picture column issue:', e.message)
    }

    // 3. Add vehicle_type column to drivers table if it doesn't exist
    try {
      await pool.execute(`ALTER TABLE drivers ADD COLUMN vehicle_type varchar(100) DEFAULT NULL`)
      console.log('✓ Drivers vehicle_type column added')
    } catch (e) {
      console.log('Drivers vehicle_type column issue (may already exist):', e.message)
    }

    // 4. Create driver_information table if it doesn't exist
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS driver_information (
          driver_id int(11) NOT NULL,
          license_number varchar(50) NOT NULL,
          vehicle_type varchar(100) DEFAULT NULL,
          picture TEXT DEFAULT NULL,
          availability enum('available','busy','unavailable') DEFAULT 'available',
          PRIMARY KEY (driver_id),
          FOREIGN KEY (driver_id) REFERENCES users(user_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `)
      console.log('✓ Driver_information table created/verified')
    } catch (e) {
      console.log('Driver_information table issue:', e.message)
    }

    // 5. Copy data from drivers to driver_information if needed
    try {
      await pool.execute(`
        INSERT IGNORE INTO driver_information (driver_id, license_number, picture, vehicle_type)
        SELECT driver_id, license_number, picture, vehicle_type FROM drivers
      `)
      console.log('✓ Data copied from drivers to driver_information')
    } catch (e) {
      console.log('Data copy issue:', e.message)
    }

    // 6. CREATE DATABASE INDEXES FOR PERFORMANCE
    console.log('🔧 Creating database indexes...')
    const indexes = [
      { name: 'idx_bookings_user_id', sql: 'CREATE INDEX idx_bookings_user_id ON bookings(user_id)' },
      { name: 'idx_bookings_tour_id', sql: 'CREATE INDEX idx_bookings_tour_id ON bookings(tour_id)' },
      { name: 'idx_bookings_vehicle_id', sql: 'CREATE INDEX idx_bookings_vehicle_id ON bookings(vehicle_id)' },
      { name: 'idx_bookings_driver_id', sql: 'CREATE INDEX idx_bookings_driver_id ON bookings(driver_id)' },
      { name: 'idx_bookings_tour_guide_id', sql: 'CREATE INDEX idx_bookings_tour_guide_id ON bookings(tour_guide_id)' },
      { name: 'idx_bookings_status', sql: 'CREATE INDEX idx_bookings_status ON bookings(status)' },
      { name: 'idx_bookings_booking_date', sql: 'CREATE INDEX idx_bookings_booking_date ON bookings(booking_date)' },
      { name: 'idx_users_email', sql: 'CREATE INDEX idx_users_email ON users(email)' },
      { name: 'idx_users_role', sql: 'CREATE INDEX idx_users_role ON users(role)' },
      { name: 'idx_tours_availability', sql: 'CREATE INDEX idx_tours_availability ON tours(availability)' },
      { name: 'idx_vehicles_status', sql: 'CREATE INDEX idx_vehicles_status ON vehicles(status)' },
      { name: 'idx_payments_booking_id', sql: 'CREATE INDEX idx_payments_booking_id ON payments(booking_id)' },
      { name: 'idx_location_booking_id', sql: 'CREATE INDEX idx_location_booking_id ON location_tracking(booking_id)' },
    ]

    const indexResults = []
    for (const index of indexes) {
      try {
        await pool.execute(index.sql)
        indexResults.push({ index: index.name, status: 'created ✅' })
        console.log(`✅ Created: ${index.name}`)
      } catch (e: any) {
        if (e.message.includes('Duplicate key name') || e.code === 'ER_DUP_KEYNAME') {
          indexResults.push({ index: index.name, status: 'already exists ℹ️' })
        } else {
          indexResults.push({ index: index.name, status: 'error ❌' })
        }
      }
    }

    return NextResponse.json({
      message: 'Database fixes completed successfully',
      status: 'success',
      indexes: indexResults
    })
  } catch (error) {
    console.error('Error fixing database:', error)
    return NextResponse.json({ 
      error: 'Failed to fix database', 
      details: error.message 
    }, { status: 500 })
  }
}
