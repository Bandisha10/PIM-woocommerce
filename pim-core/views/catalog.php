<?php
if (!defined('ABSPATH')) exit;

global $wpdb;
$table_prods = $wpdb->prefix . 'pim_products';
$products = $wpdb->get_results("SELECT * FROM $table_prods ORDER BY id DESC");
?>

<div class="pim-wrap my-6">
    <!-- Header & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4 animate-fade-up">
        <div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <i data-lucide="package" class="w-7 h-7 text-indigo-600"></i>
                Product Catalog <span class="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full"><?php echo count($products); ?> items</span>
            </h1>
            <p class="text-sm text-slate-500 mt-1">Centralized product master records. Ready to sync directly to WooCommerce.</p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
            <button onclick="document.getElementById('pim-import-modal').classList.remove('hidden')" class="pim-btn inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50">
                <i data-lucide="upload" class="w-3.5 h-3.5 text-slate-500"></i> Import CSV
            </button>

            <a href="<?php echo admin_url('admin-ajax.php?action=pim_export_csv&nonce=' . wp_create_nonce('pim_nonce')); ?>" class="pim-btn inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50">
                <i data-lucide="download" class="w-3.5 h-3.5 text-slate-500"></i> Export CSV
            </a>

            <button id="pim-bulk-sync-top-btn" onclick="$('#pim-push-all-btn').length ? $('#pim-push-all-btn').click() : (window.location='<?php echo admin_url('admin.php?page=pim-sync'); ?>')" class="pim-btn inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg border border-indigo-200 hover:bg-indigo-100">
                <i data-lucide="zap" class="w-3.5 h-3.5"></i> Bulk Sync
            </button>

            <a href="<?php echo admin_url('admin.php?page=pim-product-editor'); ?>" class="pim-btn inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-indigo-700">
                <i data-lucide="plus" class="w-4 h-4"></i> Add Product
            </a>
        </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
        <div class="relative flex-1 max-w-md">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"></i>
            <input type="text" id="pim-catalog-search" placeholder="Instant search by product title or SKU..." class="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all">
        </div>

        <div class="text-xs text-slate-400 flex items-center gap-2">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span> Synced
            <span class="inline-block w-2 h-2 rounded-full bg-blue-500 ml-2"></span> Pending
            <span class="inline-block w-2 h-2 rounded-full bg-amber-500 ml-2"></span> Conflict
        </div>
    </div>

    <!-- Floating Bulk Actions Bar (Reveals when items selected) -->
    <div id="pim-bulk-bar" class="hidden bg-slate-900 text-white px-5 py-3 rounded-xl mb-4 shadow-lg items-center justify-between animate-slide-down">
        <div class="text-xs font-medium">
            <span id="pim-bulk-count" class="font-bold text-indigo-400 text-sm">0</span> products selected
        </div>
        <div class="flex items-center gap-2">
            <button id="pim-bulk-sync-btn" class="pim-btn px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-md text-xs font-semibold flex items-center gap-1.5">
                <i data-lucide="zap" class="w-3.5 h-3.5"></i> Sync Selected
            </button>
            <button id="pim-bulk-delete-btn" class="pim-btn px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-md text-xs font-semibold flex items-center gap-1.5">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete Selected
            </button>
        </div>
    </div>

    <!-- Products Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-up">
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th class="py-3.5 pl-4 pr-2 w-10">
                        <input type="checkbox" id="pim-select-all" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                    </th>
                    <th class="py-3.5 px-3">Product</th>
                    <th class="py-3.5 px-3">SKU</th>
                    <th class="py-3.5 px-3">Price (INR)</th>
                    <th class="py-3.5 px-3">Inventory</th>
                    <th class="py-3.5 px-3">Category</th>
                    <th class="py-3.5 px-3">Completeness</th>
                    <th class="py-3.5 px-3">Woo Status</th>
                    <th class="py-3.5 pr-4 pl-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
                <?php if (empty($products)): ?>
                    <tr>
                        <td colspan="9" class="py-12 text-center text-slate-400">
                            <i data-lucide="package-open" class="w-12 h-12 mx-auto mb-2 text-slate-300"></i>
                            <p class="font-semibold text-slate-600">No products in PIM catalog yet.</p>
                            <p class="text-xs text-slate-400 mt-1">Import a CSV file or click "+ Add Product" to get started.</p>
                        </td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($products as $p): ?>
                        <tr class="pim-table-row pim-catalog-row" data-sku="<?php echo esc_attr(strtolower($p->sku)); ?>" data-name="<?php echo esc_attr(strtolower($p->name)); ?>">
                            <!-- Checkbox -->
                            <td class="py-3 pl-4 pr-2">
                                <input type="checkbox" value="<?php echo esc_attr($p->id); ?>" class="pim-row-cb rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                            </td>

                            <!-- Product Thumb & Name -->
                            <td class="py-3 px-3">
                                <div class="flex items-center gap-3">
                                    <?php if (!empty($p->image_url)): ?>
                                        <img src="<?php echo esc_url($p->image_url); ?>" alt="" class="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0">
                                    <?php else: ?>
                                        <div class="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center flex-shrink-0">
                                            <i data-lucide="box" class="w-5 h-5"></i>
                                        </div>
                                    <?php endif; ?>
                                    <div>
                                        <a href="<?php echo admin_url('admin.php?page=pim-product-editor&id=' . $p->id); ?>" class="font-bold text-slate-800 hover:text-indigo-600 transition-colors">
                                            <?php echo esc_html($p->name); ?>
                                        </a>
                                        <div class="text-xs text-slate-400 line-clamp-1 max-w-xs">
                                            <?php echo esc_html($p->short_desc ?: 'No summary provided'); ?>
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <!-- SKU -->
                            <td class="py-3 px-3">
                                <span class="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700 border border-slate-200">
                                    <?php echo esc_html($p->sku); ?>
                                </span>
                            </td>

                            <!-- Price (INR) -->
                            <td class="py-3 px-3 font-bold text-slate-900">
                                &#8377;<?php echo number_format($p->price, 2); ?>
                            </td>

                            <!-- Stock -->
                            <td class="py-3 px-3">
                                <span class="inline-flex items-center gap-1.5 text-xs font-semibold <?php echo $p->stock < 10 ? 'text-amber-600' : 'text-slate-700'; ?>">
                                    <span class="w-1.5 h-1.5 rounded-full <?php echo $p->stock < 10 ? 'bg-amber-500' : 'bg-emerald-500'; ?>"></span>
                                    <?php echo esc_html($p->stock); ?> units
                                </span>
                            </td>

                            <!-- Category -->
                            <td class="py-3 px-3">
                                <span class="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                    <?php echo esc_html($p->category ?: 'General'); ?>
                                </span>
                            </td>

                            <!-- Completeness Bar -->
                            <td class="py-3 px-3">
                                <div class="w-28">
                                    <div class="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                                        <span>Health</span>
                                        <span><?php echo esc_html($p->completeness_score); ?>%</span>
                                    </div>
                                    <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <div class="h-1.5 rounded-full pim-progress-fill <?php 
                                            if ($p->completeness_score >= 80) echo 'bg-emerald-500';
                                            elseif ($p->completeness_score >= 50) echo 'bg-amber-500';
                                            else echo 'bg-red-500';
                                        ?>" data-progress-width="<?php echo esc_attr($p->completeness_score); ?>" style="width: 0%;"></div>
                                    </div>
                                </div>
                            </td>

                            <!-- Sync Status Badge -->
                            <td class="py-3 px-3 pim-status-cell">
                                <?php if ($p->sync_status === 'synced'): ?>
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Synced
                                    </span>
                                <?php elseif ($p->sync_status === 'pending'): ?>
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                        <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Ready
                                    </span>
                                <?php elseif ($p->sync_status === 'conflict'): ?>
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 conflict-pulse">
                                        <i data-lucide="alert-triangle" class="w-3 h-3 text-amber-500"></i> Conflict
                                    </span>
                                <?php else: ?>
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                                        <i data-lucide="x" class="w-3 h-3 text-red-500"></i> Failed
                                    </span>
                                <?php endif; ?>
                            </td>

                            <!-- Row Actions -->
                            <td class="py-3 pr-4 pl-3 text-right">
                                <div class="inline-flex items-center gap-1">
                                    <button class="pim-btn pim-sync-one-btn p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-md" data-id="<?php echo esc_attr($p->id); ?>" title="Sync to WooCommerce">
                                        <i data-lucide="zap" class="w-4 h-4"></i>
                                    </button>
                                    <a href="<?php echo admin_url('admin.php?page=pim-product-editor&id=' . $p->id); ?>" class="pim-btn p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-md" title="Edit Product">
                                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                                    </a>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <!-- Import CSV Modal -->
    <div id="pim-import-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-up">
        <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-slate-100 animate-scale-in">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                    <i data-lucide="upload" class="w-5 h-5 text-indigo-600"></i> Import Catalog CSV
                </h3>
                <button onclick="document.getElementById('pim-import-modal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <form id="pim-import-csv-form" enctype="multipart/form-data">
                <p class="text-xs text-slate-500 mb-4">
                    Upload a standard CSV file. Expected columns: <code>SKU, Name, Price, Stock, Category, Attributes</code>
                </p>

                <div class="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center mb-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <input type="file" name="csv_file" id="csv_file" accept=".csv" class="hidden" onchange="$('#file-name-display').text(this.files[0]?.name || '')" required>
                    <label for="csv_file" class="cursor-pointer block">
                        <i data-lucide="file-spreadsheet" class="w-10 h-10 text-indigo-500 mx-auto mb-2"></i>
                        <span class="text-sm font-semibold text-slate-700 block">Click to select CSV file</span>
                        <span id="file-name-display" class="text-xs text-indigo-600 font-bold mt-1 block"></span>
                    </label>
                </div>

                <div class="flex justify-end gap-2">
                    <button type="button" onclick="document.getElementById('pim-import-modal').classList.add('hidden')" class="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200">
                        Cancel
                    </button>
                    <button type="submit" id="pim-submit-import-btn" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm">
                        Import CSV
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
