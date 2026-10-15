import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

import { api } from './api';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import LogoutModal from './components/LogoutModal';
import ProfileModal from './components/ProfileModal';
import OverviewDashboard from './components/OverviewDashboard';

import CatalogView from './components/CatalogView';
import ConflictResolutionCenter from './components/ConflictResolutionCenter';
import AttributeTemplatesView from './components/AttributeTemplatesView';
import ActivityLogView from './components/ActivityLogView';
import ProductModal from './components/ProductModal';
import BulkImportModal from './components/BulkImportModal';
import StoreSettingsModal from './components/StoreSettingsModal';
import CornerStatusIndicator from './components/CornerStatusIndicator';

// Auth System Pages & Components
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

function NexusPimDashboard() {
  const navigate = useNavigate();
  const { user: authUser, updateUser, logout } = useAuth();

  const user = authUser || {
    name: 'Alex Rivera',
    email: 'alex.rivera@nexus-pim.io',
    role: 'Catalog SuperAdmin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  };

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'catalog' | 'conflicts' | 'templates' | 'activity'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);


  // Dynamic Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'sync', title: 'WooCommerce Sync Ready', message: '5 products ready for synchronization to channel.', time: 'Just now', read: false },
    { id: 2, type: 'success', title: 'Database Connected', message: 'Supabase PostgreSQL live session established.', time: '5m ago', read: false },
    { id: 3, type: 'warning', title: '1 Conflict Detected', message: 'Price mismatch on SKU-003 between PIM and store.', time: '12m ago', read: false },
    { id: 4, type: 'info', title: 'Attribute Schema Active', message: '4 templates loaded: Apparel, Tech, Home, Footwear.', time: '1h ago', read: true },
  ]);

  const [products, setProducts] = useState([]);
  const [wooProducts, setWooProducts] = useState([]);
  const [health, setHealth] = useState(null);
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [channels, setChannels] = useState([]);
  const [activity, setActivity] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isStoreSettingsOpen, setIsStoreSettingsOpen] = useState(false);

  // Non-blocking corner "Please wait..." indicator state
  const [cornerStatus, setCornerStatus] = useState({
    text: 'Loading NEXUS Catalog... Please wait',
    active: true,
  });

  // Fast Unified Data Loader (1 round-trip + cache)
  const loadAllData = async (silent = false) => {
    if (!silent) {
      setCornerStatus({ text: 'Syncing with Supabase... Please wait', active: true });
    }
    try {
      // 1. Unified fast bootstrap (1 round-trip instead of 7)
      const bootData = await api.getBootstrap();

      setProducts(bootData.products || []);
      setWooProducts(bootData.woo_products || []);
      setHealth(bootData.health || null);
      setCategories(bootData.categories || []);
      setTemplates(bootData.templates || []);
      setChannels(bootData.channels || []);
      setActivity(bootData.activity || []);

      // Cache locally for instantaneous 0ms subsequent loads
      try {
        localStorage.setItem('nexus_cached_bootstrap', JSON.stringify(bootData));
      } catch {}

      setCornerStatus({ text: 'Catalog synchronized • Ready', active: false, success: true });
      setTimeout(() => {
        setCornerStatus((prev) => (prev?.active ? prev : null));
      }, 2400);
    } catch (err) {
      console.warn('Bootstrap fetch fallback:', err);
      // Fallback to separate endpoints
      try {
        const [prodsData, wooData, healthData, catsData, tplsData, chsData, actsData] =
          await Promise.all([
            api.getProducts(),
            api.getWooPreview(),
            api.getHealth(),
            api.getCategories(),
            api.getTemplates(),
            api.getChannels(),
            api.getActivity(30),
          ]);

        setProducts(prodsData);
        setWooProducts(wooData);
        setHealth(healthData);
        setCategories(catsData);
        setTemplates(tplsData);
        setChannels(chsData);
        setActivity(actsData);
        setCornerStatus({ text: 'Catalog up to date', active: false, success: true });
        setTimeout(() => setCornerStatus(null), 2000);
      } catch (fallbackErr) {
        setCornerStatus({ text: 'Connected in offline cache mode', active: false, error: true });
        setTimeout(() => setCornerStatus(null), 3500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Instant cache hydration: immediately render cached data so screen appears instantly
    try {
      const cached = localStorage.getItem('nexus_cached_bootstrap');
      if (cached) {
        const data = JSON.parse(cached);
        if (data.products?.length) setProducts(data.products);
        if (data.woo_products?.length) setWooProducts(data.woo_products);
        if (data.health) setHealth(data.health);
        if (data.categories?.length) setCategories(data.categories);
        if (data.templates?.length) setTemplates(data.templates);
        if (data.channels?.length) setChannels(data.channels);
        if (data.activity?.length) setActivity(data.activity);
      }
    } catch (e) {
      console.warn('Cache parse error:', e);
    }

    loadAllData();
  }, []);

  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleUpdateUser = (updatedData) => {
    updateUser(updatedData);
    showNotice(`Admin profile updated for ${updatedData.name || 'Admin'}!`, 'success');
  };


  const showNotice = (msg, type = 'info') => {
    setNotification({ msg, type });
    setNotifications((prev) => [
      {
        id: Date.now(),
        type: type === 'danger' ? 'warning' : type,
        title:
          type === 'success'
            ? 'Action Succeeded'
            : type === 'danger' || type === 'warning'
            ? 'Conflict / Notice'
            : 'System Update',
        message: msg,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);
    setTimeout(() => setNotification(null), 4000);
  };

  // Sync Pending Products
  const handleSyncAll = async () => {
    setIsSyncing(true);
    setCornerStatus({ text: 'Pushing changes to WooCommerce... Please wait', active: true });
    try {
      const res = await api.syncProducts(null, true);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      showNotice(res.message, 'success');
      setCornerStatus({ text: 'Push completed successfully!', active: false, success: true });
      await loadAllData(true);
    } catch (err) {
      showNotice(err.message, 'danger');
      setCornerStatus({ text: 'Sync encountered notice', active: false, error: true });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setCornerStatus(null), 3000);
    }
  };

  // Sync Single Product
  const handleSyncProduct = async (id) => {
    setIsSyncing(true);
    setCornerStatus({ text: 'Syncing product to store... Please wait', active: true });
    try {
      const res = await api.syncProducts([id]);
      showNotice(res.message, 'success');
      setCornerStatus({ text: 'Product pushed to store!', active: false, success: true });
      await loadAllData(true);
    } catch (err) {
      showNotice(err.message, 'danger');
      setCornerStatus({ text: 'Sync failed', active: false, error: true });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setCornerStatus(null), 2500);
    }
  };

  // Pull Store
  const handlePullStore = async () => {
    setIsPulling(true);
    setCornerStatus({ text: 'Pulling live WooCommerce catalog... Please wait', active: true });
    try {
      const res = await api.pullFromStore();
      const msg = `Pull complete: ${res.updated_count} updated, ${res.conflicts_count} conflicts, ${res.added_count} new store items.`;
      showNotice(msg, res.conflicts_count > 0 ? 'warning' : 'success');
      setCornerStatus({ text: 'Store pull complete!', active: false, success: true });
      await loadAllData(true);
      if (res.conflicts_count > 0) {
        setActiveTab('conflicts');
      }
    } catch (err) {
      showNotice(err.message, 'danger');
      setCornerStatus({ text: 'Store pull notice', active: false, error: true });
    } finally {
      setIsPulling(false);
      setTimeout(() => setCornerStatus(null), 2500);
    }
  };

  // Simulate Store Change (Demo Conflict)
  const handleSimulateChange = async (productId = null) => {
    try {
      const res = await api.simulateRemoteChange(productId);
      showNotice(res.message, 'warning');
      await loadAllData();
      setActiveTab('conflicts');
    } catch (err) {
      showNotice(err.message, 'danger');
    }
  };

  // Resolve Conflict
  const handleResolveConflict = async (id, keep) => {
    try {
      await api.resolveConflict(id, keep);
      showNotice(`Conflict resolved: Preserved ${keep.toUpperCase()} version.`, 'success');
      await loadAllData();
    } catch (err) {
      showNotice(err.message, 'danger');
    }
  };

  // Save Product (Create or Edit)
  const handleSaveProduct = async (payload) => {
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showNotice(`Updated '${payload.name}'. Queued for sync.`, 'info');
      } else {
        await api.createProduct(payload);
        showNotice(`Created product '${payload.name}'. Ready to sync.`, 'success');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      await loadAllData();
    } catch (err) {
      showNotice(err.message, 'danger');
    }
  };

  // Quick Inline Update (from Demo view)
  const handleQuickUpdate = async (id, data) => {
    try {
      await api.updateProduct(id, data);
      await loadAllData();
    } catch (err) {
      showNotice(err.message, 'danger');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}' from PIM?`)) return;
    try {
      await api.deleteProduct(id, true);
      showNotice(`Deleted '${name}'.`, 'info');
      await loadAllData();
    } catch (err) {
      showNotice(err.message, 'danger');
    }
  };

  // Bulk Actions
  const handleBulkSync = async (ids) => {
    setIsSyncing(true);
    try {
      const res = await api.syncProducts(ids);
      showNotice(res.message, 'success');
      await loadAllData();
    } catch (err) {
      showNotice(err.message, 'danger');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBulkDelete = async (ids) => {
    if (!window.confirm(`Delete ${ids.length} selected products?`)) return;
    try {
      await api.bulkDeleteProducts(ids);
      showNotice(`Deleted ${ids.length} products.`, 'info');
      await loadAllData();
    } catch (err) {
      showNotice(err.message, 'danger');
    }
  };

  // CSV Import
  const handleImportCsv = async (csvText) => {
    try {
      const res = await api.importCsv(csvText);
      showNotice(res.message, 'success');
      await loadAllData();
    } catch (err) {
      showNotice(err.message, 'danger');
    }
  };

  const handleExportCsv = async () => {
    try {
      await api.exportCsv();
      showNotice('Catalog exported successfully to CSV!', 'success');
    } catch (err) {
      showNotice(err.message, 'danger');
    }
  };

  // Attribute Templates
  const handleCreateTemplate = async (data) => {
    try {
      await api.createTemplate(data);
      showNotice(`Created template '${data.name}'.`, 'success');
      await loadAllData();
    } catch (err) {
      showNotice(err.message, 'danger');
    }
  };

  const handleDeleteTemplate = async (id) => {
    try {
      await api.deleteTemplate(id);
      showNotice('Deleted attribute template.', 'info');
      await loadAllData();
    } catch (err) {
      showNotice(err.message, 'danger');
    }
  };

  // Channels
  const handleSaveChannel = async (id, data) => {
    try {
      await api.updateChannel(id, data);
      showNotice('Store settings saved.', 'success');
      await loadAllData();
    } catch (err) {
      showNotice(err.message, 'danger');
    }
  };



  const pendingCount = products.filter((p) => p.status === 'pending').length;
  const conflictCount = products.filter((p) => p.status === 'conflict').length;
  const conflictsList = products.filter((p) => p.status === 'conflict');

  return (
    <div className="pim-app-shell">
      {/* Interactive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        productsCount={products.length}
        templatesCount={templates.length}
        conflictCount={conflictCount}
        activityCount={activity.length}
        pendingCount={pendingCount}
        onOpenSettings={() => setIsStoreSettingsOpen(true)}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        user={user}
      />

      {/* Main Workspace Area */}
      <div className="pim-main-area">
        {/* Sticky Top Navbar */}
        <TopNavbar
          activeTab={activeTab}
          onNewProduct={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          onOpenBulkImport={() => setIsBulkImportOpen(true)}
          onOpenSettings={() => setIsStoreSettingsOpen(true)}
          onSyncAll={handleSyncAll}
          onPullStore={handlePullStore}
          isSyncing={isSyncing}
          isPulling={isPulling}
          pendingCount={pendingCount}
          conflictCount={conflictCount}
          user={user}
          onLogoutClick={() => setIsLogoutModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            if (q.trim() && activeTab !== 'catalog') {
              setActiveTab('catalog');
            }
          }}
          notifications={notifications}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          onClearNotifications={handleClearNotifications}
        />

        {/* Content Container */}
        <div className="pim-content-container">
          {/* Toast Notification */}
          {notification && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 20px',
                borderRadius: 'var(--radius-md)',
                background: notification.type === 'danger' ? '#ef4444' : notification.type === 'warning' ? '#f59e0b' : '#10b981',
                color: '#fff',
                fontWeight: 600,
                fontSize: '13.5px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'slideDownFade 0.2s ease-out'
              }}
            >
              {notification.type === 'danger' ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
              {notification.msg}
            </div>
          )}


          {/* Main Tab Content */}
          <main>
            {activeTab === 'overview' && (
              <OverviewDashboard
                products={products}
                activity={activity}
                onNavigate={(tab) => setActiveTab(tab)}
                onNewProduct={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
              />
            )}

            {activeTab === 'catalog' && (
              <CatalogView
                products={products.filter((p) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    p.name.toLowerCase().includes(q) ||
                    p.sku.toLowerCase().includes(q) ||
                    (p.category && p.category.toLowerCase().includes(q))
                  );
                })}
                categories={categories}
                onNewProduct={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                onEditProduct={(prod) => {
                  setEditingProduct(prod);
                  setIsProductModalOpen(true);
                }}
                onDeleteProduct={handleDeleteProduct}
                onSyncProduct={handleSyncProduct}
                onBulkSync={handleBulkSync}
                onBulkDelete={handleBulkDelete}
                onResolveConflict={(_prod) => {
                  setActiveTab('conflicts');
                }}
                onSimulateChange={handleSimulateChange}
                onExportCsv={handleExportCsv}
                onOpenBulkImport={() => setIsBulkImportOpen(true)}
              />
            )}

            {activeTab === 'conflicts' && (
              <ConflictResolutionCenter
                conflicts={conflictsList}
                onResolve={handleResolveConflict}
                onSimulateChange={() => handleSimulateChange()}
              />
            )}

            {activeTab === 'templates' && (
              <AttributeTemplatesView
                templates={templates}
                onCreateTemplate={handleCreateTemplate}
                onDeleteTemplate={handleDeleteTemplate}
              />
            )}

            {activeTab === 'activity' && (
              <ActivityLogView
                activity={activity}
                onRefresh={loadAllData}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
        categories={categories}
        templates={templates}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={handleImportCsv}
      />

      <StoreSettingsModal
        isOpen={isStoreSettingsOpen}
        onClose={() => setIsStoreSettingsOpen(false)}
        channels={channels}
        onSaveChannel={handleSaveChannel}
        onTestConnection={api.testStoreConnection}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={async () => {
          setIsLogoutModalOpen(false);
          await logout();
          navigate('/auth/login', { replace: true });
        }}
        user={user}
        isLoggedOut={isLoggedOut}
        onReLogin={() => {
          setIsLogoutModalOpen(false);
          navigate('/auth/login');
        }}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
      />

      {/* Floating Corner "Please wait..." Status Indicator */}
      <CornerStatusIndicator
        status={cornerStatus}
        onDismiss={() => setCornerStatus(null)}
      />
    </div>
  );
}

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/auth/verify-email" element={<VerifyEmail />} />

      {/* Protected Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <NexusPimDashboard />
          </ProtectedRoute>
        }
      />

      {/* Root Path: Redirect based on authentication state */}
      <Route path="/" element={<RootRedirect />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

