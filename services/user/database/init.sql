SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- User Service Database Schema
-- Tables: customers, employees, wishlists

CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    address TEXT,
    account_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    position VARCHAR(50),
    account_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wishlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_wish (customer_id, product_id),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed customers (account_id tương ứng accounts bên Auth service)
INSERT INTO customers (full_name, phone, email, address, account_id) VALUES
('Admin Groove', '0901000000', 'admin@grooverecords.com', '123 Nguyễn Huệ, Q.1, TP.HCM', 1),
('Nguyễn Văn Tùng', '0912345678', 'khach1@gmail.com', '45 Lê Lợi, Q.1, TP.HCM', 4),
('Trần Thị Mai', '0987654321', 'khach2@gmail.com', '78 Trần Hưng Đạo, Q.5, TP.HCM', 5),
('Lê Hoàng Nam', '0909876543', 'khach3@gmail.com', '200 Cách Mạng Tháng 8, Q.3, TP.HCM', 6);

-- Seed employees
INSERT INTO employees (full_name, position, account_id) VALUES
('Phạm Minh Đức', 'Nhân viên bán hàng', 2),
('Võ Thị Hương', 'Nhân viên kho', 3);

