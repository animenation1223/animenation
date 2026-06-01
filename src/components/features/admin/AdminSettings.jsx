import React from 'react';
import MaintenanceModeToggle from './MaintenanceModeToggle';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-syne font-extrabold text-2xl text-foreground mb-2">Site Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage site-wide settings and maintenance mode
        </p>
      </div>

      <MaintenanceModeToggle />
    </div>
  );
}
