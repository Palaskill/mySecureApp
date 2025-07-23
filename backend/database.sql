-- Create the database
CREATE DATABASE IF NOT EXISTS secure_angular_app;
USE secure_angular_app;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL,
    password VARCHAR(191) NOT NULL,
    role ENUM('admin', 'user', 'operator', 'boss', 'chief') DEFAULT 'user',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email(191))
);

-- Create pending_signups table
CREATE TABLE IF NOT EXISTS pending_signups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL,
    password VARCHAR(191) NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    UNIQUE KEY unique_email (email(191))
); 