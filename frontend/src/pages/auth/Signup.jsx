import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { AuthInput, PasswordStrengthMeter, AuthAlert, AuthDivider } from '../../components/auth/AuthForm';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';
import { useAuth } from '../../hooks/useAuth';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, loading, error, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = 'Full Name is required.';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    } else if (!/[0-9]/.test(password)) {
      errors.password = 'Password must contain at least one number.';
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      errors.agreeTerms = 'You must agree to the Terms and Privacy Policy to continue.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    const res = await signup(email, password, name);
    if (res.success) {
      // Navigate to email verification with state
      navigate('/auth/verify-email', {
        state: { email: email.toLowerCase(), name },
        replace: true,
      });
    }
  };

  const handleGoogleSignup = async () => {
    clearError();
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle(true);
      if (res.success) {
        navigate('/dashboard', { replace: true });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card-inner">
        {/* Header */}
        <div className="auth-header-block">
          <div className="auth-step-pill">Get Started</div>
          <h2 className="auth-main-title">Create your account</h2>
          <p className="auth-subtitle">
            Join NEXUS PIM today and centralize your product intelligence.
          </p>
        </div>

        {/* Global Error Banner */}
        <AuthAlert type="error" message={error} onDismiss={clearError} />

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="auth-form-fields" noValidate>
          {/* Full Name */}
          <AuthInput
            id="signup-name"
            label="Full Name"
            type="text"
            icon={User}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (formErrors.name) setFormErrors({ ...formErrors, name: null });
            }}
            placeholder="Alex Rivera"
            error={formErrors.name}
            required
            autoComplete="name"
          />

          {/* Email Address */}
          <AuthInput
            id="signup-email"
            label="Work Email"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formErrors.email) setFormErrors({ ...formErrors, email: null });
            }}
            placeholder="you@company.com"
            error={formErrors.email}
            required
            autoComplete="email"
          />

          {/* Password with Strength Meter */}
          <div>
            <AuthInput
              id="signup-password"
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formErrors.password) setFormErrors({ ...formErrors, password: null });
              }}
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              error={formErrors.password}
              required
              autoComplete="new-password"
            />
            <PasswordStrengthMeter password={password} />
          </div>

          {/* Confirm Password */}
          <AuthInput
            id="signup-confirm-password"
            label="Confirm Password"
            type="password"
            icon={Lock}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: null });
            }}
            placeholder="Repeat your password"
            error={formErrors.confirmPassword}
            required
            autoComplete="new-password"
          />

          {/* Terms & Privacy Agreement */}
          <div className="auth-terms-container">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (formErrors.agreeTerms) setFormErrors({ ...formErrors, agreeTerms: null });
                }}
                className="auth-custom-checkbox"
              />
              <span className="auth-checkbox-text text-[13px]">
                I agree to the{' '}
                <a href="#terms" onClick={(e) => e.preventDefault()} className="text-purple-700 underline font-semibold">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-purple-700 underline font-semibold">
                  Privacy Policy
                </a>
              </span>
            </label>
            {formErrors.agreeTerms && (
              <p className="text-[12px] text-rose-500 mt-1 pl-6">{formErrors.agreeTerms}</p>
            )}
          </div>

          {/* Create Account Submit */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="btn-auth-primary"
            id="signup-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create NEXUS Account</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <AuthDivider text="or sign up with" />

        {/* Google OAuth Button */}
        <GoogleAuthButton
          text="Sign up with Google"
          onClick={handleGoogleSignup}
          isLoading={googleLoading}
          disabled={loading}
        />

        {/* Footer */}
        <div className="auth-card-footer">
          <span className="text-purple-900/80 text-[14px]">Already have an account? </span>
          <Link to="/auth/login" className="auth-switch-link">
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
