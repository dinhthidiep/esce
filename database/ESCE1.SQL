
/*
CREATE DATABASE MasterDB;
GO
USE MasterDB;
GO

-- Danh sách công ty lữ hành (Tenant)
CREATE TABLE Tenants (
    TenantId INT PRIMARY KEY IDENTITY(1,1),
    CompanyName NVARCHAR(255) NOT NULL,
    ContactEmail NVARCHAR(255),
    Phone NVARCHAR(50),
    WebsiteUrl NVARCHAR(255),
    DatabaseName NVARCHAR(255) NOT NULL,
    ConnectionString NVARCHAR(1000) NOT NULL,
    Status NVARCHAR(20) DEFAULT 'ACTIVE',
    CreatedDate DATETIME DEFAULT GETDATE()
);

-- Tài khoản admin của mỗi công ty
CREATE TABLE TenantAdmins (
    AdminId INT PRIMARY KEY IDENTITY(1,1),
    TenantId INT NOT NULL,
    Username NVARCHAR(100) NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(255),
    Email NVARCHAR(255),
    FOREIGN KEY (TenantId) REFERENCES Tenants(TenantId)
);

INSERT INTO Tenants (CompanyName, ContactEmail, Phone, WebsiteUrl, DatabaseName, ConnectionString, Status)
VALUES 
('Green Tours', 'contact@greentours.com', '0909123456', 'https://greentours.com',
 'ESCE', 
 'Server=THANH_DIEP\\SQLEXPRESS;Database=ESCE;Trusted_Connection=True;',
 'ACTIVE');

INSERT INTO TenantAdmins (TenantId, Username, PasswordHash, FullName, Email)
VALUES 
(1, 'greentours_admin', '123456', N'Nguyễn Văn A', 'admin@greentours.com');








SELECT 
    t.CompanyName,
    u.NAME AS AccountName
FROM Tenants t
CROSS APPLY (
    SELECT TOP 1 a.NAME
    FROM ESCE.dbo.ACCOUNTS a
) u;

*/







DROP DATABASE IF EXISTS ESCE;
CREATE DATABASE ESCE;
GO
USE ESCE;

------------------------------------------------
-- 1. Roles & Accounts
------------------------------------------------
CREATE TABLE ROLES (
    ID INT PRIMARY KEY IDENTITY(1,1),
    NAME NVARCHAR(50) UNIQUE NOT NULL,         -- Agency, Host, Tourist
    DESCRIPTION NVARCHAR(255)
);

CREATE TABLE ACCOUNTS (
    ID INT IDENTITY(1,1) PRIMARY KEY, 
    NAME NVARCHAR(100) NOT NULL,
    EMAIL NVARCHAR(100) UNIQUE NOT NULL,
    PASSWORD_HASH VARCHAR(500) NOT NULL,
    PASSWORD VARCHAR(32) NULL,
    AVATAR NVARCHAR(255),
    PHONE VARCHAR(10),
    DOB DATE,
    GENDER NVARCHAR(10),
    ADDRESS NVARCHAR(255),
    IS_ACTIVE BIT DEFAULT 1,
    CREATED_AT DATETIME DEFAULT GETDATE(),
    UPDATED_AT DATETIME DEFAULT GETDATE(),
    ROLE_ID INT NOT NULL,
	IsBanned bit NOT NULL
    FOREIGN KEY (ROLE_ID) REFERENCES ROLES(ID)

);

------------------------------------------------
-- OTP xác thực
------------------------------------------------
CREATE TABLE OTP (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    USER_ID INT NOT NULL,
    CODE NVARCHAR(10) NOT NULL,
    EMAIL NVARCHAR(50),
    EXPIRATION_TIME DATETIME NOT NULL,
    IS_VERIFIED BIT DEFAULT 0,
    CREATED_AT DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (USER_ID) REFERENCES ACCOUNTS(ID)
);

--  Host Business Certificate
------------------------------------------------
CREATE TABLE HOST_CERTIFICATES (
    CertificateId INT IDENTITY(1,1) PRIMARY KEY,
    HostId INT NOT NULL,  
    BusinessLicenseFile NVARCHAR(500)NOT NULL,           -- file scan/ảnh giấy phép
    BusinessName NVARCHAR(255) NOT NULL,              -- tên farm/doanh nghiệp
    Phone NVARCHAR(20) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    Status NVARCHAR(50) DEFAULT 'pending',            -- pending / approved / rejected
    RejectComment NVARCHAR(1000) NULL,                -- lý do từ chối
    ReviewComments NVARCHAR(1000) NULL,               -- ghi chú duyệt
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (HostId) REFERENCES ACCOUNTS(ID)
);

CREATE TABLE AGENCIE_CERTIFICATES(
    AgencyId INT IDENTITY(1,1) PRIMARY KEY,
    AccountId INT NOT NULL,                           -- Người đại diện công ty (đăng nhập bằng ACCOUNTS)
    COMPANYNAME Nvarchar(255) NOT NULL,                     --TÊN CÔNG TY DU LICH
    LicenseFile NVARCHAR(500)NOT NULL,                   -- File/scan giấy phép
    Phone NVARCHAR(20) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    Website NVARCHAR(255) NULL,
    Status NVARCHAR(50) DEFAULT 'pending',            -- pending / approved / rejected
    RejectComment NVARCHAR(1000)  NULL,
    ReviewComments NVARCHAR(1000) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (AccountId) REFERENCES ACCOUNTS(ID)
);

------------------------------------------------
-- 4. Dịch vụ & combo
------------------------------------------------
CREATE TABLE SERVICE (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    NAME NVARCHAR(255) NOT NULL,
    DESCRIPTION NVARCHAR(255),
    PRICE DECIMAL(18,2) NOT NULL,
    HOST_ID INT NOT NULL, 
    CREATED_AT DATETIME DEFAULT GETDATE(),
    UPDATED_AT DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (HOST_ID) REFERENCES ACCOUNTS(ID)
);

CREATE TABLE SERVICECOMBO (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    NAME NVARCHAR(255) NOT NULL,
    ADDRESS NVARCHAR(255) NOT NULL,
    DESCRIPTION NVARCHAR(1000),
    PRICE DECIMAL(18,2) NOT NULL,
    AVAILABLE_SLOTS INT NOT NULL,
    IMAGE NVARCHAR(255),
    STATUS NVARCHAR(50) DEFAULT 'open',     -- open / closed / canceled
    CANCELLATION_POLICY NVARCHAR(1000) NULL,
    CREATED_AT DATETIME DEFAULT GETDATE(),
    UPDATED_AT DATETIME DEFAULT GETDATE(),
    HOST_ID INT NOT NULL,
    FOREIGN KEY (HOST_ID) REFERENCES ACCOUNTS(ID)
);

CREATE TABLE SERVICECOMBO_DETAIL (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    SERVICECOMBO_ID INT NOT NULL,
    SERVICE_ID INT NOT NULL,
    QUANTITY INT DEFAULT 1,
    FOREIGN KEY (SERVICECOMBO_ID) REFERENCES SERVICECOMBO(ID),
    FOREIGN KEY (SERVICE_ID) REFERENCES SERVICE(ID)
);

------------------------------------------------
--  Cái mã giảm giá này là mã mà người chủ combo dịch vụ thêm vào cho combo dịch vụ của họ ( họ thêm hay không tùy họ. chỉ áp dụng cho Combo)
------------------------------------------------
CREATE TABLE COUPONS (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    CODE NVARCHAR(50) UNIQUE NOT NULL,
    DESCRIPTION NVARCHAR(255),
    DISCOUNT_PERCENT DECIMAL(5,2) NULL,    -- % giảm 
    DISCOUNT_AMOUNT DECIMAL(18,2) NULL,    -- giảm theo số tiền
    USAGE_LIMIT INT NOT NULL,              -- tổng số slot cho mã
    USAGE_COUNT INT DEFAULT 0,             -- đã sử dụng
    HOST_ID INT NOT NULL,                  -- chủ sở hữu
    SERVICECOMBO_ID INT NOT NULL,          -- áp dụng cho combo
    IS_ACTIVE BIT DEFAULT 1,
    CREATED_AT DATETIME DEFAULT GETDATE(),
    UPDATED_AT DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (HOST_ID) REFERENCES ACCOUNTS(ID),
    FOREIGN KEY (SERVICECOMBO_ID) REFERENCES SERVICECOMBO(ID)
);

GO

-- 3. Trigger 
CREATE TRIGGER TR_COUPONS_CheckHost
ON COUPONS
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN SERVICECOMBO sc ON sc.ID = i.SERVICECOMBO_ID
        WHERE sc.HOST_ID <> i.HOST_ID
    )
    BEGIN
        RAISERROR('HOST_ID must match the owner of the SERVICECOMBO.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO
------------------------------------------------
-- 6. Bookings & Payments
------------------------------------------------
CREATE TABLE BOOKINGS (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    USER_ID INT NOT NULL,
    COMBO_ID INT NOT NULL,
    BOOKING_DATE DATETIME DEFAULT GETDATE(),
    START_DATE DATE NOT NULL,
    END_DATE DATE NOT NULL,
    QUANTITY INT NOT NULL,
    TOTAL_AMOUNT DECIMAL(18,2) NOT NULL,
    NOTES NVARCHAR(500),
    STATUS NVARCHAR(50) DEFAULT 'pending',  -- pending / confirmed / canceled / paid
    FOREIGN KEY (USER_ID) REFERENCES ACCOUNTS(ID),
    FOREIGN KEY (COMBO_ID) REFERENCES SERVICECOMBO(ID)
);
--khách du lịch có thể dùng mã giảm giá của combo nếu có 

CREATE TABLE BOOKING_COUPONS (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    BOOKING_ID INT NOT NULL,
    COUPON_ID INT NOT NULL,
    APPLIED_AT DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (BOOKING_ID) REFERENCES BOOKINGS(ID),
    FOREIGN KEY (COUPON_ID) REFERENCES COUPONS(ID),
    CONSTRAINT UQ_BookingPromotion UNIQUE (BOOKING_ID, COUPON_ID)
);

CREATE TABLE PAYMENTS (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    BOOKING_ID INT NOT NULL,
    AMOUNT DECIMAL(18,2) NOT NULL,
    PAYMENT_DATE DATETIME DEFAULT GETDATE(),
    METHOD NVARCHAR(50),
    STATUS NVARCHAR(50) DEFAULT 'pending',
    FOREIGN KEY (BOOKING_ID) REFERENCES BOOKINGS(ID)
);

------------------------------------------------
-- 7. Reviews
------------------------------------------------
CREATE TABLE REVIEWS (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    COMBO_ID INT NOT NULL,                         -- Review cho combo
    AUTHOR_ID INT NOT NULL,
    PARENT_REVIEW_ID INT NULL,                      -- CHO CÁI PHẦN REPLY REVIEW
    RATING INT NULL,                               -- 1–5 sao (chỉ review gốc)
    CONTENT NVARCHAR(MAX) NOT NULL,
    CREATED_AT DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (COMBO_ID) REFERENCES SERVICECOMBO(ID),
    FOREIGN KEY (AUTHOR_ID) REFERENCES ACCOUNTS(ID),
    FOREIGN KEY (PARENT_REVIEW_ID) REFERENCES REVIEWS(ID)
);

------------------------------------------------
-- 8. Notifications
------------------------------------------------
CREATE TABLE NOTIFICATIONS (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    USER_ID INT NOT NULL,
    MESSAGE NVARCHAR(500),
    IS_READ BIT DEFAULT 0,
    CREATED_AT DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (USER_ID) REFERENCES ACCOUNTS(ID)
);

------------------------------------------------
-- 9. Social (Posts, Comments, Reactions)
------------------------------------------------
CREATE TABLE POSTS (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    TITLE NVARCHAR(255) NOT NULL,
    CONTENT NVARCHAR(MAX) NOT NULL,
    AUTHOR_ID INT NOT NULL,
    Image NVARCHAR(500) NULL,                       
    CREATED_AT DATETIME DEFAULT GETDATE(),
    UPDATED_AT DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (AUTHOR_ID) REFERENCES ACCOUNTS(ID)
);

CREATE TABLE COMMENTS (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    POST_ID INT NOT NULL,
    AUTHOR_ID INT NOT NULL,
    PARENT_COMMENT_ID INT NULL,
    CONTENT NVARCHAR(MAX) NOT NULL,
    CREATED_AT DATETIME DEFAULT GETDATE(),
    Image NVARCHAR(500) NULL,                      
    FOREIGN KEY (POST_ID) REFERENCES POSTS(ID),
    FOREIGN KEY (AUTHOR_ID) REFERENCES ACCOUNTS(ID),
    FOREIGN KEY (PARENT_COMMENT_ID) REFERENCES COMMENTS(ID)
);

CREATE TABLE REACTIONS (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    USER_ID INT NOT NULL,
    TARGET_TYPE NVARCHAR(20) NOT NULL,     -- 'POST', 'COMMENT' để dễ mở rộng nếu muốn sau này có thể reaction tin nhắn 
    TARGET_ID INT NOT NULL,
    REACTION_TYPE NVARCHAR(20) NOT NULL,   -- Like / Love / Haha / Angry...
    CREATED_AT DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (USER_ID) REFERENCES ACCOUNTS(ID)
);

------------------------------------------------
-- 10. Messages
------------------------------------------------
CREATE TABLE MESSAGES (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    SENDER_ID INT NOT NULL,
    RECEIVER_ID INT NOT NULL,
    CONTENT NVARCHAR(2000) NOT NULL,
    CREATED_AT DATETIME DEFAULT GETDATE(),
    IS_READ BIT DEFAULT 0,
    FOREIGN KEY (SENDER_ID) REFERENCES ACCOUNTS(ID),
    FOREIGN KEY (RECEIVER_ID) REFERENCES ACCOUNTS(ID)
);


------------------------------------------------
-- 12. Request Supports
------------------------------------------------
CREATE TABLE REQUEST_SUPPORTS (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    USER_ID INT NOT NULL,
    COMBO_ID INT NULL,
    SUPPORT_TYPE NVARCHAR(255),
    CONTENT NVARCHAR(1000) NOT NULL,
    IMAGE VARCHAR(255) NULL,
    STATUS NVARCHAR(50) DEFAULT 'Pending',
    CREATED_AT DATETIME DEFAULT GETDATE(),
    UPDATED_AT DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (USER_ID) REFERENCES ACCOUNTS(ID),
    FOREIGN KEY (COMBO_ID) REFERENCES SERVICECOMBO(ID)
);

CREATE TABLE SUPPORT_RESPONSES (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    SUPPORT_ID INT NOT NULL,                  -- Thuộc yêu cầu hỗ trợ nào
    RESPONDER_ID INT NOT NULL,                -- Ai phản hồi (Admin/Host/User)
    CONTENT NVARCHAR(1000) NOT NULL,          -- Nội dung phản hồi
    IMAGE NVARCHAR(255) NULL,                 -- Ảnh minh họa (nếu có)
    CREATED_AT DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (SUPPORT_ID) REFERENCES REQUEST_SUPPORTS(ID),
    FOREIGN KEY (RESPONDER_ID) REFERENCES ACCOUNTS(ID)
);
------------------------------------------------
-- 13. News
------------------------------------------------
CREATE TABLE NEWS (
    NewsId INT IDENTITY(1,1) PRIMARY KEY,
    AccountId INT NOT NULL,                         -- người đăng tin
    NewsTitle NVARCHAR(255) NOT NULL,
    CreatedDate DATETIME DEFAULT GETDATE(),
    Image NVARCHAR(500) NULL,                       -- link ảnh
    SocialMediaLink NVARCHAR(500) NULL,             -- link mạng xã hội
    FOREIGN KEY (AccountId) REFERENCES ACCOUNTS(ID)
);


CREATE TABLE SYSTEM_LOGS (
    LogId INT IDENTITY(1,1) PRIMARY KEY,
    LogLevel NVARCHAR(50),       -- INFO, WARN, ERROR
    Message NVARCHAR(MAX),       -- Mô tả lỗi
    StackTrace NVARCHAR(MAX),    -- Chi tiết lỗi (nếu có)
    CreatedAt DATETIME DEFAULT GETDATE(),
    UserId INT NULL,             -- Ai đang thao tác
    Module NVARCHAR(100) NULL    -- Phần nào trong hệ thống bị lỗi (VD: Login, Booking, Payment)
);


INSERT INTO ROLES (NAME, DESCRIPTION)
VALUES 
('Agency', N'Công ty du lịch'),
('Host', N'Chủ farm du lịch'),
('Tourist', N'Khách du lịch');

-- 2️⃣ Accounts (ví dụ)
INSERT INTO ACCOUNTS (NAME, EMAIL, PASSWORD_HASH, ROLE_ID, IsBanned)
VALUES
(N'Công ty Green Tours', 'agency@greentours.com', '123456', 1, 0),
(N'Farm Happy Land', 'host@happyland.com', '123456', 2, 0),
(N'Nguyễn Minh Khang', 'tourist@gmail.com', '123456', 3, 0);

-- 3️⃣ Dịch vụ
INSERT INTO SERVICE (NAME, DESCRIPTION, PRICE, HOST_ID)
VALUES 
(N'Tour trải nghiệm làm nông', N'Trải nghiệm công việc nông trại 1 ngày', 500000, 2);

INSERT INTO SERVICECOMBO (NAME, ADDRESS, DESCRIPTION, PRICE, AVAILABLE_SLOTS, HOST_ID)
VALUES
(N'Combo Trải nghiệm GreenFarm', N'Bắc Yên, Sơn La', N'Gói combo 2 ngày 1 đêm tại GreenFarm', 1200000, 10, 2);

INSERT INTO ACCOUNTS (NAME, EMAIL, PASSWORD_HASH, PASSWORD, ROLE_ID, IsBanned)
VALUES
(N'Hồ Lê Phương Nam', 'holephuongnam.2004@gmail.com', '123456', '123456', 3, 0)
