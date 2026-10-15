import React from 'react';
import { LogOut, ShieldCheck, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react';

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirmLogout,
  user,
  isLoggedOut,
  onReLogin
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-blur">
      <div className="modal-dialog-box logout-modal-card scale-in-bounce">
        {!isLoggedOut ? (
          <>
            <div className="logout-icon-header">
              <div className="logout-icon-circle">
                <LogOut size={26} className="text-rose-400" />
                <span className="logout-glow-ring" />
              </div>
            </div>

            <div className="logout-content-center">
              <h3 className="logout-modal-title">Sign Out of NEXUS PIM?</h3>
              <p className="logout-modal-desc">
                You are currently authenticated as{' '}
                <strong className="text-white">{user?.name || 'Alex Rivera'}</strong>{' '}
                (<span className="text-indigo-400">{user?.role || 'Catalog SuperAdmin'}</span>).
              </p>

              <div className="logout-session-info-box">
                <div className="session-item">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Cloud database state is safely saved to Supabase</span>
                </div>
                <div className="session-item">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Active WooCommerce sync queue preserved</span>
                </div>
              </div>
            </div>

            <div className="logout-actions-footer">
              <button className="btn-modal-cancel" onClick={onClose}>
                Stay Logged In
              </button>
              <button className="btn-modal-logout-confirm" onClick={onConfirmLogout}>
                <LogOut size={15} />
                <span>Yes, Sign Out</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="logout-icon-header">
              <div className="logout-icon-circle circle-success">
                <UserCheck size={28} className="text-emerald-400" />
                <span className="logout-glow-ring ring-emerald" />
              </div>
            </div>

            <div className="logout-content-center">
              <h3 className="logout-modal-title">Successfully Signed Out</h3>
              <p className="logout-modal-desc">
                Your NEXUS session has been safely closed. Click below to resume as{' '}
                <strong className="text-white">{user?.name || 'Alex Rivera'}</strong> anytime.
              </p>

              <div className="login-quick-card">
                <div className="login-avatar-row">
                  <img
                    src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                    alt="User"
                    className="quick-login-avatar"
                  />
                  <div>
                    <div className="quick-login-name">{user?.name || 'Alex Rivera'}</div>
                    <div className="quick-login-role">Single Sign-On • Master Admin</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="logout-actions-footer">
              <button className="btn-relogin-primary" onClick={onReLogin}>
                <span>Resume NEXUS Admin Session</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
