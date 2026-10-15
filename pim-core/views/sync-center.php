<?php
if (!defined('ABSPATH')) exit;

global $wpdb;
$table_prods = $wpdb->prefix . 'pim_products';
$table_log   = $wpdb->prefix . 'pim_sync_log';

// Pending count
$pending_count = (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_prods WHERE sync_status = 'pending'");

// Conflicting products
$conflicts = $wpdb->get_results("SELECT * FROM $table_prods WHERE sync_status = 'conflict' ORDER BY id DESC");

// Sync history (last 50)
$logs = $wpdb->get_results("SELECT * FROM $table_log ORDER BY id DESC LIMIT 50");
?>

<div class="pim-wrap my-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4 animate-fade-up">
        <div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <i data-lucide="zap" class="w-7 h-7 text-indigo-600"></i>
                Sync Center &amp; Channel Hub
            </h1>
            <p class="text-sm text-slate-500 mt-1">Orchestrate bidirectional synchronization between PIM and WooCommerce.</p>
        </div>

        <!-- Schedule Toggle (UI only) -->
        <div class="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
            <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <i data-lucide="clock" class="w-3.5 h-3.5 text-indigo-600"></i> Hourly Auto-Sync
            </span>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked class="sr-only peer">
                <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        </div>
    </div>

    <!-- Top Action Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-up">
        <!-- PUSH Card -->
        <div class="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-sm relative overflow-hidden">
            <div class="relative z-10">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-white/10 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                        <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i> Outbound Sync
                    </span>
                    <span class="text-xs font-semibold text-indigo-200">
                        <?php echo $pending_count; ?> product<?php echo $pending_count === 1 ? '' : 's'; ?> queued
                    </span>
                </div>

                <h3 class="text-xl font-extrabold mb-1">PUSH to WooCommerce</h3>
                <p class="text-xs text-indigo-200 mb-6">
                    Dispatches pending product titles, inventory, prices, and attribute schemas into your store.
                </p>

                <!-- Animated Progress Bar -->
                <div id="pim-sync-progress-bar" class="hidden mb-4 bg-white/20 rounded-full h-2 overflow-hidden">
                    <div id="pim-sync-progress-fill" class="bg-emerald-400 h-2 rounded-full transition-all duration-500" style="width: 0%;"></div>
                </div>

                <button id="pim-push-all-btn" class="pim-btn w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2">
                    <i data-lucide="zap" class="w-4 h-4"></i> PUSH All Pending to WooCommerce
                </button>
            </div>
        </div>

        <!-- PULL Card -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                    <i data-lucide="arrow-down-left" class="w-3.5 h-3.5"></i> Inbound Scan
                </span>
                <span class="text-xs font-semibold text-slate-400">
                    Auto-detects orders
                </span>
            </div>

            <h3 class="text-xl font-extrabold text-slate-900 mb-1">PULL from WooCommerce</h3>
            <p class="text-xs text-slate-500 mb-6">
                Scans WooCommerce store for remote price revisions and inventory deductions from customer purchases.
            </p>

            <button id="pim-pull-stock-btn" class="pim-btn w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2">
                <i data-lucide="refresh-cw" class="w-4 h-4"></i> PULL Stock &amp; Detect Changes
            </button>
        </div>
    </div>

    <!-- Conflict Queue Section -->
    <div class="mb-8 animate-fade-up">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-500"></i>
                Conflict Resolution Queue
                <span class="px-2 py-0.5 rounded-full text-xs font-bold <?php echo count($conflicts) > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'; ?>">
                    <?php echo count($conflicts); ?> Active
                </span>
            </h2>
            <?php if (count($conflicts) > 0): ?>
                <span class="text-xs text-amber-600 font-medium">Modified in both PIM and WooCommerce. Choose winning version.</span>
            <?php endif; ?>
        </div>

        <?php if (empty($conflicts)): ?>
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center mb-2">
                    <i data-lucide="check" class="w-5 h-5"></i>
                </div>
                <h3 class="text-sm font-bold text-slate-800">No Conflicts Detected</h3>
                <p class="text-xs text-slate-400 mt-1">All channels and master records are synchronized smoothly.</p>
            </div>
        <?php else: ?>
            <div class="bg-white rounded-xl border border-amber-300 shadow-sm overflow-hidden conflict-pulse">
                <table class="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr class="bg-amber-50/70 border-b border-amber-200 text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                            <th class="py-3 px-4">SKU &amp; Product</th>
                            <th class="py-3 px-4">PIM Master Values</th>
                            <th class="py-3 px-4">WooCommerce Remote Store</th>
                            <th class="py-3 pr-4 text-right">Resolve Conflict</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-amber-100">
                        <?php foreach ($conflicts as $c): ?>
                            <?php $snap = json_decode($c->woo_snapshot, true) ?: array(); ?>
                            <tr class="hover:bg-amber-50/30 transition-colors">
                                <td class="py-3.5 px-4 font-semibold text-slate-800">
                                    <?php echo esc_html($c->name); ?>
                                    <span class="block text-xs font-mono font-normal text-slate-400 mt-0.5"><?php echo esc_html($c->sku); ?></span>
                                </td>
                                <td class="py-3.5 px-4">
                                    <div class="text-indigo-600 font-bold">&#8377;<?php echo number_format($c->price, 2); ?></div>
                                    <div class="text-xs text-slate-500">Stock: <?php echo esc_html($c->stock); ?> units</div>
                                </td>
                                <td class="py-3.5 px-4">
                                    <div class="text-amber-600 font-bold">
                                        &#8377;<?php echo number_format($snap['price'] ?? 0, 2); ?>
                                    </div>
                                    <div class="text-xs text-slate-500">
                                        Stock: <?php echo esc_html($snap['stock'] ?? 0); ?> units
                                    </div>
                                </td>
                                <td class="py-3.5 pr-4 text-right">
                                    <div class="inline-flex gap-2">
                                        <button class="pim-btn pim-resolve-btn px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-semibold hover:bg-indigo-700 shadow-sm" data-id="<?php echo esc_attr($c->id); ?>" data-winner="pim">
                                            PIM Wins (Overwrite Store)
                                        </button>
                                        <button class="pim-btn pim-resolve-btn px-3 py-1.5 bg-amber-500 text-white rounded-md text-xs font-semibold hover:bg-amber-600 shadow-sm" data-id="<?php echo esc_attr($c->id); ?>" data-winner="woo">
                                            Woo Wins (Accept Store)
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>

    <!-- Sync History Audit Ledger -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-up">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <i data-lucide="history" class="w-4 h-4 text-indigo-600"></i>
                Channel Sync History (Last 50 Events)
            </h3>
        </div>

        <table class="w-full text-left text-sm border-collapse">
            <thead>
                <tr class="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th class="py-3 px-4">Timestamp</th>
                    <th class="py-3 px-3">SKU</th>
                    <th class="py-3 px-3">Direction</th>
                    <th class="py-3 px-3">Status</th>
                    <th class="py-3 pr-4">Message</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
                <?php if (empty($logs)): ?>
                    <tr>
                        <td colspan="5" class="py-8 text-center text-slate-400">No sync activities recorded yet.</td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($logs as $l): ?>
                        <tr class="hover:bg-slate-50/50">
                            <td class="py-2.5 px-4 font-mono text-slate-500">
                                <?php echo esc_html(date('M d, H:i:s', strtotime($l->created_at))); ?>
                            </td>
                            <td class="py-2.5 px-3 font-mono font-semibold text-slate-700">
                                <?php echo esc_html($l->sku ?: '-'); ?>
                            </td>
                            <td class="py-2.5 px-3">
                                <span class="px-2 py-0.5 rounded font-bold <?php echo $l->direction === 'PUSH' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'; ?>">
                                    <?php echo esc_html($l->direction); ?>
                                </span>
                            </td>
                            <td class="py-2.5 px-3">
                                <span class="px-2 py-0.5 rounded font-semibold <?php 
                                    if ($l->status === 'success') echo 'bg-emerald-50 text-emerald-700';
                                    elseif ($l->status === 'conflict') echo 'bg-amber-50 text-amber-700';
                                    else echo 'bg-red-50 text-red-700';
                                ?>">
                                    <?php echo ucfirst(esc_html($l->status)); ?>
                                </span>
                            </td>
                            <td class="py-2.5 pr-4 text-slate-700">
                                <?php echo esc_html($l->message); ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
