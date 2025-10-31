import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const pool = getPool()
    
    console.log('Starting database fixes...')
    
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

    return NextResponse.json({ 
      message: 'Database fixes completed successfully',
      status: 'success'
    })
  } catch (error) {
    console.error('Error fixing database:', error)
    return NextResponse.json({ 
      error: 'Failed to fix database', 
      details: error.message 
    }, { status: 500 })
  }
}
