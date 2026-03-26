import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Press", href: "/press" },
    { label: "Contact", href: "/contact" },
  ];

  const portfolioLinks = [
    { label: "Portfolio Hub", href: "/portfolio" },
    { label: "Covers", href: "/portfolio/covers" },
    { label: "Editorial", href: "/portfolio/editorial" },
    { label: "Beauty", href: "/portfolio/beauty" },
    { label: "Commercial / ECOM", href: "/portfolio/commercial-ecom" },
    { label: "Red Carpet", href: "/portfolio/red-carpet" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-background/90 backdrop-blur-md py-4 border-b border-white/5" : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
          <Link href="/" className="group flex items-center">
            <h1 className="font-display text-xl md:text-2xl font-semibold tracking-widest text-foreground transition-colors group-hover:text-primary">
              MDW
            </h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm tracking-widest uppercase transition-colors duration-300 hover:text-primary ${
                location === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>

            {/* Portfolio Dropdown */}
            <div className="relative group">
              <Link
                href="/portfolio"
                className={`flex items-center gap-1 text-sm tracking-widest uppercase transition-colors duration-300 hover:text-primary ${
                  location.startsWith("/portfolio") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Portfolio <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                <div className="bg-background border-t-2 border-t-accent shadow-2xl py-4 min-w-[200px] flex flex-col">
                  {portfolioLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-6 py-2.5 text-xs tracking-widest uppercase hover:bg-muted hover:text-primary transition-colors ${
                        location === link.href ? "text-primary bg-muted/50" : "text-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/about"
              className={`text-sm tracking-widest uppercase transition-colors duration-300 hover:text-primary ${
                location === "/about" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              About
            </Link>
            
            <Link
              href="/press"
              className={`text-sm tracking-widest uppercase transition-colors duration-300 hover:text-primary ${
                location === "/press" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Press
            </Link>
            
            <Link
              href="/contact"
              className={`text-sm tracking-widest uppercase transition-colors duration-300 hover:text-primary ${
                location === "/contact" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Contact
            </Link>

            <Link
              href="/contact"
              className="ml-4 px-6 py-2 border border-primary/30 text-primary text-xs uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              Book Now
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-foreground hover:text-primary transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] bg-background flex flex-col overflow-y-auto"
          >
            <div className="container mx-auto px-6 py-6 flex justify-between items-center shrink-0">
              <Link href="/" className="font-display text-xl font-semibold tracking-widest text-foreground">
                MDW
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground hover:text-primary transition-colors"
                aria-label="Close menu"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <nav className="flex-1 flex flex-col justify-start items-center gap-6 pt-12 pb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  href="/"
                  className={`font-display text-3xl hover:text-primary transition-colors ${
                    location === "/" ? "text-primary italic" : "text-foreground"
                  }`}
                >
                  Home
                </Link>
              </motion.div>
              
              <div className="w-full max-w-[280px] h-px bg-border my-2 opacity-50" />
              
              {/* Portfolio section for mobile */}
              <div className="flex flex-col items-center gap-4 w-full">
                <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-2">Portfolio</span>
                {portfolioLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={`font-display text-2xl hover:text-primary transition-colors ${
                        location === link.href ? "text-primary italic" : "text-foreground/80"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              <div className="w-full max-w-[280px] h-px bg-border my-2 opacity-50" />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link
                  href="/about"
                  className={`font-display text-3xl hover:text-primary transition-colors ${
                    location === "/about" ? "text-primary italic" : "text-foreground"
                  }`}
                >
                  About
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <Link
                  href="/press"
                  className={`font-display text-3xl hover:text-primary transition-colors ${
                    location === "/press" ? "text-primary italic" : "text-foreground"
                  }`}
                >
                  Press
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  href="/contact"
                  className={`font-display text-3xl hover:text-primary transition-colors ${
                    location === "/contact" ? "text-primary italic" : "text-foreground"
                  }`}
                >
                  Contact
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="mt-6"
              >
                <Link
                  href="/contact"
                  className="px-8 py-3 border border-primary/50 text-primary text-sm uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  Book Now
                </Link>
              </motion.div>

            </nav>
            <div className="py-8 flex justify-center shrink-0 border-t border-border/50">
              <p className="text-xs tracking-widest text-muted-foreground">© MDW {new Date().getFullYear()}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
