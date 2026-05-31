import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/api/httpClient';

export default function AdminBanners() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', cta: 'Shop Now', link: '/products', gradient: 'from-red-900 to-purple-900' });

  const { data: banners = [] } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => apiFetch('/api/banners'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (body) => apiFetch('/api/banners', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setShowForm(false);
      toast.success('Banner created!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiFetch(`/api/banners/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/api/banners/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Banner deleted');
    },
  });

  const addBanner = () => {
    if (!form.title) { toast.error('Title is required'); return; }
    createMutation.mutate({ ...form, active: true });
    setForm({ title: '', subtitle: '', cta: 'Shop Now', link: '/products', gradient: 'from-red-900 to-purple-900' });
  };

  const toggleBanner = (id, active) => updateMutation.mutate({ id, data: { active: !active } });
  const deleteBanner = (id) => deleteMutation.mutate(id);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-syne font-bold text-base text-foreground">Banner Management</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{banners.filter(b => b.active).length} active banners</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-primary hover:bg-primary/90 font-syne font-bold gap-2">
          <Plus className="w-4 h-4" /> New Banner
        </Button>
      </div>

      {showForm && (
        <div className="p-5 rounded-2xl bg-card border border-primary/20 space-y-3">
          <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-muted/50 border-white/10" />
          <Input placeholder="Subtitle" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="bg-muted/50 border-white/10" />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="CTA" value={form.cta} onChange={e => setForm({ ...form, cta: e.target.value })} className="bg-muted/50 border-white/10" />
            <Input placeholder="Link" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} className="bg-muted/50 border-white/10" />
          </div>
          <Button onClick={addBanner} size="sm" className="bg-primary font-syne font-bold">Save Banner</Button>
        </div>
      )}

      <div className="space-y-2">
        {banners.map(b => (
          <div key={b.id} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-white/5">
            <div className={`w-2 h-10 rounded-full bg-gradient-to-b ${b.gradient}`} />
            <div className="flex-1 min-w-0">
              <p className="font-syne font-bold text-sm text-foreground truncate">{b.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{b.subtitle}</p>
            </div>
            <button onClick={() => toggleBanner(b.id, b.active)} className="text-muted-foreground hover:text-foreground">
              {b.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button onClick={() => deleteBanner(b.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
