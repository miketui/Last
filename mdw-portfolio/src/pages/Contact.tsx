import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import { EmailSignup } from "@/components/EmailSignup";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  projectType: z.string().min(1, "Please select a project type"),
  message: z.string().min(10, "Please provide more details about your inquiry"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      projectType: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("https://formspree.io/f/xojkkjgz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          _replyto: data.email,
          projectType: data.projectType,
          message: data.message,
        }),
      });

      if (!res.ok) {
        throw new Error("Submission failed");
      }

      toast({
        title: "Inquiry Sent",
        description: "Thank you. Michael will be in touch within 48–72 hours.",
        duration: 5000,
      });
      form.reset();
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or email info@michaeldavidjr.beauty directly.",
        duration: 6000,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-6 md:px-12 pt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col"
          >
            <div>
              <h1 className="text-5xl md:text-7xl font-display mb-8">Contact</h1>
              <p className="text-muted-foreground text-lg mb-12 max-w-md leading-relaxed">
                For booking inquiries, editorial commissions, brand consulting, and private styling requests.
              </p>

              <div className="space-y-12">
                <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] text-accent mb-4 font-medium">Agency</h3>
                  <p className="font-display text-2xl text-foreground">MDW Studio</p>
                  <a href="mailto:info@michaeldavidjr.beauty" className="text-muted-foreground hover:text-foreground transition-colors mt-2 block">
                    info@michaeldavidjr.beauty
                  </a>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] text-accent mb-4 font-medium">Direct Studio</h3>
                  <a href="mailto:info@michaeldavidjr.beauty" className="font-display text-2xl text-foreground hover:text-primary transition-colors block border-b border-transparent hover:border-primary w-fit pb-1">
                    info@michaeldavidjr.beauty
                  </a>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] text-accent mb-4 font-medium">Locations</h3>
                  <ul className="space-y-3 text-muted-foreground font-display text-xl">
                    <li>Los Angeles (Base)</li>
                    <li>New York</li>
                    <li>Global</li>
                  </ul>
                </div>
                
                <div className="p-6 bg-card border border-border border-l-2 border-l-accent mt-8">
                  <h3 className="text-xs uppercase tracking-widest text-foreground mb-2">Response Time</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All inquiries are reviewed personally. Expect a response within 48–72 hours.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7 bg-card border border-white/5 p-8 md:p-12 shadow-2xl flex flex-col"
          >
            <h2 className="text-3xl font-display mb-8">Send an Inquiry</h2>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Name</label>
                  <input 
                    {...form.register("name")}
                    className="w-full bg-background border border-border px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="Jane Doe"
                  />
                  {form.formState.errors.name && (
                    <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Email</label>
                  <input 
                    {...form.register("email")}
                    type="email"
                    className="w-full bg-background border border-border px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="jane@example.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Project Type</label>
                <div className="relative">
                  <select 
                    {...form.register("projectType")}
                    className="w-full bg-background border border-border px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select a category</option>
                    <option value="editorial">Editorial</option>
                    <option value="red_carpet">Red Carpet</option>
                    <option value="celebrity">Celebrity Styling</option>
                    <option value="commercial">Commercial / Campaign</option>
                    <option value="beauty">Beauty / Covers</option>
                    <option value="everyday">Everyday Client</option>
                    <option value="consulting">Brand Consulting</option>
                    <option value="speaking">Speaking Engagement</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                    ▼
                  </div>
                </div>
                {form.formState.errors.projectType && (
                  <p className="text-destructive text-xs">{form.formState.errors.projectType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Project Details</label>
                <textarea 
                  {...form.register("message")}
                  rows={6}
                  className="w-full bg-background border border-border px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                  placeholder="Please provide dates, locations, and creative direction..."
                />
                {form.formState.errors.message && (
                  <p className="text-destructive text-xs">{form.formState.errors.message.message}</p>
                )}
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground py-4 uppercase tracking-widest text-sm font-semibold hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isSubmitting ? "Sending..." : "Submit Inquiry"}
              </button>

            </form>
            
            <div className="mt-12 pt-8 border-t border-border">
              <EmailSignup
                variant="compact"
                source="contact-page"
                heading="Stay connected — join the MDW insider list"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
}
