import { Link } from "wouter";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import { PORTFOLIO_CATEGORIES, PRESS_MENTIONS, FEATURED_CLIENTS } from "@/lib/data";
import { EmailSignup } from "@/components/EmailSignup";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const featuredWork = [
    PORTFOLIO_CATEGORIES[1].projects[0], // Editorial
    PORTFOLIO_CATEGORIES[0].projects[1], // Covers
    PORTFOLIO_CATEGORIES[2].projects[0], // Red Carpet
    PORTFOLIO_CATEGORIES[4].projects[0], // Commercial
  ];

  return (
    <PageTransition className="!pt-0 !pb-0">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/50 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 z-10" />
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="MDW styling"
            className="w-full h-full object-cover object-top opacity-60 mix-blend-luminosity"
          />
        </div>
        
        <div className="relative z-20 text-center px-4 max-w-7xl mx-auto w-full">
          <motion.p
            initial={{ opacity: 0, tracking: "0" }}
            animate={{ opacity: 1, tracking: "0.3em" }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-primary text-xs md:text-sm uppercase tracking-[0.3em] mb-6 font-medium"
          >
            Hair Direction &bull; Celebrity &bull; Editorial
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-9xl font-display text-foreground leading-[0.9] tracking-tighter mx-auto max-w-[15ch]"
          >
            MICHAEL DAVID
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-12 flex justify-center gap-6 flex-wrap"
          >
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-primary/50 hover:bg-primary hover:text-primary-foreground hover:border-primary text-sm uppercase tracking-widest text-primary transition-all duration-300 backdrop-blur-sm"
            >
              Explore Portfolio
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/20 hover:border-foreground text-sm uppercase tracking-widest hover:text-foreground text-muted-foreground transition-all duration-300 backdrop-blur-sm"
            >
              Book Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Intro / Positioning */}
      <section className="py-24 md:py-32 bg-background relative z-20 border-b border-white/5">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-2xl md:text-4xl lg:text-5xl font-display max-w-5xl mx-auto leading-tight text-foreground/90"
          >
            From Rihanna to the red carpet, from Vogue covers to Savage X Fenty — <span className="italic text-accent">Michael David</span> shapes the image of culture's most visible figures.
          </motion.h2>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {PORTFOLIO_CATEGORIES.slice(0, 5).map((category, idx) => (
              <Link 
                key={category.id} 
                href={`/portfolio/${category.slug}`}
                className={`group block relative overflow-hidden aspect-[4/5] bg-card ${
                  idx === 0 || idx === 3 ? "md:col-span-2 lg:col-span-2" : ""
                }`}
              >
                <div className="absolute inset-0 bg-background/20 group-hover:bg-background/0 transition-colors duration-500 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-10" />
                <img
                  src={category.coverImage}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 p-8 z-20 w-full flex justify-between items-end">
                  <div>
                    <span className="text-xs text-accent font-medium uppercase tracking-[0.2em] mb-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                      Explore
                    </span>
                    <h3 className="text-3xl md:text-4xl font-display text-white">{category.title}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-4 group-hover:translate-x-0 group-hover:bg-accent group-hover:border-accent text-white">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Credibility Marquee / Strip */}
      <section className="py-20 border-y border-white/5 bg-[#0a0a0a] overflow-hidden">
        <div className="container mx-auto px-6 text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Featured In</p>
        </div>
        <div className="flex w-full whitespace-nowrap">
          <div className="flex animate-[pulse_10s_ease-in-out_infinite] mx-auto items-center justify-center gap-12 md:gap-24 opacity-60">
            {['Vogue', "Harper's Bazaar", 'W Magazine', 'Vanity Fair', 'Savage X Fenty', 'Nike', 'Teen Vogue', 'Refinery29', 'Glamour', 'Elle UK'].map((brand, i) => (
              <span key={i} className="text-2xl md:text-3xl font-display uppercase tracking-widest text-outline hover:text-foreground hover:-webkit-text-stroke-0 transition-all duration-300 cursor-default">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Work Highlights */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-4xl md:text-5xl font-display">Selected Work</h2>
            <Link href="/portfolio" className="text-sm uppercase tracking-widest hover:text-primary transition-colors hidden md:flex items-center gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredWork.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="img-zoom-wrapper aspect-[3/4] mb-6 bg-card border border-white/5">
                  <img src={project.imageUrl} alt={project.imageAlt} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-display text-xl mb-1 group-hover:text-primary transition-colors">{project.title}</h4>
                <p className="text-sm text-muted-foreground tracking-wider uppercase text-xs">
                  {project.client} &bull; {project.year}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center md:hidden">
            <Link href="/portfolio" className="text-xs uppercase tracking-widest hover:text-primary transition-colors border border-border px-6 py-3 inline-flex items-center gap-2">
              View All Work <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Selected Clients Grid */}
      <section className="py-24 border-t border-white/5 bg-[#0a0a0a]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display mb-4">Selected Clients & Collaborations</h2>
            <div className="w-12 h-px bg-primary mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 border-l border-t border-white/5">
            {FEATURED_CLIENTS.map((client, i) => (
              <div 
                key={i} 
                className="border-r border-b border-white/5 p-6 md:p-8 flex items-center justify-center text-center group transition-colors hover:bg-card/50"
              >
                <span className="text-sm md:text-base font-display uppercase tracking-widest text-muted-foreground group-hover:text-accent transition-colors">
                  {client}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Preview */}
      <section className="py-24 bg-background border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-4xl md:text-5xl font-display text-center mb-16">Press</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRESS_MENTIONS.slice(0,3).map((press, i) => (
              <motion.div
                key={press.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 border border-border bg-card/30 hover:border-primary/50 hover:bg-card transition-all duration-300 flex flex-col h-full"
              >
                <p className="text-accent text-xs font-medium uppercase tracking-widest mb-4">{press.publication} <span className="text-muted-foreground">&bull; {press.date}</span></p>
                <h4 className="font-display text-2xl mb-4 italic leading-tight">"{press.title}"</h4>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">{press.excerpt}</p>
                {press.link ? (
                  <a 
                    href={press.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs uppercase tracking-widest border-b border-border hover:border-primary pb-1 transition-colors inline-block w-fit"
                  >
                    Read Feature
                  </a>
                ) : (
                  <span className="text-xs uppercase tracking-widest text-muted-foreground/50">Publication Credit</span>
                )}
              </motion.div>
            ))}
          </div>
          <div className="mt-16 text-center">
             <Link href="/press" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              View All Press
            </Link>
          </div>
        </div>
      </section>

      {/* Email Signup Banner */}
      <EmailSignup
        variant="banner"
        source="home-page"
      />

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-background to-background z-0" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="w-16 h-0.5 bg-accent mx-auto mb-10 opacity-60" />
          <h2 className="text-5xl md:text-7xl font-display mb-8">Work With MDW</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-12 text-lg">
            Available globally for editorial, celebrity, red carpet, and commercial projects.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-10 py-5 bg-foreground text-background font-medium uppercase tracking-widest text-sm hover:bg-primary transition-colors duration-300">
            Inquire Availability <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
