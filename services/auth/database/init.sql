SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Auth Service Database Schema
-- Tables: accounts, otps, activity_logs

CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('khachhang', 'nhanvien', 'admin') DEFAULT 'khachhang',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    code VARCHAR(6) NOT NULL,
    type ENUM('register', 'forgot_password') NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT,
    action VARCHAR(100),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed accounts (password = '123456' bcrypt hashed)
-- admin123 cho admin, 123456 cho tất cả
INSERT INTO accounts (username, password, role) VALUES
('admin@grooverecords.com', '$2a$10$MnWZgrdRuTxDV7fdIBDYJunWCGUmO4h1sAXbBvm2oYMRdOJdxx.qG', 'admin'),
('nv1@grooverecords.com', '$2a$10$MnWZgrdRuTxDV7fdIBDYJunWCGUmO4h1sAXbBvm2oYMRdOJdxx.qG', 'nhanvien'),
('nv2@grooverecords.com', '$2a$10$MnWZgrdRuTxDV7fdIBDYJunWCGUmO4h1sAXbBvm2oYMRdOJdxx.qG', 'nhanvien'),
('khach1@gmail.com', '$2a$10$MnWZgrdRuTxDV7fdIBDYJunWCGUmO4h1sAXbBvm2oYMRdOJdxx.qG', 'khachhang'),
('khach2@gmail.com', '$2a$10$MnWZgrdRuTxDV7fdIBDYJunWCGUmO4h1sAXbBvm2oYMRdOJdxx.qG', 'khachhang'),
('khach3@gmail.com', '$2a$10$MnWZgrdRuTxDV7fdIBDYJunWCGUmO4h1sAXbBvm2oYMRdOJdxx.qG', 'khachhang');

