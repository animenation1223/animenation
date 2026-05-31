import React, { useState } from 'react';
import { base44 } from '@/services/api';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { toastService } from '@/lib/toast-service';

const CATEGORIES = ['t-shirts', 'oversized-tshirts', 'hoodies', 'posters', 'stickers', 'keychains', 'manga', 'action-figures', 'phone-covers', 'mouse-pads', 'accessories'];
const ANIME = ['naruto', 'one-piece', 'attack-on-titan', 'demon-slayer', 'dragon-ball', 'jujutsu-kaisen', 'chainsaw-man', 'bleach', 'tokyo-revengers', 'spy-x-family', 'other'];

const EMPTY_PRODUCT = {
  title: '', description: '', price: '', compare_price: '', category: 't-shirts', anime_series: 'naruto',
  image_url: '', sizes: [], tags: [], stock: 0, is_active: true, gsm: '', print_type: '',
};

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [uploading, setUploading] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
    initialData: [],
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, price: Number(data.price), compare_price: data.compare_price ? Number(data.compare_price) : undefined, stock: Number(data.stock) };
      if (editProduct) {
        await base44.entities.Product.update(editProduct.id, payload);
      } else {
        await base44.entities.Product.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['all-products'] });
      setDialogOpen(false);
      toast.success(editProduct ? 'Product updated!' : 'Product created!');
    },
    onError: (error) => {
      toastService.handleApiError(error, editProduct ? 'Failed to update product.' : 'Failed to create product.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
    onError: (error) => {
      toastService.handleApiError(error, 'Failed to delete product.');
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm({ ...form, image_url: file_url });
    } catch (error) {
      toastService.handleApiError(error, 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_PRODUCT);
    setDialogOpen(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      title: product.title || '', description: product.description || '', price: product.price || '',
      compare_price: product.compare_price || '', category: product.category || 't-shirts',
      anime_series: product.anime_series || 'naruto', image_url: product.image_url || '',
      sizes: product.sizes || [], tags: product.tags || [], stock: product.stock || 0,
      is_active: product.is_active !== false, gsm: product.gsm || '', print_type: product.print_type || '',
    });
    setDialogOpen(true);
  };

  const toggleSize = (size) => {
    setForm({ ...form, sizes: form.sizes.includes(size) ? form.sizes.filter(s => s !== size) : [...form.sizes, size] });
  };

  const toggleTag = (tag) => {
    setForm({ ...form, tags: form.tags.includes(tag) ? form.tags.filter(t => t !== tag) : [...form.tags, tag] });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">{products.length} products</p>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 font-syne font-bold">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="space-y-2">
        {products.map(product => (
          <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border/50">
            <div className="w-12 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {product.image_url && <img src={product.image_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{product.title}</p>
              <p className="text-xs text-muted-foreground">{product.category?.replace(/-/g, ' ')} • ₹{product.price}</p>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => openEdit(product)} className="h-8 w-8">
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(product.id)} className="h-8 w-8 text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-syne">{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Title *</Label>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="bg-muted/50 border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Price (₹) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="bg-muted/50 border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Compare Price (₹)</Label>
                <Input type="number" value={form.compare_price} onChange={e => setForm({...form, compare_price: e.target.value})} className="bg-muted/50 border-border mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Stock</Label>
                <Input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="bg-muted/50 border-border mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-muted/50 border-border mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger className="bg-muted/50 border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/-/g, ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Anime Series</Label>
                <Select value={form.anime_series} onValueChange={v => setForm({...form, anime_series: v})}>
                  <SelectTrigger className="bg-muted/50 border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ANIME.map(a => <SelectItem key={a} value={a}>{a.replace(/-/g, ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Image</Label>
              <div className="flex gap-3 mt-1 items-center">
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="bg-muted/50 border-border flex-1" />
                {uploading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              </div>
              {form.image_url && <img src={form.image_url} alt="" className="w-16 h-20 rounded-lg object-cover mt-2" />}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">GSM</Label>
                <Input value={form.gsm} onChange={e => setForm({...form, gsm: e.target.value})} className="bg-muted/50 border-border mt-1" placeholder="e.g. 220" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Print Type</Label>
                <Input value={form.print_type} onChange={e => setForm({...form, print_type: e.target.value})} className="bg-muted/50 border-border mt-1" placeholder="e.g. DTG" />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size => (
                  <button key={size} onClick={() => toggleSize(size)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${form.sizes.includes(size) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {['trending', 'bestseller', 'new-arrival', 'limited'].map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${form.tags.includes(tag) ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="w-full bg-primary hover:bg-primary/90 h-11 font-syne font-bold">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}