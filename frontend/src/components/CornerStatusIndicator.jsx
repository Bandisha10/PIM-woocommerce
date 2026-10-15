import React from 'react';
import { Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';

/**
 * CornerStatusIndicator - Sleek, non-blocking floating status indicator in the corner
 * showing "Please wait..." and sync/connection progress without freezing the user interface.
 */
export default function CornerStatusIndicator({ status, onDismiss }) {
  if (!status || !status.text) return null;

  const isPending = status.active;
  const isError = status.error;

  return (
    <div
      className="corner-status-pill"
      style={{
        position: 'fixed',
        bottom: '22px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '9px 16px',
        borderRadius: '999px',
        background: isError
          ? 'rgba(239, 68, 68, 0.94)'
          : isPending
          ? 'rgba(15, 23, 42, 0.94)'
          : 'rgba(16, 185, 129, 0.94)',
        backdropFilter: 'blur(16px)',
        border: isError
          ? '1px solid rgba(239, 68, 68, 0.5)'
          : isPending
          ? '1px solid rgba(99, 102, 241, 0.45)'
          : '1px solid rgba(16, 185, 129, 0.5)',
        boxShadow: isPending
          ? '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 16px rgba(99, 102, 241, 0.3)'
          : '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 16px rgba(16, 185, 129, 0.3)',
        color: '#ffffff',
        fontSize: '12.5px',
        fontWeight: 600,
        letterSpacing: '0.015em',
        animation: 'slideUpCorner 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      {isPending ? (
        <span style={{ display: 'flex', alignItems: 'center', color: '#818cf8' }}>
          <Loader2 size={15} className="corner-spinner" />
        </span>
      ) : isError ? (
        <span style={{ display: 'flex', alignItems: 'center', color: '#ffffff' }}>
          <AlertTriangle size={15} />
        </span>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', color: '#ffffff' }}>
          <CheckCircle2 size={15} />
        </span>
      )}

      <span style={{ color: '#ffffff', whiteSpace: 'nowrap' }}>
        {status.text}
      </span>

      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            marginLeft: '4px',
            borderRadius: '50%',
            transition: 'color 0.15s ease',
          }}
          title="Dismiss"
          aria-label="Dismiss corner indicator"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
