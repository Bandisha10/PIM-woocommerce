import React from 'react';
import { Database, ShoppingBag, ArrowLeftRight, RefreshCw, Zap, AlertTriangle } from 'lucide-react';

export default function SyncBridge({
  health,
  isSyncing,
  isPulling,
  onSyncAll,
  onPullStore,
  onSimulateChange,
  pendingCount = 0,
  conflictCount = 0,
}) {
  const isSimulated = health?.channel?.is_simulated ?? true;
  const channelName = health?.channel?.name || 'WooCommerce Demo Sandbox';

  return (
    <div className="sync-bridge-card">
      <div className="bridge-nodes-container">
        {/* PIM Master Node */}
        <div className="bridge-node node-pim">
          <div className="node-icon-circle">
            <Database size={20} />
          </div>
          <div className="node-meta">
            <h4>PIM Master DB</h4>
            <p>Supabase PostgreSQL Live</p>
          </div>
        </div>

        {/* Dynamic Animated Pipeline */}
        <div className="bridge-pipeline">
          <div className={`bridge-track ${isSyncing || isPulling ? 'syncing' : ''}`}>
            {(isSyncing || isPulling) && <div className="bridge-packet" />}
          </div>

          <div className={`bridge-center-badge ${conflictCount > 0 ? 'conflict-detected' : pendingCount > 0 ? 'active' : ''}`}>
            {conflictCount > 0 ? (
              <span style={{ color: '#D97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={13} /> {conflictCount} Conflict{conflictCount > 1 ? 's' : ''} Detected
              </span>
            ) : (
              <>
                <span className="pulse-dot" />
                {isSyncing ? (
                  <span>Pushing to WooCommerce...</span>
                ) : isPulling ? (
                  <span>Pulling Remote Changes...</span>
                ) : pendingCount > 0 ? (
                  <span>{pendingCount} item{pendingCount > 1 ? 's' : ''} pending sync</span>
                ) : (
                  <span>Store & PIM in Sync</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* WooCommerce Remote Node */}
        <div className="bridge-node node-woo">
          <div className="node-icon-circle">
            <ShoppingBag size={20} />
          </div>
          <div className="node-meta">
            <h4>{channelName}</h4>
            <p>{isSimulated ? 'Simulated Woo Sandbox' : 'Live REST API v3'}</p>
          </div>
        </div>

        {/* Inline Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn-bridge-white"
            onClick={onPullStore}
            disabled={isPulling || isSyncing}
            title="Scan WooCommerce store for remote updates or customer orders"
          >
            <RefreshCw size={14} className={isPulling ? 'spin-icon' : ''} />
            {isPulling ? 'Pulling...' : 'Pull Store'}
          </button>

          <button
            className="btn-bridge-resync"
            onClick={onSyncAll}
            disabled={isSyncing}
            title={pendingCount > 0 ? "Push pending products to WooCommerce" : "Force full catalog re-sync to WooCommerce"}
          >
            <Zap size={14} />
            {isSyncing ? 'Syncing...' : pendingCount > 0 ? `Sync All (${pendingCount})` : 'Re-sync All'}
          </button>

          <button
            className="btn-bridge-simulate"
            onClick={onSimulateChange}
            title="Simulate store change (price bump / stock deduction) to test conflict detection"
          >
            <ArrowLeftRight size={14} />
            Simulate Edit
          </button>
        </div>
      </div>
    </div>
  );
}
