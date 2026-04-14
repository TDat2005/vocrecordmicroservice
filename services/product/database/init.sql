SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Product Service Database Schema

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    artist VARCHAR(100),
    genre VARCHAR(100),
    release_year INT,
    price DECIMAL(15, 2) NOT NULL,
    stock INT DEFAULT 0,
    description TEXT,
    image VARCHAR(500),
    status ENUM('conhang', 'saphethang', 'hethang', 'preorder', 'ngungkinhdoanh') DEFAULT 'conhang',
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS discounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('percent', 'fixed') DEFAULT 'percent',
    value DECIMAL(15, 2) NOT NULL,
    min_order DECIMAL(15, 2) DEFAULT 0,
    quantity INT DEFAULT 0,
    used_count INT DEFAULT 0,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS import_receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    total DECIMAL(15, 2) DEFAULT 0,
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS import_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    import_price DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (receipt_id) REFERENCES import_receipts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed categories
INSERT INTO categories (name, description) VALUES
('Đĩa Than (Vinyl)', 'Các đĩa than truyền thống'),
('Cassette', 'Băng Cassette gốc'),
('Máy Quay Đĩa (Turntable)', 'Mâm đĩa chất lượng cao'),
('Phụ Kiện', 'Bao da, thiết bị bảo dưỡng âm thanh');

-- ============================================
-- SEED PRODUCTS (~35 sản phẩm)
-- ============================================

-- === ĐĨA THAN (VINYL) - Category 1 ===
INSERT INTO products (name, artist, genre, release_year, price, stock, description, image, status, category_id) VALUES
('Abbey Road', 'The Beatles', 'Đĩa Than (Vinyl)', 1969, 850000, 15, 'Album kinh điển của The Beatles, bao gồm các bài hát Here Comes The Sun và Come Together. Bản remaster 180g.', 'https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg', 'conhang', 1),
('The Dark Side of the Moon', 'Pink Floyd', 'Đĩa Than (Vinyl)', 1973, 920000, 10, 'Tuyệt phẩm progressive rock, một trong những album bán chạy nhất mới thời đại với hơn 45 triệu bản.', 'https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png', 'conhang', 1),
('Rumours', 'Fleetwood Mac', 'Đĩa Than (Vinyl)', 1977, 780000, 12, 'Album pop-rock huyền thoại với Dreams, Go Your Own Way. Bản in 180g audiophile.', 'https://upload.wikimedia.org/wikipedia/en/f/fb/FMacRumworb.PNG', 'conhang', 1),
('Back in Black', 'AC/DC', 'Đĩa Than (Vinyl)', 1980, 750000, 20, 'Album hard rock bán chạy thứ 2 mới thời đại. Bao gồm Hells Bells, You Shook Me All Night Long.', 'https://upload.wikimedia.org/wikipedia/commons/9/92/ACDC_Back_in_Black.png', 'conhang', 1),
('Thriller', 'Michael Jackson', 'Đĩa Than (Vinyl)', 1982, 890000, 8, 'Album bán chạy nhất mới thời đại với Beat It, Billie Jean và Thriller. Bản picture disc giới hạn.', 'https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png', 'conhang', 1),
('Kind of Blue', 'Miles Davis', 'Đĩa Than (Vinyl)', 1959, 950000, 6, 'Album jazz vĩ đại nhất mới thời đại. Bản remaster Columbia Legacy 180g.', 'https://upload.wikimedia.org/wikipedia/en/9/9c/MilesDavisKindofBlue.jpg', 'saphethang', 1),
('Nevermind', 'Nirvana', 'Đĩa Than (Vinyl)', 1991, 680000, 18, 'Album grunge mang tính cách mạng với Smells Like Teen Spirit. Bản in DGC Records.', 'https://upload.wikimedia.org/wikipedia/en/b/b7/NirsurprisvanaNevermindalbumcover.jpg', 'conhang', 1),
('Hotel California', 'Eagles', 'Đĩa Than (Vinyl)', 1976, 820000, 14, 'Album rock kinh điển với bài hát cùng tên. Bản Asylum Records gốc.', 'https://upload.wikimedia.org/wikipedia/en/4/49/HotelCalifornia.jpg', 'conhang', 1),
('The Wall', 'Pink Floyd', 'Đĩa Than (Vinyl)', 1979, 1200000, 5, 'Rock opera đồ sộ 2LP, bao gồm Another Brick in the Wall và Comfortably Numb.', 'https://upload.wikimedia.org/wikipedia/en/1/13/PinkFloydWallCoverOriginalNoText.jpg', 'saphethang', 1),
('Led Zeppelin IV', 'Led Zeppelin', 'Đĩa Than (Vinyl)', 1971, 880000, 9, 'Album chứa Stairway to Heaven - bài rock vĩ đại nhất mới thời đại. Atlantic Records 180g.', 'https://upload.wikimedia.org/wikipedia/en/2/26/Led_Zeppelin_-_Led_Zeppelin_IV.jpg', 'conhang', 1),
('A Night at the Opera', 'Queen', 'Đĩa Than (Vinyl)', 1975, 790000, 11, 'Album huyền thoại của Queen với Bohemian Rhapsody. EMI Records bản gốc UK pressing.', 'https://upload.wikimedia.org/wikipedia/en/4/4d/Queen_A_Night_At_The_Opera.png', 'conhang', 1),
('Wish You Were Here', 'Pink Floyd', 'Đĩa Than (Vinyl)', 1975, 850000, 7, 'Album concept tưởng nhớ Syd Barrett, với Shine On You Crazy Diamond. Harvest Records.', 'https://upload.wikimedia.org/wikipedia/en/a/a4/Pink_Floyd%2C_Wish_You_Were_Here_%281975%29.png', 'conhang', 1),
('Random Access Memories', 'Daft Punk', 'Đĩa Than (Vinyl)', 2013, 950000, 13, 'Album electro-disco đoạt Grammy với Get Lucky. Bản 2LP 180g.', 'https://upload.wikimedia.org/wikipedia/en/a/a7/Random_Access_Memories.jpg', 'conhang', 1),
('OK Computer', 'Radiohead', 'Đĩa Than (Vinyl)', 1997, 720000, 10, 'Siêu phẩm alternative rock với Paranoid Android, Karma Police. XL Recordings.', 'https://upload.wikimedia.org/wikipedia/en/b/ba/Radioheadokcomputer.png', 'conhang', 1),
('Purple Rain', 'Prince', 'Đĩa Than (Vinyl)', 1984, 680000, 16, 'Soundtrack kinh điển của Prince, When Doves Cry, Let''s Go Crazy. Warner Bros.', 'https://upload.wikimedia.org/wikipedia/en/9/9c/Princepurplerain.jpg', 'conhang', 1),
('1989 (Taylor''s Version)', 'Taylor Swift', 'Đĩa Than (Vinyl)', 2023, 1150000, 10, 'Album tái thu âm cực kỳ thành công với nhiều bản hit kinh điển.', 'https://upload.wikimedia.org/wikipedia/en/d/d5/Taylor_Swift_-_1989_%28Taylor%27s_Version%29.png', 'conhang', 1),
('Born to Die', 'Lana Del Rey', 'Đĩa Than (Vinyl)', 2012, 850000, 7, 'Album pop hoài cổ mang phong cách cinematic của Lana Del Rey.', 'https://upload.wikimedia.org/wikipedia/en/0/00/Lana_Del_Rey_-_Born_to_Die.png', 'conhang', 1),
('Yellow Submarine', 'The Beatles', 'Đĩa Than (Vinyl)', 1969, 780000, 14, 'Album nhạc phim của bộ phim hoạt hình huyền thoại The Beatles.', 'https://upload.wikimedia.org/wikipedia/en/a/ac/TheBeatles-YellowSubmarinealbumcover.jpg', 'conhang', 1),
('Bảo Kính Nghệ Thuật', 'Trần Thu Hà', 'Đĩa Than (Vinyl)', 2015, 1200000, 5, 'Ấn bản đĩa than chất lượng cao của nhạc Việt.', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400', 'conhang', 1),
('Trịnh Công Sơn - Sơn Ca 7', 'Khánh Ly', 'Đĩa Than (Vinyl)', 1974, 1500000, 3, 'Băng Sơn Ca 7 được phục chế và phát hành lại dưới định dạng đĩa than. Âm thanh mang đậm dấu ấn lịch sử.', 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400', 'saphethang', 1),

-- === CASSETTE - Category 2 ===
('Cassette - After Hours', 'The Weeknd', 'Cassette', 2020, 350000, 25, 'Album R&B/Pop chứa Blinding Lights. Bản cassette limited edition màu đỏ.', 'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png', 'conhang', 2),
('Cassette - Folklore', 'Taylor Swift', 'Cassette', 2020, 320000, 20, 'Album indie folk bất ngờ của Taylor. Bản cassette xanh lá edition.', 'https://upload.wikimedia.org/wikipedia/en/f/f8/Taylor_Swift_-_Folklore.png', 'conhang', 2),
('Cassette - Future Nostalgia', 'Dua Lipa', 'Cassette', 2020, 280000, 30, 'Album disco-pop hiện đại với Levitating, Don''t Start Now. Cassette hồng.', 'https://upload.wikimedia.org/wikipedia/en/f/f5/Dua_Lipa_-_Future_Nostalgia_%28Official_Album_Cover%29.png', 'conhang', 2),
('Cassette - Plastic Beach', 'Gorillaz', 'Cassette', 2010, 380000, 12, 'Album electronica/hip-hop pha trộn với On Melancholy Hill. Cassette tím.', 'https://upload.wikimedia.org/wikipedia/en/b/b5/Gorillaz_-_Plastic_Beach.jpg', 'conhang', 2),
('Cassette - Lemonade', 'Beyoncé', 'Cassette', 2016, 300000, 15, 'Album visual R&B/Pop gây chấn động, bao gồm Formation và Sorry.', 'https://upload.wikimedia.org/wikipedia/en/5/53/Beyonce_-_Lemonade_%28Official_Album_Cover%29.png', 'conhang', 2),
('Cassette - City Pop Hits', 'Various Artists', 'Cassette', 1985, 450000, 8, 'Tuyển tập City Pop Nhật Bản kinh điển: Plastic Love, Stay With Me. Bản Japan import.', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400', 'saphethang', 2),
('Cassette - Guardians of the Galaxy: Awesome Mix Vol. 1', 'Various Artists', 'Cassette', 2014, 450000, 15, 'Băng cassette nhạc phim đình đám của Marvel.', 'https://upload.wikimedia.org/wikipedia/en/4/4e/Guardians_of_the_Galaxy_-_Awesome_Mix_Vol._1.jpg', 'conhang', 2),
('Cassette - Stranger Things: Soundtrack', 'Various', 'Cassette', 2016, 400000, 8, 'Tuyển tập nhạc phim mang âm hưởng thập niên 80 của Stranger Things.', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400', 'conhang', 2),
('Cassette - Starboy', 'The Weeknd', 'Cassette', 2016, 320000, 12, 'Bản cassette album thứ ba hợp tác cùng Daft Punk của The Weeknd.', 'https://upload.wikimedia.org/wikipedia/en/3/39/The_Weeknd_-_Starboy.png', 'conhang', 2),
('Cassette - The Car', 'Arctic Monkeys', 'Cassette', 2022, 380000, 9, 'Cassette album rock hiện đại với phong cách trưởng thành của Arctic Monkeys.', 'https://upload.wikimedia.org/wikipedia/en/c/c5/Arctic_Monkeys_-_The_Car.png', 'conhang', 2),
('Cassette - Tâm 9', 'Mỹ Tâm', 'Cassette', 2017, 500000, 20, 'Album đỉnh cao của nữ ca sĩ Mỹ Tâm được phát hành với cả định dạng băng cassette cổ điển.', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400', 'saphethang', 2),

-- === MÁY QUAY ĐĨA (TURNTABLE) - Category 3 ===
('Audio-Technica AT-LP60X', 'Audio-Technica', 'Máy Quay Đĩa (Turntable)', 2019, 3500000, 8, 'Mâm đĩa tự động belt-drive, phù hợp người mới. Có preamp tích hợp, 33/45 RPM.', 'https://images.unsplash.com/photo-1593078166039-c9878df5c520?w=400', 'conhang', 3),
('Audio-Technica AT-LP120X', 'Audio-Technica', 'Máy Quay Đĩa (Turntable)', 2019, 7800000, 5, 'Mâm đĩa direct-drive chuyên nghiệp, 33/45/78 RPM. Kim AT-VM95E. Quartz lock.', 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400', 'conhang', 3),
('Pro-Ject Debut Carbon EVO', 'Pro-Ject', 'Máy Quay Đĩa (Turntable)', 2020, 12500000, 3, 'Mâm đĩa Hi-Fi cao cấp, tonearm carbon, kim Sumiko Rainier. Made in EU.', 'https://images.unsplash.com/photo-1560800452-f2d475982b96?w=400', 'saphethang', 3),
('Sony PS-LX310BT', 'Sony', 'Máy Quay Đĩa (Turntable)', 2019, 5200000, 10, 'Mâm đĩa có Bluetooth phát không dây. Belt-drive, preamp tích hợp. Dễ sử dụng.', 'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=400', 'conhang', 3),
('Rega Planar 1 Plus', 'Rega', 'Máy Quay Đĩa (Turntable)', 2018, 9800000, 4, 'Mâm đĩa audiophile entry-level của Rega, tonearm RB110, phono stage tích hợp.', 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=400', 'conhang', 3),
('Technics SL-1200MK7', 'Technics', 'Máy Quay Đĩa (Turntable)', 2019, 25500000, 2, 'Huyền thoại DJ turntable của Technics với motor direct-drive được nâng cấp.', 'https://images.unsplash.com/photo-1593078166039-c9878df5c520?w=400', 'saphethang', 3),
('Fluance RT82', 'Fluance', 'Máy Quay Đĩa (Turntable)', 2020, 8500000, 6, 'Mâm đĩa có độ chính xác cao nhờ motor cách ly. Đầu kim Ortofon OM 10.', 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400', 'conhang', 3),
('Crosley Cruiser Plus', 'Crosley', 'Máy Quay Đĩa (Turntable)', 2022, 1900000, 25, 'Mâm đĩa dáng vali cổ điển, dễ mang theo, tích hợp loa. Phù hợp trang trí.', 'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=400', 'conhang', 3),

-- === PHỤ KIỆN - Category 4 ===
('Bộ vệ sinh đĩa than cao cấp', 'Groove Records', 'Phụ Kiện', 2024, 350000, 40, 'Bao gồm: chổi carbon fiber, dung dịch rửa đĩa, khăn microfiber. Bảo vệ rãnh đĩa an toàn.', 'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=400', 'conhang', 4),
('Đầu kim thay thế AT-VM95E', 'Audio-Technica', 'Phụ Kiện', 2020, 1200000, 15, 'Kim elliptical thay thế cho dòng AT-LP120X và AT-LP5X. Âm thanh chi tiết, bass sâu.', 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400', 'conhang', 4),
('Khung treo đĩa than 10 chiếc', 'Groove Records', 'Phụ Kiện', 2024, 450000, 25, 'Khung treo tường trưng bày album vinyl, bằng gỗ tự nhiên. Bộ 10 chiếc.', 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400', 'conhang', 4),
('Bao đựng đĩa than PE 100 chiếc', 'Groove Records', 'Phụ Kiện', 2024, 180000, 50, 'Bao nhựa PE trong suốt bảo vệ bìa đĩa khỏi bụi và trầy xước. Đóng gói 100 chiếc.', 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400', 'conhang', 4),
('Cân đo lực đè kim số', 'Pro-Ject', 'Phụ Kiện', 2021, 650000, 18, 'Cân điện tử chính xác 0.01g, dùng để cân chỉnh lực tracking force cho kim đĩa.', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400', 'conhang', 4),
('Thảm lót đĩa Cork 3mm', 'Groove Records', 'Phụ Kiện', 2024, 250000, 30, 'Thảm cork tự nhiên 3mm, giảm tĩnh điện và rung, cải thiện chất lượng âm thanh.', 'https://images.unsplash.com/photo-1595878715977-2e8f8df18ea8?w=400', 'conhang', 4),
('Hộp lưu trữ đĩa than gỗ Vintage', 'Groove Records', 'Phụ Kiện', 2024, 850000, 10, 'Hộp lưu trữ gỗ tự nhiên thủ công, chứa được tới 50 đĩa LP.', 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400', 'conhang', 4),
('Preamp phono iFi Zen Air', 'iFi Audio', 'Phụ Kiện', 2022, 2500000, 5, 'Phono preamp chất lượng cao giúp tăng cường tín hiệu cho mâm đĩa.', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400', 'conhang', 4),
('Chổi lau đĩa nhung chống tĩnh điện', 'Audio-Technica', 'Phụ Kiện', 2023, 220000, 35, 'Chổi nhung cao cấp giúp lấy đi bụi bẩn dễ dàng mà không làm xước đĩa.', 'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=400', 'conhang', 4);

-- ============================================
-- SEED DISCOUNTS
-- ============================================
INSERT INTO discounts (code, type, value, min_order, quantity, used_count, expires_at) VALUES
('CHAO2026', 'percent', 10, 500000, 100, 0, '2026-12-31 23:59:59'),
('VINYL50K', 'fixed', 50000, 300000, 50, 0, '2026-06-30 23:59:59'),
('NEWBIE20', 'percent', 20, 200000, 200, 0, '2026-12-31 23:59:59'),
('FREESHIP', 'fixed', 30000, 0, 999, 0, '2026-12-31 23:59:59'),
('VIP15', 'percent', 15, 1000000, 30, 0, '2026-09-30 23:59:59');

