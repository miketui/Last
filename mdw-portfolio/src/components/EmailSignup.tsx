import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Loader2 } from "lucide-react";

type Variant = "banner" | "section" | "compact";

interface EmailSignupProps {
  variant?: Variant;
  source?: string;
  heading?: string;
  subheading?: string;
  className?: string;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function submitEmail(email: string, source: string): Promise<void> {
  const res = await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, source }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "Subscription failed.");
  }
}

export function EmailSignup({
  variant = "section",
  source = "unknown",
  heading,
  subheading,
  className = "",
}: EmailSignupProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const defaultHeadings: Record<Variant, { heading: string; subheading: string }> = {
    banner: {
      heading: "Join the MDW Insider List",
      subheading:
        "First access to new work, behind-the-scenes moments, and creative releases. No noise — only the work that matters.",
    },
    section: {
      heading: "Stay in the World of MDW",
      subheading:
        "Receive curated updates on new editorial work, press features, and availability.",
    },
    compact: {
      heading: "Stay Connected",
      subheading: "",
    },
  };

  const h = heading ?? defaultHeadings[variant].heading;
  const sub = subheading ?? defaultHeadings[variant].subheading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    try {
      await submitEmail(email, source);
      setStatus("success");
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  if (variant === "banner") {
    return (
      <section
        className={`relative bg-[#0d0d0b] border-y border-primary/20 py-24 md:py-32 overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none flex items-center justify-center">
          <span className="font-display text-[20vw] uppercase tracking-widest text-foreground whitespace-nowrap">
            MDW
          </span>
        </div>
        <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-2xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-accent text-xs uppercase tracking-[0.3em] mb-6"
          >
            Insider Access
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl mb-6 text-foreground leading-tight"
          >
            {h}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-base leading-relaxed mb-10"
          >
            {sub}
          </motion.p>
          <SignupForm
            email={email}
            setEmail={setEmail}
            error={error}
            status={status}
            onSubmit={handleSubmit}
            size="lg"
          />
        </div>
      </section>
    );
  }

  if (variant === "section") {
    return (
      <div className={`py-20 md:py-24 border-t border-border ${className}`}>
        <div className="max-w-xl mx-auto text-center px-6">
          <div className="w-8 h-px bg-accent mx-auto mb-8" />
          <h3 className="font-display text-3xl md:text-4xl mb-4 text-foreground">{h}</h3>
          {sub && (
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">{sub}</p>
          )}
          <SignupForm
            email={email}
            setEmail={setEmail}
            error={error}
            status={status}
            onSubmit={handleSubmit}
            size="md"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {h && (
        <p className="text-xs uppercase tracking-widest text-foreground mb-3">{h}</p>
      )}
      <SignupForm
        email={email}
        setEmail={setEmail}
        error={error}
        status={status}
        onSubmit={handleSubmit}
        size="sm"
      />
    </div>
  );
}

function SignupForm({
  email,
  setEmail,
  error,
  status,
  onSubmit,
  size,
}: {
  email: string;
  setEmail: (v: string) => void;
  error: string;
  status: "idle" | "loading" | "success";
  onSubmit: (e: React.FormEvent) => void;
  size: "sm" | "md" | "lg";
}) {
  const inputClass =
    size === "lg"
      ? "flex-1 bg-transparent border-none focus:outline-none px-5 py-4 text-base text-foreground placeholder:text-muted-foreground"
      : size === "md"
      ? "flex-1 bg-transparent border-none focus:outline-none px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
      : "flex-1 bg-transparent border-none focus:outline-none px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground";

  const btnClass =
    size === "lg"
      ? "px-8 py-4 text-xs uppercase tracking-widest font-semibold"
      : size === "md"
      ? "px-6 py-3 text-xs uppercase tracking-widest font-semibold"
      : "px-4 py-2 text-xs uppercase tracking-widest";

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-3 py-4 px-6 border border-accent/40 bg-accent/5 text-foreground"
          >
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-accent-foreground" strokeWidth={3} />
            </div>
            <p className="text-sm font-medium tracking-wide">
              You're on the list. Welcome to the world of MDW.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={onSubmit}
            className="flex w-full border border-border bg-background/40 focus-within:border-primary transition-colors duration-300"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              disabled={status === "loading"}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className={`${btnClass} border-l border-border text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0`}
            >
              {status === "loading" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>{size === "sm" ? "Join" : "Subscribe"}</span>
                  {size !== "sm" && <ArrowRight className="w-3 h-3" />}
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {error && status !== "success" && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-destructive text-xs mt-2 text-left"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      {status !== "success" && (
        <p className="text-muted-foreground text-xs mt-3 opacity-60 text-center">
          No spam. Unsubscribe anytime.
        </p>
      )}
    </div>
  );
}
