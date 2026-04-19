-- =======================================================================
-- MAMMOTH FAKE DATA SEED SCRIPT FOR KETSAT VIET TIEP
-- Run this in SQL Server Management Studio (SSMS) or Azure Data Studio
-- =======================================================================

-- 1. Biến thời gian chung
DECLARE @Now DATETIMEOFFSET = SYSDATETIMEOFFSET();

-- =======================================================================
-- CATEGORIES
-- =======================================================================
DECLARE @CatSafeFamily UNIQUEIDENTIFIER = NEWID();
DECLARE @CatSafeCompany UNIQUEIDENTIFIER = NEWID();
DECLARE @CatSafeFireproof UNIQUEIDENTIFIER = NEWID();
DECLARE @CatSafeMini UNIQUEIDENTIFIER = NEWID();
DECLARE @CatLockDoor UNIQUEIDENTIFIER = NEWID();
DECLARE @CatLockSmart UNIQUEIDENTIFIER = NEWID();
DECLARE @CatLockVehicle UNIQUEIDENTIFIER = NEWID();

INSERT INTO [Categories] ([Id], [ParentId], [Name], [Slug], [Description], [ImageUrl], [SortOrder], [IsActive], [CreatedAt], [IsDeleted])
VALUES 
(@CatSafeFamily, NULL, N'Két Sắt Gia Đình', 'ket-sat-gia-dinh', N'Các loại két sắt nhỏ gọn cho gia đình', 'https://placehold.co/400x400/png', 1, 1, @Now, 0),
(@CatSafeCompany, NULL, N'Két Sắt Công Ty', 'ket-sat-cong-ty', N'Két sắt cỡ lớn dung tích chứa lớn', 'https://placehold.co/400x400/png', 2, 1, @Now, 0),
(@CatSafeFireproof, NULL, N'Két Sắt Chống Cháy', 'ket-sat-chong-chay', N'Két sắt an toàn chịu nhiệt cao cấp', 'https://placehold.co/400x400/png', 3, 1, @Now, 0),
(@CatSafeMini, NULL, N'Két Sắt Mini', 'ket-sat-mini', N'Két sắt mini giấu kín, tiện lợi', 'https://placehold.co/400x400/png', 4, 1, @Now, 0),
(@CatLockDoor, NULL, N'Ổ Khóa Cửa', 'o-khoa-cua', N'Ổ khóa cơ truyền thống an toàn', 'https://placehold.co/400x400/png', 5, 1, @Now, 0),
(@CatLockSmart, NULL, N'Khóa Cửa Thông Minh', 'khoa-cua-thong-minh', N'Khóa điện tử vân tay mã số', 'https://placehold.co/400x400/png', 6, 1, @Now, 0),
(@CatLockVehicle, NULL, N'Khóa Chống Trộm Xe Máy', 'khoa-xe-may', N'Khóa chữ U, khóa đĩa xe', 'https://placehold.co/400x400/png', 7, 1, @Now, 0);

-- =======================================================================
-- BRANDS
-- =======================================================================
DECLARE @BrandVietTiep UNIQUEIDENTIFIER = NEWID();
DECLARE @BrandHoaPhat UNIQUEIDENTIFIER = NEWID();
DECLARE @BrandBofa UNIQUEIDENTIFIER = NEWID();
DECLARE @BrandXiaomi UNIQUEIDENTIFIER = NEWID();
DECLARE @BrandYale UNIQUEIDENTIFIER = NEWID();

INSERT INTO [Brands] ([Id], [Name], [Slug], [Description], [LogoUrl], [IsActive], [CreatedAt], [IsDeleted])
VALUES
(@BrandVietTiep, N'Việt Tiệp', 'viet-tiep', N'Thương hiệu khóa và két sắt Việt Nam', 'https://placehold.co/400x400/png', 1, @Now, 0),
(@BrandHoaPhat, N'Hòa Phát', 'hoa-phat', N'Tập đoàn sản xuất két sắt uy tín', 'https://placehold.co/400x400/png', 1, @Now, 0),
(@BrandBofa, N'Bofa Safe', 'bofa-safe', N'Thương hiệu két sắt nhập khẩu cao cấp', 'https://placehold.co/400x400/png', 1, @Now, 0),
(@BrandXiaomi, N'Xiaomi', 'xiaomi', N'Thiết bị thông minh công nghệ cao', 'https://placehold.co/400x400/png', 1, @Now, 0),
(@BrandYale, N'Yale', 'yale', N'Khóa thông minh chuẩn Mỹ', 'https://placehold.co/400x400/png', 1, @Now, 0);

-- =======================================================================
-- PRODUCTS
-- =======================================================================
DECLARE @P1 UNIQUEIDENTIFIER = NEWID(), @P2 UNIQUEIDENTIFIER = NEWID(), @P3 UNIQUEIDENTIFIER = NEWID(),
        @P4 UNIQUEIDENTIFIER = NEWID(), @P5 UNIQUEIDENTIFIER = NEWID(), @P6 UNIQUEIDENTIFIER = NEWID(),
        @P7 UNIQUEIDENTIFIER = NEWID(), @P8 UNIQUEIDENTIFIER = NEWID(), @P9 UNIQUEIDENTIFIER = NEWID(),
        @P10 UNIQUEIDENTIFIER = NEWID(), @P11 UNIQUEIDENTIFIER = NEWID(), @P12 UNIQUEIDENTIFIER = NEWID();

INSERT INTO [Products] ([Id], [CategoryId], [BrandId], [Name], [Slug], [Sku], [ShortDescription], [Description], [BasePrice], [SalePrice], [ThumbnailUrl], [Status], [IsFeatured], [ViewCount], [CreatedAt], [IsDeleted])
VALUES
(@P1, @CatSafeFamily, @BrandVietTiep, N'Két Sắt Điện Tử Việt Tiệp K45', 'ket-sat-dien-tu-viet-tiep-k45', 'VT-K45E', N'An toàn cho gia đình', N'<p>Mô tả chi tiết</p>', 2500000, 2300000, 'https://placehold.co/400x400/png', 1, 1, 1500, @Now, 0),
(@P2, @CatSafeFamily, @BrandVietTiep, N'Két Sắt Vân Tay Việt Tiệp K60', 'ket-sat-van-tay-viet-tiep-k60', 'VT-K60F', N'Mở bằng vân tay', N'<p>Mô tả chi tiết</p>', 3800000, 3500000, 'https://placehold.co/400x400/png', 1, 1, 3200, @Now, 0),
(@P3, @CatSafeFireproof, @BrandHoaPhat, N'Két Chống Cháy Hòa Phát KS50', 'ket-chong-chay-hoa-phat-ks50', 'HP-KS50', N'Chịu lửa 2 giờ', N'<p>Mô tả chi tiết</p>', 4500000, NULL, 'https://placehold.co/400x400/png', 1, 1, 450, @Now, 0),
(@P4, @CatSafeCompany, @BrandHoaPhat, N'Két Đại Công Ty Hòa Phát KA100', 'ket-dai-cong-ty-hoa-phat-ka100', 'HP-KA100', N'Thể tích 100L cực lớn', N'<p>Mô tả chi tiết</p>', 8900000, 8500000, 'https://placehold.co/400x400/png', 1, 0, 120, @Now, 0),
(@P5, @CatSafeMini, @BrandBofa, N'Két Sắt Mini Bofa Nhập Khẩu BFD-45', 'ket-sat-mini-bofa-bfd-45', 'BOFA-45', N'Nhập khẩu nguyên chiếc', N'<p>Mô tả chi tiết</p>', 12500000, 11900000, 'https://placehold.co/400x400/png', 1, 1, 800, @Now, 0),
(@P6, @CatSafeMini, @BrandXiaomi, N'Két Sắt Thông Minh Xiaomi Mijia', 'ket-sat-thong-minh-xiaomi', 'MI-SAFE1', N'Kết nối điện thoại', N'<p>Mô tả chi tiết</p>', 5500000, 4990000, 'https://placehold.co/400x400/png', 1, 1, 5500, @Now, 0),
(@P7, @CatLockDoor, @BrandVietTiep, N'Ổ Khóa Cầu Ngang Việt Tiệp', 'o-khoa-cau-ngang-viet-tiep', 'VT-01524', N'Chất liệu thép không gỉ', N'<p>Mô tả chi tiết</p>', 150000, 130000, 'https://placehold.co/400x400/png', 1, 0, 10000, @Now, 0),
(@P8, @CatLockDoor, @BrandVietTiep, N'Ổ Khóa Cửa Kéo Việt Tiệp Chống Cắt', 'o-khoa-cua-keo-viet-tiep', 'VT-01525', N'Công nghệ chống cắt', N'<p>Mô tả chi tiết</p>', 250000, NULL, 'https://placehold.co/400x400/png', 1, 0, 7500, @Now, 0),
(@P9, @CatLockSmart, @BrandYale, N'Khóa Cửa Điện Tử Yale YDM4109', 'khoa-cua-dien-tu-yale', 'YALE-4109', N'Tiêu chuẩn Mỹ', N'<p>Mô tả chi tiết</p>', 15000000, 14500000, 'https://placehold.co/400x400/png', 1, 1, 900, @Now, 0),
(@P10, @CatLockSmart, @BrandXiaomi, N'Khóa Cửa Thông Minh Xiaomi Face ID', 'khoa-cua-thong-minh-xiaomi-face-id', 'MI-LOCK-FACE', N'Nhận diện khuôn mặt', N'<p>Mô tả chi tiết</p>', 8900000, 7900000, 'https://placehold.co/400x400/png', 1, 1, 4000, @Now, 0),
(@P11, @CatLockVehicle, @BrandVietTiep, N'Khóa Chữ U Càng Dài Việt Tiệp', 'khoa-chu-u-viet-tiep', 'VT-06990', N'Bảo vệ xe gắn máy', N'<p>Mô tả chi tiết</p>', 220000, 199000, 'https://placehold.co/400x400/png', 1, 0, 3000, @Now, 0),
(@P12, @CatLockVehicle, @BrandVietTiep, N'Khóa Phanh Đĩa Xe Máy', 'khoa-phanh-dia', 'VT-06995', N'An toàn tuyệt đối', N'<p>Mô tả chi tiết</p>', 180000, 150000, 'https://placehold.co/400x400/png', 1, 0, 2000, @Now, 0);

-- =======================================================================
-- PRODUCT VARIANTS
-- =======================================================================
INSERT INTO [ProductVariants] ([Id], [ProductId], [Sku], [Name], [Price], [OriginalPrice], [StockQuantity], [LowStockThreshold], [WeightGram], [ImageUrl], [IsActive], [CreatedAt], [IsDeleted])
VALUES
-- P1: VT-K45E
(NEWID(), @P1, 'VT-K45E-BLK', N'Màu Đen', 2300000, 2500000, 50, 5, 45000, NULL, 1, @Now, 0),
(NEWID(), @P1, 'VT-K45E-WHT', N'Màu Trắng', 2350000, 2550000, 10, 5, 45000, NULL, 1, @Now, 0),

-- P2: VT-K60F
(NEWID(), @P2, 'VT-K60F-GLD', N'Màu Vàng Đồng', 3500000, 3800000, 30, 5, 60000, NULL, 1, @Now, 0),
(NEWID(), @P2, 'VT-K60F-BLK', N'Màu Đen Nhám', 3500000, 3800000, 25, 5, 60000, NULL, 1, @Now, 0),

-- P3: HP-KS50
(NEWID(), @P3, 'HP-KS50-STD', N'Tiêu Chuẩn', 4500000, NULL, 15, 2, 50000, NULL, 1, @Now, 0),

-- P4: HP-KA100
(NEWID(), @P4, 'HP-KA100-STD', N'Bản Mặc Định', 8500000, 8900000, 5, 1, 110000, NULL, 1, @Now, 0),

-- P5: BOFA-45
(NEWID(), @P5, 'BOFA-45-BRN', N'Màu Nâu', 11900000, 12500000, 8, 2, 45000, NULL, 1, @Now, 0),

-- P6: MI-SAFE1
(NEWID(), @P6, 'MI-SAFE1-GRY', N'Màu Xám', 4990000, 5500000, 45, 10, 20000, NULL, 1, @Now, 0),

-- P7-P12 have only 1 variant
(NEWID(), @P7, 'VT-01524-STD', N'Mặc định', 130000, 150000, 500, 50, 400, NULL, 1, @Now, 0),
(NEWID(), @P8, 'VT-01525-STD', N'Mặc định', 250000, NULL, 300, 30, 600, NULL, 1, @Now, 0),
(NEWID(), @P9, 'YALE-4109-BLK', N'Màu Đen', 14500000, 15000000, 10, 2, 2000, NULL, 1, @Now, 0),
(NEWID(), @P10, 'MI-LOCK-FACE-GLD', N'Màu Vàng Đồng', 7900000, 8900000, 20, 5, 3000, NULL, 1, @Now, 0),
(NEWID(), @P11, 'VT-06990-STD', N'Mặc định', 199000, 220000, 200, 20, 800, NULL, 1, @Now, 0),
(NEWID(), @P12, 'VT-06995-STD', N'Mặc định', 150000, 180000, 150, 15, 500, NULL, 1, @Now, 0);

-- =======================================================================
-- ORDERS
-- =======================================================================
DECLARE @O1 UNIQUEIDENTIFIER = NEWID(), @O2 UNIQUEIDENTIFIER = NEWID(), @O3 UNIQUEIDENTIFIER = NEWID(),
        @O4 UNIQUEIDENTIFIER = NEWID(), @O5 UNIQUEIDENTIFIER = NEWID(), @O6 UNIQUEIDENTIFIER = NEWID(),
        @O7 UNIQUEIDENTIFIER = NEWID(), @O8 UNIQUEIDENTIFIER = NEWID(), @O9 UNIQUEIDENTIFIER = NEWID(),
        @O10 UNIQUEIDENTIFIER = NEWID();

-- Status mapping: 0=Pending, 1=Confirmed, 2=Processing, 3=Shipped, 4=Delivered, 5=Cancelled
-- PaymentStatus mapping: 0=Unpaid, 1=Paid, 2=PartiallyPaid
-- PaymentMethod mapping: 0=COD, 1=BankTransfer, 2=VnPay, 3=MoMo
INSERT INTO [Orders] ([Id], [OrderCode], [UserId], [RecipientName], [RecipientPhone], [Province], [District], [Ward], [AddressDetail], [SubTotal], [ShippingFee], [DiscountAmount], [TotalAmount], [Status], [PaymentStatus], [PaymentMethod], [CreatedAt], [IsDeleted])
VALUES
(@O1, 'ORD-2026-0001', NULL, N'Đào Mai Anh', '0912345678', N'Hà Nội', N'Đống Đa', N'Láng Hạ', N'Số 11 Ngõ 22', 2300000, 0, 0, 2300000, 4, 1, 1, DATEADD(day, -10, @Now), 0),
(@O2, 'ORD-2026-0002', NULL, N'Lê Minh Tuấn', '0923456789', N'TP HCM', N'Quận 7', N'Tân Phong', N'Chung cư Sunrise', 14500000, 0, 500000, 14000000, 4, 1, 2, DATEADD(day, -8, @Now), 0),
(@O3, 'ORD-2026-0003', NULL, N'Phạm Thu Thủy', '0934567890', N'Đà Nẵng', N'Hải Châu', N'Thạch Thang', N'123 Lê Lợi', 3500000, 100000, 0, 3600000, 3, 0, 0, DATEADD(day, -5, @Now), 0),
(@O4, 'ORD-2026-0004', NULL, N'Trần Ngọc Phát', '0945678901', N'Cần Thơ', N'Ninh Kiều', N'Xuân Khánh', N'30A đường 3/2', 130000, 30000, 0, 160000, 4, 1, 3, DATEADD(day, -4, @Now), 0),
(@O5, 'ORD-2026-0005', NULL, N'Bùi Quang Huy', '0956789012', N'Hải Phòng', N'Ngô Quyền', N'Lạc Viên', N'45 Lê Lai', 8500000, 0, 0, 8500000, 2, 1, 1, DATEADD(day, -3, @Now), 0),
(@O6, 'ORD-2026-0006', NULL, N'Ngô Thanh Vân', '0967890123', N'Đồng Nai', N'Biên Hòa', N'Tam Hiệp', N'22 Phạm Văn Thuận', 4990000, 0, 0, 4990000, 1, 0, 0, DATEADD(day, -2, @Now), 0),
(@O7, 'ORD-2026-0007', NULL, N'Lý Hải', '0978901234', N'Bình Dương', N'Thủ Dầu Một', N'Phú Cường', N'Chợ Thủ Dầu Một', 11900000, 0, 900000, 11000000, 5, 0, 1, DATEADD(day, -1, @Now), 0),
(@O8, 'ORD-2026-0008', NULL, N'Hoàng Thùy Linh', '0989012345', N'Hà Nội', N'Tây Hồ', N'Quảng An', N'55 Xuân Diệu', 4500000, 0, 0, 4500000, 0, 0, 0, @Now, 0),
(@O9, 'ORD-2026-0009', NULL, N'Đặng Lê Nguyên', '0990123456', N'Đắk Lắk', N'Buôn Ma Thuột', N'Tân Lợi', N'1 Lý Tự Trọng', 150000, 30000, 0, 180000, 0, 0, 0, @Now, 0),
(@O10,'ORD-2026-0010', NULL, N'Phan Đình Tùng', '0900111222', N'TP HCM', N'Thủ Đức', N'Linh Trung', N'Làng Đại Học', 199000, 25000, 0, 224000, 4, 1, 3, DATEADD(day, -20, @Now), 0);

-- =======================================================================
-- ORDER ITEMS
-- =======================================================================
INSERT INTO [OrderItems] ([Id], [OrderId], [ProductId], [VariantId], [ProductName], [VariantName], [Sku], [ThumbnailUrl], [UnitPrice], [DiscountAmount], [Quantity], [SubTotal], [CreatedAt], [IsDeleted])
VALUES
(NEWID(), @O1, @P1, NULL, N'Két Sắt Điện Tử Việt Tiệp K45', N'Màu Đen', 'VT-K45E-BLK', 'https://placehold.co/400x400/png', 2300000, 0, 1, 2300000, @Now, 0),
(NEWID(), @O2, @P9, NULL, N'Khóa Cửa Điện Tử Yale YDM4109', N'Màu Đen', 'YALE-4109-BLK', 'https://placehold.co/400x400/png', 14500000, 0, 1, 14500000, @Now, 0),
(NEWID(), @O3, @P2, NULL, N'Két Sắt Vân Tay Việt Tiệp K60', N'Màu Vàng Đồng', 'VT-K60F-GLD', 'https://placehold.co/400x400/png', 3500000, 0, 1, 3500000, @Now, 0),
(NEWID(), @O4, @P7, NULL, N'Ổ Khóa Cầu Ngang Việt Tiệp', N'Mặc định', 'VT-01524-STD', 'https://placehold.co/400x400/png', 130000, 0, 1, 130000, @Now, 0),
(NEWID(), @O5, @P4, NULL, N'Két Đại Công Ty Hòa Phát KA100', N'Bản Mặc Định', 'HP-KA100-STD', 'https://placehold.co/400x400/png', 8500000, 0, 1, 8500000, @Now, 0),
(NEWID(), @O6, @P6, NULL, N'Két Sắt Thông Minh Xiaomi Mijia', N'Màu Xám', 'MI-SAFE1-GRY', 'https://placehold.co/400x400/png', 4990000, 0, 1, 4990000, @Now, 0),
(NEWID(), @O7, @P5, NULL, N'Két Sắt Mini Bofa Nhập Khẩu BFD-45', N'Màu Nâu', 'BOFA-45-BRN', 'https://placehold.co/400x400/png', 11900000, 0, 1, 11900000, @Now, 0),
(NEWID(), @O8, @P3, NULL, N'Két Chống Cháy Hòa Phát KS50', N'Tiêu Chuẩn', 'HP-KS50-STD', 'https://placehold.co/400x400/png', 4500000, 0, 1, 4500000, @Now, 0),
(NEWID(), @O9, @P12, NULL, N'Khóa Phanh Đĩa Xe Máy', N'Mặc định', 'VT-06995-STD', 'https://placehold.co/400x400/png', 150000, 0, 1, 150000, @Now, 0),
(NEWID(), @O10, @P11, NULL, N'Khóa Chữ U Càng Dài Việt Tiệp', N'Mặc định', 'VT-06990-STD', 'https://placehold.co/400x400/png', 199000, 0, 1, 199000, @Now, 0);

PRINT 'Massive fake data generated successfully!';
