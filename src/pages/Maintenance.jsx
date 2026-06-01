import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/api/httpClient';
import { Mail, Instagram, Twitter, Facebook, Youtube, RefreshCw } from 'lucide-react';

export default function Maintenance() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => apiFetch('/api/site-settings'),
  });

  const maintenanceMessage = settings?.maintenanceMessage || 
    "We're currently performing scheduled maintenance to improve your experience. We'll be back shortly. Thank you for your patience.";

  const maintenanceUntil = settings?.maintenanceUntil 
    ? new Date(settings.maintenanceUntil).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4">
      <div className="max-w-2xl w-full mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
            <span className="text-4xl font-syne font-extrabold text-white">AN</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-syne font-extrabold text-foreground tracking-tight">
            AnimeNation
          </h1>
        </div>

        {/* Maintenance Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20">
          <RefreshCw className="w-12 h-12 text-primary animate-spin" style={{ animationDuration: '3s' }} />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-syne font-bold text-foreground">
            We're Upgrading AnimeNation
          </h2>
          <div className="h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
        </div>

        {/* Message */}
        <div className="p-6 rounded-2xl bg-card border border-white/5 space-y-4">
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {maintenanceMessage}
          </p>
          
          {maintenanceUntil && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-sm text-muted-foreground">
                Expected return by:
              </p>
              <p className="text-lg font-syne font-bold text-foreground mt-1">
                {maintenanceUntil}
              </p>
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Need help? Contact us:
          </p>
          
          <a
            href="mailto:support@animenation.in"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary transition-all"
          >
            <Mail className="w-4 h-4" />
            <span className="font-medium">support@animenation.in</span>
          </a>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-4 pt-4">
          {[
            { icon: Instagram, href: 'https://instagram.com/animenation', label: 'Instagram' },
            { icon: Twitter, href: 'https://twitter.com/animenation', label: 'Twitter' },
            { icon: Facebook, href: 'https://facebook.com/animenation', label: 'Facebook' },
            { icon: Youtube, href: 'https://youtube.com/animenation', label: 'YouTube' },
          ].map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted border border-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              aria-label={label}
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-white/5">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AnimeNation. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
