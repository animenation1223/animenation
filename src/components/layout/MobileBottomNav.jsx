import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, Heart, Trophy } from 'lucide-react';
import { base44 } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: Search, label: 'Shop', to: '/products' },
  { icon: ShoppingBag, label: 'Cart', to: '/cart', badge: 'cart' },
  { icon: Heart, label: 'Wishlist', to: '/wishlist', badge: 'wishlist' },
  { icon: Trophy, label: 'Rewards', to: '/loyalty' },
];

export default function MobileBottomNav() {
  const location = useLocation();

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart-count'],
    queryFn: () => base44.entities.CartItem.list(),
    initialData: [],
  });

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ['wishlist-count'],
    queryFn: () => base44.entities.WishlistItem.list(),
    initialData: [],
  });

  const getBadge = (badge) => {
    if (badge === 'cart') return cartItems.length;
    if (badge === 'wishlist') return wishlistItems.length;
    return 0;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden glass-strong border-t border-border/50">
      <div className="flex items-center justify-around px-2 h-16">
        {NAV_ITEMS.map(({ icon: Icon, label, to, badge }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          const count = badge ? getBadge(badge) : 0;
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}