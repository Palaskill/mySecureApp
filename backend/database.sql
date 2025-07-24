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

-- Create deleted_users table
CREATE TABLE IF NOT EXISTS deleted_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_id INT NOT NULL,
    email VARCHAR(191) NOT NULL,
    password VARCHAR(191) NOT NULL,
    role ENUM('admin', 'user', 'operator', 'boss', 'chief'),
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP,
    deletion_reason TEXT,
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_original_id (original_id)
);

-- Create event to clean up old deleted users (runs daily)
DELIMITER //
CREATE EVENT IF NOT EXISTS cleanup_deleted_users
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    DELETE FROM deleted_users 
    WHERE deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
END //
DELIMITER ; 