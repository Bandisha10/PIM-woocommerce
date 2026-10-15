import React from 'react';
import { Layers, Database, RefreshCw, TrendingUp, Users, FolderGit2, ShieldCheck, Sparkles } from 'lucide-react';
import NexusLogo from '../../components/NexusLogo';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page-container">
      {/* Dreamy cotton candy ambient background orbs */}
      <div className="auth-ambient-orb orb-1" />
      <div className="auth-ambient-orb orb-2" />
      <div className="auth-ambient-orb orb-3" />

      <div className="auth-split-wrapper">
        {/* LEFT 45%: Deeper Purple Branding Panel */}
        <div className="auth-left-branding-panel">
          <div className="branding-glow-radial" />

          {/* Top Logo & Tagline */}
          <div className="branding-header">
            <div className="flex items-center gap-3">
              <NexusLogo size={38} />
              <div>
                <div className="branding-brand-title">
                  NEXUS <span className="branding-brand-accent">PIM</span>
                </div>
                <div className="branding-brand-subtitle">Enterprise Catalog Core</div>
              </div>
            </div>
            <span className="branding-version-pill">v2.4 Live</span>
          </div>

          {/* Middle: Mockup Illustration with Charts & Metrics */}
          <div className="branding-mockup-wrapper">
            <div className="mockup-floating-card">
              {/* Mockup Window Header */}
              <div className="mockup-card-header">
                <div className="mockup-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-amber" />
                  <span className="dot dot-green" />
                </div>
                <div className="mockup-header-title">
                  <Database size={11} className="text-purple-300" />
                  <span>Supabase Cloud PostgreSQL • Live</span>
                </div>
              </div>

              {/* 3 Metric Pills: Projects 124, Users 1.2k, Growth +18% */}
              <div className="mockup-metrics-grid">
                <div className="mockup-metric-chip">
                  <div className="chip-icon bg-purple-500/25 text-purple-200">
                    <FolderGit2 size={13} />
                  </div>
                  <div>
                    <div className="chip-label">PROJECTS</div>
                    <div className="chip-value">124</div>
                  </div>
                </div>

                <div className="mockup-metric-chip">
                  <div className="chip-icon bg-indigo-500/25 text-indigo-200">
                    <Users size={13} />
                  </div>
                  <div>
                    <div className="chip-label">USERS</div>
                    <div className="chip-value">1.2k</div>
                  </div>
                </div>

                <div className="mockup-metric-chip">
                  <div className="chip-icon bg-emerald-500/25 text-emerald-300">
                    <TrendingUp size={13} />
                  </div>
                  <div>
                    <div className="chip-label">GROWTH</div>
                    <div className="chip-value text-emerald-300">+18%</div>
                  </div>
                </div>
              </div>

              {/* Mini SVG Chart Wave */}
              <div className="mockup-chart-box">
                <div className="chart-header-row">
                  <span className="chart-legend-label">Product Sync Throughput</span>
                  <span className="chart-legend-pill">99.8% Synced</span>
                </div>
                <svg className="mockup-svg-curve" viewBox="0 0 320 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EC4899" stopOpacity="0.45" />
                      <stop offset="50%" stopColor="#A855F7" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F472B6" />
                      <stop offset="50%" stopColor="#C084FC" />
                      <stop offset="100%" stopColor="#FFFFFF" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,60 C40,50 60,25 100,35 C140,45 160,15 200,20 C240,25 270,8 320,12 L320,80 L0,80 Z"
                    fill="url(#chartGradient)"
                  />
                  <path
                    d="M0,60 C40,50 60,25 100,35 C140,45 160,15 200,20 C240,25 270,8 320,12"
                    fill="none"
                    stroke="url(#strokeGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Glowing data points */}
                  <circle cx="100" cy="35" r="4" fill="#FFFFFF" stroke="#EC4899" strokeWidth="2" />
                  <circle cx="200" cy="20" r="4" fill="#FFFFFF" stroke="#A855F7" strokeWidth="2" />
                  <circle cx="320" cy="12" r="5" fill="#FFFFFF" stroke="#F472B6" strokeWidth="2.5" />
                </svg>
              </div>

              {/* Bottom Channel Status Bar */}
              <div className="mockup-channel-bar">
                <div className="flex items-center gap-2">
                  <span className="mockup-pulse-dot" />
                  <span className="text-[12px] font-medium text-white/90">WooCommerce Storefront Live</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-purple-200">
                  <RefreshCw size={11} className="animate-spin text-purple-300" style={{ animationDuration: '6s' }} />
                  <span>Real-time</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Branding Text */}
          <div className="branding-footer">
            <h1 className="branding-hero-title">Welcome to NEXUS PIM</h1>
            <p className="branding-hero-desc">
              Manage your product information securely and efficiently across omni-channel e-commerce architectures.
            </p>
            <div className="branding-badges-row">
              <span className="branding-trust-badge">
                <ShieldCheck size={13} className="text-emerald-300" />
                <span>Enterprise Grade</span>
              </span>
              <span className="branding-trust-badge">
                <Sparkles size={13} className="text-pink-300" />
                <span>Instant WooCommerce Sync</span>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT 55%: White Card with 2px Purple Border */}
        <div className="auth-right-content-panel">
          <div className="auth-form-card">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
