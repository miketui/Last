// FAQ data for common buyer questions

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const faqData: FAQItem[] = [
  // Purchase & Delivery
  {
    question: "What formats does the eBook come in?",
    answer: "You'll receive both EPUB and PDF formats. EPUB works great on Kindle, Apple Books, and most e-readers. PDF is perfect for reading on your computer or tablet. Both are included with your purchase!",
    category: "Purchase & Delivery"
  },
  {
    question: "How quickly will I receive my eBook after purchase?",
    answer: "Instantly! As soon as your payment is confirmed, you'll receive an email with download links. Check your spam folder if you don't see it within 5 minutes. You'll also have access to a personal order portal where you can re-download your files anytime.",
    category: "Purchase & Delivery"
  },
  {
    question: "Can I read this on my Kindle/iPad/Phone?",
    answer: "Absolutely! The EPUB format works on Kindle (just email it to your Kindle address), Apple Books, Google Play Books, and virtually any e-reader app. The PDF works on any device with a PDF reader.",
    category: "Purchase & Delivery"
  },
  {
    question: "Is there a print version available?",
    answer: "Yes! The paperback version is available on Amazon, Barnes & Noble, and other major retailers. Look for the 'Also available in paperback' section with direct links to purchase from your preferred retailer.",
    category: "Purchase & Delivery"
  },

  // Content & Value
  {
    question: "Who is this book for?",
    answer: "This book is specifically for freelance hairstylists who want to elevate their craft, build a thriving business, and create a sustainable career. Whether you're just starting out, stuck at a plateau, or looking to take your practice to the next level, you'll find actionable strategies inside.",
    category: "Content & Value"
  },
  {
    question: "I already work in a salon. Is this still relevant for me?",
    answer: "While the book is written for freelance stylists, the principles on pricing, networking, creativity, and professional development apply to ALL hairstylists. Many salon stylists have used these strategies to transition to freelance or simply level up within their current role.",
    category: "Content & Value"
  },
  {
    question: "What makes this different from other hairstyling books?",
    answer: "This isn't just about technique—it's about building a complete career system. You'll get real strategies from 12+ years working with celebrities, major brands, and building a global freelance practice. Plus, it includes interactive worksheets, journaling pages, and actionable frameworks you can implement immediately.",
    category: "Content & Value"
  },
  {
    question: "How long is the book?",
    answer: "The book includes 16 comprehensive chapters organized into 4 parts, plus extensive interactive elements including self-assessments, SMART goal worksheets, and journaling pages. Most readers complete it in 5-7 days, but you'll reference it for years.",
    category: "Content & Value"
  },
  {
    question: "Are there examples and real-world case studies?",
    answer: "Yes! Throughout the book, I share specific stories from my career—from assisting industry legends to styling Rihanna to working on Nike campaigns. Each chapter includes real examples, frameworks I actually use, and lessons from both successes and failures.",
    category: "Content & Value"
  },

  // Pricing & Refunds
  {
    question: "Do you offer a money-back guarantee?",
    answer: "Absolutely! I offer a 30-day, no-questions-asked money-back guarantee. If you're not satisfied with your purchase for any reason, just email us within 30 days and we'll issue a full refund immediately.",
    category: "Pricing & Refunds"
  },
  {
    question: "Are there any discounts or coupon codes?",
    answer: "We occasionally offer promotional codes for new subscribers and during special launches. Sign up for our email list to be notified of any upcoming promotions. We also offer the free Pricing Confidence Kit to help you immediately start earning what you're worth!",
    category: "Pricing & Refunds"
  },
  {
    question: "Can I buy this as a gift?",
    answer: "Yes! During checkout, you can enter any email address where you'd like the eBook delivered. The recipient will receive the download links and order portal access. Consider adding a personal note when you send them the confirmation!",
    category: "Pricing & Refunds"
  },
  {
    question: "Is this a one-time payment?",
    answer: "Yes! This is a one-time purchase with lifetime access. No subscriptions, no recurring charges. Pay once, keep forever, and re-download anytime from your order portal.",
    category: "Pricing & Refunds"
  },

  // Interactive Elements
  {
    question: "What are the interactive worksheets?",
    answer: "The book includes fillable worksheets for: Self-Assessment (pre and post-reading), SMART Goals planning, Networking tracker, Financial planning, Self-care journal, Vision board, and Professional development tracking. These are embedded directly in the eBook for you to use.",
    category: "Interactive Elements"
  },
  {
    question: "Can I print the worksheets?",
    answer: "Yes! While the interactive elements work within the eBook, you can also print them from the PDF version. Many readers print the worksheets and keep them in a dedicated planning binder.",
    category: "Interactive Elements"
  },

  // Technical Support
  {
    question: "What if I lose my download link?",
    answer: "No problem! You have lifetime access through your order portal. Just check your original confirmation email for the portal link, or contact support@curlsandcontemplation.com and we'll send you a new link.",
    category: "Technical Support"
  },
  {
    question: "I'm having trouble downloading the file. What should I do?",
    answer: "First, try a different browser or device. If that doesn't work, email support@curlsandcontemplation.com with details about the issue, and we'll help you get your files within 24 hours. We can also provide alternative download methods if needed.",
    category: "Technical Support"
  },
  {
    question: "Can I share my copy with others?",
    answer: "The eBook is licensed for personal use only. Sharing, distributing, or reselling the files violates copyright. If you know someone who would benefit, please direct them to purchase their own copy or gift them one! This supports the creation of more valuable resources for the hairstyling community.",
    category: "Technical Support"
  },

  // About the Author
  {
    question: "What are Michael David Warren's credentials?",
    answer: "Michael spent 12+ years building a global freelance career, including being Rihanna's day-to-day hairstylist in London, styling for Nike's 'Greatest Dynasty Ever' campaign, working red carpets (SAG Awards, BET Awards), and contributing to Harper's Bazaar, W Magazine, and more. He assisted legends like Guido Palau, Jimmy Paul, and Jawara.",
    category: "About the Author"
  },
  {
    question: "Can I connect with Michael directly?",
    answer: "Follow Michael on Instagram @md.warren for behind-the-scenes content, tips, and inspiration. While he can't personally respond to every message, he regularly shares valuable insights and engages with the community there.",
    category: "About the Author"
  }
];

export const getFAQsByCategory = (category: string): FAQItem[] => {
  return faqData.filter(faq => faq.category === category);
};

export const faqCategories = [
  "Purchase & Delivery",
  "Content & Value",
  "Pricing & Refunds",
  "Interactive Elements",
  "Technical Support",
  "About the Author"
];
