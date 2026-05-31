import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '@/api/httpClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { toastService } from '@/lib/toast-service';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/api/auth/forgot-password', { method: 'POST', body: { email } });
      setEmailSent(true);
      toast.success('If the email exists, a reset link has been sent.');
    } catch (err) {
      toastService.handleApiError(err, 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border/60 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h1 className="font-syne font-extrabold text-2xl text-foreground mb-2">
                Check your email
              </h1>
              <p className="text-muted-foreground text-sm">
                We've sent a password reset link to <span className="text-foreground font-medium">{email}</span>
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              <strong className="text-foreground">Didn't receive the email?</strong>
            </p>
            <p className="text-xs text-muted-foreground text-center">
              • Check your spam folder<br />
              • Make sure the email address is correct<br />
              • The link expires in 30 minutes
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              variant="outline"
              className="w-full font-syne font-bold"
            >
              Try another email
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="w-full font-syne font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border/60 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-syne font-extrabold text-2xl text-foreground">
            Forgot Password
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="h-11"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full font-syne font-bold h-11"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="text-center">
          <Button
            onClick={() => navigate('/login')}
            variant="ghost"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Button>
        </div>
      </div>
    </div>
  );
}
