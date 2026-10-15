import React from 'react';

/**
 * NexusLogo - Bespoke, unique geometric SVG brand logo for NEXUS PIM.
 * Replaces generic package icons with a high-end enterprise isometric nexus prism.
 */
export function NexusMark({ size = 28, className = "" }) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <defs>
        {/* Gradients for the 3 isometric cube facets in dreamy purple + pink */}
        <linearGradient id="nexusFacetTop" x1="24" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDF2F8" />
          <stop offset="45%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>

        <linearGradient id="nexusFacetLeft" x1="4" y1="14" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="60%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>

        <linearGradient id="nexusFacetRight" x1="44" y1="14" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="60%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>

        {/* Accent orbital stream */}
        <linearGradient id="nexusOrbit" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>

        {/* Central Core Glow */}
        <radialGradient id="nexusCoreGlow" cx="24" cy="24" r="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="50%" stopColor="#F472B6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
        </radialGradient>

        {/* Drop shadow */}
        <filter id="nexusShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#EC4899" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Outer Hexagon Halo / Shield */}
      <polygon
        points="24,3 44,14.5 44,37.5 24,47 4,37.5 4,14.5"
        fill="rgba(255, 255, 255, 0.75)"
        stroke="#F3D5FF"
        strokeWidth="1.5"
      />

      {/* Top Facet (Diamond) */}
      <path
        d="M24 6L41 16L24 25L7 16L24 6Z"
        fill="url(#nexusFacetTop)"
        opacity="0.95"
      />

      {/* Bottom Left Facet */}
      <path
        d="M7 16L24 25V44L7 35V16Z"
        fill="url(#nexusFacetLeft)"
        opacity="0.9"
      />

      {/* Bottom Right Facet */}
      <path
        d="M41 16L24 25V44L41 35V16Z"
        fill="url(#nexusFacetRight)"
        opacity="0.9"
      />

      {/* Inner Interlocking Nexus Ring (Dynamic Ribbon) */}
      <path
        d="M24 12L34 18V30L24 36L14 30V18L24 12Z"
        fill="none"
        stroke="url(#nexusOrbit)"
        strokeWidth="2"
        strokeLinejoin="round"
        filter="url(#nexusShadow)"
      />

      {/* Core Node: Central Data Synchronization Pulse */}
      <circle cx="24" cy="25" r="5" fill="url(#nexusCoreGlow)" />
      <circle cx="24" cy="25" r="2.2" fill="#ffffff" />

      {/* Sync Channel Nodes (3 convergence points) */}
      <circle cx="24" cy="9" r="1.5" fill="#38bdf8" />
      <circle cx="11" cy="33" r="1.5" fill="#818cf8" />
      <circle cx="37" cy="33" r="1.5" fill="#06b6d4" />
    </svg>
  );
}

export function NexusLogo({
  size = 28,
  showText = true,
  subtitle = "WooCommerce Core",
  className = "",
  onClick = undefined,
}) {
  return (
    <div
      className={`nexus-brand-identity ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '11px',
        userSelect: 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div
        className="nexus-mark-container"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: `${size + 8}px`,
          height: `${size + 8}px`,
          borderRadius: '12px',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, rgba(245, 243, 255, 0.95) 80%)',
          border: '1px solid #D8B4FE',
          boxShadow: '0 4px 14px rgba(109, 40, 217, 0.15)',
        }}
      >
        <NexusMark size={size} />
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: `${Math.round(size * 0.58)}px`,
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: 'var(--text-main)',
                textTransform: 'uppercase',
              }}
            >
              NEXUS
            </span>
            <span
              style={{
                fontSize: `${Math.round(size * 0.38)}px`,
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                color: '#ffffff',
                letterSpacing: '0.08em',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
              }}
            >
              PIM
            </span>
          </div>
          {subtitle && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                marginTop: '2px',
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default NexusLogo;
