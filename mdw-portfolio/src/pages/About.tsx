import { motion } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import { FEATURED_CLIENTS, CAREER_TIMELINE } from "@/lib/data";
import { EmailSignup } from "@/components/EmailSignup";

export default function About() {
  return (
    <PageTransition>
      <div className="container mx-auto px-6 md:px-12 pt-12 pb-24">
        
        {/* Main Bio Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start mb-32">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1 relative lg:sticky lg:top-32"
          >
            <div className="aspect-[3/4] relative bg-card overflow-hidden border border-white/5">
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
              <img 
                src={`${import.meta.env.BASE_URL}images/about-portrait.png`}
                alt="Michael David Portrait" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-64 p-8 bg-[#0a0a0a] border-l-2 border-l-accent border border-white/5 hidden md:block z-20 shadow-2xl">
              <p className="font-display italic text-2xl text-center text-foreground/90">"Hair is never just hair."</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <h1 className="text-5xl md:text-7xl font-display mb-10 text-foreground">About Michael</h1>
            
            <div className="space-y-6 text-muted-foreground font-sans leading-relaxed text-lg">
              <p className="text-foreground/90 text-xl leading-relaxed font-display italic">
                Some hairstylists build their careers behind the quiet rhythm of a salon chair. Michael David Warren built his inside the electric chaos of fashion's biggest stages.
              </p>
              <p>
                Rather than following the traditional path of salon apprenticeship, Michael stepped directly into the fast-moving world of fashion editorials and runway shows, assisting legendary hairstylists including Guido Palau, Jimmy Paul, and Jawara during major Fashion Weeks. Those early years placed him at the center of the creative engine that drives global fashion — where instinct, speed, and imagination are required in equal measure.
              </p>
              <p>
                Along the way, Michael found mentorship from artists whose work helped shape his creative perspective: celebrated hairstylists Yusef Williams, Vernon François, and Naeemah LaFond. Their guidance helped him refine a point of view rooted not only in technical precision but in cultural awareness and storytelling through hair.
              </p>
              <p>
                That path eventually led Michael to collaborate closely with Rihanna's creative team, working with the global icon for nearly four years before becoming her day-to-day hairstylist. The role placed him inside one of the most influential creative ecosystems in modern pop culture — styling for campaigns, editorials, performances, and red-carpet moments seen around the world.
              </p>
              <p>
                Over the past decade, Michael's work has moved fluidly between fashion, entertainment, and editorial storytelling. His hairstyling has appeared in major publications including Vogue, Vanity Fair, W Magazine, Teen Vogue, Refinery29, Glamour, and Who What Wear, as well as global campaigns including Nike's "Greatest Dynasty Ever."
              </p>
              <p>
                His career has taken him across creative capitals from London and Paris to Tokyo, Stockholm, and Mexico City — building a body of work shaped by international collaboration and a deep appreciation for the cultural language of beauty.
              </p>
            </div>

            {/* The Turning Point */}
            <div className="mt-12 p-8 bg-card/50 border-l-2 border-l-accent border border-border">
              <p className="text-muted-foreground font-sans leading-relaxed text-base mb-4">
                Yet the moment that reshaped Michael's understanding of his craft didn't happen on a runway or inside a studio. It happened quietly in a client's kitchen during lockdown.
              </p>
              <p className="text-muted-foreground font-sans leading-relaxed text-base mb-4">
                A client called him in tears. Depression had taken hold, and her hair had become matted beyond what she could face alone. Michael sat with her for hours, gently working through every knot while she cried. When he finished, she looked at herself in the mirror and whispered five words he would never forget:
              </p>
              <p className="font-display italic text-2xl text-foreground/90 my-6">
                "I forgot she was still in there."
              </p>
              <p className="text-muted-foreground font-sans leading-relaxed text-base">
                In that moment, Michael realized something every great hairstylist eventually learns: hair is never just hair. It holds memory. Identity. Confidence. Sometimes even survival.
              </p>
            </div>

            <div className="mt-8 space-y-6 text-muted-foreground font-sans leading-relaxed text-lg">
              <p>
                That experience sparked the beginning of his book, <span className="italic text-accent">Curls & Contemplation</span>, a reflective and practical guide for hairstylists navigating the emotional, creative, and entrepreneurial realities of freelance life in the beauty industry.
              </p>
              <p>
                Through both his work and his writing, Michael continues to explore the deeper relationship between beauty and identity — how something as simple as a haircut, a texture, or a style can help someone reconnect with themselves.
              </p>
              <p>
                Today he works globally across fashion editorials, campaigns, and creative collaborations while developing new ventures in beauty innovation and education.
              </p>
              <p className="text-foreground/80 font-display italic text-xl border-t border-border pt-8 mt-8">
                When a stylist helps someone see themselves again, the work becomes something far greater than beauty. It becomes restoration.
              </p>
            </div>

            <div className="pt-12 mt-12 border-t border-white/10">
              <a href="/contact" className="inline-block px-8 py-4 border border-primary text-sm uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                Book Michael
              </a>
            </div>
          </motion.div>
          
        </div>

        {/* Career Highlights — Editorial Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display mb-4">Career Highlights</h2>
            <div className="w-12 h-px bg-primary mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAREER_TIMELINE.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
                className="group p-8 bg-card/30 border border-border hover:border-accent/40 transition-all duration-500"
              >
                <span className="text-accent text-xs font-medium tracking-[0.3em] uppercase block mb-4">{item.year}</span>
                <h3 className="text-xl font-display text-foreground mb-3 group-hover:text-primary transition-colors">{item.event}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Selected Clients Block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
           <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display mb-4">Selected Clients</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-8 gap-x-4 text-center">
            {FEATURED_CLIENTS.map((client, idx) => (
              <div key={idx} className="p-4">
                <p className="font-display text-lg text-foreground/80 hover:text-accent transition-colors cursor-default">{client}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Email Signup */}
        <EmailSignup
          variant="section"
          source="about-page"
          heading="Follow the Creative Journey"
          subheading="Join the MDW insider list — new work, collaborations, and behind-the-scenes moments delivered directly to you."
          className="mt-8"
        />

      </div>
    </PageTransition>
  );
}
