import React from 'react';

interface SampleChapterBannerProps {
  onNavigate?: (path: string) => void;
}

export const SampleChapterBanner: React.FC<SampleChapterBannerProps> = ({ onNavigate }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    // Track download event
    if ((window as any).gtag) {
      (window as any).gtag('event', 'sample_chapter_download', {
        event_category: 'engagement',
        event_label: 'Sample Chapter'
      });
    }

    // Trigger download
    const link = document.createElement('a');
    link.href = '/downloads/sample-chapter-unveiling-your-creative-odyssey.pdf';
    link.download = 'Curls-and-Contemplation-Sample-Chapter.pdf';
    link.click();
  };

  return (
    <section className="sample-chapter-banner">
      <div className="sample-chapter-content">
        <h2>Read Chapter 1 FREE</h2>
        <p>
          Experience the transformative power of conscious hairstyling. Download the first chapter—no email required.
        </p>
        <a
          href="/downloads/sample-chapter-unveiling-your-creative-odyssey.pdf"
          className="sample-download-btn"
          onClick={handleDownload}
          download
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13L5 8H8V3H12V8H15L10 13Z" fill="currentColor"/>
            <path d="M3 15H17V17H3V15Z" fill="currentColor"/>
          </svg>
          Download Chapter 1 (PDF)
        </a>
        <p style={{ marginTop: 'var(--space-md)', fontSize: '0.9rem', opacity: 0.9 }}>
          Instant download • No signup • 15-minute read
        </p>
      </div>
    </section>
  );
};

export const SampleChapterInline: React.FC<SampleChapterBannerProps> = ({ onNavigate }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    if ((window as any).gtag) {
      (window as any).gtag('event', 'sample_chapter_download', {
        event_category: 'engagement',
        event_label: 'Sample Chapter Inline'
      });
    }

    const link = document.createElement('a');
    link.href = '/downloads/sample-chapter-unveiling-your-creative-odyssey.pdf';
    link.download = 'Curls-and-Contemplation-Sample-Chapter.pdf';
    link.click();
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--color-teal-faint), var(--color-gold-faint))',
      border: '2px solid var(--color-teal)',
      borderRadius: '12px',
      padding: 'var(--space-xl)',
      textAlign: 'center',
      margin: 'var(--space-xl) 0'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          marginBottom: 'var(--space-md)',
          color: 'var(--color-teal-dark)'
        }}>
          Not Sure Yet? Try Before You Buy
        </h3>
        <p style={{ marginBottom: 'var(--space-lg)', fontSize: '1.1rem', color: 'var(--color-text)' }}>
          Download the first chapter absolutely free. No email, no strings attached—just great content.
        </p>
        <a
          href="/downloads/sample-chapter-unveiling-your-creative-odyssey.pdf"
          className="btn btn-secondary"
          onClick={handleDownload}
          download
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.1rem'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13L5 8H8V3H12V8H15L10 13Z" fill="currentColor"/>
            <path d="M3 15H17V17H3V15Z" fill="currentColor"/>
          </svg>
          Download Sample Chapter (PDF)
        </a>
      </div>
    </div>
  );
};
