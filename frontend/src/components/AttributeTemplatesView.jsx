import React, { useState } from 'react';
import { Layers, Plus, Trash2, Tag, Check, Sparkles, Shirt, Headphones, Coffee, Compass } from 'lucide-react';

export default function AttributeTemplatesView({
  templates = [],
  onCreateTemplate,
  onDeleteTemplate,
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplDesc, setTplDesc] = useState('');
  const [fields, setFields] = useState([
    { key: 'Color', default: 'Midnight Black', options: 'Black, White, Gray' },
    { key: 'Size', default: 'M', options: 'S, M, L, XL' },
  ]);

  const handleAddField = () => {
    setFields([...fields, { key: '', default: '', options: '' }]);
  };

  const handleRemoveField = (idx) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const handleFieldChange = (idx, field, val) => {
    const updated = [...fields];
    updated[idx][field] = val;
    setFields(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tplName.trim()) return;

    const payload = {
      name: tplName.trim(),
      description: tplDesc.trim(),
      icon: 'Layers',
      fields: fields
        .filter((f) => f.key.trim())
        .map((f) => ({
          key: f.key.trim(),
          default: f.default.trim(),
          options: f.options
            ? f.options.split(',').map((o) => o.trim()).filter(Boolean)
            : [],
        })),
    };

    await onCreateTemplate(payload);
    setShowCreateModal(false);
    setTplName('');
    setTplDesc('');
    setFields([{ key: 'Color', default: 'Black', options: 'Black, White' }]);
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Shirt': return <Shirt size={20} />;
      case 'Headphones': return <Headphones size={20} />;
      case 'Coffee': return <Coffee size={20} />;
      case 'Compass': return <Compass size={20} />;
      default: return <Layers size={20} />;
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E1B4B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} style={{ color: '#7C3AED' }} />
            Attribute Schema Templates
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Standardize your catalog attributes across products and seamlessly map them to WooCommerce variation attributes.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={15} /> Create Template
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {templates.map((t) => (
          <div
            key={t.id}
            style={{
              background: '#FFFFFF',
              border: '1px solid #F3D5FF',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 14px rgba(168, 85, 247, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    background: '#EDE9FF',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getIcon(t.icon)}
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1E1B4B' }}>{t.name}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.description}</p>
                </div>
              </div>

              {t.id.startsWith('tpl-custom') && (
                <button
                  className="btn-icon-square"
                  onClick={() => onDeleteTemplate(t.id)}
                  style={{ color: '#BE185D' }}
                  title="Delete Template"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div style={{ marginTop: '8px', flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#6D28D9', marginBottom: '8px' }}>
                Included Attributes ({t.fields?.length || 0}):
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(t.fields || []).map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#FAF5FF',
                      border: '1px solid #F3D5FF',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12.5px',
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#1E1B4B' }}>{f.key}</span>
                    <span style={{ color: '#6D28D9', fontSize: '11.5px' }}>
                      default: <strong style={{ color: '#7C3AED' }}>{f.default}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                1-Click Apply in Product Editor
              </span>
              <span className="status-pill synced" style={{ fontSize: '10px' }}>
                Woo Ready
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Attribute Template</h3>
              <button className="btn-icon-square" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Template Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Footwear & Shoes"
                    value={tplName}
                    onChange={(e) => setTplName(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Shoe sizing, upper material, sole type"
                    value={tplDesc}
                    onChange={(e) => setTplDesc(e.target.value)}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Attribute Fields
                    </label>
                    <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={handleAddField}>
                      <Plus size={12} /> Add Field
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {fields.map((f, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 2fr 36px', gap: '8px', alignItems: 'center' }}>
                        <input
                          placeholder="Attribute Name (e.g. Size)"
                          value={f.key}
                          onChange={(e) => handleFieldChange(idx, 'key', e.target.value)}
                          required
                        />
                        <input
                          placeholder="Default Value"
                          value={f.default}
                          onChange={(e) => handleFieldChange(idx, 'default', e.target.value)}
                        />
                        <input
                          placeholder="Options (comma separated)"
                          value={f.options}
                          onChange={(e) => handleFieldChange(idx, 'options', e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn-icon-square"
                          style={{ color: '#f87171' }}
                          onClick={() => handleRemoveField(idx)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
