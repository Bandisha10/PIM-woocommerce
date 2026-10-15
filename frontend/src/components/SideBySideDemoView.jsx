import React, { useState, useEffect } from 'react';
import {
  Zap, ArrowRight, ArrowLeftRight, CheckCircle2, AlertTriangle,
  RefreshCw, ShoppingBag, Database, Sparkles, ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SideBySideDemoView({
  products = [],
  wooProducts = [],
  onSyncProduct,
  onSimulateChange,
  onQuickUpdate,
  onPullStore,
}) {
  const [selectedId, setSelectedId] = useState(products[0]?.id || '');
  const [justSynced, setJustSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Local draft states for live quick editing in demo
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editName, setEditName] = useState('');

  const activeProduct = products.find((p) => p.id === selectedId) || products[0];
  const activeWooProduct = wooProducts.find(
    (w) => w.sku === activeProduct?.sku || w.id === activeProduct?.woo_id
  );

  useEffect(() => {
    if (activeProduct) {
      setEditName(activeProduct.name);
      setEditPrice(activeProduct.price);
      setEditStock(activeProduct.stock);
    }
  }, [activeProduct?.id]);

  const handleSyncNow = async () => {
    if (!activeProduct) return;
    setIsSyncing(true);

    // Save any draft edits first if changed
    if (
      editPrice !== activeProduct.price ||
      editStock !== activeProduct.stock ||
      editName !== activeProduct.name
    ) {
      await onQuickUpdate(activeProduct.id, {
        name: editName,
        price: parseFloat(editPrice) || 0,
        stock: parseInt(editStock) || 0,
      });
    }

    await onSyncProduct(activeProduct.id);

    // Trigger celebration confetti and highlight pulse
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#a855f7'],
    });

    setJustSynced(true);
    setIsSyncing(false);
    setTimeout(() => setJustSynced(false), 2500);
  };

  const handleSimulateStoreChange = async () => {
    if (!activeProduct) return;
    await onSimulateChange(activeProduct.id);
  };

  if (!activeProduct) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <p>No products available to demo. Please create a product first.</p>
      </div>
    );
  }

  const isConflict = activeProduct.status === 'conflict';
  const isPending = activeProduct.status === 'pending';

  return (
    <div>
      {/* Demo Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FAF5FF 0%, #FDF2F8 100%)',
          border: '1px solid #F3D5FF',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E1B4B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: '#EC4899' }} />
            The 30-Second Judge Demo
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Edit a product in PIM on the left, click <strong>Sync to WooCommerce</strong>, and watch the store on the right update live in real-time.
          </p>
        </div>

        {/* Product Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Demo Item:</span>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{ fontWeight: 600, fontSize: '13px' }}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.emoji || '📦'} {p.name} ({p.sku}) [{p.status}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Split Panels */}
      <div className="demo-split-view">
        {/* LEFT PANEL: PIM MASTER */}
        <div className="demo-panel" style={{ borderLeft: '3px solid #A855F7' }}>
          <div className="demo-panel-header">
            <div className="demo-panel-title">
              <Database size={18} style={{ color: '#7C3AED' }} />
              <span>PIM Master Record (Local)</span>
            </div>
            <span className={`status-pill ${activeProduct.status}`}>
              {activeProduct.status === 'synced' && <CheckCircle2 size={12} />}
              {activeProduct.status === 'conflict' && <AlertTriangle size={12} />}
              {activeProduct.status}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            {activeProduct.image_url ? (
              <img
                src={activeProduct.image_url}
                alt={activeProduct.name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover',
                  cursor: 'pointer',
                  border: '1.5px solid var(--border-highlight)',
                }}
                title="Click to view full image in new tab"
                onClick={() => window.open(activeProduct.image_url, '_blank', 'noopener,noreferrer')}
              />
            ) : (
              <div className="product-emoji-fallback" style={{ width: '80px', height: '80px', fontSize: '36px' }}>
                {activeProduct.emoji || '📦'}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div className="form-field" style={{ marginBottom: '10px' }}>
                <label>Product Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span className="sku-badge">SKU: {activeProduct.sku}</span>
                <span className="attr-tag">Category: {activeProduct.category}</span>
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label>PIM Regular Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>PIM Stock Quantity</label>
              <input
                type="number"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
              />
            </div>
          </div>

          {/* Attributes Preview */}
          <div style={{ background: '#FAF5FF', border: '1px solid #F3D5FF', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Enriched Attributes
            </label>
            <div className="attrs-tags-wrap" style={{ marginTop: '8px' }}>
              {Object.entries(activeProduct.attributes || {}).map(([k, v]) => (
                <span key={k} className="attr-tag">
                  <strong>{k}:</strong> {String(v)}
                </span>
              ))}
            </div>
          </div>

          {/* Sync Trigger CTA */}
          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}
              onClick={handleSyncNow}
              disabled={isSyncing}
            >
              <Zap size={16} />
              {isSyncing ? 'Syncing to WooCommerce...' : 'Push & Sync to WooCommerce'}
            </button>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '6px' }}>
              Maps product fields & attributes directly into WooCommerce REST API
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE WOOCOMMERCE STORE */}
        <div
          className="demo-panel"
          style={{
            borderLeft: '3px solid #EC4899',
            background: justSynced
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, #FAF5FF 100%)'
              : 'var(--bg-card)',
            transition: 'background 0.5s ease',
          }}
        >
          <div className="demo-panel-header">
            <div className="demo-panel-title">
              <ShoppingBag size={18} style={{ color: '#EC4899' }} />
              <span>WooCommerce Storefront (Remote Target)</span>
            </div>
            {activeWooProduct ? (
              <span className="status-pill synced">
                <CheckCircle2 size={12} /> Woo ID #{activeWooProduct.id}
              </span>
            ) : (
              <span className="status-pill pending">Not yet in Woo</span>
            )}
          </div>

          {activeWooProduct ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: '#FAF5FF',
                  border: justSynced ? '1px solid #10b981' : '1px solid var(--border-dim)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px',
                  position: 'relative',
                  boxShadow: justSynced ? '0 0 20px rgba(16, 185, 129, 0.25)' : 'none',
                  transition: 'all 0.4s ease',
                }}
              >
                {justSynced && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#10b981',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    UPDATED JUST NOW!
                  </span>
                )}

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {activeWooProduct.image_url ? (
                    <img
                      src={activeWooProduct.image_url}
                      alt={activeWooProduct.name}
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: 'var(--radius-md)',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: '1.5px solid var(--border-highlight)',
                      }}
                      title="Click to view full image in new tab"
                      onClick={() => window.open(activeWooProduct.image_url, '_blank', 'noopener,noreferrer')}
                    />
                  ) : (
                    <div className="product-emoji-fallback" style={{ width: '70px', height: '70px' }}>
                      {activeProduct.emoji || '🛍️'}
                    </div>
                  )}

                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1E1B4B' }}>
                      {activeWooProduct.name}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      SKU: <strong style={{ color: '#4C1D95' }}>{activeWooProduct.sku}</strong>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '8px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>
                        ${Number(activeWooProduct.regular_price).toFixed(2)}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          color: activeWooProduct.stock_quantity > 0 ? '#10B981' : '#BE185D',
                          fontWeight: 700,
                        }}
                      >
                        {activeWooProduct.stock_quantity > 0
                          ? `In Stock (${activeWooProduct.stock_quantity} available)`
                          : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* WooCommerce Attributes list */}
                {activeWooProduct.attributes && activeWooProduct.attributes.length > 0 && (
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-dim)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
                      WooCommerce Attributes:
                    </div>
                    <div className="attrs-tags-wrap">
                      {activeWooProduct.attributes.map((a, idx) => (
                        <span key={idx} className="attr-tag">
                          <strong>{a.name}:</strong> {a.options ? a.options.join(', ') : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Conflict Alert if exists */}
              {isConflict && (
                <div className="conflict-diff-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontWeight: 700 }}>
                    <AlertTriangle size={16} />
                    <span>Two-Way Conflict Detected!</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    This item was modified on both sides. Resolve in the Conflict Tab or overwrite by syncing.
                  </p>
                </div>
              )}

              {/* Demo Action: Simulate External Store Mutation */}
              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <button
                  className="btn btn-warning"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '13px' }}
                  onClick={handleSimulateStoreChange}
                >
                  <ArrowLeftRight size={15} />
                  Simulate Store Change (Order or WP Admin Edit)
                </button>
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '6px' }}>
                  Simulates a price bump and inventory purchase on WooCommerce to test conflict resolution!
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <p>This item has not yet been pushed to WooCommerce.</p>
              <p style={{ fontSize: '12px', marginTop: '6px' }}>
                Click <strong>Push & Sync</strong> on the left to create it in the store!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
