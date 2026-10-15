from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class ProductBase(BaseModel):
    name: str
    sku: str
    price: float = 0.0
    regular_price: float = 0.0
    sale_price: Optional[float] = None
    stock: int = 0
    category: str = "General"
    description: Optional[str] = ""
    short_description: Optional[str] = ""
    image_url: Optional[str] = ""
    emoji: Optional[str] = "📦"
    hue: Optional[int] = 210
    attributes: Dict[str, Any] = Field(default_factory=dict)
    channel_id: Optional[str] = "default"

class ProductCreate(ProductBase):
    status: Optional[str] = "pending"

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    regular_price: Optional[float] = None
    sale_price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    image_url: Optional[str] = None
    emoji: Optional[str] = None
    hue: Optional[int] = None
    attributes: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class ProductOut(BaseModel):
    id: str
    name: str
    sku: str
    price: float
    regular_price: float
    sale_price: Optional[float] = None
    stock: int
    category: str
    description: Optional[str] = ""
    short_description: Optional[str] = ""
    image_url: Optional[str] = ""
    emoji: str
    hue: int
    status: str
    attributes: Dict[str, Any]
    woo_id: Optional[int] = None
    woo_snapshot: Optional[Dict[str, Any]] = None
    channel_id: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class SyncRequest(BaseModel):
    product_ids: Optional[List[str]] = None
    sync_all_pending: Optional[bool] = False
    channel_id: Optional[str] = "default"

class SyncResponse(BaseModel):
    ok: bool
    synced_count: int
    synced_ids: List[str]
    failed_ids: List[str]
    message: str

class PullResponse(BaseModel):
    ok: bool
    mode: str  # "live" or "simulated"
    updated_count: int
    conflicts_count: int
    added_count: int
    details: List[str]

class ResolveConflictRequest(BaseModel):
    keep: str  # "pim" or "woo"

class SimulateRemoteChangeRequest(BaseModel):
    product_id: Optional[str] = None
    woo_id: Optional[int] = None
    change_type: str = "price_and_stock"  # "price_and_stock", "price_only", "stock_decrement", "title_edit"
    custom_price: Optional[float] = None
    custom_stock: Optional[int] = None

class AttributeTemplateField(BaseModel):
    key: str
    default: str
    options: List[str] = Field(default_factory=list)

class AttributeTemplateCreate(BaseModel):
    name: str
    icon: Optional[str] = "Layers"
    description: Optional[str] = ""
    fields: List[AttributeTemplateField]

class AttributeTemplateOut(BaseModel):
    id: str
    name: str
    icon: str
    description: str
    fields: List[AttributeTemplateField]
    created_at: str

class ChannelSettings(BaseModel):
    id: str
    name: str
    url: str
    consumer_key: str
    consumer_secret: str
    is_active: bool = True
    is_simulated: bool = False

class ChannelOut(BaseModel):
    id: str
    name: str
    url: str
    is_active: bool
    is_simulated: bool
    last_synced_at: Optional[str] = None

class ActivityOut(BaseModel):
    id: int
    timestamp: str
    action: str
    sku: Optional[str] = None
    message: str
    status: str

class WooPreviewProduct(BaseModel):
    id: int
    name: str
    sku: str
    regular_price: float
    sale_price: Optional[float] = None
    stock_quantity: int
    manage_stock: bool
    category: str
    attributes: List[Dict[str, Any]]
    image_url: str
    updated_at: str

# ----------------- AUTHENTICATION SCHEMAS -----------------
class UserSignup(BaseModel):
    email: str
    password: str
    name: str
    role: Optional[str] = "Catalog SuperAdmin"

class UserLogin(BaseModel):
    email: str
    password: str
    remember_me: Optional[bool] = False

class UserGoogleAuth(BaseModel):
    email: str
    name: str
    avatar: Optional[str] = None
    token: Optional[str] = None

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str
    avatar: str
    is_verified: bool
    created_at: str

class AuthResponse(BaseModel):
    user: UserOut
    token: str
    message: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    email: Optional[str] = None

class VerifyEmailRequest(BaseModel):
    code: str
    email: Optional[str] = None

