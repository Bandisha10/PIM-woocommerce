import React, { useState } from 'react';
import {
  User, ShieldCheck, Mail, Key, Bell, Database, ShoppingBag,
  Check, Copy, Sparkles, X, RefreshCw, Smartphone, Laptop
} from 'lucide-react';
import confetti from 'canvas-confetti';

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&auto=format&fit=crop&q=80",
];

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) {
  const [name, setName] = useState(user?.name || 'Alex Rivera');
  const [email, setEmail] = useState(user?.email || 'alex.rivera@nexus-pim.io');
  const [role, setRole] = useState(user?.role || 'Catalog SuperAdmin');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATAR_PRESETS[0]);
  const [apiKey, setApiKey] = useState('nexus_live_sk_948f2a1b7c3d4e5f6a8b9c0d');
  const [isCopied, setIsCopied] = useState(false);

  // Preference Toggles
  const [notifyConflict, setNotifyConflict] = useState(true);
  const [notifySyncFailure, setNotifySyncFailure] = useState(true);
  const [autoSyncCron, setAutoSyncCron] = useState(true);
  const [confettiEnabled, setConfettiEnabled] = useState(true);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(apiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleGenerateKey = () => {
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setApiKey(`nexus_live_sk_${randomHex}`);
  };

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateUser({
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      avatar: selectedAvatar,
      preferences: {
        notifyConflict,
        notifySyncFailure,
        autoSyncCron,
        confettiEnabled,
      },
    });
    if (confettiEnabled) {
      confetti({ particleCount: 50, spread: 60 });
    }
    onClose();
  };

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="profile-modal-card scale-in-bounce" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="profile-modal-header">
          <div className="profile-header-title-box">
            <div className="profile-modal-badge-icon">
              <User size={20} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="profile-modal-heading">Account & NEXUS Profile</h3>
              <p className="profile-modal-subheading">Manage personal identity, credentials, and real-time sync permissions</p>
            </div>
          </div>
          <button className="profile-modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="profile-modal-form">
          <div className="profile-modal-body custom-scrollbar">
            {/* Avatar Selector Section */}
            <div className="profile-section-card">
              <label className="section-micro-label">Admin Avatar & Profile Photo</label>
              <div className="avatar-picker-row">
                <div className="avatar-preview-wrapper">
                  <img src={selectedAvatar} alt="Current Avatar" className="current-avatar-preview" />
                  <span className="avatar-online-indicator" />
                </div>
                <div className="avatar-options-grid">
                  <span className="text-xs text-slate-400 font-medium mb-1.5 block">Choose avatar preset:</span>
                  <div className="avatar-thumbnails-flex">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`avatar-thumb-btn ${selectedAvatar === preset ? 'selected' : ''}`}
                        onClick={() => setSelectedAvatar(preset)}
                      >
                        <img src={preset} alt={`Preset ${idx + 1}`} />
                        {selectedAvatar === preset && <span className="avatar-check-icon"><Check size={10} /></span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="profile-section-card">
              <label className="section-micro-label">Identity Information</label>
              <div className="profile-form-grid">
                <div className="profile-input-group">
                  <label className="input-field-label">Full Name</label>
                  <div className="input-with-icon">
                    <User size={15} className="field-icon" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="profile-text-input"
                      placeholder="e.g. Alex Rivera"
                    />
                  </div>
                </div>

                <div className="profile-input-group">
                  <label className="input-field-label">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={15} className="field-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="profile-text-input"
                      placeholder="admin@company.com"
                    />
                  </div>
                </div>
              </div>

              <div className="profile-input-group mt-3">
                <label className="input-field-label">System Role & Permissions Level</label>
                <div className="input-with-icon">
                  <ShieldCheck size={15} className="field-icon text-indigo-400" />
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className="profile-text-input"
                    placeholder="e.g. Catalog SuperAdmin"
                  />
                </div>
              </div>

              {/* Verified Permissions Badges */}
              <div className="permissions-badge-list mt-3">
                <span className="perm-badge"><Check size={11} /> WooCommerce REST Push/Pull</span>
                <span className="perm-badge"><Check size={11} /> Supabase PostgreSQL R/W</span>
                <span className="perm-badge"><Check size={11} /> Conflict Resolution</span>
                <span className="perm-badge"><Check size={11} /> Schema Manager</span>
              </div>
            </div>

            {/* API Personal Access Token */}
            <div className="profile-section-card">
              <div className="flex items-center justify-between mb-2">
                <label className="section-micro-label !mb-0">NEXUS REST API Personal Token</label>
                <button
                  type="button"
                  className="btn-text-action"
                  onClick={handleGenerateKey}
                  title="Generate New API Key"
                >
                  <RefreshCw size={12} /> Regenerate
                </button>
              </div>
              <div className="api-key-box">
                <Key size={14} className="text-amber-400 flex-shrink-0" />
                <code className="api-key-display font-mono">{apiKey}</code>
                <button
                  type="button"
                  className={`btn-copy-key ${isCopied ? 'copied' : ''}`}
                  onClick={handleCopyKey}
                  title="Copy API Token"
                >
                  {isCopied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Use this token to authenticate external WordPress webhooks or automated inventory pipelines.
              </p>
            </div>

            {/* Notification & Sync Preferences */}
            <div className="profile-section-card">
              <label className="section-micro-label">Automation & Notification Preferences</label>
              <div className="toggles-list">
                <label className="toggle-row">
                  <div>
                    <div className="toggle-label">Alert on Two-Way WooCommerce Conflicts</div>
                    <div className="toggle-desc">Trigger notification when store and PIM diverge</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyConflict}
                    onChange={(e) => setNotifyConflict(e.target.checked)}
                    className="toggle-checkbox"
                  />
                </label>

                <label className="toggle-row">
                  <div>
                    <div className="toggle-label">Webhook Sync Failure Warnings</div>
                    <div className="toggle-desc">Send alert if WooCommerce rejects product payloads</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifySyncFailure}
                    onChange={(e) => setNotifySyncFailure(e.target.checked)}
                    className="toggle-checkbox"
                  />
                </label>

                <label className="toggle-row">
                  <div>
                    <div className="toggle-label">Confetti & Visual Haptics on Sync</div>
                    <div className="toggle-desc">Celebratory UI effects when master sync completes</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={confettiEnabled}
                    onChange={(e) => setConfettiEnabled(e.target.checked)}
                    className="toggle-checkbox"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="profile-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Sparkles size={15} /> Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
