import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

// Custom social icons as SVGs
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export default function Footer() {
  const socials = [
    { Icon: InstagramIcon, href: '#', label: 'Instagram', color: 'hover:text-pink-400' },
    { Icon: TwitterIcon, href: '#', label: 'Twitter/X', color: 'hover:text-sky-400' },
    { Icon: YoutubeIcon, href: '#', label: 'YouTube', color: 'hover:text-red-500' },
    { Icon: DiscordIcon, href: '#', label: 'Discord', color: 'hover:text-indigo-400' },
  ];

  return (
    <footer className="bg-card border-t border-border pb-16 sm:pb-0">
      <div className="neon-line" />

      {/* Social row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6 border-b border-border/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-medium">Follow the Otaku revolution 👇</p>
          <div className="flex items-center gap-2">
            {socials.map(({ Icon, href, label, color }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className={`w-10 h-10 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-center text-muted-foreground ${color} hover:border-current/30 hover:bg-muted transition-all duration-200 hover:scale-110`}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <span className="text-white font-syne font-extrabold text-sm">AN</span>
              </div>
              <span className="font-syne font-bold text-xl tracking-tight">AnimeNation</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5 max-w-xs">
              India's #1 premium destination for authentic anime merchandise. From tees to figures, we bring your favorite anime to life.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-syne font-bold">COD</span>
              <span className="px-2.5 py-1 rounded-lg bg-accent/10 text-accent text-xs font-syne font-bold">UPI</span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-syne font-bold">Free Ship</span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-syne font-bold text-sm mb-4 text-foreground uppercase tracking-wider">Shop</h4>
            <div className="space-y-2.5">
              {[
                { label: 'T-Shirts', to: '/products?category=t-shirts' },
                { label: 'Hoodies', to: '/products?category=hoodies' },
                { label: 'Posters', to: '/products?category=posters' },
                { label: 'Action Figures', to: '/products?category=action-figures' },
                { label: 'Manga', to: '/products?category=manga' },
                { label: 'View All →', to: '/products' },
              ].map(({ label, to }) => (
                <Link key={to} to={to} className="block text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200">{label}</Link>
              ))}
            </div>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-syne font-bold text-sm mb-4 text-foreground uppercase tracking-wider">Help</h4>
            <div className="space-y-2.5">
              {[
                { label: 'Track Order', to: '/orders' },
                { label: 'Rewards & Loyalty', to: '/loyalty' },
                { label: 'Blog', to: '/blog' },
                { label: 'FAQ', to: '/faq' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'About Us', to: '/about' },
              ].map(({ label, to }) => (
                <Link key={to} to={to} className="block text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200">{label}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-syne font-bold text-sm mb-4 text-foreground uppercase tracking-wider">Contact</h4>
            <div className="space-y-3">
              <a href="mailto:support@animenation.in" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>support@animenation.in</span>
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>+91 98765 43210</span>
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="neon-line my-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © 2026 AnimeNation India. All rights reserved. Made with ❤️ for the Otaku community.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap justify-center sm:justify-end">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Refund Policy</span>
            <span>•</span>
            <Link to="/sitemap" className="hover:text-foreground transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}