// Book metadata extracted from EPUB content.opf

export const bookMetadata = {
  title: "Curls & Contemplation",
  subtitle: "A Freelance Hairstylist's Guide to Creative Excellence",
  fullTitle: "Curls & Contemplation: A Freelance Hairstylist's Guide to Creative Excellence",
  author: "Michael David Warren",
  authorHandle: "@md.warren",
  publisher: "Michael David",
  publishDate: "2024",
  description: "A comprehensive guide for freelance hairstylists to develop their creative skills, build professional practices, and achieve business success while maintaining wellness and ethical standards.",
  subjects: [
    "Hairstyling",
    "Beauty Industry",
    "Freelance Business",
    "Professional Development"
  ],
  isbn: "urn:uuid:c8d4e5f6-a1b2-4c3d-9e8f-0a1b2c3d4e5f",
  coverImage: "/images/cover.png",
  authorImage: "/images/Michael.jpeg"
};

export const authorBio = {
  name: "Michael David Warren",
  handle: "@md.warren",
  instagramUrl: "https://instagram.com/md.warren",
  shortBio: "Michael David Warren built a career the industry said was impossible.",
  fullBio: `Michael David Warren built a career the industry said was impossible.

He never swept a salon floor. Never climbed the traditional ladder. Never waited for permission. Instead, he went straight to the arena—assisting hair legends Guido Palau, Jimmy Paul, and Jawara, learning under pressure, proving that an unconventional path could lead somewhere extraordinary.

That path took him to London, where he became Rihanna's day-to-day hairstylist, and into the world of high-stakes creativity: keying Nike's "Greatest Dynasty Ever" campaign, styling major red carpets at the SAG Awards and BET Awards, contributing editorial work to Harper's Bazaar, W Magazine, Wonderland, and Coveteur, and shaping runway collections for Sergio Hudson.

Over more than twelve years, Michael's work has carried him across Tokyo, Stockholm, Mexico City, and Paris—building a global career that doesn't depend on one chair, one city, or one system.`,
  transformativeStory: `During lockdown, a client called in tears. Depression had swallowed her whole. Her hair was matted, tangled beyond what she could manage alone. She couldn't face her own reflection. Michael sat with her at her kitchen table for hours, gently working through every knot while she cried. When he finished, she reached toward the mirror and whispered five words he will never forget: "I forgot she was still in there."`,
  closingMessage: "This book is his way of believing in yours."
};

export interface Chapter {
  number: string;
  title: string;
  romanNumeral: string;
}

export interface Part {
  number: number;
  title: string;
  chapters: Chapter[];
}

export const tableOfContents: {
  frontmatter: string[];
  parts: Part[];
  backmatter: string[];
  interactiveElements: string[];
} = {
  frontmatter: [
    "Title Page",
    "Copyright",
    "Dedication",
    "Self Assessment",
    "Affirmation Odyssey",
    "Preface"
  ],
  parts: [
    {
      number: 1,
      title: "Foundations of Creative Hairstyling",
      chapters: [
        { number: "1", romanNumeral: "I", title: "Unveiling Your Creative Odyssey" },
        { number: "2", romanNumeral: "II", title: "Refining Your Creative Toolkit" },
        { number: "3", romanNumeral: "III", title: "Reigniting Your Creative Fire" }
      ]
    },
    {
      number: 2,
      title: "Building Your Professional Practice",
      chapters: [
        { number: "4", romanNumeral: "IV", title: "The Art of Networking in Freelance Hairstyling" },
        { number: "5", romanNumeral: "V", title: "Cultivating Creative Excellence Through Mentorship" },
        { number: "6", romanNumeral: "VI", title: "Mastering the Business of Hairstyling" },
        { number: "7", romanNumeral: "VII", title: "Embracing Wellness and Self-Care" },
        { number: "8", romanNumeral: "VIII", title: "Advancing Skills Through Continuous Education" }
      ]
    },
    {
      number: 3,
      title: "Advanced Business Strategies",
      chapters: [
        { number: "9", romanNumeral: "IX", title: "Stepping Into Leadership" },
        { number: "10", romanNumeral: "X", title: "Crafting Enduring Legacies" },
        { number: "11", romanNumeral: "XI", title: "Advanced Digital Strategies for Freelance Hairstylists" },
        { number: "12", romanNumeral: "XII", title: "Financial Wisdom - Building Sustainable Ventures" },
        { number: "13", romanNumeral: "XIII", title: "Embracing Ethics and Sustainability in Hairstyling" }
      ]
    },
    {
      number: 4,
      title: "Future-Focused Growth",
      chapters: [
        { number: "14", romanNumeral: "XIV", title: "The Impact of AI on the Beauty Industry" },
        { number: "15", romanNumeral: "XV", title: "Cultivating Resilience and Well-Being in Hairstyling" },
        { number: "16", romanNumeral: "XVI", title: "Tresses and Textures - Embracing Diversity in Hairstyling" }
      ]
    }
  ],
  backmatter: [
    "Conclusion",
    "Quiz Answer Key",
    "Self Assessment (Post-Reading)",
    "Closing Affirmations",
    "Continued Learning Commitment",
    "Acknowledgments",
    "About the Author",
    "Curls & Contemplation Collective",
    "Journaling Start",
    "Manifesting Journal",
    "Journal Page",
    "Professional Development",
    "SMART Goals",
    "Self-Care Journal",
    "Vision Journal",
    "Doodle Page",
    "Bibliography"
  ],
  interactiveElements: [
    "Self Assessment Worksheets",
    "Affirmation Odyssey",
    "Chapter Quizzes",
    "Manifesting Journal",
    "SMART Goals Worksheet",
    "Self-Care Journal",
    "Vision Journal",
    "Professional Development Tracker",
    "Doodle Pages"
  ]
};

export const resources = [
  {
    id: "self-assessment",
    title: "Self Assessment Worksheet",
    description: "Evaluate your current skills and identify areas for growth",
    category: "Foundations",
    downloadUrl: "/downloads/self-assessment.pdf"
  },
  {
    id: "smart-goals",
    title: "SMART Goals Template",
    description: "Set specific, measurable, achievable, relevant, and time-bound goals",
    category: "Professional Practice",
    downloadUrl: "/downloads/smart-goals.pdf"
  },
  {
    id: "networking-tracker",
    title: "Networking Connections Tracker",
    description: "Track and nurture your professional relationships",
    category: "Professional Practice",
    downloadUrl: "/downloads/networking-tracker.pdf"
  },
  {
    id: "financial-planning",
    title: "Financial Planning Worksheet",
    description: "Budget templates and financial goal setting for freelancers",
    category: "Business Strategies",
    downloadUrl: "/downloads/financial-planning.pdf"
  },
  {
    id: "self-care-journal",
    title: "Self-Care Journal Template",
    description: "Daily wellness tracking and mindfulness prompts",
    category: "Future Growth",
    downloadUrl: "/downloads/self-care-journal.pdf"
  },
  {
    id: "vision-board",
    title: "Vision Journal Guide",
    description: "Create a visual roadmap for your career aspirations",
    category: "Future Growth",
    downloadUrl: "/downloads/vision-journal.pdf"
  }
];

export const subscriptionBenefits = [
  "Exclusive launch updates and early access",
  "Free downloadable worksheets and templates",
  "Hairstyling tips and industry insights",
  "Special pre-order pricing notifications",
  "Behind-the-scenes content from Michael"
];
