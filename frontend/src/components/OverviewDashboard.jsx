import React, { useState, useEffect } from 'react';
import {
  Package, CheckCircle2, Clock, AlertTriangle, PieChart,
  Activity, BarChart3, Sparkles, Database, ArrowUpRight,
  ArrowDownLeft, Plus, Zap, Sliders, Settings
} from 'lucide-react';

function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(target, 10) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }
    const stepTime = Math.max(Math.floor(duration / end), 20);
    const timer = setInterval(() => {
      start += Math.ceil(end / (duration / stepTime));
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

export default function OverviewDashboard({
  products = [],
  activity = [],
  onNavigate,
  onNewProduct,
}) {
  const totalCount = products.length;
  const syncedCount = products.filter((p) => p.status === 'synced').length;
  const pendingCount = products.filter((p) => p.status === 'pending').length;
  const conflictCount = products.filter((p) => p.status === 'conflict').length;

  // Completeness score average
  const avgCompleteness = totalCount > 0
    ? Math.round(
        products.reduce((acc, p) => {
          let score = 0;
          if (p.name) score += 20;
          if (p.price > 0) score += 20;
          if (p.image_url) score += 20;
          if (p.attributes && Object.keys(p.attributes).length > 0) score += 20;
          if (p.short_description || p.description) score += 20;
          return acc + score;
        }, 0) / totalCount
      )
    : 0;

  // Distribution buckets
  const compHigh = products.filter((p) => {
    let s = 0;
    if (p.name) s += 20;
    if (p.price > 0) s += 20;
    if (p.image_url) s += 20;
    if (p.attributes && Object.keys(p.attributes).length > 0) s += 20;
    if (p.short_description || p.description) s += 20;
    return s >= 75;
  }).length;

  const compMid = products.filter((p) => {
    let s = 0;
    if (p.name) s += 20;
    if (p.price > 0) s += 20;
    if (p.image_url) s += 20;
    if (p.attributes && Object.keys(p.attributes).length > 0) s += 20;
    if (p.short_description || p.description) s += 20;
    return s >= 40 && s < 75;
  }).length;

  const compLow = totalCount - compHigh - compMid;

  const pctHigh = totalCount > 0 ? Math.round((compHigh / totalCount) * 100) : 0;
  const pctMid = totalCount > 0 ? Math.round((compMid / totalCount) * 100) : 0;
  const pctLow = totalCount > 0 ? Math.round((compLow / totalCount) * 100) : 0;

  // Count up animated values
  const animatedTotal = useCountUp(totalCount);
  const animatedSynced = useCountUp(syncedCount);
  const animatedPending = useCountUp(pendingCount);
  const animatedConflict = useCountUp(conflictCount);
  const animatedHealth = useCountUp(avgCompleteness);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top 5 Metric Cards */}
      <div className="overview-metrics-grid">
        {/* Card 1: Total */}
        <div
          className="metric-card cursor-pointer"
          onClick={() => onNavigate('catalog')}
          title="Click to view Master Catalog"
        >
          <div className="metric-icon-wrap">
            <Package size={22} />
          </div>
          <div className="metric-info">
            <h5>Total Products</h5>
            <div className="metric-num">{animatedTotal}</div>
            <p className="metric-sub-link">Click to view Catalog &rarr;</p>
          </div>
        </div>

        {/* Card 2: Synced */}
        <div
          className="metric-card cursor-pointer"
          onClick={() => onNavigate('catalog')}
          title="Click to view Synced items"
        >
          <div className="metric-icon-wrap">
            <CheckCircle2 size={22} />
          </div>
          <div className="metric-info">
            <h5>Synced to Store</h5>
            <div className="metric-num">{animatedSynced}</div>
            <div className="metric-pill-success">
              <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
              <span>Live in WooCommerce</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending */}
        <div
          className="metric-card cursor-pointer"
          onClick={() => onNavigate('catalog')}
          title="Click to view Pending items"
        >
          <div className="metric-icon-wrap">
            <Clock size={22} />
          </div>
          <div className="metric-info">
            <h5>Pending Sync</h5>
            <div className="metric-num">{animatedPending}</div>
            <p className="metric-sub-muted">Local changes queued</p>
          </div>
        </div>

        {/* Card 4: Conflicts */}
        <div
          className="metric-card cursor-pointer"
          onClick={() => onNavigate('conflicts')}
          title="Click to open Conflict Center"
        >
          <div className="metric-icon-wrap">
            <AlertTriangle size={22} />
          </div>
          <div className="metric-info">
            <h5>Conflicts</h5>
            <div className="metric-num">{animatedConflict}</div>
            <div className="metric-pill-warning">
              <AlertTriangle size={11} />
              <span>Requires attention & fix</span>
            </div>
          </div>
        </div>

        {/* Card 5: Health Score */}
        <div
          className="metric-card cursor-pointer"
          onClick={() => onNavigate('catalog')}
          title="Click to view Catalog Health"
        >
          <div className="metric-icon-wrap">
            <PieChart size={22} />
          </div>
          <div className="metric-info">
            <h5>Catalog Health</h5>
            <div className="metric-num">{animatedHealth}%</div>
            <div className="health-bar-track">
              <div
                className="health-bar-fill"
                style={{
                  width: `${avgCompleteness}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Section */}
      <div className="overview-two-col-grid">
        {/* Left Column: Recent Activity Feed */}
        <div className="overview-panel-card">
          <div className="overview-panel-header">
            <h3 className="overview-panel-title">
              <Activity size={18} style={{ color: '#7C3AED' }} />
              Recent Channel Activity
            </h3>
            <button
              className="pill-btn-purple"
              onClick={() => onNavigate('activity')}
            >
              View Full Log &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activity.slice(0, 5).map((log, i) => {
              const isConflict = log.action === 'conflict' || log.status === 'warning';
              const isSync = log.action === 'sync';
              return (
                <div
                  key={log.id || i}
                  className={`activity-feed-row ${isConflict ? 'row-warning' : isSync ? 'row-success' : 'row-info'}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <span className="activity-icon-bubble">
                      {isConflict ? (
                        <AlertTriangle size={15} />
                      ) : isSync ? (
                        <ArrowUpRight size={15} />
                      ) : (
                        <ArrowDownLeft size={15} />
                      )}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div className="activity-row-message">
                        {log.message}
                      </div>
                      <div className="activity-row-meta">
                        {log.sku && (
                          <span className="sku-badge-light">
                            {log.sku}
                          </span>
                        )}
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`status-pill ${log.status === 'success' ? 'synced' : log.status === 'warning' ? 'conflict' : 'pending'}`}>
                    {log.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Completeness Distribution & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Completeness Distribution */}
          <div className="overview-panel-card">
            <h3 className="overview-panel-title" style={{ marginBottom: '16px' }}>
              <BarChart3 size={18} style={{ color: '#7C3AED' }} />
              Completeness Distribution
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  <span style={{ color: '#059669', fontWeight: 700 }}>High Health (75% - 100%)</span>
                  <span style={{ color: '#6D28D9', fontWeight: 700 }}>{compHigh} items ({pctHigh}%)</span>
                </div>
                <div className="distribution-bar-track">
                  <div style={{ width: `${pctHigh}%`, height: '100%', background: '#10B981', borderRadius: '999px', transition: 'width 0.8s ease' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  <span style={{ color: '#D97706', fontWeight: 700 }}>Medium (40% - 74%)</span>
                  <span style={{ color: '#6D28D9', fontWeight: 700 }}>{compMid} items ({pctMid}%)</span>
                </div>
                <div className="distribution-bar-track">
                  <div style={{ width: `${pctMid}%`, height: '100%', background: '#F59E0B', borderRadius: '999px', transition: 'width 0.8s ease' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                  <span style={{ color: '#BE185D', fontWeight: 700 }}>Incomplete (&lt; 40%)</span>
                  <span style={{ color: '#6D28D9', fontWeight: 700 }}>{compLow} items ({pctLow}%)</span>
                </div>
                <div className="distribution-bar-track">
                  <div style={{ width: `${pctLow}%`, height: '100%', background: '#EC4899', borderRadius: '999px', transition: 'width 0.8s ease' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Launchpad */}
          <div className="overview-quick-actions-card">
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1E1B4B', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sparkles size={16} style={{ color: '#EC4899' }} /> Quick Actions
            </h4>
            <p style={{ fontSize: '12px', color: '#6D28D9', marginBottom: '16px' }}>
              Fast shortcuts to orchestrate your catalog and WooCommerce channel.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                className="btn-quick-pink"
                onClick={() => onNavigate('catalog')}
              >
                <Package size={15} /> Open Catalog
              </button>
              <button
                className="btn-quick-pink-warning"
                onClick={() => onNavigate('conflicts')}
              >
                <AlertTriangle size={15} /> Conflict Center
              </button>
              <button
                className="btn-quick-purple"
                onClick={() => onNavigate('templates')}
              >
                <Sliders size={15} /> Attribute Sets
              </button>
              <button
                className="btn-quick-gradient"
                onClick={onNewProduct}
              >
                <Plus size={15} /> New Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
