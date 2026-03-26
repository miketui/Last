import { motion } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import { PRESS_MENTIONS } from "@/lib/data";
import { EmailSignup } from "@/components/EmailSignup";
import { Download, ExternalLink } from "lucide-react";

export default function Press() {
  return (
    <PageTransition>
      <div className="container mx-auto px-6 md:px-12 pt-12 pb-24">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-display mb-6">Press & Media</h1>
            <p className="text-muted-foreground text-lg">
              Interviews, features, and critical reception of Michael David's industry-defining work.
            </p>
          </div>
          
          <a 
            href="mailto:info@michaeldavidjr.beauty?subject=Press Kit Request"
            className="flex items-center gap-3 px-6 py-3 border border-border hover:border-primary hover:text-primary transition-all uppercase tracking-widest text-xs font-medium"
          >
            <Download className="w-4 h-4" /> Download Press Kit
          </a>
        </div>

        {/* Featured Press Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {PRESS_MENTIONS.slice(0, 3).map((press, i) => (
            <motion.article 
              key={press.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative flex flex-col bg-card/30 border border-border p-8 hover:border-primary/50 transition-colors"
            >
              <div className="flex gap-4 items-center mb-6">
                <span className="text-accent text-xs font-medium uppercase tracking-widest">{press.publication}</span>
                <span className="w-8 h-[1px] bg-accent/30"></span>
                <span className="text-muted-foreground text-xs uppercase tracking-widest">{press.date}</span>
              </div>
              <h2 className="text-3xl font-display mb-4 italic group-hover:text-primary transition-colors leading-tight">"{press.title}"</h2>
              <p className="text-base text-muted-foreground mb-8 flex-1 leading-relaxed">{press.excerpt}</p>
              {press.link ? (
                <a 
                  href={press.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 border-b border-foreground pb-1 hover:border-primary hover:text-primary w-fit transition-colors"
                >
                  Read Feature <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-xs uppercase tracking-widest text-muted-foreground/50">Publication Credit</span>
              )}
            </motion.article>
          ))}
        </div>

        {/* Email Signup — between featured and archive */}
        <EmailSignup
          variant="section"
          source="press-page"
          heading="Get the Story First"
          subheading="Join the MDW list to be notified of new press features, editorials, and exclusive releases."
          className="mb-16"
        />

        {/* Archive List */}
        <div className="max-w-4xl mx-auto">
          <div className="border-b border-border pb-4 mb-8">
            <h3 className="text-xl font-display">Press Archive</h3>
          </div>
          <div className="flex flex-col">
            {PRESS_MENTIONS.slice(3).map((press, i) => (
              <motion.article 
                key={press.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="group border-b border-border py-8 last:border-b-0 flex flex-col md:flex-row gap-6 md:gap-12 md:items-center hover:bg-muted/20 transition-colors px-4 -mx-4 rounded-sm"
              >
                <div className="md:w-1/4 shrink-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-accent text-sm font-medium uppercase tracking-widest">{press.publication}</span>
                    <span className="text-muted-foreground text-xs uppercase tracking-widest">{press.date}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-display mb-2 group-hover:text-primary transition-colors">"{press.title}"</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 md:line-clamp-none">{press.excerpt}</p>
                </div>
                <div className="md:w-32 shrink-0 md:text-right">
                  {press.link ? (
                    <a 
                      href={press.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      Read <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs uppercase tracking-widest text-muted-foreground/40">Credit</span>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="mt-24 pt-12 border-t border-border text-center">
          <div className="w-8 h-px bg-accent mx-auto mb-8" />
          <h3 className="text-2xl font-display mb-4">Media Contact</h3>
          <p className="text-muted-foreground mb-2">For press inquiries, interviews, and media assets:</p>
          <a href="mailto:info@michaeldavidjr.beauty" className="text-primary hover:text-foreground text-lg transition-colors border-b border-primary/30 pb-1">
            info@michaeldavidjr.beauty
          </a>
        </div>

      </div>
    </PageTransition>
  );
}
