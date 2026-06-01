import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { apiFetch, setAccessToken } from '@/api/httpClient';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toastService } from '@/lib/toast-service';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkUserAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });
      
      // Store access token in localStorage
      if (response.access_token) {
        setAccessToken(response.access_token);
      }
      
      await checkUserAuth();
      toastService.success('Logged in');
      const returnTo = searchParams.get('return_to');
      navigate(returnTo || '/');
    } catch (err) {
      toastService.authError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border/60 space-y-4">
        <h1 className="font-syne font-extrabold text-2xl text-foreground text-center">Welcome back</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1" />
          </div>
          <Button type="submit" disabled={loading} className="w-full font-syne font-bold">
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
        <div className="text-xs text-muted-foreground flex justify-between">
          <Link to="/signup" className="text-primary hover:underline">Create account</Link>
          <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}

