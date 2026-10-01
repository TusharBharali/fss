-- ============================================================
-- FIRST STEPS PRE-SCHOOL — Complete Database Schema
-- Database: fss_admin
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `fss_admin`
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `fss_admin`;

-- ============================================================
-- TABLE: admin_users
-- Stores admin login credentials (supports multiple admins)
-- ============================================================
CREATE TABLE IF NOT EXISTS `admin_users` (
    `id`            INT(11) NOT NULL AUTO_INCREMENT,
    `username`      VARCHAR(50) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name`     VARCHAR(100) DEFAULT NULL,
    `email`         VARCHAR(150) DEFAULT NULL,
    `last_login`    DATETIME DEFAULT NULL,
    `created_at`    DATETIME DEFAULT CURRENT_TIMESTAMP,
    `is_active`     TINYINT(1) DEFAULT 1,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin: username=admin, password=Admin@123 (verified bcrypt hash)
INSERT INTO `admin_users` (`username`, `password_hash`, `full_name`, `email`) VALUES
('admin', '$2y$12$L51KFbP63qbJ8hya0WmdKOlIVe7huAQ5JS7GT6.NaNJY0RWdpHjY2', 'Admin User', 'admin@firststepspreschool.com')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);


-- ============================================================
-- TABLE: gallery
-- Stores photo gallery items shown on the public website
-- Flexible category allows custom categories like Outdoor, Celebrations, etc.
-- ============================================================
CREATE TABLE IF NOT EXISTS `gallery` (
    `id`          INT(11) NOT NULL AUTO_INCREMENT,
    `title`       VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `category`    VARCHAR(100) DEFAULT 'General',
    `image_path`  VARCHAR(500) NOT NULL,
    `image_name`  VARCHAR(255) NOT NULL,
    `file_size`   BIGINT(20) DEFAULT NULL COMMENT 'Size in bytes',
    `mime_type`   VARCHAR(100) DEFAULT NULL,
    `is_active`   TINYINT(1) DEFAULT 1,
    `sort_order`  INT(11) DEFAULT 0,
    `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category`),
    KEY `idx_is_active` (`is_active`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE: notices
-- Stores notice board announcements shown on the public website
-- Flexible attachment_type supports PDF, JPG, PNG, WEBP, DOCX, etc.
-- ============================================================
CREATE TABLE IF NOT EXISTS `notices` (
    `id`              INT(11) NOT NULL AUTO_INCREMENT,
    `title`           VARCHAR(255) NOT NULL,
    `content`         TEXT NOT NULL,
    `publish_date`    DATE NOT NULL,
    `expiry_date`     DATE DEFAULT NULL COMMENT 'Optional — notice is hidden after this date',
    `is_highlighted`  TINYINT(1) DEFAULT 0 COMMENT 'Pinned/featured on the noticeboard',
    `attachment_path` VARCHAR(500) DEFAULT NULL,
    `attachment_name` VARCHAR(255) DEFAULT NULL,
    `attachment_type` VARCHAR(20) DEFAULT 'NONE',
    `status`          ENUM('Draft','Active','Expired') DEFAULT 'Active',
    `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`),
    KEY `idx_publish_date` (`publish_date`),
    KEY `idx_is_highlighted` (`is_highlighted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE: activities
-- Stores activities/programs shown in the Activities section
-- ============================================================
CREATE TABLE IF NOT EXISTS `activities` (
    `id`          INT(11) NOT NULL AUTO_INCREMENT,
    `title`       VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `icon`        VARCHAR(10) DEFAULT '🎨' COMMENT 'Emoji icon for the activity card',
    `color_class` VARCHAR(50) DEFAULT 'purple' COMMENT 'Color theme: purple, orange, blue, green, pink, yellow',
    `image_path`  VARCHAR(500) DEFAULT NULL,
    `image_name`  VARCHAR(255) DEFAULT NULL,
    `age_group`   VARCHAR(50) DEFAULT NULL COMMENT 'e.g. 2-3 years, 3-5 years',
    `schedule`    VARCHAR(100) DEFAULT NULL COMMENT 'e.g. Mon, Wed, Fri | 9AM-11AM',
    `is_active`   TINYINT(1) DEFAULT 1,
    `sort_order`  INT(11) DEFAULT 0,
    `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE: contact_submissions
-- Stores enquiry form submissions from the public website
-- ============================================================
CREATE TABLE IF NOT EXISTS `contact_submissions` (
    `id`         INT(11) NOT NULL AUTO_INCREMENT,
    `name`       VARCHAR(150) NOT NULL,
    `email`      VARCHAR(150) NOT NULL,
    `phone`      VARCHAR(50) DEFAULT NULL,
    `message`    TEXT NOT NULL,
    `status`     ENUM('Unread','Read','Replied') DEFAULT 'Unread',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE: feedbacks
-- Stores parent testimonials / feedbacks
-- ============================================================
CREATE TABLE IF NOT EXISTS `feedbacks` (
    `id`          INT(11) NOT NULL AUTO_INCREMENT,
    `parent_name` VARCHAR(150) NOT NULL,
    `child_info`  VARCHAR(150) DEFAULT NULL,
    `rating`      TINYINT(1) DEFAULT 5,
    `feedback`    TEXT NOT NULL,
    `status`      ENUM('Pending','Approved','Rejected') DEFAULT 'Approved',
    `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
-- End of fss_admin schema
