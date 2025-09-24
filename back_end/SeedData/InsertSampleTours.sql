-- Script để thêm tour mẫu vào database
-- Chạy script này trong SQL Server Management Studio hoặc Azure Data Studio

-- Kiểm tra và thêm tour mẫu
INSERT INTO TOURS (NAME, ADDRESS, DESCRIPTION, PRICE, START_DATE, END_DATE, CAPACITY, AVAILABLE_SLOTS, IMAGE, STATUS, CREATED_AT, UPDATED_AT, HOST_ID)
VALUES 
-- Tour 1: Hà Nội - Hạ Long
('Tour Hà Nội - Hạ Long 3N2Đ', 
 'Hà Nội, Việt Nam', 
 'Tour du lịch Hà Nội và Vịnh Hạ Long trong 3 ngày 2 đêm, khám phá vẻ đẹp thiên nhiên tuyệt vời của Vịnh Hạ Long - Di sản thế giới được UNESCO công nhận.',
 2500000, 
 '2024-04-01', 
 '2024-04-03', 
 30, 
 30, 
 'https://example.com/halong-bay.jpg', 
 'open', 
 GETDATE(), 
 GETDATE(), 
 1),

-- Tour 2: Đà Nẵng - Hội An
('Tour Đà Nẵng - Hội An 4N3Đ', 
 'Đà Nẵng, Việt Nam', 
 'Khám phá thành phố Đà Nẵng hiện đại và phố cổ Hội An cổ kính. Trải nghiệm văn hóa địa phương và thưởng thức ẩm thực đặc sắc.',
 1800000, 
 '2024-04-15', 
 '2024-04-18', 
 25, 
 25, 
 'https://example.com/hoi-an.jpg', 
 'open', 
 GETDATE(), 
 GETDATE(), 
 1),

-- Tour 3: Sài Gòn - Cần Thơ
('Tour Sài Gòn - Cần Thơ 3N2Đ', 
 'TP.HCM, Việt Nam', 
 'Tour miền Tây Nam Bộ, khám phá vùng đất trù phú với những cánh đồng lúa bạt ngàn và kênh rạch chằng chịt.',
 1200000, 
 '2024-05-01', 
 '2024-05-03', 
 20, 
 20, 
 'https://example.com/mekong-delta.jpg', 
 'open', 
 GETDATE(), 
 GETDATE(), 
 1),

-- Tour 4: Nha Trang - Đà Lạt
('Tour Nha Trang - Đà Lạt 5N4Đ', 
 'Nha Trang, Việt Nam', 
 'Kết hợp biển xanh cát trắng Nha Trang và không khí mát mẻ của Đà Lạt. Trải nghiệm đa dạng từ biển đến núi.',
 3200000, 
 '2024-05-20', 
 '2024-05-24', 
 35, 
 35, 
 'https://example.com/nha-trang-dalat.jpg', 
 'open', 
 GETDATE(), 
 GETDATE(), 
 1),

-- Tour 5: Huế - Quảng Bình
('Tour Huế - Quảng Bình 4N3Đ', 
 'Huế, Việt Nam', 
 'Khám phá cố đô Huế với những di tích lịch sử và hang động kỳ vĩ ở Quảng Bình. Trải nghiệm văn hóa cung đình và thiên nhiên hoang sơ.',
 2800000, 
 '2024-06-10', 
 '2024-06-13', 
 28, 
 28, 
 'https://example.com/hue-quangbinh.jpg', 
 'open', 
 GETDATE(), 
 GETDATE(), 
 1),

-- Tour 6: Phú Quốc
('Tour Phú Quốc 4N3Đ', 
 'Phú Quốc, Kiên Giang', 
 'Nghỉ dưỡng tại đảo ngọc Phú Quốc với những bãi biển đẹp nhất Việt Nam. Thưởng thức hải sản tươi ngon và tham quan các điểm du lịch nổi tiếng.',
 2200000, 
 '2024-06-25', 
 '2024-06-28', 
 40, 
 40, 
 'https://example.com/phu-quoc.jpg', 
 'open', 
 GETDATE(), 
 GETDATE(), 
 1),

-- Tour 7: Sapa - Lào Cai
('Tour Sapa - Lào Cai 3N2Đ', 
 'Sapa, Lào Cai', 
 'Khám phá vùng núi Tây Bắc với ruộng bậc thang tuyệt đẹp và văn hóa các dân tộc thiểu số. Trekking và trải nghiệm cuộc sống địa phương.',
 1500000, 
 '2024-07-05', 
 '2024-07-07', 
 22, 
 22, 
 'https://example.com/sapa.jpg', 
 'open', 
 GETDATE(), 
 GETDATE(), 
 1),

-- Tour 8: Mũi Né - Phan Thiết
('Tour Mũi Né - Phan Thiết 3N2Đ', 
 'Mũi Né, Bình Thuận', 
 'Tham quan đồi cát đỏ, suối Tiên và thưởng thức hải sản tươi ngon. Trải nghiệm các hoạt động thể thao biển thú vị.',
 1100000, 
 '2024-07-20', 
 '2024-07-22', 
 18, 
 18, 
 'https://example.com/mui-ne.jpg', 
 'open', 
 GETDATE(), 
 GETDATE(), 
 1);

-- Kiểm tra kết quả
SELECT * FROM TOURS ORDER BY CREATED_AT DESC;

