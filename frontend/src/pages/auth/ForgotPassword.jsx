import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2, KeyRound } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { AuthInput, AuthAlert } from '../../components/auth/AuthForm';
import { useAuth } from '../../hooks/useAuth';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormError('');

    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const res = await forgotPassword(email.trim().toLowerCase());
    if (res.success) {
      setSuccessData({
        email: res.email,
        token: res.token,
        message: res.message,
      });
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card-inner">
        {/* Header */}
        <div className="auth-header-block">
          <div className="auth-step-pill">Recovery</div>
          <h2 className="auth-main-title">Forgot password?</h2>
          <p className="auth-subtitle">
            Enter your email address and we'll send you instructions and a code to reset your password.
          </p>
        </div>

        {/* Global Error Banner */}
        <AuthAlert type="error" message={error} onDismiss={clearError} />

        {/* Success Screen after submission */}
        {successData ? (
          <div className="forgot-success-card scale-in">
            <div className="success-icon-wrap">
              <CheckCircle2 size={36} className="text-emerald-500" />
            </div>
            <h3 className="success-title">Check your email</h3>
            <p className="success-desc">
              We have sent password recovery instructions and a security token to{' '}
              <strong className="text-purple-900">{successData.email}</strong>.
            </p>

            <div className="security-token-preview">
              <div className="text-[12px] text-purple-700 font-medium">Temporary Reset Token:</div>
              <div className="security-code-badge">{successData.token}</div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate('/auth/reset-password', {
                  state: { email: successData.email, token: successData.token },
                })
              }
              className="btn-auth-primary mt-4"
            >
              <span>Continue to Reset Password</span>
              <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form-fields" noValidate>
            <AuthInput
              id="forgot-email"
              label="Registered Email"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formError) setFormError('');
              }}
              placeholder="you@company.com"
              error={formError}
              required
              autoComplete="email"
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-auth-primary"
              id="send-reset-btn"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="auth-card-footer mt-6">
          <Link to="/auth/login" className="auth-back-link">
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
