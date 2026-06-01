import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '../../components/features/admin/AdminSidebar';
import AdminOverview from '../../components/features/admin/AdminOverview';
import AdminProducts from '../../components/features/admin/AdminProducts';
import AdminOrders from '../../components/features/admin/AdminOrders';
import AdminMessages from '../../components/features/admin/AdminMessages';
import AdminInventory from '../../components/features/admin/AdminInventory';
import AdminCustomers from '../../components/features/admin/AdminCustomers';
import AdminReviews from '../../components/features/admin/AdminReviews';
import AdminCoupons from '../../components/features/admin/AdminCoupons';
import AdminBanners from '../../components/features/admin/AdminBanners';
import AdminShipping from '../../components/features/admin/AdminShipping';
import AdminSettings from '../../components/features/admin/AdminSettings';

const TITLES = {
  overview: 'Overview',
  orders: 'Order Management',
  products: 'Product Management',
  inventory: 'Inventory Management',
  customers: 'Customer Management',
  reviews: 'Reviews Moderation',
  coupons: 'Coupon Management',
  banners: 'Banner Management',
  shipping: 'Shipping Management',
  messages: 'Messages',
  settings: 'Site Settings',
};

export default function Dashboard() {
  const { user, isAuthenticated, isLoadingAuth, authChecked, navigateToLogin } = useAuth();
  const [active, setActive] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authChecked || isLoadingAuth) {
      return;
    }
    if (!isAuthenticated) {
      navigateToLogin();
    }
  }, [authChecked, isLoadingAuth, isAuthenticated, navigateToLogin]);

  const isAdmin = user?.role === 'admin';

  if (!authChecked || isLoadingAuth || (!isAuthenticated && authChecked)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <div className="w-9 h-9 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">🔒</span>
        </div>
        <h1 className="font-syne font-extrabold text-xl text-foreground mb-2">Admin access required</h1>
        <p className="text-sm text-muted-foreground mb-8">
          This area is restricted to store administrators. If you need access, contact support.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-syne font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Back to store
        </Link>
      </div>
    );
  }

  const renderContent = () => {
    switch (active) {
      case 'overview': return <AdminOverview />;
      case 'orders': return <AdminOrders />;
      case 'products': return <AdminProducts />;
      case 'inventory': return <AdminInventory />;
      case 'customers': return <AdminCustomers />;
      case 'reviews': return <AdminReviews />;
      case 'coupons': return <AdminCoupons />;
      case 'banners': return <AdminBanners />;
      case 'shipping': return <AdminShipping />;
      case 'messages': return <AdminMessages />;
      case 'settings': return <AdminSettings />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — fixed on desktop, drawer on mobile */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-56 flex-shrink-0 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <AdminSidebar active={active} onSelect={setActive} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-5 py-4 border-b border-white/5 bg-[hsl(240_6%_6%)] flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-syne font-extrabold text-lg text-foreground">{TITLES[active]}</h1>
            <p className="text-xs text-muted-foreground">AnimeNation India — Admin</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-muted-foreground hidden sm:inline">Live</span>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-5">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}