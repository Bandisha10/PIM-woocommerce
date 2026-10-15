import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader2, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import AuthLayout from './AuthLayout';
import { AuthAlert } from '../../components/auth/AuthForm';
import { useAuth } from '../../hooks/useAuth';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, loading, error, clearError } = useAuth();

  const userEmail = location.state?.email || 'alex.rivera@nexus-pim.io';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendSeconds, setResendSeconds] = useState(45);
  const [resendStatus, setResendStatus] = useState('');
  const [formError, setFormError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const inputRefs = useRef([]);

  // Countdown for resend timer
  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setInterval(() => {
      setResendSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  // Auto focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (formError) setFormError('');
    clearError();

    // Only allow numbers
    const cleanValue = value.replace(/[^0-9]/g, '');

    if (!cleanValue) {
      const nextOtp = [...otp];
      nextOtp[index] = '';
      setOtp(nextOtp);
      return;
    }

    // Single digit entry
    const nextOtp = [...otp];
    nextOtp[index] = cleanValue.slice(-1);
    setOtp(nextOtp);

    // Auto-advance focus to next input
    if (index < 5 && cleanValue) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // If Backspace pressed on an empty cell, move to previous cell
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const nextOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      nextOtp[i] = pasted[i];
    }
    setOtp(nextOtp);

    // Focus last filled or next empty box
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormError('');

    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setFormError('Please enter the complete 6-digit verification code.');
      return;
    }

    const res = await verifyEmail(fullCode, userEmail);
    if (res.success) {
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch {}
      setSuccessNotice('Email address verified successfully! Launching catalog...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1200);
    }
  };

  const handleResend = () => {
    if (resendSeconds > 0) return;
    setResendSeconds(45);
    setResendStatus('A new 6-digit code has been sent to your email.');
    setTimeout(() => setResendStatus(''), 4000);
  };


  return (
    <AuthLayout>
      <div className="auth-card-inner">
        {/* Header */}
        <div className="auth-header-block">
          <div className="auth-step-pill">Two-Factor Security</div>
          <h2 className="auth-main-title">Verify your email</h2>
          <p className="auth-subtitle">
            We sent a 6-digit verification code to{' '}
            <strong className="text-purple-900">{userEmail}</strong>. Enter it below to activate your account.
          </p>
        </div>

        {/* Global Error & Success Banners */}
        <AuthAlert type="error" message={error || formError} onDismiss={() => { clearError(); setFormError(''); }} />
        {successNotice && <AuthAlert type="success" message={successNotice} />}
        {resendStatus && <AuthAlert type="success" message={resendStatus} />}

        {/* 6 Digit OTP Inputs */}
        <form onSubmit={handleSubmit} className="auth-form-fields" noValidate>
          <div className="otp-container" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`otp-digit-box ${digit ? 'is-filled' : ''}`}
                autoComplete="one-time-code"
              />
            ))}
          </div>


          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || Boolean(successNotice)}
            className="btn-auth-primary mt-2"
            id="verify-email-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Verifying Security Code...</span>
              </>
            ) : (
              <>
                <span>Verify & Continue</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Resend Code Row */}
        <div className="otp-resend-row">
          {resendSeconds > 0 ? (
            <span className="text-[13px] text-purple-900/70">
              Resend verification code in{' '}
              <strong className="text-purple-900 font-bold">{resendSeconds}s</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="otp-resend-btn"
            >
              <RefreshCw size={13} />
              <span>Resend verification code</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="auth-card-footer mt-4">
          <Link to="/auth/login" className="auth-switch-link text-[13px]">
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
