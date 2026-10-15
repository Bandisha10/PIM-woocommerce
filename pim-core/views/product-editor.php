<?php
if (!defined('ABSPATH')) exit;

global $wpdb;
$table_prods = $wpdb->prefix . 'pim_products';
$table_sets  = $wpdb->prefix . 'pim_attribute_sets';
$table_attrs = $wpdb->prefix . 'pim_attributes';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$product = null;

if ($id > 0) {
    $product = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_prods WHERE id = %d", $id));
}

// All attribute sets
$sets = $wpdb->get_results("SELECT * FROM $table_sets ORDER BY name ASC");

// Existing attribute values
$existing_attrs = ($product && !empty($product->attributes_json)) ? json_decode($product->attributes_json, true) : array();
$active_set_id = $product ? (int)$product->attribute_set_id : 0;

// Fetch attributes for active set if set
$set_attributes = array();
if ($active_set_id > 0) {
    $raw_ids = $wpdb->get_var($wpdb->prepare("SELECT attribute_ids FROM $table_sets WHERE id = %d", $active_set_id));
    if (!empty($raw_ids)) {
        $ids = array_map('intval', explode(',', $raw_ids));
        $placeholders = implode(',', array_fill(0, count($ids), '%d'));
        $raw_attrs = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table_attrs WHERE id IN ($placeholders)", $ids));
        
        $indexed = array();
        foreach ($raw_attrs as $ra) $indexed[$ra->id] = $ra;
        foreach ($ids as $aid) {
            if (isset($indexed[$aid])) $set_attributes[] = $indexed[$aid];
        }
    }
}

$score = $product ? (int)$product->completeness_score : 0;
?>

<div class="pim-wrap my-6">
    <!-- Header -->
    <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 animate-fade-up">
        <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                <a href="<?php echo admin_url('admin.php?page=pim-catalog'); ?>" class="hover:text-indigo-600 flex items-center gap-1">
                    <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Back to Catalog
                </a>
                <span>/</span>
                <span class="text-slate-600"><?php echo $product ? 'Edit Product' : 'Create Product'; ?></span>
            </div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <i data-lucide="edit" class="w-6 h-6 text-indigo-600"></i>
                <?php echo $product ? esc_html($product->name) : 'Add New Product'; ?>
            </h1>
        </div>

        <div class="flex items-center gap-3">
            <button type="submit" form="pim-product-form" id="pim-save-product-btn" class="pim-btn inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-indigo-700">
                <i data-lucide="save" class="w-4 h-4"></i> Save Product
            </button>
        </div>
    </div>

    <!-- 2 Column Editor Layout -->
    <form id="pim-product-form">
        <input type="hidden" name="id" value="<?php echo esc_attr($id); ?>">

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Left 70% (8 cols on lg) -->
            <div class="lg:col-span-8 space-y-6 animate-fade-up">
                <!-- Basic Card -->
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h2 class="text-sm font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <i data-lucide="info" class="w-4 h-4 text-indigo-600"></i> Core Details
                    </h2>

                    <!-- Title -->
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Product Title *</label>
                        <input type="text" id="pim-prod-name" name="name" value="<?php echo $product ? esc_attr($product->name) : ''; ?>" placeholder="e.g. Minimalist Waterproof Roll-Top Backpack" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" required>
                    </div>

                    <!-- SKU & Category -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">SKU (Stock Keeping Unit) *</label>
                            <input type="text" id="pim-prod-sku" name="sku" value="<?php echo $product ? esc_attr($product->sku) : 'SKU-' . rand(1000, 9999); ?>" placeholder="e.g. BP-URB-303" class="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold" required>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Category</label>
                            <input type="text" id="pim-prod-category" name="category" value="<?php echo $product ? esc_attr($product->category) : 'General'; ?>" placeholder="e.g. Outerwear, Tech, Lifestyle" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                    </div>

                    <!-- Price & Stock -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Price (INR &#8377;) *</label>
                            <div class="relative">
                                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">&#8377;</span>
                                <input type="number" step="0.01" id="pim-prod-price" name="price" value="<?php echo $product ? esc_attr($product->price) : '999.00'; ?>" placeholder="0.00" class="w-full pl-8 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold" required>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Inventory Stock Level *</label>
                            <input type="number" id="pim-prod-stock" name="stock" value="<?php echo $product ? esc_attr($product->stock) : '25'; ?>" placeholder="0" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold" required>
                        </div>
                    </div>

                    <!-- Image URL & Live Preview -->
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Image URL</label>
                        <div class="flex gap-4 items-center">
                            <input type="url" id="pim-prod-image" name="image_url" value="<?php echo $product ? esc_attr($product->image_url) : ''; ?>" placeholder="https://images.unsplash.com/..." class="flex-1 px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            
                            <!-- Thumbnail Preview Box -->
                            <div class="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                <img id="pim-image-preview" src="<?php echo $product ? esc_url($product->image_url) : ''; ?>" alt="" class="<?php echo ($product && !empty($product->image_url)) ? '' : 'hidden'; ?> w-full h-full object-cover">
                                <div id="pim-image-placeholder" class="<?php echo ($product && !empty($product->image_url)) ? 'hidden' : ''; ?> text-slate-300">
                                    <i data-lucide="image" class="w-5 h-5"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Descriptions Card -->
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h2 class="text-sm font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <i data-lucide="file-text" class="w-4 h-4 text-indigo-600"></i> Descriptions
                    </h2>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Short Summary (WooCommerce Excerpt)</label>
                        <textarea id="pim-prod-short-desc" name="short_desc" rows="2" placeholder="Brief summary highlighted on shop cards..." class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"><?php echo $product ? esc_textarea($product->short_desc) : ''; ?></textarea>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Product Description</label>
                        <?php
                        $content = $product ? $product->long_desc : '';
                        wp_editor($content, 'pim_long_desc', array(
                            'textarea_name' => 'long_desc',
                            'textarea_rows' => 7,
                            'media_buttons' => false,
                            'teeny'         => true,
                            'quicktags'     => false
                        ));
                        ?>
                    </div>
                </div>
            </div>

            <!-- Right 30% (4 cols on lg) -->
            <div class="lg:col-span-4 space-y-6 animate-fade-up stagger-1">
                <!-- Completeness Gauge Card -->
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center justify-center gap-1.5">
                        <i data-lucide="pie-chart" class="w-4 h-4 text-indigo-600"></i> Completeness Score
                    </h3>

                    <!-- SVG Circular Gauge -->
                    <div class="relative w-28 h-28 mx-auto mb-4">
                        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <!-- Background Circle -->
                            <circle class="completeness-circle-bg" cx="50" cy="50" r="45"></circle>
                            <!-- Animated Fill Circle -->
                            <?php
                            $circumference = 2 * M_PI * 45; // ~282.74
                            $offset = $circumference - ($score / 100) * $circumference;
                            ?>
                            <circle id="pim-circle-fill" class="completeness-circle-fill" cx="50" cy="50" r="45" stroke-dasharray="<?php echo $circumference; ?>" stroke-dashoffset="<?php echo $offset; ?>" style="stroke: <?php echo $score >= 80 ? '#10b981' : ($score >= 50 ? '#f59e0b' : '#ef4444'); ?>;"></circle>
                        </svg>

                        <!-- Centered Score Text -->
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span id="pim-score-text" class="text-2xl font-extrabold" style="color: <?php echo $score >= 80 ? '#10b981' : ($score >= 50 ? '#f59e0b' : '#ef4444'); ?>;">
                                <?php echo $score; ?>%
                            </span>
                        </div>
                    </div>

                    <!-- Checklist breakdown -->
                    <div class="space-y-2 text-left text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                        <div id="chk-title" class="flex items-center gap-2 text-slate-500">
                            <i data-lucide="check" class="w-3.5 h-3.5"></i> Title defined (+20%)
                        </div>
                        <div id="chk-price" class="flex items-center gap-2 text-slate-500">
                            <i data-lucide="check" class="w-3.5 h-3.5"></i> Valid price (+20%)
                        </div>
                        <div id="chk-image" class="flex items-center gap-2 text-slate-500">
                            <i data-lucide="check" class="w-3.5 h-3.5"></i> Image URL added (+20%)
                        </div>
                        <div id="chk-attrs" class="flex items-center gap-2 text-slate-500">
                            <i data-lucide="check" class="w-3.5 h-3.5"></i> Attributes filled (+20%)
                        </div>
                        <div id="chk-desc" class="flex items-center gap-2 text-slate-500">
                            <i data-lucide="check" class="w-3.5 h-3.5"></i> Description added (+20%)
                        </div>
                    </div>
                </div>

                <!-- Attribute Sets & Dynamic Attributes Card -->
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <i data-lucide="sliders" class="w-4 h-4 text-indigo-600"></i> Attribute Schema
                        </h3>
                        <a href="<?php echo admin_url('admin.php?page=pim-attributes'); ?>" class="text-[11px] text-indigo-600 font-semibold hover:underline">
                            Manage Sets
                        </a>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Attribute Set</label>
                        <select id="pim-attr-set-select" name="attribute_set_id" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium">
                            <option value="0">-- None / Custom Attributes --</option>
                            <?php foreach ($sets as $s): ?>
                                <option value="<?php echo esc_attr($s->id); ?>" <?php selected($active_set_id, $s->id); ?>>
                                    <?php echo esc_html($s->name); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <!-- Dynamic Attribute Fields Container -->
                    <div id="pim-dynamic-attributes-fields" class="pt-2">
                        <?php if (empty($set_attributes)): ?>
                            <p class="text-xs text-slate-400 py-2">Select an Attribute Set to reveal schema attributes (e.g. Size, Color, RAM).</p>
                        <?php else: ?>
                            <?php foreach ($set_attributes as $attr): ?>
                                <?php 
                                $val = isset($existing_attrs[$attr->code]) ? $existing_attrs[$attr->code] : ''; 
                                $options = json_decode($attr->options_json, true) ?: array();
                                ?>
                                <div class="mb-3 animate-fade-up">
                                    <label class="block text-xs font-semibold text-slate-700 mb-1">
                                        <?php echo esc_html($attr->label); ?> <span class="text-slate-400">(<?php echo esc_html($attr->code); ?>)</span>
                                    </label>
                                    <?php if ($attr->type === 'dropdown'): ?>
                                        <select name="attributes[<?php echo esc_attr($attr->code); ?>]" class="pim-attr-input w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            <option value="">Select <?php echo esc_html($attr->label); ?>...</option>
                                            <?php foreach ($options as $opt): ?>
                                                <option value="<?php echo esc_attr($opt); ?>" <?php selected($val, $opt); ?>><?php echo esc_html($opt); ?></option>
                                            <?php endforeach; ?>
                                        </select>
                                    <?php elseif ($attr->type === 'number'): ?>
                                        <input type="number" name="attributes[<?php echo esc_attr($attr->code); ?>]" value="<?php echo esc_attr($val); ?>" class="pim-attr-input w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 100">
                                    <?php else: ?>
                                        <input type="text" name="attributes[<?php echo esc_attr($attr->code); ?>]" value="<?php echo esc_attr($val); ?>" class="pim-attr-input w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Value">
                                    <?php endif; ?>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>
