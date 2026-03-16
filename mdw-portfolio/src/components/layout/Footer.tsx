import { Link } from "wouter";
import { EmailSignup } from "@/components/EmailSignup";

export function Footer() {
  return (
    <footer className="bg-[#0b0b0b] border-t border-white/5 pt-24 pb-12">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-20">
          <div className="md:col-span-5 lg:col-span-4">
            <Link href="/" className="font-display text-3xl font-semibold tracking-widest text-foreground block mb-6 hover:text-primary transition-colors">
              MDW
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm font-sans leading-relaxed mb-8">
              Michael David <br/>
              Hair Direction · Celebrity · Editorial <br/>
              Los Angeles — New York — Global
            </p>
            
            <div className="max-w-xs">
              <EmailSignup
                variant="compact"
                source="footer"
                heading="Stay Connected"
              />
            </div>
          </div>
          
          <div className="md:col-span-3 lg:col-span-2 lg:col-start-7">
            <h4 className="font-display text-lg mb-6 text-foreground">Portfolio</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/portfolio/covers" className="hover:text-primary transition-colors">Covers</Link>
              </li>
              <li>
                <Link href="/portfolio/editorial" className="hover:text-primary transition-colors">Editorial</Link>
              </li>
              <li>
                <Link href="/portfolio/red-carpet" className="hover:text-primary transition-colors">Red Carpet</Link>
              </li>
              <li>
                <Link href="/portfolio/beauty" className="hover:text-primary transition-colors">Beauty</Link>
              </li>
              <li>
                <Link href="/portfolio/commercial-ecom" className="hover:text-primary transition-colors">Commercial</Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="font-display text-lg mb-6 text-foreground">Inquiries</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="mailto:info@michaeldavidjr.beauty" className="hover:text-primary transition-colors">
                  info@michaeldavidjr.beauty
                </a>
              </li>
              <li className="pt-4">
                <Link href="/contact" className="text-primary hover:text-foreground transition-colors uppercase tracking-widest text-xs border-b border-primary/30 hover:border-foreground pb-0.5">
                  Bookings & Contact
                </Link>
              </li>
            </ul>
            
            <h4 className="font-display text-lg mt-8 mb-4 text-foreground">Social</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://www.instagram.com/md.warren" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/michael-david-warren-94855a239" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
          
        </div>
        
        <div className="w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent mb-0" />
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground tracking-wider uppercase">
            &copy; {new Date().getFullYear()} MDW. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground tracking-wider uppercase">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
