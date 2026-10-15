import React, { useState } from 'react';
import {
  Search, Filter, Plus, Zap, RefreshCw, AlertTriangle, CheckCircle2,
  Clock, DollarSign, Package, Tag, Edit3, Trash2, ArrowUpRight, ArrowLeftRight, Download, UploadCloud, Eye
} from 'lucide-react';
import ProductImageViewerModal from './ProductImageViewerModal';

export default function CatalogView({
  products = [],
  categories = [],
  onNewProduct,
  onEditProduct,
  onDeleteProduct,
  onSyncProduct,
  onBulkSync,
  onBulkDelete,
  onResolveConflict,
  onSimulateChange,
  onExportCsv,
  onOpenBulkImport,
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [previewProduct, setPreviewProduct] = useState(null);

  // Filter products
  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchStatus = selectedStatus === 'all' || p.status === selectedStatus;
    return matchSearch && matchCat && matchStatus;
  });

  // Calculate Metrics
  const totalCount = products.length;
  const syncedCount = products.filter((p) => p.status === 'synced').length;
  const pendingCount = products.filter((p) => p.status === 'pending').length;
  const conflictCount = products.filter((p) => p.status === 'conflict').length;
  const catalogValue = products.reduce((acc, p) => acc + (p.price || 0) * (p.stock || 0), 0);

  return (
    <div>
      {/* Metrics Row */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-icon-wrap">
            <Package size={22} />
          </div>
          <div className="metric-info">
            <h5>Total Products</h5>
            <div className="metric-num">{totalCount}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap">
            <CheckCircle2 size={22} />
          </div>
          <div className="metric-info">
            <h5>Synced to Store</h5>
            <div className="metric-num">{syncedCount}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap">
            <Clock size={22} />
          </div>
          <div className="metric-info">
            <h5>Pending Sync</h5>
            <div className="metric-num">{pendingCount}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap">
            <AlertTriangle size={22} />
          </div>
          <div className="metric-info">
            <h5>Conflicts</h5>
            <div className="metric-num">
              {conflictCount}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap">
            <DollarSign size={22} />
          </div>
          <div className="metric-info">
            <h5>Catalog Value</h5>
            <div className="metric-num">${catalogValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          </div>
        </div>
      </div>

      {/* Catalog Controls */}
      <div className="catalog-controls-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search products by title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ fontSize: '13px' }}
          >
            <option value="All">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Chips */}
          <div className="filter-chips">
            <button
              className={`chip-btn ${selectedStatus === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('all')}
            >
              All
            </button>
            <button
              className={`chip-btn ${selectedStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('pending')}
            >
              Pending ({pendingCount})
            </button>
            <button
              className={`chip-btn ${selectedStatus === 'synced' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('synced')}
            >
              Synced ({syncedCount})
            </button>
            <button
              className={`chip-btn ${selectedStatus === 'conflict' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('conflict')}
            >
              Conflicts ({conflictCount})
            </button>
          </div>

          <button className="btn btn-secondary" onClick={onOpenBulkImport} title="Import Products from CSV">
            <UploadCloud size={14} /> Import CSV
          </button>

          <button className="btn btn-secondary" onClick={onExportCsv} title="Export Catalog to CSV">
            <Download size={14} /> Export
          </button>

          <button className="btn btn-primary" onClick={onNewProduct}>
            <Plus size={15} /> Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="products-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Category</th>
              <th>Price</th>
              <th>Inventory</th>
              <th>Attributes</th>
              <th>WooCommerce Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                  <Package size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                  <p style={{ fontSize: '15px', fontWeight: 600 }}>No products matched your filter</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your search criteria or add a new product</p>
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const attrs = p.attributes || {};
                const attrEntries = Object.entries(attrs);

                return (
                  <tr key={p.id}>
                    <td>
                      <div className="product-row-flex">
                        <div
                          className="product-thumb-interactive"
                          onClick={() => setPreviewProduct(p)}
                          role="button"
                          tabIndex={0}
                          title="Click to view full image"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setPreviewProduct(p);
                            }
                          }}
                        >
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="product-thumb"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="product-emoji-fallback">{p.emoji || '📦'}</div>
                          )}
                          <div className="product-thumb-overlay">
                            <Eye size={16} />
                          </div>
                        </div>
                        <div className="product-title-sku">
                          <h4>{p.name}</h4>
                          <span className="sku-badge">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="attr-tag">
                        <Tag size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {p.category || 'General'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>
                        ${p.price.toFixed(2)}
                      </div>
                      {p.sale_price && (
                        <div style={{ fontSize: '11px', color: '#10b981' }}>
                          Sale: ${p.sale_price.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: p.stock < 10 ? '#f59e0b' : '#cbd5e1',
                        }}
                      >
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: p.stock < 10 ? '#f59e0b' : '#10b981',
                          }}
                        />
                        {p.stock} units
                      </span>
                    </td>
                    <td>
                      <div className="attrs-tags-wrap">
                        {attrEntries.length === 0 ? (
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>None</span>
                        ) : (
                          attrEntries.slice(0, 3).map(([k, v]) => (
                            <span key={k} className="attr-tag">
                              <strong>{k}:</strong> {String(v)}
                            </span>
                          ))
                        )}
                        {attrEntries.length > 3 && (
                          <span className="attr-tag">+{attrEntries.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {p.status === 'synced' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span className="status-pill synced">
                            <CheckCircle2 size={12} /> Synced
                          </span>
                          {p.woo_id && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              Woo ID: #{p.woo_id}
                            </span>
                          )}
                        </div>
                      )}

                      {p.status === 'pending' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span className="status-pill pending">
                            <Clock size={12} /> Ready to Sync
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                            Local changes queued
                          </span>
                        </div>
                      )}

                      {p.status === 'conflict' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className="status-pill conflict">
                            <AlertTriangle size={12} /> Conflict!
                          </span>
                          <button
                            className="btn btn-warning"
                            style={{ padding: '2px 8px', fontSize: '11px' }}
                            onClick={() => onResolveConflict(p)}
                          >
                            Resolve Diff
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="table-actions-cluster">
                        {/* Primary Action: Edit */}
                        <button
                          className="table-action-btn edit-btn"
                          title="Edit product attributes, pricing, and stock"
                          onClick={() => onEditProduct(p)}
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>

                        {/* Push to WooCommerce (Contextual) */}
                        {p.status === 'pending' && (
                          <button
                            className="table-action-btn push-btn"
                            title="Push queued changes to WooCommerce"
                            onClick={() => onSyncProduct(p.id)}
                          >
                            <ArrowUpRight size={13} />
                            <span>Push</span>
                          </button>
                        )}

                        {p.status === 'synced' && (
                          <button
                            className="table-action-btn-icon"
                            title="Re-verify / Sync with WooCommerce"
                            onClick={() => onSyncProduct(p.id)}
                            style={{ color: '#818cf8' }}
                          >
                            <RefreshCw size={13} />
                          </button>
                        )}

                        {/* Simulate remote change (Demo tool) */}
                        <button
                          className="table-action-btn-icon"
                          title="Simulate external WooCommerce edit (Conflict Testing)"
                          onClick={() => onSimulateChange(p.id)}
                        >
                          <ArrowLeftRight size={13} />
                        </button>

                        {/* Quick View Image Action */}
                        <button
                          className="table-action-btn-icon"
                          title="View product image"
                          onClick={() => setPreviewProduct(p)}
                          style={{ color: '#818cf8' }}
                        >
                          <Eye size={13} />
                        </button>

                        {/* Delete action */}
                        <button
                          className="table-action-btn-icon delete-btn"
                          title="Delete product from catalog"
                          onClick={() => onDeleteProduct(p.id, p.name)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Product Image Viewer Modal */}
      <ProductImageViewerModal
        isOpen={!!previewProduct}
        product={previewProduct}
        allProducts={filtered}
        onSelectProduct={(prod) => setPreviewProduct(prod)}
        onClose={() => setPreviewProduct(null)}
        onEditProduct={onEditProduct}
      />
    </div>
  );
}
