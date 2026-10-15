import json
import logging
import random
from typing import Dict, Any, List, Optional, Tuple
import httpx
from sqlalchemy.orm import Session

from .models import Product, SimulatedWooProduct, SyncActivity, Channel, now_iso

logger = logging.getLogger(__name__)

class WooCommerceClient:
    """
    Handles bidirectional synchronization with WooCommerce:
    - Real WooCommerce store via official REST API v3
    - Built-in High-Fidelity Simulated Sandbox Store for instant, flawless demos & conflict testing
    """

    @staticmethod
    def _to_woo_payload(product: Product, attributes_dict: Dict[str, Any]) -> Dict[str, Any]:
        attrs = []
        for name, val in attributes_dict.items():
            if val is not None and str(val).strip():
                attrs.append({
                    "name": str(name),
                    "visible": True,
                    "variation": False,
                    "options": [str(val)]
                })

        payload = {
            "name": product.name,
            "sku": product.sku,
            "type": "simple",
            "regular_price": str(product.regular_price if product.regular_price > 0 else product.price),
            "manage_stock": True,
            "stock_quantity": int(product.stock),
            "description": product.description or "",
            "short_description": product.short_description or "",
            "attributes": attrs,
        }

        if product.sale_price and product.sale_price > 0:
            payload["sale_price"] = str(product.sale_price)

        if product.category:
            payload["categories"] = [{"name": product.category}]

        if product.image_url:
            payload["images"] = [{"src": product.image_url}]

        return payload

    @classmethod
    async def test_live_connection(cls, url: str, key: str, secret: str) -> Tuple[bool, str]:
        clean_url = url.rstrip("/") + "/wp-json/wc/v3/system_status"
        try:
            async with httpx.AsyncClient(timeout=10.0, verify=False) as client:
                res = await client.get(clean_url, auth=(key, secret))
                if res.status_code == 200:
                    return True, "Successfully connected to WooCommerce store"
                return False, f"WooCommerce returned status {res.status_code}: {res.text[:120]}"
        except Exception as e:
            return False, f"Connection failed: {str(e)}"

    @classmethod
    async def sync_products(cls, db: Session, products: List[Product], channel: Channel) -> Tuple[List[str], List[str]]:
        synced_ids = []
        failed_ids = []

        is_simulated = channel.is_simulated or not (channel.url and channel.consumer_key and channel.consumer_secret)

        for p in products:
            try:
                attrs = json.loads(p.attributes_json or "{}")
                payload = cls._to_woo_payload(p, attrs)

                if is_simulated:
                    # Sync to Simulated WooCommerce Sandbox
                    sim_prod = None
                    if p.woo_id:
                        sim_prod = db.query(SimulatedWooProduct).filter(SimulatedWooProduct.id == p.woo_id).first()
                    if not sim_prod:
                        sim_prod = db.query(SimulatedWooProduct).filter(SimulatedWooProduct.sku == p.sku).first()

                    if not sim_prod:
                        sim_id = p.woo_id or (1000 + random.randint(100, 9999))
                        sim_prod = SimulatedWooProduct(
                            id=sim_id,
                            name=p.name,
                            sku=p.sku,
                            regular_price=float(p.regular_price or p.price),
                            sale_price=p.sale_price,
                            stock_quantity=p.stock,
                            manage_stock=True,
                            category=p.category,
                            attributes_json=json.dumps(attrs),
                            image_url=p.image_url or "",
                            short_description=p.short_description or "",
                            updated_at=now_iso(),
                        )
                        db.add(sim_prod)
                        db.flush()
                    else:
                        sim_prod.name = p.name
                        sim_prod.regular_price = float(p.regular_price or p.price)
                        sim_prod.sale_price = p.sale_price
                        sim_prod.stock_quantity = p.stock
                        sim_prod.category = p.category
                        sim_prod.attributes_json = json.dumps(attrs)
                        sim_prod.image_url = p.image_url or ""
                        sim_prod.short_description = p.short_description or ""
                        sim_prod.updated_at = now_iso()

                    woo_id = sim_prod.id
                    snapshot = {
                        "name": sim_prod.name,
                        "sku": sim_prod.sku,
                        "price": sim_prod.regular_price,
                        "regular_price": sim_prod.regular_price,
                        "sale_price": sim_prod.sale_price,
                        "stock": sim_prod.stock_quantity,
                        "category": sim_prod.category,
                        "attributes": attrs,
                    }

                else:
                    # Real WooCommerce REST API
                    base_url = channel.url.rstrip("/")
                    headers = {"Content-Type": "application/json"}
                    auth = (channel.consumer_key, channel.consumer_secret)

                    async with httpx.AsyncClient(timeout=15.0, verify=False) as client:
                        if p.woo_id:
                            # Update existing product
                            url = f"{base_url}/wp-json/wc/v3/products/{p.woo_id}"
                            res = await client.put(url, json=payload, auth=auth, headers=headers)
                        else:
                            # Search by SKU first
                            search_url = f"{base_url}/wp-json/wc/v3/products?sku={p.sku}"
                            s_res = await client.get(search_url, auth=auth)
                            found = s_res.json() if s_res.status_code == 200 and isinstance(s_res.json(), list) else []

                            if found and len(found) > 0:
                                exist_id = found[0]["id"]
                                url = f"{base_url}/wp-json/wc/v3/products/{exist_id}"
                                res = await client.put(url, json=payload, auth=auth, headers=headers)
                            else:
                                url = f"{base_url}/wp-json/wc/v3/products"
                                res = await client.post(url, json=payload, auth=auth, headers=headers)

                        if res.status_code not in (200, 201):
                            raise Exception(f"WooCommerce API error: {res.text}")

                        woo_data = res.json()
                        woo_id = woo_data["id"]
                        snapshot = {
                            "name": woo_data.get("name"),
                            "sku": woo_data.get("sku"),
                            "price": float(woo_data.get("price") or woo_data.get("regular_price") or 0.0),
                            "regular_price": float(woo_data.get("regular_price") or 0.0),
                            "sale_price": float(woo_data.get("sale_price") or 0.0) if woo_data.get("sale_price") else None,
                            "stock": int(woo_data.get("stock_quantity") or 0),
                            "category": p.category,
                            "attributes": attrs,
                        }

                # Update PIM Product
                p.status = "synced"
                p.woo_id = woo_id
                p.woo_snapshot_json = json.dumps(snapshot)
                p.updated_at = now_iso()

                # Activity log
                act = SyncActivity(
                    action="sync",
                    sku=p.sku,
                    message=f"Pushed '{p.name}' (SKU: {p.sku}) to {'WooCommerce Sandbox' if is_simulated else channel.url} (Woo ID: #{woo_id})",
                    status="success",
                    channel_id=channel.id,
                )
                db.add(act)
                synced_ids.append(p.id)

            except Exception as e:
                logger.error(f"Sync error on product {p.sku}: {e}")
                act = SyncActivity(
                    action="sync",
                    sku=p.sku,
                    message=f"Failed to sync {p.sku}: {str(e)[:150]}",
                    status="error",
                    channel_id=channel.id,
                )
                db.add(act)
                failed_ids.append(p.id)

        channel.last_synced_at = now_iso()
        db.commit()
        return synced_ids, failed_ids

    @classmethod
    async def pull_from_store(cls, db: Session, channel: Channel) -> Dict[str, Any]:
        """
        Pulls products from WooCommerce / simulated store.
        Detects:
        - Remotely updated products (auto-syncs to PIM if PIM was unchanged)
        - Conflicts (if changed on both PIM and WooCommerce)
        - Brand new remote products (adds them to PIM)
        """
        is_simulated = channel.is_simulated or not (channel.url and channel.consumer_key and channel.consumer_secret)
        updated_count = 0
        conflicts_count = 0
        added_count = 0
        details = []

        remote_products = []

        if is_simulated:
            sims = db.query(SimulatedWooProduct).all()
            for s in sims:
                remote_products.append({
                    "id": s.id,
                    "name": s.name,
                    "sku": s.sku,
                    "price": s.regular_price,
                    "regular_price": s.regular_price,
                    "sale_price": s.sale_price,
                    "stock": s.stock_quantity,
                    "category": s.category,
                    "attributes": json.loads(s.attributes_json or "{}"),
                    "image_url": s.image_url,
                })
        else:
            base_url = channel.url.rstrip("/")
            auth = (channel.consumer_key, channel.consumer_secret)
            async with httpx.AsyncClient(timeout=20.0, verify=False) as client:
                res = await client.get(f"{base_url}/wp-json/wc/v3/products?per_page=100", auth=auth)
                if res.status_code != 200:
                    raise Exception(f"Failed to fetch products from WooCommerce: {res.text}")
                items = res.json()
                for item in items:
                    remote_products.append({
                        "id": item["id"],
                        "name": item.get("name", ""),
                        "sku": item.get("sku", ""),
                        "price": float(item.get("price") or item.get("regular_price") or 0.0),
                        "regular_price": float(item.get("regular_price") or 0.0),
                        "sale_price": float(item.get("sale_price") or 0.0) if item.get("sale_price") else None,
                        "stock": int(item.get("stock_quantity") or 0),
                        "category": item["categories"][0]["name"] if item.get("categories") else "General",
                        "attributes": {a["name"]: a["options"][0] for a in item.get("attributes", []) if a.get("options")},
                        "image_url": item["images"][0]["src"] if item.get("images") else "",
                    })

        for r in remote_products:
            if not r["sku"]:
                continue

            # Find matching product in PIM
            prod = db.query(Product).filter(
                (Product.woo_id == r["id"]) | (Product.sku == r["sku"])
            ).first()

            remote_snap = {
                "name": r["name"],
                "sku": r["sku"],
                "price": r["price"],
                "regular_price": r["regular_price"],
                "sale_price": r["sale_price"],
                "stock": r["stock"],
                "category": r["category"],
                "attributes": r["attributes"],
            }

            if not prod:
                # New product in WooCommerce that doesn't exist in PIM
                new_id = f"prod-{r['id']}"
                new_prod = Product(
                    id=new_id,
                    name=r["name"],
                    sku=r["sku"],
                    price=r["price"],
                    regular_price=r["regular_price"],
                    sale_price=r["sale_price"],
                    stock=r["stock"],
                    category=r["category"],
                    image_url=r["image_url"],
                    status="synced",
                    woo_id=r["id"],
                    woo_snapshot_json=json.dumps(remote_snap),
                    attributes_json=json.dumps(r["attributes"]),
                    created_at=now_iso(),
                    updated_at=now_iso(),
                )
                db.add(new_prod)
                added_count += 1
                details.append(f"Imported new product from store: {r['name']} ({r['sku']})")
                continue

            # Existing product: check if remote changed compared to snapshot
            last_snap = json.loads(prod.woo_snapshot_json) if prod.woo_snapshot_json else None

            remote_changed = False
            if last_snap is None:
                remote_changed = True
            else:
                # Compare critical sync fields
                if (
                    last_snap.get("name") != r["name"] or
                    float(last_snap.get("regular_price", 0)) != float(r["regular_price"]) or
                    int(last_snap.get("stock", 0)) != int(r["stock"])
                ):
                    remote_changed = True

            if not remote_changed:
                continue  # Nothing changed remotely

            # Remote changed! Check if local PIM was also edited (pending)
            if prod.status == "synced":
                # Local was NOT edited, safe to accept remote changes automatically
                prod.name = r["name"]
                prod.price = r["price"]
                prod.regular_price = r["regular_price"]
                prod.sale_price = r["sale_price"]
                prod.stock = r["stock"]
                prod.woo_id = r["id"]
                prod.woo_snapshot_json = json.dumps(remote_snap)
                prod.updated_at = now_iso()
                updated_count += 1
                details.append(f"Auto-updated '{prod.name}' from remote store changes (Stock: {r['stock']}, Price: ${r['price']})")
                db.add(SyncActivity(
                    action="pull",
                    sku=prod.sku,
                    message=f"Store updated '{prod.sku}': price=${r['price']}, stock={r['stock']}. PIM synchronized.",
                    status="info",
                ))
            else:
                # PIM has pending changes AND WooCommerce was also changed remotely => CONFLICT!
                prod.status = "conflict"
                prod.woo_id = r["id"]
                prod.woo_snapshot_json = json.dumps(remote_snap)
                prod.updated_at = now_iso()
                conflicts_count += 1
                details.append(f"CONFLICT DETECTED on '{prod.name}' ({prod.sku}): Changed in both PIM and WooCommerce!")
                db.add(SyncActivity(
                    action="conflict",
                    sku=prod.sku,
                    message=f"Conflict detected on {prod.sku}! Store has (Price: ${r['price']}, Stock: {r['stock']}), PIM has (Price: ${prod.price}, Stock: {prod.stock}).",
                    status="warning",
                ))

        db.commit()
        return {
            "ok": True,
            "mode": "simulated" if is_simulated else "live",
            "updated_count": updated_count,
            "conflicts_count": conflicts_count,
            "added_count": added_count,
            "details": details,
        }

    @classmethod
    def simulate_store_edit(
        cls,
        db: Session,
        product: Product,
        change_type: str = "price_and_stock",
        custom_price: Optional[float] = None,
        custom_stock: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Simulates an external store edit (e.g. store manager changed price in WP admin,
        or incoming customer order decreased stock) to demo conflict handling.
        """
        sim = db.query(SimulatedWooProduct).filter(
            (SimulatedWooProduct.id == product.woo_id) | (SimulatedWooProduct.sku == product.sku)
        ).first()

        if not sim:
            sim = SimulatedWooProduct(
                id=product.woo_id or (2000 + random.randint(100, 9999)),
                name=product.name,
                sku=product.sku,
                regular_price=product.price,
                stock_quantity=product.stock,
                category=product.category,
                attributes_json=product.attributes_json or "{}",
                image_url=product.image_url or "",
                updated_at=now_iso(),
            )
            db.add(sim)
            db.flush()

        old_price = sim.regular_price
        old_stock = sim.stock_quantity

        if custom_price is not None:
            sim.regular_price = float(custom_price)
        elif change_type in ("price_and_stock", "price_only"):
            sim.regular_price = round(sim.regular_price * 1.15 + 5.0, 2)

        if custom_stock is not None:
            sim.stock_quantity = int(custom_stock)
        elif change_type in ("price_and_stock", "stock_decrement"):
            sim.stock_quantity = max(0, sim.stock_quantity - 4)

        if change_type == "title_edit":
            sim.name = f"{sim.name} [Store Promo]"

        sim.updated_at = now_iso()

        # Update product's woo_snapshot to reflect what the store now has
        snap = {
            "name": sim.name,
            "sku": sim.sku,
            "price": sim.regular_price,
            "regular_price": sim.regular_price,
            "sale_price": sim.sale_price,
            "stock": sim.stock_quantity,
            "category": sim.category,
            "attributes": json.loads(sim.attributes_json or "{}"),
        }
        product.woo_id = sim.id
        product.woo_snapshot_json = json.dumps(snap)
        product.status = "conflict"
        product.updated_at = now_iso()

        db.add(SyncActivity(
            action="conflict",
            sku=product.sku,
            message=f"Simulated external store modification on #{sim.id} ({product.sku}): Price {old_price} -> {sim.regular_price}, Stock {old_stock} -> {sim.stock_quantity}",
            status="warning"
        ))
        db.commit()

        return {
            "woo_id": sim.id,
            "new_price": sim.regular_price,
            "new_stock": sim.stock_quantity,
            "name": sim.name,
        }

    @classmethod
    def get_woo_preview(cls, db: Session, channel: Channel) -> List[Dict[str, Any]]:
        """
        Returns the current state of products on WooCommerce (simulated or cached)
        for the side-by-side live store inspection view.
        """
        sims = db.query(SimulatedWooProduct).order_by(SimulatedWooProduct.updated_at.desc()).all()
        results = []
        for s in sims:
            raw_attrs = json.loads(s.attributes_json or "{}")
            attrs_list = []
            if isinstance(raw_attrs, dict):
                for k, v in raw_attrs.items():
                    attrs_list.append({"name": k, "options": [str(v)]})
            elif isinstance(raw_attrs, list):
                attrs_list = raw_attrs

            results.append({
                "id": s.id,
                "name": s.name,
                "sku": s.sku,
                "regular_price": s.regular_price,
                "sale_price": s.sale_price,
                "stock_quantity": s.stock_quantity,
                "manage_stock": s.manage_stock,
                "category": s.category,
                "attributes": attrs_list,
                "image_url": s.image_url,
                "updated_at": s.updated_at,
            })
        return results
