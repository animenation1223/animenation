import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/api/httpClient';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MaintenanceModeToggle() {
  const queryClient = useQueryClient();
  const [maintenanceUntil, setMaintenanceUntil] = useState('');
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => apiFetch('/api/site-settings'),
    onSuccess: (data) => {
      if (data.maintenanceUntil) {
        setMaintenanceUntil(new Date(data.maintenanceUntil).toISOString().slice(0, 16));
      }
      if (data.maintenanceMessage) {
        setMaintenanceMessage(data.maintenanceMessage);
      }
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      return apiFetch('/api/site-settings', {
        method: 'PATCH',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Site settings updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update site settings');
    },
  });

  const handleToggle = (enabled) => {
    mutation.mutate({
      maintenanceMode: enabled,
      maintenanceUntil: enabled ? maintenanceUntil : null,
      maintenanceMessage: enabled ? maintenanceMessage : null,
    });
  };

  const handleSave = () => {
    mutation.mutate({
      maintenanceMode: settings?.maintenanceMode || false,
      maintenanceUntil: maintenanceUntil || null,
      maintenanceMessage: maintenanceMessage || null,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {settings?.maintenanceMode ? (
            <AlertCircle className="w-5 h-5 text-destructive" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
          Maintenance Mode
        </CardTitle>
        <CardDescription>
          {settings?.maintenanceMode
            ? '🔴 Maintenance Mode Enabled - Storefront is inaccessible'
            : '🟢 Website Live - All systems operational'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-white/5">
          <div className="space-y-1">
            <Label htmlFor="maintenance-mode" className="font-syne font-bold">
              Enable Maintenance Mode
            </Label>
            <p className="text-xs text-muted-foreground">
              When enabled, customers will see the maintenance page
            </p>
          </div>
          <Switch
            id="maintenance-mode"
            checked={settings?.maintenanceMode || false}
            onCheckedChange={handleToggle}
            disabled={mutation.isPending}
          />
        </div>

        {/* Maintenance Until */}
        <div className="space-y-2">
          <Label htmlFor="maintenance-until" className="font-syne font-bold">
            Estimated Return Time
          </Label>
          <Input
            id="maintenance-until"
            type="datetime-local"
            value={maintenanceUntil}
            onChange={(e) => setMaintenanceUntil(e.target.value)}
            disabled={!settings?.maintenanceMode || mutation.isPending}
            className="bg-muted/50 border-border"
          />
          <p className="text-xs text-muted-foreground">
            Optional: Display estimated return time on maintenance page
          </p>
        </div>

        {/* Maintenance Message */}
        <div className="space-y-2">
          <Label htmlFor="maintenance-message" className="font-syne font-bold">
            Maintenance Message
          </Label>
          <Textarea
            id="maintenance-message"
            placeholder="We're currently performing scheduled maintenance to improve your experience. We'll be back shortly."
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            disabled={!settings?.maintenanceMode || mutation.isPending}
            rows={4}
            className="bg-muted/50 border-border resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Custom message to display on the maintenance page
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={mutation.isPending || !settings?.maintenanceMode}
          className="w-full bg-primary hover:bg-primary/90 font-syne font-bold"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>

        {/* Warning */}
        {settings?.maintenanceMode && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive font-medium">
              ⚠️ Maintenance Mode is currently active. Customers cannot access the storefront.
              Disable maintenance mode to restore normal website operations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
