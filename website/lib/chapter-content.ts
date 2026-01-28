// Chapter content extracted from EPUB XHTML files for preview pages
// Per SOW: Chapter title, summary, 3-6 paragraph excerpt, pull quote

export interface ChapterPreview {
  slug: string;
  number: number;
  romanNumeral: string;
  title: string;
  partNumber: number;
  partTitle: string;
  summary: string;
  excerpt: string[];
  pullQuote: string;
  bibleQuote?: { text: string; reference: string };
}

// Chapter previews with excerpts from the manuscript
export const chapterPreviews: ChapterPreview[] = [
  {
    slug: "unveiling-your-creative-odyssey",
    number: 1,
    romanNumeral: "I",
    title: "Unveiling Your Creative Odyssey",
    partNumber: 1,
    partTitle: "Foundations of Creative Hairstyling",
    summary: "Discover the transformative power of conscious hairstyling and how your craft can reshape lives, one cut at a time.",
    excerpt: [
      "Picture celebrity stylist Ursula Stephen, who transformed Rihanna's look early in her career, catapulting both the singer's and her own careers to new heights. With each cut, Ursula shaped not only her client's confidence but also a bold public identity, proving that hairstyling is more than aesthetics—it's a powerful tool for self-expression and cultural influence.",
      "In a society where hair can symbolize power, rebellion, and individuality, stylists like Stephen—and pioneers such as Madam C.J. Walker—showcase how hairstyling holds the power to not only transform appearances but also to reshape societal expectations.",
      "This chapter embarks on a journey to explore the profound impact of conscious hairstyling. We'll delve into its ability to redefine lives, one cut, color, and conversation at a time. Prepare to challenge conventional beauty standards as we examine the multifaceted roles of hairstylists as artists, confidants, and agents of change.",
      "Through compelling stories, expert insights, and practical strategies, you'll acquire the tools to enhance your skills, forge meaningful connections with clients, and leverage the transformative power of conscious hairstyling.",
    ],
    pullQuote: "I forgot she was still in there.",
    bibleQuote: {
      text: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.",
      reference: "Ephesians 2:10",
    },
  },
  {
    slug: "refining-your-creative-toolkit",
    number: 2,
    romanNumeral: "II",
    title: "Refining Your Creative Toolkit",
    partNumber: 1,
    partTitle: "Foundations of Creative Hairstyling",
    summary: "Build a comprehensive creative toolkit that combines classic techniques with innovative approaches to elevate your artistry.",
    excerpt: [
      "Every master artist possesses a toolkit—not just physical instruments, but a collection of skills, perspectives, and approaches that define their craft. For the conscious hairstylist, this toolkit extends far beyond scissors and combs.",
      "In this chapter, we explore the essential components of a creative toolkit: technical mastery, emotional intelligence, cultural awareness, and the ability to translate client visions into reality.",
      "From mastering the fundamentals of cutting and coloring to developing an eye for proportion and balance, you'll learn how to refine each element of your practice.",
    ],
    pullQuote: "Your toolkit is not just what you hold in your hands—it's what you hold in your mind and heart.",
  },
  {
    slug: "reigniting-your-creative-fire",
    number: 3,
    romanNumeral: "III",
    title: "Reigniting Your Creative Fire",
    partNumber: 1,
    partTitle: "Foundations of Creative Hairstyling",
    summary: "Overcome creative blocks and rediscover the passion that first drew you to hairstyling.",
    excerpt: [
      "Every artist experiences seasons of drought—times when inspiration feels distant and the work becomes routine. For hairstylists, this creative fatigue can manifest as repetitive styles, diminished enthusiasm, or a sense of going through the motions.",
      "But within every creative drought lies the seed of renewal. This chapter provides practical strategies for reigniting your creative fire: from seeking inspiration in unexpected places to developing rituals that nurture your artistic spirit.",
      "You'll discover how to transform burnout into breakthrough, turning periods of stagnation into catalysts for growth and innovation.",
    ],
    pullQuote: "Creativity is not a finite resource—it's a flame that can always be rekindled.",
  },
  {
    slug: "the-art-of-networking-in-freelance-hairstyling",
    number: 4,
    romanNumeral: "IV",
    title: "The Art of Networking in Freelance Hairstyling",
    partNumber: 2,
    partTitle: "Building Your Professional Practice",
    summary: "Master the art of building meaningful professional relationships that fuel your career growth.",
    excerpt: [
      "In the freelance world, your network is your net worth. But networking isn't about collecting business cards or accumulating social media followers—it's about cultivating genuine relationships that create mutual value.",
      "This chapter reveals the secrets of effective networking for hairstylists: how to approach industry events with confidence, leverage social platforms authentically, and transform casual connections into career-defining relationships.",
      "From collaborating with photographers and makeup artists to connecting with salon owners and brand representatives, you'll learn strategies for expanding your professional circle while staying true to your artistic vision.",
    ],
    pullQuote: "The strongest networks are built on generosity, not transactions.",
  },
  {
    slug: "cultivating-creative-excellence-through-mentorship",
    number: 5,
    romanNumeral: "V",
    title: "Cultivating Creative Excellence Through Mentorship",
    partNumber: 2,
    partTitle: "Building Your Professional Practice",
    summary: "Harness the power of mentorship—both as a student and as a guide—to accelerate your professional development.",
    excerpt: [
      "Behind every successful stylist stands a lineage of mentors who shaped their craft. From Guido Palau to Jawara, the masters of our industry didn't reach their heights alone—they climbed on the shoulders of those who came before.",
      "This chapter explores both sides of the mentorship equation: how to find and learn from mentors who can accelerate your growth, and how to pay it forward by guiding emerging stylists.",
      "You'll discover the art of learning from industry legends while developing your unique voice, creating a legacy that extends beyond your own chair.",
    ],
    pullQuote: "The best mentors don't create copies of themselves—they help you become the best version of yourself.",
  },
  {
    slug: "mastering-the-business-of-hairstyling",
    number: 6,
    romanNumeral: "VI",
    title: "Mastering the Business of Hairstyling",
    partNumber: 2,
    partTitle: "Building Your Professional Practice",
    summary: "Transform your artistic talent into a thriving business with proven strategies for pricing, marketing, and client retention.",
    excerpt: [
      "Artistry alone doesn't pay the bills. The most talented stylists can struggle financially if they haven't mastered the business side of their craft. This chapter bridges the gap between creative excellence and commercial success.",
      "From setting prices that reflect your value to creating marketing strategies that attract your ideal clients, you'll learn the fundamentals of running a profitable hairstyling practice.",
      "We'll explore client retention strategies, booking systems, and the financial habits that separate thriving stylists from those who merely survive.",
    ],
    pullQuote: "Your price is a reflection of your expertise, not an apology for taking up space.",
  },
  {
    slug: "embracing-wellness-and-self-care",
    number: 7,
    romanNumeral: "VII",
    title: "Embracing Wellness and Self-Care",
    partNumber: 2,
    partTitle: "Building Your Professional Practice",
    summary: "Protect your most valuable asset—yourself—with sustainable practices for physical and mental well-being.",
    excerpt: [
      "The demands of hairstyling take a toll. Long hours on your feet, repetitive motions, emotional labor with clients, and the pressure to stay creative can deplete even the most passionate professionals.",
      "This chapter addresses the wellness challenges unique to our industry: from preventing physical strain and injury to managing the emotional weight of being a confidant to countless clients.",
      "You'll develop a personalized self-care practice that sustains your career for decades, not just years.",
    ],
    pullQuote: "You cannot pour from an empty cup. Self-care isn't selfish—it's essential.",
  },
  {
    slug: "advancing-skills-through-continuous-education",
    number: 8,
    romanNumeral: "VIII",
    title: "Advancing Skills Through Continuous Education",
    partNumber: 2,
    partTitle: "Building Your Professional Practice",
    summary: "Stay ahead in an ever-evolving industry through strategic learning and skill development.",
    excerpt: [
      "The hairstyling industry never stands still. New techniques emerge, trends evolve, and client expectations shift. The stylists who thrive are those who commit to lifelong learning.",
      "This chapter provides a roadmap for continuous education: how to identify skill gaps, choose the right workshops and courses, and integrate new knowledge into your practice.",
      "From online masterclasses to hands-on intensives, you'll learn how to build a learning plan that keeps you at the cutting edge of your craft.",
    ],
    pullQuote: "The moment you stop learning is the moment you start falling behind.",
  },
  {
    slug: "stepping-into-leadership",
    number: 9,
    romanNumeral: "IX",
    title: "Stepping Into Leadership",
    partNumber: 3,
    partTitle: "Advanced Business Strategies",
    summary: "Embrace your potential as a leader who inspires, guides, and elevates the next generation of stylists.",
    excerpt: [
      "Leadership in hairstyling extends beyond managing a team. It's about setting standards, modeling excellence, and creating environments where creativity flourishes.",
      "This chapter explores the transition from skilled practitioner to influential leader: how to develop your leadership style, build and manage teams, and create a culture of excellence.",
      "Whether you're leading a salon team or mentoring apprentices, you'll discover strategies for inspiring others while continuing to grow as an artist yourself.",
    ],
    pullQuote: "True leaders don't create followers—they create more leaders.",
  },
  {
    slug: "crafting-enduring-legacies",
    number: 10,
    romanNumeral: "X",
    title: "Crafting Enduring Legacies",
    partNumber: 3,
    partTitle: "Advanced Business Strategies",
    summary: "Build a career that leaves a lasting impact on the industry, your community, and future generations of stylists.",
    excerpt: [
      "Every cut fades, every color grows out. But the impact of a conscious hairstylist can last for generations. This chapter invites you to think beyond individual clients and consider the legacy you're building.",
      "From establishing your signature style to creating educational content that outlives you, you'll explore pathways to lasting influence.",
      "We examine how industry legends have cemented their legacies and how you can craft your own enduring contribution to the art of hairstyling.",
    ],
    pullQuote: "Your legacy isn't built in a day—it's built one client, one student, one innovation at a time.",
  },
  {
    slug: "advanced-digital-strategies-for-freelance-hairstylists",
    number: 11,
    romanNumeral: "XI",
    title: "Advanced Digital Strategies for Freelance Hairstylists",
    partNumber: 3,
    partTitle: "Advanced Business Strategies",
    summary: "Leverage digital platforms to expand your reach, build your brand, and create new revenue streams.",
    excerpt: [
      "The digital revolution has transformed how stylists connect with clients, showcase work, and build careers. But success online requires more than posting photos—it demands a strategic approach.",
      "This chapter dives deep into digital marketing for hairstylists: from optimizing your social media presence to building a personal website that converts followers into clients.",
      "You'll learn content creation strategies, engagement techniques, and how to monetize your online presence through courses, products, and partnerships.",
    ],
    pullQuote: "Social media isn't just about showing your work—it's about telling your story.",
  },
  {
    slug: "financial-wisdom-building-sustainable-ventures",
    number: 12,
    romanNumeral: "XII",
    title: "Financial Wisdom: Building Sustainable Ventures",
    partNumber: 3,
    partTitle: "Advanced Business Strategies",
    summary: "Master the financial fundamentals that transform creative talent into lasting prosperity.",
    excerpt: [
      "Financial literacy is often the missing piece in a stylist's education. Cosmetology school teaches cutting and coloring, but rarely covers budgeting, investing, or retirement planning.",
      "This chapter fills that gap with practical financial guidance tailored to freelance hairstylists: from managing irregular income to building wealth over time.",
      "You'll learn strategies for pricing your services profitably, managing taxes, saving for the future, and creating financial security in an unpredictable industry.",
    ],
    pullQuote: "Financial freedom isn't about making more—it's about keeping more of what you make.",
  },
  {
    slug: "embracing-ethics-and-sustainability-in-hairstyling",
    number: 13,
    romanNumeral: "XIII",
    title: "Embracing Ethics and Sustainability in Hairstyling",
    partNumber: 3,
    partTitle: "Advanced Business Strategies",
    summary: "Align your practice with values that honor both people and planet.",
    excerpt: [
      "The beauty industry's environmental footprint is significant—from chemical runoff to single-use plastics. But conscious hairstylists are leading a movement toward more sustainable practices.",
      "This chapter explores ethical considerations in our craft: choosing eco-friendly products, reducing waste, and creating salon environments that prioritize both client health and environmental responsibility.",
      "You'll discover how sustainability can be a competitive advantage, attracting clients who share your values.",
    ],
    pullQuote: "Every small choice adds up. Sustainability isn't a destination—it's a direction.",
  },
  {
    slug: "the-impact-of-ai-on-the-beauty-industry",
    number: 14,
    romanNumeral: "XIV",
    title: "The Impact of AI on the Beauty Industry",
    partNumber: 4,
    partTitle: "Future-Focused Growth",
    summary: "Navigate the emerging landscape of artificial intelligence and its implications for hairstyling professionals.",
    excerpt: [
      "Artificial intelligence is reshaping industries worldwide, and beauty is no exception. From virtual try-on tools to personalized product recommendations, AI is changing how clients discover and experience hairstyling.",
      "This chapter examines the opportunities and challenges AI presents: how to leverage technology to enhance your services while preserving the irreplaceable human connection at the heart of our craft.",
      "You'll learn to embrace innovation without losing the artistry that makes hairstyling a uniquely human endeavor.",
    ],
    pullQuote: "Technology enhances the experience, but it can never replace the artist.",
  },
  {
    slug: "cultivating-resilience-and-well-being-in-hairstyling",
    number: 15,
    romanNumeral: "XV",
    title: "Cultivating Resilience and Well-Being in Hairstyling",
    partNumber: 4,
    partTitle: "Future-Focused Growth",
    summary: "Build the mental and emotional resilience needed to thrive through industry changes and personal challenges.",
    excerpt: [
      "The path of a hairstylist is rarely linear. Economic downturns, industry shifts, personal setbacks—challenges are inevitable. What separates those who endure from those who flourish is resilience.",
      "This chapter provides tools for building mental and emotional strength: strategies for handling rejection, recovering from setbacks, and maintaining passion through difficult seasons.",
      "You'll develop a resilience practice that helps you weather any storm and emerge stronger.",
    ],
    pullQuote: "Resilience isn't about avoiding the fall—it's about how quickly you rise.",
  },
  {
    slug: "tresses-and-textures-embracing-diversity-in-hairstyling",
    number: 16,
    romanNumeral: "XVI",
    title: "Tresses and Textures: Embracing Diversity in Hairstyling",
    partNumber: 4,
    partTitle: "Future-Focused Growth",
    summary: "Champion inclusivity by mastering techniques for all hair textures and celebrating the beauty in diversity.",
    excerpt: [
      "For too long, cosmetology education has centered on straight hair textures, leaving stylists unprepared to serve clients with curly, coily, and kinky hair. This chapter confronts that gap head-on.",
      "We explore the science and artistry of working with all hair textures: from understanding curl patterns and porosity to mastering techniques specific to textured hair.",
      "More than technique, this chapter is a call to create salon spaces where every client—regardless of their hair texture—feels seen, celebrated, and beautifully served.",
    ],
    pullQuote: "True mastery means excellence across all textures. Every head of hair deserves an artist who understands it.",
  },
];

// Get chapter by slug
export function getChapterBySlug(slug: string): ChapterPreview | undefined {
  return chapterPreviews.find((c) => c.slug === slug);
}

// Get chapters by part
export function getChaptersByPart(partNumber: number): ChapterPreview[] {
  return chapterPreviews.filter((c) => c.partNumber === partNumber);
}

// Get previous and next chapters for navigation
export function getChapterNavigation(
  currentSlug: string
): { prev: ChapterPreview | null; next: ChapterPreview | null } {
  const currentIndex = chapterPreviews.findIndex((c) => c.slug === currentSlug);
  return {
    prev: currentIndex > 0 ? chapterPreviews[currentIndex - 1] : null,
    next: currentIndex < chapterPreviews.length - 1 ? chapterPreviews[currentIndex + 1] : null,
  };
}

// Part titles
export const partTitles: Record<number, string> = {
  1: "Foundations of Creative Hairstyling",
  2: "Building Your Professional Practice",
  3: "Advanced Business Strategies",
  4: "Future-Focused Growth",
};
