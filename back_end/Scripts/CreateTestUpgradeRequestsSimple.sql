-- Simple script to create 3 test upgrade requests
-- This script will create requests for the first 3 Customer accounts (RoleId = 4) it finds
-- If you want to specify specific Account IDs, replace the SELECT TOP 1 with specific IDs

-- Check if we have Customer accounts
IF NOT EXISTS (SELECT 1 FROM ACCOUNTS WHERE ROLE_ID = 4)
BEGIN
    PRINT 'ERROR: No Customer accounts (RoleId = 4) found in database.';
    PRINT 'Please create at least 3 Customer accounts first.';
    RETURN;
END

-- 1. Agency Certificate Request #1
IF NOT EXISTS (
    SELECT 1 FROM AGENCIE_CERTIFICATES AC
    INNER JOIN ACCOUNTS A ON AC.ACCOUNT_ID = A.ID
    WHERE A.ROLE_ID = 4 AND AC.STATUS = 'Pending'
    AND AC.ACCOUNT_ID = (SELECT TOP 1 ID FROM ACCOUNTS WHERE ROLE_ID = 4 ORDER BY ID)
)
BEGIN
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
        ID,
        N'Công ty Du lịch ABC',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        '0901234567',
        'agency1@test.com',
        'https://agency1-test.com',
        'Pending',
        GETDATE(),
        GETDATE()
    FROM ACCOUNTS
    WHERE ROLE_ID = 4
    ORDER BY ID;
    
    PRINT 'Created Agency Certificate Request #1';
END
ELSE
BEGIN
    PRINT 'Agency Certificate Request #1 already exists for first Customer account';
END

-- 2. Agency Certificate Request #2
IF NOT EXISTS (
    SELECT 1 FROM AGENCIE_CERTIFICATES AC
    INNER JOIN ACCOUNTS A ON AC.ACCOUNT_ID = A.ID
    WHERE A.ROLE_ID = 4 AND AC.STATUS = 'Pending'
    AND AC.ACCOUNT_ID = (
        SELECT TOP 1 ID FROM ACCOUNTS 
        WHERE ROLE_ID = 4 
        AND ID NOT IN (SELECT TOP 1 ID FROM ACCOUNTS WHERE ROLE_ID = 4 ORDER BY ID)
        ORDER BY ID
    )
)
BEGIN
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
        ID,
        N'Công ty Lữ hành XYZ',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        '0912345678',
        'agency2@test.com',
        'https://agency2-test.com',
        'Pending',
        GETDATE(),
        GETDATE()
    FROM ACCOUNTS
    WHERE ROLE_ID = 4
    AND ID NOT IN (
        SELECT TOP 1 ID FROM ACCOUNTS WHERE ROLE_ID = 4 ORDER BY ID
    )
    ORDER BY ID;
    
    PRINT 'Created Agency Certificate Request #2';
END
ELSE
BEGIN
    PRINT 'Agency Certificate Request #2 already exists for second Customer account';
END

-- 3. Host Certificate Request #1
IF NOT EXISTS (
    SELECT 1 FROM HOST_CERTIFICATES HC
    INNER JOIN ACCOUNTS A ON HC.HOST_ID = A.ID
    WHERE A.ROLE_ID = 4 AND HC.STATUS = 'Pending'
    AND HC.HOST_ID = (
        SELECT TOP 1 ID FROM ACCOUNTS 
        WHERE ROLE_ID = 4 
        AND ID NOT IN (
            SELECT TOP 2 ID FROM ACCOUNTS WHERE ROLE_ID = 4 ORDER BY ID
        )
        ORDER BY ID
    )
)
BEGIN
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
        ID,
        N'Khách sạn Resort Paradise',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        '0923456789',
        'host1@test.com',
        'Pending',
        GETDATE(),
        GETDATE()
    FROM ACCOUNTS
    WHERE ROLE_ID = 4
    AND ID NOT IN (
        SELECT TOP 2 ID FROM ACCOUNTS WHERE ROLE_ID = 4 ORDER BY ID
    )
    ORDER BY ID;
    
    PRINT 'Created Host Certificate Request #1';
END
ELSE
BEGIN
    PRINT 'Host Certificate Request #1 already exists for third Customer account';
END

-- Verify the inserted records
PRINT '';
PRINT '=== Verification: Agency Certificates ===';
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

PRINT '';
PRINT '=== Verification: Host Certificates ===';
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

PRINT '';
PRINT 'Script completed!';

