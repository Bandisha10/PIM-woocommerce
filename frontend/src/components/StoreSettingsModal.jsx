import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle2, AlertCircle, ShoppingBag, Radio, Shield, Globe } from 'lucide-react';

export default function StoreSettingsModal({
  isOpen,
  onClose,
  channels = [],
  onSaveChannel,
  onTestConnection,
}) {
  const [selectedChannelId, setSelectedChannelId] = useState(channels[0]?.id || 'store-demo');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [secret, setSecret] = useState('');
  const [isSimulated, setIsSimulated] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const c = channels.find((x) => x.id === selectedChannelId) || channels[0];
    if (c) {
      setSelectedChannelId(c.id);
      setName(c.name || '');
      setUrl(c.url || '');
      setIsSimulated(c.is_simulated ?? true);
      setTestResult(null);
    }
  }, [selectedChannelId, isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await onTestConnection({
        url,
        consumer_key: key,
        consumer_secret: secret,
        is_simulated: isSimulated,
      });
      setTestResult(res);
    } catch (err) {
      setTestResult({ ok: false, message: err.message });
    }
    setIsTesting(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveChannel(selectedChannelId, {
      id: selectedChannelId,
      name,
      url,
      consumer_key: key,
      consumer_secret: secret,
      is_simulated: isSimulated,
      is_active: true,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Settings size={18} style={{ color: '#7C3AED' }} />
            WooCommerce Store Connection & Channels
          </h3>
          <button className="btn-icon-square" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            {/* Channel Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              {channels.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`btn ${selectedChannelId === c.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  onClick={() => setSelectedChannelId(c.id)}
                >
                  {c.is_simulated ? '⚡ ' : '🌐 '}
                  {c.name}
                </button>
              ))}
            </div>

            {/* Mode Selector */}
            <div
              style={{
                background: '#FAF5FF',
                border: '1px solid #F3D5FF',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#1E1B4B' }}>
                Target Store Environment
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div
                  style={{
                    border: isSimulated ? '2px solid #A855F7' : '1px solid #F3D5FF',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    cursor: 'pointer',
                    background: isSimulated ? '#EDE9FF' : '#FFFFFF',
                  }}
                  onClick={() => setIsSimulated(true)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', color: '#1E1B4B' }}>
                    <Shield size={16} style={{ color: '#7C3AED' }} />
                    Simulated Sandbox
                  </div>
                  <p style={{ fontSize: '11px', color: '#6D28D9', marginTop: '4px' }}>
                    Instant offline store demo with full conflict generation & real-time preview. Zero setup required.
                  </p>
                </div>

                <div
                  style={{
                    border: !isSimulated ? '2px solid #EC4899' : '1px solid #F3D5FF',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    cursor: 'pointer',
                    background: !isSimulated ? '#FCE7F3' : '#FFFFFF',
                  }}
                  onClick={() => setIsSimulated(false)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', color: '#1E1B4B' }}>
                    <Globe size={16} style={{ color: '#EC4899' }} />
                    Live WooCommerce Store
                  </div>
                  <p style={{ fontSize: '11px', color: '#6D28D9', marginTop: '4px' }}>
                    Direct connection to a real WordPress WooCommerce REST API endpoint.
                  </p>
                </div>
              </div>
            </div>

            {/* Connection Inputs */}
            {!isSimulated && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-field">
                  <label>Store URL (with https://)</label>
                  <input
                    type="url"
                    placeholder="https://mystore.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required={!isSimulated}
                  />
                </div>

                <div className="form-field">
                  <label>Consumer Key</label>
                  <input
                    type="password"
                    placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    required={!isSimulated}
                  />
                </div>

                <div className="form-field">
                  <label>Consumer Secret</label>
                  <input
                    type="password"
                    placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    required={!isSimulated}
                  />
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Generate keys in WordPress: <strong>WooCommerce &gt; Settings &gt; Advanced &gt; REST API &gt; Add Key</strong> with <em>Read/Write</em> permissions.
                </div>
              </div>
            )}

            {/* Test Connection feedback */}
            {testResult && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: testResult.ok ? 'var(--success-bg)' : 'var(--danger-bg)',
                  border: `1px solid ${testResult.ok ? 'var(--success-border)' : 'var(--danger-border)'}`,
                  color: testResult.ok ? '#34d399' : '#f87171',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {testResult.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleTest}
              disabled={isTesting}
            >
              {isTesting ? 'Testing Ping...' : 'Test Connection'}
            </button>
            <button type="submit" className="btn btn-primary">
              Save Channel Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
