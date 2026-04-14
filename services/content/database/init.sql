SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Content Service Database Schema

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('blog', 'guide') DEFAULT 'blog',
    image VARCHAR(500),
    account_id INT,
    status ENUM('draft', 'published') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed posts (blog + guide)
INSERT INTO posts (title, content, type, image, status, account_id) VALUES
('Hướng dẫn chọn đĩa than cho người mới', 'Bạn mới bắt đầu chơi đĩa than? Đây là những điều cơ bản bạn cần biết trước khi mua chiếc đĩa đầu tiên. Đĩa than (vinyl) có nhiều loại: 33 RPM (LP), 45 RPM (Single), và 78 RPM (cổ điển). Với người mới, nên bắt đầu với LP 33 RPM vì đây là định dạng phổ biến nhất.', 'guide', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600', 'published', 1),
('Top 10 album vinyl đáng sưu tầm 2026', 'Năm 2026 chứng kiến sự trở lại mạnh mẽ của vinyl với nhiều album xuất sắc. Dẫn đầu danh sách là bản remaster Abbey Road của The Beatles và The Dark Side of the Moon 50th Anniversary Edition.', 'blog', 'https://images.unsplash.com/photo-1460039230329-eb070fc6c77c?w=600', 'published', 1),
('Cách bảo quản đĩa than đúng cách', 'Đĩa than cần được bảo quản cẩn thận để giữ chất lượng âm thanh. Luôn để đĩa đứng thẳng, tránh đặt nằm hoặc chồng lên nhau. Bảo quản ở nhiệt độ 15-25°C, độ ẩm 40-50%. Sử dụng bao nhựa PE bên ngoài và bao lót bên trong.', 'guide', 'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=600', 'published', 1),
('City Pop: Dòng nhạc Nhật Bản hồi sinh toàn cầu', 'City Pop, dòng nhạc pop điện tử Nhật Bản từ thập niên 80, đang trở thành hiện tượng toàn cầu nhờ? mạng xã hội. Plastic Love của Mariya Takeuchi và Stay With Me của Miki Matsubara là hai bản hit được giới trẻ yêu thích nhất.', 'blog', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600', 'published', 1),
('So sánh: Belt-Drive vs Direct-Drive Turntable', 'Hai loại mâm đĩa phổ biến nhất thị trường. Belt-drive (đai truyền) cho tiếng ấm, ít rung, giá rẻ hơn - phù hợp nghe nhạc tại nhà. Direct-drive (truyền trực tiếp) có tốc độ ổn định, torque mạnh, phù hợp DJ và audiophile.', 'guide', 'https://images.unsplash.com/photo-1593078166039-c9878df5c520?w=600', 'published', 1),
('Review: Audio-Technica AT-LP120X - Mâm đĩa tốt nhất tầm giá?', 'AT-LP120X là sự lựa chọn tuyệt về?i cho cả người mới và người chơi trung cấp. Direct-drive, 3 tốc độ (33/45/78 RPM), có preamp tích hợp và cổng USB để số hoá đĩa than. Chất lượng build xuất sắc trong tầm giá dưới 8 triệu.', 'blog', 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600', 'published', 1),
('Tại sao Vinyl có âm thanh "ấm" hơn Digital?', 'Nhiều audiophile cho rằng vinyl có âm thanh ấm áp và tự nhiên hơn nhạc số. Nguyên nhân nằm ở bản chất analog: sóng âm liên tục thay vì bị sampling. Ngoài ra, đặc tính RIAA equalization và tính chất vật lý của rãnh đĩa tạo nên màu sắc âm thanh đặc trưng.', 'blog', 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=600', 'published', 1),
('Hướng dẫn cân chỉnh kim đĩa chuẩn xác', 'Tracking force (lực đè kim) chuẩn xác giúp âm thanh trung thực và bảo vệ đĩa. Bước 1: Cân bằng tonearm ở vị trí ngang. Bước 2: Đặt anti-skating về? 0. Bước 3: Chỉnh tracking force theo khuyến nghị của hãng kim (thường 1.5-2.5g). Bước 4: Đặt anti-skating bằng tracking force.', 'guide', 'https://images.unsplash.com/photo-1560800452-f2d475982b96?w=600', 'published', 1);

