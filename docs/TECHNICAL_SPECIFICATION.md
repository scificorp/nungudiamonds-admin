# Nungu Diamonds Admin Panel - Technical Specification

**Version:** 1.0  
**Date:** January 18, 2026  
**Status:** Draft - For Review  
**Phase:** PRD Refinement & Technical Design

---

## 1. Executive Summary

This document provides a comprehensive technical specification for implementing the Nungu Diamonds Admin Panel enhancements based on the Product Requirements Document (PRD). The implementation will be conducted in 3 phases over approximately 20 weeks, with admin panel taking precedence over front-end changes.

### Key Decisions Documented

| Decision | Resolution |
|----------|------------|
| FX Rate Source | Manual entry initially (no API integration) |
| Diamond Pricing Model | Multi-factor: Carat + Cut + Color + Clarity (not just carat) |
| Calendar Integration | Microsoft Outlook (user's existing system) + Internal view |
| Implementation Priority | Admin Panel → Front-end |

---

## 2. Architecture Overview

### 2.1 System Context

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         NUNGU DIAMONDS SYSTEM                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐   │
│  │   CUSTOMER      │     │    ADMIN        │     │   EXTERNAL      │   │
│  │   FRONTEND      │◄────│    PANEL        │────►│   SYSTEMS       │   │
│  │   (Separate)    │     │   (This Spec)   │     │                 │   │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘   │
│           │                     │                        │              │
│           │                     │                        │              │
│           └─────────────────────┼────────────────────────┘              │
│                                 │                                       │
│                          ┌──────▼──────┐                               │
│                          │   API LAYER  │                               │
│                          │  (tcctechapi)│                               │
│                          └──────┬──────┘                               │
│                                 │                                       │
│                          ┌──────▼──────┐                               │
│                          │  DATABASE   │                               │
│                          │  (MySQL)    │                               │
│                          └─────────────┘                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Admin Panel Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 13.1.1 |
| Language | TypeScript | 4.9.4 |
| UI Library | Material-UI (MUI) | 5.x |
| State Management | Redux Toolkit | 1.9.x |
| Forms | React Hook Form + Yup | 7.x + 1.x |
| Data Tables | MUI X Data Grid | 6.x |
| Charts | Recharts / ApexCharts | Latest |
| HTTP Client | Axios | 1.x |
| Icons | Iconify / Bootstrap Icons | Latest |

### 2.3 Backend API Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Node.js + Express | 18.x / 4.x |
| Database | MySQL | 8.0 |
| ORM | Sequelize | 6.x |
| Authentication | JWT | Latest |
| Email | Nodemailer | 6.x |
| Calendar | Microsoft Graph API | Latest |

---

## 3. Data Model Specifications

### 3.1 Diamond Pricing Model (Revised)

The diamond pricing model must consider multiple factors beyond just carat weight.

#### Current Model (Insufficient)
```
diamond_group_masters: { id, id_stone, id_shape, id_mm_size, id_color, id_clarity, id_cuts, rate }
```
*Problem: Single rate field doesn't capture complexity*

#### Proposed Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    DIAMOND PRICING MODEL                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Base Rate Tables:                                              │
│  ├── diamond_quality_matrix (price per carat by quality)       │
│  ├── diamond_shape_multiplier (shape impact on price)          │
│  ├── diamond_cut_benchmark (quality tiers)                     │
│  └── stone_type_base_rates (diamond, sapphire, ruby, etc.)    │
│                                                                 │
│  Formula:                                                       │
│  Price = Base_Rate × Weight × Shape_Multiplier × Quality_Index │
│                                                                 │
│  Where:                                                         │
│  - Base_Rate: Per-carat rate for stone type + quality combo    │
│  - Weight: Carat weight (customer-facing)                       │
│  - Shape_Multiplier: Round=1.0, Princess=0.85, etc.            │
│  - Quality_Index: Based on cut + color + clarity combination   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Database Changes Required

```sql
-- Create diamond quality matrix table
CREATE TABLE `diamond_quality_matrix` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `id_stone_type` INT NOT NULL,
  `id_cut` INT NOT NULL,
  `id_color` INT NOT NULL,
  `id_clarity` INT NOT NULL,
  `price_per_carat` DECIMAL(12,2) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_stone_quality` (`id_stone_type`, `id_cut`, `id_color`, `id_clarity`),
  FOREIGN KEY (`id_stone_type`) REFERENCES `gemstones`(`id`),
  FOREIGN KEY (`id_cut`) REFERENCES `cuts`(`id`),
  FOREIGN KEY (`id_color`) REFERENCES `color`(`id`),
  FOREIGN KEY (`id_clarity`) REFERENCES `clarity`(`id`)
);

-- Create shape multiplier table
CREATE TABLE `diamond_shape_multipliers` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `id_shape` INT NOT NULL,
  `multiplier` DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  `description` VARCHAR(255),
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_shape`) REFERENCES `diamond_shape`(`id`)
);

-- Pre-populate shape multipliers (example values)
INSERT INTO `diamond_shape_multipliers` (`id_shape`, `multiplier`, `description`) VALUES
(1, 1.00, 'Round - baseline pricing'),
(2, 0.85, 'Princess - typically 15% less than round'),
(3, 0.90, 'Emerald - typically 10% less than round'),
(4, 0.80, 'Oval - typically 20% less than round'),
(5, 0.75, 'Pear - typically 25% less than round'),
(6, 0.70, 'Marquise - typically 30% less than round'),
(7, 0.88, 'Radiant - typically 12% less than round'),
(8, 0.82, 'Asscher - typically 18% less than round'),
(9, 0.78, 'Heart - typically 22% less than round'),
(10, 0.85, 'Cushion - typically 15% less than round');

-- Update product_diamond_options to use atomic fields
ALTER TABLE `product_diamond_options` ADD COLUMN `id_shape` INT NULL AFTER `id_diamond_group`;
ALTER TABLE `product_diamond_options` ADD COLUMN `id_color` INT NULL AFTER `id_shape`;
ALTER TABLE `product_diamond_options` ADD COLUMN `id_clarity` INT NULL AFTER `id_color`;
ALTER TABLE `product_diamond_options` ADD COLUMN `id_cut` INT NULL AFTER `id_clarity`;
ALTER TABLE `product_diamond_options` ADD COLUMN `carat_weight` DECIMAL(8,3) NULL AFTER `weight`;
ALTER TABLE `product_diamond_options` MODIFY `weight` DECIMAL(8,3) NULL COMMENT 'Deprecated - use carat_weight';

-- Create index for faster lookups
CREATE INDEX `idx_diamond_quality_lookup` ON `diamond_quality_matrix` 
  (`id_stone_type`, `id_cut`, `id_color`, `id_clarity`);
```

### 3.2 Multi-Tone Metal Support

```sql
-- Create product metal components table for multi-tone support
CREATE TABLE `product_metal_components` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `id_product` INT NOT NULL,
  `id_variant` INT NULL,
  `component_order` INT NOT NULL DEFAULT 1,
  `id_metal` INT NOT NULL,
  `id_karat` INT NOT NULL,
  `id_metal_tone` INT NOT NULL,
  `weight` DECIMAL(8,3) NOT NULL COMMENT 'Weight in grams for this component',
  `is_primary` TINYINT(1) DEFAULT 0 COMMENT 'Primary metal for display',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_product`) REFERENCES `products`(`id`),
  FOREIGN KEY (`id_metal`) REFERENCES `metal_master`(`id`),
  FOREIGN KEY (`id_karat`) REFERENCES `goldkt`(`id`),
  FOREIGN KEY (`id_metal_tone`) REFERENCES `metal_tone`(`id`)
);

-- Create index for variant lookups
CREATE INDEX `idx_metal_components_variant` ON `product_metal_components` 
  (`id_product`, `id_variant`);

-- Create view for total metal calculation
CREATE VIEW `product_metal_summary` AS
SELECT 
  pmc.id_product,
  pmc.id_variant,
  GROUP_CONCAT(
    CONCAT(mm.name, ' ', gk.name, ' ', mt.name, ': ', pmc.weight, 'g')
    ORDER BY pmc.component_order
    SEPARATOR ' + '
  ) as metal_composition,
  SUM(
    pmc.weight * 
    (mm.metal_rate / 31.104) * (gk.name / 24)
  ) as total_metal_cost,
  COUNT(pmc.id) as component_count
FROM `product_metal_components` pmc
JOIN `metal_master` mm ON pmc.id_metal = mm.id
JOIN `goldkt` gk ON pmc.id_karat = gk.id
JOIN `metal_tone` mt ON pmc.id_metal_tone = mt.id
GROUP BY pmc.id_product, pmc.id_variant;
```

### 3.3 Product Eligibility Flags

```sql
-- Add product eligibility fields
ALTER TABLE `products` ADD COLUMN `is_purchasable_online` TINYINT(1) DEFAULT 0 AFTER `is_trending`;
ALTER TABLE `products` ADD COLUMN `is_price_on_request` TINYINT(1) DEFAULT 0 AFTER `is_purchasable_online`;
ALTER TABLE `products` ADD COLUMN `is_consult_to_purchase` TINYINT(1) DEFAULT 0 AFTER `is_price_on_request`;
ALTER TABLE `products` ADD COLUMN `price_threshold_exceeded` TINYINT(1) DEFAULT 0 AFTER `is_consult_to_purchase`;
ALTER TABLE `products` ADD COLUMN `price_threshold` DECIMAL(12,2) NULL AFTER `price_threshold_exceeded`;

-- Add configuration table for thresholds
CREATE TABLE `pricing_config` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `config_key` VARCHAR(100) NOT NULL UNIQUE,
  `config_value` VARCHAR(255) NOT NULL,
  `description` VARCHAR(500),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Pre-populate pricing configuration
INSERT INTO `pricing_config` (`config_key`, `config_value`, `description`) VALUES
('price_on_request_threshold', '50000', 'Products above this price (in ZAR) are flagged as price on request'),
('fx_rate_manual', '18.50', 'Manual USD to ZAR exchange rate'),
('metal_update_cadence', 'monthly', 'How often metal rates can be updated: daily/weekly/monthly/quarterly'),
('diamond_update_cadence', 'monthly', 'How often diamond rates can be updated: daily/weekly/monthly/quarterly'),
('default_currency', 'ZAR', 'Default currency for display');

-- Create rate change history table
CREATE TABLE `rate_change_history` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `rate_type` ENUM('fx', 'metal', 'diamond', 'stone') NOT NULL,
  `old_value` DECIMAL(12,4) NOT NULL,
  `new_value` DECIMAL(12,4) NOT NULL,
  `id_admin` INT NOT NULL,
  `admin_name` VARCHAR(255),
  `notes` VARCHAR(500),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_admin`) REFERENCES `business_user`(`id`)
);
```

### 3.4 Enhanced Booking System

```sql
-- Add booking status and notes to enquiries
ALTER TABLE `enquiries` ADD COLUMN `status` ENUM('new', 'confirmed', 'completed', 'no_show', 'cancelled') DEFAULT 'new' AFTER `enquirie_type`;
ALTER TABLE `enquiries` ADD COLUMN `notes` TEXT NULL AFTER `status`;
ALTER TABLE `enquiries` ADD COLUMN `calendar_event_id` VARCHAR(255) NULL AFTER `notes`;
ALTER TABLE `enquiries` ADD COLUMN `calendar_link` VARCHAR(500) NULL AFTER `calendar_event_id`;
ALTER TABLE `enquiries` ADD COLUMN `outlook_event_id` VARCHAR(255) NULL AFTER `calendar_link`;

-- Add booking preferences
ALTER TABLE `enquiries` ADD COLUMN `booking_purpose` VARCHAR(255) NULL AFTER `message`;
ALTER TABLE `enquiries` ADD COLUMN `number_of_guests` INT DEFAULT 1 AFTER `booking_purpose`;

-- Create booking slots table (for internal calendar management)
CREATE TABLE `booking_slots` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `slot_date` DATE NOT NULL,
  `slot_time_start` TIME NOT NULL,
  `slot_time_end` TIME NOT NULL,
  `is_available` TINYINT(1) DEFAULT 1,
  `max_capacity` INT DEFAULT 1,
  `notes` VARCHAR(500),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_slot_time` (`slot_date`, `slot_time_start`)
);

-- Create index for calendar queries
CREATE INDEX `idx_booking_calendar` ON `enquiries` (`date`, `time`, `status`);
CREATE INDEX `idx_slots_date` ON `booking_slots` (`slot_date`, `is_available`);
```

---

## 4. API Specifications

### 4.1 Rates Management API

```typescript
// Base URL: /api/v2/rates

/**
 * GET /api/v2/rates
 * Get all current rates
 * Response: {
 *   fx: { usd_to_zar: number, updated_at: string },
 *   metals: [{ id: number, name: string, rate: number, karats: [...] }],
 *   diamonds: { base_rates: [...], quality_matrix: [...] },
 *   config: { update_cadence: string, threshold: number }
 * }
 */
GET /rates

/**
 * PUT /api/v2/rates/fx
 * Update FX rate (manual)
 * Body: { rate: number, notes?: string }
 * Response: { success: true, old_rate: number, new_rate: number, timestamp: string }
 */
PUT /rates/fx

/**
 * PUT /api/v2/rates/metals
 * Update metal rates
 * Body: { metals: [{ id: number, rate: number }], notes?: string }
 * Response: { success: true, updates: [...] }
 */
PUT /rates/metals

/**
 * PUT /api/v2/rates/diamonds
 * Update diamond quality matrix rates
 * Body: { rates: [{ id: number, price_per_carat: number }], notes?: string }
 * Response: { success: true, updates: [...] }
 */
PUT /rates/diamonds

/**
 * GET /api/v2/rates/history
 * Get rate change history
 * Query: { page?: number, per_page?: number, type?: 'fx'|'metal'|'diamond' }
 * Response: { items: [...], pagination: {...} }
 */
GET /rates/history

/**
 * PUT /api/v2/rates/config
 * Update rate configuration
 * Body: { update_cadence?: string, threshold?: number }
 * Response: { success: true, config: {...} }
 */
PUT /rates/config
```

### 4.2 Product Management API

```typescript
// Base URL: /api/v2/products

/**
 * POST /api/v2/products
 * Create new product with all details
 * Body: {
 *   name: string, sku: string, description: string,
 *   category_ids: number[],
 *   metal_components: [{ id_metal, id_karat, id_metal_tone, weight, component_order }],
 *   diamond_options: [{ id_type, id_shape, id_color, id_clarity, id_cut, carat_weight, count }],
 *   pricing: { making_charge, other_charge, is_purchasable_online, is_price_on_request },
 *   images: File[]
 * }
 * Response: { success: true, product_id: number }
 */
POST /products

/**
 * PUT /api/v2/products/:id
 * Update product (single-item edit without bulk)
 * Body: (same as create, with optional fields for updates)
 * Response: { success: true }
 */
PUT /products/:id

/**
 * POST /api/v2/products/attributes/inline
 * Create new attribute value inline
 * Body: { attribute_type: string, name: string, related_ids?: {...} }
 * Response: { success: true, attribute: { id: number, name: string } }
 */
POST /products/attributes/inline

/**
 * PUT /api/v2/products/:id/variants
 * Update product variants
 * Body: { variants: [{ id, metal_components, diamond_options, pricing }] }
 * Response: { success: true }
 */
PUT /products/:id/variants

/**
 * PUT /api/v2/products/:id/eligibility
 * Update product purchase eligibility
 * Body: { 
 *   is_purchasable_online: boolean,
 *   is_price_on_request: boolean,
 *   is_consult_to_purchase: boolean
 * }
 * Response: { success: true }
 */
PUT /products/:id/eligibility

/**
 * POST /api/v2/products/:id/images
 * Upload product images (multipart/form-data)
 * Body: { images: File[] }
 * Response: { success: true, images: [{ id, url }] }
 */
POST /products/:id/images
```

### 4.3 Booking Management API

```typescript
// Base URL: /api/v2/bookings

/**
 * GET /api/v2/bookings
 * Get all bookings with filters
 * Query: { 
 *   status?: string, 
 *   start_date?: string, 
 *   end_date?: string,
 *   page?: number,
 *   per_page?: number
 * }
 * Response: { items: [...], pagination: {...} }
 */
GET /bookings

/**
 * GET /api/v2/bookings/calendar
 * Get bookings formatted for calendar view
 * Query: { month: number, year: number }
 * Response: { 
 *   bookings: [{ 
 *     id, date, time, customer_name, status, 
 *     purpose, calendar_link, outlook_event_id 
 *   }],
 *   slots: [{ date, time_start, time_end, is_available }]
 * }
 */
GET /bookings/calendar

/**
 * PUT /api/v2/bookings/:id/status
 * Update booking status
 * Body: { status: string, notes?: string }
 * Response: { success: true }
 */
PUT /bookings/:id/status

/**
 * PUT /api/v2/bookings/:id/notes
 * Update booking notes
 * Body: { notes: string }
 * Response: { success: true }
 */
PUT /bookings/:id/notes

/**
 * POST /api/v2/bookings/:id/calendar-link
 * Generate calendar links (ICS + Outlook)
 * Response: { 
 *   ics_link: string, 
 *   outlook_link: string,
 *   google_link: string 
 * }
 */
POST /bookings/:id/calendar-link

/**
 * POST /api/v2/bookings/:id/sync-outlook
 * Sync booking to Outlook calendar
 * Response: { success: true, outlook_event_id: string }
 */
POST /bookings/:id/sync-outlook

/**
 * GET /api/v2/bookings/slots
 * Get available booking slots
 * Query: { date?: string, start_date?: string, end_date?: string }
 * Response: { slots: [{ date, time_start, time_end, available: boolean }] }
 */
GET /bookings/slots

/**
 * POST /api/v2/bookings/slots
 * Create/update booking slots
 * Body: { slots: [{ date, time_start, time_end, max_capacity }] }
 * Response: { success: true }
 */
POST /bookings/slots
```

---

## 5. Admin Panel UI Specifications

### 5.1 New Navigation Structure

```typescript
// Updated navigation/vertical/index.ts

const navigation = (): VerticalNavItemsType => {
  return [
    { title: 'Dashboard', path: '/dashboard', icon: 'tabler:smart-home' },
    
    // PRODUCTS - Enhanced
    {
      sectionTitle: 'PRODUCT MANAGEMENT'
    },
    {
      title: 'Product',
      icon: 'fluent-mdl2:product-variant',
      children: [
        { title: 'Add Product', path: '/product/add' },  // NEW - simplified wizard
        { title: 'All Products', path: '/product/all-products' },
        { title: 'Bulk Upload', path: '/product/product-bulk-upload/file-import' },
        { title: 'Gift Sets', path: '/product/gift-set/gift-list' },
        { title: 'Product Stocks', path: '/product/product-stocks' }
      ]
    },
    
    // RATES - NEW SECTION
    {
      sectionTitle: 'RATE MANAGEMENT'  // NEW
    },
    {
      title: 'Rates',
      icon: 'tabler:currency-rupee',
      children: [
        { title: 'FX Rate', path: '/rates/fx-rate' },                    // NEW
        { title: 'Metal Rates', path: '/rates/metal-rates' },            // ENHANCED
        { title: 'Diamond Rates', path: '/rates/diamond-rates' },        // NEW
        { title: 'Update History', path: '/rates/history' },             // NEW
        { title: 'Configuration', path: '/rates/configuration' }         // NEW
      ]
    },
    
    // ATTRIBUTES - Simplified
    {
      title: 'Attributes',
      icon: 'mdi:message-reply-outline',
      children: [
        // Individual attribute types...
        { title: 'Diamond Quality Matrix', path: '/attribute/diamond-quality-matrix' },  // NEW
        // ... other attributes
      ]
    },
    
    // BOOKINGS - NEW SECTION
    {
      sectionTitle: 'BOOKING MANAGEMENT'  // NEW
    },
    {
      title: 'Appointments',
      icon: 'tabler:calendar-time',
      children: [
        { title: 'Calendar View', path: '/bookings/calendar' },           // NEW
        { title: 'All Bookings', path: '/bookings/all' },                 // NEW - unified view
        { title: 'Slot Settings', path: '/bookings/slots' }               // NEW
      ]
    },
    
    // CONFIGURATION - NEW
    {
      sectionTitle: 'CONFIGURATION'  // NEW
    },
    {
      title: 'Pricing Rules',
      icon: 'tabler:settings-2',
      children: [
        { title: 'Price Thresholds', path: '/config/price-thresholds' }, // NEW
        { title: 'Eligibility Rules', path: '/config/eligibility' },     // NEW
        { title: 'Cadence Settings', path: '/config/cadence' }           // NEW
      ]
    },
    
    // ... existing sections (Orders, Customers, etc.)
  ]
}
```

### 5.2 Rates Management Page

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        RATE MANAGEMENT                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  FX Rate (USD → ZAR)                                             │   │
│  │  ┌──────────────────┐  ┌──────────────────┐  [UPDATE]           │   │
│  │  │ 18.50            │  │ Last Updated:    │                     │   │
│  │  └──────────────────┘  │ 18 Jan 2026 10:30│                     │   │
│  │                       └──────────────────┘                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Metal Rates (per gram)                                          │   │
│  │  ┌─────────┬────────────────┬────────────────┬──────────────┐   │   │
│  │  │ Metal   │ Rate (ZAR/g)   │ Last Updated   │ Actions      │   │   │
│  │  ├─────────┼────────────────┼────────────────┼──────────────┤   │   │
│  │  │ 9K Gold │ 1,234.56       │ 18 Jan 2026    │ [Edit]       │   │   │
│  │  │ 14K Gold│ 1,987.65       │ 18 Jan 2026    │ [Edit]       │   │   │
│  │  │ 18K Gold│ 2,543.21       │ 18 Jan 2026    │ [Edit]       │   │   │
│  │  │ 22K Gold│ 3,098.76       │ 18 Jan 2026    │ [Edit]       │   │   │
│  │  │ Silver  │ 123.45         │ 18 Jan 2026    │ [Edit]       │   │   │
│  │  │ Platinum│ 2,765.43       │ 18 Jan 2026    │ [Edit]       │   │   │
│  │  └─────────┴────────────────┴────────────────┴──────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Diamond Quality Matrix (per carat)                              │   │
│  │  [Filter: Stone Type ▾] [Filter: Cut ▾] [Filter: Color ▾]       │   │
│  │  ┌─────────┬──────────┬────────┬─────────┬──────────┬────────┐  │   │
│  │  │ Cut     │ Color    │ Clarity│ $/Carat │ Updated  │ Actions│  │   │
│  │  ├─────────┼──────────┼────────┼─────────┼──────────┼────────┤  │   │
│  │  │ Excellent│ D       │ IF     │ 45,000  │ 18 Jan   │ [Edit] │  │   │
│  │  │ Excellent│ D       │ VVS1   │ 42,000  │ 18 Jan   │ [Edit] │  │   │
│  │  │ Excellent│ E       │ VS1    │ 38,000  │ 18 Jan   │ [Edit] │  │   │
│  │  │ ...     │ ...      │ ...    │ ...     │ ...      │ ...    │  │   │
│  │  └─────────┴──────────┴────────┴─────────┴──────────┴────────┘  │   │
│  │  [+ Add New Quality Combination]                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Configuration                                                    │   │
│  │  Cadence: [Monthly ▾]  Price Threshold: [50,000 ZAR ▾]          │   │
│  │  [SAVE CONFIGURATION]                                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Booking Calendar Page

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      BOOKING CALENDAR                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  [< January 2026 >]  [Today]  [Sync to Outlook]                        │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  M   T   W   T   F   S   S                                     │    │
│  │  1   2   3   4   5   6   7                                     │    │
│  │  8   9   10  11  12  13  14                                    │    │
│  │  15  16  17  18  19  20  21  ◉ = Booking                        │    │
│  │  22  23  24  25  26  27  28                                    │    │
│  │  29  30  31                                                    │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─ Selected: 18 January 2026 ─────────────────────────────────────┐   │
│  │                                                                 │   │
│  │  [Add Booking]  [Slot Settings]                                 │   │
│  │                                                                 │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │ 10:00 - John Smith (Consultation)                         │  │   │
│  │  │ Status: [Confirmed ▾]  Notes: [________]  [Add to Outlook]│  │   │
│  │  │ Purpose: Ring sizing consultation                          │  │   │
│  │  │ [View Details]  [Edit]  [Cancel]                          │  │   │
│  │  ├───────────────────────────────────────────────────────────┤  │   │
│  │  │ 11:30 - Sarah Johnson (Product Viewing)                   │  │   │
│  │  │ Status: [New ▾]  Notes: [________]  [Add to Outlook]      │  │   │
│  │  │ Purpose: Browse engagement rings                           │  │   │
│  │  │ [View Details]  [Edit]  [Cancel]                          │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─ Sidebar: Quick Stats ──────────────────────────────────────────┐   │
│  │  Today: 3 bookings                                              │   │
│  │  This Week: 12 bookings                                        │   │
│  │  Pending Confirmation: 2                                        │   │
│  │  Completed This Month: 45                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Simplified Product Add Wizard

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ADD NEW PRODUCT                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  Step 1: Basic Info ──── Step 2: Metals ──── Step 3: Diamonds ── Done  │
│  ●○○○○○○○○○○                                                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Basic Information                                              │   │
│  │                                                                 │   │
│  │  Product Name *      [_________________________________]       │   │
│  │  SKU *               [_________________________________]       │   │
│  │  Description         [____________________________] (long)     │   │
│  │                                                                 │   │
│  │  Categories *        [Select... ▾] [+ Add New Category]        │   │
│  │                                                                 │   │
│  │  Tags                [Select... ▾] [+ Add New Tag]             │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Pricing                                                        │   │
│  │                                                                 │   │
│  │  Making Charge (ZAR) *  [_____________]                        │   │
│  │  Other Charges (ZAR)    [_____________]                        │   │
│  │                                                                 │   │
│  │  Eligibility:                                                      │   │
│  │  ○ Purchasable Online  ○ Price on Request  ○ Consult to Purchase │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [Cancel]                                     [Next: Add Metals >]     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Phases

### Phase 1: Product Management & Rates (16 weeks)

#### Weeks 1-4: Product Wizard Enhancement
| Task | Effort | Dependencies |
|------|--------|--------------|
| Simplify Add Product form | 1 week | None |
| Add inline attribute creation | 1.5 weeks | None |
| Enhance variant management UI | 1.5 weeks | None |
| Direct image upload with drag-drop | 1 week | None |

#### Weeks 5-9: Rates Management
| Task | Effort | Dependencies |
|------|--------|--------------|
| Create FX Rate management page | 1 week | None |
| Create Diamond Quality Matrix page | 2 weeks | Database changes |
| Create Rate History view | 0.5 week | None |
| Create Rate Configuration page | 0.5 week | None |
| Update Metal Rate page | 0.5 week | None |
| Connect rates to product pricing | 1.5 weeks | Product Wizard |
| Rate change audit logging | 1 week | None |

#### Weeks 10-13: Diamond Model & Multi-Tone
| Task | Effort | Dependencies |
|------|--------|--------------|
| Implement atomic diamond fields | 1.5 weeks | Database changes |
| Build pricing calculator service | 1 week | Quality Matrix |
| Multi-tone metal components UI | 2 weeks | Database changes |
| Update product display pricing | 1 week | Calculator service |

#### Week 14: Integration & Testing
| Task | Effort | Dependencies |
|------|--------|--------------|
| End-to-end testing | 1 week | All Phase 1 tasks |
| Bug fixes | 1 week | Testing |

### Phase 2: Bookings (4 weeks)

#### Weeks 15-16: Calendar & Email
| Task | Effort | Dependencies |
|------|--------|--------------|
| Fix booking email templates | 0.5 week | None |
| Create calendar view page | 1.5 weeks | None |
| Outlook Calendar integration | 1.5 weeks | Microsoft Graph API |
| Internal slot management | 0.5 week | Calendar view |

#### Weeks 17-18: Admin Panel & Status
| Task | Effort | Dependencies |
|------|--------|--------------|
| Enhanced booking list view | 0.5 week | Calendar |
| Status workflow | 0.5 week | Calendar |
| Notes functionality | 0.5 week | Calendar |
| Testing | 0.5 week | All |

### Phase 3: E-commerce Enablement (3 weeks)

#### Weeks 19-20: Eligibility & Payments
| Task | Effort | Dependencies |
|------|--------|--------------|
| Eligibility flags UI | 0.5 week | None |
| Price threshold logic | 0.5 week | Rates config |
| Yoco payment verification | 0.5 week | Existing Yoco |
| Eligibility rules integration | 0.5 week | Product Wizard |
| Final testing | 0.5 week | All |

---

## 7. External Integrations

### 7.1 Microsoft Outlook Calendar Integration

```typescript
// Service: src/services/outlookCalendar.ts

interface OutlookConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
}

interface CalendarEvent {
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName: string };
  attendees?: { emailAddress: { address: string; name: string }; type: string }[];
  body?: { contentType: string; content: string };
}

class OutlookCalendarService {
  private config: OutlookConfig;
  private accessToken: string | null = null;

  /**
   * Generate OAuth2 authorization URL
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: 'Calendars.ReadWrite offline_access',
      response_mode: 'query'
    });
    return `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/authorize?${params}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<string> {
    // POST to token endpoint with client credentials
    // Return access token
  }

  /**
   * Create calendar event for booking
   */
  async createEvent(booking: Booking): Promise<string> {
    const event: CalendarEvent = {
      subject: `Nungu Diamonds: ${booking.customer_name} - ${booking.purpose}`,
      start: {
        dateTime: `${booking.date}T${booking.time}:00`,
        timeZone: 'Africa/Johannesburg'
      },
      end: {
        dateTime: this.calculateEndTime(booking.date, booking.time),
        timeZone: 'Africa/Johannesburg'
      },
      location: {
        displayName: 'Nungu Diamonds Showroom'
      },
      attendees: [{
        emailAddress: { address: booking.email, name: booking.customer_name },
        type: 'required'
      }],
      body: {
        contentType: 'HTML',
        content: this.generateEmailContent(booking)
      }
    };

    // POST to Graph API
    // Return event ID
  }

  /**
   * Generate ICS file content for download
   */
  generateICS(booking: Booking): string {
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nungu Diamonds//Admin//EN
BEGIN:VEVENT
UID:${booking.id}@nungudiamonds.co.za
DTSTAMP:${new Date().toISOString()}
DTSTART:${booking.date}T${booking.time}:00
DTEND:${this.calculateEndTime(booking.date, booking.time)}:00
SUMMARY:Nungu Diamonds Appointment
DESCRIPTION:${this.generateEmailContent(booking)}
LOCATION:Nungu Diamonds Showroom
END:VEVENT
END:VCALENDAR`;
  }
}
```

### 7.2 Configuration for External Services

```typescript
// src/configs/outlook.ts

export const outlookConfig = {
  clientId: process.env.OUTLOOK_CLIENT_ID || '',
  clientSecret: process.env.OUTLOOK_CLIENT_SECRET || '',
  tenantId: process.env.OUTLOOK_TENANT_ID || '',
  redirectUri: process.env.OUTLOOK_REDIRECT_URI || 'http://localhost:3000/api/auth/outlook/callback',
  scopes: ['Calendars.ReadWrite', 'offline_access']
};
```

---

## 8. Security & Permissions

### 8.1 Role-Based Access Control

| Role | Rates Access | Booking Access | Product Access | Config Access |
|------|--------------|----------------|----------------|---------------|
| Admin (Merchandising) | Read/Write | Read | Full | Read |
| Admin (Ops) | Read | Full | Read | None |
| Support Staff | None | Read/Write | Limited | None |
| Super Admin | Full | Full | Full | Full |

### 8.2 Rate Change Authorization

```typescript
// Middleware: src/middleware/rateAuth.ts

interface RateChangePayload {
  rateType: 'fx' | 'metal' | 'diamond';
  oldValue: number;
  newValue: number;
  notes?: string;
}

const rateAuthMiddleware = (requiredRole: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Verify user has required role
    // Log rate change attempt
    // Require confirmation for large changes (>10%)
    // Require 2FA for production environment
  };
};
```

---

## 9. Testing Strategy

### 9.1 Test Coverage Requirements

| Component | Unit Tests | Integration Tests | E2E Tests |
|-----------|------------|-------------------|-----------|
| Rates Service | 80% | 70% | 5 scenarios |
| Product Service | 80% | 70% | 10 scenarios |
| Booking Service | 80% | 70% | 8 scenarios |
| Outlook Integration | 60% | 50% | 3 scenarios |
| Pricing Calculator | 90% | 80% | 10 scenarios |

### 9.2 Critical Test Scenarios

1. **Rate Updates**
   - FX rate change reflects in product pricing
   - Metal rate change updates all affected products
   - Rate history is logged correctly
   - Threshold alerts trigger appropriately

2. **Diamond Pricing**
   - Quality matrix lookup returns correct price
   - Shape multipliers apply correctly
   - Multi-carat calculation is accurate
   - Price on request flag triggers correctly

3. **Booking System**
   - Outlook sync creates event correctly
   - ICS download generates valid file
   - Status workflow changes reflect in UI
   - Notes save and display correctly

---

## 10. Deployment & CI/CD

### 10.1 Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT PIPELINE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │  Commit  │───►│  Build   │───►│  Test    │───►│  Deploy  │         │
│  │          │    │          │    │          │    │  Staging │         │
│  └──────────┘    └──────────┘    └──────────┘    └────┬─────┘         │
│                                                        │                │
│                                                        ▼                │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │  Rollback│◄───│  Deploy  │◄───│  E2E     │◄───│  Deploy  │         │
│  │          │    │  Prod    │    │  Tests   │    │  Staging │         │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘         │
│                                                                         │
│  AWS Amplify: https://tcctechadmin-nungudiamonds.amplifyapp.com        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Environment Variables Required

```bash
# AWS Amplify Environment Variables

# Existing (keep)
NEXT_PUBLIC_API_ENDPOINT=https://api.nungudiamonds.co.za/api/v2/
NEXT_PUBLIC_REST_API_ENDPOINT=https://api.nungudiamonds.co.za/api/v2
NEXT_PUBLIC_IMG_ENDPOINT=https://d2yhu6nvl7lle6.cloudfront.net

# New - Outlook Integration
OUTLOOK_CLIENT_ID=
OUTLOOK_CLIENT_SECRET=
OUTLOOK_TENANT_ID=
OUTLOOK_REDIRECT_URI=

# New - Rate Configuration (after AWS setup)
CRYPTO_JS_KEY=
CRYPTO_JS_IV=
```

---

## 11. Documentation Requirements

### 11.1 Deliverables

| Document | Audience | Format |
|----------|----------|--------|
| Admin User Guide | End Users | Markdown + Screenshots |
| API Documentation | Developers | Swagger/OpenAPI |
| Deployment Guide | DevOps | Markdown |
| Runbook | Support Team | Markdown |
| Weekly Progress Reports | Stakeholders | PDF/Markdown |
| Monthly Status Reports | Client | PDF |

### 11.2 Documentation Structure

```
docs/
├── admin/
│   ├── user-guide.md
│   ├── rates-management.md
│   ├── bookings.md
│   └── product-management.md
├── technical/
│   ├── api-reference.md
│   ├── database-schema.md
│   └── architecture.md
├── deployment/
│   ├── setup.md
│   └── configuration.md
└── reports/
    ├── weekly/
    └── monthly/
```

---

## 12. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Outlook API changes | High | Low | Use Microsoft Graph SDK, version pinning |
| Database migration failure | High | Medium | Backup before migration, rollback plan |
| Pricing calculation errors | High | Low | Comprehensive unit tests, manual verification |
| Performance degradation | Medium | Medium | Pagination, caching, lazy loading |
| User adoption | Medium | Medium | Training sessions, intuitive UI |

---

## 13. Approval Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Technical Lead | | | |
| Product Owner | | | |
| QA Lead | | | |
| Client Representative | | | |

---

**Document Version:** 1.0  
**Created:** January 18, 2026  
**Last Updated:** January 18, 2026  
**Next Review:** January 25, 2026
