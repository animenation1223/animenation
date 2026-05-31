import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '@/api/httpClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { toastService } from '@/lib/toast-service';
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      toast.error('Invalid or missing reset token');
    }
  }, [token]);

  const checkPasswordStrength = (pwd) => {
    let score = 0;
    let feedback = [];

    if (pwd.length >= 8) score++;
    else feedback.push('at least 8 characters');

    if (/[A-Z]/.test(pwd)) score++;
    else feedback.push('an uppercase letter');

    if (/[a-z]/.test(pwd)) score++;
    else feedback.push('a lowercase letter');

    if (/\d/.test(pwd)) score++;
    else feedback.push('a number');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;
    else feedback.push('a special character');

    return {
      score,
      feedback: feedback.length > 0 ? `Missing: ${feedback.join(', ')}` : 'Strong password'
    };
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordStrength.score < 3) {
      toast.error('Password is too weak. Please make it stronger.');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/api/auth/reset-password', { 
        method: 'POST', 
        body: { token, password } 
      });
      toast.success('Password reset successfully! You can now login with your new password.');
      navigate('/login');
    } catch (err) {
      if (err.message?.includes('Invalid or expired token')) {
        toast.error('This reset link has expired or is invalid. Please request a new one.');
        navigate('/forgot-password');
      } else {
        toastService.handleApiError(err, 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border/60 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="font-syne font-extrabold text-2xl text-foreground mb-2">
                Invalid Reset Link
              </h1>
              <p className="text-muted-foreground text-sm">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/forgot-password')}
              className="w-full font-syne font-bold"
            >
              Request New Reset Link
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
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-syne font-extrabold text-2xl text-foreground">
            Reset Password
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">New Password</label>
            <Input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              required
              className="h-11"
              disabled={loading}
            />
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= passwordStrength.score
                          ? passwordStrength.score <= 2
                            ? 'bg-destructive'
                            : passwordStrength.score <= 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{passwordStrength.feedback}</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="h-11"
              disabled={loading}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-destructive mt-1">Passwords do not match</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || password !== confirmPassword || passwordStrength.score < 3}
            className="w-full font-syne font-bold h-11"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
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
