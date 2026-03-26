import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import { PORTFOLIO_CATEGORIES } from "@/lib/data";
import { EmailSignup } from "@/components/EmailSignup";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function Category() {
  const params = useParams();
  const categorySlug = params.category;
  
  const category = PORTFOLIO_CATEGORIES.find(c => c.slug === categorySlug);

  if (!category) {
    return (
      <PageTransition className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-4xl font-display mb-4">Category Not Found</h1>
          <Link href="/portfolio" className="text-primary hover:underline uppercase tracking-widest text-sm">Return to Portfolio</Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-6 md:px-12 pt-8 pb-32">
        <Link href="/portfolio" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Categories
        </Link>
        
        <div className="max-w-4xl mb-24">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="text-6xl md:text-8xl lg:text-9xl font-display tracking-tighter mb-6 uppercase"
          >
            {category.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl font-sans leading-relaxed border-l-2 border-accent/40 pl-6"
          >
            {category.description}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {category.projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.2 }}
              className="group flex flex-col"
            >
              <div className={`img-zoom-wrapper mb-6 bg-card border border-white/5 ${
                category.slug === 'editorial' ? 'aspect-[4/5]' : 
                category.slug === 'commercial-ecom' ? 'aspect-[4/5]' : 
                category.slug === 'covers' ? 'aspect-[3/4]' : 'aspect-[3/4]'
              }`}>
                <img 
                  src={project.imageUrl} 
                  alt={project.imageAlt} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="font-display text-2xl mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                
                <div className="flex justify-between items-end mt-auto">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    <span className="text-foreground">{project.client}</span> &bull; {project.year}
                    {project.publication && <span className="block mt-1 text-accent">{project.publication}</span>}
                  </p>
                  
                  {project.link && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 border-b border-transparent hover:border-primary pb-0.5"
                    >
                      View Feature <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Email Signup */}
        <div className="container mx-auto px-6 md:px-12 mt-4">
          <EmailSignup
            variant="section"
            source={`category-${categorySlug}`}
            heading="Stay Ahead of the Work"
            subheading="New MDW projects, behind-the-scenes access, and press moments — straight to your inbox."
          />
        </div>

      </div>
    </PageTransition>
  );
}
