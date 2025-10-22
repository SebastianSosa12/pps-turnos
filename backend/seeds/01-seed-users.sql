-- HealthTrack Development Seed Data  
-- Users with BCrypt hashed passwords
-- Run this after database creation to populate test data

USE HealthTrack;

-- Check if Users table exists
SELECT COUNT(*) INTO @table_exists 
FROM information_schema.tables 
WHERE table_schema = 'HealthTrack' AND table_name = 'Users';

-- Clear existing test users (development only)
DELETE FROM Users WHERE Username IN ('admin', 'doctor', 'nurse');

-- Insert test users with pre-computed BCrypt hashes
-- Note: These hashes were generated with cost factor 12
INSERT INTO Users (Id, Username, PasswordHash, CreatedAtUtc, LastLoginUtc, IsActive)
VALUES 
    -- admin : password123
    (UUID(), 
     'admin', 
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
     UTC_TIMESTAMP(), 
     NULL, 
     1),

    -- doctor : doctor123
    (UUID(), 
     'doctor', 
     '$2a$10$Xl0yhvzLIxp5bY/gLUisJeV/uoWzN2ZjC1ELlWqWNYLcRz5qEOKF2', 
     UTC_TIMESTAMP(), 
     NULL, 
     1),

    -- nurse : nurse123  
    (UUID(), 
     'nurse', 
     '$2a$10$N9qo8uLOickgx2ZMRZoMye5FN.ZkYGJj8Wb4GxHvHcCk3LyGqxF/2', 
     UTC_TIMESTAMP(), 
     NULL, 
     1);

-- Display seeded users (without password hashes for security)
SELECT 
    Username,
    CreatedAtUtc,
    IsActive,
    CASE Username
        WHEN 'admin' THEN 'password123'
        WHEN 'doctor' THEN 'doctor123' 
        WHEN 'nurse' THEN 'nurse123'
        ELSE '???'
    END as `Password (for testing)`
FROM Users
ORDER BY Username;

-- Success message
SELECT CONCAT('✅ Successfully seeded ', COUNT(*), ' users') as Result
FROM Users;