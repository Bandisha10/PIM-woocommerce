import React, { useState } from 'react';
import { UploadCloud, FileText, Check, AlertCircle, Download, Sparkles } from 'lucide-react';

const SAMPLE_CSV = `Name,SKU,Price,Stock,Category,Attributes
Merino Wool Base Layer,APL-WOL-110,68.00,45,Outerwear,Color=Charcoal;Size=L;Material=Merino
Espresso Scale with Timer,KTC-SCL-215,55.00,30,Kitchen & Dining,Color=Matte Black;Accuracy=0.1g;Battery=USB-C
Tactical EDC Flashlight,EDC-LGT-440,39.00,80,Everyday Carry,Lumens=1200;Beam=200m;Waterproof=IPX8
Noise Isolating Earbuds,AUD-BUD-602,79.00,25,Audio & Tech,Color=White;Battery=28h;NoiseCancelling=Active`;

export default function BulkImportModal({
  isOpen,
  onClose,
  onImport,
}) {
  const [csvText, setCsvText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvText(evt.target?.result || '');
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setCsvText(SAMPLE_CSV);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!csvText.trim()) return;
    setIsSubmitting(true);
    await onImport(csvText.trim());
    setIsSubmitting(false);
    onClose();
  };

  // Quick preview of parsed rows
  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  const previewRows = lines.slice(0, 5).map((l) => l.split(','));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <UploadCloud size={18} style={{ color: '#7C3AED' }} />
            Bulk CSV Product Import
          </h3>
          <button className="btn-icon-square" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Upload or paste a standard CSV catalog file. Columns: <code>Name, SKU, Price, Stock, Category, Attributes</code>
              </p>
              <button
                type="button"
                className="btn btn-outline-primary"
                style={{ fontSize: '12px', padding: '4px 10px' }}
                onClick={handleLoadSample}
              >
                <Sparkles size={13} /> Load Sample CSV
              </button>
            </div>

            {/* File dropzone / file input */}
            <div
              style={{
                border: '2px dashed var(--border-dim)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                textAlign: 'center',
                background: '#FAF5FF',
              }}
            >
              <input
                type="file"
                id="csvFile"
                accept=".csv,text/csv"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <label htmlFor="csvFile" style={{ cursor: 'pointer', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <FileText size={32} style={{ color: '#7C3AED' }} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Click to browse or drag & drop CSV file</span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Supports UTF-8 encoded CSV</span>
              </label>
            </div>

            {/* CSV Raw Text Area */}
            <div className="form-field">
              <label>CSV Content (Editable Raw Data)</label>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Name,SKU,Price,Stock,Category,Attributes..."
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              />
            </div>

            {/* Preview snippet */}
            {previewRows.length > 1 && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Parsed Preview (First {previewRows.length - 1} items):
                </label>
                <div style={{ maxHeight: '140px', overflowY: 'auto', marginTop: '6px', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-md)' }}>
                  <table className="custom-table" style={{ fontSize: '12px' }}>
                    <tbody>
                      {previewRows.map((r, i) => (
                        <tr key={i} style={i === 0 ? { background: '#FAF5FF', fontWeight: 700 } : {}}>
                          {r.slice(0, 5).map((col, j) => (
                            <td key={j} style={{ padding: '6px 10px' }}>{col}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!csvText.trim() || isSubmitting}>
              {isSubmitting ? 'Importing...' : 'Import to PIM Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
