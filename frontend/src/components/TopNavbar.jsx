import React, { useState, useRef, useEffect } from 'react';
import {
  Bell, Search, UploadCloud, Settings, Plus, RefreshCw,
  LogOut, ShieldCheck, Database, CheckCircle2, AlertTriangle,
  Sparkles, ExternalLink, User, ChevronDown, Check, ArrowDownToLine,
  Sliders, X
} from 'lucide-react';

export default function TopNavbar({
  activeTab,
  onNewProduct,
  onOpenBulkImport,
  onOpenSettings,
  onSyncAll,
  onPullStore,
  isSyncing,
  isPulling,
  pendingCount = 0,
  conflictCount = 0,
  user,
  onLogoutClick,
  searchQuery,
  setSearchQuery,
  notifications = [],
  onMarkNotificationsRead,
  onClearNotifications,
  onOpenProfile,
}) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const tabLabels = {
    overview: { title: 'System Overview', sub: 'Single source of truth metrics & analytics' },
    catalog: { title: 'Product Catalog', sub: 'Multi-attribute master product directory' },
    conflicts: { title: 'Conflict Resolution Center', sub: 'Two-way difference detection & 1-click resolution' },
    templates: { title: 'Attribute Schemas', sub: 'Dynamic specifications & custom attribute templates' },
    activity: { title: 'Sync Activity Log', sub: 'Full audit history of push, pull & sync events' },
  };

  const currentTabInfo = tabLabels[activeTab] || { title: 'PIM Console', sub: 'WooCommerce Integration' };

  return (
    <header className="pim-top-navbar">
      {/* Left: Breadcrumbs & Page Title */}
      <div className="navbar-title-block">
        <div className="navbar-breadcrumb">
          <span className="crumb-root">NEXUS Core</span>
          <span className="crumb-sep">/</span>
          <span className="crumb-active">{currentTabInfo.title}</span>
        </div>
        <h1 className="navbar-current-heading">{currentTabInfo.title}</h1>
      </div>

      {/* Center: Global Search Bar */}
      <div className="navbar-search-wrapper">
        <Search size={15} className="search-icon" />
        <input
          type="text"
          placeholder="Search products, SKUs, attributes... (Ctrl + K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="navbar-search-input"
        />
        {searchQuery && (
          <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="navbar-actions-group">
        {/* Sync to WooCommerce Action */}
        <button
          className={`btn-sync-action ${isSyncing ? 'syncing' : ''}`}
          onClick={onSyncAll}
          disabled={isSyncing || isPulling}
          title="Push pending changes to WooCommerce"
        >
          <RefreshCw size={14} className={isSyncing ? 'spin-animation' : ''} />
          <span>{isSyncing ? 'Syncing...' : 'Push to Woo'}</span>
          {pendingCount > 0 && (
            <span className="sync-badge-pill">{pendingCount}</span>
          )}
        </button>

        {/* Pull from Store Action */}
        <button
          className="btn-pull-action"
          onClick={onPullStore}
          disabled={isSyncing || isPulling}
          title="Pull external changes from WooCommerce"
        >
          <ArrowDownToLine size={14} className={isPulling ? 'bounce-animation' : ''} />
          <span>{isPulling ? 'Pulling...' : 'Pull Store'}</span>
        </button>

        {/* Bulk CSV Import */}
        <button
          className="btn-header-secondary"
          onClick={onOpenBulkImport}
          title="Bulk CSV Import/Export"
        >
          <UploadCloud size={15} />
          <span className="hidden-mobile">CSV</span>
        </button>

        {/* New Product Button */}
        <button
          className="btn-header-primary"
          onClick={onNewProduct}
          title="Create New Product"
        >
          <Plus size={15} />
          <span>New Product</span>
        </button>

        {/* Divider */}
        <div className="navbar-divider" />

        {/* Notification Bell Dropdown */}
        <div className="dropdown-container" ref={notifRef}>
          <button
            className={`navbar-icon-btn ${unreadCount > 0 ? 'has-notifications' : ''}`}
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notif-badge">
                <span className="notif-badge-ping" />
                <span className="notif-badge-number">{unreadCount}</span>
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="dropdown-panel notifications-dropdown slide-down-fade">
              <div className="dropdown-header">
                <div className="header-title-row">
                  <span className="font-semibold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="notif-count-tag">{unreadCount} new</span>
                  )}
                </div>
                <div className="header-actions-row">
                  <button
                    className="notif-action-link"
                    onClick={onMarkNotificationsRead}
                    title="Mark all as read"
                  >
                    <Check size={12} /> Mark Read
                  </button>
                  <button
                    className="notif-action-link"
                    onClick={onClearNotifications}
                    title="Clear all notifications"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="dropdown-body notification-list custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="empty-notif-state">
                    <CheckCircle2 size={24} className="text-emerald-400 mb-2" />
                    <p className="text-xs text-slate-400">All caught up! No new notifications.</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`notif-item ${item.read ? 'read' : 'unread'} ${item.type}`}
                    >
                      <div className="notif-icon-bubble">
                        {item.type === 'success' && <CheckCircle2 size={14} className="text-emerald-400" />}
                        {item.type === 'warning' && <AlertTriangle size={14} className="text-amber-400" />}
                        {item.type === 'info' && <Sparkles size={14} className="text-indigo-400" />}
                        {item.type === 'sync' && <RefreshCw size={14} className="text-cyan-400" />}
                      </div>
                      <div className="notif-content-block">
                        <div className="notif-title">{item.title}</div>
                        <div className="notif-message">{item.message}</div>
                        <div className="notif-time">{item.time}</div>
                      </div>
                      {!item.read && <span className="unread-dot" />}
                    </div>
                  ))
                )}
              </div>

              <div className="dropdown-footer">
                <div className="footer-status-pill">
                  <span className="dot-green" />
                  <span>Real-time webhook listener active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        <div className="dropdown-container" ref={profileRef}>
          <button
            className="navbar-profile-trigger"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="User profile menu"
          >
            <div className="profile-avatar-box">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                alt={user?.name || "User Avatar"}
                className="profile-img"
              />
              <span className="avatar-status-dot online" />
            </div>
            <div className="profile-name-preview hidden-mobile">
              <span className="preview-user-name">{user?.name || "Alex Rivera"}</span>
              <ChevronDown size={13} className={`chevron-transition ${isProfileOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {isProfileOpen && (
            <div className="dropdown-panel profile-dropdown slide-down-fade">
              {/* Profile Card Header */}
              <div
                className="profile-card-header cursor-pointer"
                onClick={() => {
                  setIsProfileOpen(false);
                  onOpenProfile();
                }}
                title="Click to manage profile and keys"
                style={{ cursor: 'pointer' }}
              >
                <div className="profile-avatar-large">
                  <img
                    src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                    alt={user?.name || "User Avatar"}
                  />
                  <span className="avatar-status-badge online" />
                </div>
                <div className="profile-header-details">
                  <h4 className="profile-user-fullname">{user?.name || "Alex Rivera"}</h4>
                  <p className="profile-user-email">{user?.email || "alex.rivera@nexus-pim.io"}</p>
                  <span className="profile-role-tag">
                    <ShieldCheck size={11} /> {user?.role || "Catalog SuperAdmin"}
                  </span>
                </div>
              </div>

              {/* Connected Stack Pill */}
              <div className="profile-env-info">
                <div className="env-row">
                  <Database size={13} className="text-emerald-400" />
                  <span className="env-label">Database:</span>
                  <span className="env-val text-emerald-400">Supabase Live</span>
                </div>
                <div className="env-row">
                  <RefreshCw size={13} className="text-indigo-400" />
                  <span className="env-label">WooCommerce:</span>
                  <span className="env-val text-indigo-400">REST API v3 Ready</span>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="profile-menu-links">
                <button
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenProfile();
                  }}
                >
                  <User size={15} className="text-indigo-400" />
                  <span>Admin Profile & API Keys</span>
                </button>

                <button
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenSettings();
                  }}
                >
                  <Settings size={15} />
                  <span>Store & API Settings</span>
                </button>

                <button
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenBulkImport();
                  }}
                >
                  <UploadCloud size={15} />
                  <span>Import / Export Catalog</span>
                </button>
              </div>

              {/* Logout Action */}
              <div className="profile-dropdown-footer">
                <button
                  className="profile-logout-btn"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogoutClick();
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out of NEXUS</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
