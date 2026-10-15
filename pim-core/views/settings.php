<?php
if (!defined('ABSPATH')) exit;

$wc_url  = get_option('pim_wc_url', '');
$wc_ck   = get_option('pim_wc_ck', '');
$wc_cs   = get_option('pim_wc_cs', '');
$rule    = get_option('pim_conflict_rule', 'manual');
?>

<div class="pim-wrap my-6">
    <!-- Header -->
    <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 animate-fade-up">
        <div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <i data-lucide="settings" class="w-7 h-7 text-indigo-600"></i>
                WooCommerce Channel Settings
            </h1>
            <p class="text-sm text-slate-500 mt-1">Configure REST API v3 keys and conflict resolution preferences.</p>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Settings Form (7 cols) -->
        <div class="lg:col-span-7 animate-fade-up">
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <!-- Status Feedback Box -->
                <div id="pim-connection-status-box" class="hidden p-4 rounded-xl text-sm font-semibold transition-all"></div>

                <form id="pim-settings-form" class="space-y-5">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            WooCommerce Store URL *
                        </label>
                        <div class="relative">
                            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <i data-lucide="globe" class="w-4 h-4"></i>
                            </span>
                            <input type="url" id="pim_wc_url" name="wc_url" value="<?php echo esc_attr($wc_url); ?>" placeholder="https://your-wordpress-store.com" class="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono">
                        </div>
                        <p class="text-xs text-slate-400 mt-1">Base domain where WooCommerce is installed (leave blank to use the offline Sandbox simulator).</p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Consumer Key *
                            </label>
                            <input type="password" id="pim_wc_ck" name="wc_ck" value="<?php echo esc_attr($wc_ck); ?>" placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono">
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Consumer Secret *
                            </label>
                            <input type="password" id="pim_wc_cs" name="wc_cs" value="<?php echo esc_attr($wc_cs); ?>" placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Default Conflict Resolution Rule
                        </label>
                        <select name="conflict_rule" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium">
                            <option value="manual" <?php selected($rule, 'manual'); ?>>Manual Resolution (Queue in Conflict Center)</option>
                            <option value="pim" <?php selected($rule, 'pim'); ?>>PIM Wins (Always overwrite WooCommerce with Master values)</option>
                            <option value="woo" <?php selected($rule, 'woo'); ?>>Woo Wins (Always accept remote store orders and price adjustments)</option>
                        </select>
                        <p class="text-xs text-slate-400 mt-1">Dictates what happens when the same product is edited in PIM and changed remotely in WooCommerce.</p>
                    </div>

                    <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <button type="button" id="pim-test-connection-btn" class="pim-btn px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-2">
                            <i data-lucide="radio" class="w-4 h-4 text-indigo-600"></i> Test Connection
                        </button>
                        <button type="submit" class="pim-btn px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2">
                            <i data-lucide="save" class="w-4 h-4"></i> Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Documentation Card (5 cols) -->
        <div class="lg:col-span-5 space-y-6 animate-fade-up stagger-1">
            <div class="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-sm space-y-4">
                <h3 class="text-base font-bold flex items-center gap-2 text-indigo-300">
                    <i data-lucide="key" class="w-5 h-5"></i> How to Generate Keys
                </h3>

                <p class="text-xs text-slate-300 leading-relaxed">
                    To connect to a live WooCommerce site, generate official REST API credentials in your WordPress Admin:
                </p>

                <ol class="space-y-3 text-xs text-slate-300 list-decimal pl-4">
                    <li>Log into your WordPress Dashboard.</li>
                    <li>Navigate to: <strong class="text-white">WooCommerce &gt; Settings &gt; Advanced</strong>.</li>
                    <li>Click on the <strong class="text-white">REST API</strong> sub-tab.</li>
                    <li>Click <strong class="text-white">Add key</strong> or <em>Create an API key</em>.</li>
                    <li>Enter description (e.g. <code>PIM Core Integration</code>), set user, and set Permissions to <strong class="text-emerald-400 font-bold">Read/Write</strong>.</li>
                    <li>Click <strong class="text-white">Generate API key</strong>.</li>
                    <li>Copy the <strong>Consumer Key</strong> and <strong>Consumer Secret</strong> into the fields on the left.</li>
                </ol>

                <div class="p-3 bg-white/10 rounded-lg text-[11px] text-indigo-200 border border-white/10 flex items-start gap-2">
                    <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5"></i>
                    <span>Keys are saved encrypted in the local WordPress <code>wp_options</code> table and are never transmitted to any 3rd party.</span>
                </div>
            </div>
        </div>
    </div>
</div>
