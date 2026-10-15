# Stockroom PIM for WooCommerce

A Next-Generation Enterprise **Product Information Management (PIM)** system with bidirectional WooCommerce synchronization, dynamic attribute schemas, and automated two-way conflict handling.

---

## 🎯 Why PIM is the Safer Pick

- **Clear Scope:** Products, attributes, categories, and inventory map directly onto WooCommerce's core REST data model (`products`, `variations`, `categories`, `attributes`). You can see exactly what "done" looks like.
- **Easier to Demo:** Edit a product in your PIM, hit **Sync to WooCommerce**, and watch the store update live in real-time. Judges get it in **30 seconds**.
- **Cleaner Integration:** The WooCommerce REST API handles products and attributes cleanly, allowing you to focus on high-fidelity UI/UX rather than fighting API edge cases.
- **Room to Stand Out:**
  - ⚡ **The 30-Second Judge Demo View:** Side-by-side split screen showing PIM on the left and Live WooCommerce storefront on the right.
  - 🔄 **Bidirectional Conflict Handling:** Automated detection when both PIM and WooCommerce change a product simultaneously, with field-level diff and 1-click resolution.
  - 📑 **Dynamic Attribute Templates:** Standardize product schemas (Apparel, Electronics, Home Gear, Outdoor) and inject into products with 1 click.
  - 📦 **Bulk Import / Export via CSV:** Drag-and-drop CSV importer with live preview table and sample catalog pre-loader.
  - 🌐 **Multi-Channel & High-Fidelity Sandbox:** Built-in simulated WooCommerce store for zero-setup demoing plus full support for real WordPress stores.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Highlights |
|---|---|---|
| **Frontend** | **React 19** + **Vite** + **Tailwind CSS v4** | Modern glassmorphism dark SaaS design, Tailwind utility classes, Lucide icons, Canvas Confetti celebrations, live glowing sync pipeline |
| **Backend** | **FastAPI** (Python 3.12) | Async REST API, Pydantic v2 schemas, automated CORS, OpenAPI docs at `/docs` |
| **Database** | **SQLite** + **SQLAlchemy** | Zero-setup persistent storage, WAL journal mode for high-concurrency read/write |
| **Sync Engine** | **WooCommerce REST API v3** + **Sandbox Simulator** | Bidirectional sync, snapshot comparison, conflict detection, field-level divergence tracking |

---

## 🚀 Quick Start

### 1. Launch Everything in One Click
Simply double-click:
```bash
start.bat
```
Or run with PowerShell:
```powershell
.\run.ps1
```
Then open your browser to **http://localhost:8000**. The unified application serves both the FastAPI API and the React 19 frontend!

---

### 2. Developer Mode (Hot Module Reloading)
To run frontend and backend with hot-reload during development:
```bash
start_dev.bat
```
- **React Frontend (Vite):** http://localhost:5173
- **FastAPI Backend:** http://localhost:8000
- **Interactive API Docs (Swagger):** http://localhost:8000/docs

---

## 📸 Key Features & How to Demo

### 1. The 30-Second Judge Demo View (Tab: `30-Sec Live Demo View`)
1. Select any product (e.g. *All-Weather Alpine Shell Jacket*).
2. Tweak the price or stock on the left panel (PIM Source of Truth).
3. Click **Push & Sync to WooCommerce**.
4. Watch the glowing sync bridge animate and the right panel (WooCommerce Storefront) immediately flash green with the updated price and inventory!

### 2. Two-Way Conflict Detection & Resolution (Tab: `Conflict Center`)
1. Click **Simulate Store Change (Demo!)** in the top bar or on any product.
2. The engine simulates a remote order or WP Admin price edit in WooCommerce.
3. Switch to the **Conflict Center** tab:
   - Notice the amber badge and side-by-side diff table comparing: `Field Name | PIM Master | WooCommerce Store | Divergence`.
   - Resolve with 1 click: **Keep PIM Version** (will overwrite store) or **Accept WooCommerce Version** (updates local PIM).

### 3. Attribute Templates (Tab: `Attribute Templates`)
- Built-in templates:
  - **Apparel & Fashion:** Color, Size, Material, Fit, Care Instructions.
  - **Electronics & Audio:** Connectivity, Battery Life, Warranty, Water Resistance.
  - **Home & Dining:** Material, Capacity, Finish, Dishwasher Safe.
  - **Outdoor & Gear:** Volume, Weatherproofing, Weight, Laptop Sleeve.
- In the **Product Editor**, select *Apply Template* to instantly populate structured attributes!

### 4. Bulk CSV Import & Export
- Click **Bulk CSV** in the top header.
- Click **Load Sample CSV** to see formatted rows.
- Inspect the live parsed preview table and click **Import to PIM Catalog**.
- Export your catalog anytime with the **Export** button.

---

## 🌐 Connecting to a Real WooCommerce Store

By default, Stockroom PIM runs in **High-Fidelity Sandbox Mode** so anyone can demo it instantly without needing a WordPress server.

To connect to a live WooCommerce store:
1. In WordPress Admin, navigate to:
   `WooCommerce > Settings > Advanced > REST API > Add Key`
2. Name the key (e.g. `Stockroom PIM`) and set Permissions to **Read/Write**.
3. In Stockroom PIM, click **Store Settings** in the top navigation.
4. Select **Live WooCommerce Store**, enter:
   - Store URL: `https://yourdomain.com`
   - Consumer Key: `ck_...`
   - Consumer Secret: `cs_...`
5. Click **Test Connection** to verify ping, then save!

---

## 📁 Repository Structure

```
pim-woocommerce/
├── backend/
│   ├── main.py              FastAPI endpoints, CORS, static SPA fallback
│   ├── database.py          SQLite connection & SQLAlchemy session (WAL mode)
│   ├── models.py            Database models (Product, Templates, Channel, Activity)
│   ├── schemas.py           Pydantic request/response validation schemas
│   ├── woo_client.py        WooCommerce REST API connector & Sandbox engine
│   ├── seed_data.py         Catalog seed data with rich attributes & images
│   ├── requirements.txt     Python dependencies
│   └── data/pim.db          SQLite database file (created automatically)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          Main React application shell & tab routing
│   │   ├── index.css        Premium dark SaaS glassmorphic design system
│   │   ├── api.js           Centralized API client
│   │   └── components/
│   │       ├── SyncBridge.jsx              Animated glowing sync pipeline
│   │       ├── CatalogView.jsx             Product table, metrics, filters
│   │       ├── SideBySideDemoView.jsx      30-second live demo split screen
│   │       ├── ConflictResolutionCenter.jsx Side-by-side visual diff & resolve
│   │       ├── AttributeTemplatesView.jsx  Schema templates manager
│   │       ├── ProductModal.jsx            Product creation & editing
│   │       ├── BulkImportModal.jsx         CSV drag & drop and sample loader
│   │       ├── StoreSettingsModal.jsx      WooCommerce API keys & channels
│   │       └── ActivityLogView.jsx         Real-time sync audit trail
│   ├── package.json
│   └── vite.config.js       Vite dev server configuration & API proxy
│
├── start.bat                One-click Windows launcher
├── start_dev.bat            Hot-reload development launcher
├── run.ps1                  PowerShell launcher
└── README.md
```

---

## 📋 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health, active store mode, catalog counts |
| `GET` | `/api/products` | Filter, search, and list products |
| `POST` | `/api/products` | Create a new product in PIM |
| `PUT` | `/api/products/{id}` | Update product details (auto-queues for sync) |
| `DELETE` | `/api/products/{id}` | Delete product from catalog |
| `POST` | `/api/sync` | Push products to WooCommerce |
| `POST` | `/api/pull` | Scan store for remote updates & detect conflicts |
| `POST` | `/api/products/{id}/resolve` | Resolve conflict (`keep: "pim"` or `"woo"`) |
| `POST` | `/api/simulate-remote-change`| Demo external store edit (triggers conflict) |
| `GET` | `/api/woo-preview` | Live inspect products as formatted in WooCommerce |
| `POST` | `/api/import-csv` | Bulk import products from CSV |
| `GET` | `/api/export-csv` | Download complete catalog as CSV |
| `GET` | `/api/templates` | List attribute schema templates |
| `POST` | `/api/templates` | Create new attribute template |
| `GET` | `/api/activity` | Retrieve chronological sync audit trail |
| `POST` | `/api/channels/test` | Test live WooCommerce REST API credentials |
