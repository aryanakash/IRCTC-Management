// Script to create admin user with specified credentials
require('dotenv').config();
const pool = require('./db');
const bcrypt = require('bcryptjs');

// Admin credentials
const adminEmail = 'admin@123';
const adminPassword = '123456';
const adminName = 'Admin User';

async function createAdminUser() {
  try {
    // Check if admin already exists
    const [existingAdmin] = await pool.promise().query(
      "SELECT * FROM users WHERE LOWER(email) = ?", 
      [adminEmail.toLowerCase()]
    );

    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists!');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Insert admin user
    await pool.promise().query(
      "INSERT INTO users (name, email, password, is_verified, is_admin) VALUES (?, ?, ?, ?, ?)",
      [adminName, adminEmail.toLowerCase(), hashedPassword, 1, 1]
    );

    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

// Execute the function
createAdminUser();