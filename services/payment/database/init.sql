SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Payment Service Database Schema

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(15, 2),
    method ENUM('cod', 'payos', 'chuyenkhoan', 'momo', 'vnpay') DEFAULT 'cod',
    status ENUM('chuathanhtoan', 'dangxuly', 'dathanhtoan', 'thatbai', 'dahuy') DEFAULT 'chuathanhtoan',
    transaction_code VARCHAR(100),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed payments
INSERT INTO payments (order_id, amount, method, status, transaction_code, paid_at) VALUES
(1, 1630000, 'payos', 'dathanhtoan', 'TXN20260401001', '2026-04-01 10:30:00'),
(2, 750000, 'cod', 'dathanhtoan', NULL, '2026-04-03 14:00:00'),
(3, 3500000, 'payos', 'dathanhtoan', 'TXN20260410002', '2026-04-10 09:15:00'),
(4, 1570000, 'cod', 'chuathanhtoan', NULL, NULL),
(5, 920000, 'payos', 'dangxuly', 'TXN20260414003', NULL);

