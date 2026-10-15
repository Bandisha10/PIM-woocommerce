# PIM Core - WooCommerce Integration (WordPress Plugin)

**PIM Core** is an enterprise-grade Product Information Management (PIM) plugin for WordPress and WooCommerce. It establishes your PIM as the **Single Source of Truth** for product data, attributes, and inventory, treating WooCommerce as one connected sales channel.

---

## 🚀 Key Features

- **Modern SaaS UI inside WP Admin:** Built with TailwindCSS, Lucide Icons, and Framer Motion-style micro-animations.
- **4 Custom High-Performance MySQL Tables:**
  - `wp_pim_products`: Master products, completeness score, sync status, and WooCommerce snapshot.
  - `wp_pim_attributes`: Dynamic attributes with types (`text`, `dropdown`, `number`).
  - `wp_pim_attribute_sets`: Reusable attribute sets with drag-and-drop reordering.
  - `wp_pim_sync_log`: Chronological audit ledger of all PUSH and PULL events.
- **Completeness Score Engine:** Real-time animated SVG circle calculating catalog health (+20% Title, +20% Price, +20% Image, +20% Attributes, +20% Description).
- **Bidirectional WooCommerce Sync & Conflict Handling:**
  - PUSH all pending products with animated progress bar and celebratory confetti.
  - PULL remote orders and detect conflicts with side-by-side comparison and 1-click resolution (**PIM Wins** vs **Woo Wins**).
- **Attribute Sets with SortableJS:** Drag-and-drop reordering of attributes inside sets.
- **Bulk CSV Import & Export:** Ready with sample data (`sample-products.csv`).

---

## 📁 6 Dashboards Built into WP Admin (`PIM System`)

| Dashboard | URL Path | What it Does |
|---|---|---|
| **1. Overview** | `/wp-admin/admin.php?page=pim-overview` | Top 5 animated metric cards with count-up animations, completeness distribution chart, recent sync activity. |
| **2. Catalog** | `/wp-admin/admin.php?page=pim-catalog` | Master product grid, instant debounced search, bulk actions (Sync/Delete), animated health bars. |
| **3. Product Editor** | `/wp-admin/admin.php?page=pim-product-editor` | 70/30 split layout, live SVG circular completeness gauge, dynamic attribute set injection, `wp_editor`. |
| **4. Attributes** | `/wp-admin/admin.php?page=pim-attributes` | Attribute code/label/type manager + Attribute Set builder with SortableJS drag-and-drop. |
| **5. Sync Center** | `/wp-admin/admin.php?page=pim-sync` | PUSH All Pending (with confetti), PULL Stock, Conflict Resolution Queue (PIM Wins vs Woo Wins), Sync History table. |
| **6. Settings** | `/wp-admin/admin.php?page=pim-settings` | WooCommerce REST API v3 keys (`pim_wc_url`, `pim_wc_ck`, `pim_wc_cs`), conflict rule selector, Test Connection ping tool. |

---

## 🛠️ How to Install in WordPress

### Method 1: Drop into Plugins Folder
1. Copy the `pim-core/` folder directly into your WordPress installation:
   ```text
   wp-content/plugins/pim-core/
   ```
2. Log into your WordPress Admin.
3. Go to **Plugins > Installed Plugins**.
4. Click **Activate** under **PIM Core - WooCommerce Integration**.
   - Custom tables are automatically created via `dbDelta`.
   - Default attributes (*Color*, *Size*, *Material*, *RAM*, *Warranty*) and sets (*Clothing*, *Electronics*) are seeded automatically.

---

### Method 2: ZIP & Upload via WP Admin
1. Compress the `pim-core` folder into `pim-core.zip`.
2. In WordPress Admin, navigate to **Plugins > Add New Plugin > Upload Plugin**.
3. Choose `pim-core.zip` and click **Install Now** > **Activate Plugin**.

---

## 🎬 5-Step Demo Flow for Evaluators

1. **Import Sample CSV:**
   - Go to **PIM System > Catalog**.
   - Click **Import CSV**, upload `sample-products.csv`, and watch products load into the master catalog.
2. **Explore Attribute Sets:**
   - Go to **PIM System > Attributes**.
   - Drag and drop attributes inside the *Clothing* set to reorder them in real-time.
3. **Edit Product & Watch Completeness Score:**
   - Click **Edit** on any product.
   - Select an Attribute Set (e.g. *Clothing*), add an image URL, and watch the circular SVG completeness gauge animate from **40% to 100%**!
   - Click **Save Product** to see the saving spinner and success checkmark.
4. **Push to WooCommerce:**
   - Go to **PIM System > Sync Center**.
   - Click **PUSH All Pending to WooCommerce** -> watch the animated progress bar and celebratory confetti!
5. **Conflict Resolution:**
   - Click **PULL Stock & Detect Changes**.
   - Inspect the **Conflict Resolution Queue** showing PIM vs WooCommerce prices.
   - Click **PIM Wins** or **Woo Wins** to resolve in 1 click!
