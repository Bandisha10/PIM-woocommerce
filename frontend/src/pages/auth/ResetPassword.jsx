import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowLeft, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { AuthInput, PasswordStrengthMeter, AuthAlert } from '../../components/auth/AuthForm';
import { useAuth } from '../../hooks/useAuth';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword, loading, error, clearError } = useAuth();

  const [token, setToken] = useState(location.state?.token || 'NX-7492');
  const [email, setEmail] = useState(location.state?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const validate = () => {
    const errors = {};
    if (!token.trim()) {
      errors.token = 'Reset security token is required.';
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters.';
    } else if (!/[0-9]/.test(newPassword)) {
      errors.newPassword = 'Password must include at least one number.';
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    const res = await resetPassword(token, newPassword, email);
    if (res.success) {
      setSuccessMsg('Your password has been successfully updated! Redirecting to login...');
      setTimeout(() => {
        navigate('/auth/login', { replace: true });
      }, 1500);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card-inner">
        {/* Header */}
        <div className="auth-header-block">
          <div className="auth-step-pill">New Credentials</div>
          <h2 className="auth-main-title">Reset your password</h2>
          <p className="auth-subtitle">
            Create a strong new password for your NEXUS PIM administrator account.
          </p>
        </div>

        {/* Global Error Banner */}
        <AuthAlert type="error" message={error} onDismiss={clearError} />
        {successMsg && <AuthAlert type="success" message={successMsg} />}

        <form onSubmit={handleSubmit} className="auth-form-fields" noValidate>
          {/* Security Token Input */}
          <AuthInput
            id="reset-token"
            label="Security Reset Token"
            type="text"
            icon={KeyRound}
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              if (formErrors.token) setFormErrors({ ...formErrors, token: null });
            }}
            placeholder="e.g. NX-7492"
            error={formErrors.token}
            required
          />

          {/* New Password */}
          <div>
            <AuthInput
              id="reset-new-password"
              label="New Password"
              type="password"
              icon={Lock}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (formErrors.newPassword) setFormErrors({ ...formErrors, newPassword: null });
              }}
              placeholder="Min. 8 characters"
              error={formErrors.newPassword}
              required
              autoComplete="new-password"
            />
            <PasswordStrengthMeter password={newPassword} />
          </div>

          {/* Confirm New Password */}
          <AuthInput
            id="reset-confirm-password"
            label="Confirm New Password"
            type="password"
            icon={Lock}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: null });
            }}
            placeholder="Repeat your new password"
            error={formErrors.confirmPassword}
            required
            autoComplete="new-password"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || Boolean(successMsg)}
            className="btn-auth-primary"
            id="reset-password-btn"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Reset Password</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
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
