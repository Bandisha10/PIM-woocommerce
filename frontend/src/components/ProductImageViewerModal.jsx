import React, { useState, useEffect, useCallback } from 'react';
import {
  X, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Copy, Check,
  ChevronLeft, ChevronRight, Edit3, ImageOff, Tag, CheckCircle2, Clock, AlertTriangle
} from 'lucide-react';

export default function ProductImageViewerModal({
  isOpen,
  onClose,
  product,
  allProducts = [],
  onSelectProduct,
  onEditProduct,
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Keep track of current product id to reset zoom & error state on change
  const [prevProductId, setPrevProductId] = useState(product?.id);
  if (product && product.id !== prevProductId) {
    setPrevProductId(product.id);
    setZoomLevel(1);
    setImageError(false);
    setCopied(false);
  }

  const currentIndex = allProducts.findIndex((p) => p.id === product?.id);
  const hasMultiple = allProducts.length > 1;

  const handlePrev = useCallback(() => {
    if (!hasMultiple || currentIndex === -1) return;
    const nextIdx = (currentIndex - 1 + allProducts.length) % allProducts.length;
    onSelectProduct?.(allProducts[nextIdx]);
  }, [hasMultiple, currentIndex, allProducts, onSelectProduct]);

  const handleNext = useCallback(() => {
    if (!hasMultiple || currentIndex === -1) return;
    const nextIdx = (currentIndex + 1) % allProducts.length;
    onSelectProduct?.(allProducts[nextIdx]);
  }, [hasMultiple, currentIndex, allProducts, onSelectProduct]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(Number((prev + 0.35).toFixed(2)), 2.8));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(Number((prev - 0.35).toFixed(2)), 0.65));
  }, []);

  const handleToggleZoom = useCallback(() => {
    setZoomLevel((prev) => {
      if (prev === 1) return 1.75;
      if (prev === 1.75) return 2.5;
      return 1;
    });
  }, []);

  // Keyboard navigation: ESC to close, Left/Right arrows to navigate, +/- to zoom
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        setZoomLevel(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext, handleZoomIn, handleZoomOut]);

  if (!isOpen || !product) return null;

  const handleCopyUrl = async () => {
    if (!product.image_url) return;
    try {
      await navigator.clipboard.writeText(product.image_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleOpenExternal = () => {
    if (product.image_url) {
      window.open(product.image_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="image-viewer-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="image-viewer-card" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="image-viewer-header">
          <div className="image-viewer-title-group">
            <h3>{product.name}</h3>
            <span className="sku-badge">{product.sku}</span>
            {product.category && (
              <span className="attr-tag">
                <Tag size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                {product.category}
              </span>
            )}
            {hasMultiple && currentIndex !== -1 && (
              <span className="image-viewer-counter">
                {currentIndex + 1} of {allProducts.length}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="image-viewer-kbd-hint" title="Keyboard shortcuts: ESC to close, ← → to browse, +/- to zoom">
              ESC
            </span>
            <button
              className="btn-icon-square"
              onClick={onClose}
              title="Close image viewer (ESC)"
              aria-label="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Central Image Viewing Stage */}
        <div className="image-viewer-stage">
          {/* Navigation Arrows */}
          {hasMultiple && (
            <>
              <button
                className="image-viewer-nav-btn prev"
                onClick={handlePrev}
                title="Previous product image (Left arrow)"
                aria-label="Previous image"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                className="image-viewer-nav-btn next"
                onClick={handleNext}
                title="Next product image (Right arrow)"
                aria-label="Next image"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Image Display */}
          {product.image_url && !imageError ? (
            <div
              className="image-viewer-img-container"
              onClick={handleToggleZoom}
              title="Click to zoom in / reset"
              style={{ cursor: zoomLevel > 1 ? 'zoom-out' : 'zoom-in' }}
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="image-viewer-img"
                style={{
                  transform: `scale(${zoomLevel})`,
                }}
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="image-viewer-fallback">
              <div className="image-viewer-fallback-icon">
                {imageError ? <ImageOff size={48} /> : (product.emoji || '📦')}
              </div>
              <h4>{imageError ? 'Image could not be loaded' : 'No Image Uploaded Yet'}</h4>
              <p>
                {imageError
                  ? 'The image URL is invalid or blocked by CORS. You can update the product image URL.'
                  : 'Add a high-resolution image URL to showcase this product in WooCommerce.'}
              </p>
              {product.image_url && (
                <div className="image-viewer-broken-url" title={product.image_url}>
                  {product.image_url}
                </div>
              )}
              {onEditProduct && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '14px' }}
                  onClick={() => {
                    onClose();
                    onEditProduct(product);
                  }}
                >
                  <Edit3 size={14} /> Edit Image URL
                </button>
              )}
            </div>
          )}

          {/* Floating Zoom Bar (only if valid image) */}
          {product.image_url && !imageError && (
            <div className="image-viewer-zoom-bar">
              <button
                className="image-viewer-zoom-btn"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.65}
                title="Zoom Out (-)"
              >
                <ZoomOut size={15} />
              </button>
              <span className="image-viewer-zoom-level">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                className="image-viewer-zoom-btn"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2.8}
                title="Zoom In (+)"
              >
                <ZoomIn size={15} />
              </button>
              <button
                className="image-viewer-zoom-btn"
                onClick={() => setZoomLevel(1)}
                title="Reset Zoom (0)"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Thumbnail Filmstrip (Quick browse other products) */}
        {hasMultiple && (
          <div className="image-viewer-filmstrip">
            {allProducts.map((p) => {
              const isActive = p.id === product.id;
              return (
                <button
                  key={p.id}
                  className={`filmstrip-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectProduct?.(p)}
                  title={`${p.name} (${p.sku})`}
                >
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="filmstrip-thumb-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="filmstrip-thumb-emoji">{p.emoji || '📦'}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom Details & Action Bar */}
        <div className="image-viewer-footer">
          <div className="image-viewer-meta-left">
            <div className="image-viewer-price">
              ${(product.price ?? 0).toFixed(2)}
              {product.sale_price && (
                <span className="image-viewer-sale">Sale: ${product.sale_price.toFixed(2)}</span>
              )}
            </div>

            <span className="image-viewer-stock">
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: (product.stock ?? 0) < 10 ? '#f59e0b' : '#10b981',
                  display: 'inline-block',
                }}
              />
              {product.stock ?? 0} units in stock
            </span>

            {/* Status indicator */}
            {product.status === 'synced' && (
              <span className="status-pill synced" style={{ fontSize: '11px', padding: '3px 8px' }}>
                <CheckCircle2 size={11} /> Synced #{product.woo_id || 'Live'}
              </span>
            )}
            {product.status === 'pending' && (
              <span className="status-pill pending" style={{ fontSize: '11px', padding: '3px 8px' }}>
                <Clock size={11} /> Pending Sync
              </span>
            )}
            {product.status === 'conflict' && (
              <span className="status-pill conflict" style={{ fontSize: '11px', padding: '3px 8px' }}>
                <AlertTriangle size={11} /> Conflict
              </span>
            )}
          </div>

          <div className="image-viewer-meta-right">
            {product.image_url && (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={handleCopyUrl}
                  title="Copy direct image URL to clipboard"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied URL!' : 'Copy Link'}</span>
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={handleOpenExternal}
                  title="Open original high-res image in new tab"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  <ExternalLink size={14} />
                  <span>Open Full Res</span>
                </button>
              </>
            )}

            {onEditProduct && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  onEditProduct(product);
                }}
                title="Edit product details, image, or pricing"
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                <Edit3 size={14} />
                <span>Edit Product</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
