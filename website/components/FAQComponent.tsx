import React, { useState } from 'react';
import { faqData, getFAQsByCategory, faqCategories } from '../lib/faq-data';

export const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="container">
      <div className="faq-container">
        <header style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <h1 className="display-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text)', maxWidth: '700px', margin: '0 auto' }}>
            Everything you need to know about Curls & Contemplation—from purchasing to content to technical support.
          </p>
        </header>

        {faqCategories.map((category, catIndex) => {
          const categoryFAQs = getFAQsByCategory(category);
          if (categoryFAQs.length === 0) return null;

          return (
            <div key={category} className="faq-category">
              <h2>{category}</h2>
              {categoryFAQs.map((faq, faqIndex) => {
                const globalIndex = faqData.indexOf(faq);
                const isOpen = openItems.has(globalIndex);

                return (
                  <div key={faqIndex} className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button
                      className="faq-question"
                      onClick={() => toggleItem(globalIndex)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <span className="faq-icon" aria-hidden="true">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        <div style={{
          marginTop: 'var(--space-xl)',
          padding: 'var(--space-xl)',
          background: 'var(--color-teal-faint)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-teal-dark)' }}>
            Still Have Questions?
          </h3>
          <p style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text)' }}>
            We're here to help! Email us at{' '}
            <a href="mailto:support@curlsandcontemplation.com" style={{ color: 'var(--color-teal)', fontWeight: 600 }}>
              support@curlsandcontemplation.com
            </a>
            {' '}and we'll respond within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
};
