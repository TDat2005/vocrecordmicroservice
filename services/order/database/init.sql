SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Order Service Database Schema

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    recipient_name VARCHAR(100),
    recipient_phone VARCHAR(20),
    total DECIMAL(15, 2) NOT NULL,
    status ENUM('choxacnhan', 'daxacnhan', 'dangchuanbihang', 'danggiaohang', 'hoanthanh', 'dahuy') DEFAULT 'choxacnhan',
    payment_method VARCHAR(50) DEFAULT 'cod',
    address TEXT,
    note VARCHAR(255),
    discount_code VARCHAR(50),
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    processed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed orders
INSERT INTO orders (customer_id, recipient_name, recipient_phone, total, status, payment_method, address, note, discount_code, discount_amount) VALUES
(2, 'Nguyễn Văn Tùng', '0912345678', 1630000, 'hoanthanh', 'payos', '45 Lê Lợi, Q.1, TP.HCM', 'Giao giờ? hành chính', NULL, 0),
(3, 'Trần Thị Mai', '0987654321', 750000, 'hoanthanh', 'cod', '78 Trần Hưng Đạo, Q.5, TP.HCM', NULL, 'CHAO2026', 75000),
(2, 'Nguyễn Văn Tùng', '0912345678', 3500000, 'danggiaohang', 'payos', '45 Lê Lợi, Q.1, TP.HCM', 'Đóng gói cẩn thận', NULL, 0),
(4, 'Lê Hoàng Nam', '0909876543', 1570000, 'daxacnhan', 'cod', '200 Cách Mạng Tháng 8, Q.3, TP.HCM', NULL, NULL, 0),
(3, 'Trần Thị Mai', '0987654321', 920000, 'choxacnhan', 'payos', '78 Trần Hưng Đạo, Q.5, TP.HCM', 'Giao cuối tuần', NULL, 0);

-- Seed order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 850000),  -- Abbey Road
(1, 3, 1, 780000),  -- Rumours
(2, 4, 1, 750000),  -- Back in Black (sau giảm giá)
(3, 23, 1, 3500000), -- Audio-Technica AT-LP60X
(4, 2, 1, 920000),  -- Dark Side of the Moon
(4, 17, 1, 350000), -- Cassette After Hours
(4, 28, 1, 350000), -- Bộ vệ sinh đĩa than
(5, 2, 1, 920000);  -- Dark Side of the Moon

