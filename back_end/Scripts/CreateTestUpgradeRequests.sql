-- Script to create 3 test upgrade requests (2 Agency, 1 Host)
-- Make sure you have at least 3 Customer accounts (RoleId = 4) in your database

-- First, let's find Customer accounts (RoleId = 4) to use for test requests
-- If you don't have enough Customer accounts, you can create them first

-- Create 3 test upgrade requests:

-- 1. Agency Certificate Request #1
INSERT INTO AGENCIE_CERTIFICATES (
    ACCOUNT_ID,
    COMPANYNAME,
    LICENSE_FILE,
    PHONE,
    EMAIL,
    WEBSITE,
    STATUS,
    CREATED_AT,
    UPDATED_AT
)
SELECT TOP 1
    ID as ACCOUNT_ID,
    N'Công ty Du lịch ABC' as COMPANYNAME,
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' as LICENSE_FILE,
    '0901234567' as PHONE,
    'agency1@test.com' as EMAIL,
    'https://agency1-test.com' as WEBSITE,
    'Pending' as STATUS,
    GETDATE() as CREATED_AT,
    GETDATE() as UPDATED_AT
FROM ACCOUNTS
WHERE ROLE_ID = 4  -- Customer role
  AND ID NOT IN (SELECT ACCOUNT_ID FROM AGENCIE_CERTIFICATES WHERE STATUS = 'Pending')
ORDER BY ID;

-- 2. Agency Certificate Request #2
INSERT INTO AGENCIE_CERTIFICATES (
    ACCOUNT_ID,
    COMPANYNAME,
    LICENSE_FILE,
    PHONE,
    EMAIL,
    WEBSITE,
    STATUS,
    CREATED_AT,
    UPDATED_AT
)
SELECT TOP 1
    ID as ACCOUNT_ID,
    N'Công ty Lữ hành XYZ' as COMPANYNAME,
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' as LICENSE_FILE,
    '0912345678' as PHONE,
    'agency2@test.com' as EMAIL,
    'https://agency2-test.com' as WEBSITE,
    'Pending' as STATUS,
    GETDATE() as CREATED_AT,
    GETDATE() as UPDATED_AT
FROM ACCOUNTS
WHERE ROLE_ID = 4  -- Customer role
  AND ID NOT IN (SELECT ACCOUNT_ID FROM AGENCIE_CERTIFICATES WHERE STATUS = 'Pending')
  AND ID NOT IN (SELECT ACCOUNT_ID FROM AGENCIE_CERTIFICATES WHERE ACCOUNT_ID IN (
      SELECT TOP 1 ID FROM ACCOUNTS WHERE ROLE_ID = 4 ORDER BY ID
  ))
ORDER BY ID;

-- 3. Host Certificate Request #1
INSERT INTO HOST_CERTIFICATES (
    HOST_ID,
    BUSINESS_NAME,
    BUSINESS_LICENSE_FILE,
    PHONE,
    EMAIL,
    STATUS,
    CREATED_AT,
    UPDATED_AT
)
SELECT TOP 1
    ID as HOST_ID,
    N'Khách sạn Resort Paradise' as BUSINESS_NAME,
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' as BUSINESS_LICENSE_FILE,
    '0923456789' as PHONE,
    'host1@test.com' as EMAIL,
    'Pending' as STATUS,
    GETDATE() as CREATED_AT,
    GETDATE() as UPDATED_AT
FROM ACCOUNTS
WHERE ROLE_ID = 4  -- Customer role
  AND ID NOT IN (SELECT HOST_ID FROM HOST_CERTIFICATES WHERE STATUS = 'Pending')
  AND ID NOT IN (SELECT ACCOUNT_ID FROM AGENCIE_CERTIFICATES WHERE ACCOUNT_ID IN (
      SELECT TOP 2 ID FROM ACCOUNTS WHERE ROLE_ID = 4 ORDER BY ID
  ))
ORDER BY ID;

-- Verify the inserted records
SELECT 
    'Agency' as Type,
    AC.AGENCY_ID as CertificateId,
    AC.ACCOUNT_ID as UserId,
    A.NAME as UserName,
    A.EMAIL as UserEmail,
    AC.COMPANYNAME as CompanyName,
    AC.STATUS,
    AC.CREATED_AT
FROM AGENCIE_CERTIFICATES AC
INNER JOIN ACCOUNTS A ON AC.ACCOUNT_ID = A.ID
WHERE AC.STATUS = 'Pending'
ORDER BY AC.CREATED_AT DESC;

SELECT 
    'Host' as Type,
    HC.CERTIFICATE_ID as CertificateId,
    HC.HOST_ID as UserId,
    A.NAME as UserName,
    A.EMAIL as UserEmail,
    HC.BUSINESS_NAME as BusinessName,
    HC.STATUS,
    HC.CREATED_AT
FROM HOST_CERTIFICATES HC
INNER JOIN ACCOUNTS A ON HC.HOST_ID = A.ID
WHERE HC.STATUS = 'Pending'
ORDER BY HC.CREATED_AT DESC;

