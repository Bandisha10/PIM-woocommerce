import React, { useState, useMemo } from 'react';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  Database,
  Tag,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCode,
  ShieldCheck,
  Radio,
  Zap,
} from 'lucide-react';

export default function ActivityLogView({
  activity = [],
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [isAutoLive, setIsAutoLive] = useState(true);

  // Time formatter helper
  const formatTimeAgo = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp;
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return timestamp;
    }
  };

  const formatExactTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp;
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return timestamp;
    }
  };

  // Filtered and searched logs
  const filteredActivity = useMemo(() => {
    return activity.filter((item) => {
      // Filter by category
      if (selectedFilter === 'sync' && item.action !== 'sync') return false;
      if (selectedFilter === 'pull' && item.action !== 'pull') return false;
      if (selectedFilter === 'conflict' && item.action !== 'conflict' && item.status !== 'warning') return false;
      if (selectedFilter === 'catalog' && !['create', 'update', 'delete', 'resolve'].includes(item.action)) return false;

      // Filter by search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const msg = (item.message || '').toLowerCase();
        const sku = (item.sku || '').toLowerCase();
        const act = (item.action || '').toLowerCase();
        return msg.includes(q) || sku.includes(q) || act.includes(q);
      }
      return true;
    });
  }, [activity, selectedFilter, searchTerm]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = activity.length;
    const syncs = activity.filter((a) => a.action === 'sync').length;
    const conflicts = activity.filter((a) => a.action === 'conflict' || a.status === 'warning').length;
    const successCount = activity.filter((a) => a.status === 'success').length;
    const rate = total > 0 ? Math.round((successCount / total) * 100) : 100;
    return { total, syncs, conflicts, rate };
  }, [activity]);

  // Download Audit Trail as CSV
  const handleExportCSV = () => {
    if (activity.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Action', 'SKU', 'Status', 'Message'];
    const rows = activity.map((item) => [
      item.id,
      item.timestamp,
      item.action,
      item.sku || '',
      item.status,
      `"${(item.message || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexus_pim_audit_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for timeline badges and node icons
  const getEventBadge = (action, status) => {
    switch (action) {
      case 'sync':
        return {
          label: 'PIM ➔ WOOCOMMERCE',
          icon: <ArrowUpRight size={14} />,
          color: '#7C3AED',
          bg: '#EDE9FF',
          border: '#DDD6FE',
        };
      case 'pull':
        return {
          label: 'WOOCOMMERCE ➔ PIM',
          icon: <ArrowDownLeft size={14} />,
          color: '#059669',
          bg: '#D1FAE5',
          border: '#A7F3D0',
        };
      case 'conflict':
        return {
          label: 'STORE CONFLICT',
          icon: <AlertTriangle size={14} />,
          color: '#D97706',
          bg: '#FEF3C7',
          border: '#FDE68A',
        };
      case 'resolve':
        return {
          label: 'CONFLICT RESOLVED',
          icon: <CheckCircle2 size={14} />,
          color: '#7C3AED',
          bg: '#EDE9FF',
          border: '#DDD6FE',
        };
      case 'create':
        return {
          label: 'CATALOG CREATE',
          icon: <Sparkles size={14} />,
          color: '#BE185D',
          bg: '#FCE7F3',
          border: '#FBCFE8',
        };
      case 'update':
        return {
          label: 'RECORD MUTATION',
          icon: <Database size={14} />,
          color: '#6D28D9',
          bg: '#FAF5FF',
          border: '#F3D5FF',
        };
      default:
        return {
          label: (action || 'SYSTEM').toUpperCase(),
          icon: <Info size={14} />,
          color: '#6D28D9',
          bg: '#FAF5FF',
          border: '#F3D5FF',
        };
    }
  };

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Banner: Metric Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3D5FF',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 4px 14px rgba(168, 85, 247, 0.06)',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#EDE9FF',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <History size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Audited Events
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1E1B4B', marginTop: '2px' }}>
              {stats.total}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3D5FF',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 4px 14px rgba(168, 85, 247, 0.06)',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#D1FAE5',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Sync Health
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
              {stats.rate}%
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3D5FF',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 4px 14px rgba(168, 85, 247, 0.06)',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: stats.conflicts > 0 ? '#FEF3C7' : '#FAF5FF',
              color: stats.conflicts > 0 ? '#D97706' : '#6D28D9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Conflict Alerts
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: stats.conflicts > 0 ? '#D97706' : '#1E1B4B', marginTop: '2px' }}>
              {stats.conflicts}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #F3D5FF',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 4px 14px rgba(168, 85, 247, 0.06)',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#EDE9FF',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Radio size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Sync Channel
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E1B4B', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulse-dot" style={{ width: '7px', height: '7px' }} />
              WooCommerce REST v3
            </div>
          </div>
        </div>
      </div>

      {/* Main Card with Toolbar & Timeline */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-dim)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Header & Controls Toolbar */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-dim)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <History size={20} style={{ color: '#818cf8' }} />
                NEXUS Audit & Event Ledger
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Immutable, real-time audit trail tracking all PIM product mutations, bidirectional store synchronizations, and conflict resolutions.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn btn-secondary"
                onClick={handleExportCSV}
                title="Export audit log to CSV"
                style={{ fontSize: '12px', padding: '7px 12px' }}
              >
                <Download size={14} /> Export CSV
              </button>
              <button
                className="btn btn-secondary"
                onClick={onRefresh}
                title="Refresh log stream"
                style={{ fontSize: '12px', padding: '7px 12px' }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* Search & Filter Chips Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
            {/* Filter Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Events', count: stats.total },
                { id: 'sync', label: 'Push (PIM ➔ Woo)', count: stats.syncs },
                { id: 'conflict', label: 'Conflicts', count: stats.conflicts },
                { id: 'catalog', label: 'Catalog Edits', count: activity.filter((a) => ['create', 'update', 'delete', 'resolve'].includes(a.action)).length },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setSelectedFilter(chip.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    border: selectedFilter === chip.id ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: selectedFilter === chip.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: selectedFilter === chip.id ? '#ffffff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{chip.label}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '999px',
                      background: selectedFilter === chip.id ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                    }}
                  >
                    {chip.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '260px' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Filter by SKU, title, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 34px',
                  fontSize: '12.5px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-dim)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Timeline Event List */}
        <div style={{ padding: '8px 0' }}>
          {filteredActivity.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <History size={40} style={{ color: 'var(--text-dim)', opacity: 0.4, marginBottom: '12px' }} />
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
                No Activity Records Found
              </h4>
              <p style={{ fontSize: '13px', maxWidth: '360px', margin: '0 auto 18px' }}>
                {searchTerm || selectedFilter !== 'all'
                  ? 'No events match your current filter parameters. Try clearing the filter or search query.'
                  : 'No catalog or sync events have been recorded yet. Modify a product or run a sync to generate audit records.'}
              </p>
              {(searchTerm || selectedFilter !== 'all') && (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedFilter('all');
                  }}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            filteredActivity.map((item, idx) => {
              const badge = getEventBadge(item.action, item.status);
              const isExpanded = expandedId === (item.id || idx);

              return (
                <div
                  key={item.id || idx}
                  style={{
                    borderBottom: idx !== filteredActivity.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                    transition: 'background 0.15s ease',
                  }}
                  className="audit-row"
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      padding: '16px 24px',
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : (item.id || idx))}
                  >
                    {/* Event Icon Node */}
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        color: badge.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                        boxShadow: `0 0 12px ${badge.bg}`,
                      }}
                    >
                      {badge.icon}
                    </div>

                    {/* Event Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {badge.label}
                        </span>

                        {item.sku && (
                          <span
                            className="sku-badge"
                            style={{
                              fontSize: '11px',
                              fontFamily: 'var(--font-mono)',
                              background: 'rgba(255, 255, 255, 0.07)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                            }}
                          >
                            {item.sku}
                          </span>
                        )}

                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            background:
                              item.status === 'success'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : item.status === 'warning'
                                ? 'rgba(245, 158, 11, 0.15)'
                                : 'rgba(59, 130, 246, 0.15)',
                            color:
                              item.status === 'success'
                                ? '#34d399'
                                : item.status === 'warning'
                                ? '#fbbf24'
                                : '#60a5fa',
                          }}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: '13.5px',
                          color: '#f8fafc',
                          fontWeight: 500,
                          lineHeight: 1.45,
                        }}
                      >
                        {item.message}
                      </div>
                    </div>

                    {/* Timestamp & Expand indicator */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '4px',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>
                        {formatTimeAgo(item.timestamp)}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-dim)',
                        }}
                      >
                        {formatExactTime(item.timestamp)}
                      </span>
                      <div style={{ color: 'var(--text-dim)', marginTop: '4px' }}>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Technical Audit Inspector Drawer */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '14px 24px 18px 78px',
                        background: 'rgba(10, 16, 31, 0.6)',
                        borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '12px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '10.5px' }}>Event Target Channel</span>
                          <span style={{ fontWeight: 600, color: '#f8fafc' }}>{item.channel_id || 'WooCommerce Demo Store'}</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '10.5px' }}>Trigger / Actor</span>
                          <span style={{ fontWeight: 600, color: '#f8fafc' }}>Alex Rivera (PIM SuperAdmin)</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '10.5px' }}>Audit Event Record ID</span>
                          <span style={{ fontWeight: 600, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>EVT-LOG-#{item.id || idx + 100}</span>
                        </div>
                      </div>

                      {/* Raw Audit Payload */}
                      <div
                        style={{
                          background: 'rgba(2, 6, 23, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '6px',
                          padding: '10px 14px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: '#94a3b8',
                          overflowX: 'auto',
                        }}
                      >
                        <div style={{ color: '#818cf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileCode size={12} /> Sync Event Metadata Payload:
                        </div>
                        <pre style={{ margin: 0 }}>
                          {JSON.stringify(
                            {
                              id: item.id || idx,
                              timestamp: item.timestamp,
                              action: item.action,
                              sku: item.sku || null,
                              status: item.status,
                              origin: 'NEXUS_PIM_REST_API',
                              destination: 'WOOCOMMERCE_WP_JSON_V3',
                              verified: true,
                            },
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
