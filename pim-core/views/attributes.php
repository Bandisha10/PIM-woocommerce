<?php
if (!defined('ABSPATH')) exit;

global $wpdb;
$table_attrs = $wpdb->prefix . 'pim_attributes';
$table_sets  = $wpdb->prefix . 'pim_attribute_sets';

$attributes = $wpdb->get_results("SELECT * FROM $table_attrs ORDER BY id DESC");
$sets       = $wpdb->get_results("SELECT * FROM $table_sets ORDER BY id DESC");

// Index attributes by ID for easy lookup in sets
$attr_map = array();
foreach ($attributes as $a) {
    $attr_map[$a->id] = $a;
}
?>

<div class="pim-wrap my-6">
    <!-- Header -->
    <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 animate-fade-up">
        <div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <i data-lucide="sliders" class="w-7 h-7 text-indigo-600"></i>
                Attributes &amp; Sets Manager
            </h1>
            <p class="text-sm text-slate-500 mt-1">Design attribute schemas and group them into reusable sets for products.</p>
        </div>
    </div>

    <!-- 2 Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left: Attributes (6 cols) -->
        <div class="lg:col-span-6 space-y-6 animate-fade-up">
            <!-- Create Attribute Form Card -->
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 class="text-sm font-bold uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
                    <i data-lucide="plus-circle" class="w-4 h-4 text-indigo-600"></i> Create New Attribute
                </h2>

                <form id="pim-create-attribute-form" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Code *</label>
                            <input type="text" name="code" placeholder="e.g. color, size, ram" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" required>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Label *</label>
                            <input type="text" name="label" placeholder="e.g. Color, Size, Memory" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" required>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Type</label>
                            <select name="type" id="pim-attr-type-select" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="text">Text Field</option>
                                <option value="dropdown">Dropdown (Select)</option>
                                <option value="number">Numeric</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Options (Dropdown only)</label>
                            <input type="text" name="options" placeholder="Red, Blue, Green (comma separated)" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                    </div>

                    <button type="submit" class="pim-btn w-full py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-lg shadow-sm hover:bg-indigo-700 flex items-center justify-center gap-2">
                        <i data-lucide="plus" class="w-4 h-4"></i> Save Attribute
                    </button>
                </form>
            </div>

            <!-- Attributes Table Card -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Defined Attributes (<?php echo count($attributes); ?>)
                    </h3>
                </div>

                <table class="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr class="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                            <th class="py-2.5 px-4">Label &amp; Code</th>
                            <th class="py-2.5 px-3">Type</th>
                            <th class="py-2.5 px-3">Options</th>
                            <th class="py-2.5 pr-4 text-right">Delete</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <?php foreach ($attributes as $a): ?>
                            <tr class="hover:bg-slate-50/50">
                                <td class="py-2.5 px-4 font-semibold text-slate-800">
                                    <?php echo esc_html($a->label); ?>
                                    <span class="block text-xs font-mono font-normal text-slate-400"><?php echo esc_html($a->code); ?></span>
                                </td>
                                <td class="py-2.5 px-3">
                                    <span class="text-xs px-2 py-0.5 rounded font-medium <?php 
                                        if ($a->type === 'dropdown') echo 'bg-purple-50 text-purple-700';
                                        elseif ($a->type === 'number') echo 'bg-blue-50 text-blue-700';
                                        else echo 'bg-slate-100 text-slate-700';
                                    ?>">
                                        <?php echo ucfirst(esc_html($a->type)); ?>
                                    </span>
                                </td>
                                <td class="py-2.5 px-3 text-xs text-slate-500 max-w-xs truncate">
                                    <?php 
                                    $opts = json_decode($a->options_json, true) ?: array();
                                    echo !empty($opts) ? esc_html(implode(', ', $opts)) : '-';
                                    ?>
                                </td>
                                <td class="py-2.5 pr-4 text-right">
                                    <button class="pim-del-attr-btn text-slate-300 hover:text-red-600 transition-colors" data-id="<?php echo esc_attr($a->id); ?>">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Right: Attribute Sets (6 cols) -->
        <div class="lg:col-span-6 space-y-6 animate-fade-up stagger-1">
            <!-- Create Set Card -->
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 class="text-sm font-bold uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
                    <i data-lucide="layers" class="w-4 h-4 text-indigo-600"></i> Create Attribute Set
                </h2>

                <form id="pim-create-set-form" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Set Name *</label>
                        <input type="text" name="name" placeholder="e.g. Footwear, Furniture, Gadgets" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold" required>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Include Attributes in Set</label>
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-36 overflow-y-auto p-3 border border-slate-200 rounded-lg bg-slate-50/50">
                            <?php foreach ($attributes as $a): ?>
                                <label class="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-indigo-600">
                                    <input type="checkbox" name="attribute_ids[]" value="<?php echo esc_attr($a->id); ?>" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                                    <span><?php echo esc_html($a->label); ?></span>
                                </label>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <button type="submit" class="pim-btn w-full py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-lg shadow-sm hover:bg-indigo-700 flex items-center justify-center gap-2">
                        <i data-lucide="plus" class="w-4 h-4"></i> Save Attribute Set
                    </button>
                </form>
            </div>

            <!-- Existing Sets Card with Drag & Drop Reordering -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Attribute Sets (Drag &amp; Drop to Reorder)
                    </h3>
                </div>

                <div class="space-y-4">
                    <?php if (empty($sets)): ?>
                        <p class="text-xs text-slate-400 py-4 text-center">No attribute sets created yet.</p>
                    <?php else: ?>
                        <?php foreach ($sets as $s): ?>
                            <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                                <div class="flex items-center justify-between mb-2.5">
                                    <h4 class="font-bold text-sm text-slate-800 flex items-center gap-2">
                                        <i data-lucide="folder" class="w-4 h-4 text-indigo-600"></i>
                                        <?php echo esc_html($s->name); ?>
                                    </h4>
                                    <button class="pim-del-set-btn text-slate-300 hover:text-red-600" data-id="<?php echo esc_attr($s->id); ?>">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </div>

                                <!-- Drag-and-drop Sortable List -->
                                <div class="pim-sortable-list space-y-1.5" data-set-id="<?php echo esc_attr($s->id); ?>">
                                    <?php
                                    $attr_ids = !empty($s->attribute_ids) ? array_map('intval', explode(',', $s->attribute_ids)) : array();
                                    ?>
                                    <?php if (empty($attr_ids)): ?>
                                        <div class="text-xs text-slate-400 italic py-1">No attributes in this set.</div>
                                    <?php else: ?>
                                        <?php foreach ($attr_ids as $aid): ?>
                                            <?php if (isset($attr_map[$aid])): $attr = $attr_map[$aid]; ?>
                                                <div class="pim-sortable-item bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between text-xs font-medium text-slate-700 cursor-move hover:border-indigo-300" data-attr-id="<?php echo esc_attr($aid); ?>">
                                                    <span class="flex items-center gap-2">
                                                        <i data-lucide="grip-vertical" class="w-3.5 h-3.5 text-slate-400"></i>
                                                        <?php echo esc_html($attr->label); ?> <span class="text-slate-400 text-[11px]">(<?php echo esc_html($attr->code); ?>)</span>
                                                    </span>
                                                    <span class="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        <?php echo esc_html($attr->type); ?>
                                                    </span>
                                                </div>
                                            <?php endif; ?>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>
