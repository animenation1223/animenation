import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '@/api/httpClient';
import { toastService } from '@/lib/toast-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { validatePassword, validateEmail, validateName, getPasswordStrengthColor, getPasswordStrengthPercentage } from '@/lib/validation.js';

export default function Signup() {
  const navigate = useNavigate();
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });

  const passwordValidation = validatePassword(form.password);

  // Validate individual fields
  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          error = 'Name is required';
        } else if (!validateName(value)) {
          error = 'Name must be at least 2 characters';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (!passwordValidation.isValid) {
          error = 'Password does not meet all requirements';
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, form[field]);
  };

  const isFormValid = () => {
    return (
      validateName(form.name) &&
      validateEmail(form.email) &&
      passwordValidation.isValid &&
      !errors.name &&
      !errors.email &&
      !errors.password
    );
  };

  const focusFirstInvalidField = () => {
    if (!validateName(form.name)) {
      nameInputRef.current?.focus();
    } else if (!validateEmail(form.email)) {
      emailInputRef.current?.focus();
    } else if (!passwordValidation.isValid) {
      passwordInputRef.current?.focus();
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ name: true, email: true, password: true });
    
    // Validate all fields
    const nameError = validateField('name', form.name);
    const emailError = validateField('email', form.email);
    const passwordError = validateField('password', form.password);
    
    if (nameError || emailError || passwordError) {
      focusFirstInvalidField();
      return;
    }

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
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="text-xs text-muted-foreground font-medium">Name</label>
            <Input
              id="name"
              ref={nameInputRef}
              value={form.name}
              onChange={e => handleFieldChange('name', e.target.value)}
              onBlur={() => handleFieldBlur('name')}
              aria-invalid={touched.name && !!errors.name}
              aria-describedby={touched.name && errors.name ? 'name-error' : undefined}
              className={`mt-1 ${touched.name && errors.name ? 'border-destructive' : ''}`}
            />
            {touched.name && errors.name && (
              <p id="name-error" className="text-xs text-destructive mt-1" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="text-xs text-muted-foreground font-medium">Email</label>
            <Input
              id="email"
              type="email"
              ref={emailInputRef}
              value={form.email}
              onChange={e => handleFieldChange('email', e.target.value)}
              onBlur={() => handleFieldBlur('email')}
              aria-invalid={touched.email && !!errors.email}
              aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
              className={`mt-1 ${touched.email && errors.email ? 'border-destructive' : ''}`}
            />
            {touched.email && errors.email && (
              <p id="email-error" className="text-xs text-destructive mt-1" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="text-xs text-muted-foreground font-medium">Password</label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                ref={passwordInputRef}
                value={form.password}
                onChange={e => handleFieldChange('password', e.target.value)}
                onBlur={() => handleFieldBlur('password')}
                aria-invalid={touched.password && !!errors.password}
                aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
                className={`pr-10 ${touched.password && errors.password ? 'border-destructive' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p id="password-error" className="text-xs text-destructive mt-1" role="alert">
                {errors.password}
              </p>
            )}

            {/* Password Strength Indicator */}
            {form.password && (
              <div className="mt-2 space-y-2">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordValidation.strength)}`}
                    style={{ width: `${getPasswordStrengthPercentage(passwordValidation.strength)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground capitalize">
                  Password strength: <span className={`font-medium ${
                    passwordValidation.strength === 'strong' ? 'text-green-500' :
                    passwordValidation.strength === 'medium' ? 'text-yellow-500' : 'text-red-500'
                  }`}>{passwordValidation.strength}</span>
                </p>

                {/* Password Requirements Checklist */}
                <div className="space-y-1.5 mt-3">
                  <PasswordRequirement
                    met={passwordValidation.requirements.minLength}
                    text="Minimum 8 characters"
                  />
                  <PasswordRequirement
                    met={passwordValidation.requirements.hasUppercase}
                    text="One uppercase letter"
                  />
                  <PasswordRequirement
                    met={passwordValidation.requirements.hasLowercase}
                    text="One lowercase letter"
                  />
                  <PasswordRequirement
                    met={passwordValidation.requirements.hasNumber}
                    text="One number"
                  />
                  <PasswordRequirement
                    met={passwordValidation.requirements.hasSpecialChar}
                    text="One special character"
                  />
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full font-syne font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating…
              </>
            ) : (
              'Sign Up'
            )}
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

function PasswordRequirement({ met, text }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
      ) : (
        <X className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      )}
      <span className={met ? 'text-foreground' : 'text-muted-foreground'}>{text}</span>
    </div>
  );
}

