import React, { useState } from 'react';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';

export function AuthInput({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  autoComplete,
  id,
  name,
  disabled = false,
  rightElement,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="auth-field-group">
      {label && (
        <label htmlFor={id} className="auth-field-label">
          {label} {required && <span className="text-pink-500">*</span>}
        </label>
      )}
      <div className={`auth-input-wrapper ${error ? 'has-error' : ''}`}>
        {Icon && (
          <span className="auth-input-icon">
            <Icon size={18} />
          </span>
        )}
        <input
          id={id}
          name={name || id}
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          className="auth-input-control"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="auth-password-toggle-btn"
            title={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {rightElement}
      </div>
      {error && (
        <div className="auth-field-error">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export function PasswordStrengthMeter({ password = '' }) {
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasLength) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  const labels = ['Too weak', 'Fair', 'Good', 'Strong'];
  const colors = [
    'bg-rose-400',
    'bg-amber-400',
    'bg-purple-500',
    'bg-emerald-500',
  ];

  if (!password) return null;

  return (
    <div className="auth-strength-meter">
      <div className="strength-bars-row">
        {[0, 1, 2, 3].map((step) => (
          <div
            key={step}
            className={`strength-bar-pill ${
              step < score ? colors[Math.min(score - 1, 3)] : 'bg-purple-200/50'
            }`}
          />
        ))}
      </div>
      <div className="strength-label-row">
        <span className="strength-text">
          Strength: <strong>{score > 0 ? labels[score - 1] : 'Too short'}</strong>
        </span>
        <span className="strength-tip">Min. 8 characters + number</span>
      </div>
    </div>
  );
}

export function AuthAlert({ type = 'error', message, onDismiss }) {
  if (!message) return null;
  const isError = type === 'error';

  return (
    <div className={`auth-alert-banner ${isError ? 'alert-error' : 'alert-success'} scale-in`}>
      <div className="alert-content">
        {isError ? (
          <AlertCircle size={18} className="alert-icon text-rose-500" />
        ) : (
          <Check size={18} className="alert-icon text-emerald-500" />
        )}
        <span className="alert-message">{message}</span>
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="alert-dismiss-btn">
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export function AuthDivider({ text = 'or continue with' }) {
  return (
    <div className="auth-divider-container">
      <div className="auth-divider-line" />
      <span className="auth-divider-label">{text}</span>
      <div className="auth-divider-line" />
    </div>
  );
}
