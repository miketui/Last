import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { bookMetadata, authorBio, tableOfContents, resources, subscriptionBenefits } from './lib/book-data';
import { chapterPreviews, getChapterBySlug, getChapterNavigation, partTitles, type ChapterPreview } from './lib/chapter-content';

// Types
interface EmailFormState {
  email: string;
  name: string;
  loading: boolean;
  error: string;
  success: boolean;
}

interface CheckoutConfig {
  publishableKey: string;
  priceFormatted: string;
  priceAmount: number;
  isPreOrder: boolean;
  releaseDate: string;
}

interface OrderPortalData {
  orderId: string;
  orderDate: string;
  status: 'pre_order' | 'ready' | 'refunded';
  downloads: {
    id: string;
    format: string;
    url: string;
    expiresAt: string;
    downloadsRemaining: number;
  }[];
}

// Context for routing
interface RouterContextType {
  page: string;
  params: Record<string, string>;
  setPage: (page: string, params?: Record<string, string>) => void;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  page: 'home',
  params: {},
  setPage: () => {},
  navigate: () => {},
});

// Analytics helper
const trackEvent = (eventName: string, properties: Record<string, string> = {}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }
  console.log('Track:', eventName, properties);
};

// Parse URL path to page and params
const parseUrl = (pathname: string): { page: string; params: Record<string, string> } => {
  const path = pathname === '/' ? '/home' : pathname;
  const segments = path.split('/').filter(Boolean);

  if (segments[0] === 'chapter' && segments[1]) {
    return { page: 'chapter', params: { slug: segments[1] } };
  }
  if (segments[0] === 'portal' && segments[1]) {
    return { page: 'portal', params: { token: segments[1] } };
  }

  return { page: segments[0] || 'home', params: {} };
};

// POD Retailer Links by Region
const POD_LINKS = {
  US: {
    amazon: 'https://www.amazon.com/dp/PLACEHOLDER_ASIN?tag=curlscontemp-20',
    barnesNoble: 'https://www.barnesandnoble.com/w/curls-and-contemplation-michael-david-warren/PLACEHOLDER',
  },
  UK: {
    amazon: 'https://www.amazon.co.uk/dp/PLACEHOLDER_ASIN',
    waterstones: 'https://www.waterstones.com/book/curls-and-contemplation/michael-david-warren/PLACEHOLDER',
  },
  CA: {
    amazon: 'https://www.amazon.ca/dp/PLACEHOLDER_ASIN',
    indigo: 'https://www.chapters.indigo.ca/en-ca/books/curls-and-contemplation-michael-david-warren/PLACEHOLDER-item.html',
  },
};

// Detect region from browser
const detectRegion = (): 'US' | 'UK' | 'CA' => {
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language || (navigator as any).userLanguage;
    if (lang.includes('en-GB')) return 'UK';
    if (lang.includes('en-CA')) return 'CA';
  }
  return 'US';
};

// Turnstile Widget Component
const TurnstileWidget: React.FC<{ onVerify: (token: string) => void }> = ({ onVerify }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const siteKey = (window as any).TURNSTILE_SITE_KEY;
    if (!siteKey || !containerRef.current) return;

    const loadWidget = () => {
      if ((window as any).turnstile && containerRef.current) {
        widgetIdRef.current = (window as any).turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          theme: 'light',
        });
      }
    };

    if ((window as any).turnstile) {
      loadWidget();
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.onload = loadWidget;
      document.head.appendChild(script);
    }

    return () => {
      if (widgetIdRef.current && (window as any).turnstile) {
        (window as any).turnstile.remove(widgetIdRef.current);
      }
    };
  }, [onVerify]);

  return <div ref={containerRef} className="turnstile-widget" />;
};

// Navigation Component
const Navigation: React.FC = () => {
  const { page, setPage } = useContext(RouterContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'book', label: 'Book', path: '/book' },
    { id: 'chapters', label: 'Chapters', path: '/chapters' },
    { id: 'about', label: 'About', path: '/about' },
    { id: 'resources', label: 'Free Kit', path: '/resources' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="navbar-content">
        <a href="/" className="navbar-logo" onClick={(e) => { e.preventDefault(); setPage('home'); }}>
          <span className="logo-icon">C&C</span>
          <span className="logo-text">Curls & Contemplation</span>
        </a>
        <button
          className="mobile-menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
        <ul className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <li key={link.id}>
              <a
                href={link.path}
                onClick={(e) => { e.preventDefault(); setPage(link.id); setMobileMenuOpen(false); }}
                className={page === link.id ? 'active' : ''}
                aria-current={page === link.id ? 'page' : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="nav-cta">
            <a
              href="/checkout"
              className="btn btn-primary btn-sm"
              onClick={(e) => { e.preventDefault(); setPage('checkout'); setMobileMenuOpen(false); }}
            >
              Buy eBook
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

// Lead Capture Form with Free Offer (Pricing Confidence Kit)
const LeadCaptureForm: React.FC<{
  source: string;
  compact?: boolean;
  onSuccess?: () => void;
  showTurnstile?: boolean;
}> = ({ source, compact = false, onSuccess, showTurnstile = false }) => {
  const [formState, setFormState] = useState<EmailFormState>({
    email: '',
    name: '',
    loading: false,
    error: '',
    success: false,
  });
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      setFormState(s => ({ ...s, error: 'Please enter a valid email address' }));
      return;
    }

    setFormState(s => ({ ...s, loading: true, error: '' }));
    trackEvent('lead_capture_submit', { source });

    try {
      const response = await fetch('/api/free-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formState.email,
          name: formState.name,
          resource: 'pricing_kit',
          turnstile_token: turnstileToken,
          source
        }),
      });

      if (!response.ok) {
        throw new Error('Subscription failed');
      }

      setFormState(s => ({ ...s, loading: false, success: true }));
      trackEvent('lead_capture_success', { source });
      localStorage.setItem('subscribed', 'true');
      onSuccess?.();
    } catch {
      setFormState(s => ({ ...s, loading: false, error: 'Something went wrong. Please try again.' }));
      trackEvent('lead_capture_error', { source });
    }
  };

  if (formState.success) {
    return (
      <div className="lead-capture-success">
        <div className="success-checkmark">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3>Check Your Inbox!</h3>
        <p>Your free Pricing Confidence Kit is on its way. Look for an email from us in the next few minutes.</p>
      </div>
    );
  }

  return (
    <div className={`lead-capture ${compact ? 'compact' : ''}`}>
      {!compact && (
        <div className="lead-capture-header">
          <span className="badge badge-gold">FREE DOWNLOAD</span>
          <h3>Get Your Pricing Confidence Kit</h3>
          <p>Stop undercharging. Start earning what you deserve.</p>
          <ul className="lead-capture-benefits">
            <li>Rate Calculator Worksheet</li>
            <li>Script for Raising Your Prices</li>
            <li>Value Articulation Guide</li>
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit} className="lead-form">
        {!compact && (
          <div className="form-group">
            <label className="form-label" htmlFor={`name-${source}`}>First Name</label>
            <input
              id={`name-${source}`}
              type="text"
              className="form-input"
              placeholder="Your first name"
              value={formState.name}
              onChange={(e) => setFormState(s => ({ ...s, name: e.target.value }))}
            />
          </div>
        )}
        <div className="form-group">
          <label className="form-label" htmlFor={`email-${source}`}>Email Address</label>
          <input
            id={`email-${source}`}
            type="email"
            className={`form-input ${formState.error ? 'error' : ''}`}
            placeholder="you@example.com"
            value={formState.email}
            onChange={(e) => setFormState(s => ({ ...s, email: e.target.value, error: '' }))}
            required
          />
          {formState.error && <p className="form-error">{formState.error}</p>}
        </div>
        {showTurnstile && <TurnstileWidget onVerify={setTurnstileToken} />}
        <button type="submit" className="btn btn-gold btn-lg" disabled={formState.loading} style={{ width: '100%' }}>
          {formState.loading ? <span className="loading" /> : 'Send Me the Free Kit'}
        </button>
        <p className="form-disclaimer">No spam. Unsubscribe anytime. Your data stays private.</p>
      </form>
    </div>
  );
};

// Exit Intent Modal
const ExitIntentModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('exitModalShown') || localStorage.getItem('subscribed')) {
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
        localStorage.setItem('exitModalShown', 'true');
        trackEvent('exit_intent_shown');
      }
    };

    // Delay adding listener to avoid triggering immediately
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={() => setIsOpen(false)} role="dialog" aria-modal="true">
      <div className="modal modal-exit" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setIsOpen(false)} aria-label="Close">&times;</button>
        <div className="modal-body">
          <h2>Wait! Don't Leave Empty-Handed</h2>
          <p>Get the free Pricing Confidence Kit that's helped hundreds of stylists charge what they're worth.</p>
          <LeadCaptureForm source="exit_intent" compact onSuccess={() => setIsOpen(false)} />
        </div>
      </div>
    </div>
  );
};

// Buy Button with Region Support
const BuyButton: React.FC<{
  size?: 'normal' | 'large';
  source: string;
  variant?: 'primary' | 'gold' | 'outline';
  showPrice?: boolean;
}> = ({ size = 'normal', source, variant = 'primary', showPrice = false }) => {
  const { setPage } = useContext(RouterContext);
  const [config, setConfig] = useState<CheckoutConfig | null>(null);

  useEffect(() => {
    fetch('/api/checkout/config')
      .then(r => r.json())
      .then(setConfig)
      .catch(() => {});
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackEvent('buy_button_click', { source, location: source });
    setPage('checkout');
  };

  const btnClass = `btn btn-${variant} ${size === 'large' ? 'btn-lg' : ''}`;
  const label = config?.isPreOrder ? 'Pre-Order eBook' : 'Buy eBook';
  const priceText = showPrice && config ? ` - ${config.priceFormatted}` : '';

  return (
    <a href="/checkout" className={btnClass} onClick={handleClick}>
      {label}{priceText}
    </a>
  );
};

// POD Retailer Links Component
const PODRetailerLinks: React.FC = () => {
  const [region, setRegion] = useState<'US' | 'UK' | 'CA'>('US');

  useEffect(() => {
    setRegion(detectRegion());
  }, []);

  const links = POD_LINKS[region];

  return (
    <div className="pod-links">
      <p className="pod-label">Also available in paperback:</p>
      <div className="pod-buttons">
        <a href={links.amazon} target="_blank" rel="noopener noreferrer" className="pod-button amazon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.074-1.052-.872-1.238-1.276-1.814-2.106-1.734 1.767-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.925 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.095v-.41c0-.753.06-1.642-.384-2.294-.385-.579-1.124-.82-1.775-.82-1.205 0-2.277.618-2.54 1.897-.054.285-.261.567-.549.582l-3.061-.333c-.259-.056-.548-.266-.472-.66C6.057 1.926 9.311.5 12.243.5c1.473 0 3.396.391 4.555 1.507 1.473 1.378 1.331 3.218 1.331 5.221v4.731c0 1.422.59 2.044 1.145 2.812.197.277.24.608-.003.813-.605.51-1.681 1.453-2.274 1.983l-.853.227z"/>
          </svg>
          Amazon {region}
        </a>
        {region === 'US' && (
          <a href={links.barnesNoble} target="_blank" rel="noopener noreferrer" className="pod-button bn">
            Barnes & Noble
          </a>
        )}
        {region === 'UK' && (
          <a href={links.waterstones} target="_blank" rel="noopener noreferrer" className="pod-button waterstones">
            Waterstones
          </a>
        )}
        {region === 'CA' && (
          <a href={links.indigo} target="_blank" rel="noopener noreferrer" className="pod-button indigo">
            Indigo
          </a>
        )}
      </div>
      <div className="region-selector">
        <span>Region:</span>
        {(['US', 'UK', 'CA'] as const).map(r => (
          <button
            key={r}
            className={region === r ? 'active' : ''}
            onClick={() => setRegion(r)}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
};

// Hero Section
const HeroSection: React.FC = () => {
  return (
    <section className="hero" id="main-content">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-tagline">For Freelance Hairstylists Ready to Level Up</span>
            <h1 className="display-title">{bookMetadata.title}</h1>
            <span className="hero-subtitle">{bookMetadata.subtitle}</span>
            <p className="hero-description">
              The industry guide that teaches you to master your craft, build a thriving business,
              and create a career on your own terms—from Rihanna's day-to-day hairstylist.
            </p>
            <div className="hero-author">
              <img src={bookMetadata.authorImage} alt={bookMetadata.author} className="hero-author-avatar" />
              <span>By <strong>{bookMetadata.author}</strong></span>
            </div>
            <div className="hero-cta">
              <BuyButton size="large" source="hero" variant="gold" showPrice />
              <a href="#free-kit" className="btn btn-outline">Get Free Pricing Kit</a>
            </div>
            <div className="hero-social-proof">
              <div className="rating">
                <span className="stars">★★★★★</span>
                <span>5.0 from early readers</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="book-3d-wrapper">
              <img
                src={bookMetadata.coverImage}
                alt={`Book cover of ${bookMetadata.fullTitle}`}
                className="book-cover book-cover-3d"
                loading="eager"
              />
            </div>
            <div className="hero-badges">
              <span className="badge badge-teal">16 Chapters</span>
              <span className="badge badge-gold">Interactive Worksheets</span>
              <span className="badge badge-coral">EPUB + PDF</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Problem/Agitation/Solution Section
const ProblemSection: React.FC = () => {
  return (
    <section className="section problem-section">
      <div className="container">
        <div className="problem-content">
          <h2 className="section-title">Sound Familiar?</h2>
          <div className="problem-grid">
            <div className="problem-card">
              <span className="problem-emoji">😓</span>
              <h3>Undercharging & Overworking</h3>
              <p>You're booked solid but still struggling to make ends meet. Raising prices feels impossible.</p>
            </div>
            <div className="problem-card">
              <span className="problem-emoji">😰</span>
              <h3>Feast or Famine Cycles</h3>
              <p>One month you're slammed, the next you're refreshing your calendar hoping for bookings.</p>
            </div>
            <div className="problem-card">
              <span className="problem-emoji">😤</span>
              <h3>No Clear Growth Path</h3>
              <p>You know you have talent, but you're stuck wondering how to get to the next level.</p>
            </div>
            <div className="problem-card">
              <span className="problem-emoji">🤔</span>
              <h3>Imposter Syndrome</h3>
              <p>You see others succeeding and wonder what they know that you don't.</p>
            </div>
          </div>
        </div>
        <div className="solution-content">
          <h2>There's a Better Way</h2>
          <p className="solution-intro">
            <em>Curls & Contemplation</em> is the roadmap I wish I had when I started. After 12 years
            styling Rihanna, shooting campaigns for Nike, and building a global freelance career,
            I've distilled everything I've learned into one comprehensive guide.
          </p>
        </div>
      </div>
    </section>
  );
};

// What's Inside Section
const WhatsInsideSection: React.FC = () => {
  const { setPage } = useContext(RouterContext);

  return (
    <section className="section whats-inside-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">What's Inside</h2>
          <p className="section-subtitle">4 Parts. 16 Chapters. Everything You Need.</p>
        </div>
        <div className="parts-grid">
          {tableOfContents.parts.map((part) => (
            <div key={part.number} className="part-card">
              <span className="part-number">Part {part.number}</span>
              <h3 className="part-title">{part.title}</h3>
              <ul className="part-chapters">
                {part.chapters.map((chapter) => (
                  <li key={chapter.number}>
                    <a
                      href={`/chapter/${chapterPreviews[parseInt(chapter.number) - 1]?.slug || ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const chapterData = chapterPreviews[parseInt(chapter.number) - 1];
                        if (chapterData) {
                          setPage('chapter', { slug: chapterData.slug });
                        }
                      }}
                    >
                      <span className="chapter-num">{chapter.romanNumeral}</span>
                      <span className="chapter-title">{chapter.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="interactive-elements">
          <h3>Interactive Elements Included</h3>
          <div className="elements-list">
            {tableOfContents.interactiveElements.map((item, i) => (
              <span key={i} className="element-badge">{item}</span>
            ))}
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
          <div className="author-image-wrapper">
            <img
              src={bookMetadata.authorImage}
              alt={authorBio.name}
              className="author-photo"
              loading="lazy"
            />
            <a href={authorBio.instagramUrl} className="author-handle" target="_blank" rel="noopener noreferrer">
              {authorBio.handle}
            </a>
          </div>
          <div className="author-bio">
            <span className="section-label">About the Author</span>
            <h2 className="display-title">{authorBio.name}</h2>
            <p className="author-intro">{authorBio.shortBio}</p>
            <p>{authorBio.fullBio.split('\n\n').slice(1, 3).join(' ')}</p>
            <div className="credentials-grid">
              <div className="credential">
                <span className="credential-icon">👑</span>
                <span>Rihanna's day-to-day hairstylist</span>
              </div>
              <div className="credential">
                <span className="credential-icon">🏆</span>
                <span>SAG & BET Awards red carpet</span>
              </div>
              <div className="credential">
                <span className="credential-icon">📸</span>
                <span>Nike, Harper's Bazaar, W Magazine</span>
              </div>
              <div className="credential">
                <span className="credential-icon">🌍</span>
                <span>12+ years global experience</span>
              </div>
            </div>
            <blockquote className="author-quote">
              <p>"{authorBio.transformativeStory.split(':')[1]?.split('"')[0]?.trim()}"</p>
              <footer>— A client's words that changed everything</footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

// Free Kit Section (Lead Magnet)
const FreeKitSection: React.FC = () => {
  return (
    <section className="section free-kit-section" id="free-kit">
      <div className="container">
        <div className="free-kit-content">
          <div className="free-kit-text">
            <span className="badge badge-gold">100% FREE</span>
            <h2 className="display-title">The Stylist's 10-Minute Pricing Confidence Kit</h2>
            <p className="free-kit-subtitle">
              Stop second-guessing your rates. This free kit includes everything you need to
              price your services with confidence.
            </p>
            <ul className="free-kit-items">
              <li>
                <span className="item-icon">📊</span>
                <div>
                  <strong>Rate Calculator Worksheet</strong>
                  <p>Calculate your true hourly rate and set profitable prices</p>
                </div>
              </li>
              <li>
                <span className="item-icon">💬</span>
                <div>
                  <strong>Price Increase Scripts</strong>
                  <p>Word-for-word scripts to raise rates without losing clients</p>
                </div>
              </li>
              <li>
                <span className="item-icon">✨</span>
                <div>
                  <strong>Value Articulation Guide</strong>
                  <p>How to communicate your worth so clients happily pay premium rates</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="free-kit-form">
            <LeadCaptureForm source="free_kit_section" showTurnstile />
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote: "Michael's approach changed how I think about my entire career. This isn't just a book—it's a business bible for stylists.",
      author: "Jordan M.",
      title: "Freelance Hairstylist, NYC",
    },
    {
      quote: "I finally understand my worth. The pricing section alone was worth 10x the cost of the book.",
      author: "Aisha T.",
      title: "Independent Stylist, Atlanta",
    },
    {
      quote: "The networking chapter opened doors I didn't know existed. I've booked three celebrity clients since reading it.",
      author: "Marcus L.",
      title: "Celebrity Hairstylist, LA",
    },
  ];

  return (
    <section className="section testimonials-section">
      <div className="container">
        <h2 className="section-title">What Stylists Are Saying</h2>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="stars">★★★★★</div>
              <blockquote>"{t.quote}"</blockquote>
              <div className="testimonial-author">
                <strong>{t.author}</strong>
                <span>{t.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection: React.FC = () => {
  return (
    <section className="section cta-section">
      <div className="container">
        <div className="cta-content">
          <h2 className="display-title">Ready to Transform Your Career?</h2>
          <p>
            Join hundreds of stylists who've used <em>Curls & Contemplation</em> to build
            thriving careers on their own terms.
          </p>
          <div className="cta-buttons">
            <BuyButton size="large" source="cta_section" variant="gold" showPrice />
          </div>
          <PODRetailerLinks />
          <div className="guarantee">
            <span className="guarantee-icon">🛡️</span>
            <p><strong>100% Satisfaction Guarantee</strong> — If you don't love it, email us within 30 days for a full refund. No questions asked.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Home Page
const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <WhatsInsideSection />
      <AuthorSection />
      <FreeKitSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
};

// Book Sales Page (Full SOW Copy)
const BookPage: React.FC = () => {
  const { setPage } = useContext(RouterContext);

  return (
    <div className="book-page">
      {/* Hero */}
      <section className="book-hero">
        <div className="container">
          <div className="book-hero-content">
            <div className="book-hero-image">
              <img src={bookMetadata.coverImage} alt={bookMetadata.fullTitle} className="book-cover-large" />
            </div>
            <div className="book-hero-text">
              <span className="badge badge-gold">NEW RELEASE</span>
              <h1 className="display-title">{bookMetadata.title}</h1>
              <p className="subtitle">{bookMetadata.subtitle}</p>
              <p className="book-description">
                The comprehensive guide for freelance hairstylists ready to build a career
                that matches their talent—from the stylist behind Rihanna's iconic looks.
              </p>
              <div className="book-meta">
                <span>📖 16 Chapters</span>
                <span>📝 Interactive Worksheets</span>
                <span>📱 EPUB + PDF formats</span>
              </div>
              <div className="book-cta">
                <BuyButton size="large" source="book_hero" variant="gold" showPrice />
              </div>
              <PODRetailerLinks />
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">What You'll Master</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="benefit-icon">✂️</span>
              <h3>Refine Your Craft</h3>
              <p>Elevate your technical skills while developing your signature style that sets you apart.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🤝</span>
              <h3>Build Real Connections</h3>
              <p>Network authentically and create relationships that fuel sustainable career growth.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">💰</span>
              <h3>Price With Confidence</h3>
              <p>Calculate your true worth and communicate it so clients happily pay premium rates.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">📈</span>
              <h3>Scale Your Business</h3>
              <p>Systems and strategies to grow beyond the chair without burning out.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🧠</span>
              <h3>Lead & Mentor</h3>
              <p>Step into leadership and help shape the next generation of stylists.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🌱</span>
              <h3>Sustain Your Passion</h3>
              <p>Protect your physical and mental well-being while doing the work you love.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Full TOC */}
      <section className="section toc-section">
        <div className="container">
          <h2 className="section-title">Complete Table of Contents</h2>
          <div className="toc-full">
            <div className="toc-frontmatter">
              <h3>Frontmatter</h3>
              <ul>
                {tableOfContents.frontmatter.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="toc-parts-full">
              {tableOfContents.parts.map((part) => (
                <div key={part.number} className="toc-part-full">
                  <h3>Part {part.number}: {part.title}</h3>
                  <ul>
                    {part.chapters.map((chapter) => {
                      const chapterData = chapterPreviews[parseInt(chapter.number) - 1];
                      return (
                        <li key={chapter.number}>
                          <a
                            href={`/chapter/${chapterData?.slug}`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (chapterData) setPage('chapter', { slug: chapterData.slug });
                            }}
                          >
                            <span className="ch-num">{chapter.romanNumeral}.</span>
                            {chapter.title}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <div className="toc-backmatter">
              <h3>Backmatter</h3>
              <ul>
                {tableOfContents.backmatter.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About Author Preview */}
      <AuthorSection />

      {/* Final CTA */}
      <CTASection />
    </div>
  );
};

// Chapters Index Page
const ChaptersPage: React.FC = () => {
  const { setPage } = useContext(RouterContext);

  return (
    <section className="section chapters-page" style={{ paddingTop: '120px', minHeight: '100vh' }}>
      <div className="container">
        <div className="section-header">
          <h1 className="display-title">Chapter Previews</h1>
          <p className="section-subtitle">Explore the complete journey through all 16 chapters</p>
        </div>

        {[1, 2, 3, 4].map(partNum => {
          const partChapters = chapterPreviews.filter(c => c.partNumber === partNum);
          return (
            <div key={partNum} className="chapters-part">
              <div className="part-header">
                <span className="part-label">Part {partNum}</span>
                <h2>{partTitles[partNum]}</h2>
              </div>
              <div className="chapters-grid">
                {partChapters.map(chapter => (
                  <a
                    key={chapter.slug}
                    href={`/chapter/${chapter.slug}`}
                    className="chapter-card"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage('chapter', { slug: chapter.slug });
                    }}
                  >
                    <span className="chapter-number">{chapter.romanNumeral}</span>
                    <h3 className="chapter-title">{chapter.title}</h3>
                    <p className="chapter-summary">{chapter.summary}</p>
                    <span className="read-preview">Read Preview →</span>
                  </a>
                ))}
              </div>
            </div>
          );
        })}

        <div className="chapters-cta">
          <h3>Ready to Read the Full Book?</h3>
          <BuyButton size="large" source="chapters_index" variant="gold" showPrice />
        </div>
      </div>
    </section>
  );
};

// Individual Chapter Preview Page
const ChapterPreviewPage: React.FC<{ slug: string }> = ({ slug }) => {
  const { setPage } = useContext(RouterContext);
  const chapter = getChapterBySlug(slug);
  const { prev, next } = getChapterNavigation(slug);

  if (!chapter) {
    return (
      <section className="section" style={{ paddingTop: '120px', textAlign: 'center' }}>
        <div className="container">
          <h1>Chapter Not Found</h1>
          <p>The chapter you're looking for doesn't exist.</p>
          <button className="btn btn-primary" onClick={() => setPage('chapters')}>
            View All Chapters
          </button>
        </div>
      </section>
    );
  }

  return (
    <article className="chapter-preview-page" style={{ paddingTop: '120px' }}>
      <div className="container container-narrow">
        {/* Header */}
        <header className="chapter-header">
          <div className="chapter-breadcrumb">
            <a href="/chapters" onClick={(e) => { e.preventDefault(); setPage('chapters'); }}>
              Chapters
            </a>
            <span>/</span>
            <span>Part {chapter.partNumber}: {chapter.partTitle}</span>
          </div>
          <span className="chapter-number-large">{chapter.romanNumeral}</span>
          <h1 className="chapter-title-large">{chapter.title}</h1>
          <p className="chapter-summary-large">{chapter.summary}</p>
        </header>

        {/* Bible Quote */}
        {chapter.bibleQuote && (
          <blockquote className="chapter-bible-quote">
            <p>"{chapter.bibleQuote.text}"</p>
            <footer>— {chapter.bibleQuote.reference}</footer>
          </blockquote>
        )}

        {/* Excerpt */}
        <div className="chapter-excerpt">
          <h2>Preview Excerpt</h2>
          {chapter.excerpt.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {/* Pull Quote */}
        <blockquote className="chapter-pull-quote">
          <p>"{chapter.pullQuote}"</p>
        </blockquote>

        {/* CTA */}
        <div className="chapter-cta">
          <p>This is just a preview. Get the complete chapter and all 16 chapters in the full book.</p>
          <BuyButton size="large" source={`chapter_${chapter.slug}`} variant="gold" showPrice />
        </div>

        {/* Navigation */}
        <nav className="chapter-nav">
          {prev ? (
            <a
              href={`/chapter/${prev.slug}`}
              className="chapter-nav-link prev"
              onClick={(e) => { e.preventDefault(); setPage('chapter', { slug: prev.slug }); }}
            >
              <span>← Previous</span>
              <strong>{prev.title}</strong>
            </a>
          ) : <div />}
          {next ? (
            <a
              href={`/chapter/${next.slug}`}
              className="chapter-nav-link next"
              onClick={(e) => { e.preventDefault(); setPage('chapter', { slug: next.slug }); }}
            >
              <span>Next →</span>
              <strong>{next.title}</strong>
            </a>
          ) : <div />}
        </nav>
      </div>
    </article>
  );
};

// About Page (Full)
const AboutPage: React.FC = () => {
  return (
    <section className="about-page" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div className="about-hero">
          <img src={bookMetadata.authorImage} alt={authorBio.name} className="about-photo" />
          <div className="about-intro">
            <h1 className="display-title">{authorBio.name}</h1>
            <a href={authorBio.instagramUrl} className="author-handle" target="_blank" rel="noopener noreferrer">
              {authorBio.handle}
            </a>
            <p className="about-tagline">{authorBio.shortBio}</p>
          </div>
        </div>

        <div className="about-content">
          {authorBio.fullBio.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}

          <h2>The Story Behind the Book</h2>
          <p>{authorBio.transformativeStory}</p>

          <blockquote className="about-quote">
            <p>"I forgot she was still in there."</p>
            <footer>— Five words that changed everything</footer>
          </blockquote>

          <p>{authorBio.closingMessage}</p>

          <h2>Notable Work</h2>
          <ul className="credentials-list">
            <li>Rihanna's day-to-day hairstylist in London</li>
            <li>Keying Nike's "Greatest Dynasty Ever" campaign</li>
            <li>SAG Awards and BET Awards red carpet styling</li>
            <li>Harper's Bazaar, W Magazine, Wonderland, Coveteur editorial</li>
            <li>Sergio Hudson runway collections</li>
            <li>Assisted legends Guido Palau, Jimmy Paul, and Jawara</li>
            <li>Global work in Tokyo, Stockholm, Mexico City, and Paris</li>
          </ul>

          <div className="about-cta">
            <h3>Read Michael's Book</h3>
            <p>Discover the strategies and mindset that built a global freelance career.</p>
            <BuyButton size="large" source="about_page" variant="gold" showPrice />
          </div>
        </div>
      </div>
    </section>
  );
};

// Resources Page (Free Downloads)
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

  return (
    <>
      <section className="section resources-page" style={{ paddingTop: '120px' }}>
        <div className="container">
          <div className="section-header">
            <span className="badge badge-gold">FREE RESOURCES</span>
            <h1 className="display-title">Tools for Your Journey</h1>
            <p className="section-subtitle">
              Downloadable worksheets and templates from <em>Curls & Contemplation</em>
            </p>
          </div>

          {/* Featured: Pricing Kit */}
          <div className="featured-resource">
            <div className="featured-resource-content">
              <span className="badge badge-coral">MOST POPULAR</span>
              <h2>The Stylist's 10-Minute Pricing Confidence Kit</h2>
              <p>
                Our most requested free resource. Stop undercharging and start earning what you deserve
                with this comprehensive pricing toolkit.
              </p>
              <ul>
                <li>Rate Calculator Worksheet</li>
                <li>Price Increase Scripts</li>
                <li>Value Articulation Guide</li>
              </ul>
            </div>
            <div className="featured-resource-form">
              <LeadCaptureForm source="resources_page_featured" showTurnstile />
            </div>
          </div>

          {/* Other Resources */}
          <h2 className="resources-section-title">More Free Downloads</h2>
          <div className="resources-grid">
            {resources.map(resource => (
              <div key={resource.id} className="resource-card">
                <span className="resource-category">{resource.category}</span>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <button
                  className="btn btn-outline"
                  onClick={() => handleDownload(resource.id, resource.downloadUrl)}
                >
                  Download Free
                </button>
              </div>
            ))}
          </div>

          <div className="resources-cta">
            <h3>Want Everything?</h3>
            <p>Get all interactive worksheets plus 16 chapters of comprehensive guidance.</p>
            <BuyButton size="large" source="resources_page" variant="gold" showPrice />
          </div>
        </div>
      </section>

      {/* Email Gate Modal */}
      {modalOpen && (
        <div className="modal-overlay open" onClick={() => setModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Close">&times;</button>
            <div className="modal-body">
              <h2>Get Your Free Resource</h2>
              <p>Enter your email to download this resource and get exclusive updates.</p>
              <LeadCaptureForm source="resource_gate" compact onSuccess={handleGateSuccess} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Checkout Page
const CheckoutPage: React.FC = () => {
  const { setPage } = useContext(RouterContext);
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({
    email: '',
    name: '',
    coupon: '',
    couponValid: null as boolean | null,
    couponDiscount: 0,
    processing: false,
    error: '',
  });
  const [turnstileToken, setTurnstileToken] = useState('');

  useEffect(() => {
    fetch('/api/checkout/config')
      .then(r => r.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const validateCoupon = async () => {
    if (!formState.coupon) return;

    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon: formState.coupon }),
      });
      const data = await response.json();
      setFormState(s => ({
        ...s,
        couponValid: data.valid,
        couponDiscount: data.discount || 0,
      }));
    } catch {
      setFormState(s => ({ ...s, couponValid: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      setFormState(s => ({ ...s, error: 'Please enter a valid email address' }));
      return;
    }

    setFormState(s => ({ ...s, processing: true, error: '' }));
    trackEvent('checkout_submit', { source: 'checkout_page' });

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formState.email,
          name: formState.name,
          coupon: formState.couponValid ? formState.coupon : undefined,
          turnstile_token: turnstileToken,
          utm: {
            source: new URLSearchParams(window.location.search).get('utm_source'),
            medium: new URLSearchParams(window.location.search).get('utm_medium'),
            campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Checkout failed');
      }

      const data = await response.json();

      // In a real implementation, this would redirect to Stripe Checkout
      // or initialize Stripe Elements with the client secret
      console.log('Payment intent created:', data);

      // For demo purposes, simulate success
      trackEvent('checkout_success', { source: 'checkout_page' });
      setPage('thank-you');
    } catch {
      setFormState(s => ({ ...s, processing: false, error: 'Payment failed. Please try again.' }));
      trackEvent('checkout_error', { source: 'checkout_page' });
    }
  };

  if (loading) {
    return (
      <section className="checkout-page" style={{ paddingTop: '120px' }}>
        <div className="container container-narrow">
          <div className="loading-state">Loading checkout...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page" style={{ paddingTop: '120px' }}>
      <div className="container container-narrow">
        <div className="checkout-content">
          <div className="checkout-summary">
            <h1>{config?.isPreOrder ? 'Pre-Order' : 'Purchase'} Your eBook</h1>
            <div className="checkout-product">
              <img src={bookMetadata.coverImage} alt={bookMetadata.title} className="checkout-cover" />
              <div className="checkout-details">
                <h2>{bookMetadata.title}</h2>
                <p>{bookMetadata.subtitle}</p>
                <div className="checkout-formats">
                  <span className="format-badge">EPUB</span>
                  <span className="format-badge">PDF</span>
                </div>
              </div>
            </div>
            <div className="checkout-price">
              <span className="price-label">Total</span>
              <span className="price-amount">
                {formState.couponValid && formState.couponDiscount > 0 ? (
                  <>
                    <span className="price-original">{config?.priceFormatted}</span>
                    <span className="price-discounted">
                      ${((config?.priceAmount || 0) * (1 - formState.couponDiscount / 100) / 100).toFixed(2)}
                    </span>
                  </>
                ) : (
                  config?.priceFormatted
                )}
              </span>
            </div>
            {config?.isPreOrder && (
              <div className="preorder-notice">
                <strong>Pre-Order Notice:</strong> Your eBook will be delivered automatically
                on release day ({new Date(config.releaseDate).toLocaleDateString()}).
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="checkout-form">
            <h3>Your Information</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="checkout-name">Name</label>
              <input
                id="checkout-name"
                type="text"
                className="form-input"
                placeholder="Your name"
                value={formState.name}
                onChange={(e) => setFormState(s => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="checkout-email">Email Address *</label>
              <input
                id="checkout-email"
                type="email"
                className={`form-input ${formState.error ? 'error' : ''}`}
                placeholder="you@example.com"
                value={formState.email}
                onChange={(e) => setFormState(s => ({ ...s, email: e.target.value, error: '' }))}
                required
              />
              <p className="form-hint">Your eBook will be delivered to this email.</p>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="checkout-coupon">Coupon Code</label>
              <div className="coupon-input">
                <input
                  id="checkout-coupon"
                  type="text"
                  className="form-input"
                  placeholder="Enter code"
                  value={formState.coupon}
                  onChange={(e) => setFormState(s => ({ ...s, coupon: e.target.value, couponValid: null }))}
                />
                <button type="button" className="btn btn-outline" onClick={validateCoupon}>
                  Apply
                </button>
              </div>
              {formState.couponValid === true && (
                <p className="form-success">Coupon applied! {formState.couponDiscount}% off</p>
              )}
              {formState.couponValid === false && (
                <p className="form-error">Invalid coupon code</p>
              )}
            </div>

            <TurnstileWidget onVerify={setTurnstileToken} />

            {formState.error && <p className="form-error">{formState.error}</p>}

            <button type="submit" className="btn btn-gold btn-lg" style={{ width: '100%' }} disabled={formState.processing}>
              {formState.processing ? <span className="loading" /> : `Pay ${config?.priceFormatted}`}
            </button>

            <div className="checkout-security">
              <span>🔒 Secure checkout powered by Stripe</span>
            </div>

            <div className="checkout-guarantee">
              <p><strong>30-Day Money-Back Guarantee</strong></p>
              <p>Not satisfied? Email us for a full refund. No questions asked.</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

// Thank You Page
const ThankYouPage: React.FC = () => {
  const { setPage } = useContext(RouterContext);
  const [config, setConfig] = useState<CheckoutConfig | null>(null);

  useEffect(() => {
    fetch('/api/checkout/config')
      .then(r => r.json())
      .then(setConfig)
      .catch(() => {});

    trackEvent('purchase_complete');
  }, []);

  return (
    <section className="thank-you-page" style={{ paddingTop: '120px' }}>
      <div className="container container-narrow">
        <div className="thank-you-content">
          <div className="success-animation">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h1 className="display-title">Thank You!</h1>
          <p className="thank-you-message">
            {config?.isPreOrder ? (
              <>
                Your pre-order is confirmed! You'll receive your eBook automatically
                on release day ({config?.releaseDate ? new Date(config.releaseDate).toLocaleDateString() : 'coming soon'}).
              </>
            ) : (
              <>
                Your purchase is complete! Check your email for download links.
                They'll arrive within the next few minutes.
              </>
            )}
          </p>
          <div className="thank-you-next">
            <h3>What's Next?</h3>
            <ol>
              <li>Check your email for your order confirmation</li>
              <li>{config?.isPreOrder ? 'Wait for release day delivery' : 'Download your EPUB and PDF files'}</li>
              <li>Start your journey to creative excellence!</li>
            </ol>
          </div>
          <div className="thank-you-share">
            <p>Share your excitement:</p>
            <div className="share-buttons">
              <a
                href={`https://twitter.com/intent/tweet?text=Just%20got%20Curls%20%26%20Contemplation%20by%20%40md.warren!%20Ready%20to%20level%20up%20my%20hairstyling%20career.%20✂️`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-button twitter"
              >
                Share on Twitter
              </a>
              <a
                href={`https://www.instagram.com/md.warren`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-button instagram"
              >
                Follow @md.warren
              </a>
            </div>
          </div>
          <button className="btn btn-outline" onClick={() => setPage('home')}>
            Return to Homepage
          </button>
        </div>
      </div>
    </section>
  );
};

// Order Portal Page (Pre/Post Launch States)
const OrderPortalPage: React.FC<{ token: string }> = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderPortalData | null>(null);
  const [error, setError] = useState('');
  const [extending, setExtending] = useState<string | null>(null);

  useEffect(() => {
    // In production, this would fetch order data from the API
    // For demo, we'll simulate the response
    const fetchOrder = async () => {
      try {
        // Simulated API response - in production: await fetch(`/api/portal/${token}`)
        const mockOrder: OrderPortalData = {
          orderId: 'ORD_' + token.slice(0, 8),
          orderDate: new Date().toISOString(),
          status: 'ready', // or 'pre_order' or 'refunded'
          downloads: [
            {
              id: 'dl_epub_001',
              format: 'EPUB',
              url: `/download/epub_${token}`,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              downloadsRemaining: 3,
            },
            {
              id: 'dl_pdf_001',
              format: 'PDF',
              url: `/download/pdf_${token}`,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              downloadsRemaining: 3,
            },
          ],
        };
        setOrder(mockOrder);
        setLoading(false);
      } catch {
        setError('Could not load your order. Please check your link or contact support.');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token]);

  const handleExtend = async (downloadId: string) => {
    setExtending(downloadId);
    try {
      const response = await fetch('/api/portal/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalToken: token, downloadTokenId: downloadId }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(prev => prev ? {
          ...prev,
          downloads: prev.downloads.map(d =>
            d.id === downloadId
              ? { ...d, expiresAt: data.expiresAt, downloadsRemaining: data.downloadsRemaining }
              : d
          ),
        } : null);
      }
    } catch {
      // Handle error
    }
    setExtending(null);
  };

  if (loading) {
    return (
      <section className="portal-page" style={{ paddingTop: '120px' }}>
        <div className="container container-narrow">
          <div className="loading-state">Loading your order...</div>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="portal-page" style={{ paddingTop: '120px' }}>
        <div className="container container-narrow">
          <div className="error-state">
            <h1>Order Not Found</h1>
            <p>{error || 'This order could not be found.'}</p>
            <p>If you believe this is an error, please contact support at support@curlsandcontemplation.com</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="portal-page" style={{ paddingTop: '120px' }}>
      <div className="container container-narrow">
        <div className="portal-content">
          <div className="portal-header">
            <h1>Your Order Portal</h1>
            <p className="order-id">Order #{order.orderId}</p>
            <p className="order-date">Purchased on {new Date(order.orderDate).toLocaleDateString()}</p>
          </div>

          {order.status === 'pre_order' && (
            <div className="portal-preorder">
              <div className="preorder-banner">
                <span className="preorder-icon">📅</span>
                <h2>Pre-Order Confirmed!</h2>
                <p>
                  Your eBook will be delivered automatically on release day.
                  We'll send you an email with download links as soon as it's available.
                </p>
              </div>
              <div className="preorder-benefits">
                <h3>While You Wait</h3>
                <ul>
                  <li>Join our community of stylists on Instagram <a href={authorBio.instagramUrl} target="_blank" rel="noopener noreferrer">{authorBio.handle}</a></li>
                  <li>Download the free <a href="/resources">Pricing Confidence Kit</a></li>
                  <li>Bookmark this page to access your downloads on release day</li>
                </ul>
              </div>
            </div>
          )}

          {order.status === 'ready' && (
            <div className="portal-downloads">
              <h2>Your Downloads</h2>
              <p className="downloads-intro">
                Click below to download your eBook. Each link can be used up to 3 times
                and expires after 7 days. Need more downloads? Click "Extend" for another week.
              </p>
              <div className="downloads-grid">
                {order.downloads.map(dl => (
                  <div key={dl.id} className="download-card">
                    <div className="download-format">
                      <span className="format-icon">{dl.format === 'EPUB' ? '📱' : '📄'}</span>
                      <span className="format-name">{dl.format}</span>
                    </div>
                    <div className="download-info">
                      <p>Downloads remaining: {dl.downloadsRemaining}</p>
                      <p>Expires: {new Date(dl.expiresAt).toLocaleDateString()}</p>
                    </div>
                    <div className="download-actions">
                      <a href={dl.url} className="btn btn-gold">Download {dl.format}</a>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleExtend(dl.id)}
                        disabled={extending === dl.id}
                      >
                        {extending === dl.id ? 'Extending...' : 'Extend 7 Days'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.status === 'refunded' && (
            <div className="portal-refunded">
              <h2>Order Refunded</h2>
              <p>This order has been refunded and downloads are no longer available.</p>
              <p>If you have questions, please contact support@curlsandcontemplation.com</p>
            </div>
          )}

          <div className="portal-help">
            <h3>Need Help?</h3>
            <p>Contact us at <a href="mailto:support@curlsandcontemplation.com">support@curlsandcontemplation.com</a></p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Privacy Policy Page
const PrivacyPage: React.FC = () => {
  return (
    <section className="legal-page" style={{ paddingTop: '120px' }}>
      <div className="container container-narrow">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: January 2025</p>

        <h2>Information We Collect</h2>
        <p>
          When you purchase from or subscribe to Curls & Contemplation, we collect information
          you provide directly, including your name, email address, and payment information.
        </p>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>To process your orders and deliver your eBook</li>
          <li>To send you transactional emails about your purchase</li>
          <li>To send marketing emails if you've opted in</li>
          <li>To improve our products and services</li>
        </ul>

        <h2>Data Security</h2>
        <p>
          We use industry-standard encryption and security measures to protect your data.
          Payment processing is handled securely by Stripe, and we never store your full
          credit card information.
        </p>

        <h2>Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li><strong>Stripe</strong> - Payment processing</li>
          <li><strong>Resend</strong> - Transactional email delivery</li>
          <li><strong>Mailchimp</strong> - Marketing email campaigns</li>
          <li><strong>Cloudflare</strong> - Website security and performance</li>
        </ul>

        <h2>Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal data
          at any time by emailing privacy@curlsandcontemplation.com.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy-related inquiries, contact us at privacy@curlsandcontemplation.com.
        </p>
      </div>
    </section>
  );
};

// Terms of Service Page
const TermsPage: React.FC = () => {
  return (
    <section className="legal-page" style={{ paddingTop: '120px' }}>
      <div className="container container-narrow">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: January 2025</p>

        <h2>1. License</h2>
        <p>
          When you purchase <em>Curls & Contemplation</em>, you receive a personal,
          non-transferable license to read and use the content for your own benefit.
          You may not redistribute, resell, or share the eBook files.
        </p>

        <h2>2. Delivery</h2>
        <p>
          Digital products are delivered via email to the address provided at checkout.
          Pre-orders will be delivered automatically on the release date. We are not
          responsible for delivery failures due to incorrect email addresses.
        </p>

        <h2>3. Refund Policy</h2>
        <p>
          We offer a 30-day money-back guarantee. If you're not satisfied with your
          purchase, email refunds@curlsandcontemplation.com within 30 days of purchase
          for a full refund. Upon refund, your download access will be revoked.
        </p>

        <h2>4. Intellectual Property</h2>
        <p>
          All content in <em>Curls & Contemplation</em> is copyrighted by Michael David Warren.
          Unauthorized reproduction, distribution, or modification is prohibited.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          The information in this book is for educational purposes only. Results may vary.
          We are not liable for any business decisions made based on the content.
        </p>

        <h2>6. Contact</h2>
        <p>
          For questions about these terms, contact legal@curlsandcontemplation.com.
        </p>
      </div>
    </section>
  );
};

// Footer Component
const Footer: React.FC = () => {
  const { setPage } = useContext(RouterContext);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Curls & Contemplation</h3>
            <p>{bookMetadata.subtitle}</p>
            <BuyButton source="footer" variant="gold" />
          </div>
          <div className="footer-links">
            <h4>Book</h4>
            <ul>
              <li><a href="/" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Home</a></li>
              <li><a href="/book" onClick={(e) => { e.preventDefault(); setPage('book'); }}>Sales Page</a></li>
              <li><a href="/chapters" onClick={(e) => { e.preventDefault(); setPage('chapters'); }}>Chapters</a></li>
              <li><a href="/about" onClick={(e) => { e.preventDefault(); setPage('about'); }}>About</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Free Resources</h4>
            <ul>
              <li><a href="/resources" onClick={(e) => { e.preventDefault(); setPage('resources'); }}>Pricing Kit</a></li>
              <li><a href="/resources" onClick={(e) => { e.preventDefault(); setPage('resources'); }}>Worksheets</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Connect</h4>
            <ul>
              <li><a href={authorBio.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="mailto:support@curlsandcontemplation.com">Contact</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><a href="/privacy" onClick={(e) => { e.preventDefault(); setPage('privacy'); }}>Privacy Policy</a></li>
              <li><a href="/terms" onClick={(e) => { e.preventDefault(); setPage('terms'); }}>Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Michael David Warren. All rights reserved.</p>
          <p className="footer-security">
            <span>🔒 Secure checkout</span>
            <span>💳 Stripe payments</span>
            <span>📧 Instant delivery</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

// Main App with Router
const App: React.FC = () => {
  const [page, setPageState] = useState('home');
  const [params, setParams] = useState<Record<string, string>>({});

  const setPage = useCallback((newPage: string, newParams: Record<string, string> = {}) => {
    setPageState(newPage);
    setParams(newParams);

    // Update URL
    let path = `/${newPage}`;
    if (newPage === 'home') path = '/';
    if (newPage === 'chapter' && newParams.slug) path = `/chapter/${newParams.slug}`;
    if (newPage === 'portal' && newParams.token) path = `/portal/${newParams.token}`;

    window.history.pushState({}, '', path);
  }, []);

  const navigate = useCallback((path: string) => {
    const { page: newPage, params: newParams } = parseUrl(path);
    setPage(newPage, newParams);
  }, [setPage]);

  // Handle initial URL and back/forward navigation
  useEffect(() => {
    const handleNavigation = () => {
      const { page: newPage, params: newParams } = parseUrl(window.location.pathname);
      setPageState(newPage);
      setParams(newParams);
    };

    handleNavigation();
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Track page views
  useEffect(() => {
    trackEvent('page_view', { page, ...params });
    window.scrollTo(0, 0);
  }, [page, params]);

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage />;
      case 'book':
        return <BookPage />;
      case 'chapters':
        return <ChaptersPage />;
      case 'chapter':
        return <ChapterPreviewPage slug={params.slug || ''} />;
      case 'about':
        return <AboutPage />;
      case 'resources':
        return <ResourcesPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'thank-you':
        return <ThankYouPage />;
      case 'portal':
        return <OrderPortalPage token={params.token || ''} />;
      case 'privacy':
        return <PrivacyPage />;
      case 'terms':
        return <TermsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <RouterContext.Provider value={{ page, params, setPage, navigate }}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navigation />
      <main id="main-content">
        {renderPage()}
      </main>
      <Footer />
      <ExitIntentModal />
    </RouterContext.Provider>
  );
};

// Mount the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
