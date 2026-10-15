/**
 * PIM Core - WordPress Admin Interactive Controller
 */
(function ($) {
    'use strict';

    // 1. Toast Notification System
    window.pimToast = function (message, type = 'success') {
        let container = document.getElementById('pim-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'pim-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `pim-toast toast-${type}`;
        
        let iconName = 'check-circle';
        if (type === 'error') iconName = 'alert-triangle';
        if (type === 'warning') iconName = 'alert-circle';

        toast.innerHTML = `<i data-lucide="${iconName}" style="width:18px;height:18px;"></i> <span>${message}</span>`;
        container.appendChild(toast);

        if (window.lucide) lucide.createIcons();

        // Trigger slide-in
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    };

    // 2. Count-Up Numbers Animation
    function initCountUps() {
        $('[data-count]').each(function () {
            const $this = $(this);
            const target = parseInt($this.attr('data-count'), 10) || 0;
            const isPercent = $this.text().includes('%');
            $({ countNum: 0 }).animate(
                { countNum: target },
                {
                    duration: 1000,
                    easing: 'swing',
                    step: function () {
                        $this.text(Math.floor(this.countNum) + (isPercent ? '%' : ''));
                    },
                    complete: function () {
                        $this.text(target + (isPercent ? '%' : ''));
                    }
                }
            );
        });
    }

    // 3. Progress Bar Widths Animation
    function initProgressBars() {
        $('[data-progress-width]').each(function () {
            const $this = $(this);
            const targetWidth = $this.attr('data-progress-width') + '%';
            setTimeout(() => {
                $this.css('width', targetWidth);
            }, 100);
        });
    }

    // 4. Confetti Celebration Trigger
    function triggerConfetti() {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 75,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899']
            });
        }
    }

    // Initialize on DOM ready
    $(document).ready(function () {
        if (window.lucide) lucide.createIcons();
        initCountUps();
        initProgressBars();

        // ----------------------------------------------------
        // CATALOG: Instant Debounced Search & Filters
        // ----------------------------------------------------
        let searchTimer;
        $('#pim-catalog-search').on('keyup', function () {
            clearTimeout(searchTimer);
            const query = $(this).val().toLowerCase().trim();
            searchTimer = setTimeout(function () {
                $('.pim-catalog-row').each(function () {
                    const sku = $(this).attr('data-sku') || '';
                    const name = $(this).attr('data-name') || '';
                    if (sku.includes(query) || name.includes(query)) {
                        $(this).fadeIn(150);
                    } else {
                        $(this).fadeOut(150);
                    }
                });
            }, 200);
        });

        // Bulk Selection Checkboxes
        $('#pim-select-all').on('change', function () {
            const checked = $(this).is(':checked');
            $('.pim-row-cb').prop('checked', checked);
            updateBulkCount();
        });

        $(document).on('change', '.pim-row-cb', function () {
            updateBulkCount();
        });

        function updateBulkCount() {
            const count = $('.pim-row-cb:checked').length;
            $('#pim-bulk-count').text(count);
            if (count > 0) {
                $('#pim-bulk-bar').removeClass('hidden').addClass('flex');
            } else {
                $('#pim-bulk-bar').addClass('hidden').removeClass('flex');
            }
        }

        // Bulk Actions Trigger
        $('#pim-bulk-sync-btn, #pim-bulk-delete-btn').on('click', function () {
            const isSync = $(this).attr('id') === 'pim-bulk-sync-btn';
            const action = isSync ? 'sync' : 'delete';
            const ids = $('.pim-row-cb:checked').map(function () { return $(this).val(); }).get();

            if (!ids.length) return;
            if (!isSync && !confirm(`Are you sure you want to delete ${ids.length} products?`)) return;

            const $btn = $(this);
            const originalText = $btn.html();
            $btn.html('<i data-lucide="loader-2" class="animate-spin w-4 h-4"></i> Processing...');
            if (window.lucide) lucide.createIcons();

            $.post(pim_vars.ajax_url, {
                action: 'pim_bulk_action',
                nonce: pim_vars.nonce,
                bulk_action: action,
                ids: ids
            }, function (res) {
                $btn.html(originalText);
                if (window.lucide) lucide.createIcons();
                if (res.success) {
                    pimToast(res.data.message, 'success');
                    if (isSync) triggerConfetti();
                    setTimeout(() => location.reload(), 1000);
                } else {
                    pimToast(res.data.message, 'error');
                }
            });
        });

        // Single Sync Button
        $(document).on('click', '.pim-sync-one-btn', function () {
            const $btn = $(this);
            const id = $btn.data('id');
            const originalHtml = $btn.html();

            $btn.prop('disabled', true).html('<i data-lucide="loader-2" class="animate-spin w-3.5 h-3.5"></i>');
            if (window.lucide) lucide.createIcons();

            $.post(pim_vars.ajax_url, {
                action: 'pim_push_one',
                nonce: pim_vars.nonce,
                product_id: id
            }, function (res) {
                $btn.prop('disabled', false).html(originalHtml);
                if (window.lucide) lucide.createIcons();
                if (res.success) {
                    pimToast(res.data.message, 'success');
                    triggerConfetti();
                    // Update status badge on row
                    const $row = $btn.closest('tr');
                    $row.find('.pim-status-cell').html(
                        '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Synced</span>'
                    );
                } else {
                    pimToast(res.data.message, 'error');
                }
            });
        });

        // ----------------------------------------------------
        // PRODUCT EDITOR: Completeness Score & Dynamic Sets
        // ----------------------------------------------------
        function updateCompletenessUI() {
            const title = $('#pim-prod-name').val() || '';
            const price = parseFloat($('#pim-prod-price').val()) || 0;
            const img = $('#pim-prod-image').val() || '';
            const shortDesc = $('#pim-prod-short-desc').val() || '';
            
            // Check attributes count
            let hasAttrs = false;
            $('.pim-attr-input').each(function () {
                if ($(this).val().trim() !== '') hasAttrs = true;
            });

            let score = 0;
            if (title.trim()) score += 20;
            if (price > 0) score += 20;
            if (img.trim()) score += 20;
            if (hasAttrs) score += 20;
            if (shortDesc.trim()) score += 20;

            // Update SVG circle
            const circumference = 2 * Math.PI * 45; // radius 45
            const offset = circumference - (score / 100) * circumference;
            $('#pim-circle-fill').css('stroke-dashoffset', offset);

            // Change color depending on score
            if (score >= 80) {
                $('#pim-circle-fill').css('stroke', '#10b981');
                $('#pim-score-text').css('color', '#10b981');
            } else if (score >= 50) {
                $('#pim-circle-fill').css('stroke', '#f59e0b');
                $('#pim-score-text').css('color', '#f59e0b');
            } else {
                $('#pim-circle-fill').css('stroke', '#ef4444');
                $('#pim-score-text').css('color', '#ef4444');
            }

            $('#pim-score-text').text(score + '%');

            // Update breakdown badges
            $('#chk-title').toggleClass('text-emerald-600 font-semibold', !!title.trim());
            $('#chk-price').toggleClass('text-emerald-600 font-semibold', price > 0);
            $('#chk-image').toggleClass('text-emerald-600 font-semibold', !!img.trim());
            $('#chk-attrs').toggleClass('text-emerald-600 font-semibold', hasAttrs);
            $('#chk-desc').toggleClass('text-emerald-600 font-semibold', !!shortDesc.trim());
        }

        // Live input binding
        $('#pim-prod-name, #pim-prod-price, #pim-prod-image, #pim-prod-short-desc').on('input change', function () {
            updateCompletenessUI();
        });
        $(document).on('input change', '.pim-attr-input', function () {
            updateCompletenessUI();
        });

        // Image URL live preview
        $('#pim-prod-image').on('input change', function () {
            const url = $(this).val().trim();
            if (url) {
                $('#pim-image-preview').attr('src', url).removeClass('hidden');
                $('#pim-image-placeholder').addClass('hidden');
            } else {
                $('#pim-image-preview').addClass('hidden');
                $('#pim-image-placeholder').removeClass('hidden');
            }
        });

        // Dynamic Attribute Set Loading
        $('#pim-attr-set-select').on('change', function () {
            const setId = $(this).val();
            const $container = $('#pim-dynamic-attributes-fields');
            $container.html('<div class="py-4 text-center text-slate-400"><i data-lucide="loader-2" class="animate-spin inline w-5 h-5"></i> Loading attributes...</div>');
            if (window.lucide) lucide.createIcons();

            $.post(pim_vars.ajax_url, {
                action: 'pim_get_set_attributes',
                nonce: pim_vars.nonce,
                set_id: setId
            }, function (res) {
                if (res.success && res.data.attributes) {
                    if (res.data.attributes.length === 0) {
                        $container.html('<p class="text-xs text-slate-400 py-2">No attributes linked to this set.</p>');
                        return;
                    }
                    let html = '';
                    res.data.attributes.forEach(function (attr) {
                        html += `<div class="mb-3 animate-fade-up">
                            <label class="block text-xs font-semibold text-slate-700 mb-1">${attr.label} <span class="text-slate-400">(${attr.code})</span></label>`;
                        if (attr.type === 'dropdown') {
                            html += `<select name="attributes[${attr.code}]" class="pim-attr-input w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">Select ${attr.label}...</option>`;
                            attr.options.forEach(function (opt) {
                                html += `<option value="${opt}">${opt}</option>`;
                            });
                            html += `</select>`;
                        } else if (attr.type === 'number') {
                            html += `<input type="number" name="attributes[${attr.code}]" class="pim-attr-input w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 100">`;
                        } else {
                            html += `<input type="text" name="attributes[${attr.code}]" class="pim-attr-input w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Value">`;
                        }
                        html += `</div>`;
                    });
                    $container.html(html);
                    if (window.lucide) lucide.createIcons();
                    updateCompletenessUI();
                }
            });
        });

        // Save Product Form
        $('#pim-product-form').on('submit', function (e) {
            e.preventDefault();
            const $btn = $('#pim-save-product-btn');
            const originalHtml = $btn.html();
            $btn.prop('disabled', true).html('<i data-lucide="loader-2" class="animate-spin w-4 h-4"></i> Saving...');
            if (window.lucide) lucide.createIcons();

            // Extract content from wp_editor if available
            let longDesc = $('#pim_long_desc').val();
            if (typeof tinyMCE !== 'undefined' && tinyMCE.get('pim_long_desc')) {
                longDesc = tinyMCE.get('pim_long_desc').getContent();
            }

            const formData = $(this).serializeArray();
            formData.push({ name: 'action', value: 'pim_save_product' });
            formData.push({ name: 'nonce', value: pim_vars.nonce });
            
            // replace long_desc
            for (let i = 0; i < formData.length; i++) {
                if (formData[i].name === 'long_desc') {
                    formData[i].value = longDesc;
                    break;
                }
            }

            $.post(pim_vars.ajax_url, formData, function (res) {
                if (res.success) {
                    $btn.html('<i data-lucide="check" class="w-4 h-4 text-emerald-300"></i> Saved!');
                    if (window.lucide) lucide.createIcons();
                    pimToast(res.data.message, 'success');
                    setTimeout(() => {
                        $btn.prop('disabled', false).html(originalHtml);
                        if (window.lucide) lucide.createIcons();
                    }, 1500);
                } else {
                    $btn.prop('disabled', false).html(originalHtml);
                    if (window.lucide) lucide.createIcons();
                    pimToast(res.data.message, 'error');
                }
            });
        });

        // ----------------------------------------------------
        // ATTRIBUTES MANAGER: Sortable Drag & Drop & Modals
        // ----------------------------------------------------
        if (typeof Sortable !== 'undefined') {
            $('.pim-sortable-list').each(function () {
                const setId = $(this).data('set-id');
                Sortable.create(this, {
                    animation: 180,
                    ghostClass: 'sortable-ghost',
                    chosenClass: 'sortable-chosen',
                    onEnd: function () {
                        const order = [];
                        $(`[data-set-id="${setId}"] .pim-sortable-item`).each(function () {
                            order.push($(this).data('attr-id'));
                        });
                        $.post(pim_vars.ajax_url, {
                            action: 'pim_reorder_set_attributes',
                            nonce: pim_vars.nonce,
                            set_id: setId,
                            order: order
                        }, function (res) {
                            if (res.success) {
                                pimToast('Attribute order updated.', 'success');
                            }
                        });
                    }
                });
            });
        }

        // Create Attribute Form
        $('#pim-create-attribute-form').on('submit', function (e) {
            e.preventDefault();
            const formData = $(this).serialize() + '&action=pim_create_attribute&nonce=' + pim_vars.nonce;
            $.post(pim_vars.ajax_url, formData, function (res) {
                if (res.success) {
                    pimToast(res.data.message, 'success');
                    setTimeout(() => location.reload(), 800);
                } else {
                    pimToast(res.data.message, 'error');
                }
            });
        });

        // Create Set Form
        $('#pim-create-set-form').on('submit', function (e) {
            e.preventDefault();
            const formData = $(this).serialize() + '&action=pim_create_set&nonce=' + pim_vars.nonce;
            $.post(pim_vars.ajax_url, formData, function (res) {
                if (res.success) {
                    pimToast(res.data.message, 'success');
                    setTimeout(() => location.reload(), 800);
                } else {
                    pimToast(res.data.message, 'error');
                }
            });
        });

        // Delete Attribute or Set
        $(document).on('click', '.pim-del-attr-btn, .pim-del-set-btn', function () {
            const isAttr = $(this).hasClass('pim-del-attr-btn');
            const id = $(this).data('id');
            const action = isAttr ? 'pim_delete_attribute' : 'pim_delete_set';

            if (!confirm(`Delete this ${isAttr ? 'attribute' : 'attribute set'}?`)) return;

            $.post(pim_vars.ajax_url, {
                action: action,
                nonce: pim_vars.nonce,
                id: id
            }, function (res) {
                if (res.success) {
                    pimToast(res.data.message, 'success');
                    setTimeout(() => location.reload(), 600);
                } else {
                    pimToast(res.data.message, 'error');
                }
            });
        });

        // ----------------------------------------------------
        // SYNC CENTER: PUSH ALL, PULL, & CONFLICT RESOLUTION
        // ----------------------------------------------------
        $('#pim-push-all-btn').on('click', function () {
            const $btn = $(this);
            const originalHtml = $btn.html();
            $btn.prop('disabled', true).html('<i data-lucide="loader-2" class="animate-spin w-5 h-5"></i> Dispatching...');
            $('#pim-sync-progress-bar').removeClass('hidden');
            $('#pim-sync-progress-fill').css('width', '70%');
            if (window.lucide) lucide.createIcons();

            $.post(pim_vars.ajax_url, {
                action: 'pim_push_all',
                nonce: pim_vars.nonce
            }, function (res) {
                $('#pim-sync-progress-fill').css('width', '100%');
                setTimeout(() => {
                    $btn.prop('disabled', false).html(originalHtml);
                    $('#pim-sync-progress-bar').addClass('hidden');
                    if (window.lucide) lucide.createIcons();

                    if (res.success) {
                        pimToast(res.data.message, 'success');
                        triggerConfetti();
                        setTimeout(() => location.reload(), 1200);
                    } else {
                        pimToast(res.data.message, 'error');
                    }
                }, 600);
            });
        });

        $('#pim-pull-stock-btn').on('click', function () {
            const $btn = $(this);
            const originalHtml = $btn.html();
            $btn.prop('disabled', true).html('<i data-lucide="loader-2" class="animate-spin w-5 h-5"></i> Pulling...');
            if (window.lucide) lucide.createIcons();

            $.post(pim_vars.ajax_url, {
                action: 'pim_pull_stock',
                nonce: pim_vars.nonce
            }, function (res) {
                $btn.prop('disabled', false).html(originalHtml);
                if (window.lucide) lucide.createIcons();

                if (res.success) {
                    pimToast(res.data.message, res.data.conflicts > 0 ? 'warning' : 'success');
                    setTimeout(() => location.reload(), 1200);
                } else {
                    pimToast(res.data.message, 'error');
                }
            });
        });

        // Conflict Resolve Click
        $(document).on('click', '.pim-resolve-btn', function () {
            const $btn = $(this);
            const id = $btn.data('id');
            const winner = $btn.data('winner');
            const originalHtml = $btn.html();

            $btn.prop('disabled', true).html('<i data-lucide="loader-2" class="animate-spin w-3.5 h-3.5"></i>');
            if (window.lucide) lucide.createIcons();

            $.post(pim_vars.ajax_url, {
                action: 'pim_resolve_conflict',
                nonce: pim_vars.nonce,
                product_id: id,
                winner: winner
            }, function (res) {
                if (res.success) {
                    pimToast(res.data.message, 'success');
                    $btn.closest('tr').fadeOut(300, function () { $(this).remove(); });
                } else {
                    $btn.prop('disabled', false).html(originalHtml);
                    if (window.lucide) lucide.createIcons();
                    pimToast(res.data.message, 'error');
                }
            });
        });

        // ----------------------------------------------------
        // SETTINGS: TEST CONNECTION & SAVE
        // ----------------------------------------------------
        $('#pim-test-connection-btn').on('click', function () {
            const $btn = $(this);
            const originalHtml = $btn.html();
            $btn.prop('disabled', true).html('<i data-lucide="loader-2" class="animate-spin w-4 h-4"></i> Pinging...');
            if (window.lucide) lucide.createIcons();

            const url = $('#pim_wc_url').val();
            const ck = $('#pim_wc_ck').val();
            const cs = $('#pim_wc_cs').val();

            $.post(pim_vars.ajax_url, {
                action: 'pim_test_connection',
                nonce: pim_vars.nonce,
                url: url,
                ck: ck,
                cs: cs
            }, function (res) {
                $btn.prop('disabled', false).html(originalHtml);
                if (window.lucide) lucide.createIcons();

                const $box = $('#pim-connection-status-box');
                $box.removeClass('hidden bg-emerald-50 text-emerald-700 border-emerald-200 bg-red-50 text-red-700 border-red-200');

                if (res.success) {
                    $box.addClass('bg-emerald-50 text-emerald-700 border border-emerald-200').html(
                        `<div class="flex items-center gap-2"><i data-lucide="check-circle" class="w-5 h-5 text-emerald-600"></i> <span>${res.data.message}</span></div>`
                    );
                    pimToast('Connection successful!', 'success');
                } else {
                    $box.addClass('bg-red-50 text-red-700 border border-red-200').html(
                        `<div class="flex items-center gap-2"><i data-lucide="alert-triangle" class="w-5 h-5 text-red-600"></i> <span>${res.data.message}</span></div>`
                    );
                    pimToast(res.data.message, 'error');
                }
                if (window.lucide) lucide.createIcons();
            });
        });

        $('#pim-settings-form').on('submit', function (e) {
            e.preventDefault();
            const formData = $(this).serialize() + '&action=pim_save_settings&nonce=' + pim_vars.nonce;
            $.post(pim_vars.ajax_url, formData, function (res) {
                if (res.success) {
                    pimToast(res.data.message, 'success');
                } else {
                    pimToast(res.data.message, 'error');
                }
            });
        });

        // ----------------------------------------------------
        // CSV IMPORT MODAL
        // ----------------------------------------------------
        $('#pim-import-csv-form').on('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            formData.append('action', 'pim_import_csv');
            formData.append('nonce', pim_vars.nonce);

            const $btn = $('#pim-submit-import-btn');
            $btn.prop('disabled', true).text('Importing...');

            $.ajax({
                url: pim_vars.ajax_url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (res) {
                    $btn.prop('disabled', false).text('Import CSV');
                    if (res.success) {
                        pimToast(res.data.message, 'success');
                        setTimeout(() => location.reload(), 1000);
                    } else {
                        pimToast(res.data.message, 'error');
                    }
                }
            });
        });
    });

})(jQuery);
