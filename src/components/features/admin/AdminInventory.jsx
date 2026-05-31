import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, Search, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminInventory() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list(),
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, stock }) => base44.entities.Product.update(id, { stock }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Stock updated'); setEditingId(null); },
  });

  const filtered = products.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));
  const outOfStock = products.filter(p => !p.stock || p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const healthy = products.filter(p => p.stock > 5).length;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
          <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="font-syne font-extrabold text-2xl text-green-400">{healthy}</p>
          <p className="text-xs text-muted-foreground">Healthy Stock</p>
        </div>
        <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-center">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="font-syne font-extrabold text-2xl text-yellow-400">{lowStock}</p>
          <p className="text-xs text-muted-foreground">Low Stock (≤5)</p>
        </div>
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-center">
          <XCircle className="w-5 h-5 text-destructive mx-auto mb-1" />
          <p className="font-syne font-extrabold text-2xl text-destructive">{outOfStock}</p>
          <p className="text-xs text-muted-foreground">Out of Stock</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="pl-9 bg-muted/50 border-white/10" />
      </div>

      <div className="rounded-2xl bg-card border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-muted-foreground">
                <th className="text-left px-4 py-3 font-syne font-bold">Product</th>
                <th className="text-left px-4 py-3 font-syne font-bold">Category</th>
                <th className="text-left px-4 py-3 font-syne font-bold">Price</th>
                <th className="text-left px-4 py-3 font-syne font-bold">Stock</th>
                <th className="text-left px-4 py-3 font-syne font-bold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const stockStatus = !p.stock || p.stock === 0 ? 'out' : p.stock <= 5 ? 'low' : 'ok';
                return (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <p className="font-medium text-foreground line-clamp-1 max-w-[160px]">{p.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize text-xs">{p.category?.replace(/-/g,' ')}</td>
                    <td className="px-4 py-3 font-syne font-bold text-foreground">₹{p.price}</td>
                    <td className="px-4 py-3">
                      {editingId === p.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editStock}
                            onChange={e => setEditStock(e.target.value)}
                            className="w-20 h-7 text-xs bg-muted/50 border-white/10"
                            autoFocus
                          />
                          <Button size="sm" className="h-7 text-xs px-2 bg-primary" onClick={() => updateMutation.mutate({ id: p.id, stock: parseInt(editStock) || 0 })}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => setEditingId(null)}>✕</Button>
                        </div>
                      ) : (
                        <span className={`font-syne font-bold ${stockStatus === 'out' ? 'text-destructive' : stockStatus === 'low' ? 'text-yellow-400' : 'text-foreground'}`}>
                          {p.stock ?? 0}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-syne font-bold ${
                        stockStatus === 'out' ? 'bg-destructive/10 text-destructive' :
                        stockStatus === 'low' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-green-500/10 text-green-400'
                      }`}>
                        {stockStatus === 'out' ? 'Out of Stock' : stockStatus === 'low' ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setEditingId(p.id); setEditStock(String(p.stock ?? 0)); }}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}