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

// Analytics helper
const trackEvent = (eventName: string, properties: Record<string, string> = {}) => {
  // Google Analytics 4 tracking
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }
  console.log('Track:', eventName, properties);
};

// Amazon Pre-order URL
const AMAZON_URL = 'https://www.amazon.com/dp/PLACEHOLDER_ASIN?tag=curlscontemp-20&utm_source=website&utm_medium=button&utm_campaign=preorder';

// Navigation Component
const Navigation: React.FC<{ currentPage: string; setPage: (page: string) => void }> = ({ currentPage, setPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'book-preview', label: 'Book Preview' },
    { id: 'about', label: 'About' },
    { id: 'resources', label: 'Resources' },
    { id: 'newsletter', label: 'Newsletter' },
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

    // Validate email
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

      // Store in localStorage to skip email gate
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

// Pre-order CTA Button
const PreOrderButton: React.FC<{ size?: 'normal' | 'large'; source: string }> = ({ size = 'normal', source }) => {
  const handleClick = () => {
    trackEvent('pre_order_click', { source, button_location: source });
  };

  return (
    <a
      href={AMAZON_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-primary ${size === 'large' ? 'btn-lg' : ''}`}
      onClick={handleClick}
    >
      Pre-Order on Amazon
    </a>
  );
};

// Hero Section
const HeroSection: React.FC = () => {
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
              <PreOrderButton size="large" source="hero" />
              <a href="#book-preview" className="btn btn-outline">Explore the Book</a>
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
const TableOfContentsSection: React.FC = () => {
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
          <PreOrderButton source="toc" />
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
const ResourcesPage: React.FC = () => {
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
            <PreOrderButton source="resources" />
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
            <PreOrderButton source="thank_you" />
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
const AboutPage: React.FC = () => {
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
              <PreOrderButton source="about" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Book Preview Page
const BookPreviewPage: React.FC = () => {
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
          <PreOrderButton size="large" source="book_preview" />
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
            <PreOrderButton source="footer" />
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Home</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('book-preview'); }}>Book Preview</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('about'); }}>About</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('resources'); }}>Resources</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Connect</h4>
            <ul>
              <li><a href={authorBio.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setPage('newsletter'); }}>Newsletter</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
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
const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <AuthorSection />
      <TableOfContentsSection />
    </>
  );
};

// Main App
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Track page view
    trackEvent('page_view', { page: currentPage });
    // Scroll to top on page change
    window.scrollTo(0, 0);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'book-preview':
        return <BookPreviewPage />;
      case 'about':
        return <AboutPage />;
      case 'resources':
        return <ResourcesPage />;
      case 'newsletter':
        return <NewsletterPage setPage={setCurrentPage} />;
      case 'thank-you':
        return <ThankYouPage setPage={setCurrentPage} />;
      default:
        return <HomePage />;
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
