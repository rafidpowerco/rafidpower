-- ==============================================================================
-- AL-RAFIDAIN MASTER SCHEMA 
-- Core Nexus for Hardware, Operations, and Security Logs
-- Environment: MySQL Server (Cloud)
-- Version: 2026.04 
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS alrafidain_db;
USE alrafidain_db;

-- 1. HARDWARE LAYER: SCALES
-- Tracks physical locations, capacities, and calibration statuses
CREATE TABLE Scales (
    scale_serial VARCHAR(50) PRIMARY KEY,
    location_name VARCHAR(100) NOT NULL,
    max_capacity_kg DECIMAL(10,2) NOT NULL,
    sensor_type VARCHAR(100) NOT NULL, -- e.g., 'Zemic HM9B', 'Yaohua A9'
    last_calibration_date DATETIME,
    status ENUM('ACTIVE', 'MAINTENANCE', 'COMPROMISED') DEFAULT 'ACTIVE',
    ip_address VARCHAR(45)
);

-- 2. OPERATIONAL LAYER: CERTIFICATES
-- The immutable ledger of weighings
CREATE TABLE Certificates (
    certificate_id VARCHAR(50) PRIMARY KEY,
    scale_serial VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150),
    truck_plate VARCHAR(30),
    gross_weight DECIMAL(10,2) NOT NULL,
    tare_weight DECIMAL(10,2) NOT NULL,
    net_weight DECIMAL(10,2) GENERATED ALWAYS AS (gross_weight - tare_weight) STORED,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    secure_qr_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 for Cryptographic Validation
    FOREIGN KEY (scale_serial) REFERENCES Scales(scale_serial)
);

-- 3. SECURITY LAYER: ANTI_FRAUD_LOGS
-- Monitored directly by the 'Learner Agent'
CREATE TABLE Anti_Fraud_Logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    certificate_id VARCHAR(50), 
    scale_serial VARCHAR(50),
    attempted_weight DECIMAL(10,2),
    fraud_reason VARCHAR(255) NOT NULL, -- e.g., 'Physics Boundary Violation', 'Manual Override'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (scale_serial) REFERENCES Scales(scale_serial)
);

-- Indexing for Lightning-Fast Queries by the Analyst Agent
CREATE INDEX idx_cert_hash ON Certificates(secure_qr_hash);
CREATE INDEX idx_fraud_serial ON Anti_Fraud_Logs(scale_serial);
