import hashlib
import json
import uuid
from sqlalchemy.orm import Session
from .models import Product, AttributeTemplate, Category, Channel, SyncActivity, SimulatedWooProduct, User, now_iso

def hash_password(password: str) -> str:
    salt = "nexus_pim_secure_salt_2026"
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()

def seed_database(db: Session):
    # Always ensure default admin user exists
    if db.query(User).filter(User.email == "alex.rivera@nexus-pim.io").first() is None:
        admin_user = User(
            id=str(uuid.uuid4()),
            email="alex.rivera@nexus-pim.io",
            name="Alex Rivera",
            role="Catalog SuperAdmin",
            avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            password_hash=hash_password("password123"),
            is_verified=True,
            created_at=now_iso(),
            updated_at=now_iso(),
        )
        db.add(admin_user)
        try:
            db.commit()
        except Exception:
            db.rollback()

    # Check if already seeded
    if db.query(Product).count() > 0:
        return


    # 1. Seed Channels
    demo_channel = Channel(
        id="store-demo",
        name="Demo WooCommerce Sandbox",
        url="https://demo.woocommerce.store",
        consumer_key="ck_demo_sandboxed_key",
        consumer_secret="cs_demo_sandboxed_secret",
        is_active=True,
        is_simulated=True,
        last_synced_at=now_iso(),
    )
    live_channel = Channel(
        id="store-live",
        name="Live WooCommerce Store",
        url="",
        consumer_key="",
        consumer_secret="",
        is_active=False,
        is_simulated=False,
        last_synced_at=None,
    )
    db.add(demo_channel)
    db.add(live_channel)

    # 2. Seed Attribute Templates
    templates = [
        {
            "id": "tpl-apparel",
            "name": "Apparel & Fashion",
            "icon": "Shirt",
            "description": "Standard sizing, colorways, fabric composition, and care attributes",
            "fields": [
                {"key": "Color", "default": "Midnight Navy", "options": ["Midnight Navy", "Olive Green", "Charcoal", "Burgundy", "Off-White"]},
                {"key": "Size", "default": "M", "options": ["XS", "S", "M", "L", "XL", "XXL"]},
                {"key": "Material", "default": "100% Organic Cotton", "options": ["100% Organic Cotton", "Merino Wool", "Ripstop Nylon", "Linen Blend"]},
                {"key": "Fit", "default": "Regular", "options": ["Slim Fit", "Regular", "Oversized", "Relaxed"]},
                {"key": "Care Instructions", "default": "Machine wash cold", "options": ["Machine wash cold", "Dry clean only", "Hand wash"]}
            ]
        },
        {
            "id": "tpl-electronics",
            "name": "Electronics & Audio",
            "icon": "Headphones",
            "description": "Technical specs including connectivity, battery life, and warranty",
            "fields": [
                {"key": "Connectivity", "default": "Bluetooth 5.3 + USB-C", "options": ["Bluetooth 5.3 + USB-C", "Wi-Fi 6E", "3.5mm AUX", "Wireless 2.4GHz"]},
                {"key": "Battery Life", "default": "30 Hours", "options": ["12 Hours", "24 Hours", "30 Hours", "40+ Hours"]},
                {"key": "Color", "default": "Matte Black", "options": ["Matte Black", "Space Gray", "Silver", "Alpine White"]},
                {"key": "Warranty", "default": "2-Year Manufacturer", "options": ["1-Year Limited", "2-Year Manufacturer", "3-Year Extended"]},
                {"key": "Water Resistance", "default": "IPX4 Splashproof", "options": ["IPX4 Splashproof", "IP67 Dust/Water", "IPX8 Submersible"]}
            ]
        },
        {
            "id": "tpl-home",
            "name": "Home & Coffee Gear",
            "icon": "Coffee",
            "description": "Materials, capacity, finish, and origin for lifestyle products",
            "fields": [
                {"key": "Material", "default": "Glazed Stoneware", "options": ["Glazed Stoneware", "Borosilicate Glass", "Brushed Stainless Steel", "Walnut Wood"]},
                {"key": "Capacity", "default": "650 ml", "options": ["350 ml", "500 ml", "650 ml", "1000 ml"]},
                {"key": "Finish", "default": "Matte Sand", "options": ["Matte Sand", "Gloss White", "Obsidian Black", "Terracotta"]},
                {"key": "Dishwasher Safe", "default": "Yes", "options": ["Yes", "Hand Wash Recommended", "No"]}
            ]
        },
        {
            "id": "tpl-outdoor",
            "name": "Outdoor & Travel Gear",
            "icon": "Compass",
            "description": "Durability, weatherproofing, capacity, and weight ratings",
            "fields": [
                {"key": "Volume", "default": "28 Liters", "options": ["18 Liters", "24 Liters", "28 Liters", "35 Liters"]},
                {"key": "Weatherproof", "default": "Water-Resistant DWR", "options": ["Water-Resistant DWR", "Fully Waterproof Taped Seams", "Weatherproof Cordura"]},
                {"key": "Weight", "default": "850g", "options": ["450g", "680g", "850g", "1.2kg"]},
                {"key": "Laptop Sleeve", "default": "Up to 16-inch", "options": ["Up to 14-inch", "Up to 16-inch", "None"]}
            ]
        }
    ]

    for t in templates:
        db.add(AttributeTemplate(
            id=t["id"],
            name=t["name"],
            icon=t["icon"],
            description=t["description"],
            fields_json=json.dumps(t["fields"]),
            created_at=now_iso(),
        ))

    # 3. Seed Categories
    cats = ["Outerwear", "Kitchen & Dining", "Bags & Luggage", "Audio & Tech", "Everyday Carry"]
    for c in cats:
        db.add(Category(
            id=str(uuid.uuid4())[:8],
            name=c,
            slug=c.lower().replace(" & ", "-").replace(" ", "-"),
        ))

    # 4. Seed Products
    sample_products = [
        {
            "id": "prod-101",
            "name": "All-Weather Alpine Shell Jacket",
            "sku": "ALP-JK-101",
            "price": 189.00,
            "regular_price": 189.00,
            "sale_price": 159.00,
            "stock": 38,
            "category": "Outerwear",
            "description": "Engineered for technical alpine performance with 3-layer breathable ripstop fabric and seam-sealed protection.",
            "short_description": "Lightweight breathable stormproof jacket.",
            "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
            "emoji": "🧥",
            "hue": 210,
            "status": "synced",
            "woo_id": 1001,
            "attributes": {"Color": "Midnight Navy", "Size": "L", "Material": "Ripstop Nylon", "Water Resistance": "20,000mm"},
            "woo_snapshot": {
                "name": "All-Weather Alpine Shell Jacket",
                "sku": "ALP-JK-101",
                "price": 189.00,
                "regular_price": 189.00,
                "sale_price": 159.00,
                "stock": 38,
                "category": "Outerwear",
                "attributes": {"Color": "Midnight Navy", "Size": "L", "Material": "Ripstop Nylon", "Water Resistance": "20,000mm"}
            }
        },
        {
            "id": "prod-102",
            "name": "Ceramic Artisan Pour-Over Dripper",
            "sku": "KTC-DRP-204",
            "price": 48.00,
            "regular_price": 48.00,
            "sale_price": None,
            "stock": 72,
            "category": "Kitchen & Dining",
            "description": "Handmade ceramic coffee dripper with spiral interior ribs for optimal extraction and clarity in every brew.",
            "short_description": "Handcrafted pour-over for specialty coffee lovers.",
            "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
            "emoji": "☕",
            "hue": 35,
            "status": "synced",
            "woo_id": 1002,
            "attributes": {"Material": "Glazed Stoneware", "Capacity": "500 ml", "Finish": "Matte Sand", "Dishwasher Safe": "Yes"},
            "woo_snapshot": {
                "name": "Ceramic Artisan Pour-Over Dripper",
                "sku": "KTC-DRP-204",
                "price": 48.00,
                "regular_price": 48.00,
                "sale_price": None,
                "stock": 72,
                "category": "Kitchen & Dining",
                "attributes": {"Material": "Glazed Stoneware", "Capacity": "500 ml", "Finish": "Matte Sand", "Dishwasher Safe": "Yes"}
            }
        },
        {
            "id": "prod-103",
            "name": "Commuter Roll-Top Waterproof Backpack",
            "sku": "BAG-COMM-330",
            "price": 115.00,
            "regular_price": 115.00,
            "sale_price": None,
            "stock": 19,
            "category": "Bags & Luggage",
            "description": "Heavy-duty waxed canvas rolltop pack featuring an ergonomic air-mesh harness and dedicated 16-inch padded laptop pocket.",
            "short_description": "Durable 26L waterproof commuter pack.",
            "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
            "emoji": "🎒",
            "hue": 160,
            "status": "pending",  # Has local edits ready to sync!
            "woo_id": 1003,
            "attributes": {"Volume": "26 Liters", "Color": "Forest Green", "Weatherproof": "Water-Resistant DWR", "Laptop Sleeve": "Up to 16-inch"},
            "woo_snapshot": {
                "name": "Commuter Roll-Top Waterproof Backpack",
                "sku": "BAG-COMM-330",
                "price": 95.00,   # Older price in Woo!
                "regular_price": 95.00,
                "sale_price": None,
                "stock": 12,       # Older stock in Woo!
                "category": "Bags & Luggage",
                "attributes": {"Volume": "24 Liters", "Color": "Forest Green"}
            }
        },
        {
            "id": "prod-104",
            "name": "Acoustic Pro Studio Wireless Headphones",
            "sku": "AUD-PR0-418",
            "price": 249.00,
            "regular_price": 249.00,
            "sale_price": 219.00,
            "stock": 14,
            "category": "Audio & Tech",
            "description": "Studio-grade 40mm beryllium drivers, active hybrid noise cancellation, and low-latency Bluetooth 5.3 audio transmission.",
            "short_description": "Active noise cancelling wireless studio headphones.",
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
            "emoji": "🎧",
            "hue": 265,
            "status": "conflict",  # Pre-seeded conflict for immediate demo!
            "woo_id": 1004,
            "attributes": {"Connectivity": "Bluetooth 5.3 + USB-C", "Battery Life": "36 Hours", "Color": "Matte Obsidian", "Warranty": "2-Year Manufacturer"},
            "woo_snapshot": {
                "name": "Acoustic Pro Studio Wireless Headphones [Store Special]",
                "sku": "AUD-PR0-418",
                "price": 279.00, # Store manager changed price to $279
                "regular_price": 279.00,
                "sale_price": None,
                "stock": 7,      # Customers bought units on WooCommerce: stock is 7!
                "category": "Audio & Tech",
                "attributes": {"Connectivity": "Bluetooth 5.3 + USB-C", "Battery Life": "36 Hours", "Color": "Matte Obsidian"}
            }
        },
        {
            "id": "prod-105",
            "name": "Titanium Minimalist Carabiner Tool",
            "sku": "EDC-TI-505",
            "price": 34.00,
            "regular_price": 34.00,
            "sale_price": None,
            "stock": 85,
            "category": "Everyday Carry",
            "description": "Grade 5 aerospace titanium key organizer with integrated pry bar, bottle opener, and hex drive.",
            "short_description": "Aerospace titanium multi-tool carabiner.",
            "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
            "emoji": "🔑",
            "hue": 25,
            "status": "pending", # Ready to sync
            "woo_id": None,      # New item not yet synced to Woo!
            "attributes": {"Material": "Grade 5 Titanium", "Weight": "28g", "Finish": "Stonewashed", "Warranty": "Lifetime"},
            "woo_snapshot": None
        }
    ]

    for sp in sample_products:
        p = Product(
            id=sp["id"],
            name=sp["name"],
            sku=sp["sku"],
            price=sp["price"],
            regular_price=sp["regular_price"],
            sale_price=sp["sale_price"],
            stock=sp["stock"],
            category=sp["category"],
            description=sp["description"],
            short_description=sp["short_description"],
            image_url=sp["image_url"],
            emoji=sp["emoji"],
            hue=sp["hue"],
            status=sp["status"],
            attributes_json=json.dumps(sp["attributes"]),
            woo_id=sp["woo_id"],
            woo_snapshot_json=json.dumps(sp["woo_snapshot"]) if sp["woo_snapshot"] else None,
            channel_id="store-demo",
            created_at=now_iso(),
            updated_at=now_iso(),
        )
        db.add(p)

        # Also populate SimulatedWooProduct for matching items so the simulated store matches WooCommerce state!
        if sp["woo_snapshot"] and sp["woo_id"]:
            snap = sp["woo_snapshot"]
            sim_p = SimulatedWooProduct(
                id=sp["woo_id"],
                name=snap["name"],
                sku=sp["sku"],
                regular_price=snap["regular_price"],
                sale_price=snap.get("sale_price"),
                stock_quantity=snap["stock"],
                manage_stock=True,
                category=snap["category"],
                attributes_json=json.dumps(snap["attributes"]),
                image_url=sp["image_url"],
                short_description=sp["short_description"],
                updated_at=now_iso(),
            )
            db.add(sim_p)

    # 5. Seed Activity Log
    activities = [
        ("sync", "ALP-JK-101", "Initial sync of 'All-Weather Alpine Shell Jacket' to WooCommerce (#1001)", "success"),
        ("sync", "KTC-DRP-204", "Pushed 'Ceramic Artisan Pour-Over Dripper' attributes and stock to WooCommerce (#1002)", "success"),
        ("update", "BAG-COMM-330", "Updated price to $115 and stock to 19 in PIM. Ready to sync.", "info"),
        ("conflict", "AUD-PR0-418", "Conflict: WooCommerce price changed to $279 (stock: 7), while PIM price is $249 (stock: 14)", "warning"),
        ("create", "EDC-TI-505", "Created new product 'Titanium Minimalist Carabiner Tool'. Ready to push.", "info"),
    ]
    for act, sku, msg, st in activities:
        db.add(SyncActivity(
            action=act,
            sku=sku,
            message=msg,
            status=st,
            channel_id="store-demo",
        ))

    db.commit()
    print("Database successfully seeded with realistic PIM catalog, attribute templates, and WooCommerce sandbox!")
