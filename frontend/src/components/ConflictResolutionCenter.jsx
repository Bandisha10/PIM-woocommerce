import React from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, Database, ShoppingBag, ArrowLeftRight } from 'lucide-react';

export default function ConflictResolutionCenter({
  conflicts = [],
  onResolve,
  onSimulateChange,
}) {
  if (conflicts.length === 0) {
    return (
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-dim)',
          borderRadius: 'var(--radius-lg)',
          padding: '60px 24px',
          textAlign: 'center',
          maxWidth: '640px',
          margin: '30px auto',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#D1FAE5',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <ShieldCheck size={32} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E1B4B', marginBottom: '6px' }}>
          Zero Conflicts Detected
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
          All products in your PIM database and WooCommerce store are in complete harmony. When an external change is made on both sides simultaneously, it will appear here with an interactive field-level diff.
        </p>
        <button className="btn btn-warning" onClick={() => onSimulateChange()}>
          <ArrowLeftRight size={15} />
          Simulate a Conflict for Demo
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          background: '#FEF3C7',
          border: '1px solid #FDE68A',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} style={{ color: '#D97706' }} />
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#78350F' }}>
              {conflicts.length} Two-Way Sync Conflict{conflicts.length > 1 ? 's' : ''} Require Attention
            </h4>
            <p style={{ fontSize: '12px', color: '#92400E' }}>
              These products were modified in the PIM database AND altered externally in the WooCommerce store. Choose which version to preserve.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {conflicts.map((p) => {
          const snap = p.woo_snapshot || {};
          const isPriceDiff = Number(p.price) !== Number(snap.price || snap.regular_price);
          const isStockDiff = Number(p.stock) !== Number(snap.stock);
          const isNameDiff = p.name !== snap.name;

          return (
            <div
              key={p.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-highlight)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {/* Conflict Item Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '14px',
                  borderBottom: '1px solid var(--border-dim)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="product-emoji-fallback" style={{ width: '42px', height: '42px', fontSize: '20px' }}>
                    {p.emoji || '📦'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{p.name}</h4>
                    <span className="sku-badge">SKU: {p.sku}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => onResolve(p.id, 'pim')}
                    title="Keep PIM values and overwrite store on next sync"
                  >
                    <Database size={14} /> Keep PIM Version
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={() => onResolve(p.id, 'woo')}
                    title="Accept WooCommerce values and update PIM database"
                  >
                    <ShoppingBag size={14} /> Accept WooCommerce Version
                  </button>
                </div>
              </div>

              {/* Visual Diff Table */}
              <table className="diff-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Field Name</th>
                    <th style={{ width: '35%' }}>PIM Master (Local)</th>
                    <th style={{ width: '35%' }}>WooCommerce (Remote Store)</th>
                    <th style={{ width: '15%' }}>Divergence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Product Name</strong></td>
                    <td className="diff-val-pim">{p.name}</td>
                    <td className="diff-val-woo">{snap.name || '(Not set)'}</td>
                    <td>
                      {isNameDiff ? (
                        <span className="status-pill conflict" style={{ fontSize: '10px' }}>Differs</span>
                      ) : (
                        <span className="status-pill synced" style={{ fontSize: '10px' }}>Match</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td><strong>Regular Price</strong></td>
                    <td className="diff-val-pim">${Number(p.price).toFixed(2)}</td>
                    <td className="diff-val-woo">${Number(snap.regular_price || snap.price || 0).toFixed(2)}</td>
                    <td>
                      {isPriceDiff ? (
                        <span className="status-pill conflict" style={{ fontSize: '10px' }}>
                          Δ ${(Number(p.price) - Number(snap.regular_price || snap.price || 0)).toFixed(2)}
                        </span>
                      ) : (
                        <span className="status-pill synced" style={{ fontSize: '10px' }}>Match</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td><strong>Inventory Level</strong></td>
                    <td className="diff-val-pim">{p.stock} units</td>
                    <td className="diff-val-woo">{snap.stock ?? 0} units</td>
                    <td>
                      {isStockDiff ? (
                        <span className="status-pill conflict" style={{ fontSize: '10px' }}>
                          Δ {Number(p.stock) - Number(snap.stock ?? 0)} units
                        </span>
                      ) : (
                        <span className="status-pill synced" style={{ fontSize: '10px' }}>Match</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td><strong>Category</strong></td>
                    <td className="diff-val-pim">{p.category}</td>
                    <td className="diff-val-woo">{snap.category || 'General'}</td>
                    <td>
                      <span className="status-pill synced" style={{ fontSize: '10px' }}>Match</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
