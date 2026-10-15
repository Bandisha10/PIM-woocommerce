<?php
/**
 * Plugin Name:       PIM Core - WooCommerce Integration
 * Plugin URI:        https://github.com/pim-core/woocommerce
 * Description:       Single source of truth Product Information Management system for WooCommerce. Custom MySQL tables, dynamic attribute schemas, and bidirectional REST sync.
 * Version:           1.0.0
 * Author:            PIM Core Team
 * License:           GPL-2.0+
 * Text Domain:       pim-core
 */

if (!defined('ABSPATH')) {
    exit;
}

define('PIM_CORE_VERSION', '1.0.0');
define('PIM_CORE_DIR', plugin_dir_path(__FILE__));
define('PIM_CORE_URL', plugin_dir_url(__FILE__));

// Require Core Classes
require_once PIM_CORE_DIR . 'includes/class-pim-db.php';
require_once PIM_CORE_DIR . 'includes/class-pim-wc-sync.php';
require_once PIM_CORE_DIR . 'includes/class-pim-ajax.php';

/**
 * Activation Hook
 */
register_activation_hook(__FILE__, array('PIM_DB', 'create_tables'));

/**
 * Register Admin Menus
 */
add_action('admin_menu', 'pim_core_register_menus');
function pim_core_register_menus() {
    // Top level menu
    add_menu_page(
        __('PIM System', 'pim-core'),
        __('PIM System', 'pim-core'),
        'manage_options',
        'pim-overview',
        'pim_core_render_overview',
        'dashicons-products',
        26
    );

    // Submenu 1: Overview
    add_submenu_page(
        'pim-overview',
        __('Overview', 'pim-core'),
        __('Overview', 'pim-core'),
        'manage_options',
        'pim-overview',
        'pim_core_render_overview'
    );

    // Submenu 2: Catalog
    add_submenu_page(
        'pim-overview',
        __('Catalog', 'pim-core'),
        __('Catalog', 'pim-core'),
        'manage_options',
        'pim-catalog',
        'pim_core_render_catalog'
    );

    // Submenu 3: Product Editor
    add_submenu_page(
        'pim-overview',
        __('Product Editor', 'pim-core'),
        __('Product Editor', 'pim-core'),
        'manage_options',
        'pim-product-editor',
        'pim_core_render_product_editor'
    );

    // Submenu 4: Attributes Manager
    add_submenu_page(
        'pim-overview',
        __('Attributes', 'pim-core'),
        __('Attributes', 'pim-core'),
        'manage_options',
        'pim-attributes',
        'pim_core_render_attributes'
    );

    // Submenu 5: Sync Center
    add_submenu_page(
        'pim-overview',
        __('Sync Center', 'pim-core'),
        __('Sync Center', 'pim-core'),
        'manage_options',
        'pim-sync',
        'pim_core_render_sync'
    );

    // Submenu 6: Settings
    add_submenu_page(
        'pim-overview',
        __('Settings', 'pim-core'),
        __('Settings', 'pim-core'),
        'manage_options',
        'pim-settings',
        'pim_core_render_settings'
    );
}

/**
 * Render callbacks
 */
function pim_core_render_overview() {
    include PIM_CORE_DIR . 'views/overview.php';
}

function pim_core_render_catalog() {
    include PIM_CORE_DIR . 'views/catalog.php';
}

function pim_core_render_product_editor() {
    include PIM_CORE_DIR . 'views/product-editor.php';
}

function pim_core_render_attributes() {
    include PIM_CORE_DIR . 'views/attributes.php';
}

function pim_core_render_sync() {
    include PIM_CORE_DIR . 'views/sync-center.php';
}

function pim_core_render_settings() {
    include PIM_CORE_DIR . 'views/settings.php';
}

/**
 * Enqueue scripts and styles exclusively on PIM admin pages
 */
add_action('admin_enqueue_scripts', 'pim_core_enqueue_admin_assets');
function pim_core_enqueue_admin_assets($hook) {
    if (strpos($hook, 'pim-') === false) {
        return;
    }

    // 1. TailwindCSS via CDN
    wp_enqueue_script('pim-tailwindcss', 'https://cdn.tailwindcss.com', array(), null, false);

    // 2. Lucide Icons via CDN
    wp_enqueue_script('pim-lucide', 'https://unpkg.com/lucide@latest', array(), null, true);

    // 3. SortableJS for drag & drop attribute set reordering
    wp_enqueue_script('pim-sortable', 'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js', array(), null, true);

    // 4. Canvas Confetti for sync celebration
    wp_enqueue_script('pim-confetti', 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js', array(), null, true);

    // 5. Plugin Admin Stylesheet
    wp_enqueue_style('pim-admin-css', PIM_CORE_URL . 'assets/css/admin.css', array(), PIM_CORE_VERSION);

    // 6. Plugin Admin JS Controller
    wp_enqueue_script('pim-admin-js', PIM_CORE_URL . 'assets/js/admin.js', array('jquery'), PIM_CORE_VERSION, true);

    // Localize AJAX URL and security nonce
    wp_localize_script('pim-admin-js', 'pim_vars', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce'    => wp_create_nonce('pim_nonce')
    ));
}
