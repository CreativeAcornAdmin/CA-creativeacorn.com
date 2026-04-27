import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import JsonLd from "@/components/JsonLd";

/* Logo variants for light/dark */
const LOGO_WORDMARK_WHITE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663393495798/M4kGhE2wieSHv3xFB6Z98s/ca-logo-wordmark-white_005d79b7.png";
const LOGO_ICON_WHITE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663393495798/M4kGhE2wieSHv3xFB6Z98s/ca-logo-icon-white_5a648ca3.png";
const LOGO_WORDMARK_DARK = "https://d2xsxph8kpxj0f.cloudfront.net/310519663393495798/M4kGhE2wieSHv3xFB6Z98s/ca-logo-wordmark-transparent_b359b39f.png";
const LOGO_ICON_DARK = "https://d2xsxph8kpxj0f.cloudfront.net/310519663393495798/M4kGhE2wieSHv3xFB6Z98s/ca-logo-icon-transparent_7830d5db.png";

/* ─── Inline Acorn SVG (reusable, scalable) ─── */
function AcornSvg({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="currentColor">
      <ellipse cx="50" cy="35" rx="18" ry="12" opacity="0.9" />
      <rect x="47" y="10" width="6" height="14" rx="3" />
      <path d="M30 40 Q30 20 50 22 Q70 20 70 40 Q70 48 50 48 Q30 48 30 40Z" opacity="0.7" />
      <path d="M28 42 Q28 38 50 38 Q72 38 72 42 Q72 78 50 92 Q28 78 28 42Z" />
    </svg>
  );
}

/* ─── Theme Toggle ─── */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="fixed top-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-tone1/80 text-foreground backdrop-blur-sm transition-all hover:border-primary hover:text-primary"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

/* ─── Waypoint Divider with spinning acorn ─── */
function Waypoint() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <motion.div
        className="mx-4 text-primary/25"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <AcornSvg size={14} />
      </motion.div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
}

/* ─── Fade-up on scroll ─── */
function FadeUp({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Magnetic Hover Card ─── */
function MagneticCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("translate(0px, 0px)");

  function handleMouseMove(e: React.MouseEvent) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    setTransform(`translate(${x}px, ${y}px)`);
  }

  function handleMouseLeave() {
    setTransform("translate(0px, 0px)");
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{ transform }}
    >
      {children}
    </div>
  );
}

/* ─── Mobile Section Arrow ─── */
function SectionArrow() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    function onScroll() {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      setVisible(scrolled < 0.85);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => {
        const sections = Array.from(document.querySelectorAll("[data-section]"));
        const scrollY = window.scrollY + 100;
        for (let i = 0; i < sections.length; i++) {
          const top = (sections[i] as HTMLElement).offsetTop;
          if (top > scrollY) {
            sections[i].scrollIntoView({ behavior: "smooth" });
            break;
          }
        }
      }}
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 md:hidden"
      aria-label="Next section"
    >
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </button>
  );
}

/* ─── Floating Acorns — gentle ambient movement ─── */
function FloatingAcorns() {
  const acorns = [
    { x: "8%", y: "15%", size: 10, delay: 0, duration: 18 },
    { x: "85%", y: "25%", size: 8, delay: 2, duration: 22 },
    { x: "15%", y: "45%", size: 12, delay: 4, duration: 20 },
    { x: "90%", y: "55%", size: 7, delay: 1, duration: 24 },
    { x: "5%", y: "70%", size: 9, delay: 3, duration: 19 },
    { x: "80%", y: "80%", size: 11, delay: 5, duration: 21 },
    { x: "50%", y: "92%", size: 8, delay: 2.5, duration: 23 },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {acorns.map((a, i) => (
        <motion.div
          key={i}
          className="absolute text-secondary/[0.08]"
          style={{ left: a.x, top: a.y }}
          animate={{
            y: [-8, 8, -8],
            x: [-4, 4, -4],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: a.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: a.delay,
          }}
        >
          <AcornSvg size={a.size} />
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Contour Lines Background ─── */
function ContourLines() {
  return (
    <svg
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.03]"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
    >
      <g fill="none" stroke="currentColor" strokeWidth="0.6">
        <ellipse cx="500" cy="500" rx="80" ry="70" />
        <ellipse cx="500" cy="500" rx="140" ry="120" />
        <ellipse cx="500" cy="500" rx="210" ry="180" />
        <ellipse cx="500" cy="500" rx="290" ry="250" />
        <ellipse cx="500" cy="500" rx="380" ry="330" />
        <ellipse cx="500" cy="500" rx="480" ry="420" />
        <ellipse cx="520" cy="480" rx="160" ry="140" />
        <ellipse cx="480" cy="520" rx="250" ry="220" />
        <ellipse cx="510" cy="490" rx="340" ry="300" />
        <ellipse cx="490" cy="510" rx="440" ry="390" />
      </g>
    </svg>
  );
}

/* ─── Parallax Hero Acorn (dark mode only) ─── */
function ParallaxAcorn() {
  const { theme } = useTheme();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const opacity = useTransform(scrollY, [0, 400], [0.08, 0]);
  const rotate = useTransform(scrollY, [0, 600], [0, 15]);

  /* Hide in light mode — the large acorn creates a visible blob against near-white bg */
  if (theme !== "dark") return null;

  return (
    <motion.div
      className="pointer-events-none absolute -right-8 top-12 text-secondary md:-right-4 md:top-8"
      style={{ y, opacity, rotate }}
    >
      <AcornSvg size={140} className="hidden md:block" />
      <AcornSvg size={80} className="block md:hidden" />
    </motion.div>
  );
}

/* ─── Social Links ─── */
const SOCIAL_LINKS = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/hajimoto.88/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/haj-khalsa",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@hajimoto88",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
  },
  {
    name: "Website",
    url: "https://www.hajkhalsa.com/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

/* ─── Projects Data ─── */
const PROJECTS = [
  {
    name: "STEEZZ",
    tagline: "Crew-first mountain culture",
    description:
      "A coordination and culture platform for skiers and snowboarders. Built around real-world friend groups, not follower counts.",
    status: "In Development",
  },
  {
    name: "ARRO",
    tagline: "Hinge for home hunters",
    description:
      "A matchmaking platform connecting home buyers with the right buyer's broker through taste-based discovery.",
    status: "In Development",
  },
  {
    name: "CIRCLE",
    tagline: "Breathwork & mindfulness",
    description:
      "A breathwork and mindfulness platform built around nervous system regulation, daily presence practices, and wellness scoring.",
    status: "In Development",
  },
];



/* ─── Section Wrapper with alternating tones ─── */
function Section({
  children,
  tone,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  tone: 1 | 2;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <section
      className={`${tone === 1 ? "section-tone1" : "section-tone2"} ${className}`}
      {...props}
    >
      <div className="mx-auto max-w-2xl px-5 py-14 md:py-20">
        {children}
      </div>
    </section>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const { theme } = useTheme();
  const logoWordmark = theme === "dark" ? LOGO_WORDMARK_WHITE : LOGO_WORDMARK_DARK;
  const logoIcon = theme === "dark" ? LOGO_ICON_WHITE : LOGO_ICON_DARK;

  return (
    <div className="noise-overlay relative min-h-screen">
      <JsonLd />
      <ContourLines />
      <FloatingAcorns />
      {/* ─── HERO — Gradient (light) / Tone 1 (dark) ─── */}
      <section className="hero-gradient relative overflow-hidden" data-section>
        <div className="mx-auto max-w-2xl px-5 pt-20 pb-14 md:pt-28 md:pb-20">
        <ParallaxAcorn />
        <FadeUp>
          <img
            src={logoWordmark}
            alt="Creative Acorn"
            className="mb-8 h-16 md:h-20"
          />
          <p className="max-w-lg text-base md:text-lg leading-relaxed text-muted-foreground">
            Creative Acorn is a creative incubator focused on apps for wellness, movement,
            technology, and quality of life — some grow into real businesses, some stay scrappy,
            and some don't make the cut. We are located in Santa Fe, New Mexico.
          </p>
        </FadeUp>
        </div>
      </section>

      {/* ─── PROJECTS — Tone 2 ─── */}
      <Section tone={2} data-section>
        <FadeUp>
          <h2 className="mb-8 font-[family-name:var(--font-display)] text-2xl md:text-3xl tracking-[0.1em] uppercase text-primary">
            Projects
          </h2>
        </FadeUp>
        <div className="space-y-6">
          {PROJECTS.map((project, i) => (
            <FadeUp key={project.name} delay={i * 0.1}>
              <MagneticCard className="group rounded-lg border border-border bg-tone1/60 p-6 transition-all shadow-lg shadow-transparent hover:border-primary/30 hover:shadow-primary/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* Acorn bullet */}
                    <motion.div
                      className="mt-1.5 shrink-0 text-primary/40 transition-colors group-hover:text-primary"
                      whileHover={{ rotate: 15, scale: 1.2 }}
                    >
                      <AcornSvg size={14} />
                    </motion.div>
                    <div>
                      <h3 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl tracking-[0.08em]">
                        {project.name}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {project.tagline}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 font-[family-name:var(--font-display)] text-xs tracking-wider text-primary">
                    {project.status}
                  </span>
                </div>
                <p className="mt-3 pl-[26px] leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
              </MagneticCard>
            </FadeUp>
          ))}
        </div>
        <FadeUp className="mt-6">
          <p className="text-sm italic text-muted-foreground">
            More projects in the works. Stay tuned.
          </p>
        </FadeUp>
      </Section>

      <Waypoint />

      {/* ─── PHILOSOPHY — Tone 1 ─── */}
      <Section tone={1} data-section>
        <FadeUp>
          <h2 className="mb-6 font-[family-name:var(--font-display)] text-2xl md:text-3xl tracking-[0.1em] uppercase text-primary">
            Philosophy
          </h2>
          <blockquote className="relative border-l-2 border-primary/50 pl-6">
            {/* Decorative acorn at the opening quote */}
            <motion.div
              className="absolute -left-[7px] -top-1 text-primary/30"
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <AcornSvg size={12} />
            </motion.div>
            <p className="text-xl md:text-2xl leading-relaxed text-foreground">
              "Plant ideas, nurture the ones that take root, and let the rest go."
            </p>
          </blockquote>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Creative Acorn exists at the intersection of curiosity and craft. We're not chasing
            scale for its own sake — we're building things that make life a little better, a little
            more interesting, and a little more connected to what matters.
          </p>
        </FadeUp>
      </Section>

      <Waypoint />

      {/* ─── FOUNDER — Tone 2 ─── */}
      <Section tone={2} data-section>
        <FadeUp>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl md:text-3xl tracking-[0.1em] uppercase text-primary">
            Founder
          </h2>
          <p className="text-base md:text-lg leading-relaxed">
            Creative Acorn is led by{" "}
            <a
              href="https://hajkhalsa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-foreground/30 text-foreground transition-colors hover:border-foreground/60"
            >
              Haj Khalsa
            </a>
            , a solopreneur, founder, builder, climber, and telemark skier.
          </p>

          {/* Social links — 1x4 grid, 20% larger than previous */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <span className="flex items-center justify-center text-foreground/60 transition-colors group-hover:text-primary">
                  {link.icon}
                </span>
                <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.08em] border-b border-transparent group-hover:border-primary/40">
                  {link.name}
                </span>
              </a>
            ))}
          </div>
        </FadeUp>
      </Section>

      <Waypoint />

      {/* ─── CONTACT — Tone 1 ─── */}
      <Section tone={1} data-section>
        <FadeUp>
          <h2 className="mb-6 font-[family-name:var(--font-display)] text-2xl md:text-3xl tracking-[0.1em] uppercase text-primary">
            Get in Touch
          </h2>
          <p className="mb-8 text-muted-foreground">
            Have an idea, a question, or want to collaborate? We'd love to hear from you.
          </p>
          <a
            href="mailto:haj@creativeacorn.com"
            className="group inline-flex items-center gap-2 rounded-sm border border-primary bg-primary/10 px-6 py-2.5 font-[family-name:var(--font-display)] text-sm tracking-[0.15em] uppercase text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            haj@creativeacorn.com
            <motion.span
              className="inline-block"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </a>
        </FadeUp>
      </Section>

      {/* ─── FOOTER — Gradient (light) / Tone 2 (dark) ─── */}
      <footer className="hero-gradient py-10 text-center">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block"
        >
          <img src={logoIcon} alt="" className="mx-auto mb-3 h-5 w-5 opacity-25" />
        </motion.div>
        <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.1em] text-muted-foreground">
          &copy; {new Date().getFullYear()} Creative Acorn &middot; Santa Fe, NM
        </p>
      </footer>

      <SectionArrow />
    </div>
  );
}
