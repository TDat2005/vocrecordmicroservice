-- Fix: Cập nhật ảnh sản phẩm bị 404 từ Unsplash
-- Thay bằng URL mới còn hoạt động

USE clonevocrecord;

-- MaSP 6: Midnights (Blood Moon Edition) - Taylor Swift album
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80' WHERE MaSP = 6;

-- MaSP 10: Guardians of the Galaxy - soundtrack
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' WHERE MaSP = 10;

-- MaSP 11: Thriller - Michael Jackson
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80' WHERE MaSP = 11;

-- MaSP 12: Đan Trường - Vol.1
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80' WHERE MaSP = 12;

-- MaSP 15: Sony PS-LX310BT (turntable)
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80' WHERE MaSP = 15;

-- MaSP 16: Crosley Cruiser Deluxe (turntable)
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1458560871784-56d23406c091?w=800&q=80' WHERE MaSP = 16;

-- MaSP 18: Dung dịch rửa đĩa mềm than (accessories)
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&q=80' WHERE MaSP = 18;

-- MaSP 20: Vỏ bọc đĩa than chống tĩnh điện (accessories)
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' WHERE MaSP = 20;

-- MaSP 21: Plastic Love (Single) - City Pop
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80' WHERE MaSP = 21;

-- MaSP 25: Interstellar OST
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80' WHERE MaSP = 25;

-- MaSP 27 & 53: albums VN - Hoàng, Một Ngàn Chín Trăm Hồi Đó
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=800&q=80' WHERE MaSP = 27;
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=800&q=80' WHERE MaSP = 53;

-- MaSP 52: La La Land OST
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&q=80' WHERE MaSP = 52;

-- MaSP 58: Ride on Time - City Pop
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1484876065684-b683cf17d276?w=800&q=80' WHERE MaSP = 58;

-- MaSP 62, 63, 64: Phụ kiện (dùng chung 1 ảnh mới)
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&q=80' WHERE MaSP = 62;
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' WHERE MaSP = 63;
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80' WHERE MaSP = 64;

-- MaSP 65, 66: Cassette
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=800&q=80' WHERE MaSP = 65;
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=800&q=80' WHERE MaSP = 66;

-- MaSP 19: Kim đọc đĩa than (turntable accessory)
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80' WHERE MaSP = 19;
