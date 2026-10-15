from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, Text
from .database import Base

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

class Product(Base):
    __tablename__ = "products"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    price = Column(Float, default=0.0)
    regular_price = Column(Float, default=0.0)
    sale_price = Column(Float, nullable=True)
    stock = Column(Integer, default=0)
    category = Column(String(100), default="General")
    description = Column(Text, default="")
    short_description = Column(Text, default="")
    image_url = Column(String(500), default="")
    emoji = Column(String(10), default="📦")
    hue = Column(Integer, default=210)
    status = Column(String(30), default="pending")  # pending, synced, conflict, draft
    attributes_json = Column(Text, default="{}")   # JSON: {"Color": "Black", "Size": "M"}
    woo_id = Column(Integer, nullable=True)
    woo_snapshot_json = Column(Text, nullable=True) # Snapshot of last known Woo state
    channel_id = Column(String(50), default="default")
    created_at = Column(String(50), default=now_iso)
    updated_at = Column(String(50), default=now_iso, onupdate=now_iso)

class AttributeTemplate(Base):
    __tablename__ = "attribute_templates"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(50), default="Layers")
    description = Column(String(255), default="")
    fields_json = Column(Text, default="[]")  # List of { "key": str, "default": str, "options": list }
    created_at = Column(String(50), default=now_iso)

class Category(Base):
    __tablename__ = "categories"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), default="")
    woo_id = Column(Integer, nullable=True)

class Channel(Base):
    __tablename__ = "channels"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    url = Column(String(255), default="")
    consumer_key = Column(String(255), default="")
    consumer_secret = Column(String(255), default="")
    is_active = Column(Boolean, default=True)
    is_simulated = Column(Boolean, default=True)
    last_synced_at = Column(String(50), nullable=True)

class SyncActivity(Base):
    __tablename__ = "sync_activities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String(50), default=now_iso)
    action = Column(String(50), nullable=False) # sync, pull, conflict, resolve, import, create, update, delete
    sku = Column(String(100), nullable=True)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="info") # success, warning, error, info
    channel_id = Column(String(50), default="default")

class SimulatedWooProduct(Base):
    """
    Stores live state of the simulated WooCommerce store.
    Allows demoing real-time sync, remote changes, pulls, and conflict detection
    without needing live WordPress credentials.
    """
    __tablename__ = "simulated_woo_products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), index=True, nullable=False)
    regular_price = Column(Float, default=0.0)
    sale_price = Column(Float, nullable=True)
    stock_quantity = Column(Integer, default=0)
    manage_stock = Column(Boolean, default=True)
    category = Column(String(100), default="")
    attributes_json = Column(Text, default="[]")
    image_url = Column(String(500), default="")
    short_description = Column(Text, default="")
    updated_at = Column(String(50), default=now_iso)

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(100), default="Catalog SuperAdmin")
    avatar = Column(String(500), default="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80")
    password_hash = Column(String(255), nullable=False)
    is_verified = Column(Boolean, default=True)
    verification_code = Column(String(20), nullable=True)
    reset_token = Column(String(64), nullable=True)
    created_at = Column(String(50), default=now_iso)
    updated_at = Column(String(50), default=now_iso, onupdate=now_iso)

