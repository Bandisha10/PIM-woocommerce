<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * PIM Database Management
 * Handles custom table creation, seeding, and database operations.
 */
class PIM_DB {

    /**
     * Create custom tables on plugin activation via dbDelta
     */
    public static function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

        // 1. Products table
        $table_products = $wpdb->prefix . 'pim_products';
        $sql_products = "CREATE TABLE $table_products (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            sku varchar(100) NOT NULL,
            name varchar(255) NOT NULL,
            short_desc text,
            long_desc longtext,
            price decimal(10,2) DEFAULT 0.00,
            stock int(11) DEFAULT 0,
            category varchar(100) DEFAULT 'General',
            attribute_set_id bigint(20) DEFAULT 0,
            attributes_json longtext,
            image_url text,
            completeness_score int(11) DEFAULT 0,
            sync_status enum('pending','synced','failed','conflict') DEFAULT 'pending',
            woo_id bigint(20) DEFAULT NULL,
            woo_snapshot longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY sku (sku)
        ) $charset_collate;";
        dbDelta($sql_products);

        // 2. Attributes table
        $table_attributes = $wpdb->prefix . 'pim_attributes';
        $sql_attributes = "CREATE TABLE $table_attributes (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            code varchar(50) NOT NULL,
            label varchar(100) NOT NULL,
            type enum('text','dropdown','number') DEFAULT 'text',
            options_json text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY code (code)
        ) $charset_collate;";
        dbDelta($sql_attributes);

        // 3. Attribute Sets table
        $table_sets = $wpdb->prefix . 'pim_attribute_sets';
        $sql_sets = "CREATE TABLE $table_sets (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            attribute_ids text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY name (name)
        ) $charset_collate;";
        dbDelta($sql_sets);

        // 4. Sync Log table
        $table_log = $wpdb->prefix . 'pim_sync_log';
        $sql_log = "CREATE TABLE $table_log (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            product_id bigint(20) DEFAULT NULL,
            sku varchar(100) DEFAULT '',
            direction enum('PUSH','PULL') DEFAULT 'PUSH',
            status varchar(50) DEFAULT 'success',
            message text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        dbDelta($sql_log);

        // Seed default attributes and sets
        self::seed_defaults();
    }

    /**
     * Seed default attributes, attribute sets, and sample products
     */
    public static function seed_defaults() {
        global $wpdb;
        $table_attrs = $wpdb->prefix . 'pim_attributes';
        $table_sets  = $wpdb->prefix . 'pim_attribute_sets';
        $table_prods = $wpdb->prefix . 'pim_products';
        $table_logs  = $wpdb->prefix . 'pim_sync_log';

        // 1. Seed Attributes if empty
        $attr_count = (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_attrs");
        if ($attr_count === 0) {
            $default_attributes = array(
                array(
                    'code' => 'color',
                    'label' => 'Color',
                    'type' => 'dropdown',
                    'options_json' => json_encode(array('Black', 'White', 'Midnight Navy', 'Olive Green', 'Charcoal'))
                ),
                array(
                    'code' => 'size',
                    'label' => 'Size',
                    'type' => 'dropdown',
                    'options_json' => json_encode(array('XS', 'S', 'M', 'L', 'XL', 'XXL'))
                ),
                array(
                    'code' => 'material',
                    'label' => 'Material',
                    'type' => 'text',
                    'options_json' => json_encode(array())
                ),
                array(
                    'code' => 'ram',
                    'label' => 'RAM Capacity',
                    'type' => 'dropdown',
                    'options_json' => json_encode(array('8GB', '16GB', '32GB', '64GB'))
                ),
                array(
                    'code' => 'warranty',
                    'label' => 'Warranty',
                    'type' => 'dropdown',
                    'options_json' => json_encode(array('1 Year', '2 Years', '3 Years Limited'))
                )
            );

            foreach ($default_attributes as $attr) {
                $wpdb->insert($table_attrs, $attr);
            }
        }

        // Fetch attribute IDs
        $color_id    = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table_attrs WHERE code = %s", 'color'));
        $size_id     = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table_attrs WHERE code = %s", 'size'));
        $material_id = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table_attrs WHERE code = %s", 'material'));
        $ram_id      = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table_attrs WHERE code = %s", 'ram'));
        $warranty_id = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table_attrs WHERE code = %s", 'warranty'));

        // 2. Seed Attribute Sets if empty
        $set_count = (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_sets");
        if ($set_count === 0) {
            $clothing_ids = array_filter(array($color_id, $size_id, $material_id));
            $electronics_ids = array_filter(array($ram_id, $color_id, $warranty_id));

            $wpdb->insert($table_sets, array(
                'name' => 'Clothing',
                'attribute_ids' => implode(',', $clothing_ids)
            ));

            $wpdb->insert($table_sets, array(
                'name' => 'Electronics',
                'attribute_ids' => implode(',', $electronics_ids)
            ));
        }

        $clothing_set_id    = (int)$wpdb->get_var($wpdb->prepare("SELECT id FROM $table_sets WHERE name = %s", 'Clothing'));
        $electronics_set_id = (int)$wpdb->get_var($wpdb->prepare("SELECT id FROM $table_sets WHERE name = %s", 'Electronics'));

        // 3. Seed Products if empty
        $prod_count = (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_prods");
        if ($prod_count === 0) {
            $sample_products = array(
                array(
                    'sku' => 'JK-ALP-101',
                    'name' => 'All-Weather Alpine Windproof Shell Jacket',
                    'short_desc' => 'Lightweight 3-layer breathable alpine stormproof jacket.',
                    'long_desc' => 'Constructed with ultra-durable ripstop nylon and fully taped seams to deliver premium performance in harsh outdoor weather.',
                    'price' => 4999.00,
                    'stock' => 45,
                    'category' => 'Outerwear',
                    'attribute_set_id' => $clothing_set_id,
                    'attributes_json' => json_encode(array('color' => 'Midnight Navy', 'size' => 'L', 'material' => 'Ripstop Nylon')),
                    'image_url' => 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
                    'completeness_score' => 100,
                    'sync_status' => 'synced',
                    'woo_id' => 1001,
                    'woo_snapshot' => json_encode(array('price' => 4999.00, 'stock' => 45, 'name' => 'All-Weather Alpine Windproof Shell Jacket'))
                ),
                array(
                    'sku' => 'HD-PRO-202',
                    'name' => 'Acoustic Studio Wireless Noise-Cancelling Headphones',
                    'short_desc' => 'Studio-grade 40mm beryllium drivers with hybrid ANC.',
                    'long_desc' => 'Experience crystal-clear high fidelity sound with 36 hours of battery playback, low-latency Bluetooth 5.3, and ergonomic memory foam earcups.',
                    'price' => 8499.00,
                    'stock' => 18,
                    'category' => 'Audio & Tech',
                    'attribute_set_id' => $electronics_set_id,
                    'attributes_json' => json_encode(array('color' => 'Black', 'ram' => '16GB', 'warranty' => '2 Years')),
                    'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
                    'completeness_score' => 100,
                    'sync_status' => 'conflict',
                    'woo_id' => 1002,
                    'woo_snapshot' => json_encode(array('price' => 9299.00, 'stock' => 12, 'name' => 'Acoustic Studio Wireless Noise-Cancelling Headphones [Store Promo]'))
                ),
                array(
                    'sku' => 'BP-URB-303',
                    'name' => 'Urban Commuter Roll-Top Waterproof Backpack',
                    'short_desc' => 'Rugged 26L waxed canvas weather-resistant daypack.',
                    'long_desc' => 'Designed for daily cycling commuters and minimalist travelers with a dedicated 16-inch padded laptop compartment and waterproof zippers.',
                    'price' => 3299.00,
                    'stock' => 28,
                    'category' => 'Bags & Packs',
                    'attribute_set_id' => $clothing_set_id,
                    'attributes_json' => json_encode(array('color' => 'Olive Green', 'size' => 'M', 'material' => 'Waxed Canvas')),
                    'image_url' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
                    'completeness_score' => 90,
                    'sync_status' => 'pending',
                    'woo_id' => 1003,
                    'woo_snapshot' => null
                ),
                array(
                    'sku' => 'TEE-MRN-404',
                    'name' => 'Organic Merino Wool Essential Daily Crew Tee',
                    'short_desc' => 'Ultra-soft odor-resistant 100% merino wool tee.',
                    'long_desc' => 'Natural temperature regulating fibers keep you cool in summer and warm in winter. Machine washable and shrink resistant.',
                    'price' => 1899.00,
                    'stock' => 60,
                    'category' => 'Clothing',
                    'attribute_set_id' => $clothing_set_id,
                    'attributes_json' => json_encode(array('color' => 'Charcoal', 'size' => 'M', 'material' => '100% Merino Wool')),
                    'image_url' => 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
                    'completeness_score' => 100,
                    'sync_status' => 'synced',
                    'woo_id' => 1004,
                    'woo_snapshot' => json_encode(array('price' => 1899.00, 'stock' => 60, 'name' => 'Organic Merino Wool Essential Daily Crew Tee'))
                ),
                array(
                    'sku' => 'DRP-KTC-505',
                    'name' => 'Ceramic Artisan Pour-Over Coffee Dripper',
                    'short_desc' => 'Handcrafted ceramic extraction dripper with spiral interior ribs.',
                    'long_desc' => 'Engineered for optimal water flow and coffee extraction balance. Glazed finish is heat-retaining and dishwasher safe.',
                    'price' => 1499.00,
                    'stock' => 32,
                    'category' => 'Kitchen',
                    'attribute_set_id' => 0,
                    'attributes_json' => json_encode(array('color' => 'White', 'material' => 'Stoneware')),
                    'image_url' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
                    'completeness_score' => 80,
                    'sync_status' => 'pending',
                    'woo_id' => null,
                    'woo_snapshot' => null
                )
            );

            foreach ($sample_products as $p) {
                $wpdb->insert($table_prods, $p);
            }
        }

        // 4. Seed Sync Logs if empty
        $log_count = (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_log");
        if ($log_count === 0) {
            $initial_logs = array(
                array(
                    'product_id' => 1,
                    'sku' => 'JK-ALP-101',
                    'direction' => 'PUSH',
                    'status' => 'success',
                    'message' => 'Successfully pushed product to WooCommerce (Woo ID #1001)'
                ),
                array(
                    'product_id' => 2,
                    'sku' => 'HD-PRO-202',
                    'direction' => 'PULL',
                    'status' => 'conflict',
                    'message' => 'Conflict detected: Store price changed to ₹9,299 while PIM price is ₹8,499'
                ),
                array(
                    'product_id' => 4,
                    'sku' => 'TEE-MRN-404',
                    'direction' => 'PUSH',
                    'status' => 'success',
                    'message' => 'Created in WooCommerce catalog (Woo ID #1004)'
                ),
                array(
                    'product_id' => 3,
                    'sku' => 'BP-URB-303',
                    'direction' => 'PUSH',
                    'status' => 'pending',
                    'message' => 'Queued for next scheduled sync dispatch'
                )
            );

            foreach ($initial_logs as $l) {
                $wpdb->insert($table_log, $l);
            }
        }
    }

    /**
     * Calculate completeness score for a product record
     */
    public static function calculate_completeness($name, $price, $image_url, $attributes_json, $short_desc, $long_desc) {
        $score = 0;
        // 1. Title (+20%)
        if (!empty(trim($name))) {
            $score += 20;
        }
        // 2. Price (+20%)
        if (!empty($price) && floatval($price) > 0) {
            $score += 20;
        }
        // 3. Image URL (+20%)
        if (!empty(trim($image_url))) {
            $score += 20;
        }
        // 4. Attributes (+20%)
        $attrs = json_decode($attributes_json, true);
        if (!empty($attrs) && is_array($attrs) && count($attrs) > 0) {
            $score += 20;
        }
        // 5. Description (+20%)
        if (!empty(trim($short_desc)) || !empty(trim($long_desc))) {
            $score += 20;
        }
        return min(100, max(0, $score));
    }
}
