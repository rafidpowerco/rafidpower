-- ==============================================================================
-- Rafid SmartBridge - Unified Database Architecture (SQL)
-- هذه الهيكلة (Schema) مصممة لتكون "اللغة المشتركة" بين برنامج ديلفي (SmartBridge)
-- وبين محرك الذكاء الاصطناعي السحابي، لضمان تزامن البيانات وتحليلها.
-- ==============================================================================

-- 1. جدول الشاحنات (The Trucks Entity)
CREATE TABLE Trucks (
    license_plate VARCHAR(20) PRIMARY KEY,  -- رقم الشاحنة
    tare_weight DECIMAL(10,2) NOT NULL,     -- الوزن الفارغ (الطرحية)
    company_name VARCHAR(100),              -- الشركة التابعة لها
    last_weighed TIMESTAMP,                 -- آخر مرة تم وزنها 
    blacklisted BOOLEAN DEFAULT FALSE       -- لمنع الشاحنات المتلاعبة
);

-- 2. جدول المعايرة (The Calibration History)
CREATE TABLE Calibrations (
    calibration_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_model VARCHAR(50),               -- مثلا Zemic HM9B
    calibration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    drift_offset DECIMAL(10,4),             -- الانحراف المسجل الذي تم تعديله
    ai_calculated_k_factor DECIMAL(10,4),   -- معامل المرونة الذي حسبه الذكاء الاصطناعي
    certified_by VARCHAR(100)               -- اسم المهندس
);

-- 3. جدول الأوزان وتذاكر الميزان السحابية (The Weighing Transactions)
CREATE TABLE WeighingRecords (
    ticket_id VARCHAR(50) PRIMARY KEY,      -- رقم التذكرة المتزامن
    license_plate VARCHAR(20),              -- مرتبط بالشاحنة
    gross_weight DECIMAL(10,2) NOT NULL,    -- الوزن القائم
    net_weight DECIMAL(10,2) NOT NULL,      -- الوزن الصافي
    weighing_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- التوقيع الرقمي لمنع التزوير (QR Fingerprint)
    qr_cryptographic_hash VARCHAR(256) UNIQUE, 
    
    -- تحليل الذكاء الاصطناعي المباشر
    fraud_detected BOOLEAN DEFAULT FALSE,   -- هل تم رصد محاولة تلاعب؟
    ai_confidence_score DECIMAL(5,2),       -- نسبة ثقة الذكاء الاصطناعي بالوزن
    
    FOREIGN KEY(license_plate) REFERENCES Trucks(license_plate)
);

-- 4. إعدادات الفهارس لتسريع البحث (Performance Optimization)
CREATE INDEX idx_license_plate ON WeighingRecords(license_plate);
CREATE INDEX idx_timestamp ON WeighingRecords(weighing_timestamp);
