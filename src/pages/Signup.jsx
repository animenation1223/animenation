import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '@/api/httpClient';
import { toastService } from '@/lib/toast-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/api/auth/signup', { method: 'POST', body: form });
      toastService.success('Account created. Check email to verify (in dev, see response token).');
      navigate('/login');
    } catch (err) {
      toastService.authError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border/60 space-y-4">
        <h1 className="font-syne font-extrabold text-2xl text-foreground text-center">Create your account</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Name</label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Password</label>
            <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required className="mt-1" />
            <p className="text-[11px] text-muted-foreground mt-1">Min 8 chars, include upper, lower, number.</p>
          </div>
          <Button type="submit" disabled={loading} className="w-full font-syne font-bold">
            {loading ? 'Creating…' : 'Sign Up'}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

