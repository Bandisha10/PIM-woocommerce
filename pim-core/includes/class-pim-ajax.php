<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * PIM AJAX Endpoints Handler
 * Securely handles all asynchronous dashboard requests with nonce verification.
 */
class PIM_AJAX {

    public static function init() {
        $actions = array(
            'pim_push_one',
            'pim_push_all',
            'pim_pull_stock',
            'pim_resolve_conflict',
            'pim_save_product',
            'pim_delete_product',
            'pim_bulk_action',
            'pim_test_connection',
            'pim_save_settings',
            'pim_create_attribute',
            'pim_delete_attribute',
            'pim_create_set',
            'pim_delete_set',
            'pim_reorder_set_attributes',
            'pim_import_csv',
            'pim_export_csv',
            'pim_get_set_attributes'
        );

        foreach ($actions as $action) {
            add_action('wp_ajax_' . $action, array(__CLASS__, $action));
        }
    }

    private static function check_auth() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized user access.'));
        }
        check_ajax_referer('pim_nonce', 'nonce');
    }

    /**
     * Push one product
     */
    public static function pim_push_one() {
        self::check_auth();
        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
        if (!$product_id) {
            wp_send_json_error(array('message' => 'Invalid product ID.'));
        }

        $res = PIM_WC_Sync::push_one($product_id);
        if ($res['success']) {
            wp_send_json_success(array('message' => 'Product pushed to WooCommerce successfully!', 'woo_id' => $res['woo_id']));
        } else {
            wp_send_json_error(array('message' => $res['message']));
        }
    }

    /**
     * Push all pending products
     */
    public static function pim_push_all() {
        self::check_auth();
        $res = PIM_WC_Sync::push_all_pending();
        wp_send_json_success(array(
            'message' => "Dispatched {$res['synced']} products to WooCommerce channel. ({$res['failed']} failed)",
            'synced'  => $res['synced'],
            'failed'  => $res['failed']
        ));
    }

    /**
     * Pull inventory and detect conflicts
     */
    public static function pim_pull_stock() {
        self::check_auth();
        $res = PIM_WC_Sync::pull_stock();
        if ($res['success']) {
            wp_send_json_success(array(
                'message'   => "Store pulled: {$res['updated']} updated, {$res['conflicts']} conflicts detected.",
                'updated'   => $res['updated'],
                'conflicts' => $res['conflicts']
            ));
        } else {
            wp_send_json_error(array('message' => $res['message']));
        }
    }

    /**
     * Resolve conflict
     */
    public static function pim_resolve_conflict() {
        self::check_auth();
        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
        $winner     = isset($_POST['winner']) ? sanitize_text_field($_POST['winner']) : 'pim';

        $res = PIM_WC_Sync::resolve_conflict($product_id, $winner);
        if ($res['success']) {
            wp_send_json_success(array('message' => 'Conflict resolved successfully!'));
        } else {
            wp_send_json_error(array('message' => $res['message']));
        }
    }

    /**
     * Save product (create or update)
     */
    public static function pim_save_product() {
        self::check_auth();
        global $wpdb;
        $table_prods = $wpdb->prefix . 'pim_products';

        $id        = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $sku       = sanitize_text_field($_POST['sku'] ?? '');
        $name      = sanitize_text_field($_POST['name'] ?? '');
        $short_desc= sanitize_textarea_field($_POST['short_desc'] ?? '');
        $long_desc = wp_kses_post($_POST['long_desc'] ?? '');
        $price     = floatval($_POST['price'] ?? 0);
        $stock     = intval($_POST['stock'] ?? 0);
        $category  = sanitize_text_field($_POST['category'] ?? 'General');
        $set_id    = intval($_POST['attribute_set_id'] ?? 0);
        $image_url = esc_url_raw($_POST['image_url'] ?? '');

        // Parse attributes array
        $attrs = array();
        if (!empty($_POST['attributes']) && is_array($_POST['attributes'])) {
            foreach ($_POST['attributes'] as $k => $v) {
                $attrs[sanitize_text_field($k)] = sanitize_text_field($v);
            }
        }
        $attributes_json = json_encode($attrs);

        if (empty($sku) || empty($name)) {
            wp_send_json_error(array('message' => 'SKU and Product Name are required fields.'));
        }

        // Check SKU uniqueness
        if ($id > 0) {
            $exist = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table_prods WHERE sku = %s AND id != %d", $sku, $id));
        } else {
            $exist = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table_prods WHERE sku = %s", $sku));
        }
        if ($exist) {
            wp_send_json_error(array('message' => "SKU '$sku' is already assigned to another product."));
        }

        $completeness = PIM_DB::calculate_completeness($name, $price, $image_url, $attributes_json, $short_desc, $long_desc);

        $data = array(
            'sku'                => $sku,
            'name'               => $name,
            'short_desc'         => $short_desc,
            'long_desc'          => $long_desc,
            'price'              => $price,
            'stock'              => $stock,
            'category'           => $category,
            'attribute_set_id'   => $set_id,
            'attributes_json'    => $attributes_json,
            'image_url'          => $image_url,
            'completeness_score' => $completeness,
            'sync_status'        => 'pending'
        );

        if ($id > 0) {
            $wpdb->update($table_prods, $data, array('id' => $id));
            $product_id = $id;
            PIM_WC_Sync::log($product_id, $sku, 'PUSH', 'pending', "Updated product '$name' ($sku). Queued for sync.");
        } else {
            $wpdb->insert($table_prods, $data);
            $product_id = $wpdb->insert_id;
            PIM_WC_Sync::log($product_id, $sku, 'PUSH', 'pending', "Created product '$name' ($sku). Ready to sync.");
        }

        wp_send_json_success(array(
            'message'            => "Product '$name' saved successfully!",
            'product_id'         => $product_id,
            'completeness_score' => $completeness
        ));
    }

    /**
     * Delete product
     */
    public static function pim_delete_product() {
        self::check_auth();
        global $wpdb;
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $table_prods = $wpdb->prefix . 'pim_products';

        $p = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_prods WHERE id = %d", $id));
        if ($p) {
            $wpdb->delete($table_prods, array('id' => $id));
            PIM_WC_Sync::log($id, $p->sku, 'PUSH', 'success', "Deleted product '{$p->name}' ({$p->sku}) from PIM.");
            wp_send_json_success(array('message' => 'Product deleted successfully.'));
        }
        wp_send_json_error(array('message' => 'Product not found.'));
    }

    /**
     * Bulk actions (sync or delete)
     */
    public static function pim_bulk_action() {
        self::check_auth();
        global $wpdb;
        $table_prods = $wpdb->prefix . 'pim_products';

        $action = sanitize_text_field($_POST['bulk_action'] ?? '');
        $ids    = isset($_POST['ids']) && is_array($_POST['ids']) ? array_map('intval', $_POST['ids']) : array();

        if (empty($ids)) {
            wp_send_json_error(array('message' => 'No products selected.'));
        }

        if ($action === 'sync') {
            $count = 0;
            foreach ($ids as $id) {
                $res = PIM_WC_Sync::push_one($id);
                if (!empty($res['success'])) $count++;
            }
            wp_send_json_success(array('message' => "Synced $count selected product(s) to WooCommerce."));
        } elseif ($action === 'delete') {
            foreach ($ids as $id) {
                $wpdb->delete($table_prods, array('id' => $id));
            }
            wp_send_json_success(array('message' => "Deleted " . count($ids) . " selected product(s)."));
        }

        wp_send_json_error(array('message' => 'Invalid bulk action.'));
    }

    /**
     * Test connection to WooCommerce REST API
     */
    public static function pim_test_connection() {
        self::check_auth();
        $url = esc_url_raw($_POST['url'] ?? '');
        $ck  = sanitize_text_field($_POST['ck'] ?? '');
        $cs  = sanitize_text_field($_POST['cs'] ?? '');

        $res = PIM_WC_Sync::test_connection($url, $ck, $cs);
        if ($res['success']) {
            wp_send_json_success(array('message' => $res['message']));
        } else {
            wp_send_json_error(array('message' => $res['message']));
        }
    }

    /**
     * Save settings
     */
    public static function pim_save_settings() {
        self::check_auth();
        $url  = esc_url_raw($_POST['wc_url'] ?? '');
        $ck   = sanitize_text_field($_POST['wc_ck'] ?? '');
        $cs   = sanitize_text_field($_POST['wc_cs'] ?? '');
        $rule = sanitize_text_field($_POST['conflict_rule'] ?? 'manual');

        update_option('pim_wc_url', $url);
        update_option('pim_wc_ck', $ck);
        update_option('pim_wc_cs', $cs);
        update_option('pim_conflict_rule', $rule);

        wp_send_json_success(array('message' => 'Settings saved successfully!'));
    }

    /**
     * Create attribute
     */
    public static function pim_create_attribute() {
        self::check_auth();
        global $wpdb;
        $table_attrs = $wpdb->prefix . 'pim_attributes';

        $code    = sanitize_title($_POST['code'] ?? '');
        $label   = sanitize_text_field($_POST['label'] ?? '');
        $type    = sanitize_text_field($_POST['type'] ?? 'text');
        $raw_opt = sanitize_text_field($_POST['options'] ?? '');

        if (empty($code) || empty($label)) {
            wp_send_json_error(array('message' => 'Attribute Code and Label are required.'));
        }

        $exist = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table_attrs WHERE code = %s", $code));
        if ($exist) {
            wp_send_json_error(array('message' => "Attribute code '$code' already exists."));
        }

        $options = array();
        if ($type === 'dropdown' && !empty($raw_opt)) {
            $options = array_map('trim', explode(',', $raw_opt));
            $options = array_filter($options);
        }

        $wpdb->insert($table_attrs, array(
            'code'         => $code,
            'label'        => $label,
            'type'         => $type,
            'options_json' => json_encode(array_values($options))
        ));

        wp_send_json_success(array('message' => "Attribute '$label' created successfully!"));
    }

    /**
     * Delete attribute
     */
    public static function pim_delete_attribute() {
        self::check_auth();
        global $wpdb;
        $id = intval($_POST['id'] ?? 0);
        $wpdb->delete($wpdb->prefix . 'pim_attributes', array('id' => $id));
        wp_send_json_success(array('message' => 'Attribute deleted successfully.'));
    }

    /**
     * Create Attribute Set
     */
    public static function pim_create_set() {
        self::check_auth();
        global $wpdb;
        $table_sets = $wpdb->prefix . 'pim_attribute_sets';

        $name = sanitize_text_field($_POST['name'] ?? '');
        $attr_ids = isset($_POST['attribute_ids']) && is_array($_POST['attribute_ids'])
            ? array_map('intval', $_POST['attribute_ids'])
            : array();

        if (empty($name)) {
            wp_send_json_error(array('message' => 'Set name is required.'));
        }

        $exist = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table_sets WHERE name = %s", $name));
        if ($exist) {
            wp_send_json_error(array('message' => "Attribute Set '$name' already exists."));
        }

        $wpdb->insert($table_sets, array(
            'name'          => $name,
            'attribute_ids' => implode(',', $attr_ids)
        ));

        wp_send_json_success(array('message' => "Attribute Set '$name' created successfully!"));
    }

    /**
     * Delete Attribute Set
     */
    public static function pim_delete_set() {
        self::check_auth();
        global $wpdb;
        $id = intval($_POST['id'] ?? 0);
        $wpdb->delete($wpdb->prefix . 'pim_attribute_sets', array('id' => $id));
        wp_send_json_success(array('message' => 'Attribute Set deleted successfully.'));
    }

    /**
     * Reorder attributes inside a set
     */
    public static function pim_reorder_set_attributes() {
        self::check_auth();
        global $wpdb;
        $set_id   = intval($_POST['set_id'] ?? 0);
        $attr_ids = isset($_POST['order']) && is_array($_POST['order']) ? array_map('intval', $_POST['order']) : array();

        if ($set_id && !empty($attr_ids)) {
            $wpdb->update(
                $wpdb->prefix . 'pim_attribute_sets',
                array('attribute_ids' => implode(',', $attr_ids)),
                array('id' => $set_id)
            );
            wp_send_json_success(array('message' => 'Attribute order updated successfully!'));
        }
        wp_send_json_error(array('message' => 'Failed to reorder attributes.'));
    }

    /**
     * Fetch attributes for an attribute set (used dynamically in Product Editor)
     */
    public static function pim_get_set_attributes() {
        self::check_auth();
        global $wpdb;
        $set_id = intval($_POST['set_id'] ?? 0);
        if (!$set_id) {
            wp_send_json_success(array('attributes' => array()));
        }

        $table_sets  = $wpdb->prefix . 'pim_attribute_sets';
        $table_attrs = $wpdb->prefix . 'pim_attributes';

        $raw_ids = $wpdb->get_var($wpdb->prepare("SELECT attribute_ids FROM $table_sets WHERE id = %d", $set_id));
        if (empty($raw_ids)) {
            wp_send_json_success(array('attributes' => array()));
        }

        $ids = array_map('intval', explode(',', $raw_ids));
        $placeholders = implode(',', array_fill(0, count($ids), '%d'));

        $query = $wpdb->prepare("SELECT * FROM $table_attrs WHERE id IN ($placeholders)", $ids);
        $results = $wpdb->get_results($query);

        // Sort by the set order
        $ordered = array();
        $indexed = array();
        foreach ($results as $r) {
            $indexed[$r->id] = $r;
        }
        foreach ($ids as $id) {
            if (isset($indexed[$id])) {
                $ordered[] = array(
                    'id'           => $indexed[$id]->id,
                    'code'         => $indexed[$id]->code,
                    'label'        => $indexed[$id]->label,
                    'type'         => $indexed[$id]->type,
                    'options'      => json_decode($indexed[$id]->options_json, true) ?: array()
                );
            }
        }

        wp_send_json_success(array('attributes' => $ordered));
    }

    /**
     * Import CSV
     */
    public static function pim_import_csv() {
        self::check_auth();
        global $wpdb;
        $table_prods = $wpdb->prefix . 'pim_products';

        if (empty($_FILES['csv_file']['tmp_name'])) {
            wp_send_json_error(array('message' => 'No CSV file uploaded.'));
        }

        $file = $_FILES['csv_file']['tmp_name'];
        $handle = fopen($file, 'r');
        if (!$handle) {
            wp_send_json_error(array('message' => 'Unable to read CSV file.'));
        }

        $row_idx = 0;
        $imported = 0;
        $skipped = 0;

        while (($data = fgetcsv($handle, 1000, ',')) !== false) {
            $row_idx++;
            // Skip header if contains 'sku' or 'name'
            if ($row_idx === 1 && (stripos($data[0], 'sku') !== false || stripos($data[1], 'name') !== false)) {
                continue;
            }

            // Expected columns: SKU, Name, Price, Stock, Category, Attributes (optional)
            $sku      = sanitize_text_field($data[0] ?? '');
            $name     = sanitize_text_field($data[1] ?? '');
            $price    = floatval($data[2] ?? 0);
            $stock    = intval($data[3] ?? 0);
            $category = sanitize_text_field($data[4] ?? 'General');
            $raw_attr = sanitize_text_field($data[5] ?? '');

            if (empty($sku) || empty($name)) {
                continue;
            }

            // Check existing
            $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table_prods WHERE sku = %s", $sku));
            if ($exists) {
                $skipped++;
                continue;
            }

            $attrs = array();
            if (!empty($raw_attr)) {
                // color=Black;size=M
                $pairs = explode(';', $raw_attr);
                foreach ($pairs as $p) {
                    if (strpos($p, '=') !== false) {
                        list($k, $v) = explode('=', $p, 2);
                        $attrs[trim($k)] = trim($v);
                    }
                }
            }

            $attrs_json = json_encode($attrs);
            $score = PIM_DB::calculate_completeness($name, $price, '', $attrs_json, '', '');

            $wpdb->insert($table_prods, array(
                'sku'                => $sku,
                'name'               => $name,
                'price'              => $price,
                'stock'              => $stock,
                'category'           => $category,
                'attributes_json'    => $attrs_json,
                'completeness_score' => $score,
                'sync_status'        => 'pending'
            ));
            $imported++;
        }
        fclose($handle);

        PIM_WC_Sync::log(null, '', 'PUSH', 'success', "Imported $imported products from CSV ($skipped duplicate SKUs skipped).");
        wp_send_json_success(array('message' => "Successfully imported $imported products ($skipped duplicates skipped)."));
    }

    /**
     * Export CSV
     */
    public static function pim_export_csv() {
        self::check_auth();
        global $wpdb;
        $table_prods = $wpdb->prefix . 'pim_products';
        $products = $wpdb->get_results("SELECT * FROM $table_prods ORDER BY id DESC");

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=pim_products_export_' . date('Y-m-d') . '.csv');

        $out = fopen('php://output', 'w');
        fputcsv($out, array('SKU', 'Name', 'Price', 'Stock', 'Category', 'Sync_Status', 'Completeness', 'Woo_ID', 'Attributes'));

        foreach ($products as $p) {
            $attrs = json_decode($p->attributes_json, true) ?: array();
            $attr_str = array();
            foreach ($attrs as $k => $v) {
                $attr_str[] = "$k=$v";
            }
            fputcsv($out, array(
                $p->sku,
                $p->name,
                $p->price,
                $p->stock,
                $p->category,
                $p->sync_status,
                $p->completeness_score . '%',
                $p->woo_id ?: '',
                implode('; ', $attr_str)
            ));
        }
        fclose($out);
        exit;
    }
}

PIM_AJAX::init();
