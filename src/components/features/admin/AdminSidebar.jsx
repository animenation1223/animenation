import React from 'react';
import {
  BarChart3, Package, ShoppingBag, MessageSquare, Star,
  Tag, Megaphone, Truck, Users, X, LayoutDashboard
} from 'lucide-react';

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'inventory', label: 'Inventory', icon: BarChart3 },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'coupons', label: 'Coupons', icon: Tag },
  { id: 'banners', label: 'Banners', icon: Megaphone },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
];

export default function AdminSidebar({ active, onSelect, onClose }) {
  return (
    <aside className="flex flex-col h-full bg-background border-r border-border">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-primary-foreground font-syne font-extrabold text-xs">AN</span>
          </div>
          <div>
            <p className="font-syne font-extrabold text-sm text-foreground leading-none">AnimeNation</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Admin Panel</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { onSelect(id); onClose?.(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              active === id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${active === id ? 'text-primary-foreground' : ''}`} />
            <span className="font-syne font-bold">{label}</span>
            {active === id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
          </button>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">AnimeNation India v1.0</p>
      </div>
    </aside>
  );
}