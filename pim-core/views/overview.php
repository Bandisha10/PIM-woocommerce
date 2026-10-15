<?php
if (!defined('ABSPATH')) exit;

global $wpdb;
$table_prods = $wpdb->prefix . 'pim_products';
$table_log   = $wpdb->prefix . 'pim_sync_log';

// Compute metrics
$total_products = (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_prods");
$synced_count   = (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_prods WHERE sync_status = 'synced'");
$pending_count  = (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_prods WHERE sync_status = 'pending'");
$failed_count   = (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_prods WHERE sync_status IN ('failed', 'conflict')");
$avg_completeness = (int)$wpdb->get_var("SELECT ROUND(AVG(completeness_score)) FROM $table_prods") ?: 0;

// Completeness distribution
$comp_low  = (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_prods WHERE completeness_score < 40");
$comp_mid  = (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_prods WHERE completeness_score >= 40 AND completeness_score < 75");
$comp_high = (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_prods WHERE completeness_score >= 75");

$pct_low  = $total_products > 0 ? round(($comp_low / $total_products) * 100) : 0;
$pct_mid  = $total_products > 0 ? round(($comp_mid / $total_products) * 100) : 0;
$pct_high = $total_products > 0 ? round(($comp_high / $total_products) * 100) : 0;

// Recent activity (last 5)
$recent_logs = $wpdb->get_results("SELECT * FROM $table_log ORDER BY id DESC LIMIT 5");
?>

<div class="pim-wrap my-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4 animate-fade-up">
        <div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <i data-lucide="layers" class="w-7 h-7 text-indigo-600"></i>
                PIM Core <span class="text-indigo-600 text-lg font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">Overview</span>
            </h1>
            <p class="text-sm text-slate-500 mt-1">Single source of truth for your product catalog & WooCommerce sales channel.</p>
        </div>
        <div class="flex items-center gap-3">
            <a href="<?php echo admin_url('admin.php?page=pim-sync'); ?>" class="pim-btn inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-indigo-700">
                <i data-lucide="zap" class="w-4 h-4"></i> Sync Center
            </a>
            <a href="<?php echo admin_url('admin.php?page=pim-product-editor'); ?>" class="pim-btn inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 font-semibold text-sm rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50">
                <i data-lucide="plus" class="w-4 h-4 text-indigo-600"></i> New Product
            </a>
        </div>
    </div>

    <!-- Top 5 Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <!-- Card 1: Total -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500 animate-fade-up stagger-1">
            <div class="flex items-center justify-between text-slate-400 mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Products</span>
                <i data-lucide="package" class="w-5 h-5 text-indigo-500"></i>
            </div>
            <div class="text-3xl font-extrabold text-slate-900" data-count="<?php echo esc_attr($total_products); ?>">0</div>
            <p class="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <i data-lucide="database" class="w-3.5 h-3.5"></i> In PIM Master catalog
            </p>
        </div>

        <!-- Card 2: Synced -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500 animate-fade-up stagger-2">
            <div class="flex items-center justify-between text-slate-400 mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Synced to Store</span>
                <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-500"></i>
            </div>
            <div class="text-3xl font-extrabold text-emerald-600" data-count="<?php echo esc_attr($synced_count); ?>">0</div>
            <p class="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span> Live in WooCommerce
            </p>
        </div>

        <!-- Card 3: Pending -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500 animate-fade-up stagger-3">
            <div class="flex items-center justify-between text-slate-400 mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Sync</span>
                <i data-lucide="clock" class="w-5 h-5 text-blue-500"></i>
            </div>
            <div class="text-3xl font-extrabold text-blue-600" data-count="<?php echo esc_attr($pending_count); ?>">0</div>
            <p class="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i> Changes queued
            </p>
        </div>

        <!-- Card 4: Failed / Conflict -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500 animate-fade-up stagger-4">
            <div class="flex items-center justify-between text-slate-400 mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Failed / Conflicts</span>
                <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-500"></i>
            </div>
            <div class="text-3xl font-extrabold text-amber-600" data-count="<?php echo esc_attr($failed_count); ?>">0</div>
            <p class="text-xs text-amber-600 font-medium mt-1.5">
                <?php echo $failed_count > 0 ? 'Requires attention' : 'All channels healthy'; ?>
            </p>
        </div>

        <!-- Card 5: Avg Completeness -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-purple-500 animate-fade-up stagger-5">
            <div class="flex items-center justify-between text-slate-400 mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Catalog Health</span>
                <i data-lucide="pie-chart" class="w-5 h-5 text-purple-500"></i>
            </div>
            <div class="text-3xl font-extrabold text-purple-600" data-count="<?php echo esc_attr($avg_completeness); ?>">0%</div>
            <div class="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
                <div class="bg-purple-500 h-2 rounded-full pim-progress-fill" data-progress-width="<?php echo esc_attr($avg_completeness); ?>" style="width: 0%;"></div>
            </div>
        </div>
    </div>

    <!-- 2 Column Section -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column: Recent Activity Feed (7 cols) -->
        <div class="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-fade-up">
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
                    <i data-lucide="activity" class="w-5 h-5 text-indigo-600"></i>
                    Recent Channel Activity
                </h2>
                <a href="<?php echo admin_url('admin.php?page=pim-sync'); ?>" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                    View Full Log &rarr;
                </a>
            </div>

            <div class="divide-y divide-slate-100">
                <?php if (empty($recent_logs)): ?>
                    <p class="text-sm text-slate-400 py-6 text-center">No recent sync logs recorded.</p>
                <?php else: ?>
                    <?php foreach ($recent_logs as $log): ?>
                        <div class="py-3.5 flex items-center justify-between gap-4 pim-table-row rounded-lg px-2">
                            <div class="flex items-center gap-3">
                                <span class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 <?php echo $log->direction === 'PUSH' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'; ?>">
                                    <i data-lucide="<?php echo $log->direction === 'PUSH' ? 'arrow-up-right' : 'arrow-down-left'; ?>" class="w-4 h-4"></i>
                                </span>
                                <div>
                                    <div class="text-sm font-semibold text-slate-800"><?php echo esc_html($log->message); ?></div>
                                    <div class="text-xs text-slate-400 mt-0.5">
                                        <?php if (!empty($log->sku)): ?>
                                            <span class="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600"><?php echo esc_html($log->sku); ?></span> &bull; 
                                        <?php endif; ?>
                                        <span><?php echo esc_html(human_time_diff(strtotime($log->created_at), current_time('timestamp'))) . ' ago'; ?></span>
                                    </div>
                                </div>
                            </div>

                            <span class="px-2.5 py-1 rounded-full text-xs font-semibold <?php 
                                if ($log->status === 'success') echo 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                                elseif ($log->status === 'conflict') echo 'bg-amber-50 text-amber-700 border border-amber-200';
                                else echo 'bg-red-50 text-red-700 border border-red-200';
                            ?>">
                                <?php echo ucfirst(esc_html($log->status)); ?>
                            </span>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>

        <!-- Right Column: Completeness Distribution & Quick Actions (5 cols) -->
        <div class="lg:col-span-5 flex flex-col gap-6">
            <!-- Completeness Distribution Widget -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-fade-up">
                <h2 class="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <i data-lucide="bar-chart-3" class="w-5 h-5 text-indigo-600"></i>
                    Completeness Distribution
                </h2>

                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between text-xs font-semibold mb-1.5">
                            <span class="text-emerald-700 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> High (75% - 100%)</span>
                            <span class="text-slate-500"><?php echo $comp_high; ?> products (<?php echo $pct_high; ?>%)</span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div class="bg-emerald-500 h-3 rounded-full pim-progress-fill" data-progress-width="<?php echo $pct_high; ?>" style="width: 0%;"></div>
                        </div>
                    </div>

                    <div>
                        <div class="flex justify-between text-xs font-semibold mb-1.5">
                            <span class="text-amber-700 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Medium (40% - 74%)</span>
                            <span class="text-slate-500"><?php echo $comp_mid; ?> products (<?php echo $pct_mid; ?>%)</span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div class="bg-amber-500 h-3 rounded-full pim-progress-fill" data-progress-width="<?php echo $pct_mid; ?>" style="width: 0%;"></div>
                        </div>
                    </div>

                    <div>
                        <div class="flex justify-between text-xs font-semibold mb-1.5">
                            <span class="text-red-700 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-red-500"></span> Incomplete (&lt; 40%)</span>
                            <span class="text-slate-500"><?php echo $comp_low; ?> products (<?php echo $pct_low; ?>%)</span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div class="bg-red-500 h-3 rounded-full pim-progress-fill" data-progress-width="<?php echo $pct_low; ?>" style="width: 0%;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions Hub -->
            <div class="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-sm animate-fade-up">
                <h3 class="text-base font-bold flex items-center gap-2 mb-2">
                    <i data-lucide="sparkles" class="w-5 h-5 text-indigo-400"></i> Quick Actions
                </h3>
                <p class="text-xs text-indigo-200 mb-4">Direct commands to accelerate your multi-channel product workflow.</p>

                <div class="grid grid-cols-2 gap-3">
                    <a href="<?php echo admin_url('admin.php?page=pim-catalog'); ?>" class="pim-btn p-3 bg-white/10 hover:bg-white/20 rounded-lg text-center text-xs font-semibold border border-white/10">
                        <i data-lucide="table" class="w-4 h-4 mx-auto mb-1 text-indigo-300"></i> View Catalog
                    </a>
                    <a href="<?php echo admin_url('admin.php?page=pim-attributes'); ?>" class="pim-btn p-3 bg-white/10 hover:bg-white/20 rounded-lg text-center text-xs font-semibold border border-white/10">
                        <i data-lucide="sliders" class="w-4 h-4 mx-auto mb-1 text-indigo-300"></i> Attributes
                    </a>
                    <a href="<?php echo admin_url('admin.php?page=pim-sync'); ?>" class="pim-btn p-3 bg-white/10 hover:bg-white/20 rounded-lg text-center text-xs font-semibold border border-white/10">
                        <i data-lucide="refresh-cw" class="w-4 h-4 mx-auto mb-1 text-indigo-300"></i> Pull Stock
                    </a>
                    <a href="<?php echo admin_url('admin.php?page=pim-settings'); ?>" class="pim-btn p-3 bg-white/10 hover:bg-white/20 rounded-lg text-center text-xs font-semibold border border-white/10">
                        <i data-lucide="settings" class="w-4 h-4 mx-auto mb-1 text-indigo-300"></i> API Settings
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
