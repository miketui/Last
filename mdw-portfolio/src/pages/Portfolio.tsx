import { Link } from "wouter";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import { PORTFOLIO_CATEGORIES } from "@/lib/data";
import { ArrowRight } from "lucide-react";

export default function Portfolio() {
  return (
    <PageTransition>
      <div className="container mx-auto px-6 md:px-12 pt-12 pb-24">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-display mb-8 uppercase tracking-tight">Portfolio Hub</h1>
          <p className="text-muted-foreground tracking-wide leading-relaxed text-lg max-w-2xl mx-auto">
            A curated selection of hair direction spanning high fashion editorial, red carpet moments, beauty campaigns, and commercial work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          {PORTFOLIO_CATEGORIES.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: (i % 2) * 0.2 }}
              className={`group ${i % 2 !== 0 ? 'md:mt-32' : ''} ${i === PORTFOLIO_CATEGORIES.length - 1 && i % 2 === 0 ? 'md:col-span-2 md:max-w-2xl md:mx-auto w-full' : ''}`}
            >
              <Link href={`/portfolio/${category.slug}`} className="block relative">
                <div className="img-zoom-wrapper aspect-[3/4] mb-8 bg-card border border-white/5 overflow-hidden">
                  <img 
                    src={category.coverImage} 
                    alt={category.title} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 mix-blend-luminosity hover:mix-blend-normal"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-500" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-display mb-3 group-hover:text-primary transition-colors">{category.title}</h2>
                    <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium">{category.projects.length} Projects</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <span className="sr-only">View {category.title}</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
