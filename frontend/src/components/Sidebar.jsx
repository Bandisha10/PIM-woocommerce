import React from 'react';
import {
  Package, LayoutGrid, Sparkles, AlertTriangle, Layers, History,
  Settings, ChevronLeft, ChevronRight, Database, CheckCircle2,
  ExternalLink, LogOut, ShieldCheck, ArrowLeftRight, HelpCircle
} from 'lucide-react';
import { NexusLogo } from './NexusLogo';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  productsCount = 0,
  templatesCount = 0,
  conflictCount = 0,
  activityCount = 0,
  pendingCount = 0,
  onOpenSettings,
  onLogoutClick,
  onOpenProfile,
  user,
}) {
  const navItems = [
    {
      group: 'PIM CORE',
      items: [
        {
          id: 'overview',
          label: 'Overview Dashboard',
          icon: Package,
          badge: null,
          color: '#A855F7',
        },
        {
          id: 'catalog',
          label: 'Master Catalog',
          icon: LayoutGrid,
          badge: productsCount,
          badgeType: 'purple',
          color: '#7C3AED',
        },
        {
          id: 'templates',
          label: 'Attribute Schemas',
          icon: Layers,
          badge: templatesCount,
          badgeType: 'purple',
          color: '#9333EA',
        },
      ],
    },
    {
      group: 'WOOCOMMERCE INTEGRATION',
      items: [
        {
          id: 'conflicts',
          label: 'Conflict Center',
          icon: AlertTriangle,
          badge: conflictCount > 0 ? conflictCount : null,
          badgeType: 'pink',
          color: '#EC4899',
        },
        {
          id: 'activity',
          label: 'Sync Audit Log',
          icon: History,
          badge: activityCount > 0 ? activityCount : null,
          badgeType: 'purple',
          color: '#10B981',
        },
      ],
    },
  ];

  return (
    <aside className={`pim-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand-wrapper">
        <div
          className="sidebar-brand"
          onClick={() => setActiveTab('overview')}
          role="button"
          tabIndex={0}
          title="NEXUS PIM - Enterprise Hub"
          style={{ cursor: 'pointer' }}
        >
          <NexusLogo size={24} showText={!isCollapsed} subtitle="WooCommerce Core" />
        </div>

        <button
          className="sidebar-collapse-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="sidebar-nav">
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="sidebar-nav-group">
            {!isCollapsed && <div className="sidebar-group-title">{group.group}</div>}
            <div className="sidebar-group-items">
              {group.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="nav-item-icon-wrapper" style={{ color: isActive ? '#fff' : item.color }}>
                      <IconComponent size={18} />
                    </span>
                    {!isCollapsed && (
                      <span className="nav-item-label">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge !== null && item.badge !== undefined && (
                      <span className={`nav-item-badge badge-${item.badgeType}`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && <span className="active-glow-pill" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-footer">
        {/* System Health Status Card */}
        {!isCollapsed && (
          <div className="sidebar-status-card">
            <div className="status-header">
              <span className="status-dot-pulsing" />
              <span className="status-title">PIM Sync Engine Active</span>
            </div>
            <div className="status-detail">
              <Database size={12} className="text-indigo-400" />
              <span>Supabase Cloud PostgreSQL</span>
            </div>
            {pendingCount > 0 && (
              <div className="status-pending-pill">
                <ArrowLeftRight size={11} />
                <span>{pendingCount} product{pendingCount > 1 ? 's' : ''} queued for sync</span>
              </div>
            )}
          </div>
        )}

        {/* User Profile Mini Bar */}
        <div className="sidebar-user-card">
          <div
            className="user-profile-clickable-area"
            onClick={onOpenProfile}
            title="Click to manage Admin Profile & Keys"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0, cursor: 'pointer' }}
          >
            <div className="user-avatar-wrapper">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                alt={user?.name || "User Avatar"}
                className="user-avatar-img"
              />
              <span className="avatar-online-dot" />
            </div>

            {!isCollapsed && (
              <div className="user-info-text">
                <div className="user-full-name">{user?.name || "Alex Rivera"}</div>
                <div className="user-role-badge">
                  <ShieldCheck size={11} />
                  <span>{user?.role || "Catalog SuperAdmin"}</span>
                </div>
              </div>
            )}
          </div>

          <div className="user-quick-actions">
            <button
              className="user-action-btn"
              onClick={onOpenSettings}
              title="Store Settings"
            >
              <Settings size={15} />
            </button>
            <button
              className="user-action-btn logout-action-btn"
              onClick={onLogoutClick}
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
