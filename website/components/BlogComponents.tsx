import React, { useState } from 'react';
import { blogPosts, getBlogPost, getFeaturedPosts, type BlogPost } from '../lib/blog-data';

interface BlogPageProps {
  onNavigate: (path: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
  const featured = getFeaturedPosts();
  const allPosts = blogPosts;

  return (
    <div className="container">
      <section className="section">
        <h1 className="display-title" style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>
          Hairstyling Insights & Strategies
        </h1>
        <p style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem', fontSize: '1.2rem', color: 'var(--color-text)' }}>
          Real strategies from 12+ years building a global freelance career—from pricing to creativity to building your brand.
        </p>

        {featured.length > 0 && (
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <h2 style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-teal-dark)', marginBottom: 'var(--space-lg)' }}>
              Featured Articles
            </h2>
            <div className="blog-grid">
              {featured.map(post => (
                <BlogCard key={post.slug} post={post} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}

        <h2 style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-teal-dark)', marginBottom: 'var(--space-lg)', marginTop: 'var(--space-xl)' }}>
          All Articles
        </h2>
        <div className="blog-grid">
          {allPosts.map(post => (
            <BlogCard key={post.slug} post={post} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
};

interface BlogCardProps {
  post: BlogPost;
  onNavigate: (path: string) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, onNavigate }) => {
  return (
    <article className="blog-card">
      <div className="blog-card-image">📝</div>
      <div className="blog-card-content">
        <div className="blog-meta">
          <span className="blog-category">{post.category}</span>
          <span>•</span>
          <span>{post.readTime}</span>
          <span>•</span>
          <span>{new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <a
          href={`/blog/${post.slug}`}
          className="blog-read-more"
          onClick={(e) => {
            e.preventDefault();
            onNavigate(`/blog/${post.slug}`);
          }}
        >
          Read Full Article →
        </a>
      </div>
    </article>
  );
};

interface BlogPostPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, onNavigate }) => {
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <div className="container" style={{ padding: 'var(--space-xl) var(--space-md)', textAlign: 'center' }}>
        <h1>Post Not Found</h1>
        <p>Sorry, the blog post you're looking for doesn't exist.</p>
        <button className="btn btn-primary" onClick={() => onNavigate('/blog')}>
          ← Back to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <article className="blog-post">
        <button
          onClick={() => onNavigate('/blog')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-teal)',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Blog
        </button>

        <header className="blog-post-header">
          <div className="blog-meta">
            <span className="blog-category">{post.category}</span>
            <span>•</span>
            <span>{post.readTime}</span>
            <span>•</span>
            <span>{new Date(post.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h1>{post.title}</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text)', fontStyle: 'italic' }}>
            {post.excerpt}
          </p>
        </header>

        <div className="blog-post-content">
          {post.content.map((paragraph, idx) => {
            if (paragraph.startsWith('## ')) {
              return <h2 key={idx}>{paragraph.replace('## ', '')}</h2>;
            } else if (paragraph.startsWith('### ')) {
              return <h3 key={idx}>{paragraph.replace('### ', '')}</h3>;
            } else if (paragraph.startsWith('- ')) {
              // Handle list items
              const items = post.content
                .slice(idx)
                .takeWhile(p => p.startsWith('- '))
                .map(p => p.replace('- ', ''));
              if (idx === post.content.findIndex(p => p === paragraph)) {
                return (
                  <ul key={idx}>
                    {items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                );
              }
              return null;
            } else {
              return <p key={idx}>{paragraph}</p>;
            }
          })}

          <div className="blog-cta">
            <h3>Want to Learn More?</h3>
            <p>
              This is just one insight from <strong>Curls & Contemplation</strong>, my comprehensive guide to building a thriving freelance hairstyling career.
            </p>
            <button className="btn btn-primary" onClick={() => onNavigate('/book')}>
              Get the Complete Book
            </button>
          </div>
        </div>

        <footer style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-lg)', borderTop: '2px solid var(--color-line)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            {post.tags.map(tag => (
              <span
                key={tag}
                style={{
                  background: 'var(--color-gold-faint)',
                  color: 'var(--color-gold-dark)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </footer>
      </article>
    </div>
  );
};

// Helper for array takeWhile (not available in older browsers)
declare global {
  interface Array<T> {
    takeWhile(predicate: (value: T) => boolean): T[];
  }
}

if (!Array.prototype.takeWhile) {
  Array.prototype.takeWhile = function<T>(this: T[], predicate: (value: T) => boolean): T[] {
    const result: T[] = [];
    for (const item of this) {
      if (!predicate(item)) break;
      result.push(item);
    }
    return result;
  };
}
