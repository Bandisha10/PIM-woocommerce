import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { AuthInput, AuthAlert, AuthDivider } from '../../components/auth/AuthForm';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  // Load remembered email if present
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('nexus_remember_email');
      const savedFlag = localStorage.getItem('nexus_remember_flag');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(savedFlag === 'true');
      }
    } catch {}
  }, []);


  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    const res = await login(email, password, rememberMe);
    if (res.success) {
      setSuccessNotice('Welcome back! Launching NEXUS PIM...');
      const destination = location.state?.from?.pathname || '/dashboard';
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 400);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle(false);
      if (res.success) {
        const destination = location.state?.from?.pathname || '/dashboard';
        navigate(destination, { replace: true });
      }
    } finally {
      setGoogleLoading(false);
    }
  };


  return (
    <AuthLayout>
      <div className="auth-card-inner">
        {/* Card Header */}
        <div className="auth-header-block">
          <div className="auth-step-pill">Secure Authentication</div>
          <h2 className="auth-main-title">Sign in to your account</h2>
          <p className="auth-subtitle">
            Welcome back! Enter your enterprise credentials to access NEXUS PIM.
          </p>
        </div>

        {/* Global Error & Success Alerts */}
        <AuthAlert type="error" message={error} onDismiss={clearError} />
        {successNotice && <AuthAlert type="success" message={successNotice} />}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form-fields" noValidate>
          {/* Email */}
          <AuthInput
            id="login-email"
            label="Email Address"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formErrors.email) setFormErrors({ ...formErrors, email: null });
            }}
            placeholder="you@example.com"
            error={formErrors.email}
            required
            autoComplete="email"
          />

          {/* Password */}
          <AuthInput
            id="login-password"
            label="Password"
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (formErrors.password) setFormErrors({ ...formErrors, password: null });
            }}
            placeholder="Enter your password"
            error={formErrors.password}
            required
            autoComplete="current-password"
          />

          {/* Remember Me & Forgot Password Row */}
          <div className="auth-options-row">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="auth-custom-checkbox"
              />
              <span className="auth-checkbox-text">Remember me</span>
            </label>

            <Link to="/auth/forgot-password" className="auth-forgot-link">
              Forgot password?
            </Link>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="btn-auth-primary"
            id="login-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to NEXUS</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>


        {/* Divider */}
        <AuthDivider text="or sign in with" />

        {/* Google OAuth Button */}
        <GoogleAuthButton
          text="Sign in with Google"
          onClick={handleGoogleLogin}
          isLoading={googleLoading}
          disabled={loading}
        />

        {/* Footer: Create Account Link */}
        <div className="auth-card-footer">
          <span className="text-purple-900/80 text-[14px]">Don't have an account? </span>
          <Link to="/auth/signup" className="auth-switch-link">
            Create an account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
