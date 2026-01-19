import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { bookMetadata, authorBio, tableOfContents, resources, subscriptionBenefits } from './lib/book-data';

// Types
interface EmailFormState {
  email: string;
  loading: boolean;
  error: string;
  success: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceCents: number;
  type: string;
}

interface PodLink {
  label: string;
  url: string;
  flag: string;
}

interface OrderInfo {
  id: number;
  productType: string;
  purchaseDate?: string;
  downloadToken: string;
  downloadExpiry: string;
  downloadsRemaining: number;
}

// Analytics helper
const trackEvent = (eventName: string, properties: Record<string, string> = {}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }
  console.log('Track:', eventName, properties);
};

// Navigation Component
const Navigation: React.FC<{ currentPage: string; setPage: (page: string) => void }> = ({ currentPage, setPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'pre-order', label: 'Pre-Order' },
    { id: 'book-preview', label: 'Book Preview' },
    { id: 'about', label: 'About' },
    { id: 'resources', label: 'Resources' },
  ];

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-content">
        <a href="#" className="navbar-logo" onClick={(e) => { e.preventDefault(); setPage('home'); }}>
          Curls & Contemplation
        </a>
        <button
          className="mobile-menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <ul className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                onClick={(e) => { e.preventDefault(); setPage(link.id); setMobileMenuOpen(false); }}
                aria-current={currentPage === link.id ? 'page' : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

// Email Signup Form Component
const EmailSignupForm: React.FC<{ source: string; compact?: boolean }> = ({ source, compact = false }) => {
  const [formState, setFormState] = useState<EmailFormState>({
    email: '',
    loading: false,
    error: '',
    success: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      setFormState(s => ({ ...s, error: 'Please enter a valid email address' }));
      return;
    }

    setFormState(s => ({ ...s, loading: true, error: '' }));
    trackEvent('email_signup_submit', { source });

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formState.email, source }),
      });

      if (!response.ok) {
        throw new Error('Subscription failed');
      }

      setFormState(s => ({ ...s, loading: false, success: true }));
      trackEvent('email_signup_success', { source });
      localStorage.setItem('subscribed', 'true');
    } catch {
      setFormState(s => ({ ...s, loading: false, error: 'Something went wrong. Please try again.' }));
      trackEvent('email_signup_error', { source });
    }
  };

  if (formState.success) {
    return (
      <div className="email-signup">
        <p style={{ color: 'var(--color-teal)', fontWeight: 600 }}>
          Thank you for subscribing! Check your email to confirm.
        </p>
      </div>
    );
  }

  return (
    <div className={compact ? '' : 'email-signup'}>
      {!compact && (
        <>
          <h3>Get Exclusive Updates</h3>
          <p>Be the first to know about the launch and receive free resources.</p>
        </>
      )}
      <form onSubmit={handleSubmit} className="email-form">
        <input
          type="email"
          className={`form-input ${formState.error ? 'error' : ''}`}
          placeholder="Enter your email"
          value={formState.email}
          onChange={(e) => setFormState(s => ({ ...s, email: e.target.value, error: '' }))}
          aria-label="Email address"
          required
        />
        <button type="submit" className="btn btn-secondary" disabled={formState.loading}>
          {formState.loading ? <span className="loading" /> : 'Subscribe'}
        </button>
      </form>
      {formState.error && <p className="form-error">{formState.error}</p>}
    </div>
  );
};

// Hero Section
const HeroSection: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  return (
    <section className="hero" id="main-content">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="display-title">{bookMetadata.title}</h1>
            <span className="hero-subtitle">{bookMetadata.subtitle}</span>
            <p className="hero-description">{bookMetadata.description}</p>
            <p className="hero-author">By {bookMetadata.author}</p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => setPage('pre-order')}>
                Pre-Order Now
              </button>
              <a href="#book-preview" className="btn btn-outline" onClick={(e) => { e.preventDefault(); setPage('book-preview'); }}>
                Explore the Book
              </a>
            </div>
            <EmailSignupForm source="hero" />
          </div>
          <div className="hero-image">
            <img
              src={bookMetadata.coverImage}
              alt={`Book cover of ${bookMetadata.fullTitle}`}
              className="book-cover"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// Author Section
const AuthorSection: React.FC = () => {
  return (
    <section className="section author-section" id="about-author">
      <div className="container">
        <div className="author-content">
          <div>
            <img
              src={bookMetadata.authorImage}
              alt={authorBio.name}
              className="author-photo"
              loading="lazy"
            />
          </div>
          <div className="author-bio">
            <h2 className="display-title">About the Author</h2>
            <a href={authorBio.instagramUrl} className="author-handle" target="_blank" rel="noopener noreferrer">
              {authorBio.handle}
            </a>
            <p>{authorBio.shortBio}</p>
            <p>{authorBio.fullBio.split('\n\n')[1]}</p>
            <blockquote className="author-highlight">
              "{authorBio.transformativeStory.split(':')[1]?.trim().slice(0, -1)}"
            </blockquote>
            <ul className="credentials-list">
              <li>Rihanna's day-to-day hairstylist</li>
              <li>SAG & BET Awards red carpet stylist</li>
              <li>Nike "Greatest Dynasty Ever" campaign</li>
              <li>Harper's Bazaar, W Magazine contributor</li>
              <li>Sergio Hudson runway collections</li>
              <li>12+ years global industry experience</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

// Table of Contents Section
const TableOfContentsSection: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  return (
    <section className="section toc-section" id="table-of-contents">
      <div className="container">
        <div className="toc-header">
          <h2 className="display-title">Inside the Book</h2>
          <p className="toc-subtitle">4 Parts, 16 Chapters, and interactive elements to guide your journey</p>
        </div>
        <div className="toc-grid">
          {tableOfContents.parts.map((part) => (
            <div key={part.number} className="toc-part">
              <span className="toc-part-title">Part {part.number}</span>
              <h3>{part.title}</h3>
              <ul className="toc-chapters">
                {part.chapters.map((chapter) => (
                  <li key={chapter.number}>
                    <span className="chapter-num">{chapter.romanNumeral}</span>
                    {chapter.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="toc-matter">
          <h4>Interactive Elements Included</h4>
          <ul className="toc-matter-list">
            {tableOfContents.interactiveElements.map((item, i) => (
              <li key={i} className="interactive-badge">{item}</li>
            ))}
          </ul>
        </div>
        <div className="text-center" style={{ marginTop: 'var(--space-lg)' }}>
          <button className="btn btn-primary" onClick={() => setPage('pre-order')}>Pre-Order Now</button>
        </div>
      </div>
    </section>
  );
};

// Pre-Order Page
const PreOrderPage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [podLinks, setPodLinks] = useState<Record<string, PodLink>>({});
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products);
        setPodLinks(data.podLinks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCheckout = async (productId: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setCheckoutLoading(productId);
    setError('');
    trackEvent('checkout_initiated', { product_id: productId });

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      trackEvent('checkout_error', { product_id: productId });
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <section className="section" style={{ paddingTop: '120px', minHeight: '100vh' }}>
      <div className="container">
        <div className="toc-header">
          <h1 className="display-title">Pre-Order Your Copy</h1>
          <p className="toc-subtitle">Choose your preferred format and start your journey to creative excellence</p>
        </div>

        {/* eBook Section */}
        <div style={{ maxWidth: '600px', margin: '0 auto var(--space-xl)' }}>
          <div className="resource-card" style={{ padding: 'var(--space-lg)' }}>
            <span className="resource-category">Digital Edition</span>
            <h2 style={{ marginBottom: 'var(--space-sm)' }}>eBook</h2>
            <p style={{ marginBottom: 'var(--space-md)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-gold)' }}>
              $14.99
            </p>
            <ul style={{ marginBottom: 'var(--space-md)', textAlign: 'left' }}>
              <li>Instant digital delivery</li>
              <li>Interactive worksheets included</li>
              <li>Read on any device</li>
              <li>Lifetime access</li>
            </ul>

            <div className="form-group" style={{ marginBottom: 'var(--space-sm)' }}>
              <label className="form-label" htmlFor="checkout-email">Email for delivery</label>
              <input
                id="checkout-email"
                type="email"
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
              />
              {error && <p className="form-error">{error}</p>}
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={() => handleCheckout('ebook')}
              disabled={checkoutLoading === 'ebook' || loading}
            >
              {checkoutLoading === 'ebook' ? <span className="loading" /> : 'Buy eBook - $14.99'}
            </button>

            <p style={{ marginTop: 'var(--space-sm)', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>

        {/* Print Book Section */}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>Prefer Print?</h2>
          <p style={{ textAlign: 'center', marginBottom: 'var(--space-lg)', color: 'var(--color-muted)' }}>
            Order the beautiful print edition through Amazon Print-on-Demand
          </p>

          <div className="resources-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {Object.entries(podLinks).map(([key, link]) => (
              <a
                key={key}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="resource-card"
                style={{ textAlign: 'center', textDecoration: 'none' }}
                onClick={() => trackEvent('pod_click', { region: link.flag })}
              >
                <span style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)', display: 'block' }}>
                  {link.flag === 'US' ? '🇺🇸' : link.flag === 'UK' ? '🇬🇧' : '🇨🇦'}
                </span>
                <h3 style={{ marginBottom: 'var(--space-xs)' }}>{link.label}</h3>
                <span className="btn btn-outline btn-sm">Order on Amazon</span>
              </a>
            ))}
          </div>
        </div>

        {/* Already purchased */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--color-border)' }}>
          <p style={{ marginBottom: 'var(--space-sm)' }}>Already purchased?</p>
          <button className="btn btn-outline" onClick={() => setPage('order-portal')}>
            Access Your Downloads
          </button>
        </div>

        {/* Legal links */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
          <a href="/terms" style={{ marginRight: 'var(--space-md)' }}>Terms of Service</a>
          <a href="/privacy" style={{ marginRight: 'var(--space-md)' }}>Privacy Policy</a>
          <a href="/pre-order-policy">Pre-Order Policy</a>
        </div>
      </div>
    </section>
  );
};

// Order Portal Page
const OrderPortalPage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<OrderInfo[] | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setNotFound(false);
    trackEvent('order_portal_lookup', { source: 'order_portal' });

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Lookup failed');
      }

      if (data.found) {
        setOrders(data.orders);
        trackEvent('order_portal_found', { order_count: data.orders.length.toString() });
      } else {
        setNotFound(true);
        trackEvent('order_portal_not_found', {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (token: string) => {
    trackEvent('download_initiated', { token: token.slice(0, 8) });
    window.open(`/api/download?token=${token}`, '_blank');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section className="section" style={{ paddingTop: '120px', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="toc-header">
          <h1 className="display-title">Order Portal</h1>
          <p className="toc-subtitle">Access your purchased eBooks and download links</p>
        </div>

        {!orders ? (
          <div className="resource-card" style={{ padding: 'var(--space-lg)' }}>
            <form onSubmit={handleLookup}>
              <div className="form-group">
                <label className="form-label" htmlFor="portal-email">Email Address</label>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: 'var(--space-sm)' }}>
                  Enter the email address you used for your purchase
                </p>
                <input
                  id="portal-email"
                  type="email"
                  className={`form-input ${error ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); setNotFound(false); }}
                  required
                />
                {error && <p className="form-error">{error}</p>}
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? <span className="loading" /> : 'Find My Orders'}
              </button>
            </form>

            {notFound && (
              <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--color-bg-alt)', borderRadius: '8px' }}>
                <p style={{ marginBottom: 'var(--space-sm)' }}>No orders found for this email address.</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                  If you believe this is an error, please check the email address or contact support.
                </p>
                <button className="btn btn-outline" style={{ marginTop: 'var(--space-sm)' }} onClick={() => setPage('pre-order')}>
                  Pre-Order Now
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: 'var(--color-muted)' }}>Showing orders for: <strong>{email}</strong></p>
              <button className="btn btn-outline btn-sm" onClick={() => { setOrders(null); setEmail(''); }}>
                Different Email
              </button>
            </div>

            {orders.map((order) => (
              <div key={order.id} className="resource-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                  <div>
                    <span className="resource-category">{order.productType === 'ebook' ? 'Digital Edition' : order.productType}</span>
                    <h3>Curls & Contemplation</h3>
                    {order.purchaseDate && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                        Purchased: {formatDate(order.purchaseDate)}
                      </p>
                    )}
                  </div>
                  <span style={{ background: 'var(--color-teal)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem' }}>
                    Completed
                  </span>
                </div>

                <div style={{ background: 'var(--color-bg-alt)', padding: 'var(--space-md)', borderRadius: '8px', marginBottom: 'var(--space-md)' }}>
                  <p style={{ fontSize: '0.875rem', marginBottom: 'var(--space-xs)' }}>
                    <strong>Downloads remaining:</strong> {order.downloadsRemaining} of 5
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                    Link expires: {formatDate(order.downloadExpiry)}
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => handleDownload(order.downloadToken)}
                  disabled={order.downloadsRemaining <= 0}
                >
                  {order.downloadsRemaining > 0 ? 'Download eBook (EPUB)' : 'Download Limit Reached'}
                </button>

                {order.downloadsRemaining <= 0 && (
                  <p style={{ marginTop: 'var(--space-sm)', fontSize: '0.875rem', color: 'var(--color-muted)', textAlign: 'center' }}>
                    Need more downloads? Contact support for assistance.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
          <button className="btn btn-outline" onClick={() => setPage('home')}>
            Back to Home
          </button>
        </div>
      </div>
    </section>
  );
};

// Order Confirmation Page
const OrderConfirmationPage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setError('No order information found');
      setLoading(false);
      return;
    }

    fetch(`/api/order?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrder({
            id: data.order.id,
            productType: data.order.productType,
            downloadToken: data.downloadToken,
            downloadExpiry: data.downloadExpiry,
            downloadsRemaining: data.downloadsRemaining,
          });
          trackEvent('order_confirmed', { order_id: data.order.id.toString() });
        } else {
          setError('Order is still being processed. Please check back shortly.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load order information');
        setLoading(false);
      });
  }, []);

  const handleDownload = () => {
    if (order) {
      trackEvent('download_initiated', { source: 'confirmation' });
      window.open(`/api/download?token=${order.downloadToken}`, '_blank');
    }
  };

  if (loading) {
    return (
      <section className="section" style={{ paddingTop: '120px', minHeight: '100vh', textAlign: 'center' }}>
        <div className="container">
          <span className="loading" style={{ width: '48px', height: '48px' }} />
          <p style={{ marginTop: 'var(--space-md)' }}>Loading your order...</p>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="section" style={{ paddingTop: '120px', minHeight: '100vh' }}>
        <div className="container" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h1 className="display-title">Order Processing</h1>
          <p style={{ marginBottom: 'var(--space-md)', color: 'var(--color-muted)' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => setPage('order-portal')}>
            Check Order Portal
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="thank-you-content">
      <div className="container">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="success-icon">✓</div>
          <h1 className="display-title">Thank You!</h1>
          <p style={{ marginBottom: 'var(--space-lg)' }}>
            Your purchase is complete. You can download your eBook below.
          </p>

          <div className="resource-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ marginBottom: 'var(--space-md)' }}>Your Download</h3>

            <div style={{ background: 'var(--color-bg-alt)', padding: 'var(--space-md)', borderRadius: '8px', marginBottom: 'var(--space-md)' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: 'var(--space-xs)' }}>
                <strong>Downloads remaining:</strong> {order.downloadsRemaining} of 5
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                Link expires: {new Date(order.downloadExpiry).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleDownload}>
              Download eBook (EPUB)
            </button>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: 'var(--space-md)' }}>
            A confirmation email has been sent with your download link. You can also access your purchases anytime from the Order Portal.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={() => setPage('order-portal')}>
              Order Portal
            </button>
            <button className="btn btn-outline" onClick={() => setPage('home')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Email Gate Modal
const EmailGateModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    trackEvent('email_gate_submit', { source: 'resources' });

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'resources_gate' }),
      });

      if (!response.ok) throw new Error('Failed');

      localStorage.setItem('subscribed', 'true');
      trackEvent('email_gate_success', { source: 'resources' });
      onSuccess();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Get Your Free Resource</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: 'var(--space-md)' }}>
            Enter your email to access free downloadable resources and get exclusive updates about the book launch.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="gate-email">Email Address</label>
              <input
                id="gate-email"
                type="email"
                className={`form-input ${error ? 'error' : ''}`}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                required
              />
              {error && <p className="form-error">{error}</p>}
            </div>
            <div className="form-group form-checkbox">
              <input type="checkbox" id="gdpr" required />
              <label htmlFor="gdpr">I agree to receive email updates. You can unsubscribe anytime.</label>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? <span className="loading" /> : 'Get Access'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Resources Page
const ResourcesPage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  const handleDownload = (resourceId: string, downloadUrl: string) => {
    const isSubscribed = localStorage.getItem('subscribed') === 'true';

    if (isSubscribed) {
      trackEvent('resource_download', { resource_id: resourceId });
      window.open(downloadUrl, '_blank');
    } else {
      setSelectedResource(resourceId);
      setModalOpen(true);
    }
  };

  const handleGateSuccess = () => {
    setModalOpen(false);
    if (selectedResource) {
      const resource = resources.find(r => r.id === selectedResource);
      if (resource) {
        trackEvent('resource_download', { resource_id: selectedResource });
        window.open(resource.downloadUrl, '_blank');
      }
    }
  };

  const categories = ['Foundations', 'Professional Practice', 'Business Strategies', 'Future Growth'];

  return (
    <>
      <section className="section" style={{ paddingTop: '120px' }}>
        <div className="container">
          <div className="toc-header">
            <h1 className="display-title">Free Resources</h1>
            <p className="toc-subtitle">Downloadable tools to support your hairstyling journey</p>
          </div>

          {categories.map(category => {
            const categoryResources = resources.filter(r => r.category === category);
            if (categoryResources.length === 0) return null;

            return (
              <div key={category} style={{ marginBottom: 'var(--space-xl)' }}>
                <h2 style={{ marginBottom: 'var(--space-md)' }}>{category}</h2>
                <div className="resources-grid">
                  {categoryResources.map(resource => (
                    <div key={resource.id} className="resource-card">
                      <span className="resource-category">{resource.category}</span>
                      <h3>{resource.title}</h3>
                      <p>{resource.description}</p>
                      <button
                        className="btn btn-outline"
                        onClick={() => handleDownload(resource.id, resource.downloadUrl)}
                      >
                        Download PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="text-center" style={{ marginTop: 'var(--space-xl)' }}>
            <h3 style={{ marginBottom: 'var(--space-sm)' }}>Want the complete toolkit?</h3>
            <p style={{ marginBottom: 'var(--space-md)', color: 'var(--color-muted)' }}>
              Pre-order the book to get all interactive worksheets and resources.
            </p>
            <button className="btn btn-primary" onClick={() => setPage('pre-order')}>Pre-Order Now</button>
          </div>
        </div>
      </section>
      <EmailGateModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={handleGateSuccess} />
    </>
  );
};

// Newsletter Page
const NewsletterPage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const [formState, setFormState] = useState({
    email: '',
    loading: false,
    error: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      setFormState(s => ({ ...s, error: 'Please enter a valid email address' }));
      return;
    }

    setFormState(s => ({ ...s, loading: true, error: '' }));
    trackEvent('newsletter_signup_submit', { source: 'newsletter_page' });

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formState.email, source: 'newsletter_page' }),
      });

      if (!response.ok) throw new Error('Failed');

      localStorage.setItem('subscribed', 'true');
      trackEvent('newsletter_signup_success', { source: 'newsletter_page' });
      setPage('thank-you');
    } catch {
      setFormState(s => ({ ...s, loading: false, error: 'Something went wrong. Please try again.' }));
    }
  };

  return (
    <section className="newsletter-hero">
      <div className="container">
        <div className="newsletter-content">
          <h1 className="display-title">Join the Community</h1>
          <p>Get exclusive updates, free resources, and insider content delivered to your inbox.</p>

          <ul className="benefits-list">
            {subscriptionBenefits.map((benefit, i) => (
              <li key={i}>{benefit}</li>
            ))}
          </ul>

          <div className="newsletter-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="newsletter-email">Email Address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  className={`form-input ${formState.error ? 'error' : ''}`}
                  value={formState.email}
                  onChange={(e) => setFormState(s => ({ ...s, email: e.target.value, error: '' }))}
                  placeholder="you@example.com"
                  required
                />
                {formState.error && <p className="form-error">{formState.error}</p>}
              </div>
              <div className="form-group form-checkbox">
                <input type="checkbox" id="newsletter-gdpr" required />
                <label htmlFor="newsletter-gdpr">
                  I agree to receive email updates. You can unsubscribe anytime.
                  <a href="/privacy" style={{ marginLeft: '0.25rem' }}>Privacy Policy</a>
                </label>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={formState.loading}>
                {formState.loading ? <span className="loading" /> : 'Subscribe Now'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

// Thank You Page
const ThankYouPage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  return (
    <section className="thank-you-content">
      <div className="container">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="success-icon">✓</div>
          <h1 className="display-title">Welcome to the Community!</h1>
          <p style={{ marginBottom: 'var(--space-md)' }}>
            Thank you for subscribing! Check your email to confirm your subscription
            and receive your welcome resources.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setPage('pre-order')}>Pre-Order Now</button>
            <button className="btn btn-outline" onClick={() => setPage('home')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// About Page
const AboutPage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  return (
    <section className="section" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div className="author-content">
          <div style={{ textAlign: 'center' }}>
            <img
              src={bookMetadata.authorImage}
              alt={authorBio.name}
              className="author-photo"
              loading="lazy"
            />
          </div>
          <div className="author-bio">
            <h1 className="display-title">{authorBio.name}</h1>
            <a href={authorBio.instagramUrl} className="author-handle" target="_blank" rel="noopener noreferrer">
              {authorBio.handle}
            </a>

            {authorBio.fullBio.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}

            <blockquote className="author-highlight">
              "I forgot she was still in there."
            </blockquote>

            <p>{authorBio.closingMessage}</p>

            <div style={{ marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-primary" onClick={() => setPage('pre-order')}>Pre-Order Now</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Book Preview Page
const BookPreviewPage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  return (
    <section className="section toc-section" style={{ paddingTop: '120px', minHeight: '100vh' }}>
      <div className="container">
        <div className="toc-header">
          <h1 className="display-title">Book Preview</h1>
          <p className="toc-subtitle">Complete Table of Contents</p>
        </div>

        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>Frontmatter</h3>
          <ul className="toc-matter-list">
            {tableOfContents.frontmatter.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="toc-grid">
          {tableOfContents.parts.map((part) => (
            <div key={part.number} className="toc-part">
              <span className="toc-part-title">Part {part.number}</span>
              <h3>{part.title}</h3>
              <ul className="toc-chapters">
                {part.chapters.map((chapter) => (
                  <li key={chapter.number}>
                    <span className="chapter-num">{chapter.romanNumeral}</span>
                    {chapter.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="toc-matter">
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>Backmatter</h3>
          <ul className="toc-matter-list">
            {tableOfContents.backmatter.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="toc-matter">
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>Interactive Elements</h3>
          <ul className="toc-matter-list">
            {tableOfContents.interactiveElements.map((item, i) => (
              <li key={i} className="interactive-badge">{item}</li>
            ))}
          </ul>
        </div>

        <div className="text-center" style={{ marginTop: 'var(--space-xl)' }}>
          <button className="btn btn-primary btn-lg" onClick={() => setPage('pre-order')}>Pre-Order Now</button>
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Curls & Contemplation</h3>
            <p>A Freelance Hairstylist's Guide to Creative Excellence</p>
            <button className="btn btn-primary" onClick={() => setPage('pre-order')}>Pre-Order Now</button>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Home</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('pre-order'); }}>Pre-Order</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('book-preview'); }}>Book Preview</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('about'); }}>About</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('resources'); }}>Resources</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Support</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('order-portal'); }}>Order Portal</a></li>
              <li><a href={authorBio.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('newsletter'); }}>Newsletter</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/cookies">Cookie Policy</a></li>
              <li><a href="/pre-order-policy">Pre-Order Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Michael David Warren. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Home Page
const HomePage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  return (
    <>
      <HeroSection setPage={setPage} />
      <AuthorSection />
      <TableOfContentsSection setPage={setPage} />
    </>
  );
};

// Main App
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(() => {
    // Check for order confirmation route
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      if (path === '/order-confirmation' || params.has('session_id')) {
        return 'order-confirmation';
      }
    }
    return 'home';
  });

  useEffect(() => {
    trackEvent('page_view', { page: currentPage });
    window.scrollTo(0, 0);

    // Update URL for key pages (SPA routing)
    const pageRoutes: Record<string, string> = {
      'home': '/',
      'pre-order': '/pre-order',
      'order-portal': '/order-portal',
      'order-confirmation': '/order-confirmation',
    };
    if (pageRoutes[currentPage] && window.location.pathname !== pageRoutes[currentPage]) {
      window.history.pushState({}, '', pageRoutes[currentPage]);
    }
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setPage={setCurrentPage} />;
      case 'pre-order':
        return <PreOrderPage setPage={setCurrentPage} />;
      case 'order-portal':
        return <OrderPortalPage setPage={setCurrentPage} />;
      case 'order-confirmation':
        return <OrderConfirmationPage setPage={setCurrentPage} />;
      case 'book-preview':
        return <BookPreviewPage setPage={setCurrentPage} />;
      case 'about':
        return <AboutPage setPage={setCurrentPage} />;
      case 'resources':
        return <ResourcesPage setPage={setCurrentPage} />;
      case 'newsletter':
        return <NewsletterPage setPage={setCurrentPage} />;
      case 'thank-you':
        return <ThankYouPage setPage={setCurrentPage} />;
      default:
        return <HomePage setPage={setCurrentPage} />;
    }
  };

  return (
    <>
      <Navigation currentPage={currentPage} setPage={setCurrentPage} />
      <main>
        {renderPage()}
      </main>
      <Footer setPage={setCurrentPage} />
    </>
  );
};

// Mount the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
