import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Layers, Sparkles } from 'lucide-react';

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  product = null,
  categories = [],
  templates = [],
}) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('0');
  const [regularPrice, setRegularPrice] = useState('0');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('0');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [emoji, setEmoji] = useState('📦');
  const [attributes, setAttributes] = useState([]);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSku(product.sku || '');
      setPrice(String(product.price ?? 0));
      setRegularPrice(String(product.regular_price ?? product.price ?? 0));
      setSalePrice(product.sale_price ? String(product.sale_price) : '');
      setStock(String(product.stock ?? 0));
      setCategory(product.category || 'General');
      setDescription(product.description || '');
      setShortDesc(product.short_description || '');
      setImageUrl(product.image_url || '');
      setEmoji(product.emoji || '📦');

      const attrsList = Object.entries(product.attributes || {}).map(([k, v]) => ({
        key: k,
        value: String(v),
      }));
      setAttributes(attrsList);
    } else {
      setName('');
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setPrice('49.00');
      setRegularPrice('49.00');
      setSalePrice('');
      setStock('25');
      setCategory(categories[0] || 'General');
      setDescription('');
      setShortDesc('');
      setImageUrl('');
      setEmoji('📦');
      setAttributes([
        { key: 'Color', value: 'Charcoal' },
        { key: 'Size', value: 'M' },
      ]);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (templateId) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl || !tpl.fields) return;

    const newAttrs = [...attributes];
    tpl.fields.forEach((f) => {
      const exists = newAttrs.find((a) => a.key.toLowerCase() === f.key.toLowerCase());
      if (exists) {
        exists.value = f.default;
      } else {
        newAttrs.push({ key: f.key, value: f.default });
      }
    });
    setAttributes(newAttrs);
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { key: '', value: '' }]);
  };

  const handleRemoveAttribute = (idx) => {
    setAttributes(attributes.filter((_, i) => i !== idx));
  };

  const handleAttrChange = (idx, field, val) => {
    const updated = [...attributes];
    updated[idx][field] = val;
    setAttributes(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    const attrsObj = {};
    attributes.forEach((a) => {
      if (a.key.trim()) {
        attrsObj[a.key.trim()] = a.value.trim();
      }
    });

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      price: parseFloat(regularPrice) || parseFloat(price) || 0,
      regular_price: parseFloat(regularPrice) || parseFloat(price) || 0,
      sale_price: salePrice ? parseFloat(salePrice) : null,
      stock: parseInt(stock) || 0,
      category: category.trim() || 'General',
      description,
      short_description: shortDesc,
      image_url: imageUrl.trim(),
      emoji,
      attributes: attrsObj,
    };

    onSave(payload);
  };

  let completeness = 0;
  if (name.trim()) completeness += 20;
  if (parseFloat(regularPrice) > 0 || parseFloat(price) > 0) completeness += 20;
  if (imageUrl.trim()) completeness += 20;
  if (attributes.some((a) => a.key.trim() && a.value.trim())) completeness += 20;
  if (shortDesc.trim() || description.trim()) completeness += 20;

  const circumference = 2 * Math.PI * 26;
  const strokeOffset = circumference - (completeness / 100) * circumference;
  const strokeColor = completeness >= 80 ? '#10b981' : completeness >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{product ? 'Edit Product' : 'Create New Product'}</h3>
          <button className="btn-icon-square" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Completeness Score Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(10, 16, 31, 0.7)',
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                  <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 800,
                      color: strokeColor,
                    }}
                  >
                    {completeness}%
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Completeness Health Score</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {completeness >= 80 ? 'Ready for high-converting WooCommerce sync' : 'Fill missing fields to improve product quality'}
                  </div>
                </div>
              </div>

              {/* Checklist Badges */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: '320px' }}>
                <span className={`attr-tag ${name.trim() ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : ''}`}>Title +20%</span>
                <span className={`attr-tag ${(parseFloat(regularPrice) > 0 || parseFloat(price) > 0) ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : ''}`}>Price +20%</span>
                <span className={`attr-tag ${imageUrl.trim() ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : ''}`}>Image +20%</span>
                <span className={`attr-tag ${attributes.some(a => a.key && a.value) ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : ''}`}>Attrs +20%</span>
                <span className={`attr-tag ${shortDesc.trim() ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : ''}`}>Desc +20%</span>
              </div>
            </div>

            {/* Top row: Name & SKU */}
            <div className="form-grid-2">
              <div className="form-field">
                <label>Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Minimalist Travel Duffel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>SKU (Stock Keeping Unit) *</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '11px', padding: '0 8px' }}
                    onClick={() => setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`)}
                  >
                    Auto
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="form-grid-2">
              <div className="form-field">
                <label>Regular Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={regularPrice}
                  onChange={(e) => {
                    setRegularPrice(e.target.value);
                    setPrice(e.target.value);
                  }}
                />
              </div>

              <div className="form-field">
                <label>Sale Price ($) (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 39.99"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>Inventory / Stock Count *</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="New Category">+ Add Custom...</option>
                </select>
              </div>
            </div>

            {/* Image Preview & URL */}
            <div className="form-field">
              <label>Product Image URL</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{ flex: 1 }}
                />
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: '1px solid var(--border-highlight)',
                    }}
                    title="Click to open original image in new tab"
                    onClick={() => window.open(imageUrl, '_blank', 'noopener,noreferrer')}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
            </div>

            {/* Short description */}
            <div className="form-field">
              <label>Short Description (WooCommerce Summary)</label>
              <input
                type="text"
                placeholder="High performance breathable weather jacket..."
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
              />
            </div>

            {/* Dynamic Attributes Section */}
            <div style={{ background: '#FAF5FF', border: '1px solid #F3D5FF', padding: '14px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#1E1B4B' }}>
                    WooCommerce Attributes
                  </label>
                  <span style={{ fontSize: '11px', color: '#6D28D9' }}>
                    (Maps to WooCommerce Variations & Filters)
                  </span>
                </div>

                {/* Apply Template Dropdown */}
                <select
                  style={{ fontSize: '11.5px', padding: '4px 8px' }}
                  onChange={(e) => {
                    if (e.target.value) handleApplyTemplate(e.target.value);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Apply Attribute Template...</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      ⚡ {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {attributes.map((a, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 36px', gap: '8px', alignItems: 'center' }}>
                    <input
                      placeholder="Attribute Name (e.g. Color)"
                      value={a.key}
                      onChange={(e) => handleAttrChange(idx, 'key', e.target.value)}
                    />
                    <input
                      placeholder="Value (e.g. Navy Blue)"
                      value={a.value}
                      onChange={(e) => handleAttrChange(idx, 'value', e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-icon-square"
                      style={{ color: '#f87171' }}
                      onClick={() => handleRemoveAttribute(idx)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: '10px', fontSize: '11px', padding: '5px 10px' }}
                onClick={handleAddAttribute}
              >
                <Plus size={12} /> Add Custom Attribute
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {product ? 'Save & Queue Sync' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
